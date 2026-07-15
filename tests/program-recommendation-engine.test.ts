import { describe, expect, it } from 'vitest';
import { hasExercise } from '@/services/exerciseCatalog';
import { buildRecommendedAIProgram, recommendPrograms } from '@/services/programRecommendationEngine';
import {
  buildTemplateProgram,
  createProgramRequestFromAnswers,
  fingerprintProgramRequest,
} from '@/services/templateProgramEngine';
import type { AIProgramAnswers } from '@/types/aiProgram';

const baseAnswers: AIProgramAnswers = {
  mainGoal: 'build_muscle',
  preferredProgramStyle: 'auto',
  trainingDays: 5,
  sessionDurationMin: 60,
  location: 'gym',
  equipment: ['barbells', 'dumbbells', 'machines', 'cables', 'bench'],
  experience: 'intermediate',
  priorityMuscles: ['chest', 'shoulders'],
  painLimitations: ['none'],
  recoveryQuality: 'okay',
  useLatestPhysiqueAnalysis: false,
};

describe('template recommendation engine', () => {
  it('returns deterministic template recommendations for the same answers', () => {
    const first = recommendPrograms({ answers: baseAnswers });
    const second = recommendPrograms({ answers: baseAnswers });

    expect(first.length).toBeGreaterThan(0);
    expect(first.map((item) => item.templateId)).toEqual(second.map((item) => item.templateId));
    expect(first[0]!.templateId).toMatch(/^forge_/);
  });

  it('converts a template recommendation into a playable AI program plan', () => {
    const plan = buildRecommendedAIProgram({ draftId: 'draft-template-only-12345678', answers: baseAnswers });

    expect(plan.id).toMatch(/^template-forge_/);
    expect(plan.requestFingerprint).toBeDefined();
    expect(plan.selectedTemplateId).toMatch(/^forge_/);
    expect(plan.weeks.length).toBeGreaterThan(0);
    expect(plan.sourceBlueprint.evidenceCategories).toContain('template_match');
    expect(plan.sourceBlueprint.alternativesConsidered.length).toBeGreaterThan(0);
    expect(plan.explanation.assumptions.some((line) => line.includes('rastgele oluşturulmadı'))).toBe(true);
    expect(plan.weeks[0]?.days[0]?.exercises.every((exercise) => hasExercise(exercise.exerciseId))).toBe(true);
  });

  it('normalizes stable fingerprints independent of array order', () => {
    const left = createProgramRequestFromAnswers({ answers: baseAnswers });
    const right = createProgramRequestFromAnswers({
      answers: {
        ...baseAnswers,
        equipment: [...baseAnswers.equipment].reverse(),
        priorityMuscles: [...baseAnswers.priorityMuscles].reverse(),
      },
    });

    expect(fingerprintProgramRequest(left)).toBe(fingerprintProgramRequest(right));
  });

  it('rejects strength templates when required barbell work has no compatible equipment path', () => {
    const request = createProgramRequestFromAnswers({
      answers: {
        ...baseAnswers,
        mainGoal: 'strength',
        trainingDays: 4,
        equipment: ['dumbbells', 'bench', 'machines', 'cables'],
        priorityMuscles: [],
      },
    });
    expect(() => buildTemplateProgram({ request })).toThrow('No compatible FORGE CSV template found');
  });

  it('falls back to the closest safe plan when home hypertrophy has no exact curated template', () => {
    const request = createProgramRequestFromAnswers({
      answers: {
        ...baseAnswers,
        mainGoal: 'build_muscle',
        trainingDays: 3,
        location: 'home',
        equipment: ['bodyweight_only', 'dumbbells'],
        experience: 'intermediate',
      },
    });
    const result = buildTemplateProgram({ request });

    expect(result.matchMode).toBe('relaxed_match');
    expect(result.validation.valid).toBe(true);
    expect(result.selectedTemplateId).toMatch(/general_fitness|home|dumbbell/);
    expect(result.relaxationsApplied.join(' ')).toContain('Tam eşleşme yoktu');
    expect(result.plan.explanation.whyThisPlan[0]).toContain('Tam eşleşme yoktu');
  });

  it('falls back from unsupported 2-day gym hypertrophy to a nearby safe frequency', () => {
    const request = createProgramRequestFromAnswers({
      answers: { ...baseAnswers, trainingDays: 2, experience: 'intermediate' },
    });
    const first = buildTemplateProgram({ request });
    const second = buildTemplateProgram({ request });

    expect(first.matchMode).toBe('relaxed_match');
    expect(first.selectedTemplateId).toBe(second.selectedTemplateId);
    expect(first.relaxationsApplied).toEqual(second.relaxationsApplied);
    expect(first.plan.daysPerWeek).toBe(3);
  });

  it('relaxes explicit split preference when no safe exact split match exists', () => {
    const request = createProgramRequestFromAnswers({
      answers: {
        ...baseAnswers,
        mainGoal: 'strength',
        trainingDays: 4,
        experience: 'intermediate',
        preferredProgramStyle: 'push_pull_legs',
        priorityMuscles: [],
      },
    });
    const result = buildTemplateProgram({ request });

    expect(result.matchMode).toBe('relaxed_match');
    expect(result.selectedTemplateId).toBe('forge_strength_upper_lower_intermediate_4d_v1');
    expect(result.relaxationsApplied).toContain('Split tercihini otomatik kabul ettik.');
  });

  it('different day count selects a compatible template frequency', () => {
    const threeDay = buildRecommendedAIProgram({
      draftId: 'three-day-template',
      answers: { ...baseAnswers, trainingDays: 3, experience: 'beginner' },
    });
    const fourDay = buildRecommendedAIProgram({
      draftId: 'four-day-template',
      answers: { ...baseAnswers, trainingDays: 4 },
    });

    expect(threeDay.daysPerWeek).toBe(3);
    expect(fourDay.daysPerWeek).toBe(4);
    expect(threeDay.selectedTemplateId).not.toBe(fourDay.selectedTemplateId);
  });

  it('keeps main lifts before accessories and strength reps appropriate', () => {
    const strengthPlan = buildRecommendedAIProgram({
      draftId: 'strength-order-template',
      answers: {
        ...baseAnswers,
        mainGoal: 'strength',
        trainingDays: 3,
        experience: 'beginner',
        priorityMuscles: [],
      },
    });
    const firstDay = strengthPlan.weeks[0]!.days[0]!;
    const firstAccessoryIndex = firstDay.exercises.findIndex((exercise) => exercise.repLabel.includes('8-') || exercise.repLabel.includes('10-'));
    const firstMainLift = firstDay.exercises[0]!;

    expect(firstMainLift.reps).toBeLessThanOrEqual(6);
    expect(firstAccessoryIndex).toBeGreaterThan(0);
    expect(strengthPlan.validation.isValid).toBe(true);
  });

  it('keeps focus muscle volume within template limits', () => {
    const request = createProgramRequestFromAnswers({
      answers: { ...baseAnswers, priorityMuscles: ['chest', 'shoulders', 'arms'] },
    });
    const result = buildTemplateProgram({ request });
    const addedSets = result.adaptations
      .filter((item) => item.type === 'volume_added')
      .reduce((sum, item) => sum + (item.setsChanged ?? 0), 0);

    expect(result.validation.valid).toBe(true);
    expect(addedSets).toBeLessThanOrEqual(4);
  });

  it('explicit new variation can choose a valid alternative template', () => {
    const request = createProgramRequestFromAnswers({ answers: baseAnswers });
    const first = buildTemplateProgram({ request });
    const variation = buildTemplateProgram({
      request: { ...request, forceNewVariation: true, previousTemplateId: first.selectedTemplateId },
    });

    expect(variation.validation.valid).toBe(true);
    expect(variation.plan.id).toMatch(/^template-forge_/);
  });

  it('does not mutate template results between builds', () => {
    const request = createProgramRequestFromAnswers({ answers: baseAnswers });
    const first = buildTemplateProgram({ request });
    const second = buildTemplateProgram({ request });

    expect(first.plan.weeks[0]!.days[0]!.exercises).toEqual(second.plan.weeks[0]!.days[0]!.exercises);
    expect(first.plan.id).toBe(second.plan.id);
  });

  it('returns an existing plan for the same fingerprint', () => {
    const request = createProgramRequestFromAnswers({ answers: baseAnswers });
    const first = buildTemplateProgram({ request });
    const reused = buildTemplateProgram({ request, existingPlan: first.plan });

    expect(reused.reusedExisting).toBe(true);
    expect(reused.plan).toBe(first.plan);
    expect(reused.requestFingerprint).toBe(first.requestFingerprint);
  });

  it('mentions physique analysis when it contributes focus muscles', () => {
    const recommendations = recommendPrograms({
      answers: { ...baseAnswers, useLatestPhysiqueAnalysis: true },
      physiqueSummary: {
        source: 'saved_log',
        createdAt: '2026-07-15T00:00:00.000Z',
        focusAreas: ['chest'],
        focusMuscles: ['chest'],
        volumeBias: 'moderate',
        splitBiasHint: 'upper_focus',
        exerciseEmphasis: ['incline press'],
        recommendedExercises: ['incline press'],
        confidenceLevel: 'medium',
      },
    });

    expect(recommendations[0]?.reasons.some((reason) => reason.includes('Vücut analizi'))).toBe(true);
  });
});
