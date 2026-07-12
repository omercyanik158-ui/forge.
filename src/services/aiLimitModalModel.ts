import type { RewardedCreditType } from '@/config/rewardedAds';
import type { AIQuotaDecision } from './aiQuotaGate';

export type AiLimitModalModel = {
  showPremiumCta: boolean;
  showRewardedCta: boolean;
  creditType: RewardedCreditType;
  blockedReason?: AIQuotaDecision['blockedReason'];
};

export function buildAiLimitModalModel(
  creditType: RewardedCreditType,
  decision: AIQuotaDecision,
): AiLimitModalModel {
  return {
    showPremiumCta: true,
    showRewardedCta: decision.showRewardedAdOption,
    creditType,
    blockedReason: decision.blockedReason,
  };
}
