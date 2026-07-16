import { clientConfig } from './clientConfig';

export const PREMIUM_ENTITLEMENT_ID = clientConfig.purchases.entitlementId;

export const PREMIUM_OFFERING_ID = clientConfig.purchases.offeringId;

export const PREMIUM_PACKAGE_IDS = {
  monthly: clientConfig.purchases.packageIds.monthly,
  annual: clientConfig.purchases.packageIds.annual,
} as const;

export const PREMIUM_PRODUCT_IDS = {
  monthly: clientConfig.purchases.productIds.monthly,
  annual: clientConfig.purchases.productIds.annual,
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
