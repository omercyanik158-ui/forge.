import type {
  AppliedProgressionDecision,
  CompletedExerciseLog,
  ExerciseProgressionRule,
  ExerciseProgressionState,
  ProgressionDecision,
} from '@/types/aiProgramProgression';
import {
  normalizeCompletedExerciseLog,
  PROGRESSION_ENGINE_VERSION,
  roundLoadForEquipment,
  stableHash,
  stableStringify,
  validateCompletedExerciseLog,
  validateProgressionRule,
  type NormalizedCompletedExerciseLog,
} from './progressionUtils';

export type ProgressionEvaluationInput = {
  log: CompletedExerciseLog;
  previousState: ExerciseProgressionState;
  rule: ExerciseProgressionRule | null;
};

export type ProgressionEvaluationResult = {
  applied: AppliedProgressionDecision;
  normalizedLog: NormalizedCompletedExerciseLog;
};

function cloneState(state: ExerciseProgressionState): ExerciseProgressionState {
  return { ...state };
}

export function createProgressionFingerprint(input: {
  log: NormalizedCompletedExerciseLog;
  previousState: ExerciseProgressionState;
  rule: ExerciseProgressionRule | null;
}): string {
  const payload = {
    engineVersion: PROGRESSION_ENGINE_VERSION,
    programId: input.log.programId,
    sessionId: input.log.sessionId,
    workoutId: input.log.workoutId,
    exerciseId: input.log.exerciseId,
    ruleId: input.rule?.ruleId ?? 'missing',
    ruleVersion: input.rule?.ruleVersion ?? 0,
    sets: input.log.sets.map((set) => ({
      setIndex: set.setIndex,
      reps: set.reps,
      loadKg: set.loadKg,
      durationSec: set.durationSec,
      distanceMeters: set.distanceMeters,
      rir: set.rir,
      rpe: set.rpe,
      skipped: set.skipped === true,
    })),
    previousState: {
      targetSets: input.previousState.targetSets,
      targetRepMin: input.previousState.targetRepMin,
      targetRepMax: input.previousState.targetRepMax,
      targetReps: input.previousState.targetReps,
      targetLoadKg: input.previousState.targetLoadKg,
      targetDurationSec: input.previousState.targetDurationSec,
      targetDistanceMeters: input.previousState.targetDistanceMeters,
      failureCount: input.previousState.failureCount,
      plateauCount: input.previousState.plateauCount,
      deloadCount: input.previousState.deloadCount,
      sourceExerciseId: input.previousState.sourceExerciseId,
      substitutedFromExerciseId: input.previousState.substitutedFromExerciseId,
    },
  };
  return `forge-progression-decision:v1:${stableHash(stableStringify(payload))}`;
}

function decision(type: ProgressionDecision['type'], outcome: ProgressionDecision['outcome'], reasonCode: string, explanation: string, evidence: string[]): ProgressionDecision {
  return { type, outcome, reasonCode, explanation, evidence };
}

type WorkingLoadResolution =
  | { kind: 'not_applicable' }
  | { kind: 'missing' }
  | { kind: 'mixed'; loads: number[] }
  | { kind: 'resolved'; source: 'completed_sets' | 'previous_state'; loadKg: number };

function successEvidence(log: NormalizedCompletedExerciseLog, requiredSets: number): string[] {
  const working = log.sets.filter((set) => !set.skipped).slice(0, requiredSets);
  return working.map((set) => {
    const load = Number.isFinite(set.loadKg) ? `${set.loadKg} kg` : 'load missing';
    return `Set ${set.setIndex}: ${set.reps ?? 0} reps @ ${load}`;
  });
}

function requiredWorkingSets(log: NormalizedCompletedExerciseLog, requiredSets: number) {
  return log.sets.filter((set) => !set.skipped).slice(0, requiredSets);
}

function isLoadTrackedState(state: ExerciseProgressionState, rule: ExerciseProgressionRule): boolean {
  if (state.equipmentKind === 'bodyweight' || state.equipmentKind === 'time' || state.equipmentKind === 'distance') {
    return false;
  }
  return (
    rule.ruleType === 'double_progression' ||
    rule.ruleType === 'linear_load' ||
    rule.ruleType === 'top_set_backoff' ||
    rule.ruleType === 'percentage_based' ||
    rule.ruleType === 'rir_based'
  );
}

function isValidCompletedLoad(loadKg: number | undefined, equipmentKind: ExerciseProgressionState['equipmentKind']): loadKg is number {
  if (typeof loadKg !== 'number' || !Number.isFinite(loadKg)) return false;
  if (equipmentKind === 'bodyweight') return loadKg >= 0;
  return loadKg > 0;
}

function resolveWorkingLoadBaseline(
  log: NormalizedCompletedExerciseLog,
  previousState: ExerciseProgressionState,
  rule: ExerciseProgressionRule,
): WorkingLoadResolution {
  if (!isLoadTrackedState(previousState, rule)) {
    return { kind: 'not_applicable' };
  }

  const workingLoads = requiredWorkingSets(log, previousState.targetSets)
    .map((set) => set.loadKg)
    .filter((loadKg): loadKg is number => isValidCompletedLoad(loadKg, previousState.equipmentKind));

  if (workingLoads.length === 0) {
    if (Number.isFinite(previousState.targetLoadKg) && (previousState.targetLoadKg ?? 0) > 0) {
      return {
        kind: 'resolved',
        source: 'previous_state',
        loadKg: previousState.targetLoadKg!,
      };
    }
    return { kind: 'missing' };
  }

  const firstLoad = workingLoads[0]!;
  const hasMixedLoads = workingLoads.some((loadKg) => Math.abs(loadKg - firstLoad) > 0.001);
  if (hasMixedLoads) {
    return { kind: 'mixed', loads: workingLoads };
  }

  return {
    kind: 'resolved',
    source: 'completed_sets',
    loadKg: firstLoad,
  };
}

function rebaseStateToWorkingLoad(
  state: ExerciseProgressionState,
  resolution: WorkingLoadResolution,
): ExerciseProgressionState {
  if (resolution.kind !== 'resolved' || resolution.source !== 'completed_sets') {
    return state;
  }
  return {
    ...state,
    targetLoadKg: resolution.loadKg,
  };
}

function classifyRepOutcome(log: NormalizedCompletedExerciseLog, state: ExerciseProgressionState, rule: ExerciseProgressionRule) {
  const sets = requiredWorkingSets(log, state.targetSets);
  if (sets.length === 0) return 'skipped' as const;
  if (sets.length < state.targetSets) return 'failure' as const;
  const min = state.targetRepMin;
  const max = state.targetRepMax;
  const allAtUpper = sets.every((set) => (set.reps ?? -1) >= max);
  const allAtLower = sets.every((set) => (set.reps ?? -1) >= min);
  const rirOk = !rule.requiresRir || sets.every((set) => set.rir !== undefined && set.rir >= 0 && set.rir <= 3);
  const rpeOk = !rule.requiresRpe || sets.every((set) => set.rpe !== undefined && set.rpe <= 9);
  if (allAtUpper && rirOk && rpeOk) return 'success' as const;
  if (allAtLower && rirOk && rpeOk) return 'partial_success' as const;
  return 'failure' as const;
}

function increaseLoad(state: ExerciseProgressionState, rule: ExerciseProgressionRule): ExerciseProgressionState {
  if (state.equipmentKind === 'bodyweight') return { ...state, targetReps: state.targetRepMin, failureCount: 0, plateauCount: 0 };
  if (!Number.isFinite(state.targetLoadKg) || (state.targetLoadKg ?? 0) <= 0) {
    return { ...state, failureCount: 0, plateauCount: 0 };
  }
  const current = state.targetLoadKg!;
  const rawIncrease = rule.loadIncrementKg ?? (current * ((rule.loadIncrementPercent ?? 2.5) / 100));
  const nextLoad = roundLoadForEquipment(current + rawIncrease, state.equipmentKind);
  return {
    ...state,
    targetLoadKg: Math.max(current, nextLoad),
    targetReps: state.targetRepMin,
    failureCount: 0,
    plateauCount: 0,
  };
}

function reduceLoad(state: ExerciseProgressionState, rule: ExerciseProgressionRule): ExerciseProgressionState {
  if (state.equipmentKind === 'bodyweight') {
    return { ...state, targetReps: state.targetRepMin, failureCount: 0, plateauCount: state.plateauCount + 1 };
  }
  if (!Number.isFinite(state.targetLoadKg) || (state.targetLoadKg ?? 0) <= 0) {
    return { ...state, targetLoadKg: undefined, targetReps: state.targetRepMin, failureCount: 0, plateauCount: state.plateauCount + 1 };
  }
  const current = state.targetLoadKg!;
  const multiplier = 1 - ((rule.reductionPercent ?? 5) / 100);
  return {
    ...state,
    targetLoadKg: roundLoadForEquipment(current * multiplier, state.equipmentKind),
    targetReps: state.targetRepMin,
    failureCount: 0,
    plateauCount: state.plateauCount + 1,
  };
}

function deloadState(state: ExerciseProgressionState, rule: ExerciseProgressionRule): ExerciseProgressionState {
  const nextSets = Math.max(1, Math.round(state.targetSets * (rule.deloadSetMultiplier ?? 0.65)));
  const nextLoad = state.targetLoadKg === undefined
    ? undefined
    : roundLoadForEquipment(state.targetLoadKg * (rule.deloadLoadMultiplier ?? 0.9), state.equipmentKind);
  return {
    ...state,
    targetSets: nextSets,
    targetLoadKg: nextLoad,
    targetReps: state.targetRepMin,
    failureCount: 0,
    plateauCount: state.plateauCount + 1,
    deloadCount: state.deloadCount + 1,
  };
}

function evaluateValid(input: {
  log: NormalizedCompletedExerciseLog;
  previousState: ExerciseProgressionState;
  rule: ExerciseProgressionRule;
}): { decision: ProgressionDecision; nextState: ExerciseProgressionState } {
  const { log, previousState, rule } = input;
  const loadResolution = resolveWorkingLoadBaseline(log, previousState, rule);
  const baselineState = rebaseStateToWorkingLoad(previousState, loadResolution);
  const outcome = classifyRepOutcome(log, baselineState, rule);
  const evidence = successEvidence(log, previousState.targetSets);
  if (outcome === 'skipped') {
    return {
      decision: decision('preserve', 'skipped', 'ALL_SETS_SKIPPED', 'Bu hareket için tamamlanmış çalışma seti yok. Hedefler korunur.', evidence),
      nextState: cloneState(baselineState),
    };
  }

  if (rule.ruleType === 'fixed_load') {
    return {
      decision: decision('hold', outcome, 'FIXED_LOAD_RULE', 'Bu hareket sabit hedefle takip edilir. Hedef aynı kalır.', evidence),
      nextState: { ...baselineState, failureCount: outcome === 'failure' ? baselineState.failureCount + 1 : 0 },
    };
  }

  if (loadResolution.kind === 'mixed') {
    return {
      decision: decision('hold', outcome, 'MIXED_WORKING_LOADS_UNSUPPORTED', 'Aynı egzersizde birden fazla çalışma yükü görüldü. Bu model top-set/back-off ayrımı taşımadığı için otomatik artış yapılmadı.', evidence),
      nextState: cloneState(previousState),
    };
  }

  if (loadResolution.kind === 'missing' && isLoadTrackedState(previousState, rule)) {
    return {
      decision: decision('hold', outcome, 'MISSING_WORKING_LOAD_BASELINE', 'Geçerli bir çalışma yükü bulunamadı. Yük hedefi veri olmadan artırılmadı.', evidence),
      nextState: cloneState(previousState),
    };
  }

  if (outcome === 'failure') {
    const failureCount = baselineState.failureCount + 1;
    const failedState = { ...baselineState, failureCount };
    if (failureCount >= rule.deloadThreshold) {
      return {
        decision: decision('recommend_deload', 'deload', 'DELOAD_THRESHOLD_REACHED', 'Birden fazla geçerli seansta hedef korunamadı. Egzersiz seçimi değişmeden daha hafif bir hafta önerilir.', evidence),
        nextState: deloadState(failedState, rule),
      };
    }
    if (failureCount >= rule.stallThreshold) {
      return {
        decision: decision('mark_stalled', 'plateau', 'STALL_THRESHOLD_REACHED', 'Hedef birkaç geçerli seansta tekrarlı şekilde kaçtı. Yük azaltılmadan önce stall olarak işaretlendi.', evidence),
        nextState: { ...failedState, plateauCount: failedState.plateauCount + 1 },
      };
    }
    if (failureCount >= rule.failureThreshold) {
      return {
        decision: decision('reduce_load', 'repeated_failure', 'REPEATED_FAILURE_REDUCTION', 'Bu hedef birkaç seansta kaçtı. İlerlemeyi yeniden kurmak için yük küçük azaltıldı.', evidence),
        nextState: reduceLoad(failedState, rule),
      };
    }
    return {
      decision: decision('repeat', 'failure', 'FIRST_FAILURE_REPEAT', 'Bir veya daha fazla set hedefin altında kaldı. Sonraki seansta aynı hedef tekrar edilir.', evidence),
      nextState: failedState,
    };
  }

  if (rule.ruleType === 'linear_reps' || rule.ruleType === 'rep_range' || rule.ruleType === 'time_based' || rule.ruleType === 'distance_based') {
    const repCap = Math.min(baselineState.targetRepMax, rule.maxReps);
    const nextTarget = Math.min(repCap, baselineState.targetReps + 1);
    if (nextTarget > baselineState.targetReps) {
      return {
        decision: decision('increase_reps', outcome, 'REP_TARGET_INCREASED', 'Hedef tekrarlar tamamlandı. Sonraki seans aynı yükle tekrar hedefi küçük artırıldı.', evidence),
        nextState: { ...baselineState, targetReps: nextTarget, failureCount: 0, plateauCount: 0 },
      };
    }
    return {
      decision: decision('hold', outcome, 'REP_UPPER_BOUND_HELD', 'Tekrar aralığının üst sınırındasın. Daha sert bir progresyon gözden geçirilene kadar hedef korunur.', evidence),
      nextState: { ...baselineState, failureCount: 0 },
    };
  }

  if (outcome === 'partial_success') {
    return {
      decision: decision('hold', 'partial_success', 'MINIMUM_TARGET_MET', 'Minimum hedef tamamlandı. Aynı yükle üst tekrar bandına yaklaş.', evidence),
      nextState: { ...baselineState, failureCount: 0 },
    };
  }

  if (rule.ruleType === 'double_progression' || rule.ruleType === 'linear_load' || rule.ruleType === 'top_set_backoff' || rule.ruleType === 'percentage_based' || rule.ruleType === 'rir_based') {
    const nextState = increaseLoad(baselineState, rule);
    return {
      decision: decision(
        nextState.targetLoadKg === undefined ? 'hold' : 'increase_load',
        'success',
        nextState.targetLoadKg === undefined ? 'MISSING_WORKING_LOAD_BASELINE' : 'LOAD_INCREASED',
        nextState.targetLoadKg === undefined
          ? 'Geçerli yük verisi olmadan artış yapılmadı. Mevcut hedef korunur.'
          : `Tüm setler üst hedefe ulaştı. Sonraki seansta ${nextState.targetLoadKg} kg hedefle.`,
        evidence,
      ),
      nextState,
    };
  }

  return {
    decision: decision('hold', outcome, 'SUPPORTED_RULE_HELD', 'Hedefler tamamlandı; bu kural için hedef korunur.', evidence),
    nextState: { ...baselineState, failureCount: 0 },
  };
}

export function evaluateProgressionDecision(input: ProgressionEvaluationInput): ProgressionEvaluationResult {
  const normalizedLog = normalizeCompletedExerciseLog(input.log);
  const logValidation = validateCompletedExerciseLog(normalizedLog);
  const ruleValidation = validateProgressionRule(input.rule);
  const fingerprint = createProgressionFingerprint({
    log: normalizedLog,
    previousState: input.previousState,
    rule: input.rule,
  });
  const base = {
    decisionId: `progression-${stableHash(fingerprint)}`,
    progressionFingerprint: fingerprint,
    programId: normalizedLog.programId,
    sessionId: normalizedLog.sessionId,
    workoutId: normalizedLog.workoutId,
    exerciseId: normalizedLog.exerciseId,
    ruleId: input.rule?.ruleId ?? input.previousState.ruleId,
    ruleVersion: input.rule?.ruleVersion ?? input.previousState.ruleVersion,
    engineVersion: PROGRESSION_ENGINE_VERSION,
    previousState: cloneState(input.previousState),
  };

  if (!logValidation.valid || !ruleValidation.valid || !input.rule) {
    const errors = [...logValidation.errors, ...ruleValidation.errors];
    const preserve = cloneState(input.previousState);
    return {
      normalizedLog,
      applied: {
        ...base,
        decision: decision('preserve', 'invalid', errors[0] ?? 'INVALID_PROGRESSION_INPUT', 'Progression uygulanmadı; log veya kural doğrulaması güvenli geçmedi.', errors),
        nextState: preserve,
        validation: { valid: false, errors, warnings: [...logValidation.warnings, ...ruleValidation.warnings] },
      },
    };
  }

  if (logValidation.warnings.includes('ALL_SETS_SKIPPED')) {
    const preserve = cloneState(input.previousState);
    return {
      normalizedLog,
      applied: {
        ...base,
        decision: decision('preserve', 'skipped', 'ALL_SETS_SKIPPED', 'Tüm setler atlandı. Bu seans progression sayılmaz.', logValidation.warnings),
        nextState: preserve,
        validation: { valid: true, errors: [], warnings: logValidation.warnings },
      },
    };
  }

  const evaluated = evaluateValid({
    log: normalizedLog,
    previousState: input.previousState,
    rule: input.rule,
  });

  return {
    normalizedLog,
    applied: {
      ...base,
      decision: evaluated.decision,
      nextState: evaluated.nextState,
      validation: { valid: true, errors: [], warnings: logValidation.warnings },
    },
  };
}
