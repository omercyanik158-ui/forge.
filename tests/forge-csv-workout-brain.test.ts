import { describe, expect, it } from 'vitest';
import { hasExercise } from '@/services/exerciseCatalog';
import {
  buildTemplateProgram,
  createProgramRequestFromAnswers,
  fingerprintProgramRequest,
  matchTemplates,
  PROGRAM_TEMPLATES,
} from '@/services/templateProgramEngine';
import { FORGE_ADAPTATION_RULES } from '@/workout-programming/generated/adaptationRules.generated';
import { FORGE_CANONICAL_EXERCISES } from '@/workout-programming/generated/exerciseCatalog.generated';
import { FORGE_PROGRESSION_RULES } from '@/workout-programming/generated/progressionRules.generated';
import { FORGE_EXERCISE_SUBSTITUTIONS } from '@/workout-programming/generated/substitutions.generated';
import { FORGE_EXERCISE_MAPPING_GAPS, FORGE_EXERCISE_ID_MAP } from '@/workout-programming/data/exerciseIdMap';
import type { AIProgramAnswers } from '@/types/aiProgram';

const hypertrophyAnswers: AIProgramAnswers = {
  mainGoal: 'build_muscle',
  preferredProgramStyle: 'auto',
  trainingDays: 5,
  sessionDurationMin: 60,
  location: 'gym',
  equipment: ['barbells', 'dumbbells', 'machines', 'cables', 'bench'],
  experience: 'intermediate',
  priorityMuscles: ['chest'],
  painLimitations: ['none'],
  recoveryQuality: 'okay',
  useLatestPhysiqueAnalysis: false,
};

describe('FORGE CSV workout brain generated data', () => {
  it('matches the curated manifest counts', () => {
    expect(PROGRAM_TEMPLATES).toHaveLength(26);
    expect(FORGE_CANONICAL_EXERCISES).toHaveLength(67);
    expect(FORGE_PROGRESSION_RULES).toHaveLength(10);
    expect(FORGE_ADAPTATION_RULES).toHaveLength(52);
    expect(FORGE_EXERCISE_SUBSTITUTIONS).toHaveLength(27);
  });

  it('maps every canonical exercise used by templates to a real app exercise', () => {
    expect(FORGE_EXERCISE_MAPPING_GAPS).toHaveLength(0);
    const mappedIds = new Set(Object.values(FORGE_EXERCISE_ID_MAP));
    for (const appExerciseId of mappedIds) {
      expect(hasExercise(appExerciseId), appExerciseId).toBe(true);
    }
    for (const template of PROGRAM_TEMPLATES) {
      for (const workout of template.workouts) {
        for (const exercise of workout.exercises) {
          expect(hasExercise(exercise.exerciseId), `${template.id}:${exercise.exerciseId}`).toBe(true);
        }
      }
    }
  });

  it('keeps canonical template objects stable between builds', () => {
    const request = createProgramRequestFromAnswers({ answers: hypertrophyAnswers });
    const before = JSON.stringify(PROGRAM_TEMPLATES);
    buildTemplateProgram({ request });
    buildTemplateProgram({ request });
    expect(JSON.stringify(PROGRAM_TEMPLATES)).toBe(before);
  });
});

describe('FORGE CSV deterministic selection and adaptation', () => {
  it('selects the same template and fingerprint for the same normalized request', () => {
    const request = createProgramRequestFromAnswers({ answers: hypertrophyAnswers });
    const first = buildTemplateProgram({ request });
    const second = buildTemplateProgram({ request });
    expect(first.selectedTemplateId).toBe(second.selectedTemplateId);
    expect(first.requestFingerprint).toBe(second.requestFingerprint);
    expect(fingerprintProgramRequest(request)).toBe(fingerprintProgramRequest({
      ...request,
      availableEquipment: [...request.availableEquipment].reverse(),
    }));
  });

  it('filters incompatible equipment profiles', () => {
    const request = createProgramRequestFromAnswers({
      answers: {
        ...hypertrophyAnswers,
        location: 'home',
        equipment: ['bodyweight_only', 'bands'],
        mainGoal: 'general_fitness',
        trainingDays: 3,
        experience: 'beginner',
      },
    });
    const matches = matchTemplates(request);
    expect(matches.compatible[0]?.templateId).toContain('home');
    expect(matches.rejected.some((item) => item.rejectionReasons?.includes('EQUIPMENT_MISMATCH'))).toBe(true);
  });

  it('keeps restricted required exercises compatible when a reviewed substitution exists', () => {
    const request = createProgramRequestFromAnswers({
      answers: {
        ...hypertrophyAnswers,
        mainGoal: 'strength',
        trainingDays: 3,
        experience: 'beginner',
        avoidedExerciseIds: ['csv-squat-barbell'],
      },
    });
    const matches = matchTemplates(request);
    expect(matches.compatible.some((item) => item.templateId === 'forge_strength_fullbody_beginner_3d_v1')).toBe(true);
  });

  it('rejects required blocked exercises when no valid reviewed substitution remains', () => {
    const request = createProgramRequestFromAnswers({
      answers: {
        ...hypertrophyAnswers,
        mainGoal: 'strength',
        trainingDays: 3,
        experience: 'beginner',
        avoidedExerciseIds: ['csv-squat-barbell', 'front_squat', 'hack_squat', 'leg_press', 'goblet_squat'],
      },
    });
    const matches = matchTemplates(request);
    const rejected = matches.rejected.find((item) => item.templateId === 'forge_strength_fullbody_beginner_3d_v1');
    expect(rejected?.rejectionReasons).toContain('REQUIRED_EXERCISE_RESTRICTED');
  });

  it('applies physique focus only when confidence is high enough', () => {
    const lowConfidence = createProgramRequestFromAnswers({
      answers: { ...hypertrophyAnswers, priorityMuscles: [], useLatestPhysiqueAnalysis: true },
      physiqueSummary: {
        source: 'saved_log',
        createdAt: '2026-07-15T00:00:00.000Z',
        focusAreas: ['chest'],
        focusMuscles: ['chest'],
        volumeBias: 'moderate',
        splitBiasHint: 'upper_focus',
        exerciseEmphasis: ['incline press'],
        recommendedExercises: ['incline press'],
        confidenceLevel: 'low',
      },
    });
    const highConfidence = createProgramRequestFromAnswers({
      answers: { ...hypertrophyAnswers, priorityMuscles: [], useLatestPhysiqueAnalysis: true },
      physiqueSummary: {
        source: 'saved_log',
        createdAt: '2026-07-15T00:00:00.000Z',
        focusAreas: ['chest'],
        focusMuscles: ['chest'],
        volumeBias: 'moderate',
        splitBiasHint: 'upper_focus',
        exerciseEmphasis: ['incline press'],
        recommendedExercises: ['incline press'],
        confidenceLevel: 'high',
      },
    });
    expect(buildTemplateProgram({ request: lowConfidence }).adaptations.filter((item) => item.focusMuscle)).toHaveLength(0);
    expect(buildTemplateProgram({ request: highConfidence }).adaptations.filter((item) => item.focusMuscle).length).toBeLessThanOrEqual(2);
  });

  it('reuses existing plan for unchanged fingerprint and requires explicit variation', () => {
    const request = createProgramRequestFromAnswers({ answers: hypertrophyAnswers });
    const first = buildTemplateProgram({ request });
    const reused = buildTemplateProgram({ request, existingPlan: first.plan });
    const variation = buildTemplateProgram({
      request: { ...request, forceNewVariation: true, previousTemplateId: first.selectedTemplateId },
      existingPlan: first.plan,
    });
    expect(reused.reusedExisting).toBe(true);
    expect(variation.reusedExisting).toBe(false);
  });
});
