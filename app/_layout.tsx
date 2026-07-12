import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { startTransition, useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from '@expo-google-fonts/montserrat';
import {
  Inter_400Regular as InterReg,
  Inter_600SemiBold as InterSemi,
  Inter_700Bold as InterBold,
} from '@expo-google-fonts/inter';
import { AppThemeProvider, useAppTheme } from '@/theme';
import { LocalizationProvider } from '@/providers/localization-context';
import {
  syncReminderSchedules,
  prepareNotificationChannel,
} from '@/services/notificationStore';
import {
  initializePurchases,
  syncStoreSubscriptionStatus,
} from '@/services/purchaseService';
import { getInstallIdentity } from '@/services/installIdentity';
import { loadProfile } from '@/services/profileStore';
import { loadThemeMode } from '@/services/themeStore';
import { setThemeMode, type ThemeMode } from '@/theme/colors';
import { AppErrorBoundary } from '@/components/AppErrorBoundary';
import {
  configureErrorReporting,
  captureError,
  setReportingUser,
} from '@/services/errorReporting';
import {
  configureAnalytics,
  identifyAnalyticsUser,
  setAnalyticsContext,
} from '@/services/analyticsService';
import { resolveLocalization } from '@/services/localization';
import '@/theme/accessibility-defaults';

let splashScreenControlEnabled = false;

void SplashScreen.preventAutoHideAsync()
  .then((result) => {
    splashScreenControlEnabled = result;
  })
  .catch(() => {
    splashScreenControlEnabled = false;
  });

type ErrorUtilsLike = {
  setGlobalHandler?: (
    handler: (error: Error, isFatal?: boolean) => void,
  ) => void;
};

type GateStatus = 'loading' | 'onboarding' | 'ready';

type BootstrapResult = {
  status: Exclude<GateStatus, 'loading'>;
  themeMode: ThemeMode;
};

const errorUtils: ErrorUtilsLike =
  typeof global !== 'undefined'
    ? (global as unknown as ErrorUtilsLike)
    : {};

if (errorUtils.setGlobalHandler && !__DEV__) {
  errorUtils.setGlobalHandler((error, isFatal) => {
    captureError(error, {
      level: isFatal ? 'fatal' : 'error',
      tags: {
        source: 'globalHandler',
        fatal: Boolean(isFatal),
      },
    });
  });
}

/**
 * React Strict Mode, Fast Refresh veya route ağacının yeniden kurulması
 * sırasında başlangıç işlemlerinin tekrar tekrar tetiklenmesini engeller.
 */
let bootstrapPromise: Promise<BootstrapResult> | null = null;

function isExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

function canUseNativeNotifications(): boolean {
  return Platform.OS !== 'web' && !isExpoGo();
}

async function runBootstrap(): Promise<BootstrapResult> {
  console.log('[Boot] Uygulama başlatılıyor.');

  configureErrorReporting();

  const [themeMode, profile, installIdentity] = await Promise.all([
    loadThemeMode(),
    loadProfile(),
    getInstallIdentity(),
  ]);

  console.log('[Boot] Tema, profil ve kurulum kimliği yüklendi.');

  setThemeMode(themeMode);

  const localization = resolveLocalization({
    language: 'auto',
    units: 'auto',
  });

  setAnalyticsContext({
    appTheme: themeMode,
    locale: localization.localeTag,
    language: localization.language,
    market: localization.market,
  });

  void configureAnalytics(localization)
    .then(() =>
      identifyAnalyticsUser({
        id: installIdentity,
        name: profile?.name,
        premium: profile?.subscription === 'premium',
        language: localization.language,
        market: localization.market,
      }),
    )
    .catch((error: unknown) => {
      console.warn('[Boot] Analytics başlatılamadı:', error);
    });

  setReportingUser({
    id: installIdentity,
    username: profile?.name,
    isPremium: profile?.subscription === 'premium',
  });

  console.log('[Boot] Ana başlangıç işlemleri tamamlandı.');

  return {
    themeMode,
    status: profile ? 'ready' : 'onboarding',
  };
}

function getBootstrapPromise(): Promise<BootstrapResult> {
  if (!bootstrapPromise) {
    bootstrapPromise = runBootstrap().catch((error: unknown) => {
      console.warn('[Boot] Başlangıç işlemi başarısız:', error);

      return {
        themeMode: 'light',
        status: 'ready',
      };
    });
  }

  return bootstrapPromise;
}

export function ErrorBoundary({ retry }: { retry: () => void }) {
  return <AppErrorBoundary retry={retry} />;
}

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const [fontsLoaded, fontError] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Inter_400Regular: InterReg,
    Inter_600SemiBold: InterSemi,
    Inter_700Bold: InterBold,
  });

  const [status, setStatus] = useState<GateStatus>('loading');
  const [initialThemeMode, setInitialThemeMode] =
    useState<ThemeMode>('light');
  const [splashHidden, setSplashHidden] = useState(false);

  useEffect(() => {
    if (!fontsLoaded && !fontError) {
      return;
    }

    let mounted = true;
    let bootCompleted = false;

    const bootTimeout = setTimeout(() => {
      if (!mounted || bootCompleted) {
        return;
      }

      console.warn(
        '[Boot] Başlangıç işlemleri zaman aşımına uğradı. Uygulama güvenli modda açılıyor.',
      );

      setStatus('ready');
    }, 8000);

    void getBootstrapPromise()
      .then((result) => {
        bootCompleted = true;
        clearTimeout(bootTimeout);

        if (!mounted) {
          return;
        }

        setThemeMode(result.themeMode);
        setInitialThemeMode(result.themeMode);
        setStatus(result.status);
      })
      .catch((error: unknown) => {
        bootCompleted = true;
        clearTimeout(bootTimeout);

        console.warn('[Boot] Başlangıç sonucu uygulanamadı:', error);

        if (mounted) {
          setStatus('ready');
        }
      });

    /*
     * Bildirimler Expo Go'da yüklenmez. Development build, APK veya
     * production build içinde arka planda hazırlanır.
     */
    if (canUseNativeNotifications()) {
      void Promise.allSettled([
        prepareNotificationChannel(),
        syncReminderSchedules(),
      ]).then((results) => {
        results.forEach((result) => {
          if (result.status === 'rejected') {
            console.warn(
              '[Boot] Bildirim servisi başlatılamadı:',
              result.reason,
            );
          }
        });
      });
    }

    if (Platform.OS !== 'web') {
      void initializePurchases()
        .then(async (initialized) => {
          if (initialized) {
            await syncStoreSubscriptionStatus();
          }
        })
        .catch((error: unknown) => {
          console.warn('[Boot] Store başlatılamadı:', error);
        });
    }

    return () => {
      mounted = false;
      clearTimeout(bootTimeout);
    };
  }, [fontError, fontsLoaded]);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (splashScreenControlEnabled && !splashHidden) {
      void SplashScreen.hideAsync()
        .catch(() => {
          splashScreenControlEnabled = false;
        })
        .finally(() => {
          startTransition(() => {
            setSplashHidden(true);
          });
        });
    } else if (!splashHidden) {
      startTransition(() => {
        setSplashHidden(true);
      });
    }

    const firstSegment = segments[0];

    if (status === 'onboarding') {
      if (firstSegment !== 'onboarding') {
        void loadProfile().then((profile) => {
          if (profile) {
            setStatus('ready');
          } else {
            router.replace('/onboarding');
          }
        });
      }
      return;
    }

    if (
      status === 'ready' &&
      (firstSegment === 'onboarding' || firstSegment === undefined)
    ) {
      router.replace('/(tabs)' as never);
    }
  }, [router, segments, splashHidden, status]);

  useEffect(() => {
    if (!canUseNativeNotifications()) {
      return;
    }

    let mounted = true;
    let subscription: { remove: () => void } | undefined;

    async function setupNotificationRedirects() {
      try {
        const Notifications = await import('expo-notifications');

        if (!mounted) {
          return;
        }

        function redirect(notification: {
          request: {
            content: {
              data?: Record<string, unknown>;
            };
          };
        }) {
          const url = notification.request.content.data?.url;

          if (typeof url === 'string') {
            router.push(url as never);
          }
        }

        const response =
          await Notifications.getLastNotificationResponseAsync();

        if (mounted && response?.notification) {
          redirect(response.notification);
        }

        subscription =
          Notifications.addNotificationResponseReceivedListener(
            (notificationResponse) => {
              redirect(notificationResponse.notification);
            },
          );
      } catch (error: unknown) {
        console.warn(
          '[notifications] Bildirim yönlendirmesi kurulamadı:',
          error,
        );
      }
    }

    void setupNotificationRedirects();

    return () => {
      mounted = false;
      subscription?.remove();
    };
  }, [router]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (status === 'loading') {
    return null;
  }

  return (
    <AppThemeProvider initialMode={initialThemeMode}>
      <LocalizationProvider>
        <RootStack />
      </LocalizationProvider>
    </AppThemeProvider>
  );
}

function RootStack() {
  const { colors, mode } = useAppTheme();

  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen
          name="premium"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
    </>
  );
}
