import { loadStoredValue, removeStoredValue, saveStoredValue } from './safeStorage';
import { STORAGE_KEYS } from './storageRegistry';

export type UserProgramSource = 'library';

export type UserProgram = {
  id: string;
  source: UserProgramSource;
  startedAt: string;
};

function isUserProgram(value: unknown): value is UserProgram {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<UserProgram>;
  return (
    typeof item.id === 'string' &&
    typeof item.source === 'string' &&
    typeof item.startedAt === 'string'
  );
}

function isUserProgramList(value: unknown): value is UserProgram[] {
  return Array.isArray(value) && value.every(isUserProgram);
}

export async function loadUserPrograms(): Promise<UserProgram[]> {
  const programs = await loadStoredValue({
    key: STORAGE_KEYS.userPrograms,
    fallback: [] as UserProgram[],
    validate: isUserProgramList,
  });
  return programs.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export async function addUserProgram(programId: string): Promise<UserProgram[]> {
  const current = await loadUserPrograms();
  const now = new Date().toISOString();
  const program: UserProgram = {
    id: programId,
    source: 'library',
    startedAt: now,
  };
  const existing = current.find((p) => p.id === programId);
  if (existing) {
    return current;
  }
  const next = [program, ...current];
  await saveStoredValue(STORAGE_KEYS.userPrograms, next);
  return next;
}

export async function removeUserProgram(programId: string): Promise<UserProgram[]> {
  const next = (await loadUserPrograms()).filter((program) => program.id !== programId);
  await saveStoredValue(STORAGE_KEYS.userPrograms, next);
  return next;
}

export async function clearUserPrograms(): Promise<void> {
  await removeStoredValue(STORAGE_KEYS.userPrograms);
}
