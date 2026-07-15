import { describe, expect, it } from 'vitest';
import {
  buildTemplateProgram,
  createProgramRequestFromAnswers,
  fingerprintPhysiqueAdaptation,
  PROGRAM_TEMPLATES,
  type ProgramRequest,
} from '@/services/templateProgramEngine';
import type { AIProgramAnswers } from '@/types/aiProgram';
import {
  createPhysiqueAdaptationProposal,
  getPhysiqueAdaptationDebugReport,
  normalizePhysiqueFocusAreas,
  validateInstantiatedProgramSemantics,
} from '@/workout-programming';

const baseAnswers: AIProgramAnswers = {
  mainGoal: 'build_muscle',
  preferredProgramStyle: 'auto',
  trainingDays: 4,
  sessionDurationMin: 60,
  location: 'gym',
  equipment: ['barbells', 'dumbbells', 'machines', 'cables', 'bench'],
  experience: 'intermediate',
  priorityMuscles: [],
  painLimitations: ['none'],
  recoveryQuality: 'okay',
  useLatestPhysiqueAnalysis: true,
};

function requestWithFocus(focus: ProgramRequest['physiqueFocus'], overrides: Partial<AIProgramAnswers> = {}): ProgramRequest {
  return createProgramRequestFromAnswers({
    answers: { ...baseAnswers, ...overrides, useLatestPhysiqueAnalysis: true },
    physiqueSummary: {
      source: 'saved_log',
      createdAt: '2026-07-15T00:00:00.000Z',
      confidenceLevel: 'high',
      focusAreas: focus.map((item) => item.muscle),
      focusMuscles: focus.map((item) => item.muscle) as AIProgramAnswers['priorityMuscles'],
      volumeBias: 'moderate',
      splitBiasHint: 'balanced',
      exerciseEmphasis: [],
      recommendedExercises: [],
    },
  });
}

describe('Phase 4 physique focus normalization', () => {
  it('normalizes Turkish and duplicate focus muscles deterministically', () => {
    const result = normalizePhysiqueFocusAreas({
      manualFocusMuscles: ['üst göğüs', 'kanat', 'üst göğüs'],
      physiqueFocus: [{ muscle: 'arka omuz', confidence: 0.8, priority: 'high' }],
    });
    expect(result.focusAreas.map((item) => item.muscle)).toEqual(['upper_chest', 'lats', 'rear_delts']);
  });

  it('drops low-confidence AI focus but keeps manual focus at full confidence', () => {
    const result = normalizePhysiqueFocusAreas({
      manualFocusMuscles: ['side_delts'],
      physiqueFocus: [{ muscle: 'upper_chest', confidence: 0.59, priority: 'high' }],
    });
    expect(result.focusAreas).toHaveLength(1);
    expect(result.focusAreas[0]).toMatchObject({ muscle: 'side_delts', confidence: 1, source: 'manual_user_choice' });
    expect(result.ignored[0]?.reason).toBe('LOW_CONFIDENCE');
  });
});

describe('Phase 4 physique adaptation runtime', () => {
  it('applies no physique adaptation when no focus exists', () => {
    const request = createProgramRequestFromAnswers({ answers: { ...baseAnswers, useLatestPhysiqueAnalysis: false } });
    const result = buildTemplateProgram({ request });
    expect(result.adaptations.filter((item) => item.focusMuscle)).toHaveLength(0);
  });

  it('confidence below 0.60 produces no adaptation', () => {
    const request = {
      ...requestWithFocus([{ muscle: 'upper_chest', confidence: 0.55, priority: 'high' }]),
      physiqueFocus: [{ muscle: 'upper_chest', confidence: 0.55, priority: 'high' as const }],
    };
    const result = buildTemplateProgram({ request });
    expect(result.adaptations.filter((item) => item.focusMuscle)).toHaveLength(0);
    expect(result.ignoredPhysiqueFocus?.some((item) => item.reason === 'LOW_CONFIDENCE')).toBe(true);
  });

  it('selects at most two focus muscles and manual focus outranks AI focus', () => {
    const request = {
      ...requestWithFocus([
        { muscle: 'upper_chest', confidence: 0.95, priority: 'high' },
        { muscle: 'lats', confidence: 0.9, priority: 'high' },
        { muscle: 'side_delts', confidence: 0.85, priority: 'high' },
      ], { priorityMuscles: ['hamstrings'] }),
      focusMuscles: ['hamstrings'],
    };
    const result = buildTemplateProgram({ request });
    const adapted = [...new Set(result.adaptations.map((item) => item.focusMuscle).filter(Boolean))];
    expect(adapted.length).toBeLessThanOrEqual(2);
    expect(adapted[0]).toBe('hamstrings');
  });

  it('upper-chest focus creates deterministic priority and bounded volume adaptation', () => {
    const request = requestWithFocus([{ muscle: 'üst göğüs', confidence: 0.92, priority: 'high' }]);
    const first = buildTemplateProgram({ request });
    const second = buildTemplateProgram({ request });
    expect(first.adaptationFingerprint).toMatch(/^forge-physique-adaptation:v1:/);
    expect(first.adaptationFingerprint).toBe(second.adaptationFingerprint);
    expect(first.adaptations).toEqual(second.adaptations);
    expect(first.adaptations.some((item) => item.type === 'priority_change' && item.focusMuscle === 'upper_chest')).toBe(true);
    const delta = first.adaptations.reduce((sum, item) => sum + (item.type === 'volume_added' ? (item.setsChanged ?? 0) : 0), 0);
    expect(delta).toBeLessThanOrEqual(4);
  });

  it('strength program preserves required main lifts and caps focus volume', () => {
    const request = requestWithFocus(
      [{ muscle: 'lats', confidence: 0.95, priority: 'high' }],
      { mainGoal: 'strength', trainingDays: 3, experience: 'beginner', sessionDurationMin: 60 },
    );
    const result = buildTemplateProgram({ request });
    const allIds = result.plan.weeks[0]!.days.flatMap((day) => day.exerciseIds);
    expect(allIds).toContain('csv-squat-barbell');
    expect(allIds).toContain('csv-bench-press-barbell');
    expect(allIds).toContain('csv-deadlift-barbell');
    const delta = result.adaptations.reduce((sum, item) => sum + (item.type === 'volume_added' ? (item.setsChanged ?? 0) : 0), 0);
    expect(delta).toBeLessThanOrEqual(2);
  });

  it('does not reintroduce restricted or limitation-conflicting exercises', () => {
    const request = {
      ...requestWithFocus([{ muscle: 'quads', confidence: 0.95, priority: 'high' }], {
        mainGoal: 'strength',
        trainingDays: 3,
        experience: 'beginner',
        painLimitations: ['knee'],
        avoidedExerciseIds: ['front_squat'],
      }),
      limitations: ['knee_pain'],
      restrictedExerciseIds: ['front_squat'],
    };
    const result = buildTemplateProgram({ request });
    const allIds = result.plan.weeks[0]!.days.flatMap((day) => day.exerciseIds);
    expect(allIds).not.toContain('csv-squat-barbell');
    expect(allIds).not.toContain('front_squat');
    expect(result.validation.valid).toBe(true);
  });

  it('final adapted program passes semantic validation and preserves structural source of truth', () => {
    const request = requestWithFocus([{ muscle: 'lats', confidence: 0.9, priority: 'high' }]);
    const result = buildTemplateProgram({ request });
    expect(result.plan.goal).toBe(request.goal);
    expect(result.plan.daysPerWeek).toBe(request.daysPerWeek);
    expect(validateInstantiatedProgramSemantics(result).errors).toEqual([]);
  });

  it('debug report and active-program proposal are structured and deterministic', () => {
    const request = requestWithFocus([{ muscle: 'side_delts', confidence: 0.9, priority: 'high' }]);
    const result = buildTemplateProgram({ request });
    const debug = getPhysiqueAdaptationDebugReport({ request });
    const proposal = createPhysiqueAdaptationProposal({ currentProgram: result.plan, request });
    expect(debug.adaptationFingerprint).toBe(result.adaptationFingerprint);
    expect(proposal.requiresConfirmation).toBe(true);
    expect(proposal.currentProgramId).toBe(result.plan.id);
  });

  it('same request repeated 100 times returns identical adaptation result', () => {
    const request = requestWithFocus([{ muscle: 'hamstrings', confidence: 0.9, priority: 'high' }]);
    const first = buildTemplateProgram({ request });
    for (let index = 0; index < 100; index += 1) {
      const next = buildTemplateProgram({ request });
      expect(next.adaptationFingerprint).toBe(first.adaptationFingerprint);
      expect(next.adaptations).toEqual(first.adaptations);
    }
  });
});

describe('Phase 4 all-template adaptation audit', () => {
  it('runs compatible focus fixtures across all active templates without invalid output', () => {
    let combinations = 0;
    let applied = 0;
    for (const template of PROGRAM_TEMPLATES.filter((item) => item.status === 'active')) {
      for (const focus of template.compatibleFocusMuscles.slice(0, 2)) {
        combinations += 1;
        const request = createProgramRequestFromAnswers({
          answers: {
            mainGoal: template.goal === 'hypertrophy' ? 'build_muscle' : template.goal === 'powerbuilding' ? 'recomposition' : template.goal,
            preferredProgramStyle: 'auto',
            trainingDays: template.daysPerWeek as AIProgramAnswers['trainingDays'],
            sessionDurationMin: template.sessionMinutes.target as AIProgramAnswers['sessionDurationMin'],
            location: template.equipmentProfile.includes('home') ? 'home' : 'gym',
            equipment: template.equipmentProfile.includes('home')
              ? ['bodyweight_only', 'bands']
              : template.equipmentProfile === 'dumbbell_only'
                ? ['dumbbells', 'bench']
                : ['barbells', 'dumbbells', 'machines', 'cables', 'bench'],
            experience: template.level,
            priorityMuscles: [],
            painLimitations: ['none'],
            recoveryQuality: 'okay',
            useLatestPhysiqueAnalysis: true,
          },
          physiqueSummary: {
            source: 'saved_log',
            createdAt: '2026-07-15T00:00:00.000Z',
            confidenceLevel: 'high',
            focusAreas: [focus],
            focusMuscles: [focus] as AIProgramAnswers['priorityMuscles'],
            volumeBias: 'moderate',
            splitBiasHint: 'balanced',
            exerciseEmphasis: [],
            recommendedExercises: [],
          },
        });
        const result = buildTemplateProgram({ request });
        if (result.adaptations.some((item) => item.focusMuscle)) applied += 1;
        expect(result.validation.valid, `${template.id}:${focus}`).toBe(true);
        expect(validateInstantiatedProgramSemantics(result).errors, `${template.id}:${focus}`).toEqual([]);
      }
    }
    expect(combinations).toBeGreaterThanOrEqual(26);
    expect(applied).toBeGreaterThan(0);
  });

  it('creates a stable explicit adaptation fingerprint helper', () => {
    const fingerprint = fingerprintPhysiqueAdaptation({
      requestFingerprint: 'forge-program-request:v1:test',
      templateId: 'template',
      templateVersion: 1,
      focusAreas: [{ muscle: 'lats', confidence: 0.9, severity: 'high', source: 'physique_analysis' }],
      equipment: ['barbell'],
      limitations: [],
    });
    expect(fingerprint).toMatch(/^forge-physique-adaptation:v1:/);
  });
});
