import { useMemo } from 'react';
import { useAppLocalization } from '@/providers/localization-context';
import { getPremiumFeatureDefinition } from './premiumFeatures';
import type { UserProfile } from '@/types';
import type { PremiumFeatureKey } from '@/config/premium';
import { isPremium } from '@/services/subscription';

export type PremiumAccessSnapshot = {
  hasAccess: boolean;
  title: string;
  summary: string;
};

export function usePremiumAccess(feature: PremiumFeatureKey, profile?: UserProfile | null): PremiumAccessSnapshot {
  const { t } = useAppLocalization();

  return useMemo(() => {
    const definition = getPremiumFeatureDefinition(feature);
    return {
      hasAccess: isPremium(profile),
      title: t(definition.title),
      summary: t(definition.summary),
    };
  }, [feature, profile, t]);
}
