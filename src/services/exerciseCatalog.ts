import { CSV_EXERCISES } from '@/data/trainingCatalog.generated';
import { FORGE_REVIEWED_EXERCISES } from '@/workout-programming/data/exerciseIdMap';
import type { ExerciseLibraryItem } from '@/types';
import { normalizedText } from './textUtils';

export type SearchableExercise = {
  exercise: ExerciseLibraryItem;
  name: string;
  group: string;
  equipment: string;
  targets: string;
};

let exerciseById: Map<string, ExerciseLibraryItem> | null = null;
let searchableExercises: SearchableExercise[] | null = null;

function buildExerciseCatalog(): ExerciseLibraryItem[] {
  const allExercises = [
    ...CSV_EXERCISES,
    ...FORGE_REVIEWED_EXERCISES,
  ];
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const exercise of allExercises) {
    if (seen.has(exercise.id)) duplicates.add(exercise.id);
    seen.add(exercise.id);
  }
  if (duplicates.size > 0) {
    throw new Error(`Duplicate production exercise IDs: ${[...duplicates].sort((left, right) => left.localeCompare(right)).join(', ')}`);
  }
  return allExercises;
}

const ALL_EXERCISES: ExerciseLibraryItem[] = buildExerciseCatalog();

export function getAllExercises(): ExerciseLibraryItem[] {
  return ALL_EXERCISES;
}

function getExerciseByIdIndex(): Map<string, ExerciseLibraryItem> {
  if (!exerciseById) {
    exerciseById = new Map(ALL_EXERCISES.map((exercise) => [exercise.id, exercise]));
  }

  return exerciseById;
}

export function getSearchableExercises(): SearchableExercise[] {
  if (!searchableExercises) {
    searchableExercises = ALL_EXERCISES.map((exercise) => ({
      exercise,
      name: normalizedText(exercise.displayName),
      group: normalizedText(exercise.muscleGroup),
      equipment: normalizedText(exercise.equipment),
      targets: normalizedText(exercise.targetMuscles.join(' ')),
    }));
  }

  return searchableExercises;
}

export function getExerciseById(id: string | null | undefined): ExerciseLibraryItem | undefined {
  return id ? getExerciseByIdIndex().get(id) : undefined;
}

export function hasExercise(id: string): boolean {
  return getExerciseByIdIndex().has(id);
}

export function searchExercises(query: string): ExerciseLibraryItem[] {
  const normalizedQuery = normalizedText(query).trim();
  if (!normalizedQuery) return ALL_EXERCISES;

  return getSearchableExercises()
    .filter((entry) =>
      entry.name.includes(normalizedQuery)
      || entry.group.includes(normalizedQuery)
      || entry.equipment.includes(normalizedQuery)
      || entry.targets.includes(normalizedQuery))
    .map((entry) => entry.exercise);
}
