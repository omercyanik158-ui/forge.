import type { ProgramDay } from "./programCatalog";
import {
  loadStoredValue,
  removeStoredValue,
  saveStoredValue,
} from "./safeStorage";
import { STORAGE_KEYS } from "./storageRegistry";

export type ProgramProgressMap = Record<string, string[]>;

/** AI programlarının ilerlemesi library programlarıyla aynı map'te, ayrı bir anahtar öneki altında saklanır. */
function aiProgressKey(aiProgramId: string): string {
  return `ai:${aiProgramId}`;
}

function isProgramProgressMap(value: unknown): value is ProgramProgressMap {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.values(value).every(
      (entry) =>
        Array.isArray(entry) && entry.every((item) => typeof item === "string"),
    )
  );
}

async function loadAllProgress(): Promise<ProgramProgressMap> {
  return loadStoredValue<ProgramProgressMap>({
    key: STORAGE_KEYS.programProgress,
    fallback: {},
    validate: isProgramProgressMap,
  });
}

async function saveAllProgress(progress: ProgramProgressMap): Promise<void> {
  await saveStoredValue(STORAGE_KEYS.programProgress, progress);
}

async function markDayComplete(
  key: string,
  dayId: string,
): Promise<string[]> {
  const all = await loadAllProgress();
  const current = new Set(all[key] ?? []);

  if (!current.has(dayId)) {
    current.add(dayId);
    all[key] = [...current];
    await saveAllProgress(all);
  }

  return all[key] ?? [...current];
}

export async function loadProgramProgress(
  programId: string,
): Promise<string[]> {
  const all = await loadAllProgress();
  return all[programId] ?? [];
}

export async function loadAllProgramProgress(): Promise<ProgramProgressMap> {
  return loadAllProgress();
}

export async function completeProgramDay(
  programId: string,
  day: ProgramDay,
): Promise<string[]> {
  return markDayComplete(programId, day.id);
}

export async function loadAIProgramProgress(
  aiProgramId: string,
): Promise<string[]> {
  return loadProgramProgress(aiProgressKey(aiProgramId));
}

export async function completeAIProgramDay(
  aiProgramId: string,
  dayId: string,
): Promise<string[]> {
  return markDayComplete(aiProgressKey(aiProgramId), dayId);
}

export async function clearProgramProgress(): Promise<void> {
  await removeStoredValue(STORAGE_KEYS.programProgress);
}
