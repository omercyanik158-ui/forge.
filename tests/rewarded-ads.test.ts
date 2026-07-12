import { beforeEach, describe, expect, it, vi } from 'vitest';
import { REWARDED_AD_TYPES } from '@/config/rewardedAds';
import { buildAiLimitModalModel } from '@/services/aiLimitModalModel';
import { consumeAiQuotaAfterSuccess, getAIQuotaDecision } from '@/services/aiQuotaGate';
import { type AIHubAccessState } from '@/services/aiHubAccess';
import {
  __resetRewardedAdServiceForTests,
  __setRewardedAdMockOutcomeForTests,
  initializeRewardedAds,
  loadRewardedAd,
  showRewardedAd,
} from '@/services/rewardedAdService';
import {
  clearRewardedCreditState,
  consumeRewardedCredit,
  getAvailableRewardedCredit,
  getRemainingRewardedDailyCount,
  grantRewardedCredit,
  loadRewardedCreditState,
  type RewardedCreditState,
} from '@/services/rewardedCreditStore';

const storage = new Map<string, string>();

vi.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(async (key: string) => storage.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => {
      storage.set(key, value);
    }),
    multiRemove: vi.fn(async (keys: string[]) => {
      keys.forEach((key) => storage.delete(key));
    }),
  },
}));

const freeProfile = { subscription: 'free', age: 28 } as unknown as import('@/types').UserProfile;
const premiumProfile = { subscription: 'premium', age: 28 } as unknown as import('@/types').UserProfile;
const defaultAccessState: AIHubAccessState = { mealUsageTimestamps: [], physiqueUsageTimestamps: [] };
const emptyRewardedState: RewardedCreditState = {
  credits: {
    [REWARDED_AD_TYPES.mealAnalysis]: 0,
    [REWARDED_AD_TYPES.physiqueAnalysis]: 0,
  },
  dailyRewardCount: 0,
};

describe('rewarded ad quota gate', () => {
  beforeEach(async () => {
    storage.clear();
    await clearRewardedCreditState();
    __resetRewardedAdServiceForTests();
    vi.unstubAllEnvs();
    vi.stubEnv('EXPO_PUBLIC_ADMOB_ENABLED', 'false');
    vi.stubEnv('EXPO_PUBLIC_ADMOB_TEST_MODE', 'false');
    (globalThis as { __DEV__?: boolean }).__DEV__ = true;
  });

  it('allows free physique analysis when normal quota remains', () => {
    const decision = getAIQuotaDecision({
      profile: freeProfile,
      accessState: defaultAccessState,
      rewardedState: emptyRewardedState,
      creditType: REWARDED_AD_TYPES.physiqueAnalysis,
      rewardedAdAvailable: true,
    });

    expect(decision.allowed).toBe(true);
    expect(decision.source).toBe('free_quota');
  });

  it('blocks free user without quota and without rewarded credit', () => {
    const decision = getAIQuotaDecision({
      profile: freeProfile,
      accessState: { mealUsageTimestamps: [], physiqueUsageTimestamps: ['2026-07-04T10:00:00.000Z'] },
      rewardedState: emptyRewardedState,
      creditType: REWARDED_AD_TYPES.physiqueAnalysis,
      rewardedAdAvailable: false,
    });

    expect(decision.allowed).toBe(false);
    expect(decision.source).toBe('blocked');
  });

  it('modal model always keeps Premium CTA visible', () => {
    const model = buildAiLimitModalModel(REWARDED_AD_TYPES.physiqueAnalysis, {
      allowed: false,
      source: 'blocked',
      blockedReason: 'free_limit_reached',
      remainingFreeQuota: 0,
      availableRewardedCredits: 0,
      remainingDailyRewardedCount: 2,
      showRewardedAdOption: true,
    });

    expect(model.showPremiumCta).toBe(true);
  });

  it('modal model only shows rewarded CTA when eligible', () => {
    const eligible = buildAiLimitModalModel(REWARDED_AD_TYPES.mealAnalysis, {
      allowed: false,
      source: 'blocked',
      blockedReason: 'free_limit_reached',
      remainingFreeQuota: 0,
      availableRewardedCredits: 0,
      remainingDailyRewardedCount: 1,
      showRewardedAdOption: true,
    });
    const hidden = buildAiLimitModalModel(REWARDED_AD_TYPES.mealAnalysis, {
      allowed: false,
      source: 'blocked',
      blockedReason: 'daily_cap_reached',
      remainingFreeQuota: 0,
      availableRewardedCredits: 0,
      remainingDailyRewardedCount: 0,
      showRewardedAdOption: false,
    });

    expect(eligible.showRewardedCta).toBe(true);
    expect(hidden.showRewardedCta).toBe(false);
  });

  it('premium user never sees rewarded ad option', () => {
    const decision = getAIQuotaDecision({
      profile: premiumProfile,
      accessState: { mealUsageTimestamps: [], physiqueUsageTimestamps: ['2026-07-04T10:00:00.000Z'] },
      rewardedState: {
        ...emptyRewardedState,
        credits: {
          [REWARDED_AD_TYPES.mealAnalysis]: 2,
          [REWARDED_AD_TYPES.physiqueAnalysis]: 2,
        },
      },
      creditType: REWARDED_AD_TYPES.physiqueAnalysis,
      rewardedAdAvailable: true,
    });

    expect(decision.source).toBe('premium');
    expect(decision.showRewardedAdOption).toBe(false);
  });
});

describe('rewarded credit store', () => {
  beforeEach(async () => {
    storage.clear();
    await clearRewardedCreditState();
  });

  it('completed rewarded ad grants exactly one credit', async () => {
    const result = await grantRewardedCredit(REWARDED_AD_TYPES.mealAnalysis, new Date('2026-07-04T12:00:00'));
    expect(result.granted).toBe(true);
    expect(getAvailableRewardedCredit(result.state, REWARDED_AD_TYPES.mealAnalysis)).toBe(1);
  });

  it('rewarded credit is consumed after successful analysis', async () => {
    await grantRewardedCredit(REWARDED_AD_TYPES.mealAnalysis, new Date('2026-07-04T12:00:00'));
    const state = await loadRewardedCreditState(new Date('2026-07-04T12:05:00'));
    const consumed = await consumeRewardedCredit(REWARDED_AD_TYPES.mealAnalysis, new Date('2026-07-04T12:06:00'));

    expect(getAvailableRewardedCredit(state, REWARDED_AD_TYPES.mealAnalysis)).toBe(1);
    expect(consumed.consumed).toBe(true);
    expect(getAvailableRewardedCredit(consumed.state, REWARDED_AD_TYPES.mealAnalysis)).toBe(0);
  });

  it('meal rewarded credit does not unlock physique analysis', () => {
    const decision = getAIQuotaDecision({
      profile: freeProfile,
      accessState: { mealUsageTimestamps: [], physiqueUsageTimestamps: ['2026-07-04T10:00:00.000Z'] },
      rewardedState: {
        ...emptyRewardedState,
        credits: {
          [REWARDED_AD_TYPES.mealAnalysis]: 1,
          [REWARDED_AD_TYPES.physiqueAnalysis]: 0,
        },
      },
      creditType: REWARDED_AD_TYPES.physiqueAnalysis,
      rewardedAdAvailable: true,
    });

    expect(decision.allowed).toBe(false);
  });

  it('physique rewarded credit does not unlock meal analysis', () => {
    const decision = getAIQuotaDecision({
      profile: freeProfile,
      accessState: { mealUsageTimestamps: ['2026-07-04T10:00:00.000Z'], physiqueUsageTimestamps: [] },
      rewardedState: {
        ...emptyRewardedState,
        credits: {
          [REWARDED_AD_TYPES.mealAnalysis]: 0,
          [REWARDED_AD_TYPES.physiqueAnalysis]: 1,
        },
      },
      creditType: REWARDED_AD_TYPES.mealAnalysis,
      rewardedAdAvailable: true,
    });

    expect(decision.allowed).toBe(false);
  });

  it('daily rewarded ad cap blocks further rewards after three', async () => {
    await grantRewardedCredit(REWARDED_AD_TYPES.mealAnalysis, new Date('2026-07-04T09:00:00'));
    await grantRewardedCredit(REWARDED_AD_TYPES.mealAnalysis, new Date('2026-07-04T10:00:00'));
    await grantRewardedCredit(REWARDED_AD_TYPES.physiqueAnalysis, new Date('2026-07-04T11:00:00'));
    const fourth = await grantRewardedCredit(REWARDED_AD_TYPES.physiqueAnalysis, new Date('2026-07-04T12:00:00'));

    expect(fourth.granted).toBe(false);
    expect(getRemainingRewardedDailyCount(fourth.state)).toBe(0);
  });

  it('daily rewarded ad count resets on the next day', async () => {
    await grantRewardedCredit(REWARDED_AD_TYPES.mealAnalysis, new Date('2026-07-04T09:00:00'));
    const nextDay = await loadRewardedCreditState(new Date('2026-07-05T08:00:00'));

    expect(nextDay.dailyRewardCount).toBe(0);
  });

  it('uses rewarded meal credit after successful meal analysis', async () => {
    const granted = await grantRewardedCredit(REWARDED_AD_TYPES.mealAnalysis, new Date('2026-07-04T09:00:00'));
    const consumed = await consumeAiQuotaAfterSuccess({
      profile: freeProfile,
      accessState: { mealUsageTimestamps: ['2026-07-04T10:00:00.000Z'], physiqueUsageTimestamps: [] },
      rewardedState: granted.state,
      creditType: REWARDED_AD_TYPES.mealAnalysis,
    });

    expect(consumed.consumedSource).toBe('rewarded_credit');
    expect(getAvailableRewardedCredit(consumed.rewardedState, REWARDED_AD_TYPES.mealAnalysis)).toBe(0);
  });
});

describe('rewarded ad service', () => {
  beforeEach(() => {
    __resetRewardedAdServiceForTests();
    vi.unstubAllEnvs();
    vi.stubEnv('EXPO_PUBLIC_ADMOB_ENABLED', 'false');
    vi.stubEnv('EXPO_PUBLIC_ADMOB_TEST_MODE', 'false');
    (globalThis as { __DEV__?: boolean }).__DEV__ = true;
  });

  it('Expo Go/mock mode does not crash', async () => {
    await initializeRewardedAds();
    const loaded = await loadRewardedAd(REWARDED_AD_TYPES.mealAnalysis);

    expect(loaded).toBe(true);
  });

  it('skipped ad grants no credit', async () => {
    __setRewardedAdMockOutcomeForTests('skipped');
    const result = await showRewardedAd(REWARDED_AD_TYPES.mealAnalysis);
    expect(result).toBe('skipped');
  });

  it('failed ad grants no credit', async () => {
    __setRewardedAdMockOutcomeForTests('failed');
    const result = await showRewardedAd(REWARDED_AD_TYPES.mealAnalysis);
    expect(result).toBe('failed');
  });

  it('unavailable ad grants no credit', async () => {
    vi.stubEnv('EXPO_PUBLIC_ADMOB_ENABLED', 'true');
    vi.stubEnv('EXPO_PUBLIC_ADMOB_TEST_MODE', 'false');
    (globalThis as { __DEV__?: boolean }).__DEV__ = false;
    __resetRewardedAdServiceForTests();
    const result = await showRewardedAd(REWARDED_AD_TYPES.mealAnalysis);
    expect(result === 'unavailable' || result === 'unsupported').toBe(true);
  });

  it('real AdMob disabled mode does not crash', async () => {
    vi.stubEnv('EXPO_PUBLIC_ADMOB_ENABLED', 'false');
    (globalThis as { __DEV__?: boolean }).__DEV__ = false;
    __resetRewardedAdServiceForTests();
    const result = await showRewardedAd(REWARDED_AD_TYPES.physiqueAnalysis);
    expect(result).toBe('unavailable');
  });

  it('missing AdMob IDs do not crash the app', async () => {
    vi.stubEnv('EXPO_PUBLIC_ADMOB_ENABLED', 'true');
    vi.stubEnv('EXPO_PUBLIC_ADMOB_TEST_MODE', 'false');
    (globalThis as { __DEV__?: boolean }).__DEV__ = false;
    __resetRewardedAdServiceForTests();
    const loaded = await loadRewardedAd(REWARDED_AD_TYPES.physiqueAnalysis);
    expect(loaded).toBe(false);
  });
});
