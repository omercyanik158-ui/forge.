import { describe, expect, it } from 'vitest';
import { buildAIProgramDecisionBlueprint } from '@/services/aiProgramDecisionEngine';
import { buildAIProgramDecisionContext, createInitialAIProgramDraft, validateAIProgramAnswers } from '@/services/aiProgramEngine';
import type { UserProfile } from '@/types';

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

describe('AI program engine', () => {
  it('prefills draft from existing profile and coach preferences', () => {
    const draft = createInitialAIProgramDraft({
      entryPath: 'ai_hub',
      profile,
      coachPreferences: {
        homeCards: ['coach', 'energy', 'weekly'],
        equipment: 'gym',
        limitations: ['knee'],
        adaptiveReminders: false,
        updatedAt: '2026-07-01T10:00:00.000Z',
      },
    });

    expect(draft.answers.mainGoal).toBe('build_muscle');
    expect(draft.answers.location).toBe('gym');
    expect(draft.answers.equipment.length).toBeGreaterThan(0);
    expect(draft.answers.painLimitations).toContain('knee');
  });

  it('flags unsafe high frequency for beginners with poor recovery', () => {
    const result = validateAIProgramAnswers({
      mainGoal: 'build_muscle',
      trainingDays: 6,
      sessionDurationMin: 60,
      location: 'gym',
      equipment: ['machines', 'dumbbells'],
      experience: 'beginner',
      priorityMuscles: ['shoulders'],
      painLimitations: ['none'],
      recoveryQuality: 'poor',
      useLatestPhysiqueAnalysis: false,
    });

    expect(result.blocking).toEqual([]);
    expect(result.cautions).toContain('beginner_high_frequency');
    expect(result.cautions).toContain('poor_recovery_high_frequency');
  });

  it('builds a decision context with safety flags and evidence categories', () => {
    const draft = createInitialAIProgramDraft({
      entryPath: 'ai_hub',
      profile,
      coachPreferences: null,
    });

    draft.answers.mainGoal = 'strength';
    draft.answers.trainingDays = 4;
    draft.answers.sessionDurationMin = 75;
    draft.answers.location = 'home';
    draft.answers.equipment = ['bodyweight_only', 'bands'];
    draft.answers.experience = 'intermediate';
    draft.answers.priorityMuscles = ['upper_back', 'shoulders'];
    draft.answers.painLimitations = ['lower_back'];
    draft.answers.recoveryQuality = 'okay';
    draft.completedSteps = ['intro', 'goal', 'days'];

    const context = buildAIProgramDecisionContext({
      draft,
      profile,
      cycle: {
        cycleDay: 5,
        currentCycleStartDate: '2026-07-01',
        nextPeriodStartDate: '2026-07-29',
        daysUntilNextPeriod: 24,
        fertileWindowStartDate: '2026-07-10',
        fertileWindowEndDate: '2026-07-15',
        ovulationDate: '2026-07-14',
        phase: 'period',
      },
    });

    expect(context.userProfile.goal).toBe('strength');
    expect(context.userProfile.safetyFlags).toContain('pain_reported');
    expect(context.userProfile.safetyFlags).toContain('cycle_context_present');
    expect(context.scientific.relevantEvidenceCategories).toContain('Strength-specific progression evidence');
    expect(context.scientific.programmingConstraints).toContain('Home-only equipment must constrain exercise selection.');
  });

  it('chooses a torso-limbs style blueprint when upper-body priorities need better placement', () => {
    const draft = createInitialAIProgramDraft({
      entryPath: 'ai_hub',
      profile,
      coachPreferences: null,
    });

    draft.answers.mainGoal = 'build_muscle';
    draft.answers.trainingDays = 4;
    draft.answers.sessionDurationMin = 60;
    draft.answers.location = 'gym';
    draft.answers.equipment = ['machines', 'cables', 'dumbbells', 'barbells'];
    draft.answers.experience = 'intermediate';
    draft.answers.priorityMuscles = ['shoulders', 'upper_back'];
    draft.answers.painLimitations = ['none'];
    draft.answers.recoveryQuality = 'okay';

    const context = buildAIProgramDecisionContext({ draft, profile });
    const blueprint = buildAIProgramDecisionBlueprint(context);

    expect(blueprint.recommendedSplit).toBe('torso_limbs');
    expect(blueprint.alternativesConsidered.length).toBeGreaterThanOrEqual(2);
    expect(blueprint.whyThisPlan.some((line) => line.includes('Öncelikli bölgelerin'))).toBe(true);
  });

  it('downshifts unsafe frequency before selecting a split', () => {
    const draft = createInitialAIProgramDraft({
      entryPath: 'ai_hub',
      profile,
      coachPreferences: null,
    });

    draft.answers.mainGoal = 'lose_fat';
    draft.answers.trainingDays = 6;
    draft.answers.sessionDurationMin = 45;
    draft.answers.location = 'gym';
    draft.answers.equipment = ['machines', 'dumbbells'];
    draft.answers.experience = 'beginner';
    draft.answers.priorityMuscles = ['shoulders'];
    draft.answers.painLimitations = ['none'];
    draft.answers.recoveryQuality = 'poor';

    const context = buildAIProgramDecisionContext({ draft, profile });
    const blueprint = buildAIProgramDecisionBlueprint(context);

    expect(blueprint.recommendedTrainingDays).toBe(4);
    expect(blueprint.recommendedSplit).not.toBe('push_pull_legs');
    expect(blueprint.safetyConstraints.some((line) => line.includes('beginner'))).toBe(true);
  });
});
