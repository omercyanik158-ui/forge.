import type {
  AppliedProgressionDecision,
  CompletedExerciseLog,
  ExerciseProgressionRule,
  ExerciseProgressionState,
} from '@/types/aiProgramProgression';
import { findProgressionDecisionByFingerprint } from './progressionDecisionRepository';
import { evaluateProgressionDecision } from './evaluateProgressionDecision';
import {
  normalizeCompletedExerciseLog,
  validateCompletedExerciseLog,
  validateProgressionRule,
} from './progressionUtils';

export type ProgressionDebugReport = {
  rawCompletedExerciseLog: CompletedExerciseLog;
  normalizedLog: CompletedExerciseLog;
  currentState: ExerciseProgressionState;
  assignedRule: ExerciseProgressionRule | null;
  outcomeClassification: AppliedProgressionDecision['decision']['outcome'];
  successFailureEvidence: string[];
  loadRoundingDecision: {
    previousLoadKg?: number;
    nextLoadKg?: number;
    equipmentKind: ExerciseProgressionState['equipmentKind'];
  };
  failureCounter: {
    before: number;
    after: number;
  };
  stallEvaluation: {
    before: number;
    after: number;
    stalled: boolean;
  };
  deloadEvaluation: {
    before: number;
    after: number;
    recommended: boolean;
  };
  selectedDecision: AppliedProgressionDecision['decision'];
  previousTarget: ExerciseProgressionState;
  nextTarget: ExerciseProgressionState;
  progressionFingerprint: string;
  persistence: {
    reusedExisting: boolean;
  };
  validation: {
    log: ReturnType<typeof validateCompletedExerciseLog>;
    rule: ReturnType<typeof validateProgressionRule>;
    decision: AppliedProgressionDecision['validation'];
  };
};

export async function getProgressionDebugReport(input: {
  log: CompletedExerciseLog;
  previousState: ExerciseProgressionState;
  rule: ExerciseProgressionRule | null;
}): Promise<ProgressionDebugReport> {
  const evaluated = evaluateProgressionDecision(input);
  const existing = await findProgressionDecisionByFingerprint(evaluated.applied.progressionFingerprint);
  const normalized = normalizeCompletedExerciseLog(input.log);
  return {
    rawCompletedExerciseLog: input.log,
    normalizedLog: normalized,
    currentState: input.previousState,
    assignedRule: input.rule,
    outcomeClassification: evaluated.applied.decision.outcome,
    successFailureEvidence: evaluated.applied.decision.evidence,
    loadRoundingDecision: {
      previousLoadKg: evaluated.applied.previousState.targetLoadKg,
      nextLoadKg: evaluated.applied.nextState.targetLoadKg,
      equipmentKind: evaluated.applied.previousState.equipmentKind,
    },
    failureCounter: {
      before: evaluated.applied.previousState.failureCount,
      after: evaluated.applied.nextState.failureCount,
    },
    stallEvaluation: {
      before: evaluated.applied.previousState.plateauCount,
      after: evaluated.applied.nextState.plateauCount,
      stalled: evaluated.applied.decision.type === 'mark_stalled',
    },
    deloadEvaluation: {
      before: evaluated.applied.previousState.deloadCount,
      after: evaluated.applied.nextState.deloadCount,
      recommended: evaluated.applied.decision.type === 'recommend_deload' || evaluated.applied.decision.type === 'apply_deload',
    },
    selectedDecision: evaluated.applied.decision,
    previousTarget: evaluated.applied.previousState,
    nextTarget: evaluated.applied.nextState,
    progressionFingerprint: evaluated.applied.progressionFingerprint,
    persistence: {
      reusedExisting: !!existing,
    },
    validation: {
      log: validateCompletedExerciseLog(normalized),
      rule: validateProgressionRule(input.rule),
      decision: evaluated.applied.validation,
    },
  };
}
