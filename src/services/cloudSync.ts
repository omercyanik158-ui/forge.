import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadAIProgramInstances } from './aiProgramInstanceStore';
import { loadActiveAIProgramRecord } from './activeAIProgramStore';
import { loadSessionFeedback } from './aiProgramFeedbackStore';
import { loadCoachAdjustments } from './coachAdjustmentStore';
import { loadProgressionDecisions, loadProgressionStates } from '@/workout-programming/progression/progressionDecisionRepository';
import { STORAGE_KEYS } from './storageRegistry';
import { loadSyncMetadata, saveSyncMetadata } from './authStorage';
import { saveStoredValue } from './safeStorage';
import { supabase } from './supabase';
import type {
  CloudSnapshotV1,
  SubscriptionStateRow,
  SubscriptionSummary,
  SyncMetadata,
  SyncResult,
  UserProfileRow,
} from '@/types/auth';
import type { SubscriptionTier, UserProfile } from '@/types';
import type { AIProgramPlan } from '@/types/aiProgramPlan';
import type { SessionFeedback } from '@/types/aiProgramFeedback';
import type { CoachAdjustment } from '@/types/coachAdjustment';

type SnapshotKey = keyof Omit<CloudSnapshotV1, 'version'>;

type RemoteSnapshotRow = {
  user_id: string;
  payload: CloudSnapshotV1;
  version: number;
  last_synced_at: string;
  created_at: string;
  updated_at: string;
};

const SNAPSHOT_VERSION = 1;

const STORAGE_MAPPING: Record<SnapshotKey, string> = {
  profile: STORAGE_KEYS.profile,
  meals: STORAGE_KEYS.meals,
  water: STORAGE_KEYS.water,
  workouts: STORAGE_KEYS.workouts,
  programProgress: STORAGE_KEYS.programProgress,
  customWorkouts: STORAGE_KEYS.customWorkouts,
  notifications: STORAGE_KEYS.notifications,
  exerciseFavorites: STORAGE_KEYS.exerciseFavorites,
  programFavorites: STORAGE_KEYS.programFavorites,
  mealTemplates: STORAGE_KEYS.mealTemplates,
  mealTemplateFavorites: STORAGE_KEYS.mealTemplateFavorites,
  dismissedMealTemplates: STORAGE_KEYS.dismissedMealTemplates,
  waterPreferences: STORAGE_KEYS.waterPreferences,
  activeWorkoutSession: STORAGE_KEYS.activeWorkoutSession,
  preferences: STORAGE_KEYS.preferences,
  aiHubAccess: STORAGE_KEYS.aiHubAccess,
  rewardedCredits: STORAGE_KEYS.rewardedCredits,
  cycleTracking: STORAGE_KEYS.cycleTracking,
  coachPreferences: STORAGE_KEYS.coachPreferences,
  aiProgramPhysiqueSeed: STORAGE_KEYS.aiProgramPhysiqueSeed,
  aiProgramInstances: STORAGE_KEYS.aiProgramInstances,
  activeAIProgram: STORAGE_KEYS.activeAIProgram,
  progressionDecisions: STORAGE_KEYS.progressionDecisions,
  aiProgramFeedback: STORAGE_KEYS.aiProgramFeedback,
  coachAdjustments: STORAGE_KEYS.coachAdjustments,
  userPrograms: STORAGE_KEYS.userPrograms,
};

const DEFAULT_SNAPSHOT: CloudSnapshotV1 = {
  version: SNAPSHOT_VERSION,
  profile: null,
  meals: [],
  water: {},
  workouts: [],
  programProgress: {},
  customWorkouts: [],
  notifications: null,
  exerciseFavorites: [],
  programFavorites: [],
  mealTemplates: [],
  mealTemplateFavorites: [],
  dismissedMealTemplates: [],
  waterPreferences: null,
  activeWorkoutSession: null,
  preferences: null,
  aiHubAccess: null,
  rewardedCredits: null,
  cycleTracking: null,
  coachPreferences: null,
  aiProgramPhysiqueSeed: null,
  aiProgramInstances: [],
  activeAIProgram: null,
  progressionDecisions: { decisions: [], states: [] },
  aiProgramFeedback: [],
  coachAdjustments: [],
  userPrograms: [],
};

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isAIProgramPlan(value: unknown): value is AIProgramPlan {
  return !!value && typeof value === 'object' && !Array.isArray(value)
    && typeof (value as AIProgramPlan).id === 'string'
    && typeof (value as AIProgramPlan).generatedAt === 'string'
    && Array.isArray((value as AIProgramPlan).weeks);
}

function isSessionFeedback(value: unknown): value is SessionFeedback {
  return !!value && typeof value === 'object' && !Array.isArray(value)
    && typeof (value as SessionFeedback).id === 'string'
    && typeof (value as SessionFeedback).completedAt === 'string';
}

function isCoachAdjustment(value: unknown): value is CoachAdjustment {
  return !!value && typeof value === 'object' && !Array.isArray(value)
    && typeof (value as CoachAdjustment).id === 'string'
    && typeof (value as CoachAdjustment).createdAt === 'string';
}

function normalizeTypedArray<T>(items: unknown[] | undefined, guard: (value: unknown) => value is T): T[] {
  return (items ?? []).filter(guard);
}

function decodeEnvelope<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (isObjectRecord(parsed) && parsed.version === 1 && 'value' in parsed) {
      return parsed.value as T;
    }
    return parsed as T;
  } catch {
    return null;
  }
}

function hasMeaningfulValue(value: unknown): boolean {
  if (value == null) return false;
  if (Array.isArray(value)) return value.some(hasMeaningfulValue);
  if (typeof value === 'object') return Object.values(value).some(hasMeaningfulValue);
  return true;
}

function hasMeaningfulData(snapshot: CloudSnapshotV1): boolean {
  return Object.entries(snapshot).some(([key, value]) => {
    if (key === 'version') return false;
    if (key === 'activeAIProgram') {
      const record = isObjectRecord(value) ? value as { activeProgramId?: unknown } : null;
      return typeof record?.activeProgramId === 'string' && record.activeProgramId.length > 0;
    }
    return hasMeaningfulValue(value);
  });
}

function extractTimestamp(value: unknown): string | null {
  if (!isObjectRecord(value)) return null;
  const candidateKeys = ['updatedAt', 'savedAt', 'completedAt', 'createdAt', 'generatedAt', 'startedAt', 'lastSyncedAt'];
  for (const key of candidateKeys) {
    const candidate = value[key];
    if (typeof candidate === 'string' && candidate.length > 0) return candidate;
  }
  return null;
}

function pickLatest<T>(left: T, right: T): T {
  const leftTimestamp = extractTimestamp(left);
  const rightTimestamp = extractTimestamp(right);
  if (!leftTimestamp && !rightTimestamp) return right;
  if (!leftTimestamp) return right;
  if (!rightTimestamp) return left;
  return new Date(leftTimestamp).getTime() >= new Date(rightTimestamp).getTime() ? left : right;
}

function mergeArrayValues(localValue: unknown[], remoteValue: unknown[]): unknown[] {
  if (localValue.every((item) => typeof item === 'string') && remoteValue.every((item) => typeof item === 'string')) {
    return [...new Set([...remoteValue, ...localValue])];
  }

  const merged = new Map<string, unknown>();
  const fallbackItems: unknown[] = [];

  for (const item of [...remoteValue, ...localValue]) {
    if (isObjectRecord(item) && typeof item.id === 'string') {
      const existing = merged.get(item.id);
      merged.set(item.id, existing ? pickLatest(existing, item) : item);
    } else {
      fallbackItems.push(item);
    }
  }

  if (merged.size === 0) {
    return localValue.length > 0 ? localValue : remoteValue;
  }

  return [...merged.values(), ...fallbackItems];
}

function mergeRecordValues(
  localValue: Record<string, unknown>,
  remoteValue: Record<string, unknown>,
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...remoteValue };
  for (const [key, value] of Object.entries(localValue)) {
    const current = merged[key];
    if (current == null) {
      merged[key] = value;
      continue;
    }
    if (isObjectRecord(current) && isObjectRecord(value)) {
      merged[key] = pickLatest(current, value);
      continue;
    }
    merged[key] = value;
  }
  return merged;
}

function mergeProfiles(localProfile: UserProfile | null, remoteProfile: UserProfile | null): UserProfile | null {
  if (!localProfile) return remoteProfile;
  if (!remoteProfile) return localProfile;

  const base = pickLatest(remoteProfile, localProfile);
  return {
    ...base,
    achievements: [...new Set([...(remoteProfile.achievements ?? []), ...(localProfile.achievements ?? [])])],
    streak: pickLatest(remoteProfile.streak ?? null, localProfile.streak ?? null) ?? undefined,
    subscription: remoteProfile.subscription ?? localProfile.subscription,
  };
}

function mergeSnapshot(localSnapshot: CloudSnapshotV1, remoteSnapshot: CloudSnapshotV1): CloudSnapshotV1 {
  const localPrograms = normalizeTypedArray(localSnapshot.aiProgramInstances, isAIProgramPlan);
  const remotePrograms = normalizeTypedArray(remoteSnapshot.aiProgramInstances, isAIProgramPlan);
  const localFeedback = normalizeTypedArray(localSnapshot.aiProgramFeedback, isSessionFeedback);
  const remoteFeedback = normalizeTypedArray(remoteSnapshot.aiProgramFeedback, isSessionFeedback);
  const localAdjustments = normalizeTypedArray(localSnapshot.coachAdjustments, isCoachAdjustment);
  const remoteAdjustments = normalizeTypedArray(remoteSnapshot.coachAdjustments, isCoachAdjustment);
  const localProgression = localSnapshot.progressionDecisions ?? { decisions: [], states: [] };
  const remoteProgression = remoteSnapshot.progressionDecisions ?? { decisions: [], states: [] };
  return {
    version: SNAPSHOT_VERSION,
    profile: mergeProfiles(localSnapshot.profile, remoteSnapshot.profile),
    meals: mergeArrayValues(localSnapshot.meals, remoteSnapshot.meals) as CloudSnapshotV1['meals'],
    water: mergeRecordValues(localSnapshot.water, remoteSnapshot.water) as CloudSnapshotV1['water'],
    workouts: mergeArrayValues(localSnapshot.workouts, remoteSnapshot.workouts) as CloudSnapshotV1['workouts'],
    programProgress: mergeRecordValues(localSnapshot.programProgress, remoteSnapshot.programProgress) as CloudSnapshotV1['programProgress'],
    customWorkouts: mergeArrayValues(localSnapshot.customWorkouts, remoteSnapshot.customWorkouts) as CloudSnapshotV1['customWorkouts'],
    notifications: (remoteSnapshot.notifications ?? localSnapshot.notifications),
    exerciseFavorites: mergeArrayValues(localSnapshot.exerciseFavorites, remoteSnapshot.exerciseFavorites) as CloudSnapshotV1['exerciseFavorites'],
    programFavorites: mergeArrayValues(localSnapshot.programFavorites, remoteSnapshot.programFavorites) as CloudSnapshotV1['programFavorites'],
    mealTemplates: mergeArrayValues(localSnapshot.mealTemplates, remoteSnapshot.mealTemplates) as CloudSnapshotV1['mealTemplates'],
    mealTemplateFavorites: mergeArrayValues(localSnapshot.mealTemplateFavorites, remoteSnapshot.mealTemplateFavorites) as CloudSnapshotV1['mealTemplateFavorites'],
    dismissedMealTemplates: mergeArrayValues(localSnapshot.dismissedMealTemplates, remoteSnapshot.dismissedMealTemplates) as CloudSnapshotV1['dismissedMealTemplates'],
    waterPreferences: (pickLatest(remoteSnapshot.waterPreferences, localSnapshot.waterPreferences) ?? remoteSnapshot.waterPreferences ?? localSnapshot.waterPreferences),
    activeWorkoutSession: (pickLatest(remoteSnapshot.activeWorkoutSession, localSnapshot.activeWorkoutSession) ?? remoteSnapshot.activeWorkoutSession ?? localSnapshot.activeWorkoutSession),
    preferences: remoteSnapshot.preferences ?? localSnapshot.preferences,
    aiHubAccess: (pickLatest(remoteSnapshot.aiHubAccess, localSnapshot.aiHubAccess) ?? remoteSnapshot.aiHubAccess ?? localSnapshot.aiHubAccess),
    rewardedCredits: (pickLatest(remoteSnapshot.rewardedCredits, localSnapshot.rewardedCredits) ?? remoteSnapshot.rewardedCredits ?? localSnapshot.rewardedCredits),
    cycleTracking: (pickLatest(remoteSnapshot.cycleTracking, localSnapshot.cycleTracking) ?? remoteSnapshot.cycleTracking ?? localSnapshot.cycleTracking),
    coachPreferences: (pickLatest(remoteSnapshot.coachPreferences, localSnapshot.coachPreferences) ?? remoteSnapshot.coachPreferences ?? localSnapshot.coachPreferences),
    aiProgramPhysiqueSeed: (pickLatest(remoteSnapshot.aiProgramPhysiqueSeed, localSnapshot.aiProgramPhysiqueSeed) ?? remoteSnapshot.aiProgramPhysiqueSeed ?? localSnapshot.aiProgramPhysiqueSeed),
    aiProgramInstances: mergeArrayValues(localPrograms, remotePrograms) as CloudSnapshotV1['aiProgramInstances'],
    activeAIProgram: (pickLatest(remoteSnapshot.activeAIProgram, localSnapshot.activeAIProgram) ?? remoteSnapshot.activeAIProgram ?? localSnapshot.activeAIProgram),
    progressionDecisions: {
      decisions: mergeArrayValues(localProgression.decisions, remoteProgression.decisions) as typeof localProgression.decisions,
      states: mergeArrayValues(localProgression.states, remoteProgression.states) as typeof localProgression.states,
    },
    aiProgramFeedback: mergeArrayValues(localFeedback, remoteFeedback) as CloudSnapshotV1['aiProgramFeedback'],
    coachAdjustments: mergeArrayValues(localAdjustments, remoteAdjustments) as CloudSnapshotV1['coachAdjustments'],
    userPrograms: mergeArrayValues(localSnapshot.userPrograms, remoteSnapshot.userPrograms) as CloudSnapshotV1['userPrograms'],
  };
}

export async function exportLocalSnapshot(): Promise<CloudSnapshotV1> {
  const entries = await Promise.all(
    Object.entries(STORAGE_MAPPING).map(async ([snapshotKey, storageKey]) => {
      const value = decodeEnvelope(await AsyncStorage.getItem(storageKey));
      return [snapshotKey, value] as const;
    }),
  );

  const [aiProgramInstances, activeAIProgram, progressionDecisions, progressionStates, aiProgramFeedback, coachAdjustments] = await Promise.all([
    loadAIProgramInstances(),
    loadActiveAIProgramRecord(),
    loadProgressionDecisions(),
    loadProgressionStates(),
    loadSessionFeedback(),
    loadCoachAdjustments(),
  ]);

  const baseSnapshot = entries.reduce<CloudSnapshotV1>(
    (snapshot, [snapshotKey, value]) => ({
      ...snapshot,
      [snapshotKey]: value ?? DEFAULT_SNAPSHOT[snapshotKey as SnapshotKey],
    }),
    { ...DEFAULT_SNAPSHOT },
  );

  return {
    ...baseSnapshot,
    aiProgramInstances,
    activeAIProgram,
    progressionDecisions: { decisions: progressionDecisions, states: progressionStates },
    aiProgramFeedback,
    coachAdjustments,
  };
}

export async function importLocalSnapshot(snapshot: CloudSnapshotV1): Promise<void> {
  await Promise.all(
    (Object.keys(STORAGE_MAPPING) as SnapshotKey[]).map((snapshotKey) =>
      saveStoredValue(STORAGE_MAPPING[snapshotKey], snapshot[snapshotKey]),
    ),
  );
}

export async function upsertUserProfileRow(
  userId: string,
  profile: UserProfile | null,
  tier: SubscriptionTier,
): Promise<UserProfileRow | null> {
  if (!supabase) return null;

  const payload = {
    id: userId,
    full_name: profile?.name ?? null,
    avatar_url: null,
    subscription_tier: tier,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(payload)
    .select()
    .single();

  if (error) throw error;
  return data as UserProfileRow;
}

export async function upsertSubscriptionState(
  userId: string,
  summary: SubscriptionSummary,
): Promise<SubscriptionStateRow | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('subscription_state')
    .upsert({
      user_id: userId,
      revenuecat_app_user_id: summary.appUserId,
      entitlement_active: summary.entitlementActive,
      entitlement_id: summary.entitlementId ?? null,
      product_id: summary.productId ?? null,
      expires_at: summary.expiresAt ?? null,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data as SubscriptionStateRow;
}

export async function loadRemoteSnapshot(userId: string): Promise<CloudSnapshotV1 | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('user_snapshots')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;

  const row = data as RemoteSnapshotRow | null;
  if (!row?.payload) return null;
  return {
    ...DEFAULT_SNAPSHOT,
    ...row.payload,
    version: SNAPSHOT_VERSION,
  };
}

export async function saveRemoteSnapshot(userId: string, snapshot: CloudSnapshotV1): Promise<void> {
  if (!supabase) return;

  const now = new Date().toISOString();
  const { error } = await supabase.from('user_snapshots').upsert({
    user_id: userId,
    payload: snapshot,
    version: SNAPSHOT_VERSION,
    last_synced_at: now,
    updated_at: now,
  });

  if (error) throw error;
}

export async function syncUserData(userId: string): Promise<SyncResult> {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const previousMetadata = await loadSyncMetadata();
  const attemptedAt = new Date().toISOString();
  await saveSyncMetadata({
    ...previousMetadata,
    version: 1,
    lastAttemptedAt: attemptedAt,
    lastSyncedUserId: userId,
  });

  const [localSnapshot, remoteSnapshot] = await Promise.all([
    exportLocalSnapshot(),
    loadRemoteSnapshot(userId),
  ]);

  let nextSnapshot = localSnapshot;
  let source: SyncMetadata['migrationSource'] = 'local_seed';

  if (!remoteSnapshot || !hasMeaningfulData(remoteSnapshot)) {
    nextSnapshot = localSnapshot;
    source = 'local_seed';
  } else if (!hasMeaningfulData(localSnapshot)) {
    nextSnapshot = remoteSnapshot;
    source = 'remote_hydration';
  } else {
    nextSnapshot = mergeSnapshot(localSnapshot, remoteSnapshot);
    source = 'merged';
  }

  await importLocalSnapshot(nextSnapshot);
  await saveRemoteSnapshot(userId, nextSnapshot);
  await upsertUserProfileRow(
    userId,
    nextSnapshot.profile,
    nextSnapshot.profile?.subscription ?? 'free',
  );

  const syncedAt = new Date().toISOString();
  await saveSyncMetadata({
    version: 1,
    lastAttemptedAt: attemptedAt,
    lastSuccessfulAt: syncedAt,
    lastSyncedUserId: userId,
    migrationSource: source,
  });

  return {
    source,
    syncedAt,
    snapshot: nextSnapshot,
  };
}
