import { describe, expect, it } from 'vitest';
import {
  buildTemplateProgram,
  createProgramRequestFromAnswers,
  fingerprintProgramRequest,
  matchTemplates,
  type ProgramRequest,
} from '@/services/templateProgramEngine';
import type { AIProgramAnswers, AIProgramEquipmentKey } from '@/types/aiProgram';
import { getTemplateSelectionDebugReport, normalizeLimitations } from '@/workout-programming';

const fullGym: AIProgramEquipmentKey[] = ['barbells', 'dumbbells', 'machines', 'cables', 'bench'];

function baseAnswers(overrides: Partial<AIProgramAnswers> = {}): AIProgramAnswers {
  return {
    mainGoal: 'strength',
    preferredProgramStyle: 'auto',
    trainingDays: 3,
    sessionDurationMin: 60,
    location: 'gym',
    equipment: fullGym,
    experience: 'beginner',
    priorityMuscles: [],
    painLimitations: ['none'],
    recoveryQuality: 'okay',
    useLatestPhysiqueAnalysis: false,
    ...overrides,
  };
}

function requestWithLimitations(limitations: string[], overrides: Partial<AIProgramAnswers> = {}): ProgramRequest {
  return createProgramRequestFromAnswers({
    answers: {
      ...baseAnswers(overrides),
      painLimitations: limitations as AIProgramAnswers['painLimitations'],
    },
  });
}

describe('Phase 3 limitation-aware filtering', () => {
  it('normalizes none-like values to no limitation', () => {
    expect(normalizeLimitations(['none', 'yok', 'no_limitations', ''])).toEqual([]);
    expect(createProgramRequestFromAnswers({ answers: baseAnswers() }).limitations).toEqual([]);
  });

  it('normalizes Turkish limitation labels deterministically', () => {
    expect(normalizeLimitations(['Diz ağrısı', 'bel problemi', 'baş üstü hareket yapamıyorum', 'derin squat yapamıyorum'])).toEqual([
      'deep_knee_flexion_restriction',
      'knee_pain',
      'lower_back_pain',
      'overhead_restriction',
    ]);
  });

  it('keeps limitation order and duplicates out of the fingerprint', () => {
    const left = requestWithLimitations(['diz ağrısı', 'bel ağrısı', 'diz ağrısı']);
    const right = requestWithLimitations(['lower_back', 'knee']);
    expect(left.limitations).toEqual(['knee_pain', 'lower_back_pain']);
    expect(right.limitations).toEqual(['knee_pain', 'lower_back_pain']);
    expect(fingerprintProgramRequest(left)).toBe(fingerprintProgramRequest(right));
  });

  it('rejects a required deep-knee-flexion exercise when the reviewed substitution is restricted', () => {
    const request = requestWithLimitations(['deep_knee_flexion_restriction'], {
      avoidedExerciseIds: ['leg_press'],
    });
    const rejected = matchTemplates(request).rejected.find((item) => item.templateId === 'forge_strength_fullbody_beginner_3d_v1');
    expect(rejected?.rejectionReasons).toContain('LIMITATION_CONFLICT');
  });

  it('allows knee limitation when a reviewed substitution exists and applies a penalty', () => {
    const request = requestWithLimitations(['knee']);
    const match = matchTemplates(request).compatible.find((item) => item.templateId === 'forge_strength_fullbody_beginner_3d_v1');
    expect(match).toBeDefined();
    expect(match?.breakdown.adaptationCostPenalty).toBeLessThan(0);
    expect(match?.explanation?.some((item) => item.includes('adaptationCostPenalty'))).toBe(true);
  });

  it('rejects shoulder limitation for required overhead press when no reviewed substitution is allowed', () => {
    const request = requestWithLimitations(['shoulder'], {
      avoidedExerciseIds: ['machine_chest_press'],
    });
    const rejected = matchTemplates(request).rejected.find((item) => item.templateId === 'forge_strength_fullbody_beginner_3d_v1');
    expect(rejected?.rejectionReasons).toContain('LIMITATION_CONFLICT');
  });

  it('uses reviewed non-overhead replacement for overhead restriction where available', () => {
    const request = requestWithLimitations(['overhead_restriction']);
    const result = buildTemplateProgram({ request });
    const allIds = result.plan.weeks[0]!.days.flatMap((day) => day.exerciseIds);
    expect(result.adaptations.some((item) =>
      item.type === 'limitation_substitution'
      && item.triggeringLimitation === 'overhead_restriction'
      && item.replacementExerciseId === 'csv-chest-press-machine',
    )).toBe(true);
    expect(allIds).toContain('csv-chest-press-machine');
    expect(allIds).not.toContain('csv-overhead-press-barbell');
  });

  it('rejects lower-back/spinal-loading conflict when no reviewed resolution exists', () => {
    const request = requestWithLimitations(['spinal_loading_restriction']);
    const rejected = matchTemplates(request).rejected.find((item) => item.templateId === 'forge_strength_fullbody_beginner_3d_v1');
    expect(rejected?.rejectionReasons).toContain('LIMITATION_CONFLICT');
  });

  it('does not reject the whole template for optional conflicting isolation', () => {
    const request = createProgramRequestFromAnswers({
      answers: baseAnswers({
        mainGoal: 'build_muscle',
        trainingDays: 5,
        experience: 'intermediate',
        painLimitations: ['elbow'],
      }),
    });
    const matches = matchTemplates(request);
    expect(matches.compatible.some((item) => item.templateId === 'forge_hypertrophy_bodypart_intermediate_5d_v1')).toBe(true);
  });

  it('fails reviewed substitution when replacement equipment is unavailable', () => {
    const request = requestWithLimitations(['overhead_restriction'], {
      equipment: ['barbells', 'dumbbells', 'bench'],
    });
    const rejected = matchTemplates(request).rejected.find((item) => item.templateId === 'forge_strength_fullbody_beginner_3d_v1');
    expect(rejected?.rejectionReasons).toContain('LIMITATION_CONFLICT');
  });

  it('fails reviewed substitution when replacement exercise is restricted', () => {
    const request = requestWithLimitations(['overhead_restriction'], {
      avoidedExerciseIds: ['machine_chest_press', 'csv-machine-chest-press'],
    });
    const rejected = matchTemplates(request).rejected.find((item) => item.templateId === 'forge_strength_fullbody_beginner_3d_v1');
    expect(rejected?.rejectionReasons).toContain('LIMITATION_CONFLICT');
  });

  it('prefers lower limitation adaptation cost in an otherwise equal tie', () => {
    const request = createProgramRequestFromAnswers({
      answers: baseAnswers({
        mainGoal: 'general_fitness',
        trainingDays: 3,
        sessionDurationMin: 45,
        experience: 'beginner',
        painLimitations: ['knee'],
      }),
    });
    const matches = matchTemplates(request);
    expect((matches.compatible[0]?.breakdown.adaptationCostPenalty ?? 0)).toBeGreaterThanOrEqual(matches.compatible[1]?.breakdown.adaptationCostPenalty ?? -999);
  });

  it('final instantiated program contains replacement instead of conflicting original', () => {
    const request = requestWithLimitations(['knee']);
    const result = buildTemplateProgram({ request });
    const allIds = result.plan.weeks[0]!.days.flatMap((day) => day.exerciseIds);
    expect(result.validation.valid).toBe(true);
    expect(allIds).toContain('csv-leg-press');
    expect(allIds).not.toContain('csv-squat-barbell');
  });

  it('debug report and no-match include limitation decisions', () => {
    const request = requestWithLimitations(['spinal_loading_restriction']);
    const report = getTemplateSelectionDebugReport(request);
    expect(report.request.limitations).toEqual(['spinal_loading_restriction']);
    expect(report.compatibleTemplates).toHaveLength(0);
    expect(report.rejectedTemplates.some((item) => item.rejectionReasons?.includes('LIMITATION_CONFLICT'))).toBe(true);
  });

  it('repeats the same limitation request 100 times with identical result', () => {
    const request = requestWithLimitations(['knee', 'overhead_restriction']);
    const firstFingerprint = fingerprintProgramRequest(request);
    const firstMatches = matchTemplates(request);
    for (let index = 0; index < 100; index += 1) {
      expect(fingerprintProgramRequest(request)).toBe(firstFingerprint);
      expect(matchTemplates(request)).toEqual(firstMatches);
    }
  });
});
