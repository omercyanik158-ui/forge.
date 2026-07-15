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

function successEvidence(log: NormalizedCompletedExerciseLog, requiredSets: number): string[] {
  const working = log.sets.filter((set) => !set.skipped).slice(0, requiredSets);
  return working.map((set) => `Set ${set.setIndex}: ${set.reps ?? 0} reps @ ${set.loadKg ?? 0} kg`);
}

function requiredWorkingSets(log: NormalizedCompletedExerciseLog, requiredSets: number) {
  return log.sets.filter((set) => !set.skipped).slice(0, requiredSets);
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
  const current = state.targetLoadKg ?? 0;
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
  const current = state.targetLoadKg ?? 0;
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
  const outcome = classifyRepOutcome(log, previousState, rule);
  const evidence = successEvidence(log, previousState.targetSets);
  if (outcome === 'skipped') {
    return {
      decision: decision('preserve', 'skipped', 'ALL_SETS_SKIPPED', 'Bu hareket için tamamlanmış çalışma seti yok. Hedefler korunur.', evidence),
      nextState: cloneState(previousState),
    };
  }

  if (rule.ruleType === 'fixed_load') {
    return {
      decision: decision('hold', outcome, 'FIXED_LOAD_RULE', 'Bu hareket sabit hedefle takip edilir. Hedef aynı kalır.', evidence),
      nextState: { ...previousState, failureCount: outcome === 'failure' ? previousState.failureCount + 1 : 0 },
    };
  }

  if (outcome === 'failure') {
    const failureCount = previousState.failureCount + 1;
    const failedState = { ...previousState, failureCount };
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
    const repCap = Math.min(previousState.targetRepMax, rule.maxReps);
    const nextTarget = Math.min(repCap, previousState.targetReps + 1);
    if (nextTarget > previousState.targetReps) {
      return {
        decision: decision('increase_reps', outcome, 'REP_TARGET_INCREASED', 'Hedef tekrarlar tamamlandı. Sonraki seans aynı yükle tekrar hedefi küçük artırıldı.', evidence),
        nextState: { ...previousState, targetReps: nextTarget, failureCount: 0, plateauCount: 0 },
      };
    }
    return {
      decision: decision('hold', outcome, 'REP_UPPER_BOUND_HELD', 'Tekrar aralığının üst sınırındasın. Daha sert bir progresyon gözden geçirilene kadar hedef korunur.', evidence),
      nextState: { ...previousState, failureCount: 0 },
    };
  }

  if (outcome === 'partial_success') {
    return {
      decision: decision('hold', 'partial_success', 'MINIMUM_TARGET_MET', 'Minimum hedef tamamlandı. Aynı yükle üst tekrar bandına yaklaş.', evidence),
      nextState: { ...previousState, failureCount: 0 },
    };
  }

  if (rule.ruleType === 'double_progression' || rule.ruleType === 'linear_load' || rule.ruleType === 'top_set_backoff' || rule.ruleType === 'percentage_based' || rule.ruleType === 'rir_based') {
    const nextState = increaseLoad(previousState, rule);
    return {
      decision: decision('increase_load', 'success', 'LOAD_INCREASED', `Tüm setler üst hedefe ulaştı. Sonraki seansta ${nextState.targetLoadKg ?? 0} kg hedefle.`, evidence),
      nextState,
    };
  }

  return {
    decision: decision('hold', outcome, 'SUPPORTED_RULE_HELD', 'Hedefler tamamlandı; bu kural için hedef korunur.', evidence),
    nextState: { ...previousState, failureCount: 0 },
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
