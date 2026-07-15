import { describe, expect, it } from 'vitest';
import { buildTemplateProgram, createProgramRequestFromAnswers, PROGRAM_TEMPLATES } from '@/services/templateProgramEngine';
import type { AIProgramAnswers } from '@/types/aiProgram';
import type { ForgeGeneratedExercise, ForgeGeneratedTemplate, ForgeGeneratedWorkoutDay } from '@/workout-programming/types/csvWorkoutBrain';
import { orderWorkoutExercises } from '@/workout-programming';

const baseExercise = {
  targetRir: 2,
  restSeconds: 90,
  progressionRuleId: 'double_progression',
  required: false,
  notes: '',
  equipment: [],
} satisfies Pick<ForgeGeneratedExercise, 'targetRir' | 'restSeconds' | 'progressionRuleId' | 'required' | 'notes' | 'equipment'>;

function exercise(input: {
  id: string;
  order: number;
  movementPattern: string;
  primaryMuscles: string[];
  role: string;
  sets?: number;
  repsMin?: number;
  repsMax?: number;
  required?: boolean;
}): ForgeGeneratedExercise {
  return {
    ...baseExercise,
    canonicalExerciseId: input.id,
    exerciseId: input.id,
    exerciseName: input.id,
    order: input.order,
    movementPattern: input.movementPattern,
    primaryMuscles: input.primaryMuscles,
    role: input.role,
    sets: input.sets ?? 3,
    repsMin: input.repsMin ?? 8,
    repsMax: input.repsMax ?? 12,
    required: input.required ?? false,
  };
}

function workout(exercises: ForgeGeneratedExercise[]): ForgeGeneratedWorkoutDay {
  return {
    dayIndex: 1,
    name: 'Test Day',
    focus: ['Test'],
    exercises,
  };
}

function template(goal: ForgeGeneratedTemplate['goal']): Pick<ForgeGeneratedTemplate, 'goal'> {
  return { goal };
}

function ids(day: ForgeGeneratedWorkoutDay): string[] {
  return day.exercises.map((item) => item.exerciseId);
}

function prescriptionSignature(day: ForgeGeneratedWorkoutDay): string[] {
  return day.exercises.map((item) => `${item.exerciseId}:${item.sets}:${item.repsMin}:${item.repsMax}:${item.restSeconds}`);
}

describe('workout exercise ordering', () => {
  it('reorders existing exercises without changing count, ids, sets, reps, or rest', () => {
    const day = workout([
      exercise({ id: 'hack_squat', order: 1, movementPattern: 'squat', primaryMuscles: ['quads'], role: 'secondary_compound', sets: 4, repsMin: 8, repsMax: 10 }),
      exercise({ id: 'incline_press', order: 2, movementPattern: 'incline_push', primaryMuscles: ['upper_chest'], role: 'secondary_compound', sets: 3, repsMin: 8, repsMax: 12 }),
      exercise({ id: 'row', order: 3, movementPattern: 'horizontal_pull', primaryMuscles: ['upper_back'], role: 'secondary_compound', sets: 3, repsMin: 8, repsMax: 12 }),
      exercise({ id: 'leg_curl', order: 4, movementPattern: 'knee_flexion', primaryMuscles: ['hamstrings'], role: 'isolation', sets: 2, repsMin: 10, repsMax: 15 }),
      exercise({ id: 'lateral_raise', order: 5, movementPattern: 'shoulder_abduction', primaryMuscles: ['side_delts'], role: 'isolation', sets: 2, repsMin: 12, repsMax: 20 }),
      exercise({ id: 'triceps_pushdown', order: 6, movementPattern: 'elbow_extension', primaryMuscles: ['triceps'], role: 'isolation', sets: 2, repsMin: 10, repsMax: 15 }),
    ]);
    const beforeSignature = prescriptionSignature(day).sort();
    const ordered = orderWorkoutExercises(template('hypertrophy'), day);
    expect(ordered.exercises).toHaveLength(day.exercises.length);
    expect(ids(ordered).sort()).toEqual(ids(day).sort());
    expect(prescriptionSignature(ordered).sort()).toEqual(beforeSignature);
    expect(ids(ordered)).toEqual(['hack_squat', 'leg_curl', 'incline_press', 'row', 'lateral_raise', 'triceps_pushdown']);
  });

  it('keeps same-muscle exercises adjacent where practical and orders compound before isolation', () => {
    const day = workout([
      exercise({ id: 'bench_press', order: 1, movementPattern: 'horizontal_push', primaryMuscles: ['chest'], role: 'main_lift' }),
      exercise({ id: 'row', order: 2, movementPattern: 'horizontal_pull', primaryMuscles: ['upper_back'], role: 'secondary_compound' }),
      exercise({ id: 'cable_fly', order: 3, movementPattern: 'fly', primaryMuscles: ['chest'], role: 'isolation' }),
      exercise({ id: 'straight_arm_pulldown', order: 4, movementPattern: 'pullover', primaryMuscles: ['lats'], role: 'isolation' }),
    ]);
    const ordered = orderWorkoutExercises(template('hypertrophy'), day);
    expect(ids(ordered)).toEqual(['bench_press', 'cable_fly', 'row', 'straight_arm_pulldown']);
  });

  it('preserves strength main-lift priority before grouping accessories', () => {
    const day = workout([
      exercise({ id: 'back_squat', order: 1, movementPattern: 'squat', primaryMuscles: ['quads'], role: 'main_lift', required: true }),
      exercise({ id: 'bench_press', order: 2, movementPattern: 'horizontal_push', primaryMuscles: ['chest'], role: 'main_lift', required: true }),
      exercise({ id: 'row', order: 3, movementPattern: 'horizontal_pull', primaryMuscles: ['upper_back'], role: 'secondary_compound' }),
      exercise({ id: 'leg_curl', order: 4, movementPattern: 'knee_flexion', primaryMuscles: ['hamstrings'], role: 'isolation' }),
    ]);
    const ordered = orderWorkoutExercises(template('strength'), day);
    expect(ids(ordered).slice(0, 2)).toEqual(['back_squat', 'bench_press']);
    expect(ids(ordered)).toEqual(['back_squat', 'bench_press', 'leg_curl', 'row']);
  });

  it('is deterministic for identical inputs', () => {
    const day = workout([
      exercise({ id: 'row', order: 1, movementPattern: 'horizontal_pull', primaryMuscles: ['upper_back'], role: 'secondary_compound' }),
      exercise({ id: 'bench_press', order: 2, movementPattern: 'horizontal_push', primaryMuscles: ['chest'], role: 'main_lift' }),
      exercise({ id: 'cable_fly', order: 3, movementPattern: 'fly', primaryMuscles: ['chest'], role: 'isolation' }),
    ]);
    const first = orderWorkoutExercises(template('general_fitness'), day);
    const second = orderWorkoutExercises(template('general_fitness'), day);
    expect(ids(first)).toEqual(ids(second));
  });
});

describe('runtime ordering integration', () => {
  it('applies deterministic ordering before final program conversion', () => {
    const templateForRequest = PROGRAM_TEMPLATES.find((item) => item.id === 'forge_general_fitness_dumbbell_beginner_3d_v1');
    expect(templateForRequest).toBeDefined();
    const answers: AIProgramAnswers = {
      mainGoal: 'general_fitness',
      preferredProgramStyle: 'auto',
      trainingDays: 3,
      sessionDurationMin: 45,
      location: 'gym',
      equipment: ['dumbbells', 'bench'],
      experience: 'beginner',
      priorityMuscles: [],
      painLimitations: ['none'],
      recoveryQuality: 'okay',
      useLatestPhysiqueAnalysis: false,
    };
    const request = createProgramRequestFromAnswers({ answers });
    const first = buildTemplateProgram({ request });
    const second = buildTemplateProgram({ request });
    expect(first.selectedTemplateId).toBe(templateForRequest?.id);
    expect(first.plan.weeks[0]?.days.map((day) => day.exerciseIds)).toEqual(second.plan.weeks[0]?.days.map((day) => day.exerciseIds));
  });
});
