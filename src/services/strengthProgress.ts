import type { WorkoutLog, WorkoutSetLogEntry } from '@/types';
import { getExerciseById } from './exerciseCatalog';
import { repairText } from './textUtils';
import { loadWorkoutLogs } from './workoutStore';

export type StrengthRecord = {
  id: string;
  workoutId: string;
  exerciseId: string;
  exerciseName: string;
  completedAt: string;
  kg: number;
  reps: number;
  volumeKg: number;
  estimatedOneRepMaxKg: number;
};

export type ExerciseStrengthProgress = {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  records: StrengthRecord[];
  firstRecord: StrengthRecord;
  latestRecord: StrengthRecord;
  comparisonRecord: StrengthRecord;
  personalRecord: StrengthRecord;
  weightChangeKg: number;
  repChange: number;
  estimatedStrengthChangeKg: number;
  estimatedStrengthChangePct: number;
};

export type StrengthProgressSnapshot = {
  exercises: ExerciseStrengthProgress[];
  totalWorkingSets: number;
  personalRecordCount: number;
};

function estimatedOneRepMax(kg: number, reps: number): number {
  if (reps <= 1) return kg;
  return kg * (1 + reps / 30);
}

function resolveExerciseId(log: WorkoutLog, entry: WorkoutSetLogEntry): string | undefined {
  if (entry.exerciseId) return entry.exerciseId;
  if (log.exerciseId) return log.exerciseId;
  if (log.exerciseIds?.length === 1) return log.exerciseIds[0];
  return undefined;
}

function isBetterRecord(next: StrengthRecord, current: StrengthRecord): boolean {
  if (next.estimatedOneRepMaxKg !== current.estimatedOneRepMaxKg) {
    return next.estimatedOneRepMaxKg > current.estimatedOneRepMaxKg;
  }
  if (next.kg !== current.kg) return next.kg > current.kg;
  return next.reps > current.reps;
}

function buildRecords(logs: WorkoutLog[]): StrengthRecord[] {
  const records: StrengthRecord[] = [];

  for (const log of logs) {
    (log.setEntries ?? []).forEach((entry, index) => {
      if (entry.kind !== 'working' || entry.kg < 0 || entry.reps <= 0) return;
      const exerciseId = resolveExerciseId(log, entry);
      if (!exerciseId) return;
      const exercise = getExerciseById(exerciseId);
      const completedAt = entry.completedAt || log.completedAt;
      records.push({
        id: `${log.id}:${index}`,
        workoutId: log.id,
        exerciseId,
        exerciseName: repairText(exercise?.displayName ?? exercise?.name ?? exerciseId.replaceAll('_', ' ')),
        completedAt,
        kg: entry.kg,
        reps: entry.reps,
        volumeKg: entry.kg * entry.reps,
        estimatedOneRepMaxKg: Math.round(estimatedOneRepMax(entry.kg, entry.reps) * 10) / 10,
      });
    });
  }

  return records;
}

function bestRecordPerWorkout(records: StrengthRecord[]): StrengthRecord[] {
  const bestByWorkout = new Map<string, StrengthRecord>();
  for (const record of records) {
    const current = bestByWorkout.get(record.workoutId);
    if (!current || isBetterRecord(record, current)) bestByWorkout.set(record.workoutId, record);
  }
  return [...bestByWorkout.values()].sort((a, b) => a.completedAt.localeCompare(b.completedAt));
}

export async function loadStrengthProgress(): Promise<StrengthProgressSnapshot> {
  const logs = await loadWorkoutLogs();
  const allRecords = buildRecords(logs);
  const recordsByExercise = new Map<string, StrengthRecord[]>();

  for (const record of allRecords) {
    const current = recordsByExercise.get(record.exerciseId) ?? [];
    current.push(record);
    recordsByExercise.set(record.exerciseId, current);
  }

  const exercises: ExerciseStrengthProgress[] = [];

  for (const [exerciseId, rawRecords] of recordsByExercise) {
    const records = bestRecordPerWorkout(rawRecords);
    if (records.length === 0) continue;
    const firstRecord = records[0];
    const latestRecord = records[records.length - 1];
    const bodyweight = latestRecord.kg === 0;
    const sameRepRecords = records.filter((record) => record.reps === latestRecord.reps);
    const comparisonRecord = bodyweight ? firstRecord : sameRepRecords.length > 1 ? sameRepRecords[0] : firstRecord;
    const personalRecord = records.reduce((best, record) => (isBetterRecord(record, best) ? record : best), records[0]);
    const estimatedStrengthChangeKg = Math.round((latestRecord.estimatedOneRepMaxKg - firstRecord.estimatedOneRepMaxKg) * 10) / 10;
    const estimatedStrengthChangePct = bodyweight
      ? Math.round(((latestRecord.reps - firstRecord.reps) / Math.max(firstRecord.reps, 1)) * 100)
      : firstRecord.estimatedOneRepMaxKg > 0
        ? Math.round((estimatedStrengthChangeKg / firstRecord.estimatedOneRepMaxKg) * 100)
        : 0;
    const exercise = getExerciseById(exerciseId);

    exercises.push({
      exerciseId,
      exerciseName: latestRecord.exerciseName,
      muscleGroup: repairText(exercise?.muscleGroup ?? 'Diğer'),
      records,
      firstRecord,
      latestRecord,
      comparisonRecord,
      personalRecord,
      weightChangeKg: Math.round((latestRecord.kg - comparisonRecord.kg) * 10) / 10,
      repChange: latestRecord.reps - comparisonRecord.reps,
      estimatedStrengthChangeKg,
      estimatedStrengthChangePct,
    });
  }

  exercises.sort((a, b) => b.latestRecord.completedAt.localeCompare(a.latestRecord.completedAt));
  return {
    exercises,
    totalWorkingSets: allRecords.length,
    personalRecordCount: exercises.length,
  };
}
