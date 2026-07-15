import type { CoachPreferences, CycleTracking, Meal, UserProfile, WaterLog, WorkoutLog } from '@/types';
import type { CustomWorkout } from './customWorkoutStore';
import type { MealTemplate } from './mealTemplateStore';
import { inspectStoredValue } from './safeStorage';
import { STORAGE_KEYS, STORAGE_LABELS, type StorageRegistryKey } from './storageRegistry';
import { isStringArray } from './storageValidators';
import type { NotificationPreferences } from './notificationStore';
import type { ProgramProgressMap } from './programProgressStore';
import type { AppPreferences } from './appPreferencesStore';
import type { AIHubAccessState } from './aiHubAccess';
import type { AIProgramPhysiqueSeed } from '@/types/aiProgram';
import type { UserProgram } from './userProgramsStore';

export type DataHealthItem = {
  key: StorageRegistryKey;
  label: string;
  hasPrimary: boolean;
  hasBackup: boolean;
  isEmpty: boolean;
  isHealthy: boolean;
  lastSavedAt?: string;
  lastRecoveredAt?: string;
};

function isProfile(value: unknown): value is UserProfile {
  if (!value || typeof value !== 'object') return false;
  const profile = value as UserProfile;
  return typeof profile.name === 'string' && typeof profile.createdAt === 'string' && typeof profile.age === 'number' && typeof profile.weightKg === 'number' && typeof profile.heightCm === 'number';
}

function isMeal(value: unknown): value is Meal {
  if (!value || typeof value !== 'object') return false;
  const meal = value as Meal;
  return typeof meal.id === 'string' && typeof meal.name === 'string' && typeof meal.createdAt === 'string' && typeof meal.kcal === 'number' && typeof meal.protein === 'number' && typeof meal.carbs === 'number' && typeof meal.fat === 'number';
}

function isMealArray(value: unknown): value is Meal[] {
  return Array.isArray(value) && value.every(isMeal);
}

function isWaterLog(value: unknown): value is WaterLog {
  return !!value && typeof value === 'object' && typeof (value as WaterLog).date === 'string';
}

function isWaterMap(value: unknown): value is Record<string, WaterLog> {
  return !!value && typeof value === 'object' && !Array.isArray(value) && Object.values(value).every(isWaterLog);
}

function isWorkoutLogArray(value: unknown): value is WorkoutLog[] {
  return Array.isArray(value) && value.every((item) => !!item && typeof item === 'object' && typeof item.id === 'string' && typeof item.completedAt === 'string' && typeof item.durationMin === 'number');
}

function isCustomWorkoutArray(value: unknown): value is CustomWorkout[] {
  return Array.isArray(value) && value.every((item) => !!item && typeof item === 'object' && typeof item.id === 'string' && typeof item.title === 'string' && Array.isArray(item.exercises));
}

function isMealTemplateArray(value: unknown): value is MealTemplate[] {
  return Array.isArray(value) && value.every((item) => !!item && typeof item === 'object' && typeof item.id === 'string' && typeof item.name === 'string' && typeof item.kcal === 'number');
}

function isProgramProgressMap(value: unknown): value is ProgramProgressMap {
  return !!value && typeof value === 'object' && !Array.isArray(value) && Object.values(value).every((entry) => Array.isArray(entry) && entry.every((item) => typeof item === 'string'));
}

function isNotificationPreferences(value: unknown): value is NotificationPreferences {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return ['meal', 'water', 'workout'].every((key) => {
    const item = (value as Record<string, unknown>)[key];
    return !!item && typeof item === 'object' && typeof (item as { enabled?: unknown }).enabled === 'boolean' && typeof (item as { hour?: unknown }).hour === 'number' && typeof (item as { minute?: unknown }).minute === 'number';
  });
}

function isWorkoutSessionDraft(value: unknown): boolean {
  return value === null || (!!value && typeof value === 'object' && typeof (value as { sessionKey?: unknown }).sessionKey === 'string');
}

function isAppPreferences(value: unknown): value is AppPreferences {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const candidate = value as Partial<AppPreferences>;
  const validLanguage = candidate.language === 'auto' || candidate.language === 'tr' || candidate.language === 'en';
  const validUnits = candidate.units === 'auto' || candidate.units === 'metric' || candidate.units === 'imperial';
  return validLanguage && validUnits;
}

function isAIHubAccessState(value: unknown): value is AIHubAccessState {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const candidate = value as Partial<AIHubAccessState> & {
    physiqueTrialsUsed?: unknown;
    lastPhysiqueTrialAt?: unknown;
  };
  if (Array.isArray(candidate.mealUsageTimestamps) && Array.isArray(candidate.physiqueUsageTimestamps)) {
    return candidate.mealUsageTimestamps.every((item) => typeof item === 'string')
      && candidate.physiqueUsageTimestamps.every((item) => typeof item === 'string');
  }
  return typeof candidate.physiqueTrialsUsed === 'number'
    && Number.isFinite(candidate.physiqueTrialsUsed)
    && candidate.physiqueTrialsUsed >= 0
    && (candidate.lastPhysiqueTrialAt === undefined || typeof candidate.lastPhysiqueTrialAt === 'string');
}

function isCycleTrackingRecord(value: unknown): value is CycleTracking {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const candidate = value as Partial<CycleTracking>;
  return (
    (candidate.lastPeriodStartDate == null || typeof candidate.lastPeriodStartDate === 'string') &&
    typeof candidate.updatedAt === 'string' &&
    typeof candidate.cycleLengthDays === 'number' &&
    typeof candidate.periodLengthDays === 'number'
  );
}

function isCoachPreferencesRecord(value: unknown): value is CoachPreferences {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const candidate = value as Partial<CoachPreferences>;
  return Array.isArray(candidate.homeCards) && Array.isArray(candidate.limitations)
    && typeof candidate.adaptiveReminders === 'boolean'
    && ['gym', 'home', 'bodyweight'].includes(candidate.equipment ?? '');
}

function isAIProgramPhysiqueSeedRecord(value: unknown): value is AIProgramPhysiqueSeed {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const candidate = value as Partial<AIProgramPhysiqueSeed>;
  return !!candidate.result && typeof candidate.createdAt === 'string' && candidate.source === 'current_result';
}

function isAIProgramInstanceArray(value: unknown): boolean {
  if (!Array.isArray(value)) return false;
  return value.every((item) => {
    if (!item || typeof item !== 'object') return false;
    const candidate = item as Record<string, unknown>;
    return (
      typeof candidate.id === 'string' &&
      candidate.version === 1 &&
      typeof candidate.title === 'string' &&
      typeof candidate.generatedAt === 'string' &&
      Array.isArray(candidate.weeks)
    );
  });
}

function isSessionFeedbackArray(value: unknown): boolean {
  if (!Array.isArray(value)) return false;
  return value.every((item) => {
    if (!item || typeof item !== 'object') return false;
    const candidate = item as Record<string, unknown>;
    return (
      typeof candidate.id === 'string' &&
      typeof candidate.completedAt === 'string' &&
      typeof candidate.perceivedExertion === 'number' &&
      typeof candidate.averageRir === 'number' &&
      Array.isArray(candidate.painReported)
    );
  });
}

function isCoachAdjustmentArray(value: unknown): boolean {
  if (!Array.isArray(value)) return false;
  return value.every((item) => {
    if (!item || typeof item !== 'object') return false;
    const candidate = item as Record<string, unknown>;
    return (
      typeof candidate.id === 'string' &&
      typeof candidate.createdAt === 'string' &&
      typeof candidate.decision === 'string' &&
      Array.isArray(candidate.reasons) &&
      typeof candidate.title === 'string' &&
      typeof candidate.summary === 'string'
    );
  });
}

function isRewardedCreditRecord(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as {
    dailyRewardCount?: unknown;
    credits?: Record<string, unknown>;
  };
  return (
    typeof candidate.dailyRewardCount === 'number' &&
    !!candidate.credits &&
    typeof candidate.credits.meal_analysis === 'number' &&
    typeof candidate.credits.physique_analysis === 'number'
  );
}

function isUserProgram(value: unknown): value is UserProgram {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<UserProgram>;
  return (
    typeof item.id === 'string' &&
    typeof item.source === 'string' &&
    typeof item.startedAt === 'string'
  );
}

function isUserProgramArray(value: unknown): value is UserProgram[] {
  return Array.isArray(value) && value.every(isUserProgram);
}

const STORAGE_VALIDATORS: Record<StorageRegistryKey, (value: unknown) => boolean> = {
  profile: (value) => value === null || isProfile(value),
  meals: isMealArray,
  water: isWaterMap,
  workouts: isWorkoutLogArray,
  programProgress: isProgramProgressMap,
  customWorkouts: isCustomWorkoutArray,
  notifications: isNotificationPreferences,
  exerciseFavorites: isStringArray,
  programFavorites: isStringArray,
  mealTemplates: isMealTemplateArray,
  mealTemplateFavorites: isStringArray,
  dismissedMealTemplates: isStringArray,
  waterPreferences: (value) => !!value && typeof value === 'object' && typeof (value as { goalMl?: unknown }).goalMl === 'number',
  activeWorkoutSession: isWorkoutSessionDraft,
  preferences: isAppPreferences,
  aiHubAccess: isAIHubAccessState,
  rewardedCredits: isRewardedCreditRecord,
  cycleTracking: isCycleTrackingRecord,
  coachPreferences: isCoachPreferencesRecord,
  aiProgramPhysiqueSeed: (value) => value === null || isAIProgramPhysiqueSeedRecord(value),
  aiProgramInstances: isAIProgramInstanceArray,
  aiProgramFeedback: isSessionFeedbackArray,
  coachAdjustments: isCoachAdjustmentArray,
  userPrograms: isUserProgramArray,
};

export async function loadDataHealth(): Promise<{
  items: DataHealthItem[];
  healthyCount: number;
  recoveredCount: number;
}> {
  const keys = Object.keys(STORAGE_KEYS) as StorageRegistryKey[];
  const inspections = await Promise.all(
    keys.map(async (key) => {
      const snapshot = await inspectStoredValue({
        key: STORAGE_KEYS[key],
        fallback: null,
        validate: STORAGE_VALIDATORS[key] as (value: unknown) => value is null,
      });

      return {
        key,
        label: STORAGE_LABELS[key],
        hasPrimary: snapshot.hasPrimary,
        hasBackup: snapshot.hasBackup,
        isEmpty: snapshot.isEmpty,
        isHealthy: snapshot.isHealthy,
        lastSavedAt: snapshot.meta.lastSavedAt,
        lastRecoveredAt: snapshot.meta.lastRecoveredAt,
      } satisfies DataHealthItem;
    }),
  );

  return {
    items: inspections,
    healthyCount: inspections.filter((item) => item.isHealthy).length,
    recoveredCount: inspections.filter((item) => !!item.lastRecoveredAt).length,
  };
}
