import { PROGRAM_TEMPLATES, type TemplateEngineResult } from '@/services/templateProgramEngine';
import { orderProgramWorkouts } from '@/workout-programming/ordering/orderWorkoutExercises';
import type { ForgeGeneratedExercise, ForgeGeneratedTemplate, ForgeGeneratedWorkoutDay } from '@/workout-programming/types/csvWorkoutBrain';

export type SemanticSeverity = 'error' | 'warning';

export type SemanticValidationIssue = {
  severity: SemanticSeverity;
  code: string;
  message: string;
  location: string;
};

export type SemanticValidationStatus = 'APPROVED' | 'APPROVED_WITH_WARNINGS' | 'NEEDS_REVISION' | 'REJECTED';

export type SemanticDayMetrics = {
  dayIndex: number;
  exerciseCount: number;
  totalSets: number;
  movementPatternCounts: Record<string, number>;
  muscleSetCounts: Record<string, number>;
};

export type SemanticTemplateMetrics = {
  totalWeeklySets: number;
  weeklyMovementPatternCounts: Record<string, number>;
  weeklyMuscleSetCounts: Record<string, number>;
  muscleFrequencies: Record<string, number>;
  dayMetrics: SemanticDayMetrics[];
};

export type SemanticValidationResult = {
  templateId: string;
  status: SemanticValidationStatus;
  errors: SemanticValidationIssue[];
  warnings: SemanticValidationIssue[];
  metrics: SemanticTemplateMetrics;
};

const PUSH_PATTERNS = new Set(['horizontal_push', 'vertical_push', 'incline_push', 'dip']);
const PULL_PATTERNS = new Set(['horizontal_pull', 'vertical_pull', 'pullover']);
const KNEE_PATTERNS = new Set(['squat', 'lunge', 'knee_extension']);
const POSTERIOR_PATTERNS = new Set(['hinge', 'knee_flexion', 'hip_thrust', 'glute_bridge']);
const CORE_PATTERNS = new Set(['anti_extension', 'anti_rotation', 'spinal_flexion', 'spinal_extension', 'loaded_carry', 'core']);
const LOWER_PATTERNS = new Set([...KNEE_PATTERNS, ...POSTERIOR_PATTERNS]);
const TECHNICAL_ROLES = new Set(['main_lift', 'secondary_compound', 'accessory_compound']);
const LATE_ROLES = new Set(['isolation', 'core', 'conditioning']);

function addIssue(
  target: SemanticValidationIssue[],
  severity: SemanticSeverity,
  code: string,
  message: string,
  location: string,
): void {
  target.push({ severity, code, message, location });
}

function hasPattern(day: ForgeGeneratedWorkoutDay, patterns: Set<string>): boolean {
  return day.exercises.some((exercise) => patterns.has(exercise.movementPattern));
}

function countPattern(day: ForgeGeneratedWorkoutDay, patterns: Set<string>): number {
  return day.exercises.filter((exercise) => patterns.has(exercise.movementPattern)).length;
}

function sortedExercises(day: ForgeGeneratedWorkoutDay): ForgeGeneratedExercise[] {
  return [...day.exercises].sort((left, right) => left.order - right.order);
}

function location(template: ForgeGeneratedTemplate, day: ForgeGeneratedWorkoutDay, suffix?: string): string {
  return suffix ? `${template.templateId}:day-${day.dayIndex}:${suffix}` : `${template.templateId}:day-${day.dayIndex}`;
}

function createEmptyMetrics(): SemanticTemplateMetrics {
  return {
    totalWeeklySets: 0,
    weeklyMovementPatternCounts: {},
    weeklyMuscleSetCounts: {},
    muscleFrequencies: {},
    dayMetrics: [],
  };
}

function increment(target: Record<string, number>, key: string, amount = 1): void {
  target[key] = (target[key] ?? 0) + amount;
}

export function analyzeTemplateSemantics(template: ForgeGeneratedTemplate): SemanticTemplateMetrics {
  const metrics = createEmptyMetrics();
  const muscleSeenDays = new Map<string, Set<number>>();

  for (const day of template.workouts) {
    const dayMetrics: SemanticDayMetrics = {
      dayIndex: day.dayIndex,
      exerciseCount: day.exercises.length,
      totalSets: 0,
      movementPatternCounts: {},
      muscleSetCounts: {},
    };

    for (const exercise of day.exercises) {
      metrics.totalWeeklySets += exercise.sets;
      dayMetrics.totalSets += exercise.sets;
      increment(dayMetrics.movementPatternCounts, exercise.movementPattern);
      increment(metrics.weeklyMovementPatternCounts, exercise.movementPattern);
      for (const muscle of exercise.primaryMuscles) {
        increment(dayMetrics.muscleSetCounts, muscle, exercise.sets);
        increment(metrics.weeklyMuscleSetCounts, muscle, exercise.sets);
        const days = muscleSeenDays.get(muscle) ?? new Set<number>();
        days.add(day.dayIndex);
        muscleSeenDays.set(muscle, days);
      }
    }

    metrics.dayMetrics.push(dayMetrics);
  }

  for (const [muscle, days] of muscleSeenDays.entries()) {
    metrics.muscleFrequencies[muscle] = days.size;
  }

  return metrics;
}

function validateOrdering(template: ForgeGeneratedTemplate, day: ForgeGeneratedWorkoutDay, errors: SemanticValidationIssue[], warnings: SemanticValidationIssue[]): void {
  const exercises = sortedExercises(day);
  const firstLateIndex = exercises.findIndex((exercise) => LATE_ROLES.has(exercise.role));
  if (firstLateIndex === -1) return;
  const lateExercise = exercises[firstLateIndex];
  const laterTechnical = exercises.slice(firstLateIndex + 1).find((exercise) => TECHNICAL_ROLES.has(exercise.role));
  if (!laterTechnical) return;
  const code = laterTechnical.role === 'main_lift' ? 'main_lift_after_late_work' : 'compound_after_late_work';
  const severity: SemanticSeverity = laterTechnical.role === 'main_lift' ? 'error' : 'warning';
  addIssue(
    severity === 'error' ? errors : warnings,
    severity,
    code,
    `${laterTechnical.exerciseName} appears after ${lateExercise.exerciseName}; heavy or technical work should not be buried after isolation/core/conditioning.`,
    location(template, day, laterTechnical.canonicalExerciseId),
  );
}

function validateDayRedundancy(template: ForgeGeneratedTemplate, day: ForgeGeneratedWorkoutDay, warnings: SemanticValidationIssue[]): void {
  const byPattern = day.exercises.reduce<Record<string, number>>((acc, exercise) => {
    increment(acc, exercise.movementPattern);
    return acc;
  }, {});
  for (const [pattern, count] of Object.entries(byPattern)) {
    if (count > 3) {
      addIssue(warnings, 'warning', 'same_pattern_redundancy', `${pattern} appears ${count} times in one session.`, location(template, day, pattern));
    }
  }

  if (template.goal === 'strength' && countPattern(day, PUSH_PATTERNS) > 2) {
    addIssue(warnings, 'warning', 'strength_press_redundancy', 'Strength day has more than two pressing movements.', location(template, day));
  }
}

function validateFullBodyDay(template: ForgeGeneratedTemplate, day: ForgeGeneratedWorkoutDay, errors: SemanticValidationIssue[]): void {
  const checks: [string, Set<string>, string][] = [
    ['full_body_missing_lower', LOWER_PATTERNS, 'Full-body day needs a lower-body movement.'],
    ['full_body_missing_push', PUSH_PATTERNS, 'Full-body day needs an upper-body push.'],
    ['full_body_missing_pull', PULL_PATTERNS, 'Full-body day needs an upper-body pull.'],
    ['full_body_missing_posterior', POSTERIOR_PATTERNS, 'Full-body day needs posterior-chain, hinge, or knee-flexion exposure.'],
  ];
  for (const [code, patterns, message] of checks) {
    if (!hasPattern(day, patterns)) addIssue(errors, 'error', code, message, location(template, day));
  }
}

function validateUpperLowerDay(template: ForgeGeneratedTemplate, day: ForgeGeneratedWorkoutDay, errors: SemanticValidationIssue[]): void {
  const label = `${day.name} ${day.focus.join(' ')}`.toLowerCase();
  if (label.includes('upper')) {
    if (!hasPattern(day, PUSH_PATTERNS)) addIssue(errors, 'error', 'upper_day_missing_push', 'Upper day needs at least one push.', location(template, day));
    if (!hasPattern(day, PULL_PATTERNS)) addIssue(errors, 'error', 'upper_day_missing_pull', 'Upper day needs at least one pull.', location(template, day));
  }
  if (label.includes('lower')) {
    if (!hasPattern(day, KNEE_PATTERNS)) addIssue(errors, 'error', 'lower_day_missing_knee_dominant', 'Lower day needs a knee-dominant movement.', location(template, day));
    if (!hasPattern(day, POSTERIOR_PATTERNS)) addIssue(errors, 'error', 'lower_day_missing_posterior', 'Lower day needs posterior-chain exposure.', location(template, day));
  }
}

function validatePplDay(template: ForgeGeneratedTemplate, day: ForgeGeneratedWorkoutDay, errors: SemanticValidationIssue[], warnings: SemanticValidationIssue[]): void {
  const label = `${day.name} ${day.focus.join(' ')}`.toLowerCase();
  if (label.includes('push')) {
    if (!hasPattern(day, PUSH_PATTERNS)) addIssue(errors, 'error', 'push_day_missing_push', 'Push day needs pressing work.', location(template, day));
    if (countPattern(day, PULL_PATTERNS) > 1) addIssue(warnings, 'warning', 'push_day_excess_pull', 'Push day contains an unrelated pulling block.', location(template, day));
  }
  if (label.includes('pull')) {
    if (!hasPattern(day, PULL_PATTERNS)) addIssue(errors, 'error', 'pull_day_missing_pull', 'Pull day needs vertical or horizontal pulling.', location(template, day));
    if (countPattern(day, PUSH_PATTERNS) > 0) addIssue(warnings, 'warning', 'pull_day_pressing_spillover', 'Pull day contains pressing work.', location(template, day));
  }
  if (label.includes('leg') || label.includes('legs')) {
    if (!hasPattern(day, KNEE_PATTERNS)) addIssue(errors, 'error', 'leg_day_missing_knee_dominant', 'Leg day needs a knee-dominant movement.', location(template, day));
    if (!hasPattern(day, POSTERIOR_PATTERNS)) addIssue(errors, 'error', 'leg_day_missing_posterior', 'Leg day needs posterior-chain exposure.', location(template, day));
  }
}

function validateWeeklyCoverage(template: ForgeGeneratedTemplate, metrics: SemanticTemplateMetrics, errors: SemanticValidationIssue[], warnings: SemanticValidationIssue[]): void {
  const weekly = metrics.weeklyMovementPatternCounts;
  const hasWeekly = (patterns: Set<string>) => [...patterns].some((pattern) => (weekly[pattern] ?? 0) > 0);

  if (template.goal === 'general_fitness') {
    const required: [string, Set<string>, string][] = [
      ['general_missing_knee', KNEE_PATTERNS, 'General fitness week needs squat or knee-dominant work.'],
      ['general_missing_posterior', POSTERIOR_PATTERNS, 'General fitness week needs hinge or posterior-chain work.'],
      ['general_missing_push', PUSH_PATTERNS, 'General fitness week needs pushing work.'],
      ['general_missing_pull', PULL_PATTERNS, 'General fitness week needs pulling work.'],
      ['general_missing_core', CORE_PATTERNS, 'General fitness week needs core, carry, or trunk work.'],
    ];
    for (const [code, patterns, message] of required) {
      if (!hasWeekly(patterns)) addIssue(errors, 'error', code, message, template.templateId);
    }
  }

  if (template.goal === 'powerbuilding') {
    const mainLiftCount = template.workouts.flatMap((day) => day.exercises).filter((exercise) => exercise.role === 'main_lift').length;
    const assistanceCount = template.workouts.flatMap((day) => day.exercises).filter((exercise) => exercise.role !== 'main_lift').length;
    if (mainLiftCount === 0) addIssue(errors, 'error', 'powerbuilding_missing_main_lift', 'Powerbuilding template needs identifiable heavy main-lift work.', template.templateId);
    if (assistanceCount === 0) addIssue(errors, 'error', 'powerbuilding_missing_assistance', 'Powerbuilding template needs hypertrophy assistance after main lifts.', template.templateId);
  }

  if (template.goal === 'strength') {
    const mainLiftCount = template.workouts.flatMap((day) => day.exercises).filter((exercise) => exercise.role === 'main_lift').length;
    if (mainLiftCount === 0) addIssue(errors, 'error', 'strength_missing_main_lift', 'Strength template needs main-lift work.', template.templateId);
  }

  const chestSets = (metrics.weeklyMuscleSetCounts.chest ?? 0) + (metrics.weeklyMuscleSetCounts.upper_chest ?? 0);
  const backSets = (metrics.weeklyMuscleSetCounts.lats ?? 0) + (metrics.weeklyMuscleSetCounts.upper_back ?? 0) + (metrics.weeklyMuscleSetCounts.back ?? 0);
  if (chestSets > 0 && backSets > 0 && chestSets > backSets * 1.75) {
    addIssue(warnings, 'warning', 'push_pull_weekly_imbalance', 'Weekly chest/pressing exposure is much higher than back exposure.', template.templateId);
  }
}

function statusFromIssues(errors: SemanticValidationIssue[], warnings: SemanticValidationIssue[]): SemanticValidationStatus {
  if (errors.length >= 3) return 'REJECTED';
  if (errors.length > 0) return 'NEEDS_REVISION';
  if (warnings.length > 0) return 'APPROVED_WITH_WARNINGS';
  return 'APPROVED';
}

export function validateTemplateSemantics(template: ForgeGeneratedTemplate): SemanticValidationResult {
  const errors: SemanticValidationIssue[] = [];
  const warnings: SemanticValidationIssue[] = [];
  const metrics = analyzeTemplateSemantics(template);

  if (template.workouts.length !== template.daysPerWeek) {
    addIssue(errors, 'error', 'template_day_count_mismatch', 'Template workout count does not match daysPerWeek.', template.templateId);
  }

  for (const day of template.workouts) {
    validateOrdering(template, day, errors, warnings);
    validateDayRedundancy(template, day, warnings);
    if (day.exercises.length > 8) addIssue(warnings, 'warning', 'too_many_exercises', 'Session has more than 8 exercises.', location(template, day));
    const dayMetrics = metrics.dayMetrics.find((item) => item.dayIndex === day.dayIndex);
    if (dayMetrics && dayMetrics.totalSets > 34) {
      addIssue(warnings, 'warning', 'high_session_volume', 'Session volume may exceed a realistic duration/recovery target.', location(template, day));
    }

    if (template.split === 'full_body') validateFullBodyDay(template, day, errors);
    if (template.split === 'upper_lower') validateUpperLowerDay(template, day, errors);
    if (template.split === 'push_pull_legs') validatePplDay(template, day, errors, warnings);
  }

  validateWeeklyCoverage(template, metrics, errors, warnings);

  return {
    templateId: template.templateId,
    status: statusFromIssues(errors, warnings),
    errors,
    warnings,
    metrics,
  };
}

export function validateAllActiveTemplateSemantics(): SemanticValidationResult[] {
  return PROGRAM_TEMPLATES
    .filter((template) => template.status === 'active')
    .map((template) => validateTemplateSemantics(template));
}

export function validateInstantiatedProgramSemantics(result: TemplateEngineResult): SemanticValidationResult {
  const template = PROGRAM_TEMPLATES.find((item) => item.id === result.selectedTemplateId);
  if (!template) {
    return {
      templateId: result.selectedTemplateId,
      status: 'REJECTED',
      errors: [{ severity: 'error', code: 'missing_selected_template', message: 'Selected template cannot be found for semantic validation.', location: result.selectedTemplateId }],
      warnings: [],
      metrics: createEmptyMetrics(),
    };
  }

  const semantic = validateTemplateSemantics(template);
  const firstWeek = result.plan.weeks[0];
  if (!firstWeek) {
    return {
      ...semantic,
      status: 'NEEDS_REVISION',
      errors: [...semantic.errors, { severity: 'error', code: 'missing_first_week', message: 'Instantiated program has no first week.', location: result.plan.id }],
    };
  }

  const conversionErrors: SemanticValidationIssue[] = [];
  const expectedWorkouts = orderProgramWorkouts(template, template.workouts);
  const adaptedDays = new Set(result.adaptations.map((adaptation) => adaptation.dayIndex).filter((dayIndex): dayIndex is number => typeof dayIndex === 'number'));
  for (const templateDay of expectedWorkouts) {
    const planDay = firstWeek.days.find((day) => day.dayIndex === templateDay.dayIndex - 1);
    if (!planDay) {
      addIssue(conversionErrors, 'error', 'ui_day_dropped', 'Template day was not preserved in instantiated plan.', `${result.plan.id}:day-${templateDay.dayIndex}`);
      continue;
    }
    if (planDay.exercises.length !== templateDay.exercises.length) {
      addIssue(conversionErrors, 'error', 'ui_exercise_count_mismatch', 'Exercise count changed during UI conversion.', `${result.plan.id}:day-${templateDay.dayIndex}`);
    }
    const sourceOrder = sortedExercises(templateDay).map((exercise) => exercise.exerciseId);
    const planOrder = planDay.exercises.map((exercise) => exercise.exerciseId);
    if (!adaptedDays.has(templateDay.dayIndex) && sourceOrder.join('|') !== planOrder.join('|')) {
      addIssue(conversionErrors, 'error', 'ui_exercise_order_mismatch', 'Exercise order changed during UI conversion.', `${result.plan.id}:day-${templateDay.dayIndex}`);
    }
  }

  const errors = [...semantic.errors, ...conversionErrors];
  return {
    ...semantic,
    errors,
    status: statusFromIssues(errors, semantic.warnings),
  };
}
