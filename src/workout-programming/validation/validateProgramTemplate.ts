import { hasExercise } from "@/services/exerciseCatalog";
import { calculateTemplateVolumeReport } from "../reports/templateVolume";
import type {
  ProgramTemplate,
  TemplateExerciseRole,
  TemplateValidationIssue,
  TemplateValidationResult,
} from "../types/programTemplate";

const ROLE_ORDER: Record<TemplateExerciseRole, number> = {
  mobility: 0,
  main_lift: 1,
  secondary_compound: 2,
  accessory_compound: 3,
  isolation: 4,
  core: 5,
  conditioning: 6,
};

const REQUIRED_PROGRESSION_KEYS: Record<ProgramTemplate["progressionModel"], string[]> = {
  linear: ["loadIncrease", "missProtocol"],
  double_progression: ["method", "loadIncrease"],
  percentage_based: ["method"],
  rpe_based: ["method"],
  rep_goal: ["method"],
  top_set_backoff: ["topSet", "backoffReductionPercent"],
  custom: [],
};

function issue(
  template: ProgramTemplate,
  severity: TemplateValidationIssue["severity"],
  code: string,
  message: string,
  location?: string,
): TemplateValidationIssue {
  return { templateId: template.id, severity, code, message, location };
}

function repBounds(reps: ProgramTemplate["workouts"][number]["exercises"][number]["reps"]): { min: number; max: number } {
  return reps.type === "fixed" ? { min: reps.value, max: reps.value } : { min: reps.min, max: reps.max };
}

export function validateProgramTemplate(template: ProgramTemplate): TemplateValidationResult {
  const issues: TemplateValidationIssue[] = [];

  if (!template.id.startsWith("forge_")) {
    issues.push(issue(template, "error", "invalid_id", "Template ID must use the forge_ prefix."));
  }
  if (!Number.isInteger(template.version) || template.version < 1) {
    issues.push(issue(template, "error", "invalid_version", "Template version must be a positive integer."));
  }
  if (template.workouts.length !== template.daysPerWeek) {
    issues.push(issue(template, "error", "day_count_mismatch", "daysPerWeek must match workout day count."));
  }
  const expectedDayIndexes = Array.from({ length: template.workouts.length }, (_, index) => index + 1);
  const actualDayIndexes = template.workouts.map((workout) => workout.dayIndex);
  if (expectedDayIndexes.some((dayIndex, index) => actualDayIndexes[index] !== dayIndex)) {
    issues.push(issue(template, "error", "non_consecutive_days", "Workout dayIndex values must be consecutive and sorted."));
  }

  const progressionKeys = REQUIRED_PROGRESSION_KEYS[template.progressionModel];
  progressionKeys.forEach((key) => {
    if (!(key in template.progressionConfig)) {
      issues.push(issue(template, "error", "invalid_progression_config", `Missing progression config key: ${key}.`));
    }
  });

  template.workouts.forEach((workout) => {
    if (workout.exercises.length === 0) {
      issues.push(issue(template, "error", "empty_day", "Workout day must contain exercises.", `day:${workout.dayIndex}`));
    }
    if (workout.estimatedMinutes < template.sessionMinutes.min || workout.estimatedMinutes > template.sessionMinutes.max) {
      issues.push(issue(template, "warning", "session_duration_outside_bounds", "Estimated day duration is outside template bounds.", `day:${workout.dayIndex}`));
    }

    const seenExercises = new Set<string>();
    let previousRoleRank = 0;
    workout.exercises.forEach((exercise, index) => {
      const location = `day:${workout.dayIndex}:exercise:${exercise.order}`;
      if (exercise.order !== index + 1) {
        issues.push(issue(template, "error", "invalid_order", "Exercise order must be consecutive.", location));
      }
      if (!hasExercise(exercise.exerciseId)) {
        issues.push(issue(template, "error", "unknown_exercise", `Exercise ID does not exist: ${exercise.exerciseId}.`, location));
      }
      if (seenExercises.has(exercise.exerciseId)) {
        issues.push(issue(template, "error", "duplicate_exercise_in_day", "Exercise cannot repeat in the same session.", location));
      }
      seenExercises.add(exercise.exerciseId);

      const rank = ROLE_ORDER[exercise.role];
      if (rank < previousRoleRank && exercise.role !== "mobility") {
        issues.push(issue(template, "error", "invalid_exercise_ordering", "Exercise role ordering violates Phase 1 standards.", location));
      }
      previousRoleRank = Math.max(previousRoleRank, rank);

      const reps = repBounds(exercise.reps);
      if (!Number.isInteger(exercise.sets) || exercise.sets < 1 || exercise.sets > 8) {
        issues.push(issue(template, "error", "invalid_sets", "Sets must be a realistic positive integer.", location));
      }
      if (reps.min < 1 || reps.max > 60 || reps.min > reps.max) {
        issues.push(issue(template, "error", "invalid_reps", "Rep prescription is malformed or unrealistic.", location));
      }
      if (exercise.restSeconds < 30 || exercise.restSeconds > 300) {
        issues.push(issue(template, "error", "invalid_rest", "Rest seconds must be between 30 and 300.", location));
      }
      if (template.goal === "strength" && exercise.role === "main_lift" && reps.max > 6) {
        issues.push(issue(template, "error", "strength_main_lift_too_many_reps", "Strength main lift reps must stay in a lower rep zone.", location));
      }
    });

    const patternCounts = new Map<string, number>();
    workout.exercises.forEach((exercise) => {
      patternCounts.set(exercise.movementPattern, (patternCounts.get(exercise.movementPattern) ?? 0) + 1);
    });
    patternCounts.forEach((count, pattern) => {
      if (count > 3 && pattern !== "horizontal_pull") {
        issues.push(issue(template, "warning", "same_pattern_redundancy", `Session has ${count} exercises in pattern ${pattern}.`, `day:${workout.dayIndex}`));
      }
    });
  });

  const report = calculateTemplateVolumeReport(template);
  const hasMainLift = report.mainLiftFrequency > 0;
  const hasHypertrophyRepWork = template.workouts.some((workout) =>
    workout.exercises.some((exercise) => {
      const reps = repBounds(exercise.reps);
      return reps.max >= 10 && exercise.role !== "main_lift";
    }),
  );
  if (template.goal === "strength" && !hasMainLift) {
    issues.push(issue(template, "error", "strength_missing_main_lift", "Strength templates require main lifts."));
  }
  if (template.goal === "hypertrophy" && !hasHypertrophyRepWork) {
    issues.push(issue(template, "error", "hypertrophy_missing_volume_work", "Hypertrophy templates require moderate/high rep accessory or isolation work."));
  }
  if (template.goal === "powerbuilding" && (!hasMainLift || !hasHypertrophyRepWork)) {
    issues.push(issue(template, "error", "powerbuilding_missing_required_elements", "Powerbuilding templates require both main lifts and hypertrophy work."));
  }
  if (template.goal === "general_fitness") {
    const patterns = report.movementPatternDistribution;
    const required = ["horizontal_push", "horizontal_pull", "squat", "hinge", "anti_extension"];
    required.forEach((pattern) => {
      if (!patterns[pattern as keyof typeof patterns]) {
        issues.push(issue(template, "error", "general_fitness_missing_pattern", `General fitness template is missing ${pattern}.`));
      }
    });
  }

  const warnings = issues.filter((item) => item.severity === "warning");
  const errors = issues.filter((item) => item.severity === "error");
  return { valid: errors.length === 0, errors, warnings };
}

export function validateProgramTemplateRegistry(templates: ProgramTemplate[]): TemplateValidationResult {
  const issues: TemplateValidationIssue[] = [];
  const seen = new Set<string>();
  templates.forEach((template) => {
    if (seen.has(template.id)) {
      issues.push(issue(template, "error", "duplicate_template_id", "Template IDs must be unique."));
    }
    seen.add(template.id);
    const result = validateProgramTemplate(template);
    issues.push(...result.errors, ...result.warnings);
  });
  const warnings = issues.filter((item) => item.severity === "warning");
  const errors = issues.filter((item) => item.severity === "error");
  return { valid: errors.length === 0, errors, warnings };
}
