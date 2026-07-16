import { execFileSync } from 'node:child_process';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearActiveAIProgram,
  loadActiveAIProgram,
  setActiveAIProgramId,
} from '@/services/activeAIProgramStore';
import {
  clearAIProgramInstances,
  saveAIProgramInstance,
} from '@/services/aiProgramInstanceStore';
import { saveWorkoutLog, clearWorkoutLogs } from '@/services/workoutStore';
import { runWorkoutSystemHealthCheck } from '@/services/dataHealth';
import { clearProgressionDecisions, persistProgressionDecision } from '@/workout-programming';
import { evaluateProgressionDecision } from '@/workout-programming/progression/evaluateProgressionDecision';
import { createInitialProgressionState, defaultProgressionRule } from '@/workout-programming/progression/progressionUtils';
import type { AIProgramAnswers } from '@/types/aiProgram';

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

const answers: AIProgramAnswers = {
  mainGoal: 'build_muscle',
  preferredProgramStyle: 'auto',
  trainingDays: 4,
  sessionDurationMin: 60,
  location: 'gym',
  equipment: ['barbells', 'dumbbells', 'machines', 'cables', 'bench'],
  experience: 'intermediate',
  priorityMuscles: [],
  painLimitations: ['none'],
  recoveryQuality: 'okay',
  useLatestPhysiqueAnalysis: false,
};

async function loadFeatureFlags() {
  return import('@/services/workoutEngineFeatureFlags');
}

async function loadTemplateEngine() {
  return import('@/services/templateProgramEngine');
}

beforeEach(async () => {
  storage.clear();
  process.env.EXPO_PUBLIC_APP_ENV = 'test';
  delete process.env.EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE;
  delete process.env.EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE_DEV_OVERRIDE;
  delete process.env.EXPO_PUBLIC_PROGRESSION_WRITES;
  delete process.env.EXPO_PUBLIC_PROGRESSION_WRITES_DEV_OVERRIDE;
  await clearAIProgramInstances();
  await clearActiveAIProgram();
  await clearWorkoutLogs();
  await clearProgressionDecisions();
  vi.resetModules();
});

describe('Phase 7 feature flags and release hardening', () => {
  it('template engine flag is fail-safe opt-in', async () => {
    const { getTemplateProgramEngineFeatureState } = await loadFeatureFlags();
    expect(getTemplateProgramEngineFeatureState()).toMatchObject({ enabled: false, source: 'disabled_default' });
    process.env.EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE = 'false';
    vi.resetModules();
    expect((await loadFeatureFlags()).getTemplateProgramEngineFeatureState().enabled).toBe(false);
    process.env.EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE = 'invalid';
    vi.resetModules();
    expect((await loadFeatureFlags()).getTemplateProgramEngineFeatureState().enabled).toBe(false);
    process.env.EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE = 'true';
    vi.resetModules();
    expect((await loadFeatureFlags()).getTemplateProgramEngineFeatureState()).toMatchObject({ enabled: true, source: 'environment' });
  });

  it('disabled progression writes preserve existing data and create no new decisions', async () => {
    const { getProgressionWritesFeatureState } = await loadFeatureFlags();
    const { createProgramRequestFromAnswers, buildTemplateProgram } = await loadTemplateEngine();
    expect(getProgressionWritesFeatureState().enabled).toBe(false);
    const request = createProgramRequestFromAnswers({ answers, userId: 'u1' });
    const plan = buildTemplateProgram({ request }).plan;
    await saveAIProgramInstance(plan);
    const activeBefore = await loadActiveAIProgram();
    expect(activeBefore?.id).toBe(plan.id);
  });

  it('explicit active program survives restart and missing active reference fails safely', async () => {
    const { createProgramRequestFromAnswers, buildTemplateProgram } = await loadTemplateEngine();
    const request = createProgramRequestFromAnswers({ answers, userId: 'u1' });
    const plan = buildTemplateProgram({ request }).plan;
    await saveAIProgramInstance(plan);
    await setActiveAIProgramId(plan.id);
    expect((await loadActiveAIProgram())?.id).toBe(plan.id);
    await setActiveAIProgramId('deleted-program');
    expect(await loadActiveAIProgram()).toBeNull();
  });

  it('workout system health detects duplicate logs, negative set values and duplicate decisions', async () => {
    const { createProgramRequestFromAnswers, buildTemplateProgram } = await loadTemplateEngine();
    const request = createProgramRequestFromAnswers({ answers, userId: 'u1' });
    const plan = buildTemplateProgram({ request }).plan;
    await saveAIProgramInstance(plan);
    await saveWorkoutLog({
      id: 'log-1',
      title: 'Bad log',
      durationMin: 10,
      kcal: 1,
      difficulty: 'Orta',
      completedAt: '2026-07-15T12:00:00.000Z',
      setEntries: [{ order: 1, kind: 'working', exerciseId: 'csv-bench-press-barbell', kg: -1, reps: 5, completedAt: '2026-07-15T12:00:00.000Z' }],
    });
    await saveWorkoutLog({
      id: 'log-1',
      title: 'Duplicate',
      durationMin: 10,
      kcal: 1,
      difficulty: 'Orta',
      completedAt: '2026-07-15T12:01:00.000Z',
      setEntries: [],
    });
    process.env.EXPO_PUBLIC_PROGRESSION_WRITES = 'true';
    vi.resetModules();
    const rule = defaultProgressionRule({
      ruleId: 'double_progression',
      goal: 'hypertrophy',
      role: 'secondary_compound',
      sets: 3,
      repsMin: 8,
      repsMax: 12,
      equipmentKind: 'barbell',
    })!;
    const previousState = createInitialProgressionState({
      programId: plan.id,
      exerciseId: 'csv-bench-press-barbell',
      rule,
      targetLoadKg: 40,
      equipmentKind: 'barbell',
    });
    const evaluated = evaluateProgressionDecision({
      log: {
        programId: plan.id,
        sessionId: 'log-1',
        workoutId: 'day-1',
        exerciseId: 'csv-bench-press-barbell',
        submitted: true,
        completed: true,
        sets: [{ setIndex: 1, reps: 12, loadKg: 40 }, { setIndex: 2, reps: 12, loadKg: 40 }, { setIndex: 3, reps: 12, loadKg: 40 }],
      },
      previousState,
      rule,
    }).applied;
    await persistProgressionDecision(evaluated);
    await persistProgressionDecision({ ...evaluated, decisionId: 'manual-duplicate' });
    const health = await runWorkoutSystemHealthCheck();
    expect(health.healthy).toBe(false);
    expect(health.errors.map((issue) => issue.code)).toEqual(expect.arrayContaining(['DUPLICATE_WORKOUT_ID', 'NEGATIVE_WORKOUT_SET']));
  });

  it('release config checker warns in development and blocks production when rollout flags are missing', () => {
    const dev = execFileSync('node', ['scripts/check-release-config.mjs'], {
      encoding: 'utf-8',
      env: { ...process.env, FORGE_RELEASE_PROFILE: 'development', EXPO_PUBLIC_APP_ENV: 'development' },
    });
    expect(JSON.parse(dev).status).not.toBe('blocker');
    expect(() =>
      execFileSync('node', ['scripts/check-release-config.mjs'], {
        encoding: 'utf-8',
        env: {
          ...process.env,
          FORGE_RELEASE_PROFILE: 'production',
          EXPO_PUBLIC_APP_ENV: 'production',
          EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE: 'false',
        },
      }),
    ).toThrow();
  });

  it('repository hygiene checker passes for tracked files', () => {
    const output = execFileSync('node', ['scripts/check-repository-hygiene.mjs'], { encoding: 'utf-8' });
    expect(JSON.parse(output).status).toBe('pass');
  });
});
