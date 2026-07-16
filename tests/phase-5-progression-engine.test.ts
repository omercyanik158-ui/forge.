import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  CompletedExerciseLog,
  ExerciseProgressionRule,
  ExerciseProgressionState,
} from '@/types/aiProgramProgression';
import {
  clearProgressionDecisions,
  createInitialProgressionState,
  defaultProgressionRule,
  evaluateProgressionDecision,
  findProgressionDecisionByFingerprint,
  getProgressionDebugReport,
  inferEquipmentKind,
  loadExerciseProgressionState,
  normalizeCompletedExerciseLog,
  persistProgressionDecision,
  previewProgressionFingerprint,
  roundLoadForEquipment,
  validateCompletedExerciseLog,
} from '@/workout-programming';

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

function rule(overrides: Partial<ExerciseProgressionRule> = {}): ExerciseProgressionRule {
  return {
    ruleId: 'double_progression',
    ruleType: 'double_progression',
    ruleVersion: 1,
    displayName: 'Double progression',
    minReps: 8,
    maxReps: 12,
    targetSets: 3,
    loadIncrementKg: 2.5,
    reductionPercent: 5,
    failureThreshold: 2,
    stallThreshold: 3,
    deloadThreshold: 4,
    deloadLoadMultiplier: 0.9,
    deloadSetMultiplier: 0.65,
    ...overrides,
  };
}

function state(overrides: Partial<ExerciseProgressionState> = {}): ExerciseProgressionState {
  const baseRule = rule(overrides.ruleType ? { ruleType: overrides.ruleType } : {});
  return {
    ...createInitialProgressionState({
      programId: 'plan-1',
      exerciseId: 'bench',
      rule: baseRule,
      targetLoadKg: 40,
      equipmentKind: 'barbell',
    }),
    ...overrides,
  };
}

function log(sets: CompletedExerciseLog['sets'], overrides: Partial<CompletedExerciseLog> = {}): CompletedExerciseLog {
  return {
    programId: 'plan-1',
    sessionId: 'session-1',
    workoutId: 'day-1',
    exerciseId: 'bench',
    submitted: true,
    completed: true,
    sets,
    ...overrides,
  };
}

function sets(reps: number[], loadKg = 40): CompletedExerciseLog['sets'] {
  return reps.map((rep, index) => ({ setIndex: index + 1, reps: rep, loadKg }));
}

beforeEach(async () => {
  process.env.EXPO_PUBLIC_PROGRESSION_WRITES = 'true';
  storage.clear();
  await clearProgressionDecisions();
  vi.resetModules();
});

describe('Phase 5 progression validation and fingerprints', () => {
  it('missing progression rule fails closed and does not mutate', () => {
    const previous = state();
    const result = evaluateProgressionDecision({ log: log(sets([12, 12, 12])), previousState: previous, rule: null });
    expect(result.applied.validation.valid).toBe(false);
    expect(result.applied.decision.type).toBe('preserve');
    expect(result.applied.nextState).toEqual(previous);
  });

  it('rejects invalid logs, negative reps, invalid load and duplicate set indexes', () => {
    const validation = validateCompletedExerciseLog(log([
      { setIndex: 1, reps: -1, loadKg: 40 },
      { setIndex: 1, reps: 8, loadKg: Number.NaN },
    ]));
    expect(validation.valid).toBe(false);
    expect(validation.errors).toEqual(expect.arrayContaining(['INVALID_REPS', 'INVALID_LOAD', 'DUPLICATE_SET_INDEX']));
  });

  it('all skipped sets preserve targets without failure count increment', () => {
    const previous = state({ failureCount: 1 });
    const result = evaluateProgressionDecision({
      log: log([{ setIndex: 1, skipped: true }, { setIndex: 2, skipped: true }, { setIndex: 3, skipped: true }]),
      previousState: previous,
      rule: rule(),
    });
    expect(result.applied.decision.outcome).toBe('skipped');
    expect(result.applied.nextState.failureCount).toBe(1);
  });

  it('normalizes different set array order to the same fingerprint', () => {
    const previous = state();
    const first = evaluateProgressionDecision({ log: log(sets([12, 12, 12]).reverse()), previousState: previous, rule: rule() });
    const second = evaluateProgressionDecision({ log: log(sets([12, 12, 12])), previousState: previous, rule: rule() });
    expect(normalizeCompletedExerciseLog(log(sets([12, 12, 12]).reverse())).sets.map((item) => item.setIndex)).toEqual([1, 2, 3]);
    expect(first.applied.progressionFingerprint).toBe(second.applied.progressionFingerprint);
  });

  it('same input repeated 100 times produces identical decision', () => {
    const previous = state();
    const first = evaluateProgressionDecision({ log: log(sets([12, 12, 12])), previousState: previous, rule: rule() });
    for (let index = 0; index < 100; index += 1) {
      const next = evaluateProgressionDecision({ log: log(sets([12, 12, 12])), previousState: previous, rule: rule() });
      expect(next.applied).toEqual(first.applied);
    }
  });
});

describe('Phase 5 progression decisions', () => {
  it('first successful load-based session uses completed working load as the baseline', () => {
    const previous = state({ targetLoadKg: undefined });
    const result = evaluateProgressionDecision({
      log: log(sets([12, 12, 12], 40)),
      previousState: previous,
      rule: rule(),
    });
    expect(result.applied.decision.type).toBe('increase_load');
    expect(result.applied.decision.reasonCode).toBe('LOAD_INCREASED');
    expect(result.applied.nextState.targetLoadKg).toBe(42.5);
  });

  it('uses the completed load instead of the planned target when the user works lighter', () => {
    const previous = state({ targetLoadKg: 40, targetReps: 12 });
    const result = evaluateProgressionDecision({
      log: log(sets([12, 12, 12], 35)),
      previousState: previous,
      rule: rule(),
    });
    expect(result.applied.decision.type).toBe('increase_load');
    expect(result.applied.nextState.targetLoadKg).toBe(37.5);
  });

  it('does not invent a load increase when no valid external load baseline exists', () => {
    const previous = state({ targetLoadKg: undefined });
    const result = evaluateProgressionDecision({
      log: log([{ setIndex: 1, reps: 12 }, { setIndex: 2, reps: 12 }, { setIndex: 3, reps: 12 }]),
      previousState: previous,
      rule: rule(),
    });
    expect(result.applied.decision.type).toBe('hold');
    expect(result.applied.decision.reasonCode).toBe('MISSING_WORKING_LOAD_BASELINE');
    expect(result.applied.nextState.targetLoadKg).toBeUndefined();
  });

  it('keeps hold behavior for partial success without increasing load', () => {
    const result = evaluateProgressionDecision({
      log: log(sets([12, 11, 10])),
      previousState: state({ targetReps: 12 }),
      rule: rule(),
    });
    expect(result.applied.decision.type).toBe('hold');
    expect(result.applied.nextState.targetLoadKg).toBe(40);
  });

  it('double progression below minimum repeats target', () => {
    const result = evaluateProgressionDecision({ log: log(sets([8, 7, 8])), previousState: state(), rule: rule() });
    expect(result.applied.decision.type).toBe('repeat');
    expect(result.applied.nextState.targetLoadKg).toBe(40);
    expect(result.applied.nextState.failureCount).toBe(1);
  });

  it('double progression inside range holds load', () => {
    const result = evaluateProgressionDecision({ log: log(sets([10, 9, 8])), previousState: state(), rule: rule() });
    expect(result.applied.decision.type).toBe('hold');
    expect(result.applied.nextState.targetLoadKg).toBe(40);
  });

  it('double progression at upper range increases load and resets reps', () => {
    const result = evaluateProgressionDecision({ log: log(sets([12, 12, 12])), previousState: state({ targetReps: 12 }), rule: rule() });
    expect(result.applied.decision.type).toBe('increase_load');
    expect(result.applied.nextState.targetLoadKg).toBe(42.5);
    expect(result.applied.nextState.targetReps).toBe(8);
  });

  it('first failure does not reduce, repeated failure reduces, stall and deload are thresholded', () => {
    const first = evaluateProgressionDecision({ log: log(sets([7, 7, 7])), previousState: state({ failureCount: 0 }), rule: rule() });
    const second = evaluateProgressionDecision({ log: log(sets([7, 7, 7])), previousState: state({ failureCount: 1 }), rule: rule() });
    const third = evaluateProgressionDecision({ log: log(sets([7, 7, 7])), previousState: state({ failureCount: 2 }), rule: rule() });
    const fourth = evaluateProgressionDecision({ log: log(sets([7, 7, 7])), previousState: state({ failureCount: 3 }), rule: rule() });
    expect(first.applied.decision.type).toBe('repeat');
    expect(second.applied.decision.type).toBe('reduce_load');
    expect(third.applied.decision.type).toBe('mark_stalled');
    expect(fourth.applied.decision.type).toBe('recommend_deload');
  });

  it('linear load successful session increases load and failed session holds', () => {
    const linear = rule({ ruleId: 'linear_beginner', ruleType: 'linear_load', minReps: 5, maxReps: 5, loadIncrementKg: 2.5 });
    const previous = state({ ruleId: 'linear_beginner', ruleType: 'linear_load', targetRepMin: 5, targetRepMax: 5, targetReps: 5 });
    const success = evaluateProgressionDecision({ log: log(sets([5, 5, 5])), previousState: previous, rule: linear });
    const fail = evaluateProgressionDecision({ log: log(sets([5, 4, 5])), previousState: previous, rule: linear });
    expect(success.applied.decision.type).toBe('increase_load');
    expect(fail.applied.decision.type).toBe('repeat');
  });

  it('rep-based progression increases reps without overflowing upper bound', () => {
    const repRule = rule({ ruleId: 'bodyweight_rep_leverage', ruleType: 'linear_reps', minReps: 8, maxReps: 10, loadIncrementKg: undefined });
    const first = evaluateProgressionDecision({ log: log(sets([10, 10, 10])), previousState: state({ ruleId: repRule.ruleId, ruleType: 'linear_reps', targetReps: 9, targetLoadKg: undefined, equipmentKind: 'bodyweight' }), rule: repRule });
    const capped = evaluateProgressionDecision({ log: log(sets([10, 10, 10])), previousState: state({ ruleId: repRule.ruleId, ruleType: 'linear_reps', targetReps: 10, targetLoadKg: undefined, equipmentKind: 'bodyweight' }), rule: repRule });
    expect(first.applied.decision.type).toBe('increase_reps');
    expect(first.applied.nextState.targetReps).toBe(10);
    expect(capped.applied.nextState.targetReps).toBe(10);
  });

  it('RIR-supported rules increase only when RIR criteria are present and met', () => {
    const rirRule = rule({ requiresRir: true });
    const missing = evaluateProgressionDecision({ log: log(sets([12, 12, 12])), previousState: state(), rule: rirRule });
    const valid = evaluateProgressionDecision({ log: log(sets([12, 12, 12]).map((set) => ({ ...set, rir: 2 }))), previousState: state(), rule: rirRule });
    expect(missing.applied.decision.type).toBe('repeat');
    expect(valid.applied.decision.type).toBe('increase_load');
  });
});

describe('Phase 5 equipment, persistence and debug behavior', () => {
  it('uses equipment-aware load rounding and never assigns arbitrary kg to bodyweight', () => {
    expect(roundLoadForEquipment(42.6, 'barbell')).toBe(42.5);
    expect(roundLoadForEquipment(23.1, 'dumbbell_pair')).toBe(24);
    expect(roundLoadForEquipment(47.6, 'machine_plate')).toBe(50);
    const body = evaluateProgressionDecision({
      log: log(sets([12, 12, 12])),
      previousState: state({ equipmentKind: 'bodyweight', targetLoadKg: undefined }),
      rule: rule({ loadIncrementKg: undefined }),
    });
    expect(body.applied.nextState.targetLoadKg).toBeUndefined();
  });

  it('holds conservatively when working sets use mixed loads without a supported top-set model', () => {
    const previous = state({ targetLoadKg: undefined, targetReps: 12 });
    const result = evaluateProgressionDecision({
      log: log([
        { setIndex: 1, reps: 12, loadKg: 40 },
        { setIndex: 2, reps: 12, loadKg: 37.5 },
        { setIndex: 3, reps: 12, loadKg: 37.5 },
      ]),
      previousState: previous,
      rule: rule(),
    });
    expect(result.applied.decision.type).toBe('hold');
    expect(result.applied.decision.reasonCode).toBe('MIXED_WORKING_LOADS_UNSUPPORTED');
    expect(result.applied.nextState.targetLoadKg).toBeUndefined();
  });

  it('persists one decision for duplicate session processing', async () => {
    const evaluation = evaluateProgressionDecision({ log: log(sets([12, 12, 12])), previousState: state(), rule: rule() });
    const first = await persistProgressionDecision(evaluation.applied);
    const second = await persistProgressionDecision(evaluation.applied);
    const found = await findProgressionDecisionByFingerprint(evaluation.applied.progressionFingerprint);
    const savedState = await loadExerciseProgressionState('plan-1', 'bench');
    expect(first.progressionFingerprint).toBe(second.progressionFingerprint);
    expect(second.reusedExisting).toBe(true);
    expect(found?.decisionId).toBe(first.decisionId);
    expect(savedState?.targetLoadKg).toBe(42.5);
  });

  it('debug report exposes validation, evidence, counters and persistence state', async () => {
    const previous = state();
    const report = await getProgressionDebugReport({ log: log(sets([12, 12, 12])), previousState: previous, rule: rule() });
    expect(report.progressionFingerprint).toMatch(/^forge-progression-decision:v1:/);
    expect(report.selectedDecision.type).toBe('increase_load');
    expect(report.failureCounter.before).toBe(0);
    expect(report.validation.log.valid).toBe(true);
  });

  it('default generated rule mapping supports CSV rule IDs and equipment inference', () => {
    const equipmentKind = inferEquipmentKind(['dumbbell']);
    const generated = defaultProgressionRule({
      ruleId: 'powerbuilding_hybrid',
      goal: 'powerbuilding',
      role: 'main_lift',
      sets: 4,
      repsMin: 3,
      repsMax: 6,
      equipmentKind,
    });
    expect(equipmentKind).toBe('dumbbell_pair');
    expect(generated?.ruleType).toBe('top_set_backoff');
  });

  it('preview fingerprint helper is deterministic', () => {
    const previous = state();
    const first = previewProgressionFingerprint({ log: log(sets([12, 12, 12])), previousState: previous, rule: rule() });
    const second = previewProgressionFingerprint({ log: log(sets([12, 12, 12]).reverse()), previousState: previous, rule: rule() });
    expect(first).toBe(second);
  });
});
