import * as AppleAuthentication from 'expo-apple-authentication';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';
import { clearGuestAccess, loadGuestAccess, saveGuestAccess, loadSyncMetadata } from '@/services/authStorage';
import { syncUserData, upsertSubscriptionState } from '@/services/cloudSync';
import { getCurrentAppUserId, toRevenueCatAppUserId } from '@/services/accountIdentity';
import { getCurrentSubscriptionSummary, initializePurchases, linkPurchasesToAccount, syncStoreSubscriptionStatus } from '@/services/purchaseService';
import { isSupabaseConfigured, supabase, supabaseConfigurationError } from '@/services/supabase';
import type {
  AuthUser,
  SessionState,
  SubscriptionSummary,
  SyncStatusSnapshot,
} from '@/types/auth';

WebBrowser.maybeCompleteAuthSession();

type AuthContextValue = SessionState & {
  guestAccess: boolean;
  sessionRefreshing: boolean;
  appleAuthAvailable: boolean;
  sync: SyncStatusSnapshot;
  continueAsGuest: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  syncNow: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function toAuthUser(user: { id: string; email?: string | null; app_metadata?: Record<string, unknown>; user_metadata?: Record<string, unknown> } | null): AuthUser | null {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email ?? undefined,
    app_metadata: user.app_metadata ?? {},
    user_metadata: user.user_metadata ?? {},
  };
}

function createNonce(length = 32): string {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
}

function formatAppleFullName(credential: AppleAuthentication.AppleAuthenticationCredential): string | null {
  const givenName = credential.fullName?.givenName?.trim();
  const familyName = credential.fullName?.familyName?.trim();
  const fullName = [givenName, familyName].filter(Boolean).join(' ').trim();
  return fullName.length > 0 ? fullName : null;
}

async function persistSubscriptionState(userId: string): Promise<SubscriptionSummary | null> {
  const summary = await getCurrentSubscriptionSummary();
  if (!summary) return null;
  await upsertSubscriptionState(userId, summary);
  return summary;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState['session']>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionRefreshing, setSessionRefreshing] = useState(false);
  const [guestAccess, setGuestAccess] = useState(false);
  const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);
  const [sync, setSync] = useState<SyncStatusSnapshot>({ status: 'idle' });

  const hydrateSyncState = useCallback(async () => {
    const metadata = await loadSyncMetadata();
    setSync((current) => ({
      ...current,
      lastAttemptedAt: metadata.lastAttemptedAt,
      lastSuccessfulAt: metadata.lastSuccessfulAt,
    }));
  }, []);

  const syncNow = useCallback(async () => {
    if (!session?.user || !isSupabaseConfigured()) return;
    setSync((current) => ({
      ...current,
      status: 'syncing',
      errorMessage: undefined,
      lastAttemptedAt: new Date().toISOString(),
    }));
    try {
      await initializePurchases();
      await linkPurchasesToAccount(session.user.id);
      await syncStoreSubscriptionStatus();
      await syncUserData(session.user.id);
      await persistSubscriptionState(session.user.id);
      await hydrateSyncState();
      setSync((current) => ({
        ...current,
        status: 'synced',
        errorMessage: undefined,
      }));
    } catch (error) {
      setSync((current) => ({
        ...current,
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Sync failed',
      }));
    }
  }, [hydrateSyncState, session?.user]);

  useEffect(() => {
    let mounted = true;

    loadGuestAccess()
      .then((value) => {
        if (mounted) setGuestAccess(value);
      })
      .catch(() => {
        if (mounted) setGuestAccess(false);
      });

    hydrateSyncState().catch(() => undefined);

    if (!supabase) {
      setLoading(false);
      return () => {
        mounted = false;
      };
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setUser(toAuthUser(data.session?.user ?? null));
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(toAuthUser(nextSession?.user ?? null));
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [hydrateSyncState]);

  useEffect(() => {
    let mounted = true;

    if (Platform.OS !== 'ios') {
      setAppleAuthAvailable(false);
      return () => {
        mounted = false;
      };
    }

    AppleAuthentication.isAvailableAsync()
      .then((available) => {
        if (mounted) {
          setAppleAuthAvailable(available);
        }
      })
      .catch(() => {
        if (mounted) {
          setAppleAuthAvailable(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setSync((current) => ({
        ...current,
        status: 'idle',
        errorMessage: undefined,
      }));
      return;
    }

    void syncNow();
  }, [session?.user, syncNow]);

  const signInWithOAuth = useCallback(async (provider: 'google' | 'apple') => {
    if (!supabase) {
      throw supabaseConfigurationError();
    }

    const redirectTo = Linking.createURL('/auth/callback');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;
    if (!data?.url) throw new Error('Authentication URL could not be created.');

    setSessionRefreshing(true);
    try {
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type !== 'success' || !result.url) {
        throw new Error('Authentication was cancelled.');
      }
      const parsed = Linking.parse(result.url);
      const code = typeof parsed.queryParams?.code === 'string' ? parsed.queryParams.code : null;
      if (!code) {
        throw new Error('Authentication code was missing from the callback.');
      }
      const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) throw exchangeError;
      setSession(sessionData.session);
      setUser(toAuthUser(sessionData.session?.user ?? null));
      await clearGuestAccess();
      setGuestAccess(false);
    } finally {
      setSessionRefreshing(false);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    await signInWithOAuth('google');
  }, [signInWithOAuth]);

  const signInWithApple = useCallback(async () => {
    if (!supabase) {
      throw supabaseConfigurationError();
    }

    if (Platform.OS !== 'ios') {
      throw new Error('Apple ile giris yalnizca iOS buildlerinde kullanilabilir.');
    }

    const available = await AppleAuthentication.isAvailableAsync();
    if (!available) {
      throw new Error('Bu cihazda Apple ile giris su anda kullanilamiyor. iOS development build ile tekrar dene.');
    }

    const rawNonce = createNonce();

    setSessionRefreshing(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: rawNonce,
      });

      if (!credential.identityToken) {
        throw new Error('Apple kimlik dogrulamasi tamamlandi ancak identity token donmedi.');
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
        nonce: rawNonce,
      });

      if (error) throw error;

      if (credential.email || credential.fullName) {
        const fullName = formatAppleFullName(credential);
        const nextUserMetadata: Record<string, string> = {};
        if (credential.email) {
          nextUserMetadata.email = credential.email;
        }
        if (fullName) {
          nextUserMetadata.full_name = fullName;
          if (credential.fullName?.givenName) {
            nextUserMetadata.given_name = credential.fullName.givenName;
          }
          if (credential.fullName?.familyName) {
            nextUserMetadata.family_name = credential.fullName.familyName;
          }
        }

        if (Object.keys(nextUserMetadata).length > 0) {
          await supabase.auth.updateUser({
            data: nextUserMetadata,
          });
        }
      }

      setSession(data.session);
      setUser(toAuthUser(data.session?.user ?? null));
      await clearGuestAccess();
      setGuestAccess(false);
    } catch (error) {
      if (
        error instanceof Error
        && (error.message.includes('canceled') || error.message.includes('cancelled'))
      ) {
        throw new Error('Apple ile giris iptal edildi.');
      }
      throw error;
    } finally {
      setSessionRefreshing(false);
    }
  }, []);

  const continueAsGuest = useCallback(async () => {
    await saveGuestAccess(true);
    setGuestAccess(true);
  }, []);

  const signOut = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    await clearGuestAccess();
    setGuestAccess(false);
    setSession(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user,
    loading,
    guestAccess,
    sessionRefreshing,
    appleAuthAvailable,
    sync,
    continueAsGuest,
    signInWithGoogle,
    signInWithApple,
    signOut,
    syncNow,
  }), [
    continueAsGuest,
    guestAccess,
    loading,
    session,
    sessionRefreshing,
    appleAuthAvailable,
    signInWithApple,
    signInWithGoogle,
    signOut,
    sync,
    syncNow,
    user,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!supabase) return null;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return toAuthUser(session?.user ?? null);
}

export async function getCurrentAppIdentity(): Promise<string> {
  return getCurrentAppUserId();
}

export function getAuthenticatedRevenueCatAppUserId(userId: string): string {
  return toRevenueCatAppUserId(userId);
}
