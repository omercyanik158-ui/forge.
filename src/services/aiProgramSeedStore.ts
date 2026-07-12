import type { AIProgramPhysiqueSeed } from '@/types/aiProgram';
import { loadStoredValue, removeStoredValue, saveStoredValue } from './safeStorage';
import { STORAGE_KEYS } from './storageRegistry';

function isAIProgramPhysiqueSeed(value: unknown): value is AIProgramPhysiqueSeed {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const candidate = value as Partial<AIProgramPhysiqueSeed>;
  return (
    !!candidate.result &&
    typeof candidate.result === 'object' &&
    typeof candidate.createdAt === 'string' &&
    candidate.source === 'current_result'
  );
}

export async function loadAIProgramPhysiqueSeed(): Promise<AIProgramPhysiqueSeed | null> {
  return loadStoredValue({
    key: STORAGE_KEYS.aiProgramPhysiqueSeed,
    fallback: null,
    validate: (value): value is AIProgramPhysiqueSeed | null => value === null || isAIProgramPhysiqueSeed(value),
  });
}

export async function saveAIProgramPhysiqueSeed(seed: AIProgramPhysiqueSeed): Promise<void> {
  await saveStoredValue(STORAGE_KEYS.aiProgramPhysiqueSeed, seed);
}

export async function clearAIProgramPhysiqueSeed(): Promise<void> {
  await removeStoredValue(STORAGE_KEYS.aiProgramPhysiqueSeed);
}
