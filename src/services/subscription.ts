import type { UserProfile } from '@/types';
import { loadProfile, saveProfile } from './profileStore';
import { formatMessage } from './localization';
import { PREMIUM_FEATURE_KEYS, type PremiumFeatureKey } from '@/config/premium';
import { PREMIUM_FEATURES, getPremiumFeatureDefinition } from '@/features/premium/premiumFeatures';

export type { PremiumFeatureKey };

export type PremiumFeatureInfo = {
  key: PremiumFeatureKey;
  title: string;
  summary: string;
};

export function isPremium(profile?: UserProfile | null): boolean {
  return profile?.subscription === 'premium';
}

export function canAccessFoodSearch(profile?: UserProfile | null): boolean {
  return isPremium(profile);
}

export function canAccessPremiumPrograms(profile?: UserProfile | null): boolean {
  return isPremium(profile);
}

export function canAccessTrainingInsights(profile?: UserProfile | null): boolean {
  return isPremium(profile);
}

export function getPremiumFeatureInfo(feature: PremiumFeatureKey): PremiumFeatureInfo {
  const item = getPremiumFeatureDefinition(feature);
  return {
    key: item.key,
    title: formatMessage(item.title),
    summary: formatMessage(item.summary),
  };
}

export function listPremiumFeatures(): PremiumFeatureInfo[] {
  return PREMIUM_FEATURES.map((item) => ({
    key: item.key,
    title: formatMessage(item.title),
    summary: formatMessage(item.summary),
  }));
}

export async function setSubscriptionTier(tier: 'free' | 'premium'): Promise<void> {
  const profile = await loadProfile();
  if (!profile) return;
  await saveProfile({ ...profile, subscription: tier });
}

export { PREMIUM_FEATURE_KEYS };
