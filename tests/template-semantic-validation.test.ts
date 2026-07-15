import { describe, expect, it } from 'vitest';
import { buildTemplateProgram, createProgramRequestFromAnswers, PROGRAM_TEMPLATES } from '@/services/templateProgramEngine';
import type { AIProgramAnswers, AIProgramEquipmentKey } from '@/types/aiProgram';
import { FORGE_CANONICAL_EXERCISES } from '@/workout-programming/generated/exerciseCatalog.generated';
import { FORGE_EXERCISE_SUBSTITUTIONS } from '@/workout-programming/generated/substitutions.generated';
import {
  validateAllActiveTemplateSemantics,
  validateInstantiatedProgramSemantics,
  validateTemplateSemantics,
} from '@/workout-programming';

const PUSH_PATTERNS = new Set(['horizontal_push', 'vertical_push', 'incline_push', 'dip']);
const PULL_PATTERNS = new Set(['horizontal_pull', 'vertical_pull', 'pullover']);
const KNEE_PATTERNS = new Set(['squat', 'lunge', 'knee_extension']);
const POSTERIOR_PATTERNS = new Set(['hinge', 'knee_flexion', 'hip_thrust', 'glute_bridge']);
const LOWER_PATTERNS = new Set([...KNEE_PATTERNS, ...POSTERIOR_PATTERNS]);

function hasPattern(patterns: string[], expected: Set<string>): boolean {
  return patterns.some((pattern) => expected.has(pattern));
}

function requestForTemplate(template: typeof PROGRAM_TEMPLATES[number]): AIProgramAnswers {
  const goalMap = {
    strength: 'strength',
    hypertrophy: 'build_muscle',
    powerbuilding: 'recomposition',
    general_fitness: 'general_fitness',
  } as const;
  const equipment: AIProgramEquipmentKey[] = template.equipmentProfile === 'bodyweight_home'
    ? ['bodyweight_only', 'bands']
    : template.equipmentProfile === 'dumbbell_only'
      ? ['dumbbells', 'bench']
      : ['barbells', 'dumbbells', 'machines', 'cables', 'bench'];
  const trainingDays = template.daysPerWeek === 2 || template.daysPerWeek === 3 || template.daysPerWeek === 4 || template.daysPerWeek === 5 || template.daysPerWeek === 6
    ? template.daysPerWeek
    : 3;
  const sessionDurationMin = template.sessionMinutes.target === 30 || template.sessionMinutes.target === 45 || template.sessionMinutes.target === 60 || template.sessionMinutes.target === 75 || template.sessionMinutes.target === 90
    ? template.sessionMinutes.target
    : 60;

  return {
    mainGoal: goalMap[template.goal],
    preferredProgramStyle: 'auto',
    trainingDays,
    sessionDurationMin,
    location: template.equipmentProfile === 'bodyweight_home' ? 'home' : 'gym',
    equipment,
    experience: template.level,
    priorityMuscles: [],
    painLimitations: ['none'],
    recoveryQuality: 'okay',
    useLatestPhysiqueAnalysis: false,
  };
}

describe('semantic programming validation', () => {
  it('approves every active curated template without semantic errors', () => {
    const results = validateAllActiveTemplateSemantics();
    expect(results).toHaveLength(PROGRAM_TEMPLATES.filter((template) => template.status === 'active').length);
    const failures = results.filter((result) => result.errors.length > 0);
    expect(failures.map((result) => ({
      templateId: result.templateId,
      errors: result.errors.map((issue) => issue.code),
    }))).toEqual([]);
  });

  it('enforces full-body day invariants across active templates', () => {
    const fullBodyTemplates = PROGRAM_TEMPLATES.filter((template) => template.status === 'active' && template.split === 'full_body');
    expect(fullBodyTemplates.length).toBeGreaterThan(0);
    for (const template of fullBodyTemplates) {
      for (const day of template.workouts) {
        const patterns = day.exercises.map((exercise) => exercise.movementPattern);
        expect(hasPattern(patterns, LOWER_PATTERNS), `${template.id}:day-${day.dayIndex}:lower`).toBe(true);
        expect(hasPattern(patterns, PUSH_PATTERNS), `${template.id}:day-${day.dayIndex}:push`).toBe(true);
        expect(hasPattern(patterns, PULL_PATTERNS), `${template.id}:day-${day.dayIndex}:pull`).toBe(true);
        expect(hasPattern(patterns, POSTERIOR_PATTERNS), `${template.id}:day-${day.dayIndex}:posterior`).toBe(true);
      }
    }
  });

  it('keeps upper/lower and PPL day semantics intact', () => {
    for (const template of PROGRAM_TEMPLATES.filter((item) => item.status === 'active')) {
      const result = validateTemplateSemantics(template);
      const splitErrors = result.errors.filter((issue) =>
        issue.code.startsWith('upper_day_')
        || issue.code.startsWith('lower_day_')
        || issue.code.startsWith('push_day_')
        || issue.code.startsWith('pull_day_')
        || issue.code.startsWith('leg_day_'),
      );
      expect(splitErrors, template.id).toEqual([]);
    }
  });

  it('keeps deterministic substitutions movement-compatible', () => {
    const catalogById = new Map(FORGE_CANONICAL_EXERCISES.map((exercise) => [exercise.canonicalExerciseId, exercise]));
    for (const substitution of FORGE_EXERCISE_SUBSTITUTIONS) {
      const source = catalogById.get(substitution.sourceExerciseId);
      const alternative = catalogById.get(substitution.alternativeExerciseId);
      expect(source, substitution.sourceExerciseId).toBeDefined();
      expect(alternative, substitution.alternativeExerciseId).toBeDefined();
      expect(alternative?.movementPattern, `${substitution.sourceExerciseId}->${substitution.alternativeExerciseId}`).toBe(substitution.movementPattern);
      if (substitution.preserveRole) {
        expect(source?.defaultRole, `${substitution.sourceExerciseId}->${substitution.alternativeExerciseId}`).toBeTruthy();
      }
    }
  });

  it('validates instantiated user-facing programs without dropping day count, exercise count, or order', () => {
    const representativeTemplates = [
      ...new Map(PROGRAM_TEMPLATES.filter((template) => template.status === 'active').map((template) => [`${template.goal}:${template.daysPerWeek}:${template.equipmentProfile}`, template])).values(),
    ];

    for (const template of representativeTemplates) {
      const request = createProgramRequestFromAnswers({ answers: requestForTemplate(template) });
      const result = buildTemplateProgram({ request });
      const semantic = validateInstantiatedProgramSemantics(result);
      expect(result.validation.valid, result.selectedTemplateId).toBe(true);
      expect(semantic.errors, result.selectedTemplateId).toEqual([]);
    }
  });
});
