import { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/providers/auth-context';
import { useAppLocalization } from '@/providers/localization-context';
import { loadProfile } from '@/services/profileStore';
import {
  createDynamicStyles,
  radius,
  shadowStyle,
  typography,
  useAppTheme,
} from '@/theme';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, mode } = useAppTheme();
  const { t } = useAppLocalization();
  const {
    appleAuthAvailable,
    continueAsGuest,
    signInWithApple,
    signInWithGoogle,
    sessionRefreshing,
  } = useAuth();
  const [heroOpacity] = useState(() => new Animated.Value(0));
  const [heroTranslateY] = useState(() => new Animated.Value(18));
  const [cardOpacity] = useState(() => new Animated.Value(0));
  const [cardTranslateY] = useState(() => new Animated.Value(26));
  const [glowScale] = useState(() => new Animated.Value(0.96));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroOpacity, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(heroTranslateY, {
        toValue: 0,
        duration: 460,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(110),
        Animated.parallel([
          Animated.timing(cardOpacity, {
            toValue: 1,
            duration: 420,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(cardTranslateY, {
            toValue: 0,
            duration: 480,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(glowScale, {
          toValue: 1.02,
          duration: 2600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(glowScale, {
          toValue: 0.98,
          duration: 2600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    pulse.start();
    return () => {
      pulse.stop();
    };
  }, [cardOpacity, cardTranslateY, glowScale, heroOpacity, heroTranslateY]);

  async function handleGoogle() {
    try {
      await signInWithGoogle();
    } catch (error) {
      Alert.alert(
        t('auth.error_title'),
        error instanceof Error ? error.message : t('auth.error_body'),
      );
    }
  }

  async function handleApple() {
    try {
      await signInWithApple();
    } catch (error) {
      Alert.alert(
        t('auth.error_title'),
        error instanceof Error ? error.message : t('auth.error_body'),
      );
    }
  }

  async function handleGuest() {
    await continueAsGuest();
    const profile = await loadProfile();
    router.replace(profile ? '/(tabs)' : '/onboarding');
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + 34,
          paddingBottom: insets.bottom + 18,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.stage}>
        <Animated.View
          style={[
            styles.heroWrap,
            {
              opacity: heroOpacity,
              transform: [{ translateY: heroTranslateY }],
            },
          ]}
        >
          <View
            style={[
              styles.badge,
              {
                backgroundColor: colors.secondaryContainer,
                borderColor: `${colors.secondary}18`,
              },
            ]}
          >
            <Ionicons
              name="shield-checkmark"
              size={14}
              color={colors.secondary}
            />
            <Text style={[styles.badgeText, { color: colors.secondary }]}>
              {t('auth.hero_badge')}
            </Text>
          </View>

          <View style={styles.hero}>
            <Animated.View
              style={[
                styles.heroAccent,
                {
                  backgroundColor:
                    mode === 'dark'
                      ? `${colors.primary}12`
                      : `${colors.primary}10`,
                  transform: [{ scale: glowScale }],
                },
              ]}
            >
              <View
                style={[
                  styles.heroAccentWarm,
                  {
                    backgroundColor:
                      mode === 'dark'
                        ? `${colors.tertiary}26`
                        : `${colors.tertiary}18`,
                  },
                ]}
              />
            </Animated.View>
            <View style={styles.heroHeading}>
              <View
                style={[
                  styles.brandToken,
                  {
                    backgroundColor:
                      mode === 'dark'
                        ? colors.surfaceContainerHigh
                        : colors.surface,
                    borderColor:
                      mode === 'dark'
                        ? `${colors.outlineVariant}A8`
                        : `${colors.outlineVariant}D8`,
                  },
                ]}
              >
                <Image
                  source={require('../assets/icon.png')}
                  style={styles.brandTokenImage}
                  resizeMode="contain"
                />
              </View>
            </View>
            <Text style={[styles.kicker, { color: colors.onSurfaceVariant }]}>
              CLOUD SYNC · PREMIUM ACCESS
            </Text>
            <Text style={[styles.title, { color: colors.onBackground }]}>
              {t('auth.title')}
            </Text>
            <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
              {t('auth.subtitle')}
            </Text>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            {
              opacity: cardOpacity,
              transform: [{ translateY: cardTranslateY }],
              backgroundColor:
                mode === 'dark' ? colors.surfaceContainerLow : colors.surface,
              borderColor:
                mode === 'dark'
                  ? `${colors.outlineVariant}A8`
                  : `${colors.outlineVariant}C7`,
            },
          ]}
        >
          <View
            style={[
              styles.cardAccent,
              {
                backgroundColor:
                  mode === 'dark'
                    ? `${colors.primary}16`
                    : `${colors.primary}10`,
              },
            ]}
          />
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.onSurface }]}>
              {t('auth.card_title')}
            </Text>
            <Text
              style={[styles.cardBody, { color: colors.onSurfaceVariant }]}
            >
              {t('auth.card_body')}
            </Text>
          </View>

          <View style={styles.actions}>
            <AuthButton
              label={t('auth.google_cta')}
              icon="logo-google"
              onPress={handleGoogle}
              loading={sessionRefreshing}
              variant="primary"
            />
            {appleAuthAvailable ? (
              <AuthButton
                label={t('auth.apple_cta')}
                icon="logo-apple"
                onPress={handleApple}
                loading={sessionRefreshing}
                variant="secondary"
              />
            ) : null}
          </View>

          <View style={styles.dividerRow}>
            <View
              style={[
                styles.dividerLine,
                {
                  backgroundColor:
                    mode === 'dark'
                      ? `${colors.outlineVariant}D2`
                      : colors.outlineVariant,
                },
              ]}
            />
            <Text
              style={[
                styles.dividerText,
                { color: colors.onSurfaceVariant },
              ]}
            >
              secure local mode
            </Text>
            <View
              style={[
                styles.dividerLine,
                {
                  backgroundColor:
                    mode === 'dark'
                      ? `${colors.outlineVariant}D2`
                      : colors.outlineVariant,
                },
              ]}
            />
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => void handleGuest()}
            disabled={sessionRefreshing}
            style={({ pressed }) => [
              styles.guestButton,
              pressed && !sessionRefreshing ? styles.guestButtonPressed : null,
            ]}
          >
            <Text
              style={[
                styles.guestButtonText,
                {
                  color: sessionRefreshing
                    ? colors.onSurfaceVariant
                    : colors.secondary,
                },
              ]}
            >
              {t('auth.guest_cta')}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

function AuthButton({
  label,
  icon,
  onPress,
  loading,
  variant,
}: {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  loading: boolean;
  variant: 'primary' | 'secondary';
}) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        styles.authButton,
        variant === 'primary'
          ? [
              styles.authButtonPrimary,
              {
                backgroundColor: colors.primary,
                borderColor: colors.primary,
              },
            ]
          : [
              styles.authButtonSecondary,
              {
                backgroundColor: colors.surfaceContainerLow,
                borderColor: colors.outlineVariant,
              },
            ],
        pressed && !loading ? styles.authButtonPressed : null,
        loading ? styles.authButtonLoading : null,
      ]}
    >
      <Ionicons
        name={icon}
        size={18}
        color={variant === 'primary' ? colors.onPrimary : colors.onSurface}
      />
      <Text
        style={[
          styles.authButtonText,
          { color: variant === 'primary' ? colors.onPrimary : colors.onSurface },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = createDynamicStyles(() => ({
  container: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  stage: {
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    gap: 18,
  },
  heroWrap: {
    gap: 10,
    paddingTop: 6,
    alignItems: 'center',
  },
  badge: {
    alignSelf: 'center',
    minHeight: 34,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgeText: {
    ...typography.labelMd,
    fontSize: 12,
    lineHeight: 16,
  },
  hero: {
    gap: 8,
    width: '100%',
    alignItems: 'center',
  },
  heroAccent: {
    width: 134,
    height: 16,
    borderRadius: radius.full,
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginTop: 2,
  },
  heroAccentWarm: {
    width: 52,
    height: 16,
    borderRadius: radius.full,
  },
  heroHeading: {
    marginTop: 2,
  },
  brandToken: {
    width: 50,
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 7,
    ...shadowStyle('sm'),
  },
  brandTokenImage: {
    width: 30,
    height: 30,
  },
  kicker: {
    ...typography.labelCaps,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1,
    textAlign: 'center',
  },
  title: {
    ...typography.displayLgMobile,
    fontSize: 31,
    lineHeight: 35,
    letterSpacing: -0.75,
    textAlign: 'center',
    maxWidth: 300,
  },
  subtitle: {
    ...typography.bodyLg,
    fontSize: 15,
    lineHeight: 21,
    maxWidth: 300,
    textAlign: 'center',
  },
  card: {
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: radius['4xl'],
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 18,
    gap: 20,
    marginTop: 2,
    ...shadowStyle('authCard'),
  },
  cardAccent: {
    position: 'absolute',
    top: 0,
    left: 22,
    right: 22,
    height: 1,
  },
  cardHeader: {
    gap: 8,
    alignItems: 'center',
  },
  cardTitle: {
    ...typography.cardTitle,
    fontSize: 19,
    lineHeight: 24,
    textAlign: 'center',
  },
  cardBody: {
    ...typography.bodyMd,
    lineHeight: 21,
    maxWidth: 296,
    textAlign: 'center',
  },
  actions: {
    gap: 10,
  },
  authButton: {
    minHeight: 56,
    borderRadius: 17,
    borderWidth: 1,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 11,
  },
  authButtonPrimary: {
    ...shadowStyle('sm'),
  },
  authButtonSecondary: {
    shadowOpacity: 0,
    elevation: 0,
  },
  authButtonText: {
    ...typography.buttonLg,
    fontSize: 15,
    lineHeight: 19,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    ...typography.labelMd,
    fontSize: 11,
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  authButtonPressed: {
    transform: [{ scale: 0.992 }],
    opacity: 0.96,
  },
  authButtonLoading: {
    opacity: 0.72,
  },
  guestButton: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingTop: 2,
    paddingBottom: 2,
  },
  guestButtonPressed: {
    opacity: 0.72,
  },
  guestButtonText: {
    ...typography.bodySm,
    fontSize: 13,
    lineHeight: 18,
  },
}));
