import { describe, expect, it } from 'vitest';
import { applyEdit, applyEdits } from '@/services/aiProgramEditor';
import { buildLineage, buildTransition, suggestNextBlock } from '@/services/aiProgramHistory';
import { buildRecommendedAIProgram } from '@/services/programRecommendationEngine';
import type { EditContext } from '@/types/aiProgramEdit';

function makePlan() {
  return buildRecommendedAIProgram({
    draftId: 'edit-test-draft-12345678',
    answers: {
      mainGoal: 'build_muscle',
      preferredProgramStyle: 'auto',
      trainingDays: 4,
      sessionDurationMin: 60,
      location: 'gym',
      equipment: ['machines', 'cables', 'dumbbells', 'barbells', 'bench'],
      experience: 'intermediate',
      priorityMuscles: ['chest'],
      painLimitations: ['none'],
      recoveryQuality: 'okay',
      useLatestPhysiqueAnalysis: false,
    },
  });
}

const editContext: EditContext = {
  availableEquipment: ['machines', 'cables', 'dumbbells', 'barbells', 'bench'],
  limitations: ['none'],
};

describe('editor replace exercise', () => {
  it('applies a valid catalog replacement', () => {
    const plan = makePlan();
    const day = plan.weeks[0]!.days[0]!;
    const result = applyEdit(plan, {
      type: 'replaceExercise',
      weekIndex: 0,
      dayIndex: 0,
      exerciseIndex: 0,
      newExerciseId: 'csv-bench-press-dumbbell',
    }, editContext);
    expect(result.applied).toBe(true);
    expect(result.plan.weeks[0]!.days[0]!.exercises[0]!.exerciseId).toBe('csv-bench-press-dumbbell');
  });

  it('rejects a replacement with a non-catalog id', () => {
    const plan = makePlan();
    const result = applyEdit(plan, {
      type: 'replaceExercise',
      weekIndex: 0,
      dayIndex: 0,
      exerciseIndex: 0,
      newExerciseId: 'Fake_Exercise',
    }, editContext);
    expect(result.applied).toBe(false);
    expect(result.warnings.some((w) => w.includes('kataloğunda yok'))).toBe(true);
  });

  it('warns but applies a pain-suboptimal replacement', () => {
    const plan = makePlan();
    const result = applyEdit(plan, {
      type: 'replaceExercise',
      weekIndex: 0,
      dayIndex: 0,
      exerciseIndex: 0,
      newExerciseId: 'csv-deadlift-barbell',
    }, { ...editContext, limitations: ['lower_back'] });
    expect(result.applied).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});

describe('editor update prescription', () => {
  it('applies valid set/rep/rir updates', () => {
    const plan = makePlan();
    const result = applyEdit(plan, {
      type: 'updatePrescription',
      weekIndex: 0,
      dayIndex: 0,
      exerciseIndex: 0,
      sets: 5,
      reps: 5,
      rir: 1,
    }, editContext);
    expect(result.applied).toBe(true);
    const ex = result.plan.weeks[0]!.days[0]!.exercises[0]!;
    expect(ex.sets).toBe(5);
    expect(ex.reps).toBe(5);
    expect(ex.rir).toBe(1);
  });

  it('rejects out-of-range sets', () => {
    const plan = makePlan();
    const result = applyEdit(plan, {
      type: 'updatePrescription',
      weekIndex: 0,
      dayIndex: 0,
      exerciseIndex: 0,
      sets: 20,
    }, editContext);
    expect(result.applied).toBe(false);
  });

  it('recomputes day aggregates after a set change', () => {
    const plan = makePlan();
    const before = plan.weeks[0]!.days[0]!.totalSets;
    const currentSets = plan.weeks[0]!.days[0]!.exercises[0]!.sets;
    const nextSets = currentSets >= 8 ? currentSets - 1 : currentSets + 1;
    const result = applyEdit(plan, {
      type: 'updatePrescription',
      weekIndex: 0,
      dayIndex: 0,
      exerciseIndex: 0,
      sets: nextSets,
    }, editContext);
    const after = result.plan.weeks[0]!.days[0]!.totalSets;
    expect(after).not.toBe(before);
  });
});

describe('editor remove and reorder', () => {
  it('removes an exercise when more than one remains', () => {
    const plan = makePlan();
    const before = plan.weeks[0]!.days[0]!.exercises.length;
    const result = applyEdit(plan, {
      type: 'removeExercise',
      weekIndex: 0,
      dayIndex: 0,
      exerciseIndex: 1,
    }, editContext);
    if (before > 1) {
      expect(result.applied).toBe(true);
      expect(result.plan.weeks[0]!.days[0]!.exercises.length).toBe(before - 1);
    }
  });

  it('refuses to remove the last exercise in a day', () => {
    const plan = makePlan();
    // tekrar tekrar silerek tek harekete indir
    let current = plan;
    while (current.weeks[0]!.days[0]!.exercises.length > 1) {
      current = applyEdit(current, {
        type: 'removeExercise',
        weekIndex: 0,
        dayIndex: 0,
        exerciseIndex: 1,
      }, editContext).plan;
    }
    const result = applyEdit(current, {
      type: 'removeExercise',
      weekIndex: 0,
      dayIndex: 0,
      exerciseIndex: 0,
    }, editContext);
    expect(result.applied).toBe(false);
  });

  it('reorders exercises within valid bounds', () => {
    const plan = makePlan();
    const result = applyEdit(plan, {
      type: 'reorderExercise',
      weekIndex: 0,
      dayIndex: 0,
      fromIndex: 0,
      toIndex: 1,
    }, editContext);
    expect(result.applied).toBe(true);
  });
});

describe('batch edits', () => {
  it('applies a sequence of edits', () => {
    const plan = makePlan();
    const result = applyEdits(plan, [
      { type: 'updatePrescription', weekIndex: 0, dayIndex: 0, exerciseIndex: 0, sets: 4 },
      { type: 'updatePrescription', weekIndex: 0, dayIndex: 0, exerciseIndex: 0, rir: 2 },
    ], editContext);
    expect(result.applied).toBe(true);
  });

  it('stops on the first failed edit', () => {
    const plan = makePlan();
    const result = applyEdits(plan, [
      { type: 'updatePrescription', weekIndex: 0, dayIndex: 0, exerciseIndex: 0, sets: 4 },
      { type: 'replaceExercise', weekIndex: 0, dayIndex: 0, exerciseIndex: 0, newExerciseId: 'Fake' },
    ], editContext);
    expect(result.applied).toBe(false);
  });
});

describe('program history and lineage', () => {
  it('suggests a step up from conservative volume', () => {
    const plan = makePlan();
    plan.sourceBlueprint.volumeDirection = 'conservative';
    const suggestion = suggestNextBlock(plan);
    expect(suggestion.suggestedVolumeDirection).toBe('moderate');
    expect(suggestion.volumeAdjustmentFactor).toBeGreaterThan(1);
  });

  it('resets after a specialization block', () => {
    const plan = makePlan();
    plan.sourceBlueprint.volumeDirection = 'specialization';
    const suggestion = suggestNextBlock(plan);
    expect(suggestion.suggestedVolumeDirection).toBe('moderate');
    expect(suggestion.volumeAdjustmentFactor).toBeLessThan(1);
  });

  it('holds steady at moderate_high', () => {
    const plan = makePlan();
    plan.sourceBlueprint.volumeDirection = 'moderate_high';
    const suggestion = suggestNextBlock(plan);
    expect(suggestion.suggestedVolumeDirection).toBe('moderate_high');
    expect(suggestion.volumeAdjustmentFactor).toBe(1);
  });

  it('builds lineage and transition between blocks', () => {
    const current = makePlan();
    const next = makePlan();
    next.id = `${current.id}-next`;
    next.parentId = current.id;
    const suggestion = suggestNextBlock(current);
    const lineage = buildLineage(next);
    const transition = buildTransition(current, next, suggestion);
    expect(lineage.parentId).toBe(current.id);
    expect(transition.fromPlanId).toBe(current.id);
    expect(transition.toPlanId).toBe(next.id);
  });
});
