import { describe, expect, it } from 'vitest';
import {
  buildTemplateProgram,
  createProgramRequestFromAnswers,
  fingerprintProgramRequest,
  matchTemplates,
  type ProgramRequest,
} from '@/services/templateProgramEngine';
import type { AIProgramAnswers, AIProgramEquipmentKey, AIProgramExperience, AIProgramGoal } from '@/types/aiProgram';
import {
  filterCompatibleTemplates,
  getTemplateSelectionDebugReport,
  normalizeProgramRequest,
  selectTemplateDeterministically,
} from '@/workout-programming';

type Scenario = {
  name: string;
  answers: AIProgramAnswers;
  expectedTemplateId: string;
};

const gymEquipment: AIProgramEquipmentKey[] = ['barbells', 'dumbbells', 'machines', 'cables', 'bench'];

function answers(input: {
  goal: AIProgramGoal;
  level: AIProgramExperience;
  days: 2 | 3 | 4 | 5 | 6;
  duration?: 30 | 45 | 60 | 75 | 90;
  equipment?: AIProgramEquipmentKey[];
  location?: 'gym' | 'home';
  style?: AIProgramAnswers['preferredProgramStyle'];
  focus?: AIProgramAnswers['priorityMuscles'];
  avoided?: string[];
}): AIProgramAnswers {
  return {
    mainGoal: input.goal,
    preferredProgramStyle: input.style ?? 'auto',
    trainingDays: input.days,
    sessionDurationMin: input.duration ?? 60,
    location: input.location ?? 'gym',
    equipment: input.equipment ?? gymEquipment,
    experience: input.level,
    priorityMuscles: input.focus ?? [],
    painLimitations: ['none'],
    recoveryQuality: 'okay',
    avoidedExerciseIds: input.avoided,
    useLatestPhysiqueAnalysis: false,
  };
}

const supportedScenarios: Scenario[] = [
  { name: 'Beginner strength 3d full gym', answers: answers({ goal: 'strength', level: 'beginner', days: 3 }), expectedTemplateId: 'forge_strength_fullbody_beginner_3d_v1' },
  { name: 'Beginner strength 4d full gym', answers: answers({ goal: 'strength', level: 'beginner', days: 4 }), expectedTemplateId: 'forge_strength_upper_lower_beginner_4d_v1' },
  { name: 'Intermediate strength 3d', answers: answers({ goal: 'strength', level: 'intermediate', days: 3 }), expectedTemplateId: 'forge_strength_fullbody_intermediate_3d_v1' },
  { name: 'Intermediate strength 4d', answers: answers({ goal: 'strength', level: 'intermediate', days: 4 }), expectedTemplateId: 'forge_strength_upper_lower_intermediate_4d_v1' },
  { name: 'Intermediate strength 5d', answers: answers({ goal: 'strength', level: 'intermediate', days: 5 }), expectedTemplateId: 'forge_strength_intermediate_5d_v1' },
  { name: 'Advanced strength 4d', answers: answers({ goal: 'strength', level: 'advanced', days: 4, duration: 75 }), expectedTemplateId: 'forge_strength_advanced_4d_v1' },
  { name: 'Beginner hypertrophy 3d', answers: answers({ goal: 'build_muscle', level: 'beginner', days: 3 }), expectedTemplateId: 'forge_hypertrophy_fullbody_beginner_3d_v1' },
  { name: 'Beginner hypertrophy 4d', answers: answers({ goal: 'build_muscle', level: 'beginner', days: 4 }), expectedTemplateId: 'forge_hypertrophy_upper_lower_beginner_4d_v1' },
  { name: 'Intermediate hypertrophy 3d', answers: answers({ goal: 'build_muscle', level: 'intermediate', days: 3 }), expectedTemplateId: 'forge_hypertrophy_fullbody_intermediate_3d_v1' },
  { name: 'Intermediate hypertrophy 4d', answers: answers({ goal: 'build_muscle', level: 'intermediate', days: 4 }), expectedTemplateId: 'forge_hypertrophy_upper_lower_intermediate_4d_v1' },
  { name: 'Intermediate hypertrophy 5d', answers: answers({ goal: 'build_muscle', level: 'intermediate', days: 5 }), expectedTemplateId: 'forge_hypertrophy_bodypart_intermediate_5d_v1' },
  { name: 'Intermediate hypertrophy 6d', answers: answers({ goal: 'build_muscle', level: 'intermediate', days: 6 }), expectedTemplateId: 'forge_hypertrophy_ppl_intermediate_6d_v1' },
  { name: 'Advanced hypertrophy 4d', answers: answers({ goal: 'build_muscle', level: 'advanced', days: 4 }), expectedTemplateId: 'forge_hypertrophy_upper_lower_advanced_4d_v1' },
  { name: 'Advanced hypertrophy 6d', answers: answers({ goal: 'build_muscle', level: 'advanced', days: 6 }), expectedTemplateId: 'forge_hypertrophy_ppl_advanced_6d_v1' },
  { name: 'Intermediate powerbuilding 4d', answers: answers({ goal: 'recomposition', level: 'intermediate', days: 4 }), expectedTemplateId: 'forge_powerbuilding_intermediate_4d_v1' },
  { name: 'Intermediate powerbuilding 5d', answers: answers({ goal: 'recomposition', level: 'intermediate', days: 5 }), expectedTemplateId: 'forge_powerbuilding_intermediate_5d_v1' },
  { name: 'Advanced powerbuilding 4d', answers: answers({ goal: 'recomposition', level: 'advanced', days: 4, duration: 75 }), expectedTemplateId: 'forge_powerbuilding_advanced_4d_v1' },
  { name: 'Advanced powerbuilding 5d', answers: answers({ goal: 'recomposition', level: 'advanced', days: 5 }), expectedTemplateId: 'forge_powerbuilding_advanced_5d_v1' },
  { name: 'Beginner general fitness 3d full gym', answers: answers({ goal: 'general_fitness', level: 'beginner', days: 3, duration: 45 }), expectedTemplateId: 'forge_general_fitness_beginner_gym_3d_v1' },
  { name: 'Beginner general fitness 4d full gym', answers: answers({ goal: 'general_fitness', level: 'beginner', days: 4, duration: 45 }), expectedTemplateId: 'forge_general_fitness_beginner_gym_4d_v1' },
  { name: 'Beginner dumbbell-only 3d', answers: answers({ goal: 'general_fitness', level: 'beginner', days: 3, duration: 45, equipment: ['dumbbells', 'bench'] }), expectedTemplateId: 'forge_general_fitness_dumbbell_beginner_3d_v1' },
  { name: 'Beginner home bodyweight 3d', answers: answers({ goal: 'general_fitness', level: 'beginner', days: 3, duration: 30, location: 'home', equipment: ['bodyweight_only'] }), expectedTemplateId: 'forge_home_bodyweight_beginner_3d_v1' },
  { name: 'Beginner resistance-band home 3d', answers: answers({ goal: 'general_fitness', level: 'beginner', days: 3, duration: 30, location: 'home', equipment: ['bodyweight_only', 'bands'] }), expectedTemplateId: 'forge_home_band_beginner_3d_v1' },
  { name: 'Intermediate general fitness 3d', answers: answers({ goal: 'general_fitness', level: 'intermediate', days: 3, duration: 60 }), expectedTemplateId: 'forge_general_fitness_intermediate_3d_v1' },
  { name: 'Intermediate general fitness 4d', answers: answers({ goal: 'general_fitness', level: 'intermediate', days: 4, duration: 60 }), expectedTemplateId: 'forge_general_fitness_intermediate_4d_v1' },
];

function permutedRequest(base: ProgramRequest): ProgramRequest {
  return {
    ...base,
    availableEquipment: [...base.availableEquipment].reverse(),
    focusMuscles: [...base.focusMuscles].reverse(),
    restrictedExerciseIds: [...base.restrictedExerciseIds].reverse(),
    limitations: [...base.limitations].reverse(),
  };
}

describe('Phase 3 deterministic selection scenario matrix', () => {
  it.each(supportedScenarios)('$name selects the expected curated template', (scenario) => {
    const request = createProgramRequestFromAnswers({ answers: scenario.answers });
    const selection = selectTemplateDeterministically(request);
    expect(selection.template.id).toBe(scenario.expectedTemplateId);
    expect(selection.compatible[0]?.templateId).toBe(scenario.expectedTemplateId);
    expect(selection.match.rejectionReasons).toBeUndefined();
  });

  it('repeats every supported request 100 times with identical output', () => {
    for (const scenario of supportedScenarios) {
      const request = createProgramRequestFromAnswers({ answers: scenario.answers });
      const firstMatches = matchTemplates(request);
      const firstFingerprint = fingerprintProgramRequest(request);
      for (let index = 0; index < 100; index += 1) {
        const nextMatches = matchTemplates(request);
        expect(fingerprintProgramRequest(request), scenario.name).toBe(firstFingerprint);
        expect(nextMatches.compatible, scenario.name).toEqual(firstMatches.compatible);
        expect(selectTemplateDeterministically(request).template.id, scenario.name).toBe(scenario.expectedTemplateId);
      }
    }
  });

  it('normalizes semantically identical array order into the same fingerprint and selection', () => {
    const request = createProgramRequestFromAnswers({
      answers: answers({
        goal: 'build_muscle',
        level: 'intermediate',
        days: 4,
        focus: ['chest', 'lats'],
        avoided: ['foo', 'bar'],
      }),
    });
    const permuted = permutedRequest(request);
    expect(fingerprintProgramRequest(permuted)).toBe(fingerprintProgramRequest(request));
    expect(matchTemplates(permuted).compatible).toEqual(matchTemplates(request).compatible);
  });

  it('maps Turkish and legacy split labels to canonical values without destabilizing selection', () => {
    const request = normalizeProgramRequest({
      answers: {
        ...answers({ goal: 'build_muscle', level: 'intermediate', days: 4 }),
        preferredProgramStyle: 'Tüm Vücut' as AIProgramAnswers['preferredProgramStyle'],
      },
    });
    expect(request.preferredSplit).toBe('full_body');
    expect(fingerprintProgramRequest(request)).toMatch(/^forge-program-request:v1:/);
  });

  it('hard-rejects unsupported day counts and incompatible exact constraints', () => {
    const twoDay = createProgramRequestFromAnswers({ answers: answers({ goal: 'strength', level: 'beginner', days: 2 }) });
    expect(matchTemplates(twoDay).compatible).toHaveLength(0);
    expect(matchTemplates(twoDay).rejected.some((item) => item.rejectionReasons?.includes('DAY_COUNT_MISMATCH'))).toBe(true);

    const sevenDay = { ...twoDay, daysPerWeek: 7 };
    expect(matchTemplates(sevenDay).compatible).toHaveLength(0);

    const beginnerAdvancedSplit = createProgramRequestFromAnswers({ answers: answers({ goal: 'build_muscle', level: 'beginner', days: 6, style: 'push_pull_legs' }) });
    expect(matchTemplates(beginnerAdvancedSplit).compatible).toHaveLength(0);
    expect(matchTemplates(beginnerAdvancedSplit).rejected.some((item) => item.rejectionReasons?.includes('LEVEL_MISMATCH'))).toBe(true);
  });

  it('does not cross goals or day counts through focus-muscle scoring', () => {
    const request = createProgramRequestFromAnswers({
      answers: answers({ goal: 'strength', level: 'intermediate', days: 4, focus: ['chest', 'lats'] }),
    });
    const matches = matchTemplates(request);
    expect(matches.compatible.every((item) => item.templateId.includes('strength'))).toBe(true);
  });

  it('rejects explicit split mismatch instead of scoring around it', () => {
    const request = createProgramRequestFromAnswers({
      answers: answers({ goal: 'strength', level: 'intermediate', days: 4, style: 'push_pull_legs' }),
    });
    expect(matchTemplates(request).compatible).toHaveLength(0);
    expect(matchTemplates(request).rejected.some((item) => item.rejectionReasons?.includes('SPLIT_MISMATCH'))).toBe(true);
  });

  it('returns a structured debug report for no-match and selection traces', () => {
    const request = createProgramRequestFromAnswers({ answers: answers({ goal: 'strength', level: 'beginner', days: 2 }) });
    const report = getTemplateSelectionDebugReport(request);
    expect(report.fingerprint).toMatch(/^forge-program-request:v1:/);
    expect(report.compatibleTemplates).toHaveLength(0);
    expect(report.rejectedTemplates.length).toBeGreaterThan(0);
  });

  it('uses existing-program reuse unless forceNewVariation is explicitly requested', () => {
    const request = createProgramRequestFromAnswers({ answers: answers({ goal: 'strength', level: 'beginner', days: 3 }) });
    const first = buildTemplateProgram({ request });
    const reused = buildTemplateProgram({ request, existingPlan: first.plan });
    const variation = buildTemplateProgram({
      request: { ...request, forceNewVariation: true, previousTemplateId: first.selectedTemplateId },
      existingPlan: first.plan,
    });
    expect(reused.reusedExisting).toBe(true);
    expect(variation.reusedExisting).toBe(false);
    expect(variation.selectedTemplateId).toBe(first.selectedTemplateId);
  });

  it('proves UI answer fields reach the normalized engine request', () => {
    const request = createProgramRequestFromAnswers({
      userId: 'phase-3-user',
      answers: answers({
        goal: 'build_muscle',
        level: 'intermediate',
        days: 4,
        duration: 75,
        equipment: ['dumbbells', 'bench', 'cables'],
        style: 'upper_lower',
        focus: ['chest'],
        avoided: ['csv-bench-press-barbell'],
      }),
      forceNewVariation: true,
      previousTemplateId: 'previous-template',
    });
    expect(request.userId).toBe('phase-3-user');
    expect(request.goal).toBe('hypertrophy');
    expect(request.level).toBe('intermediate');
    expect(request.daysPerWeek).toBe(4);
    expect(request.preferredSessionMinutes).toBe(75);
    expect(request.availableEquipment).toEqual(['bench', 'cable', 'dumbbell']);
    expect(request.preferredSplit).toBe('upper_lower');
    expect(request.focusMuscles).toEqual(['chest']);
    expect(request.restrictedExerciseIds).toEqual(['csv-bench-press-barbell']);
    expect(request.limitations).toEqual([]);
    expect(request.forceNewVariation).toBe(true);
    expect(request.previousTemplateId).toBe('previous-template');
  });

  it('keeps modular filtering API aligned with templateProgramEngine', () => {
    const request = createProgramRequestFromAnswers({ answers: answers({ goal: 'general_fitness', level: 'intermediate', days: 4 }) });
    expect(filterCompatibleTemplates(request)).toEqual(matchTemplates(request));
  });
});
