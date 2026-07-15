import { describe, expect, it } from 'vitest';
import { buildRecommendedAIProgram } from '@/services/programRecommendationEngine';
import {
  createProgramRequestFingerprint,
  createPersonalizedProgram,
  filterCompatibleTemplates,
  getAdaptationRulesForFocus,
  getDeterministicSubstitutionCandidates,
  getEligiblePhysiqueFocusMuscles,
  instantiateUserProgram,
  normalizeProgramRequest,
  persistValidProgramInstance,
  scoreTemplate,
  selectTemplateDeterministically,
  validateInstantiatedProgram,
} from '@/workout-programming';
import type { AIProgramAnswers } from '@/types/aiProgram';

const baseAnswers: AIProgramAnswers = {
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

describe('runtime template-program engine layers', () => {
  it('normalizes requests and creates stable fingerprints', () => {
    const left = normalizeProgramRequest({ answers: baseAnswers });
    const right = normalizeProgramRequest({
      answers: {
        ...baseAnswers,
        equipment: [...baseAnswers.equipment].reverse(),
        priorityMuscles: [...baseAnswers.priorityMuscles].reverse(),
      },
    });
    expect(left.goal).toBe('hypertrophy');
    expect(left.daysPerWeek).toBe(5);
    expect(createProgramRequestFingerprint(left)).toBe(createProgramRequestFingerprint(right));
  });

  it('hard-filters, scores and selects deterministically', () => {
    const request = normalizeProgramRequest({ answers: baseAnswers });
    const filtered = filterCompatibleTemplates(request);
    const selected = selectTemplateDeterministically(request);
    const score = scoreTemplate(selected.template.id, request);
    expect(filtered.compatible.length).toBeGreaterThan(0);
    expect(filtered.rejected.some((item) => item.rejectionReasons?.includes('DAY_COUNT_MISMATCH'))).toBe(true);
    expect(selected.match.templateId).toBe(filtered.compatible[0]?.templateId);
    expect(score?.totalScore).toBe(selected.match.totalScore);
  });

  it('instantiates and validates a user program without mutating source templates', () => {
    const request = normalizeProgramRequest({ answers: baseAnswers });
    const first = instantiateUserProgram({ request });
    const second = instantiateUserProgram({ request });
    expect(first.selectedTemplateId).toBe(second.selectedTemplateId);
    expect(first.adaptations).toEqual(second.adaptations);
    expect(validateInstantiatedProgram(first).valid).toBe(true);
    expect(first.plan.selectedTemplateId).toBe(first.selectedTemplateId);
  });

  it('exposes deterministic substitution and adaptation helpers', () => {
    const substitutions = getDeterministicSubstitutionCandidates('bench_press');
    expect(substitutions.map((item) => item.deterministicRank)).toEqual(
      [...substitutions.map((item) => item.deterministicRank)].sort((a, b) => a - b),
    );
    expect(getAdaptationRulesForFocus('hypertrophy', 'chest').length).toBeGreaterThan(0);
    const request = normalizeProgramRequest({
      answers: { ...baseAnswers, priorityMuscles: [], useLatestPhysiqueAnalysis: true },
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
    expect(getEligiblePhysiqueFocusMuscles(request, ['chest', 'lats'], 2)).toEqual(['chest']);
  });
});

describe('runtime template-program persistence', () => {
  it('reuses an existing program for identical fingerprints', () => {
    const request = normalizeProgramRequest({ userId: 'runtime-test', answers: baseAnswers });
    const first = instantiateUserProgram({ request });
    const reused = instantiateUserProgram({ request, existingPlan: first.plan });
    expect(reused.reusedExisting).toBe(true);
  });

  it('does not persist invalid programs through the repository', async () => {
    const plan = buildRecommendedAIProgram({ answers: baseAnswers });
    const invalid = {
      ...plan,
      validation: {
        isValid: false,
        issues: [{ severity: 'error' as const, code: 'forced_invalid', message: 'forced invalid' }],
      },
    };
    await expect(persistValidProgramInstance(invalid)).rejects.toThrow('Invalid program cannot be persisted');
  });
});
