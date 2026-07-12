import { describe, expect, it } from 'vitest';
import { orchestrateAIProgram } from '@/services/aiProgramOrchestrator';
import { buildAIProgramDecisionBlueprint } from '@/services/aiProgramDecisionEngine';
import { buildAIProgramDecisionContext, createInitialAIProgramDraft } from '@/services/aiProgramEngine';
import { hasExercise } from '@/services/exerciseCatalog';
import { hasExerciseMeta } from '@/services/exerciseKB';
import type { UserProfile } from '@/types';
import type { AIProgramDraft } from '@/types/aiProgram';

const profile: UserProfile = {
  name: 'Test',
  gender: 'female',
  age: 29,
  weightKg: 68,
  heightCm: 168,
  activityLevel: 'moderate',
  neckCm: 34,
  waistCm: 74,
  hipCm: 96,
  goalType: 'gain',
  createdAt: '2026-07-01T10:00:00.000Z',
};

function buildPlanFromAnswers(draft: AIProgramDraft) {
  const context = buildAIProgramDecisionContext({ draft, profile });
  const blueprint = buildAIProgramDecisionBlueprint(context);
  return orchestrateAIProgram({ draftId: draft.id, context, blueprint });
}

function gymHypertrophyDraft(): AIProgramDraft {
  const draft = createInitialAIProgramDraft({ entryPath: 'ai_hub', profile, coachPreferences: null });
  draft.answers.mainGoal = 'build_muscle';
  draft.answers.trainingDays = 4;
  draft.answers.sessionDurationMin = 60;
  draft.answers.location = 'gym';
  draft.answers.equipment = ['machines', 'cables', 'dumbbells', 'barbells', 'bench'];
  draft.answers.experience = 'intermediate';
  draft.answers.priorityMuscles = ['shoulders', 'upper_back'];
  draft.answers.painLimitations = ['none'];
  draft.answers.recoveryQuality = 'okay';
  return draft;
}

describe('orchestration produces a valid runnable plan', () => {
  it('generates weeks, days and exercises for a gym hypertrophy profile', () => {
    const { plan } = buildPlanFromAnswers(gymHypertrophyDraft());
    expect(plan.weeks.length).toBeGreaterThan(0);
    const allDays = plan.weeks.flatMap((w) => w.days);
    expect(allDays.length).toBeGreaterThan(0);
    const allExercises = allDays.flatMap((d) => d.exercises);
    expect(allExercises.length).toBeGreaterThan(0);
  });

  it('every exercise id exists in the catalog (no silent drops)', () => {
    const { plan } = buildPlanFromAnswers(gymHypertrophyDraft());
    const allIds = plan.weeks.flatMap((w) => w.days.flatMap((d) => d.exerciseIds));
    for (const id of allIds) {
      expect(hasExercise(id)).toBe(true);
    }
  });

  it('every exercise id has KB metadata', () => {
    const { plan } = buildPlanFromAnswers(gymHypertrophyDraft());
    const allIds = plan.weeks.flatMap((w) => w.days.flatMap((d) => d.exerciseIds));
    for (const id of allIds) {
      expect(hasExerciseMeta(id)).toBe(true);
    }
  });

  it('passes validation with no errors for a normal gym profile', () => {
    const { plan } = buildPlanFromAnswers(gymHypertrophyDraft());
    expect(plan.validation.isValid).toBe(true);
    const errors = plan.validation.issues.filter((i) => i.severity === 'error');
    expect(errors).toEqual([]);
  });
});

describe('pain safety in orchestration', () => {
  it('excludes lower-back unsafe exercises when lower back pain is reported', () => {
    const draft = gymHypertrophyDraft();
    draft.answers.painLimitations = ['lower_back'];
    const { plan } = buildPlanFromAnswers(draft);
    const allIds = plan.weeks.flatMap((w) => w.days.flatMap((d) => d.exerciseIds));
    expect(allIds).not.toContain('Barbell_Deadlift');
    expect(allIds).not.toContain('Bent_Over_Barbell_Row');
    expect(plan.validation.isValid).toBe(true);
  });

  it('produces a valid plan for a home bodyweight-only user', () => {
    const draft = createInitialAIProgramDraft({ entryPath: 'ai_hub', profile, coachPreferences: null });
    draft.answers.mainGoal = 'general_fitness';
    draft.answers.trainingDays = 3;
    draft.answers.sessionDurationMin = 45;
    draft.answers.location = 'home';
    draft.answers.equipment = ['bodyweight_only', 'bands'];
    draft.answers.experience = 'beginner';
    draft.answers.priorityMuscles = [];
    draft.answers.painLimitations = ['none'];
    draft.answers.recoveryQuality = 'okay';
    const { plan } = buildPlanFromAnswers(draft);
    expect(plan.validation.isValid).toBe(true);
    const allIds = plan.weeks.flatMap((w) => w.days.flatMap((d) => d.exerciseIds));
    expect(allIds.length).toBeGreaterThan(0);
    expect(allIds).toContain('Pushups');
  });
});

describe('plan shape and ids', () => {
  it('uses the draft id to derive a stable plan id', () => {
    const draft = gymHypertrophyDraft();
    const { plan } = buildPlanFromAnswers(draft);
    expect(plan.id).toBe(`ai-program-${draft.id}`);
  });

  it('follows the program day id convention', () => {
    const { plan } = buildPlanFromAnswers(gymHypertrophyDraft());
    const firstDayId = plan.weeks[0]!.days[0]!.id;
    expect(firstDayId).toMatch(/-w1-d1$/);
  });

  it('carries difficulty mapped from experience', () => {
    const intermediate = buildPlanFromAnswers(gymHypertrophyDraft()).plan;
    expect(intermediate.difficultyLevel).toBe('Orta');

    const beginnerDraft = gymHypertrophyDraft();
    beginnerDraft.answers.experience = 'beginner';
    const beginner = buildPlanFromAnswers(beginnerDraft).plan;
    expect(beginner.difficultyLevel).toBe('Başlangıç');
  });
});

describe('explanation artifact', () => {
  it('populates all explanation sections', () => {
    const { plan } = buildPlanFromAnswers(gymHypertrophyDraft());
    const explanation = plan.explanation;
    expect(explanation.headline.length).toBeGreaterThan(0);
    expect(explanation.whyThisPlan.length).toBeGreaterThan(0);
    expect(explanation.structureRationale.length).toBeGreaterThan(0);
    expect(explanation.volumeRationale.length).toBeGreaterThan(0);
    expect(explanation.selectionRationale.length).toBeGreaterThan(0);
    expect(explanation.progressionRationale.length).toBeGreaterThan(0);
    expect(explanation.uncertaintyNotes.length).toBeGreaterThan(0);
  });

  it('mentions priority muscle volume in the rationale', () => {
    const { plan } = buildPlanFromAnswers(gymHypertrophyDraft());
    const mentions = plan.explanation.volumeRationale.some((line) =>
      line.includes('shoulders') || line.includes('upper_back'),
    );
    expect(mentions).toBe(true);
  });
});

describe('deload weeks appear in longer blocks', () => {
  it('includes a deload in an advanced 6-week block', () => {
    const draft = gymHypertrophyDraft();
    draft.answers.experience = 'advanced';
    draft.answers.mainGoal = 'strength';
    const { plan } = buildPlanFromAnswers(draft);
    const deloadWeeks = plan.weeks.filter((w) => w.isDeload);
    expect(deloadWeeks.length).toBeGreaterThan(0);
  });
});
