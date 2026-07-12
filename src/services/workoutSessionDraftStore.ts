import { loadStoredValue, removeStoredValue, saveStoredValue } from './safeStorage';
import { STORAGE_KEYS } from './storageRegistry';

export type WorkoutSessionDraftSet = {
  key: string;
  exerciseId: string;
  order: number;
  kg: string;
  reps: string;
  done: boolean;
};

export type WorkoutSessionDraft = {
  sessionKey: string;
  activeIndex: number;
  sets: WorkoutSessionDraftSet[];
  savedAt: string;
};

function isDraft(value: unknown): value is WorkoutSessionDraft {
  if (!value || typeof value !== 'object') return false;
  const draft = value as Partial<WorkoutSessionDraft>;
  return typeof draft.sessionKey === 'string' && typeof draft.activeIndex === 'number' && typeof draft.savedAt === 'string' && Array.isArray(draft.sets);
}

export async function loadWorkoutSessionDraft(sessionKey: string): Promise<WorkoutSessionDraft | null> {
  const draft = await loadStoredValue<WorkoutSessionDraft | null>({ key: STORAGE_KEYS.activeWorkoutSession, fallback: null, validate: (value): value is WorkoutSessionDraft | null => value === null || isDraft(value) });
  if (!draft || draft.sessionKey !== sessionKey) return null;
  const ageMs = Date.now() - new Date(draft.savedAt).getTime();
  if (!Number.isFinite(ageMs) || ageMs > 24 * 60 * 60 * 1000) {
    await clearWorkoutSessionDraft();
    return null;
  }
  return draft;
}

export async function saveWorkoutSessionDraft(sessionKey: string, sets: WorkoutSessionDraftSet[], activeIndex: number): Promise<void> {
  await saveStoredValue(STORAGE_KEYS.activeWorkoutSession, { sessionKey, sets, activeIndex, savedAt: new Date().toISOString() } satisfies WorkoutSessionDraft);
}

export async function clearWorkoutSessionDraft(): Promise<void> {
  await removeStoredValue(STORAGE_KEYS.activeWorkoutSession);
}
