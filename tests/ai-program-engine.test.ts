import { describe, expect, it } from 'vitest';
import { buildAIProgramDecisionBlueprint } from '@/services/aiProgramDecisionEngine';
import {
  buildAIProgramDecisionContext,
  buildProgramInfluenceSummary,
  createInitialAIProgramDraft,
  summarizePhysiqueForProgram,
  validateAIProgramAnswers,
} from '@/services/aiProgramEngine';
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

  it('turns physique analysis into moderate program influence', () => {
    const summary = summarizePhysiqueForProgram(
      {
        generalDurum: 'Üst gövde dengesi geliştirilebilir.',
        eksikBolgeler: ['Omuz', 'Üst sırt'],
        odaklanmasiGerekenHareketler: [
          { hareketAdi: 'Face Pull', neden: 'Arka omuz kontrolü' },
          { hareketAdi: 'Incline Row', neden: 'Üst sırt hacmi' },
        ],
        tahminiYagOrani: 18,
        kasKutlesiYorumu: 'Orta',
        guvenPuani: 86,
        pozKalitesiYorumu: 'Net',
      },
      '2026-07-01T10:00:00.000Z',
      'current_result',
    );
    const influence = buildProgramInfluenceSummary(summary);

    expect(summary.focusMuscles).toEqual(['shoulders', 'upper_back']);
    expect(summary.volumeBias).toBe('moderate_high');
    expect(influence?.focusLabels).toEqual(['Omuz', 'Üst sırt']);
    expect(influence?.exerciseEmphasis).toContain('Face Pull');
  });

  it('uses physique V2 program signals before legacy missing-region text', () => {
    const summary = summarizePhysiqueForProgram(
      {
        analysisVersion: 2,
        coachSummary: 'Yan omuz ve lat odağı V-taper görünümünü en çok değiştirebilir.',
        generalDurum: 'Genel değerlendirme',
        eksikBolgeler: ['Eski alan'],
        odaklanmasiGerekenHareketler: [],
        tahminiYagOrani: 18,
        kasKutlesiYorumu: 'Orta',
        guvenPuani: 88,
        pozKalitesiYorumu: 'Net',
        priorityRoadmap: [
          { rank: 1, targetArea: 'Yan omuz', targetMuscle: 'shoulders', aestheticImpact: 'very_high', reason: 'Omuz genişliği V-taperı etkiler.', exerciseEmphasis: ['Lateral Raise'], volumeSignal: 'moderate_high' },
          { rank: 2, targetArea: 'Lat genişliği', targetMuscle: 'lats', aestheticImpact: 'high', reason: 'Lat genişliği üst gövde formunu artırır.', exerciseEmphasis: ['Lat Pulldown'], volumeSignal: 'moderate' },
        ],
        programSignals: {
          focusMuscles: ['shoulders', 'lats'],
          volumeBias: 'moderate_high',
          splitBiasHint: 'posterior_focus',
          exerciseEmphasis: ['Lateral Raise', 'Lat Pulldown', 'Seated Cable Row'],
          postureCautions: ['rounded_shoulders_visual'],
          confidenceLevel: 'high',
        },
      },
      '2026-07-01T10:00:00.000Z',
      'current_result',
    );

    expect(summary.focusAreas).toEqual(['Yan omuz', 'Lat genişliği']);
    expect(summary.focusMuscles).toEqual(['shoulders', 'lats']);
    expect(summary.volumeBias).toBe('moderate_high');
    expect(summary.splitBiasHint).toBe('posterior_focus');
    expect(summary.exerciseEmphasis).toContain('Lateral Raise');
  });

  it('keeps physique V2 program impact conservative under poor pose confidence', () => {
    const summary = summarizePhysiqueForProgram(
      {
        analysisVersion: 2,
        coachSummary: 'Poz kalitesi düşük olduğu için kararlar konservatif tutulmalı.',
        generalDurum: 'Genel değerlendirme',
        eksikBolgeler: ['Yan omuz'],
        odaklanmasiGerekenHareketler: [],
        tahminiYagOrani: 18,
        kasKutlesiYorumu: 'Orta',
        guvenPuani: 55,
        pozKalitesiYorumu: 'Düşük ışık ve belirsiz poz',
        priorityRoadmap: [
          { rank: 1, targetArea: 'Yan omuz', targetMuscle: 'shoulders', aestheticImpact: 'very_high', reason: 'Omuz genişliği V-taperı etkiler.', exerciseEmphasis: ['Lateral Raise'], volumeSignal: 'moderate_high' },
        ],
        programSignals: {
          focusMuscles: ['shoulders'],
          volumeBias: 'moderate_high',
          splitBiasHint: 'upper_focus',
          exerciseEmphasis: ['Lateral Raise'],
          postureCautions: [],
          confidenceLevel: 'low',
        },
      },
      '2026-07-01T10:00:00.000Z',
      'current_result',
    );

    expect(summary.confidenceLevel).toBe('low');
    expect(summary.volumeBias).toBe('conservative');
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

  it('chooses a posterior-chain blueprint when back priorities need better placement', () => {
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

    expect(blueprint.programFamily).toBe('hypertrophy');
    expect(blueprint.goalClassification).toBe('muscle_specialization');
    expect(blueprint.programArchetype).toBe('posterior_chain_focus');
    expect(blueprint.recommendedSplit).toBe('anterior_posterior');
    expect(blueprint.alternativesConsidered.length).toBeGreaterThanOrEqual(2);
    expect(blueprint.whyThisPlan.some((line) => line.includes('Öncelikli bölgelerin'))).toBe(true);
  });

  it('does not default every 4-day hypertrophy plan to upper/lower', () => {
    const draft = createInitialAIProgramDraft({
      entryPath: 'ai_hub',
      profile,
      coachPreferences: null,
    });

    draft.answers.mainGoal = 'build_muscle';
    draft.answers.preferredProgramStyle = 'auto';
    draft.answers.trainingDays = 4;
    draft.answers.sessionDurationMin = 60;
    draft.answers.location = 'gym';
    draft.answers.equipment = ['machines', 'cables', 'dumbbells', 'barbells'];
    draft.answers.experience = 'intermediate';
    draft.answers.priorityMuscles = ['chest'];
    draft.answers.painLimitations = ['none'];
    draft.answers.recoveryQuality = 'okay';

    const context = buildAIProgramDecisionContext({ draft, profile });
    const blueprint = buildAIProgramDecisionBlueprint(context);

    expect(blueprint.programFamily).toBe('hypertrophy');
    expect(blueprint.progressionModel).toBe('specialization_microcycle');
    expect(blueprint.programArchetype).toBe('hybrid_athletic');
    expect(blueprint.recommendedSplit).toBe('hybrid');
  });

  it('classifies lift-focused strength more specifically than generic strength', () => {
    const draft = createInitialAIProgramDraft({
      entryPath: 'ai_hub',
      profile,
      coachPreferences: null,
    });
    draft.answers.mainGoal = 'strength';
    draft.answers.trainingDays = 4;
    draft.answers.sessionDurationMin = 75;
    draft.answers.location = 'gym';
    draft.answers.equipment = ['machines', 'cables', 'dumbbells', 'barbells', 'bench'];
    draft.answers.experience = 'intermediate';
    draft.answers.priorityMuscles = [];
    draft.answers.painLimitations = ['none'];
    draft.answers.recoveryQuality = 'okay';
    draft.answers.preferredExercises = 'Bench press ve paused bench strength odakli ilerlemek istiyorum';

    const context = buildAIProgramDecisionContext({ draft, profile });
    const blueprint = buildAIProgramDecisionBlueprint(context);

    expect(blueprint.programFamily).toBe('strength');
    expect(['lift_specific_strength', 'powerlifting_strength']).toContain(blueprint.goalClassification);
    expect(blueprint.targetLiftPatterns).toContain('bench');
    expect(blueprint.exerciseRolePolicy).toBe('strength_role_driven');
  });

  it('allows PPL when the user asks for it and safety permits', () => {
    const draft = createInitialAIProgramDraft({
      entryPath: 'ai_hub',
      profile,
      coachPreferences: null,
    });

    draft.answers.mainGoal = 'build_muscle';
    draft.answers.preferredProgramStyle = 'push_pull_legs';
    draft.answers.trainingDays = 5;
    draft.answers.sessionDurationMin = 75;
    draft.answers.location = 'gym';
    draft.answers.equipment = ['machines', 'cables', 'dumbbells', 'barbells'];
    draft.answers.experience = 'advanced';
    draft.answers.priorityMuscles = ['chest'];
    draft.answers.painLimitations = ['none'];
    draft.answers.recoveryQuality = 'great';

    const context = buildAIProgramDecisionContext({ draft, profile });
    const blueprint = buildAIProgramDecisionBlueprint(context);

    expect(blueprint.programArchetype).toBe('ppl_hypertrophy');
    expect(blueprint.recommendedSplit).toBe('push_pull_legs');
  });

  it('uses PPL or specialization for 5-day hypertrophy with great recovery', () => {
    const draft = createInitialAIProgramDraft({
      entryPath: 'ai_hub',
      profile,
      coachPreferences: null,
    });

    draft.answers.mainGoal = 'build_muscle';
    draft.answers.preferredProgramStyle = 'auto';
    draft.answers.trainingDays = 5;
    draft.answers.sessionDurationMin = 75;
    draft.answers.location = 'gym';
    draft.answers.equipment = ['machines', 'cables', 'dumbbells', 'barbells'];
    draft.answers.experience = 'intermediate';
    draft.answers.priorityMuscles = ['chest'];
    draft.answers.painLimitations = ['none'];
    draft.answers.recoveryQuality = 'great';

    const context = buildAIProgramDecisionContext({ draft, profile });
    const blueprint = buildAIProgramDecisionBlueprint(context);

    expect(['ppl_hypertrophy', 'body_part_specialization']).toContain(blueprint.programArchetype);
    expect(['push_pull_legs', 'body_part_emphasis']).toContain(blueprint.recommendedSplit);
  });

  it('keeps 2-day home bodyweight plans minimalist or full-body', () => {
    const draft = createInitialAIProgramDraft({
      entryPath: 'ai_hub',
      profile,
      coachPreferences: null,
    });

    draft.answers.mainGoal = 'general_fitness';
    draft.answers.preferredProgramStyle = 'auto';
    draft.answers.trainingDays = 2;
    draft.answers.sessionDurationMin = 45;
    draft.answers.location = 'home';
    draft.answers.equipment = ['bodyweight_only'];
    draft.answers.experience = 'beginner';
    draft.answers.priorityMuscles = ['full_body_balance'];
    draft.answers.painLimitations = ['none'];
    draft.answers.recoveryQuality = 'okay';

    const context = buildAIProgramDecisionContext({ draft, profile });
    const blueprint = buildAIProgramDecisionBlueprint(context);

    expect(['minimalist_home', 'full_body_hypertrophy']).toContain(blueprint.programArchetype);
    expect(['minimalist_home', 'full_body']).toContain(blueprint.recommendedSplit);
  });

  it('blocks aggressive PPL style for poor recovery beginners', () => {
    const draft = createInitialAIProgramDraft({
      entryPath: 'ai_hub',
      profile,
      coachPreferences: null,
    });

    draft.answers.mainGoal = 'build_muscle';
    draft.answers.preferredProgramStyle = 'push_pull_legs';
    draft.answers.trainingDays = 6;
    draft.answers.sessionDurationMin = 60;
    draft.answers.location = 'gym';
    draft.answers.equipment = ['machines', 'dumbbells'];
    draft.answers.experience = 'beginner';
    draft.answers.priorityMuscles = ['shoulders'];
    draft.answers.painLimitations = ['none'];
    draft.answers.recoveryQuality = 'poor';

    const context = buildAIProgramDecisionContext({ draft, profile });
    const blueprint = buildAIProgramDecisionBlueprint(context);

    expect(blueprint.programArchetype).not.toBe('ppl_hypertrophy');
    expect(blueprint.recommendedSplit).not.toBe('push_pull_legs');
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
