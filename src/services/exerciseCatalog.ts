import { EXERCISES } from '@/data/exercises';
import type { ExerciseLibraryItem } from '@/types';
import { normalizedText } from './textUtils';

export type SearchableExercise = {
  exercise: ExerciseLibraryItem;
  name: string;
  group: string;
  equipment: string;
  targets: string;
};

const EXERCISE_BY_ID = new Map(EXERCISES.map((exercise) => [exercise.id, exercise]));

export const SEARCHABLE_EXERCISES: SearchableExercise[] = EXERCISES.map((exercise) => ({
  exercise,
  name: normalizedText(exercise.displayName),
  group: normalizedText(exercise.muscleGroup),
  equipment: normalizedText(exercise.equipment),
  targets: normalizedText(exercise.targetMuscles.join(' ')),
}));

export function getExerciseById(id: string | null | undefined): ExerciseLibraryItem | undefined {
  return id ? EXERCISE_BY_ID.get(id) : undefined;
}

export function hasExercise(id: string): boolean {
  return EXERCISE_BY_ID.has(id);
}

export function searchExercises(query: string): ExerciseLibraryItem[] {
  const normalizedQuery = normalizedText(query).trim();
  if (!normalizedQuery) return EXERCISES;

  return SEARCHABLE_EXERCISES
    .filter((entry) =>
      entry.name.includes(normalizedQuery)
      || entry.group.includes(normalizedQuery)
      || entry.equipment.includes(normalizedQuery)
      || entry.targets.includes(normalizedQuery))
    .map((entry) => entry.exercise);
}
