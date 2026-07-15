import { CSV_EXERCISES } from '@/data/trainingCatalog.generated';
import { FORGE_REVIEWED_EXERCISES } from '@/workout-programming/data/exerciseIdMap';
import { FORGE_REVIEWED_EXERCISES_300 } from '@/workout-programming/data/exerciseIdMap300';
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

const ALL_EXERCISES: ExerciseLibraryItem[] = [
  ...CSV_EXERCISES,
  ...FORGE_REVIEWED_EXERCISES,
  ...FORGE_REVIEWED_EXERCISES_300,
];

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
