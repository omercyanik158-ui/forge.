import { REWARDED_AD_DAILY_CAP, type RewardedCreditType, REWARDED_AD_TYPES } from '@/config/rewardedAds';
import { loadStoredValue, removeStoredValue, saveStoredValue } from './safeStorage';
import { STORAGE_KEYS } from './storageRegistry';

export type RewardedCreditState = {
  credits: Record<RewardedCreditType, number>;
  dailyRewardCount: number;
  lastRewardDate?: string;
  updatedAt?: string;
};

export type RewardedCreditGrantResult = {
  granted: boolean;
  reason?: 'daily_cap_reached';
  state: RewardedCreditState;
};

export type RewardedCreditConsumeResult = {
  consumed: boolean;
  state: RewardedCreditState;
};

export type RewardedCreditSnapshot = {
  availableCredits?: Partial<Record<RewardedCreditType, number>>;
  dailyRewardCount?: number;
  remainingDailyRewardCount?: number;
};

const DEFAULT_STATE: RewardedCreditState = {
  credits: {
    [REWARDED_AD_TYPES.mealAnalysis]: 0,
    [REWARDED_AD_TYPES.physiqueAnalysis]: 0,
  },
  dailyRewardCount: 0,
};

function localDayKey(now: Date): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function normalizeState(state: RewardedCreditState, now: Date): RewardedCreditState {
  const dayKey = localDayKey(now);
  const lastDay = state.lastRewardDate;
  if (!lastDay || lastDay === dayKey) return state;
  return {
    ...state,
    dailyRewardCount: 0,
    lastRewardDate: dayKey,
    updatedAt: now.toISOString(),
  };
}

function isRewardedCreditState(value: unknown): value is RewardedCreditState {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<RewardedCreditState>;
  const credits = candidate.credits as Partial<Record<RewardedCreditType, number>> | undefined;
  return (
    !!credits &&
    typeof credits[REWARDED_AD_TYPES.mealAnalysis] === 'number' &&
    typeof credits[REWARDED_AD_TYPES.physiqueAnalysis] === 'number' &&
    typeof candidate.dailyRewardCount === 'number' &&
    Number.isFinite(candidate.dailyRewardCount)
  );
}

async function saveNormalizedState(state: RewardedCreditState): Promise<RewardedCreditState> {
  await saveStoredValue(STORAGE_KEYS.rewardedCredits, state);
  return state;
}

export async function loadRewardedCreditState(now = new Date()): Promise<RewardedCreditState> {
  const stored = await loadStoredValue<RewardedCreditState>({
    key: STORAGE_KEYS.rewardedCredits,
    fallback: DEFAULT_STATE,
    validate: isRewardedCreditState,
  });
  const merged = {
    ...DEFAULT_STATE,
    ...stored,
    credits: {
      ...DEFAULT_STATE.credits,
      ...stored.credits,
    },
  };
  const normalized = normalizeState(merged, now);
  const shouldPersist = JSON.stringify(merged) !== JSON.stringify(normalized);
  if (shouldPersist) {
    await saveNormalizedState(normalized);
  }
  return normalized;
}

export function getAvailableRewardedCredit(state: RewardedCreditState, type: RewardedCreditType): number {
  return Math.max(0, Math.floor(state.credits[type] || 0));
}

export function getRemainingRewardedDailyCount(state: RewardedCreditState): number {
  return Math.max(0, REWARDED_AD_DAILY_CAP - Math.max(0, Math.floor(state.dailyRewardCount)));
}

export function hasRewardedCredit(state: RewardedCreditState, type: RewardedCreditType): boolean {
  return getAvailableRewardedCredit(state, type) > 0;
}

export async function grantRewardedCredit(
  type: RewardedCreditType,
  now = new Date(),
): Promise<RewardedCreditGrantResult> {
  const current = await loadRewardedCreditState(now);
  if (getRemainingRewardedDailyCount(current) <= 0) {
    return { granted: false, reason: 'daily_cap_reached', state: current };
  }

  const next: RewardedCreditState = {
    ...current,
    credits: {
      ...current.credits,
      [type]: getAvailableRewardedCredit(current, type) + 1,
    },
    dailyRewardCount: current.dailyRewardCount + 1,
    lastRewardDate: localDayKey(now),
    updatedAt: now.toISOString(),
  };

  return {
    granted: true,
    state: await saveNormalizedState(next),
  };
}

export async function consumeRewardedCredit(
  type: RewardedCreditType,
  now = new Date(),
): Promise<RewardedCreditConsumeResult> {
  const current = await loadRewardedCreditState(now);
  const available = getAvailableRewardedCredit(current, type);
  if (available <= 0) {
    return { consumed: false, state: current };
  }

  const next: RewardedCreditState = {
    ...current,
    credits: {
      ...current.credits,
      [type]: available - 1,
    },
    updatedAt: now.toISOString(),
  };

  return {
    consumed: true,
    state: await saveNormalizedState(next),
  };
}

export async function clearRewardedCreditState(): Promise<void> {
  await removeStoredValue(STORAGE_KEYS.rewardedCredits);
}

export async function syncRewardedCreditStateFromSnapshot(
  snapshot: RewardedCreditSnapshot,
  now = new Date(),
): Promise<RewardedCreditState> {
  const next: RewardedCreditState = {
    credits: {
      [REWARDED_AD_TYPES.mealAnalysis]: Math.max(0, Math.floor(snapshot.availableCredits?.[REWARDED_AD_TYPES.mealAnalysis] ?? 0)),
      [REWARDED_AD_TYPES.physiqueAnalysis]: Math.max(0, Math.floor(snapshot.availableCredits?.[REWARDED_AD_TYPES.physiqueAnalysis] ?? 0)),
    },
    dailyRewardCount: Math.max(0, Math.floor(snapshot.dailyRewardCount ?? 0)),
    lastRewardDate: localDayKey(now),
    updatedAt: now.toISOString(),
  };
  await saveNormalizedState(next);
  return next;
}
