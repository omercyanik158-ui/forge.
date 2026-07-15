import type { ForgeGeneratedExercise, ForgeGeneratedTemplate, ForgeGeneratedWorkoutDay } from '@/workout-programming/types/csvWorkoutBrain';
import { normalizeFocusMuscleValue, type CanonicalFocusMuscle } from '../adaptation/physiqueFocusRules';

type OrderedExercise = ForgeGeneratedExercise & {
  order: number;
};

type OrderableWorkoutDay<TExercise extends ForgeGeneratedExercise = ForgeGeneratedExercise> = Omit<ForgeGeneratedWorkoutDay, 'exercises'> & {
  exercises: TExercise[];
};

const ROLE_RANK: Record<string, number> = {
  main_lift: 0,
  secondary_compound: 1,
  accessory_compound: 2,
  isolation: 3,
  core: 4,
  conditioning: 5,
};

const BLOCK_RANK: Record<string, number> = {
  legs: 0,
  chest: 1,
  back: 2,
  shoulders: 3,
  biceps: 4,
  triceps: 5,
  core: 6,
  conditioning: 7,
  other: 8,
};

const PRIORITY_STRENGTH_LIFTS = new Set([
  'back_squat',
  'front_squat',
  'bench_press',
  'paused_bench_press',
  'conventional_deadlift',
  'trap_bar_deadlift',
  'romanian_deadlift',
  'overhead_press',
]);

function blockForExercise(exercise: ForgeGeneratedExercise): string {
  if (exercise.role === 'conditioning' || exercise.movementPattern === 'loaded_carry') return 'conditioning';
  if (exercise.role === 'core' || exercise.primaryMuscles.includes('core')) return 'core';
  if (exercise.primaryMuscles.some((muscle) => ['quads', 'hamstrings', 'glutes', 'calves'].includes(muscle))) return 'legs';
  if (exercise.primaryMuscles.some((muscle) => ['chest', 'upper_chest'].includes(muscle))) return 'chest';
  if (exercise.primaryMuscles.some((muscle) => ['lats', 'upper_back', 'back', 'traps'].includes(muscle))) return 'back';
  if (exercise.primaryMuscles.some((muscle) => ['front_delts', 'side_delts', 'rear_delts'].includes(muscle))) return 'shoulders';
  if (exercise.primaryMuscles.some((muscle) => ['biceps', 'forearms'].includes(muscle))) return 'biceps';
  if (exercise.primaryMuscles.includes('triceps')) return 'triceps';
  return 'other';
}

function roleRank(exercise: ForgeGeneratedExercise): number {
  return ROLE_RANK[exercise.role] ?? ROLE_RANK.accessory_compound;
}

function blockRank(exercise: ForgeGeneratedExercise): number {
  return BLOCK_RANK[blockForExercise(exercise)] ?? BLOCK_RANK.other;
}

function isStrengthPriorityLift(exercise: ForgeGeneratedExercise): boolean {
  return exercise.required || exercise.role === 'main_lift' || PRIORITY_STRENGTH_LIFTS.has(exercise.canonicalExerciseId);
}

function exerciseMatchesFocus(exercise: ForgeGeneratedExercise, focusMuscles: readonly CanonicalFocusMuscle[]): boolean {
  return exercise.primaryMuscles.some((muscle) => {
    const normalized = normalizeFocusMuscleValue(muscle);
    return normalized ? focusMuscles.includes(normalized) : false;
  });
}

function orderAccessoryBlock<TExercise extends ForgeGeneratedExercise>(exercises: TExercise[], focusMuscles: readonly CanonicalFocusMuscle[] = []): TExercise[] {
  return [...exercises].sort((left, right) => {
    const blockDifference = blockRank(left) - blockRank(right);
    if (blockDifference !== 0) return blockDifference;
    const focusDifference = Number(exerciseMatchesFocus(right, focusMuscles)) - Number(exerciseMatchesFocus(left, focusMuscles));
    if (focusDifference !== 0) return focusDifference;
    const roleDifference = roleRank(left) - roleRank(right);
    if (roleDifference !== 0) return roleDifference;
    return left.order - right.order;
  });
}

function orderStrengthExercises<TExercise extends ForgeGeneratedExercise>(exercises: TExercise[], focusMuscles: readonly CanonicalFocusMuscle[] = []): TExercise[] {
  const ordered: TExercise[] = [];
  let accessoryRun: TExercise[] = [];
  for (const exercise of exercises) {
    if (isStrengthPriorityLift(exercise)) {
      ordered.push(...orderAccessoryBlock(accessoryRun, focusMuscles), exercise);
      accessoryRun = [];
      continue;
    }
    accessoryRun.push(exercise);
  }
  ordered.push(...orderAccessoryBlock(accessoryRun, focusMuscles));
  return ordered;
}

function withSequentialOrder<TExercise extends ForgeGeneratedExercise>(exercises: TExercise[]): (TExercise & OrderedExercise)[] {
  return exercises.map((exercise, index) => ({
    ...exercise,
    order: index + 1,
  }));
}

export function orderWorkoutExercises<TExercise extends ForgeGeneratedExercise>(
  template: Pick<ForgeGeneratedTemplate, 'goal' | 'modality'>,
  workout: OrderableWorkoutDay<TExercise>,
  focusMuscles: readonly CanonicalFocusMuscle[] = [],
): OrderableWorkoutDay<TExercise & OrderedExercise> {
  const original = [...workout.exercises].sort((left, right) => left.order - right.order);
  if (template.modality === 'yoga' || template.modality === 'pilates') {
    return {
      ...workout,
      exercises: withSequentialOrder(original),
    };
  }
  if (template.goal === 'strength') {
    return {
      ...workout,
      exercises: withSequentialOrder(orderStrengthExercises(original, focusMuscles)),
    };
  }

  if (template.goal === 'powerbuilding') {
    const firstExercise = original[0];
    if (firstExercise && isStrengthPriorityLift(firstExercise)) {
      return {
        ...workout,
        exercises: withSequentialOrder([
          firstExercise,
          ...orderAccessoryBlock(original.slice(1), focusMuscles),
        ]),
      };
    }
  }

  return {
    ...workout,
    exercises: withSequentialOrder(orderAccessoryBlock(original, focusMuscles)),
  };
}

export function orderProgramWorkouts<TExercise extends ForgeGeneratedExercise>(
  template: Pick<ForgeGeneratedTemplate, 'goal' | 'modality'>,
  workouts: OrderableWorkoutDay<TExercise>[],
  focusMuscles: readonly CanonicalFocusMuscle[] = [],
): OrderableWorkoutDay<TExercise & OrderedExercise>[] {
  return workouts.map((workout) => orderWorkoutExercises(template, workout, focusMuscles));
}
