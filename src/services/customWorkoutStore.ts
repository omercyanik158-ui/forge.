import { loadStoredValue, removeStoredValue, saveStoredValue } from './safeStorage';
import { STORAGE_KEYS } from './storageRegistry';

export type CustomWorkoutExercise = {
  exerciseId: string;
  sets: number;
  reps: number;
  weightKg?: number;
};

export type CustomWorkout = {
  id: string;
  title: string;
  note?: string;
  exercises: CustomWorkoutExercise[];
  createdAt: string;
  updatedAt: string;
};

function isCustomWorkoutExercise(value: unknown): value is CustomWorkoutExercise {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<CustomWorkoutExercise>;
  return (
    typeof item.exerciseId === 'string' &&
    typeof item.sets === 'number' &&
    typeof item.reps === 'number' &&
    (item.weightKg == null || typeof item.weightKg === 'number')
  );
}

function isCustomWorkout(value: unknown): value is CustomWorkout {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<CustomWorkout>;
  return (
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    typeof item.createdAt === 'string' &&
    typeof item.updatedAt === 'string' &&
    Array.isArray(item.exercises) &&
    item.exercises.every(isCustomWorkoutExercise)
  );
}

function isCustomWorkoutList(value: unknown): value is CustomWorkout[] {
  return Array.isArray(value) && value.every(isCustomWorkout);
}

function normalizeExercises(exercises: CustomWorkoutExercise[]): CustomWorkoutExercise[] {
  return exercises
    .filter((exercise) => exercise.exerciseId.trim().length > 0)
    .map((exercise) => ({
      exerciseId: exercise.exerciseId,
      sets: Math.max(1, Math.round(exercise.sets)),
      reps: Math.max(1, Math.round(exercise.reps)),
      ...(exercise.weightKg != null && Number.isFinite(exercise.weightKg)
        ? { weightKg: Math.max(0, Math.round(exercise.weightKg * 10) / 10) }
        : {}),
    }));
}

export async function loadCustomWorkouts(): Promise<CustomWorkout[]> {
  const workouts = await loadStoredValue({
    key: STORAGE_KEYS.customWorkouts,
    fallback: [] as CustomWorkout[],
    validate: isCustomWorkoutList,
  });
  return workouts.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getCustomWorkoutById(id: string): Promise<CustomWorkout | null> {
  return (await loadCustomWorkouts()).find((workout) => workout.id === id) ?? null;
}

export async function saveCustomWorkout(input: {
  title: string;
  note?: string;
  exercises: CustomWorkoutExercise[];
}): Promise<CustomWorkout[]> {
  const current = await loadCustomWorkouts();
  const now = new Date().toISOString();
  const workout: CustomWorkout = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: input.title.trim(),
    note: input.note?.trim(),
    exercises: normalizeExercises(input.exercises),
    createdAt: now,
    updatedAt: now,
  };
  const next = [workout, ...current];
  await saveStoredValue(STORAGE_KEYS.customWorkouts, next);
  return next;
}

export async function updateCustomWorkout(
  id: string,
  input: {
    title: string;
    note?: string;
    exercises: CustomWorkoutExercise[];
  },
): Promise<CustomWorkout[]> {
  const current = await loadCustomWorkouts();
  const now = new Date().toISOString();
  const next = current.map((workout) =>
    workout.id === id
      ? {
          ...workout,
          title: input.title.trim(),
          note: input.note?.trim(),
          exercises: normalizeExercises(input.exercises),
          updatedAt: now,
        }
      : workout,
  );
  await saveStoredValue(STORAGE_KEYS.customWorkouts, next);
  return next.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function updateCustomWorkoutTitle(id: string, title: string): Promise<CustomWorkout[]> {
  const cleanTitle = title.trim();
  if (!cleanTitle) return loadCustomWorkouts();

  const current = await loadCustomWorkouts();
  const now = new Date().toISOString();
  const next = current.map((workout) =>
    workout.id === id
      ? {
          ...workout,
          title: cleanTitle,
          updatedAt: now,
        }
      : workout,
  );
  await saveStoredValue(STORAGE_KEYS.customWorkouts, next);
  return next.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function deleteCustomWorkout(id: string): Promise<CustomWorkout[]> {
  const next = (await loadCustomWorkouts()).filter((workout) => workout.id !== id);
  await saveStoredValue(STORAGE_KEYS.customWorkouts, next);
  return next;
}

export async function clearCustomWorkouts(): Promise<void> {
  await removeStoredValue(STORAGE_KEYS.customWorkouts);
}
