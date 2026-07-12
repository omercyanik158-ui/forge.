import { useMemo } from 'react';
import { REWARDED_AD_TYPES, type RewardedCreditType } from '@/config/rewardedAds';
import {
  consumeFreeAnalysis,
  getRemainingFreeMealAnalyses,
  getRemainingFreePhysiqueAnalyses,
  type AIHubAccessState,
} from './aiHubAccess';
import {
  consumeRewardedCredit,
  getAvailableRewardedCredit,
  getRemainingRewardedDailyCount,
  type RewardedCreditState,
} from './rewardedCreditStore';
import { isPremium } from './subscription';
import type { UserProfile } from '@/types';

export type AIQuotaSource = 'premium' | 'free_quota' | 'rewarded_credit' | 'blocked';
export type AIQuotaBlockedReason = 'free_limit_reached' | 'daily_cap_reached' | 'ads_unavailable';

export type AIQuotaDecision = {
  allowed: boolean;
  source: AIQuotaSource;
  blockedReason?: AIQuotaBlockedReason;
  remainingFreeQuota: number;
  availableRewardedCredits: number;
  remainingDailyRewardedCount: number;
  showRewardedAdOption: boolean;
};

export type SuccessfulAiQuotaConsumeResult = {
  accessState: AIHubAccessState;
  rewardedState: RewardedCreditState;
  consumedSource: Exclude<AIQuotaSource, 'blocked'>;
};

function remainingFreeQuotaFor(
  type: RewardedCreditType,
  accessState: AIHubAccessState,
): number {
  if (type === REWARDED_AD_TYPES.mealAnalysis) {
    return getRemainingFreeMealAnalyses(accessState);
  }
  if (type === REWARDED_AD_TYPES.physiqueAnalysis) {
    return getRemainingFreePhysiqueAnalyses(accessState);
  }
  return 0;
}

export function getAIQuotaDecision({
  profile,
  accessState,
  rewardedState,
  creditType,
  rewardedAdAvailable,
}: {
  profile?: UserProfile | null;
  accessState: AIHubAccessState;
  rewardedState: RewardedCreditState;
  creditType: RewardedCreditType;
  rewardedAdAvailable: boolean;
}): AIQuotaDecision {
  if (isPremium(profile)) {
    return {
      allowed: true,
      source: 'premium',
      remainingFreeQuota: Number.POSITIVE_INFINITY,
      availableRewardedCredits: 0,
      remainingDailyRewardedCount: getRemainingRewardedDailyCount(rewardedState),
      showRewardedAdOption: false,
    };
  }

  const remainingFreeQuota = remainingFreeQuotaFor(creditType, accessState);
  const availableRewardedCredits = getAvailableRewardedCredit(rewardedState, creditType);
  const remainingDailyRewardedCount = getRemainingRewardedDailyCount(rewardedState);

  if (remainingFreeQuota > 0) {
    return {
      allowed: true,
      source: 'free_quota',
      remainingFreeQuota,
      availableRewardedCredits,
      remainingDailyRewardedCount,
      showRewardedAdOption: false,
    };
  }

  if (availableRewardedCredits > 0) {
    return {
      allowed: true,
      source: 'rewarded_credit',
      remainingFreeQuota,
      availableRewardedCredits,
      remainingDailyRewardedCount,
      showRewardedAdOption: false,
    };
  }

  const dailyCapReached = remainingDailyRewardedCount <= 0;
  return {
    allowed: false,
    source: 'blocked',
    blockedReason: dailyCapReached ? 'daily_cap_reached' : rewardedAdAvailable ? 'free_limit_reached' : 'ads_unavailable',
    remainingFreeQuota,
    availableRewardedCredits,
    remainingDailyRewardedCount,
    showRewardedAdOption: !dailyCapReached && rewardedAdAvailable,
  };
}

export function useAiQuotaGate(params: {
  profile?: UserProfile | null;
  accessState: AIHubAccessState;
  rewardedState: RewardedCreditState;
  creditType: RewardedCreditType;
  rewardedAdAvailable: boolean;
}): AIQuotaDecision {
  const {
    accessState,
    creditType,
    profile,
    rewardedAdAvailable,
    rewardedState,
  } = params;

  return useMemo(
    () =>
      getAIQuotaDecision({
        accessState,
        creditType,
        profile,
        rewardedAdAvailable,
        rewardedState,
      }),
    [
      accessState,
      creditType,
      profile,
      rewardedAdAvailable,
      rewardedState,
    ],
  );
}

export async function consumeAiQuotaAfterSuccess({
  profile,
  accessState,
  rewardedState,
  creditType,
}: {
  profile?: UserProfile | null;
  accessState: AIHubAccessState;
  rewardedState: RewardedCreditState;
  creditType: RewardedCreditType;
}): Promise<SuccessfulAiQuotaConsumeResult> {
  if (isPremium(profile)) {
    return {
      accessState,
      rewardedState,
      consumedSource: 'premium',
    };
  }

  const decision = getAIQuotaDecision({
    profile,
    accessState,
    rewardedState,
    creditType,
    rewardedAdAvailable: false,
  });

  if (decision.source === 'rewarded_credit') {
    const consumed = await consumeRewardedCredit(creditType);
    return {
      accessState,
      rewardedState: consumed.state,
      consumedSource: 'rewarded_credit',
    };
  }

  if (decision.source === 'free_quota') {
    const nextAccessState = await consumeFreeAnalysis(creditType);
    return {
      accessState: nextAccessState,
      rewardedState,
      consumedSource: 'free_quota',
    };
  }

  return {
    accessState,
    rewardedState,
    consumedSource: 'free_quota',
  };
}
