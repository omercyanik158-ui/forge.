export const PREMIUM_ENTITLEMENT_ID = process.env.EXPO_PUBLIC_RC_ENTITLEMENT_ID || 'premium';

export const PREMIUM_OFFERING_ID = process.env.EXPO_PUBLIC_RC_OFFERING_ID || 'default';

export const PREMIUM_PACKAGE_IDS = {
  monthly: process.env.EXPO_PUBLIC_RC_MONTHLY_PACKAGE_ID || '$rc_monthly',
  annual: process.env.EXPO_PUBLIC_RC_ANNUAL_PACKAGE_ID || '$rc_annual',
} as const;

export const PREMIUM_PRODUCT_IDS = {
  monthly: process.env.EXPO_PUBLIC_RC_MONTHLY_PRODUCT_ID || 'forge_monthly',
  annual: process.env.EXPO_PUBLIC_RC_ANNUAL_PRODUCT_ID || 'forge_yearly',
} as const;

export const PREMIUM_FEATURE_KEYS = {
  physiqueAi: 'physique_ai',
  foodAi: 'food_ai',
  trainingInsights: 'training_insights',
  premiumPrograms: 'premium_programs',
} as const;

export type PremiumFeatureKey = (typeof PREMIUM_FEATURE_KEYS)[keyof typeof PREMIUM_FEATURE_KEYS];

export function premiumPackagePriority(): string[] {
  return [
    PREMIUM_PACKAGE_IDS.annual,
    'ANNUAL',
    '$rc_annual',
    PREMIUM_PACKAGE_IDS.monthly,
    'MONTHLY',
    '$rc_monthly',
  ];
}
