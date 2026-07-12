import type { AIProgramPlan } from '@/types/aiProgramPlan';
import { loadStoredValue, removeStoredValue, saveStoredValue } from './safeStorage';
import { STORAGE_KEYS } from './storageRegistry';

function isAIProgramPlan(value: unknown): value is AIProgramPlan {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const candidate = value as Partial<AIProgramPlan>;
  return (
    typeof candidate.id === 'string' &&
    candidate.version === 1 &&
    typeof candidate.title === 'string' &&
    typeof candidate.generatedAt === 'string' &&
    typeof candidate.daysPerWeek === 'number' &&
    typeof candidate.weekCount === 'number' &&
    Array.isArray(candidate.weeks) &&
    !!candidate.explanation &&
    typeof candidate.explanation === 'object' &&
    !!candidate.validation &&
    typeof candidate.validation === 'object'
  );
}

export async function loadAIProgramInstances(): Promise<AIProgramPlan[]> {
  return loadStoredValue({
    key: STORAGE_KEYS.aiProgramInstances,
    fallback: [],
    validate: (value): value is AIProgramPlan[] =>
      Array.isArray(value) && value.every(isAIProgramPlan),
  });
}

export async function saveAIProgramInstance(plan: AIProgramPlan): Promise<AIProgramPlan[]> {
  const existing = await loadAIProgramInstances();
  const deduped = existing.filter((item) => item.id !== plan.id);
  const next = [plan, ...deduped];
  await saveStoredValue(STORAGE_KEYS.aiProgramInstances, next);
  return next;
}

export async function deleteAIProgramInstance(id: string): Promise<AIProgramPlan[]> {
  const existing = await loadAIProgramInstances();
  const next = existing.filter((item) => item.id !== id);
  await saveStoredValue(STORAGE_KEYS.aiProgramInstances, next);
  return next;
}

export async function loadAIProgramInstanceById(id: string): Promise<AIProgramPlan | null> {
  const instances = await loadAIProgramInstances();
  return instances.find((item) => item.id === id) ?? null;
}

export async function clearAIProgramInstances(): Promise<void> {
  await removeStoredValue(STORAGE_KEYS.aiProgramInstances);
}
