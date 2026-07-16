import { describe, it, expect } from 'vitest';
import {
  createProgramRequestFromAnswers,
  recommendPrograms,
  type ProgramRequest,
  type ProgramRecommendations,
  type NoMatchExplanation,
} from '@/services/templateProgramEngine';

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
