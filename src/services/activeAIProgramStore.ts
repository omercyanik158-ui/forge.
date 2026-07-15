import type { AIProgramPlan } from '@/types/aiProgramPlan';
import { loadAIProgramInstances, loadAIProgramInstanceById } from './aiProgramInstanceStore';
import { loadStoredValue, removeStoredValue, saveStoredValue } from './safeStorage';
import { STORAGE_KEYS } from './storageRegistry';

export type ActiveAIProgramRecord = {
  activeProgramId: string | null;
  updatedAt: string;
};

function isActiveAIProgramRecord(value: unknown): value is ActiveAIProgramRecord {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<ActiveAIProgramRecord>;
  return (
    (candidate.activeProgramId === null || typeof candidate.activeProgramId === 'string') &&
    typeof candidate.updatedAt === 'string'
  );
}

export async function loadActiveAIProgramRecord(): Promise<ActiveAIProgramRecord> {
  return loadStoredValue({
    key: STORAGE_KEYS.activeAIProgram,
    fallback: { activeProgramId: null, updatedAt: '1970-01-01T00:00:00.000Z' },
    validate: isActiveAIProgramRecord,
  });
}

export async function setActiveAIProgramId(programId: string | null): Promise<ActiveAIProgramRecord> {
  const record: ActiveAIProgramRecord = {
    activeProgramId: programId,
    updatedAt: new Date().toISOString(),
  };
  await saveStoredValue(STORAGE_KEYS.activeAIProgram, record);
  return record;
}

export async function clearActiveAIProgram(): Promise<void> {
  await removeStoredValue(STORAGE_KEYS.activeAIProgram);
}

export async function loadActiveAIProgram(): Promise<AIProgramPlan | null> {
  const record = await loadActiveAIProgramRecord();
  if (record.activeProgramId) {
    const explicit = await loadAIProgramInstanceById(record.activeProgramId);
    if (explicit) return explicit;
  }
  if (record.updatedAt !== '1970-01-01T00:00:00.000Z') return null;

  const instances = await loadAIProgramInstances();
  return [...instances].sort((left, right) => right.generatedAt.localeCompare(left.generatedAt))[0] ?? null;
}
