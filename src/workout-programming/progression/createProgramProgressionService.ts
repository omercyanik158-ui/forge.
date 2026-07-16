import type { WorkoutLog } from '@/types';
import { getProgressionWritesFeatureState } from '@/services/workoutEngineFeatureFlags';
import type { AIProgramPlan, AIDayPrescription } from '@/types/aiProgramPlan';
import type {
  AppliedProgressionDecision,
  CompletedExerciseLog,
  CompletedSetLog,
  ExerciseProgressionPreview,
  ExerciseProgressionRule,
  ExerciseProgressionState,
} from '@/types/aiProgramProgression';
import { READ_COMPAT_PROGRAM_TEMPLATES } from '@/services/templateProgramEngine';
import {
  createInitialProgressionState,
  defaultProgressionRule,
  inferEquipmentKind,
} from './progressionUtils';
import {
  createProgressionFingerprint,
  evaluateProgressionDecision,
} from './evaluateProgressionDecision';
import {
  findProgressionDecisionByFingerprint,
  loadProgressionDecisions,
  loadExerciseProgressionState,
  persistProgressionDecision,
} from './progressionDecisionRepository';

type RuleResolution = {
  rule: ExerciseProgressionRule | null;
  initialState: ExerciseProgressionState;
};

function findTemplate(plan: AIProgramPlan) {
  return READ_COMPAT_PROGRAM_TEMPLATES.find((template) => template.templateId === plan.selectedTemplateId) ?? null;
}

function findTemplateExercise(plan: AIProgramPlan, day: AIDayPrescription, exerciseId: string) {
  const template = findTemplate(plan);
  if (!template) return null;
  const workout = template.workouts.find((item) => item.dayIndex === day.dayIndex + 1) ?? template.workouts[day.dayIndex] ?? null;
  return workout?.exercises.find((exercise) => exercise.exerciseId === exerciseId) ?? null;
}

function resolveRule(plan: AIProgramPlan, day: AIDayPrescription, exerciseId: string): RuleResolution | null {
  const prescription = day.exercises.find((exercise) => exercise.exerciseId === exerciseId);
  if (!prescription) return null;
  const template = findTemplate(plan);
  const templateExercise = findTemplateExercise(plan, day, exerciseId);
  const equipmentKind = inferEquipmentKind(templateExercise?.equipment);
  const rule = defaultProgressionRule({
    ruleId: templateExercise?.progressionRuleId,
    goal: template?.goal ?? plan.goal,
    role: templateExercise?.role,
    sets: prescription.sets,
    repsMin: templateExercise?.repsMin ?? Math.max(1, prescription.reps),
    repsMax: templateExercise?.repsMax ?? Math.max(1, prescription.reps),
    prescriptionType: templateExercise?.prescriptionType ?? prescription.prescriptionType ?? 'reps',
    equipmentKind,
  });
  if (!rule) {
    return {
      rule: null,
      initialState: {
        programId: plan.id,
        exerciseId,
        ruleId: 'missing',
        ruleType: 'fixed_load',
        ruleVersion: 0,
        targetSets: prescription.sets,
        targetRepMin: Math.max(1, prescription.reps),
        targetRepMax: Math.max(1, prescription.reps),
        targetReps: Math.max(1, prescription.reps),
        equipmentKind,
        failureCount: 0,
        plateauCount: 0,
        deloadCount: 0,
      },
    };
  }
  return {
    rule,
    initialState: createInitialProgressionState({
      programId: plan.id,
      exerciseId,
      rule,
      targetLoadKg: undefined,
      equipmentKind,
      sourceExerciseId: templateExercise?.canonicalExerciseId,
    }),
  };
}

function groupedCompletedSets(log: WorkoutLog, exerciseId: string): CompletedSetLog[] {
  return (log.setEntries ?? [])
    .filter((set) => set.kind === 'working' && set.exerciseId === exerciseId)
    .map((set, index) => ({
      setIndex: index + 1,
      reps: set.reps,
      loadKg: set.kg,
      skipped: false,
    }));
}

function createCompletedExerciseLog(log: WorkoutLog, plan: AIProgramPlan, day: AIDayPrescription, exerciseId: string): CompletedExerciseLog {
  return {
    programId: plan.id,
    sessionId: log.id,
    workoutId: day.id,
    exerciseId,
    completedAt: log.completedAt,
    submitted: true,
    completed: true,
    sets: groupedCompletedSets(log, exerciseId),
  };
}

export async function processAIProgramWorkoutProgression(input: {
  plan: AIProgramPlan;
  day: AIDayPrescription;
  workoutLog: WorkoutLog;
}): Promise<AppliedProgressionDecision[]> {
  const feature = getProgressionWritesFeatureState();
  if (!feature.enabled) return [];
  const decisions: AppliedProgressionDecision[] = [];
  for (const exerciseId of input.day.exerciseIds) {
    const resolved = resolveRule(input.plan, input.day, exerciseId);
    if (!resolved) continue;
    const existingState = await loadExerciseProgressionState(input.plan.id, exerciseId);
    const previousState = existingState ?? resolved.initialState;
    if (previousState.lastProcessedSessionId === input.workoutLog.id) {
      const existingSessionDecision = (await loadProgressionDecisions()).find((decision) =>
        decision.programId === input.plan.id &&
        decision.exerciseId === exerciseId &&
        decision.sessionId === input.workoutLog.id
      );
      if (existingSessionDecision) {
        decisions.push({ ...existingSessionDecision, reusedExisting: true });
        continue;
      }
    }
    const completedLog = createCompletedExerciseLog(input.workoutLog, input.plan, input.day, exerciseId);
    const evaluation = evaluateProgressionDecision({
      log: completedLog,
      previousState,
      rule: resolved.rule,
    });
    const existingDecision = await findProgressionDecisionByFingerprint(evaluation.applied.progressionFingerprint);
    if (existingDecision) {
      decisions.push({ ...existingDecision, reusedExisting: true });
      continue;
    }
    if (!evaluation.applied.validation.valid) {
      decisions.push(evaluation.applied);
      continue;
    }
    decisions.push(await persistProgressionDecision(evaluation.applied));
  }
  return decisions;
}

export async function getExerciseProgressionPreview(input: {
  plan: AIProgramPlan;
  day: AIDayPrescription;
  exerciseId: string;
}): Promise<ExerciseProgressionPreview | null> {
  const resolved = resolveRule(input.plan, input.day, input.exerciseId);
  if (!resolved?.rule) return null;
  const state = await loadExerciseProgressionState(input.plan.id, input.exerciseId) ?? resolved.initialState;
  return {
    exerciseId: input.exerciseId,
    targetLoadKg: state.targetLoadKg,
    targetRepMin: state.targetRepMin,
    targetRepMax: state.targetRepMax,
    targetSets: state.targetSets,
    progressionRuleName: resolved.rule.displayName,
    explanation: state.targetLoadKg === undefined
      ? (state.equipmentKind === 'bodyweight' || state.equipmentKind === 'time' || state.equipmentKind === 'distance'
        ? 'Bu hareket tekrar hedefiyle takip edilir.'
        : 'İlk geçerli çalışma yükü tamamlandıktan sonra sonraki seans hedefi burada gösterilir.')
      : `${state.targetSets} set · ${state.targetRepMin}-${state.targetRepMax} tekrar · ${state.targetLoadKg} kg hedef.`,
  };
}

export function previewProgressionFingerprint(input: {
  log: CompletedExerciseLog;
  previousState: ExerciseProgressionState;
  rule: ExerciseProgressionRule | null;
}): string {
  const normalized = {
    ...input.log,
    sets: [...input.log.sets].sort((left, right) => left.setIndex - right.setIndex),
  };
  return createProgressionFingerprint({
    log: normalized,
    previousState: input.previousState,
    rule: input.rule,
  });
}
