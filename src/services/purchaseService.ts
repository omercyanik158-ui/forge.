import { Platform } from 'react-native';
import { getCurrentAppUserId, toRevenueCatAppUserId } from './accountIdentity';
import { formatMessage } from './localization';
import { setSubscriptionTier } from './subscription';
import { PREMIUM_ENTITLEMENT_ID, PREMIUM_OFFERING_ID, premiumPackagePriority } from '@/config/premium';
import type { SubscriptionSummary } from '@/types/auth';

export type PurchaseResult =
  | { status: 'success'; message: string }
  | { status: 'cancelled'; message: string }
  | { status: 'unavailable'; message: string }
  | { status: 'error'; message: string };

export type PremiumPackageOption = {
  identifier: string;
  plan: 'monthly' | 'annual' | 'other';
  title: string;
  priceLabel: string;
  price: number;
  currencyCode: string;
  subscriptionPeriod?: string;
};

type RevenueCatPackage = {
  identifier: string;
  packageType?: string;
  product?: {
    title?: string;
    priceString?: string;
    price?: number;
    currencyCode?: string;
    subscriptionPeriod?: string;
  };
};

type RevenueCatModule = {
  LOG_LEVEL: { DEBUG: unknown };
  setLogLevel?: (level: unknown) => Promise<void> | void;
  configure: (config: { apiKey: string; appUserID?: string }) => Promise<void> | void;
  logIn?: (appUserID: string) => Promise<{ customerInfo?: RevenueCatCustomerInfo }>;
  getOfferings: () => Promise<{
    current?: {
      availablePackages: {
        identifier: string;
        packageType?: string;
        product?: RevenueCatPackage['product'];
      }[];
    };
    all?: Record<
      string,
      {
        availablePackages: {
          identifier: string;
          packageType?: string;
          product?: RevenueCatPackage['product'];
        }[];
      }
    >;
  }>;
  purchasePackage: (pkg: unknown) => Promise<{ customerInfo?: RevenueCatCustomerInfo }>;
  restorePurchases: () => Promise<RevenueCatCustomerInfo>;
  getCustomerInfo: () => Promise<RevenueCatCustomerInfo>;
};

type RevenueCatCustomerInfo = {
  entitlements?: {
    active?: Record<string, {
      productIdentifier?: string;
      expiresDate?: string | null;
    }>;
  };
};

let purchasesModulePromise: Promise<RevenueCatModule | null> | null = null;
let configurePromise: Promise<boolean> | null = null;
let configuredAppUserId: string | null = null;

function configuredApiKey(): string | null {
  if (Platform.OS === 'ios') return process.env.EXPO_PUBLIC_RC_IOS_API_KEY ?? null;
  if (Platform.OS === 'android') return process.env.EXPO_PUBLIC_RC_ANDROID_API_KEY ?? null;
  return null;
}

function entitlementId(): string {
  return PREMIUM_ENTITLEMENT_ID;
}

function offeringId(): string | null {
  return PREMIUM_OFFERING_ID;
}

function errorIncludes(error: unknown, patterns: string[]): boolean {
  const message = String(error).toLowerCase();
  return patterns.some((pattern) => message.includes(pattern));
}

async function loadPurchasesModule(): Promise<RevenueCatModule | null> {
  if (!purchasesModulePromise) {
    purchasesModulePromise = (async () => {
      if (Platform.OS === 'web' || !configuredApiKey()) return null;

      try {
        const imported = await import('react-native-purchases');
        return (imported.default ?? imported) as RevenueCatModule;
      } catch {
        return null;
      }
    })();
  }

  return purchasesModulePromise;
}

export function isStorePurchaseConfigured(): boolean {
  return process.env.EXPO_PUBLIC_PURCHASES_ENABLED === 'true' && !!configuredApiKey();
}

function hasActivePremiumEntitlement(customerInfo: RevenueCatCustomerInfo | null | undefined): boolean {
  const active = customerInfo?.entitlements?.active;
  if (!active) return false;
  return Object.prototype.hasOwnProperty.call(active, entitlementId());
}

async function syncTierFromCustomerInfo(customerInfo: RevenueCatCustomerInfo | null | undefined): Promise<void> {
  await setSubscriptionTier(hasActivePremiumEntitlement(customerInfo) ? 'premium' : 'free');
}

function activeEntitlementEntry(customerInfo: RevenueCatCustomerInfo | null | undefined): [string, { productIdentifier?: string; expiresDate?: string | null }] | null {
  const active = customerInfo?.entitlements?.active;
  if (!active) return null;
  const entry = Object.entries(active)[0];
  return entry ?? null;
}

function unavailableMessage(): string {
  return formatMessage({
    tr: 'Mağaza bağlantısı bu build için henüz hazır değil. API anahtarları ve RevenueCat kurulumu tamamlanınca satın alma aktif olacak.',
    en: 'Store purchasing is not ready in this build yet. Purchasing will activate once API keys and RevenueCat setup are completed.',
  });
}

export async function initializePurchases(): Promise<boolean> {
  if (!isStorePurchaseConfigured()) return false;

  if (!configurePromise) {
    configurePromise = (async () => {
      const purchases = await loadPurchasesModule();
      const apiKey = configuredApiKey();
      if (!purchases || !apiKey) return false;

      try {
        if (__DEV__) {
          await purchases.setLogLevel?.(purchases.LOG_LEVEL.DEBUG);
        }

        const appUserID = await getCurrentAppUserId();
        await purchases.configure({
          apiKey,
          appUserID,
        });
        configuredAppUserId = appUserID;
        return true;
      } catch {
        return false;
      }
    })();
  }

  return configurePromise;
}

export async function linkPurchasesToAccount(userId: string): Promise<void> {
  if (!isStorePurchaseConfigured()) return;

  const initialized = await initializePurchases();
  const purchases = await loadPurchasesModule();
  if (!initialized || !purchases) return;

  const authenticatedAppUserId = toRevenueCatAppUserId(userId);
  if (configuredAppUserId === authenticatedAppUserId) return;

  try {
    if (purchases.logIn) {
      const result = await purchases.logIn(authenticatedAppUserId);
      configuredAppUserId = authenticatedAppUserId;
      await syncTierFromCustomerInfo(result.customerInfo);
      return;
    }
  } catch {
    // Fall back to keeping the existing identity if account linking is unavailable.
  }
}

function packagePlan(pkg: RevenueCatPackage): PremiumPackageOption['plan'] {
  const key = `${pkg.packageType ?? ''}:${pkg.identifier}`.toLowerCase();
  if (key.includes('annual') || key.includes('year')) return 'annual';
  if (key.includes('month')) return 'monthly';
  return 'other';
}

function toPackageOption(pkg: RevenueCatPackage): PremiumPackageOption {
  const plan = packagePlan(pkg);
  return {
    identifier: pkg.identifier,
    plan,
    title: plan === 'annual'
      ? formatMessage({ tr: 'Yıllık Premium', en: 'Annual Premium' })
      : plan === 'monthly'
        ? formatMessage({ tr: 'Aylık Premium', en: 'Monthly Premium' })
        : pkg.product?.title || 'Premium',
    priceLabel: pkg.product?.priceString || '',
    price: pkg.product?.price ?? 0,
    currencyCode: pkg.product?.currencyCode || '',
    subscriptionPeriod: pkg.product?.subscriptionPeriod,
  };
}

function pickPackage(availablePackages: RevenueCatPackage[], requestedIdentifier?: string): RevenueCatPackage | null {
  if (availablePackages.length === 0) return null;

  if (requestedIdentifier) {
    const requested = availablePackages.find((pkg) => pkg.identifier === requestedIdentifier);
    if (requested) return requested;
  }

  for (const desired of premiumPackagePriority()) {
    const found = availablePackages.find(
      (pkg) => pkg.identifier === desired || pkg.packageType === desired,
    );
    if (found) return found;
  }

  return availablePackages[0] ?? null;
}

async function currentOfferingPackages(purchases: RevenueCatModule): Promise<RevenueCatPackage[]> {
  const offerings = await purchases.getOfferings();
  const selectedOffering =
    (offeringId() ? offerings.all?.[offeringId() as string] : undefined) ?? offerings.current;

  return selectedOffering?.availablePackages ?? [];
}

export async function loadPremiumPackages(): Promise<PremiumPackageOption[]> {
  if (!isStorePurchaseConfigured()) return [];
  const initialized = await initializePurchases();
  const purchases = await loadPurchasesModule();
  if (!initialized || !purchases) return [];
  try {
    const packages = await currentOfferingPackages(purchases);
    return packages
      .map(toPackageOption)
      .sort((left, right) => ({ annual: 0, monthly: 1, other: 2 })[left.plan] - ({ annual: 0, monthly: 1, other: 2 })[right.plan]);
  } catch {
    return [];
  }
}

export async function syncStoreSubscriptionStatus(): Promise<void> {
  if (!isStorePurchaseConfigured()) return;

  const initialized = await initializePurchases();
  if (!initialized) return;

  const purchases = await loadPurchasesModule();
  if (!purchases) return;

  try {
    const customerInfo = await purchases.getCustomerInfo();
    await syncTierFromCustomerInfo(customerInfo);
  } catch {
    // Keep the local tier unchanged when store status cannot be fetched.
  }
}

export async function getCurrentSubscriptionSummary(): Promise<SubscriptionSummary | null> {
  const appUserId = await getCurrentAppUserId();

  if (!isStorePurchaseConfigured()) {
    return {
      tier: 'free',
      appUserId,
      entitlementActive: false,
    };
  }

  const initialized = await initializePurchases();
  const purchases = await loadPurchasesModule();
  if (!initialized || !purchases) {
    return {
      tier: 'free',
      appUserId,
      entitlementActive: false,
    };
  }

  try {
    const customerInfo = await purchases.getCustomerInfo();
    const activeEntry = activeEntitlementEntry(customerInfo);
    return {
      tier: hasActivePremiumEntitlement(customerInfo) ? 'premium' : 'free',
      appUserId,
      entitlementActive: hasActivePremiumEntitlement(customerInfo),
      entitlementId: activeEntry?.[0],
      productId: activeEntry?.[1]?.productIdentifier,
      expiresAt: activeEntry?.[1]?.expiresDate ?? undefined,
    };
  } catch {
    return {
      tier: 'free',
      appUserId,
      entitlementActive: false,
    };
  }
}

export async function purchasePremium(packageIdentifier?: string): Promise<PurchaseResult> {
  if (!isStorePurchaseConfigured()) {
    return { status: 'unavailable', message: unavailableMessage() };
  }

  const initialized = await initializePurchases();
  const purchases = await loadPurchasesModule();

  if (!initialized || !purchases) {
    return { status: 'unavailable', message: unavailableMessage() };
  }

  try {
    const availablePackages = await currentOfferingPackages(purchases);
    const selectedPackage = pickPackage(availablePackages, packageIdentifier);
    if (!selectedPackage) {
      return {
        status: 'unavailable',
        message: formatMessage({
          tr: 'Premium paketi bulunamadı. RevenueCat offering ve package tanımlarını kontrol et.',
          en: 'No premium package was found. Check the RevenueCat offering and package setup.',
        }),
      };
    }

    const result = await purchases.purchasePackage(selectedPackage);
    await syncTierFromCustomerInfo(result.customerInfo);

    return {
      status: 'success',
      message: formatMessage({
        tr: 'Premium üyelik başarıyla açıldı.',
        en: 'Premium membership was unlocked successfully.',
      }),
    };
  } catch (error) {
    if (errorIncludes(error, ['cancel'])) {
      return {
        status: 'cancelled',
        message: formatMessage({
          tr: 'Satın alma işlemi iptal edildi. Premium durumun değişmedi.',
          en: 'The purchase was cancelled. Your premium status did not change.',
        }),
      };
    }

    if (errorIncludes(error, ['network', 'internet', 'connection', 'timeout', 'offline'])) {
      return {
        status: 'error',
        message: formatMessage({
          tr: 'Mağazaya ulaşılamadı. Bağlantını kontrol edip tekrar deneyebilirsin. Premium durumun korunuyor.',
          en: 'The store could not be reached. Check your connection and try again. Your premium status is unchanged.',
        }),
      };
    }

    return {
      status: 'error',
      message: formatMessage({
        tr: 'Satın alma tamamlanamadı. Birkaç dakika sonra tekrar dene veya satın almalarını geri yükle. Premium durumun değişmedi.',
        en: 'The purchase could not be completed. Try again in a few minutes or restore purchases. Your premium status did not change.',
      }),
    };
  }
}

export async function restorePremiumPurchases(): Promise<PurchaseResult> {
  if (!isStorePurchaseConfigured()) {
    return { status: 'unavailable', message: unavailableMessage() };
  }

  const initialized = await initializePurchases();
  const purchases = await loadPurchasesModule();

  if (!initialized || !purchases) {
    return { status: 'unavailable', message: unavailableMessage() };
  }

  try {
    const customerInfo = await purchases.restorePurchases();
    await syncTierFromCustomerInfo(customerInfo);

    if (hasActivePremiumEntitlement(customerInfo)) {
      return {
        status: 'success',
        message: formatMessage({
          tr: 'Premium üyelik geri yüklendi.',
          en: 'Premium membership was restored.',
        }),
      };
    }

    return {
      status: 'unavailable',
      message: formatMessage({
        tr: 'Bu hesapta aktif premium üyelik bulunamadı.',
        en: 'No active premium membership was found for this account.',
      }),
    };
  } catch (error) {
    if (errorIncludes(error, ['network', 'internet', 'connection', 'timeout', 'offline'])) {
      return {
        status: 'error',
        message: formatMessage({
          tr: 'Satın almalarına şu an ulaşılamadı. Bağlantını kontrol edip tekrar deneyebilirsin. Mevcut premium durumun korunuyor.',
          en: 'Your purchases could not be reached right now. Check your connection and try again. Your current premium state is unchanged.',
        }),
      };
    }

    return {
      status: 'error',
      message: formatMessage({
        tr: 'Satın almalar geri yüklenemedi. Aynı mağaza hesabıyla giriş yaptığını kontrol edip tekrar deneyebilirsin.',
        en: 'Purchases could not be restored. Check that you are signed in with the same store account and try again.',
      }),
    };
  }
}
