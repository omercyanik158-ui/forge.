import type {
  CompletedExerciseLog,
  CompletedSetLog,
  ExerciseProgressionRule,
  ExerciseProgressionState,
  ProgressionEquipmentKind,
  ProgressionRuleType,
} from '@/types/aiProgramProgression';
import { FORGE_PROGRESSION_RULES as FORGE_PROGRESSION_RULES_STABLE } from '../generated/progressionRules.generated';

export const PROGRESSION_ENGINE_VERSION = 'forge-progression-engine:v1';
const FORGE_PROGRESSION_RULES = FORGE_PROGRESSION_RULES_STABLE;

export type NormalizedCompletedExerciseLog = CompletedExerciseLog & {
  sets: CompletedSetLog[];
};

export type ProgressionValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

export function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

export function stableHash(input: string): string {
  let hash = 5381;
  for (let index = 0; index < input.length; index += 1) {
    hash = ((hash << 5) + hash) ^ input.charCodeAt(index);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function normalizeCompletedExerciseLog(log: CompletedExerciseLog): NormalizedCompletedExerciseLog {
  return {
    ...log,
    sets: [...log.sets]
      .map((set) => ({
        setIndex: set.setIndex,
        reps: set.reps,
        loadKg: set.loadKg,
        durationSec: set.durationSec,
        distanceMeters: set.distanceMeters,
        rir: set.rir,
        rpe: set.rpe,
        skipped: set.skipped === true,
      }))
      .sort((left, right) => left.setIndex - right.setIndex),
  };
}

function isFiniteNonNegative(value: number | undefined): boolean {
  return value === undefined || (Number.isFinite(value) && value >= 0);
}

function isIntegerNonNegative(value: number | undefined): boolean {
  return value === undefined || (Number.isInteger(value) && value >= 0);
}

export function validateCompletedExerciseLog(log: CompletedExerciseLog): ProgressionValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!log.programId) errors.push('MISSING_PROGRAM_ID');
  if (!log.sessionId) errors.push('MISSING_SESSION_ID');
  if (!log.workoutId) errors.push('MISSING_WORKOUT_ID');
  if (!log.exerciseId) errors.push('MISSING_EXERCISE_ID');
  if (!log.submitted || !log.completed) errors.push('SESSION_NOT_SUBMITTED_OR_COMPLETED');
  if (!Array.isArray(log.sets) || log.sets.length === 0) errors.push('NO_SET_DATA');

  const seen = new Set<number>();
  for (const set of log.sets) {
    if (!Number.isInteger(set.setIndex) || set.setIndex < 1) errors.push('INVALID_SET_INDEX');
    if (seen.has(set.setIndex)) errors.push('DUPLICATE_SET_INDEX');
    seen.add(set.setIndex);
    if (!isIntegerNonNegative(set.reps)) errors.push('INVALID_REPS');
    if (!isFiniteNonNegative(set.loadKg)) errors.push('INVALID_LOAD');
    if (!isFiniteNonNegative(set.durationSec)) errors.push('INVALID_DURATION');
    if (!isFiniteNonNegative(set.distanceMeters)) errors.push('INVALID_DISTANCE');
    if (set.rir !== undefined && (!Number.isFinite(set.rir) || set.rir < 0 || set.rir > 10)) errors.push('INVALID_RIR');
    if (set.rpe !== undefined && (!Number.isFinite(set.rpe) || set.rpe < 1 || set.rpe > 10)) errors.push('INVALID_RPE');
  }
  if (log.sets.length > 0 && log.sets.every((set) => set.skipped)) warnings.push('ALL_SETS_SKIPPED');
  return { valid: errors.length === 0, errors: [...new Set(errors)], warnings: [...new Set(warnings)] };
}

export function validateProgressionRule(rule: ExerciseProgressionRule | null): ProgressionValidationResult {
  if (!rule) return { valid: false, errors: ['MISSING_PROGRESSION_RULE'], warnings: [] };
  const errors: string[] = [];
  if (!rule.ruleId) errors.push('MISSING_PROGRESSION_RULE');
  if (rule.ruleVersion < 1) errors.push('INVALID_RULE_VERSION');
  if (!Number.isInteger(rule.minReps) || !Number.isInteger(rule.maxReps) || rule.minReps < 0 || rule.maxReps < rule.minReps) errors.push('INVALID_REP_RANGE');
  if (!Number.isInteger(rule.targetSets) || rule.targetSets < 1) errors.push('INVALID_TARGET_SETS');
  if (!Number.isInteger(rule.failureThreshold) || rule.failureThreshold < 1) errors.push('INVALID_FAILURE_THRESHOLD');
  if (!Number.isInteger(rule.stallThreshold) || rule.stallThreshold < 1) errors.push('INVALID_STALL_THRESHOLD');
  if (!Number.isInteger(rule.deloadThreshold) || rule.deloadThreshold < 1) errors.push('INVALID_DELOAD_THRESHOLD');
  if (rule.loadIncrementKg !== undefined && (!Number.isFinite(rule.loadIncrementKg) || rule.loadIncrementKg < 0)) errors.push('INVALID_LOAD_INCREMENT');
  if (rule.loadIncrementPercent !== undefined && (!Number.isFinite(rule.loadIncrementPercent) || rule.loadIncrementPercent < 0 || rule.loadIncrementPercent > 20)) errors.push('INVALID_PERCENT_INCREMENT');
  if (rule.reductionPercent !== undefined && (!Number.isFinite(rule.reductionPercent) || rule.reductionPercent < 1 || rule.reductionPercent > 20)) errors.push('INVALID_REDUCTION_PERCENT');
  if (rule.deloadLoadMultiplier !== undefined && (rule.deloadLoadMultiplier <= 0 || rule.deloadLoadMultiplier >= 1)) errors.push('INVALID_DELOAD_LOAD_MULTIPLIER');
  if (rule.deloadSetMultiplier !== undefined && (rule.deloadSetMultiplier <= 0 || rule.deloadSetMultiplier >= 1)) errors.push('INVALID_DELOAD_SET_MULTIPLIER');
  return { valid: errors.length === 0, errors, warnings: [] };
}

export function ruleTypeFromGeneratedRule(ruleId: string, goal?: string, role?: string): ProgressionRuleType {
  const normalizedRole = role?.toLowerCase() ?? '';
  if (ruleId === 'linear_beginner') return 'linear_load';
  if (ruleId === 'double_progression') return 'double_progression';
  if (ruleId === 'rep_range_accessory') return 'rep_range';
  if (ruleId === 'fixed_load_technique') return 'fixed_load';
  if (ruleId === 'time_based_conditioning') return 'time_based';
  if (ruleId === 'distance_based_conditioning') return 'distance_based';
  if (ruleId === 'top_set_backoff') return normalizedRole.includes('main') ? 'top_set_backoff' : 'double_progression';
  if (ruleId === 'undulating_strength') return normalizedRole.includes('main') ? 'percentage_based' : 'linear_load';
  if (ruleId === 'powerbuilding_hybrid') return normalizedRole.includes('main') ? 'top_set_backoff' : 'double_progression';
  if (ruleId === 'bodyweight_rep_leverage') return 'linear_reps';
  if (ruleId === 'rep_goal') return 'linear_reps';
  if (goal === 'general_fitness') return 'rep_range';
  return 'fixed_load';
}

export function getGeneratedProgressionRule(ruleId: string): { nameTr: string } | null {
  return FORGE_PROGRESSION_RULES.find((rule) => rule.progressionRuleId === ruleId) ?? null;
}

export function defaultProgressionRule(input: {
  ruleId?: string;
  goal?: string;
  role?: string;
  sets: number;
  repsMin: number;
  repsMax: number;
  prescriptionType?: 'reps' | 'duration' | 'breaths' | 'rounds';
  equipmentKind: ProgressionEquipmentKind;
}): ExerciseProgressionRule | null {
  if (!input.ruleId) return null;
  const generated = getGeneratedProgressionRule(input.ruleId);
  if (!generated) return null;
  const ruleType = ruleTypeFromGeneratedRule(input.ruleId, input.goal, input.role);
  const isNonLoadPrescription = input.prescriptionType === 'duration' || input.prescriptionType === 'breaths' || input.prescriptionType === 'rounds';
  const isBodyweight = input.equipmentKind === 'bodyweight' || isNonLoadPrescription;
  const isStrength = input.goal === 'strength' || ruleType === 'linear_load' || ruleType === 'top_set_backoff' || ruleType === 'percentage_based';
  return {
    ruleId: input.ruleId,
    ruleType,
    ruleVersion: 1,
    displayName: generated.nameTr,
    minReps: input.repsMin,
    maxReps: Math.max(input.repsMin, input.repsMax),
    targetSets: Math.max(1, input.sets),
    loadIncrementKg: isBodyweight ? undefined : isStrength ? 2.5 : 1,
    loadIncrementPercent: isBodyweight ? undefined : isStrength ? 2.5 : 3,
    reductionPercent: isStrength ? 7.5 : 5,
    failureThreshold: isStrength ? 2 : 2,
    stallThreshold: isStrength ? 3 : 3,
    deloadThreshold: isStrength ? 4 : 4,
    deloadLoadMultiplier: 0.9,
    deloadSetMultiplier: 0.65,
  };
}

export function inferEquipmentKind(equipment: string[] | string | undefined): ProgressionEquipmentKind {
  const text = Array.isArray(equipment) ? equipment.join(' ').toLowerCase() : (equipment ?? '').toLowerCase();
  if (/bodyweight|vücut|none/.test(text)) return 'bodyweight';
  if (/dumbbell|db|dambıl/.test(text)) return 'dumbbell_pair';
  if (/cable/.test(text)) return 'cable_stack';
  if (/machine|smith|leg press/.test(text)) return 'machine_plate';
  if (/kettlebell/.test(text)) return 'kettlebell';
  if (/barbell|bench|squat|deadlift/.test(text)) return 'barbell';
  return 'unknown';
}

export function roundLoadForEquipment(loadKg: number, equipmentKind: ProgressionEquipmentKind): number {
  if (!Number.isFinite(loadKg) || loadKg <= 0) return 0;
  const stepMap: Record<ProgressionEquipmentKind, number> = {
    barbell: 2.5,
    dumbbell_pair: 2,
    cable_stack: 2.5,
    machine_plate: 5,
    kettlebell: 4,
    bodyweight: 0,
    time: 0,
    distance: 0,
    unknown: 1,
  };
  const step = stepMap[equipmentKind];
  if (step <= 0) return 0;
  return Math.max(0, Math.round(loadKg / step) * step);
}

export function createInitialProgressionState(input: {
  programId: string;
  exerciseId: string;
  rule: ExerciseProgressionRule;
  targetLoadKg?: number;
  equipmentKind: ProgressionEquipmentKind;
  sourceExerciseId?: string;
  substitutedFromExerciseId?: string;
}): ExerciseProgressionState {
  return {
    programId: input.programId,
    exerciseId: input.exerciseId,
    ruleId: input.rule.ruleId,
    ruleType: input.rule.ruleType,
    ruleVersion: input.rule.ruleVersion,
    targetSets: input.rule.targetSets,
    targetRepMin: input.rule.minReps,
    targetRepMax: input.rule.maxReps,
    targetReps: input.rule.minReps,
    targetLoadKg: input.equipmentKind === 'bodyweight' ? undefined : input.targetLoadKg,
    equipmentKind: input.equipmentKind,
    failureCount: 0,
    plateauCount: 0,
    deloadCount: 0,
    sourceExerciseId: input.sourceExerciseId,
    substitutedFromExerciseId: input.substitutedFromExerciseId,
  };
}
