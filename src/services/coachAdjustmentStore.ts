import type { CoachAdjustment } from '@/types/coachAdjustment';
import { loadStoredValue, removeStoredValue, saveStoredValue } from './safeStorage';
import { STORAGE_KEYS } from './storageRegistry';

function isCoachAdjustment(value: unknown): value is CoachAdjustment {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const candidate = value as Partial<CoachAdjustment>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.createdAt === 'string' &&
    typeof candidate.decision === 'string' &&
    Array.isArray(candidate.reasons) &&
    typeof candidate.title === 'string' &&
    typeof candidate.summary === 'string' &&
    typeof candidate.nextSessionFocus === 'string' &&
    (candidate.confidence === 'low' || candidate.confidence === 'medium' || candidate.confidence === 'high') &&
    Array.isArray(candidate.affectedExerciseIds) &&
    Array.isArray(candidate.painReported)
  );
}

function createAdjustmentId(): string {
  return `coach-adjustment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function loadCoachAdjustments(): Promise<CoachAdjustment[]> {
  return loadStoredValue({
    key: STORAGE_KEYS.coachAdjustments,
    fallback: [],
    validate: (value): value is CoachAdjustment[] =>
      Array.isArray(value) && value.every(isCoachAdjustment),
  });
}

export async function saveCoachAdjustment(
  input: Omit<CoachAdjustment, 'id' | 'createdAt'> & { createdAt?: string },
): Promise<CoachAdjustment> {
  const existing = await loadCoachAdjustments();
  const adjustment: CoachAdjustment = {
    ...input,
    id: createAdjustmentId(),
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
  await saveStoredValue(STORAGE_KEYS.coachAdjustments, [adjustment, ...existing].slice(0, 100));
  return adjustment;
}

export async function loadLatestCoachAdjustment(planId?: string): Promise<CoachAdjustment | null> {
  const adjustments = await loadCoachAdjustments();
  const filtered = planId ? adjustments.filter((item) => item.planId === planId) : adjustments;
  return filtered[0] ?? null;
}

export async function clearCoachAdjustments(): Promise<void> {
  await removeStoredValue(STORAGE_KEYS.coachAdjustments);
}
