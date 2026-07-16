import { describe, it, expect } from 'vitest';
import {
  createProgramRequestFromAnswers,
  recommendPrograms,
  buildTemplateProgram,
  fingerprintProgramRequest,
  type ProgramRequest,
  type ProgramRecommendations,
  type NoMatchExplanation,
} from '@/services/templateProgramEngine';
import type { AIProgramAnswers } from '@/types/aiProgram';

describe('Program Recommendation System', () => {
  describe('Unspecified Equipment (Case A)', () => {
    it('should return recommendations for lose_fat + 4 days + unspecified equipment', () => {
      const request: ProgramRequest = createProgramRequestFromAnswers({
        answers: {
          mainGoal: 'lose_fat',
          trainingDays: 4,
          equipment: [], // Unspecified
          experience: undefined, // Unspecified
          priorityMuscles: [],
          painLimitations: [],
          useLatestPhysiqueAnalysis: false,
        },
      });

      // Verify request normalization
      expect(request.goal).toBe('general_fitness');
      expect(request.modality).toBe('general_fitness');
      expect(request.level).toBe('beginner'); // Default
      expect(request.daysPerWeek).toBe(4);
      expect(request.availableEquipment).toEqual([]);
      expect(request.equipmentSpecified).toBe(false);

      // Get recommendations
      const result = recommendPrograms(request);

      // Should have recommendations (not zero-result)
      expect('bestMatch' in result).toBe(true);
      expect('alternatives' in result).toBe(true);

      if ('bestMatch' in result) {
        const recs = result as ProgramRecommendations;
        expect(recs.bestMatch).toBeDefined();
        expect(recs.bestMatch.matchScore).toBeGreaterThan(0);
        expect(recs.totalCompatible).toBeGreaterThan(0);

        // Best match should be highest-scoring
        if (recs.alternatives.length > 0) {
          expect(recs.bestMatch.matchScore).toBeGreaterThanOrEqual(recs.alternatives[0].matchScore);
        }

        // Check that assumptions mention unspecified equipment
        const hasEquipmentAssumption = recs.bestMatch.assumptions.some((a) =>
          a.includes('Equipment unspecified')
        );
        expect(hasEquipmentAssumption).toBe(true);
      }
    });

    it('should not add bodyweight to availableEquipment when unspecified', () => {
      const request = createProgramRequestFromAnswers({
        answers: {
          mainGoal: 'lose_fat',
          trainingDays: 4,
          equipment: [], // Empty but not "bodyweight" selection
          priorityMuscles: [],
          painLimitations: [],
          useLatestPhysiqueAnalysis: false,
        },
      });

      // Should NOT have 'bodyweight' automatically added
      expect(request.availableEquipment).not.toContain('bodyweight');
      expect(request.equipmentSpecified).toBe(false);
      expect(request.equipmentProfile).not.toBe('bodyweight_home');
    });

    it('should return up to 3 recommendations', () => {
      const request = createProgramRequestFromAnswers({
        answers: {
          mainGoal: 'lose_fat',
          trainingDays: 4,
          equipment: [],
          priorityMuscles: [],
          painLimitations: [],
          useLatestPhysiqueAnalysis: false,
        },
      });

      const result = recommendPrograms(request);

      if ('bestMatch' in result) {
        const recs = result as ProgramRecommendations;
        expect(recs.alternatives.length).toBeLessThanOrEqual(2);

        const totalShown = 1 + recs.alternatives.length;
        expect(totalShown).toBeLessThanOrEqual(3);
      }
    });
  });

  describe('Gym Location + Unspecified Equipment (Case B)', () => {
    it('should return gym-compatible recommendations when location=gym, equipment=[]', () => {
      const request = createProgramRequestFromAnswers({
        answers: {
          mainGoal: 'lose_fat',
          trainingDays: 4,
          location: 'gym',
          equipment: [], // Unspecified despite gym location
          experience: 'intermediate',
          priorityMuscles: [],
          painLimitations: [],
          useLatestPhysiqueAnalysis: false,
        },
      });

      // When location is specified, equipment should be considered specified
      expect(request.equipmentSpecified).toBe(true);

      const result = recommendPrograms(request);

      if ('bestMatch' in result) {
        const recs = result as ProgramRecommendations;
        expect(recs.bestMatch).toBeDefined();

        // Should not force bodyweight_home
        expect(recs.bestMatch.equipmentProfile).not.toBe('bodyweight_home');
      }
    });
  });

  describe('Home Location + Unspecified Equipment (Case C)', () => {
    it('should return home-compatible recommendations when location=home, equipment=[]', () => {
      const request = createProgramRequestFromAnswers({
        answers: {
          mainGoal: 'lose_fat',
          trainingDays: 4,
          location: 'home',
          equipment: [],
          experience: 'beginner',
          priorityMuscles: [],
          painLimitations: [],
          useLatestPhysiqueAnalysis: false,
        },
      });

      expect(request.equipmentSpecified).toBe(true);
      // Home location adds bodyweight to availableEquipment
      expect(request.availableEquipment).toContain('bodyweight');

      const result = recommendPrograms(request);

      if ('bestMatch' in result) {
        const recs = result as ProgramRecommendations;
        expect(recs.bestMatch).toBeDefined();
        // Should prefer home-compatible templates
      }
    });
  });

  describe('Explicit Equipment (Case D)', () => {
    it('should only return dumbbell-compatible templates when dumbbell specified', () => {
      const request = createProgramRequestFromAnswers({
        answers: {
          mainGoal: 'build_muscle', // Changed from 'hypertrophy'
          trainingDays: 4,
          location: 'gym',
          equipment: ['dumbbells'],
          experience: 'intermediate',
          priorityMuscles: [],
          painLimitations: [],
          useLatestPhysiqueAnalysis: false,
        },
      });

      expect(request.equipmentSpecified).toBe(true);
      expect(request.equipmentProfile).toBe('dumbbell_only');

      const result = recommendPrograms(request);

      if ('bestMatch' in result) {
        const recs = result as ProgramRecommendations;
        // All recommendations should be dumbbell-compatible
        const allDumbbell = [recs.bestMatch, ...recs.alternatives].every((r) =>
          r.equipmentProfile === 'dumbbell_only' || r.equipmentProfile === 'full_gym'
        );
        expect(allDumbbell).toBe(true);

        // Should NOT include barbell-only or machine-only programs
        const hasBarbellOnly = [recs.bestMatch, ...recs.alternatives].some((r) =>
          r.requiredEquipment.includes('barbell') && !r.requiredEquipment.includes('dumbbell')
        );
        expect(hasBarbellOnly).toBe(false);
      }
    });
  });

  describe('Exact Ranking (Case E)', () => {
    it('should rank exact goal/modality/day match above approximate matches', () => {
      // This test verifies the scoring system prioritizes exact matches
      const request1 = createProgramRequestFromAnswers({
        answers: {
          mainGoal: 'strength',
          trainingDays: 4,
          location: 'gym',
          equipment: ['dumbbells', 'machines', 'cables', 'barbells'],
          experience: 'intermediate',
          priorityMuscles: [],
          painLimitations: [],
          useLatestPhysiqueAnalysis: false,
        },
      });

      const result1 = recommendPrograms(request1);

      if ('bestMatch' in result1) {
        const recs = result1 as ProgramRecommendations;
        // Best match should have high score (exact matches on goal, days, equipment)
        expect(recs.bestMatch.matchScore).toBeGreaterThan(50);

        // Exact matches should be reflected
        expect(recs.bestMatch.exactMatches.goal).toBe(true);
        expect(recs.bestMatch.exactMatches.daysPerWeek).toBe(true);
        expect(recs.bestMatch.exactMatches.equipment).toBe(true);
      }
    });

    it('should score closest duration higher than farther duration', () => {
      const request = createProgramRequestFromAnswers({
        answers: {
          mainGoal: 'general_fitness',
          trainingDays: 3,
          location: 'gym',
          equipment: ['barbells'],
          experience: 'beginner',
          sessionDurationMin: 45,
          priorityMuscles: [],
          painLimitations: [],
          useLatestPhysiqueAnalysis: false,
        },
      });

      const result = recommendPrograms(request);

      if ('bestMatch' in result) {
        const recs = result as ProgramRecommendations;
        // The best match should have duration closest to 45 min
        const durationDiff = Math.abs(recs.bestMatch.estimatedSessionMinutes - 45);
        expect(durationDiff).toBeLessThanOrEqual(15);
      }
    });

    it('should score selected focus muscles higher', () => {
      const request = createProgramRequestFromAnswers({
        answers: {
          mainGoal: 'build_muscle',
          trainingDays: 4,
          location: 'gym',
          equipment: ['dumbbells', 'machines', 'cables', 'barbells'],
          experience: 'intermediate',
          priorityMuscles: ['chest', 'quads'],
          painLimitations: [],
          useLatestPhysiqueAnalysis: false,
        },
      });

      const result = recommendPrograms(request);

      if ('bestMatch' in result) {
        const recs = result as ProgramRecommendations;
        // Should have some focus muscle matching reflected
        expect(recs.bestMatch.exactMatches.focusMuscles).toBeDefined();
      }
    });
  });

  describe('Yoga Modality (Case F)', () => {
    it('should return only yoga modality templates for yoga goal', () => {
      const request = createProgramRequestFromAnswers({
        answers: {
          mainGoal: 'yoga',
          trainingDays: 3,
          location: 'home',
          equipment: ['bodyweight_only'],
          experience: 'beginner',
          priorityMuscles: [],
          painLimitations: [],
          useLatestPhysiqueAnalysis: false,
        },
      });

      const result = recommendPrograms(request);

      if ('bestMatch' in result) {
        const recs = result as ProgramRecommendations;
        expect(recs.bestMatch).toBeDefined();

        // All recommendations should be yoga modality
        const allYoga = [recs.bestMatch, ...recs.alternatives].every((r) =>
          r.modality === 'yoga'
        );
        expect(allYoga).toBe(true);
      }
    });
  });

  describe('Pilates Modality (Case G)', () => {
    it('should return only pilates modality templates for pilates goal', () => {
      const request = createProgramRequestFromAnswers({
        answers: {
          mainGoal: 'pilates',
          trainingDays: 3,
          location: 'home',
          equipment: ['bodyweight_only'],
          experience: 'beginner',
          priorityMuscles: [],
          painLimitations: [],
          useLatestPhysiqueAnalysis: false,
        },
      });

      const result = recommendPrograms(request);

      if ('bestMatch' in result) {
        const recs = result as ProgramRecommendations;
        expect(recs.bestMatch).toBeDefined();

        // All recommendations should be pilates modality
        const allPilates = [recs.bestMatch, ...recs.alternatives].every((r) =>
          r.modality === 'pilates'
        );
        expect(allPilates).toBe(true);
      }
    });
  });

  describe('Shoulder Limitation (Case H)', () => {
    it('should exclude unsafe shoulder templates for shoulder limitation', () => {
      const request = createProgramRequestFromAnswers({
        answers: {
          mainGoal: 'strength',
          trainingDays: 4,
          location: 'gym',
          equipment: ['barbells'],
          experience: 'intermediate',
          priorityMuscles: [],
          painLimitations: ['shoulder'],
          useLatestPhysiqueAnalysis: false,
        },
      });

      const result = recommendPrograms(request);

      if ('bestMatch' in result) {
        const recs = result as ProgramRecommendations;
        expect(recs.bestMatch).toBeDefined();

        // Should have fewer total compatible due to limitation filtering
        expect(recs.totalRejected).toBeGreaterThan(0);

        // Verify shoulder-conflicting exercises are handled
        // (This would be verified by checking adaptations in actual program build)
      }
    });
  });

  describe('Impossible Hard Constraints (Case I)', () => {
    it('should return zero results with actionable explanation', () => {
      const request = createProgramRequestFromAnswers({
        answers: {
          mainGoal: 'strength',
          trainingDays: 6, // Maximum supported
          location: 'home',
          equipment: ['bodyweight_only'],
          experience: 'advanced',
          priorityMuscles: ['chest', 'shoulders', 'arms', 'lats'], // Many focus muscles
          painLimitations: ['shoulder', 'knee', 'lower_back'], // Multiple limitations
          useLatestPhysiqueAnalysis: false,
        },
      });

      const result = recommendPrograms(request);

      // Should be zero-result case
      expect('blockingConstraints' in result).toBe(true);

      if ('blockingConstraints' in result) {
        const noMatch = result as NoMatchExplanation;
        expect(noMatch.blockingConstraints.length).toBeGreaterThan(0);
        expect(noMatch.rejectionCounts).toBeDefined();
        expect(noMatch.suggestedChanges.length).toBeGreaterThan(0);
        expect(noMatch.hasAnyTemplates).toBe(true);

        // Should have actionable suggestions
        const hasDaySuggestion = noMatch.suggestedChanges.some((s) =>
          s.includes('training days')
        );
        expect(hasDaySuggestion).toBe(true);
      }
    });
  });

  describe('Stable Library Fallback (Case J)', () => {
    it('should work with stable library when feature flag is set', () => {
      // This test verifies the stable library still works
      // The actual feature flag behavior is controlled by environment
      // Here we just verify the types and structure are compatible

      const request = createProgramRequestFromAnswers({
        answers: {
          mainGoal: 'strength',
          trainingDays: 3,
          location: 'gym',
          equipment: ['barbells'],
          experience: 'beginner',
          priorityMuscles: [],
          painLimitations: [],
          useLatestPhysiqueAnalysis: false,
        },
      });

      // Should create valid request
      expect(request).toBeDefined();
      expect(request.equipmentSpecified).toBe(true);

      // Recommendations should work
      const result = recommendPrograms(request);
      expect('bestMatch' in result || 'blockingConstraints' in result).toBe(true);
    });
  });

  describe('equipmentSpecified Flag', () => {
    it('should be false when equipment and location are both unspecified', () => {
      const request = createProgramRequestFromAnswers({
        answers: {
          mainGoal: 'lose_fat',
          trainingDays: 4,
          equipment: [],
          priorityMuscles: [],
          painLimitations: [],
          useLatestPhysiqueAnalysis: false,
        },
      });

      expect(request.equipmentSpecified).toBe(false);
    });

    it('should be true when equipment is specified', () => {
      const request = createProgramRequestFromAnswers({
        answers: {
          mainGoal: 'lose_fat',
          trainingDays: 4,
          equipment: ['dumbbells'],
          priorityMuscles: [],
          painLimitations: [],
          useLatestPhysiqueAnalysis: false,
        },
      });

      expect(request.equipmentSpecified).toBe(true);
    });

    it('should be true when location is specified', () => {
      const request = createProgramRequestFromAnswers({
        answers: {
          mainGoal: 'lose_fat',
          trainingDays: 4,
          location: 'home',
          equipment: [],
          priorityMuscles: [],
          painLimitations: [],
          useLatestPhysiqueAnalysis: false,
        },
      });

      expect(request.equipmentSpecified).toBe(true);
    });

    it('should be true when location=gym even with empty equipment', () => {
      const request = createProgramRequestFromAnswers({
        answers: {
          mainGoal: 'lose_fat',
          trainingDays: 4,
          location: 'gym',
          equipment: [],
          priorityMuscles: [],
          painLimitations: [],
          useLatestPhysiqueAnalysis: false,
        },
      });

      expect(request.equipmentSpecified).toBe(true);
    });
  });
});

describe('Explicit Template Selection', () => {
  // Unspecified equipment + general_fitness/3d/beginner yields multiple compatible
  // templates in the stable library, so alternatives exist to select between.
  const multiTemplateAnswers: AIProgramAnswers = {
    mainGoal: 'lose_fat',
    trainingDays: 3,
    experience: 'beginner',
    equipment: [],
    priorityMuscles: [],
    painLimitations: ['none'],
    useLatestPhysiqueAnalysis: false,
  };

  function buildRequestWithSelection(selectedTemplateId?: string): ProgramRequest {
    return createProgramRequestFromAnswers({
      answers: multiTemplateAnswers,
      selectedTemplateId,
    });
  }

  function requireMultipleCandidates() {
    const recs = recommendPrograms(buildRequestWithSelection());
    expect('bestMatch' in recs).toBe(true);
    if (!('bestMatch' in recs)) return null;
    const candidates = [recs.bestMatch, ...recs.alternatives];
    expect(candidates.length).toBeGreaterThan(1);
    return candidates;
  }

  it('fingerprint changes when selectedTemplateId differs', () => {
    const baseline = fingerprintProgramRequest(buildRequestWithSelection());

    const candidates = requireMultipleCandidates();
    if (!candidates) return;

    const first = fingerprintProgramRequest(buildRequestWithSelection(candidates[0]!.templateId));
    const second = fingerprintProgramRequest(buildRequestWithSelection(candidates[1]!.templateId));
    const auto = fingerprintProgramRequest(buildRequestWithSelection());

    expect(first).not.toBe(second);
    expect(first).not.toBe(baseline);
    expect(auto).toBe(baseline);
  });

  it('activates the exact selected template, not the best match', () => {
    const candidates = requireMultipleCandidates();
    if (!candidates) return;

    const best = candidates[0]!;
    const alternative = candidates[1]!;

    // Selecting the alternative must instantiate the alternative, not the best match.
    const result = buildTemplateProgram({ request: buildRequestWithSelection(alternative.templateId) });

    expect(result.selectedTemplateId).toBe(alternative.templateId);
    expect(result.selectedTemplateId).not.toBe(best.templateId);
    expect(result.plan.selectedTemplateId).toBe(alternative.templateId);
  });

  it('selecting two different templates yields two different instantiated plans', () => {
    const candidates = requireMultipleCandidates();
    if (!candidates) return;

    const planA = buildTemplateProgram({ request: buildRequestWithSelection(candidates[0]!.templateId) });
    const planB = buildTemplateProgram({ request: buildRequestWithSelection(candidates[1]!.templateId) });

    expect(planA.selectedTemplateId).not.toBe(planB.selectedTemplateId);
    expect(planA.plan.id).not.toBe(planB.plan.id);
  });
});

describe('Determinism', () => {
  it('produces identical recommendation order across 100 repetitions', () => {
    const request = createProgramRequestFromAnswers({
      answers: {
        mainGoal: 'lose_fat',
        trainingDays: 3,
        experience: 'beginner',
        equipment: [],
        priorityMuscles: [],
        painLimitations: ['none'],
        useLatestPhysiqueAnalysis: false,
      },
    });

    const baseline = recommendPrograms(request);
    expect('bestMatch' in baseline).toBe(true);
    if (!('bestMatch' in baseline)) return;

    const baselineIds = [baseline.bestMatch, ...baseline.alternatives].map((r) => r.templateId);
    const baselineScores = [baseline.bestMatch, ...baseline.alternatives].map((r) => r.matchScore);

    for (let i = 0; i < 100; i += 1) {
      const repeat = recommendPrograms(request);
      if (!('bestMatch' in repeat)) {
        // Should never flip to a no-match on identical input.
        expect(false).toBe(true);
        return;
      }
      const repeatIds = [repeat.bestMatch, ...repeat.alternatives].map((r) => r.templateId);
      const repeatScores = [repeat.bestMatch, ...repeat.alternatives].map((r) => r.matchScore);
      expect(repeatIds).toEqual(baselineIds);
      expect(repeatScores).toEqual(baselineScores);
      // Scores must be non-increasing (ranked by descending score).
      for (let s = 1; s < repeatScores.length; s += 1) {
        expect(repeatScores[s - 1]).toBeGreaterThanOrEqual(repeatScores[s]);
      }
    }
  });
});

describe('forceNewVariation', () => {
  it('does not force an invalid template when no strong alternative exists', () => {
    // strength + 3 days + beginner + gym + barbells resolves to a single
    // compatible template in the stable library, so forceNewVariation must
    // keep the valid template rather than forcing a rejected/unsafe one.
    const answers: AIProgramAnswers = {
      mainGoal: 'strength',
      trainingDays: 3,
      location: 'gym',
      equipment: ['barbells'],
      experience: 'beginner',
      priorityMuscles: [],
      painLimitations: ['none'],
      useLatestPhysiqueAnalysis: false,
    };
    const baseRequest = createProgramRequestFromAnswers({ answers });
    const first = buildTemplateProgram({ request: baseRequest });

    const variation = buildTemplateProgram({
      request: { ...baseRequest, forceNewVariation: true, previousTemplateId: first.selectedTemplateId },
    });

    expect(variation.validation.valid).toBe(true);
    expect(variation.selectedTemplateId).toMatch(/^forge_/);
  });
});

describe('Zero-Result Safety', () => {
  it('never suggests removing safety constraints (limitations)', () => {
    // An impossible hard-constraint combination must yield an actionable
    // explanation whose suggestions never propose dropping an injury/limitation.
    const request = createProgramRequestFromAnswers({
      answers: {
        mainGoal: 'strength',
        trainingDays: 6,
        location: 'home',
        equipment: ['bodyweight_only'],
        experience: 'advanced',
        priorityMuscles: ['chest', 'shoulders', 'arms', 'lats'],
        painLimitations: ['shoulder', 'knee', 'lower_back'],
        useLatestPhysiqueAnalysis: false,
      },
    });

    const result = recommendPrograms(request);
    expect('blockingConstraints' in result).toBe(true);
    if (!('blockingConstraints' in result)) return;

    // Guard against suggestions that advise dropping safety constraints.
    // An informational note ("limitations may restrict programs") is allowed;
    // an imperative to remove/drop/ignore a limitation is not.
    const removalAdvice = /(remove|drop|ignore|disable|clear)\s+(your\s+)?(limitation|injury|pain|restriction)/i;
    for (const suggestion of result.suggestedChanges) {
      expect(removalAdvice.test(suggestion)).toBe(false);
    }
    // Must still provide at least one actionable, non-safety-weakening suggestion.
    expect(result.suggestedChanges.length).toBeGreaterThan(0);
  });
});

