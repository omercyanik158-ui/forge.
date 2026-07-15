import type {
  AIProgramGoal,
  AIProgramPainLimitation,
  AIProgramEquipmentKey,
  AIProgramExperience,
  AIProgramRecoveryQuality,
} from './aiProgram';
import type { AIProgramArchetypeKey, AIProgramSplitKey } from './aiProgramDecision';
import type { ExerciseCategory, MovementPattern, PriorityMuscleBucket } from './exerciseKB';
import type { SessionVolumeBlueprint } from './aiProgramVolume';

/**
 * Faz 6 — Selection & Assembly Engine
 *
 * Bu faz, Faz 4 (KB) ve Faz 5 (volume blueprint) çıktılarını birleştirerek
 * her antrenman günü için somut hareket listesi üretir. ProgramExercisePrescription
 * ile uyumlu ama henüz çok-haftalı ilerleme içermiyor (o Faz 7'nin işi).
 *
 * Constitution: seçim deterministik ve açıklanabilirdir. Her hareket bir
 * "neden" (why) taşır. Aynı pattern'den gereksiz tekrar önlenir (redundancy).
 */

export type StrengthSessionBlockRole =
  | 'main_lower_lift'
  | 'main_upper_lift'
  | 'primary_pull'
  | 'secondary_strength_movement'
  | 'assistance'
  | 'core_bracing';

export type StrengthProgressionMethod =
  | 'linear_load_progression'
  | 'rep_range_progression'
  | 'top_set_backoff'
  | 'rpe_weekly_progression';

export type StrengthExerciseRejection = {
  exerciseId: string;
  reason: string;
};

export type StrengthExerciseDebug = {
  slot: StrengthSessionBlockRole;
  dayRole: string;
  rejectedExerciseIds: StrengthExerciseRejection[];
  similarityGroup: string;
  fatigueScore: number;
  strengthSuitability: number;
  progressionMethod?: StrengthProgressionMethod;
};

export type AssembledExercise = {
  exerciseId: string;
  sets: number;
  reps: number;
  repLabel: string;
  restSeconds: number;
  rir: number;
  alternatives: string[];
  /** Bu hareketin seçilme nedeni (açıklanabilirlik). */
  why: string;
  category: ExerciseCategory;
  pattern: MovementPattern;
  primaryBucket: PriorityMuscleBucket;
  strengthSlot?: StrengthSessionBlockRole;
  progressionMethod?: StrengthProgressionMethod;
  debug?: StrengthExerciseDebug;
};

export type AssembledDay = {
  dayIndex: number;
  title: string;
  exercises: AssembledExercise[];
  totalSets: number;
  estimatedDurationMin: number;
  bucketsCovered: PriorityMuscleBucket[];
  notes?: string[];
};

export type ProgramAuditCategoryKey =
  | 'musclePrioritization'
  | 'regionalBalance'
  | 'sequencing'
  | 'weeklyVolume'
  | 'frequency'
  | 'exerciseSelection'
  | 'redundancy'
  | 'fatigue'
  | 'userFit';

export type ProgramAuditCategoryScore = {
  key: ProgramAuditCategoryKey;
  label: string;
  score: number;
  maxScore: number;
};

export type ProgramAuditResult = {
  score: number;
  passed: boolean;
  categories: ProgramAuditCategoryScore[];
  warnings: string[];
  requiredFixes: string[];
};

export type SessionAssemblyPlan = {
  split: AIProgramSplitKey;
  programArchetype?: AIProgramArchetypeKey;
  days: AssembledDay[];
  selectionNotes: string[];
  warnings: string[];
  audit?: ProgramAuditResult;
  debug?: {
    strength?: {
      archetype: string;
      weeklyBlueprint: string[];
      dayRoles: string[];
      fatigueDistribution: { dayIndex: number; title: string; totalSets: number; highFatigueCount: number }[];
      audit: ProgramAuditResult;
      repairs: string[];
    };
  };
};

export type AssemblyEngineInput = {
  split: AIProgramSplitKey;
  programArchetype?: AIProgramArchetypeKey;
  selectionSeed?: string;
  recommendedTrainingDays: number;
  volumeBlueprint: SessionVolumeBlueprint;
  availableEquipment: AIProgramEquipmentKey[];
  limitations: AIProgramPainLimitation[];
  goal: AIProgramGoal;
  sex?: 'male' | 'female';
  experience?: AIProgramExperience;
  sessionDurationMin?: number;
  recoveryQuality?: AIProgramRecoveryQuality;
  preferredExerciseIds?: string[];
  avoidedExerciseIds?: string[];
};
