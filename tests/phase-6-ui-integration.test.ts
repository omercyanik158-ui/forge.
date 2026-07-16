import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AIProgramAnswers } from '@/types/aiProgram';
import type { AIProgramPlan } from '@/types/aiProgramPlan';
import { getProgramSelectionExplanation } from '@/services/programRecommendationEngine';
import {
  clearActiveAIProgram,
  loadActiveAIProgram,
  setActiveAIProgramId,
} from '@/services/activeAIProgramStore';
import {
  clearAIProgramInstances,
  saveAIProgramInstance,
} from '@/services/aiProgramInstanceStore';
import type { WorkoutLog } from '@/types';

const storage = new Map<string, string>();

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn((key: string) => Promise.resolve(storage.get(key) ?? null)),
    setItem: vi.fn((key: string, value: string) => {
      storage.set(key, value);
      return Promise.resolve();
    }),
    removeItem: vi.fn((key: string) => {
      storage.delete(key);
      return Promise.resolve();
    }),
    multiRemove: vi.fn((keys: string[]) => {
      keys.forEach((key) => storage.delete(key));
      return Promise.resolve();
    }),
  },
}));

const baseAnswers: AIProgramAnswers = {
  mainGoal: 'build_muscle',
  preferredProgramStyle: 'auto',
  trainingDays: 4,
  sessionDurationMin: 60,
  location: 'gym',
  equipment: ['barbells', 'dumbbells', 'machines', 'cables', 'bench'],
  experience: 'intermediate',
  priorityMuscles: ['chest', 'lats', 'shoulders'],
  painLimitations: ['none'],
  recoveryQuality: 'okay',
  useLatestPhysiqueAnalysis: false,
};

async function loadTemplateEngine() {
  return import('@/services/templateProgramEngine');
}

async function loadWorkoutProgramming() {
  return import('@/workout-programming');
}

function workoutLogForDay(plan: AIProgramPlan): WorkoutLog {
  const day = plan.weeks[0]!.days[0]!;
  const setEntries = day.exercises.flatMap((exercise) =>
    Array.from({ length: exercise.sets }, (_, index) => ({
      order: index + 1,
      kind: 'working' as const,
      exerciseId: exercise.exerciseId,
      kg: 40,
      reps: exercise.reps,
      completedAt: '2026-07-15T12:00:00.000Z',
    })),
  );
  return {
    id: 'session-1',
    title: day.title,
    durationMin: day.durationMin,
    kcal: 100,
    difficulty: day.difficulty,
    completedAt: '2026-07-15T12:00:00.000Z',
    source: 'ai_program',
    aiProgramId: plan.id,
    aiProgramDayId: day.id,
    exerciseIds: day.exerciseIds,
    setEntries,
  };
}

beforeEach(async () => {
  process.env.EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE = 'true';
  process.env.EXPO_PUBLIC_PROGRESSION_WRITES = 'true';
  storage.clear();
  await clearAIProgramInstances();
  await clearActiveAIProgram();
  vi.resetModules();
  await (await loadWorkoutProgramming()).clearProgressionDecisions();
});

describe('Phase 6 canonical program flow integration', () => {
  it('maps builder answers to canonical request without display labels', async () => {
    const { createProgramRequestFromAnswers } = await loadTemplateEngine();
    const request = createProgramRequestFromAnswers({ answers: baseAnswers, userId: 'u1' });
    expect(request.goal).toBe('hypertrophy');
    expect(request.level).toBe('intermediate');
    expect(request.daysPerWeek).toBe(4);
    expect(request.preferredSessionMinutes).toBe(60);
    expect(request.equipmentProfile).toBe('full_gym');
    expect(request.availableEquipment).toContain('barbell');
    expect(request.availableEquipment).not.toContain('pullup_bar');
  });

  it('caps focus areas at two through normalized request/adaptation path', async () => {
    const { createProgramRequestFromAnswers, buildTemplateProgram } = await loadTemplateEngine();
    const request = createProgramRequestFromAnswers({ answers: baseAnswers, userId: 'u1' });
    const result = buildTemplateProgram({ request });
    const focusMuscles = new Set(result.adaptations.map((item) => item.focusMuscle).filter(Boolean));
    expect(focusMuscles.size).toBeLessThanOrEqual(2);
  });

  it('creates user-facing selection explanations without raw score IDs', async () => {
    const { createProgramRequestFromAnswers, buildTemplateProgram } = await loadTemplateEngine();
    const request = createProgramRequestFromAnswers({ answers: baseAnswers, userId: 'u1' });
    const result = buildTemplateProgram({ request });
    const explanation = getProgramSelectionExplanation(result);
    expect(explanation.map((item) => item.id)).toEqual(expect.arrayContaining(['goal', 'days', 'level', 'equipment']));
    expect(explanation.some((item) => /\d{2,3}/.test(item.label))).toBe(false);
  });

  it('save-only does not silently replace the active program', async () => {
    const { createProgramRequestFromAnswers, buildTemplateProgram } = await loadTemplateEngine();
    const planFromAnswers = (answers: AIProgramAnswers, userId = 'user') =>
      buildTemplateProgram({ request: createProgramRequestFromAnswers({ answers, userId }) }).plan;
    const first = planFromAnswers({ ...baseAnswers, trainingDays: 4 }, 'u1');
    const second = planFromAnswers({ ...baseAnswers, trainingDays: 5 }, 'u1');
    await saveAIProgramInstance(first);
    await setActiveAIProgramId(first.id);
    await saveAIProgramInstance(second);
    expect((await loadActiveAIProgram())?.id).toBe(first.id);
  });

  it('explicit replacement changes active program only after confirmation action', async () => {
    const { createProgramRequestFromAnswers, buildTemplateProgram } = await loadTemplateEngine();
    const planFromAnswers = (answers: AIProgramAnswers, userId = 'user') =>
      buildTemplateProgram({ request: createProgramRequestFromAnswers({ answers, userId }) }).plan;
    const first = planFromAnswers({ ...baseAnswers, trainingDays: 4 }, 'u1');
    const second = planFromAnswers({ ...baseAnswers, trainingDays: 5 }, 'u1');
    await saveAIProgramInstance(first);
    await saveAIProgramInstance(second);
    await setActiveAIProgramId(first.id);
    await setActiveAIProgramId(second.id);
    expect((await loadActiveAIProgram())?.id).toBe(second.id);
  });

  it('session preview reads persisted next target and completion runs progression once', async () => {
    const { createProgramRequestFromAnswers, buildTemplateProgram } = await loadTemplateEngine();
    const { getExerciseProgressionPreview, processAIProgramWorkoutProgression } = await loadWorkoutProgramming();
    const plan = buildTemplateProgram({
      request: createProgramRequestFromAnswers({ answers: { ...baseAnswers, priorityMuscles: [] }, userId: 'u1' }),
    }).plan;
    await saveAIProgramInstance(plan);
    await setActiveAIProgramId(plan.id);
    const day = plan.weeks[0]!.days[0]!;
    const preview = await getExerciseProgressionPreview({ plan, day, exerciseId: day.exerciseIds[0]! });
    expect(preview?.targetSets).toBe(day.exercises[0]!.sets);
    const first = await processAIProgramWorkoutProgression({ plan, day, workoutLog: workoutLogForDay(plan) });
    const second = await processAIProgramWorkoutProgression({ plan, day, workoutLog: workoutLogForDay(plan) });
    expect(first[0]?.progressionFingerprint).toBe(second[0]?.progressionFingerprint);
    expect(second[0]?.reusedExisting).toBe(true);
    const progressedDecision = first.find((item) =>
      item.decision.type === 'increase_load' &&
      item.previousState.targetLoadKg === undefined &&
      item.nextState.targetLoadKg !== undefined &&
      item.nextState.targetLoadKg > 0,
    );
    expect(progressedDecision).toBeTruthy();
    const nextPreview = await getExerciseProgressionPreview({ plan, day, exerciseId: progressedDecision!.exerciseId });
    expect(progressedDecision?.previousState.targetLoadKg).toBeUndefined();
    expect(nextPreview?.targetLoadKg).toBe(progressedDecision?.nextState.targetLoadKg);
  });
});
