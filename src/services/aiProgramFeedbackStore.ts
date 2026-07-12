import type { SessionFeedback } from '@/types/aiProgramFeedback';
import { loadStoredValue, removeStoredValue, saveStoredValue } from './safeStorage';
import { STORAGE_KEYS } from './storageRegistry';

function isSessionFeedback(value: unknown): value is SessionFeedback {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const candidate = value as Partial<SessionFeedback>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.completedAt === 'string' &&
    typeof candidate.perceivedExertion === 'number' &&
    typeof candidate.averageRir === 'number' &&
    Array.isArray(candidate.painReported) &&
    (candidate.recoveryNextDay === 'poor' || candidate.recoveryNextDay === 'okay' || candidate.recoveryNextDay === 'good')
  );
}

function createFeedbackId(): string {
  return `feedback-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function loadSessionFeedback(): Promise<SessionFeedback[]> {
  return loadStoredValue({
    key: STORAGE_KEYS.aiProgramFeedback,
    fallback: [],
    validate: (value): value is SessionFeedback[] =>
      Array.isArray(value) && value.every(isSessionFeedback),
  });
}

export async function saveSessionFeedback(input: Omit<SessionFeedback, 'id'>): Promise<SessionFeedback> {
  const existing = await loadSessionFeedback();
  const feedback: SessionFeedback = { ...input, id: createFeedbackId() };
  const next = [feedback, ...existing];
  await saveStoredValue(STORAGE_KEYS.aiProgramFeedback, next);
  return feedback;
}

export async function deleteSessionFeedback(id: string): Promise<SessionFeedback[]> {
  const existing = await loadSessionFeedback();
  const next = existing.filter((item) => item.id !== id);
  await saveStoredValue(STORAGE_KEYS.aiProgramFeedback, next);
  return next;
}

export async function loadFeedbackForPlan(planId: string): Promise<SessionFeedback[]> {
  const all = await loadSessionFeedback();
  return all.filter((item) => item.planId === planId);
}

export async function clearSessionFeedback(): Promise<void> {
  await removeStoredValue(STORAGE_KEYS.aiProgramFeedback);
}
