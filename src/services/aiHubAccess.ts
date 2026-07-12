import { loadStoredValue, removeStoredValue, saveStoredValue } from './safeStorage';
import { STORAGE_KEYS } from './storageRegistry';
import { REWARDED_AD_TYPES, type RewardedCreditType } from '@/config/rewardedAds';

export type AIHubAccessState = {
  mealUsageTimestamps: string[];
  physiqueUsageTimestamps: string[];
};

type LegacyAIHubAccessState = Partial<AIHubAccessState> & {
  physiqueTrialsUsed?: unknown;
  lastPhysiqueTrialAt?: unknown;
};

const FREE_MEAL_ANALYSIS_LIMIT = 1;
const FREE_PHYSIQUE_ANALYSIS_LIMIT = 1;
const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

const DEFAULT_STATE: AIHubAccessState = {
  mealUsageTimestamps: [],
  physiqueUsageTimestamps: [],
};

function pruneIsoTimestamps(values: string[], windowMs: number, nowMs: number): string[] {
  return values.filter((value) => {
    const timestamp = Date.parse(value);
    return Number.isFinite(timestamp) && timestamp >= nowMs - windowMs;
  });
}

function normalizeState(value: Partial<AIHubAccessState>, now = new Date()): AIHubAccessState {
  const nowMs = now.getTime();
  return {
    mealUsageTimestamps: pruneIsoTimestamps(value.mealUsageTimestamps ?? [], DAY_MS, nowMs),
    physiqueUsageTimestamps: pruneIsoTimestamps(value.physiqueUsageTimestamps ?? [], WEEK_MS, nowMs),
  };
}

function isAIHubAccessState(value: unknown): value is AIHubAccessState | LegacyAIHubAccessState {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<AIHubAccessState> & {
    physiqueTrialsUsed?: unknown;
    lastPhysiqueTrialAt?: unknown;
  };

  if (Array.isArray(candidate.mealUsageTimestamps) && Array.isArray(candidate.physiqueUsageTimestamps)) {
    return candidate.mealUsageTimestamps.every((item) => typeof item === 'string')
      && candidate.physiqueUsageTimestamps.every((item) => typeof item === 'string');
  }

  return typeof candidate.physiqueTrialsUsed === 'number';
}

function migrateLegacyState(value: AIHubAccessState | LegacyAIHubAccessState): AIHubAccessState {
  if (Array.isArray(value.mealUsageTimestamps) || Array.isArray(value.physiqueUsageTimestamps)) {
    return normalizeState(value);
  }

  const legacyValue = value as LegacyAIHubAccessState;
  const hasLegacyUsage = typeof legacyValue.physiqueTrialsUsed === 'number' && legacyValue.physiqueTrialsUsed > 0;
  const legacyTimestamp = typeof legacyValue.lastPhysiqueTrialAt === 'string'
    ? legacyValue.lastPhysiqueTrialAt
    : new Date().toISOString();

  return normalizeState({
    mealUsageTimestamps: [],
    physiqueUsageTimestamps: hasLegacyUsage ? [legacyTimestamp] : [],
  });
}

export async function loadAIHubAccessState(now = new Date()): Promise<AIHubAccessState> {
  const stored = await loadStoredValue<AIHubAccessState | LegacyAIHubAccessState>({
    key: STORAGE_KEYS.aiHubAccess,
    fallback: DEFAULT_STATE,
    validate: isAIHubAccessState,
  });

  const normalized = migrateLegacyState(stored);
  if (JSON.stringify(stored) !== JSON.stringify(normalized)) {
    await saveStoredValue(STORAGE_KEYS.aiHubAccess, normalized);
  }
  return normalized;
}

export function getRemainingFreeMealAnalyses(state: AIHubAccessState): number {
  return Math.max(0, FREE_MEAL_ANALYSIS_LIMIT - (state.mealUsageTimestamps?.length ?? 0));
}

export function getRemainingFreePhysiqueAnalyses(state: AIHubAccessState): number {
  return Math.max(0, FREE_PHYSIQUE_ANALYSIS_LIMIT - (state.physiqueUsageTimestamps?.length ?? 0));
}

export async function consumeFreeAnalysis(
  type: RewardedCreditType,
  now = new Date(),
): Promise<AIHubAccessState> {
  const current = await loadAIHubAccessState(now);
  const next = normalizeState({
    ...current,
    mealUsageTimestamps: type === REWARDED_AD_TYPES.mealAnalysis
      ? [...current.mealUsageTimestamps, now.toISOString()]
      : current.mealUsageTimestamps,
    physiqueUsageTimestamps: type === REWARDED_AD_TYPES.physiqueAnalysis
      ? [...current.physiqueUsageTimestamps, now.toISOString()]
      : current.physiqueUsageTimestamps,
  }, now);
  await saveStoredValue(STORAGE_KEYS.aiHubAccess, next);
  return next;
}

export async function clearAIHubAccessState(): Promise<void> {
  await removeStoredValue(STORAGE_KEYS.aiHubAccess);
}
