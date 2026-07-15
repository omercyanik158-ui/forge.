import type { AssembledDay } from './aiProgramAssembly';
import type { SessionVolumeBlueprint } from './aiProgramVolume';
import type { AIProgramExperience, AIProgramFamily, AIProgramGoal, AIProgramGoalClassification } from './aiProgram';
import type { AIProgramProgressionModel } from './aiProgramDecision';

/**
 * Faz 7 — Progression & Fatigue
 *
 * Faz 6'nın tek haftalık gün listesini çok-haftalı bir bloğa dönüştürür.
 * createWeeks()'in (programCatalog.ts) yerini alır: blanket linear RIR düşürme
 * yerine, effort ceiling, progression archetype ve deload cadence ile
 * bireyselleştirilmiş ilerleme uygular.
 *
 * Constitution: ilerleme ölçülü ve sürdürülebilirdir. Reaktif autoregülasyon
 * (Faz 10) gelene kadar sadece zamanlanmış deload kullanılır.
 */

export type ProgressionWeek = {
  weekIndex: number;
  title: string;
  guidance: string;
  days: AssembledDay[];
  totalWeeklySets: number;
  isDeload: boolean;
  /** RIR kayması (negatif = daha agresif). */
  rirDelta: number;
  /** Hacim çarpanı (1.0 = baseline, 0.6 = deload). */
  volumeFactor: number;
};

export type FatigueModelSnapshot = {
  weeklyVolumeTrend: { weekIndex: number; totalSets: number; isDeload: boolean }[];
  peakWeek: number;
  deloadWeeks: number[];
  assumptions: string[];
};

export type ProgressionPlan = {
  weeks: ProgressionWeek[];
  weekCount: number;
  deloadWeeks: number[];
  fatigueModel: FatigueModelSnapshot;
  model: AIProgramProgressionModel;
  family: AIProgramFamily;
  goalClassification: AIProgramGoalClassification;
  progressionNotes: string[];
};

export type ProgressionEngineInput = {
  baseDays: AssembledDay[];
  effort: SessionVolumeBlueprint['effort'];
  experience: AIProgramExperience;
  goal: AIProgramGoal;
  family?: AIProgramFamily;
  goalClassification?: AIProgramGoalClassification;
  progressionModel?: AIProgramProgressionModel;
};

export type ProgressionRuleType =
  | 'double_progression'
  | 'linear_load'
  | 'linear_reps'
  | 'percentage_based'
  | 'rep_range'
  | 'top_set_backoff'
  | 'rir_based'
  | 'fixed_load'
  | 'time_based'
  | 'distance_based';

export type ProgressionDecisionType =
  | 'preserve'
  | 'hold'
  | 'repeat'
  | 'increase_load'
  | 'increase_reps'
  | 'reduce_load'
  | 'reduce_sets'
  | 'recommend_deload'
  | 'apply_deload'
  | 'mark_stalled';

export type ProgressionOutcomeClassification =
  | 'invalid'
  | 'skipped'
  | 'success'
  | 'partial_success'
  | 'failure'
  | 'repeated_failure'
  | 'plateau'
  | 'deload';

export type ProgressionEquipmentKind =
  | 'barbell'
  | 'dumbbell_pair'
  | 'cable_stack'
  | 'machine_plate'
  | 'kettlebell'
  | 'bodyweight'
  | 'time'
  | 'distance'
  | 'unknown';

export type ExerciseProgressionRule = {
  ruleId: string;
  ruleType: ProgressionRuleType;
  ruleVersion: number;
  displayName: string;
  requiresRir?: boolean;
  requiresRpe?: boolean;
  minReps: number;
  maxReps: number;
  targetSets: number;
  loadIncrementKg?: number;
  loadIncrementPercent?: number;
  reductionPercent?: number;
  failureThreshold: number;
  stallThreshold: number;
  deloadThreshold: number;
  deloadLoadMultiplier?: number;
  deloadSetMultiplier?: number;
  minLoadKg?: number;
  maxLoadKg?: number;
};

export type ExerciseProgressionState = {
  programId: string;
  exerciseId: string;
  ruleId: string;
  ruleType: ProgressionRuleType;
  ruleVersion: number;
  targetSets: number;
  targetRepMin: number;
  targetRepMax: number;
  targetReps: number;
  targetLoadKg?: number;
  targetDurationSec?: number;
  targetDistanceMeters?: number;
  equipmentKind: ProgressionEquipmentKind;
  failureCount: number;
  plateauCount: number;
  deloadCount: number;
  lastProcessedSessionId?: string;
  sourceExerciseId?: string;
  substitutedFromExerciseId?: string;
  updatedAt?: string;
};

export type CompletedSetLog = {
  setIndex: number;
  reps?: number;
  loadKg?: number;
  durationSec?: number;
  distanceMeters?: number;
  rir?: number;
  rpe?: number;
  skipped?: boolean;
};

export type CompletedExerciseLog = {
  programId: string;
  sessionId: string;
  workoutId: string;
  exerciseId: string;
  completedAt?: string;
  submitted: boolean;
  completed: boolean;
  sets: CompletedSetLog[];
};

export type ProgressionDecision = {
  type: ProgressionDecisionType;
  outcome: ProgressionOutcomeClassification;
  reasonCode: string;
  explanation: string;
  evidence: string[];
};

export type AppliedProgressionDecision = {
  decisionId: string;
  progressionFingerprint: string;
  programId: string;
  sessionId: string;
  workoutId: string;
  exerciseId: string;
  ruleId: string;
  ruleVersion: number;
  engineVersion: string;
  decision: ProgressionDecision;
  previousState: ExerciseProgressionState;
  nextState: ExerciseProgressionState;
  validation: {
    valid: boolean;
    errors: string[];
    warnings: string[];
  };
  persistedAt?: string;
  reusedExisting?: boolean;
};

export type ExerciseProgressionPreview = {
  exerciseId: string;
  targetLoadKg?: number;
  targetRepMin?: number;
  targetRepMax?: number;
  targetSets: number;
  progressionRuleName: string;
  previousDecision?: ProgressionDecision;
  explanation?: string;
};
