import type { WorkoutLog } from '@/types';
import { isSameDateKey, localDateKeyFromIso, weekStartKey } from './dateUtils';
import { loadStoredValue, removeStoredValue, saveStoredValue } from './safeStorage';
import { STORAGE_KEYS } from './storageRegistry';

function isWorkoutLog(value: unknown): value is WorkoutLog {
  return !!value && typeof value === 'object' && typeof (value as WorkoutLog).id === 'string' && typeof (value as WorkoutLog).completedAt === 'string';
}

function isWorkoutLogArray(value: unknown): value is WorkoutLog[] {
  return Array.isArray(value) && value.every(isWorkoutLog);
}

async function persistWorkoutLogs(logs: WorkoutLog[]): Promise<WorkoutLog[]> {
  await saveStoredValue(STORAGE_KEYS.workouts, logs);
  return logs;
}

export async function loadWorkoutLogs(): Promise<WorkoutLog[]> {
  return loadStoredValue<WorkoutLog[]>({
    key: STORAGE_KEYS.workouts,
    fallback: [],
    validate: isWorkoutLogArray,
  });
}

export async function saveWorkoutLog(log: WorkoutLog): Promise<WorkoutLog[]> {
  const logs = await loadWorkoutLogs();
  return persistWorkoutLogs([log, ...logs]);
}

export async function loadWorkoutLogById(id: string): Promise<WorkoutLog | null> {
  const logs = await loadWorkoutLogs();
  return logs.find((log) => log.id === id) ?? null;
}

export async function updateWorkoutLog(updatedLog: WorkoutLog): Promise<WorkoutLog[]> {
  const logs = await loadWorkoutLogs();
  return persistWorkoutLogs(logs.map((log) => (log.id === updatedLog.id ? updatedLog : log)));
}

export async function deleteWorkoutLog(id: string): Promise<WorkoutLog[]> {
  const logs = await loadWorkoutLogs();
  return persistWorkoutLogs(logs.filter((log) => log.id !== id));
}

export async function replaceWorkoutLogs(logs: WorkoutLog[]): Promise<WorkoutLog[]> {
  return persistWorkoutLogs(logs);
}

export async function loadWorkoutLogsForDate(date: string): Promise<WorkoutLog[]> {
  const logs = await loadWorkoutLogs();
  return logs.filter((log) => isSameDateKey(log.completedAt, date));
}

export async function weeklyWorkoutSummary(): Promise<{ count: number; minutes: number; kcal: number }> {
  const logs = await loadWorkoutLogs();
  const weekStart = weekStartKey();
  const today = localDateKeyFromIso(new Date().toISOString());
  const weekLogs = logs.filter((log) => {
    const key = localDateKeyFromIso(log.completedAt);
    return key >= weekStart && key <= today;
  });
  return weekLogs.reduce(
    (acc, log) => ({
      count: acc.count + 1,
      minutes: acc.minutes + log.durationMin,
      kcal: acc.kcal + log.kcal,
    }),
    { count: 0, minutes: 0, kcal: 0 },
  );
}

export async function clearWorkoutLogs(): Promise<void> {
  await removeStoredValue(STORAGE_KEYS.workouts);
}
