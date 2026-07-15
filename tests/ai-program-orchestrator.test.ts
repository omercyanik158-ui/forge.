import { describe, expect, it } from 'vitest';
import { hasExercise } from '@/services/exerciseCatalog';
import { buildRecommendedAIProgram } from '@/services/programRecommendationEngine';
import type { AIProgramAnswers } from '@/types/aiProgram';

const gymHypertrophyAnswers: AIProgramAnswers = {
  mainGoal: 'build_muscle',
  preferredProgramStyle: 'auto',
  trainingDays: 4,
  sessionDurationMin: 60,
  location: 'gym',
  equipment: ['machines', 'cables', 'dumbbells', 'barbells', 'bench'],
  experience: 'intermediate',
  priorityMuscles: ['shoulders', 'upper_back'],
  painLimitations: ['none'],
  recoveryQuality: 'okay',
  useLatestPhysiqueAnalysis: false,
};

describe('template recommendation produces a valid runnable AI plan', () => {
  it('generates weeks, days and exercises for a gym hypertrophy profile', () => {
    const plan = buildRecommendedAIProgram({ draftId: 'orchestrator-csv-test', answers: gymHypertrophyAnswers });
    expect(plan.weeks.length).toBeGreaterThan(0);
    const allDays = plan.weeks.flatMap((week) => week.days);
    expect(allDays.length).toBeGreaterThan(0);
    const allExercises = allDays.flatMap((day) => day.exercises);
    expect(allExercises.length).toBeGreaterThan(0);
  });

  it('every exercise id exists in the CSV exercise catalog', () => {
    const plan = buildRecommendedAIProgram({ draftId: 'orchestrator-csv-test', answers: gymHypertrophyAnswers });
    const allIds = plan.weeks.flatMap((week) => week.days.flatMap((day) => day.exerciseIds));
    for (const id of allIds) {
      expect(id.startsWith('csv-')).toBe(true);
      expect(hasExercise(id)).toBe(true);
    }
  });

  it('passes validation with no errors for a normal gym profile', () => {
    const plan = buildRecommendedAIProgram({ draftId: 'orchestrator-csv-test', answers: gymHypertrophyAnswers });
    expect(plan.validation.isValid).toBe(true);
    expect(plan.validation.issues.filter((issue) => issue.severity === 'error')).toEqual([]);
  });

  it('uses the draft id to derive a stable recommended plan id', () => {
    const plan = buildRecommendedAIProgram({ draftId: 'stable-draft-abcdef12', answers: gymHypertrophyAnswers });
    expect(plan.id).toMatch(/^template-forge_/);
    expect(plan.requestFingerprint).toBeDefined();
  });

  it('populates the explanation artifact from CSV recommendation metadata', () => {
    const plan = buildRecommendedAIProgram({ draftId: 'orchestrator-csv-test', answers: gymHypertrophyAnswers });
    expect(plan.explanation.headline.length).toBeGreaterThan(0);
    expect(plan.explanation.whyThisPlan.length).toBeGreaterThan(0);
    expect(plan.explanation.archetypeRationale.length).toBeGreaterThan(0);
    expect(plan.explanation.progressionModelRationale.length).toBeGreaterThan(0);
    expect(plan.explanation.selectionRationale.some((line) => line.includes('Template score'))).toBe(true);
  });
});
