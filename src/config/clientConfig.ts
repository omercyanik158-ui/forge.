export type AppEnvironment = 'development' | 'preview' | 'production' | 'test';
export type ClientConfigIssue = {
  key: string;
  message: string;
  severity: 'error' | 'warning';
};

const RAW_APP_ENV = process.env.EXPO_PUBLIC_APP_ENV;
const RAW_TEMPLATE_PROGRAM_ENGINE = process.env.EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE;
const RAW_TEMPLATE_PROGRAM_ENGINE_DEV_OVERRIDE = process.env.EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE_DEV_OVERRIDE;
const RAW_PHYSIQUE_ADAPTATION_WRITES = process.env.EXPO_PUBLIC_PHYSIQUE_ADAPTATION_WRITES;
const RAW_PHYSIQUE_ADAPTATION_DEV_OVERRIDE = process.env.EXPO_PUBLIC_PHYSIQUE_ADAPTATION_DEV_OVERRIDE;
const RAW_PROGRESSION_WRITES = process.env.EXPO_PUBLIC_PROGRESSION_WRITES;
const RAW_PROGRESSION_WRITES_DEV_OVERRIDE = process.env.EXPO_PUBLIC_PROGRESSION_WRITES_DEV_OVERRIDE;
const RAW_PURCHASES_ENABLED = process.env.EXPO_PUBLIC_PURCHASES_ENABLED;
const RAW_RC_IOS_API_KEY = process.env.EXPO_PUBLIC_RC_IOS_API_KEY;
const RAW_RC_ANDROID_API_KEY = process.env.EXPO_PUBLIC_RC_ANDROID_API_KEY;
const RAW_RC_ENTITLEMENT_ID = process.env.EXPO_PUBLIC_RC_ENTITLEMENT_ID;
const RAW_RC_OFFERING_ID = process.env.EXPO_PUBLIC_RC_OFFERING_ID;
const RAW_RC_MONTHLY_PACKAGE_ID = process.env.EXPO_PUBLIC_RC_MONTHLY_PACKAGE_ID;
const RAW_RC_ANNUAL_PACKAGE_ID = process.env.EXPO_PUBLIC_RC_ANNUAL_PACKAGE_ID;
const RAW_RC_MONTHLY_PRODUCT_ID = process.env.EXPO_PUBLIC_RC_MONTHLY_PRODUCT_ID;
const RAW_RC_ANNUAL_PRODUCT_ID = process.env.EXPO_PUBLIC_RC_ANNUAL_PRODUCT_ID;
const RAW_AI_API_URL = process.env.EXPO_PUBLIC_AI_API_URL;
const RAW_IMAGE_SEARCH_API_URL = process.env.EXPO_PUBLIC_IMAGE_SEARCH_API_URL;
const RAW_PRIVACY_URL = process.env.EXPO_PUBLIC_PRIVACY_URL;
const RAW_TERMS_URL = process.env.EXPO_PUBLIC_TERMS_URL;
const RAW_SUPPORT_EMAIL = process.env.EXPO_PUBLIC_SUPPORT_EMAIL;
const RAW_POSTHOG_KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const RAW_POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST;
const RAW_ANALYTICS_ENABLED = process.env.EXPO_PUBLIC_ANALYTICS_ENABLED;
const RAW_ADMOB_ENABLED = process.env.EXPO_PUBLIC_ADMOB_ENABLED;
const RAW_ADMOB_TEST_MODE = process.env.EXPO_PUBLIC_ADMOB_TEST_MODE;
const RAW_ADMOB_IOS_APP_ID = process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID;
const RAW_ADMOB_ANDROID_APP_ID = process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID;
const RAW_ADMOB_IOS_REWARDED_MEAL_AD_UNIT_ID = process.env.EXPO_PUBLIC_ADMOB_IOS_REWARDED_MEAL_AD_UNIT_ID;
const RAW_ADMOB_ANDROID_REWARDED_MEAL_AD_UNIT_ID = process.env.EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_MEAL_AD_UNIT_ID;
const RAW_ADMOB_IOS_REWARDED_PHYSIQUE_AD_UNIT_ID = process.env.EXPO_PUBLIC_ADMOB_IOS_REWARDED_PHYSIQUE_AD_UNIT_ID;
const RAW_ADMOB_ANDROID_REWARDED_PHYSIQUE_AD_UNIT_ID = process.env.EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_PHYSIQUE_AD_UNIT_ID;
const RAW_SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const RAW_SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

function normalizeString(value: string | undefined): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseBoolean(value: string | undefined): boolean | null {
  const normalized = normalizeString(value)?.toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  return null;
}

function parseAppEnvironment(value: string | undefined): AppEnvironment | 'unknown' {
  const normalized = normalizeString(value)?.toLowerCase();
  if (normalized === 'development' || normalized === 'preview' || normalized === 'production' || normalized === 'test') {
    return normalized;
  }
  return 'unknown';
}

function normalizeUrl(value: string | undefined): string | null {
  const raw = normalizeString(value);
  if (!raw) return null;
  return raw.replace(/\/$/, '');
}

function isLocalhostHost(host: string): boolean {
  return host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0';
}

function isPrivateIpv4(host: string): boolean {
  return /^10\./.test(host)
    || /^192\.168\./.test(host)
    || /^172\.(1[6-9]|2\d|3[0-1])\./.test(host);
}

function isValidHttpUrl(value: string, options: { allowHttpLocalhost: boolean }): boolean {
  try {
    const url = new URL(value);
    if (url.protocol === 'https:') return true;
    if (!options.allowHttpLocalhost || url.protocol !== 'http:') return false;
    return isLocalhostHost(url.hostname) || isPrivateIpv4(url.hostname);
  } catch {
    return false;
  }
}

function isSafeProductionUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return false;
    return !isLocalhostHost(url.hostname) && !isPrivateIpv4(url.hostname);
  } catch {
    return false;
  }
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

const appEnv = parseAppEnvironment(RAW_APP_ENV);
const isDevelopmentLike = appEnv === 'development' || appEnv === 'test';

export const clientConfig = {
  appEnv,
  appEnvMarker: `forge-app-env:${appEnv}`,
  isKnownAppEnv: appEnv !== 'unknown',
  features: {
    templateProgramEngine: {
      raw: normalizeString(RAW_TEMPLATE_PROGRAM_ENGINE),
      enabled: parseBoolean(RAW_TEMPLATE_PROGRAM_ENGINE) === true,
      devOverrideRaw: normalizeString(RAW_TEMPLATE_PROGRAM_ENGINE_DEV_OVERRIDE),
      devOverrideEnabled: parseBoolean(RAW_TEMPLATE_PROGRAM_ENGINE_DEV_OVERRIDE) === true,
    },
    physiqueAdaptationWrites: {
      raw: normalizeString(RAW_PHYSIQUE_ADAPTATION_WRITES),
      enabled: parseBoolean(RAW_PHYSIQUE_ADAPTATION_WRITES) === true,
      devOverrideRaw: normalizeString(RAW_PHYSIQUE_ADAPTATION_DEV_OVERRIDE),
      devOverrideEnabled: parseBoolean(RAW_PHYSIQUE_ADAPTATION_DEV_OVERRIDE) === true,
    },
    progressionWrites: {
      raw: normalizeString(RAW_PROGRESSION_WRITES),
      enabled: parseBoolean(RAW_PROGRESSION_WRITES) === true,
      devOverrideRaw: normalizeString(RAW_PROGRESSION_WRITES_DEV_OVERRIDE),
      devOverrideEnabled: parseBoolean(RAW_PROGRESSION_WRITES_DEV_OVERRIDE) === true,
    },
  },
  purchases: {
    enabled: parseBoolean(RAW_PURCHASES_ENABLED) === true,
    iosApiKey: normalizeString(RAW_RC_IOS_API_KEY),
    androidApiKey: normalizeString(RAW_RC_ANDROID_API_KEY),
    entitlementId: normalizeString(RAW_RC_ENTITLEMENT_ID) ?? 'premium',
    offeringId: normalizeString(RAW_RC_OFFERING_ID) ?? 'default',
    packageIds: {
      monthly: normalizeString(RAW_RC_MONTHLY_PACKAGE_ID) ?? '$rc_monthly',
      annual: normalizeString(RAW_RC_ANNUAL_PACKAGE_ID) ?? '$rc_annual',
    },
    productIds: {
      monthly: normalizeString(RAW_RC_MONTHLY_PRODUCT_ID) ?? 'forge_monthly',
      annual: normalizeString(RAW_RC_ANNUAL_PRODUCT_ID) ?? 'forge_yearly',
    },
  },
  ai: {
    apiBaseUrl: normalizeUrl(RAW_AI_API_URL),
    imageSearchApiUrl: normalizeUrl(RAW_IMAGE_SEARCH_API_URL),
  },
  legal: {
    privacyUrl: normalizeUrl(RAW_PRIVACY_URL),
    termsUrl: normalizeUrl(RAW_TERMS_URL),
  },
  support: {
    email: normalizeString(RAW_SUPPORT_EMAIL),
  },
  analytics: {
    enabled: parseBoolean(RAW_ANALYTICS_ENABLED) === true,
    posthogKey: normalizeString(RAW_POSTHOG_KEY),
    posthogHost: normalizeUrl(RAW_POSTHOG_HOST) ?? 'https://eu.i.posthog.com',
  },
  ads: {
    enabled: parseBoolean(RAW_ADMOB_ENABLED) === true,
    testMode: parseBoolean(RAW_ADMOB_TEST_MODE) === true,
    iosAppId: normalizeString(RAW_ADMOB_IOS_APP_ID),
    androidAppId: normalizeString(RAW_ADMOB_ANDROID_APP_ID),
    rewardedMeal: {
      ios: normalizeString(RAW_ADMOB_IOS_REWARDED_MEAL_AD_UNIT_ID),
      android: normalizeString(RAW_ADMOB_ANDROID_REWARDED_MEAL_AD_UNIT_ID),
    },
    rewardedPhysique: {
      ios: normalizeString(RAW_ADMOB_IOS_REWARDED_PHYSIQUE_AD_UNIT_ID),
      android: normalizeString(RAW_ADMOB_ANDROID_REWARDED_PHYSIQUE_AD_UNIT_ID),
    },
  },
  supabase: {
    url: normalizeUrl(RAW_SUPABASE_URL),
    anonKey: normalizeString(RAW_SUPABASE_ANON_KEY),
  },
} as const;

export function shouldAllowFeatureDevOverride(): boolean {
  return isDevelopmentLike;
}

export function getClientConfigIssues(): ClientConfigIssue[] {
  const issues: ClientConfigIssue[] = [];

  if (!clientConfig.isKnownAppEnv) {
    issues.push({
      key: 'EXPO_PUBLIC_APP_ENV',
      message: 'App environment must be one of development, preview, production, or test.',
      severity: 'error',
    });
  }

  if (clientConfig.support.email && !isValidEmail(clientConfig.support.email)) {
    issues.push({
      key: 'EXPO_PUBLIC_SUPPORT_EMAIL',
      message: 'Support email must be a valid email address.',
      severity: 'error',
    });
  }

  for (const [key, value] of [
    ['EXPO_PUBLIC_PRIVACY_URL', clientConfig.legal.privacyUrl],
    ['EXPO_PUBLIC_TERMS_URL', clientConfig.legal.termsUrl],
    ['EXPO_PUBLIC_AI_API_URL', clientConfig.ai.apiBaseUrl],
    ['EXPO_PUBLIC_IMAGE_SEARCH_API_URL', clientConfig.ai.imageSearchApiUrl],
    ['EXPO_PUBLIC_POSTHOG_HOST', clientConfig.analytics.posthogHost],
    ['EXPO_PUBLIC_SUPABASE_URL', clientConfig.supabase.url],
  ] as const) {
    if (!value) continue;
    const valid = isValidHttpUrl(value, { allowHttpLocalhost: isDevelopmentLike });
    if (!valid) {
      issues.push({
        key,
        message: 'URL must be HTTPS, except localhost/private HTTP is allowed only in development or test.',
        severity: 'error',
      });
    }
  }

  if (clientConfig.appEnv === 'production' && clientConfig.ai.apiBaseUrl && !isSafeProductionUrl(clientConfig.ai.apiBaseUrl)) {
    issues.push({
      key: 'EXPO_PUBLIC_AI_API_URL',
      message: 'Production AI API URL must be HTTPS and must not point to localhost or a private network.',
      severity: 'error',
    });
  }

  if (clientConfig.appEnv === 'production') {
    for (const [key, enabled] of [
      ['EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE', clientConfig.features.templateProgramEngine.enabled],
      ['EXPO_PUBLIC_PROGRESSION_WRITES', clientConfig.features.progressionWrites.enabled],
    ] as const) {
      if (!enabled) {
        issues.push({
          key,
          message: 'Core FORGE V1 feature must be enabled in production.',
          severity: 'error',
        });
      }
    }
  }

  return issues;
}
