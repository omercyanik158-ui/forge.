import { describe, expect, it } from 'vitest';
import { buildProgressionPlan } from '@/services/aiProgramProgressionEngine';
import type { AssembledDay } from '@/types/aiProgramAssembly';
import type { ProgressionEngineInput } from '@/types/aiProgramProgression';

function mockBaseDays(): AssembledDay[] {
  return [
    {
      dayIndex: 0,
      title: 'Upper',
      exercises: [
        { exerciseId: 'Barbell_Bench_Press_-_Medium_Grip', sets: 4, reps: 8, repLabel: '6-10 tekrar', restSeconds: 120, rir: 3, alternatives: [], why: 'compound', category: 'compound', pattern: 'horizontal_push', primaryBucket: 'chest' },
        { exerciseId: 'Seated_Cable_Rows', sets: 3, reps: 10, repLabel: '8-12 tekrar', restSeconds: 90, rir: 2, alternatives: [], why: 'compound', category: 'compound', pattern: 'horizontal_pull', primaryBucket: 'upper_back' },
      ],
      totalSets: 7,
      estimatedDurationMin: 21,
      bucketsCovered: ['chest', 'upper_back'],
    },
  ];
}

function makeInput(overrides: Partial<ProgressionEngineInput> = {}): ProgressionEngineInput {
  return {
    baseDays: mockBaseDays(),
    effort: { rirMin: 1, rirMax: 3, rationale: 'test' },
    experience: 'intermediate',
    goal: 'build_muscle',
    ...overrides,
  };
}

describe('week count by experience and goal', () => {
  it('builds a 4-week block for beginners', () => {
    const plan = buildProgressionPlan(makeInput({ experience: 'beginner' }));
    expect(plan.weekCount).toBe(4);
  });

  it('builds a 5-week block for intermediate hypertrophy', () => {
    const plan = buildProgressionPlan(makeInput({ experience: 'intermediate', goal: 'build_muscle' }));
    expect(plan.weekCount).toBe(5);
  });

  it('builds a 6-week block for intermediate strength', () => {
    const plan = buildProgressionPlan(makeInput({ experience: 'intermediate', goal: 'strength' }));
    expect(plan.weekCount).toBe(6);
  });

  it('builds a 6-week block for advanced lifters', () => {
    const plan = buildProgressionPlan(makeInput({ experience: 'advanced' }));
    expect(plan.weekCount).toBe(6);
  });
});

describe('deload cadence', () => {
  it('adds a final deload in a 5-week block', () => {
    const plan = buildProgressionPlan(makeInput({ experience: 'intermediate', goal: 'build_muscle' }));
    expect(plan.deloadWeeks).toContain(4);
  });

  it('adds a mid and final deload in a 6-week block', () => {
    const plan = buildProgressionPlan(makeInput({ experience: 'advanced', goal: 'strength' }));
    expect(plan.deloadWeeks).toContain(3);
    expect(plan.deloadWeeks).toContain(5);
  });

  it('does not deload a short 4-week beginner block', () => {
    const plan = buildProgressionPlan(makeInput({ experience: 'beginner' }));
    expect(plan.deloadWeeks).toEqual([]);
  });
});

describe('rir progression', () => {
  it('keeps week 1 at baseline rir then lowers it across the block', () => {
    const plan = buildProgressionPlan(makeInput({ experience: 'intermediate', goal: 'build_muscle' }));
    const week1Bench = plan.weeks[0]!.days[0]!.exercises[0]!;
    const peakBench = plan.weeks[2]!.days[0]!.exercises[0]!;
    expect(peakBench.rir).toBeLessThanOrEqual(week1Bench.rir);
  });

  it('raises rir in the deload week', () => {
    const plan = buildProgressionPlan(makeInput({ experience: 'intermediate', goal: 'build_muscle' }));
    const lastWeek = plan.weeks[plan.weekCount - 1]!;
    expect(lastWeek.isDeload).toBe(true);
    const deloadBench = lastWeek.days[0]!.exercises[0]!;
    expect(deloadBench.rir).toBeGreaterThanOrEqual(3);
  });

  it('never lets rir fall below the effort ceiling minimum', () => {
    const plan = buildProgressionPlan(makeInput({ effort: { rirMin: 1, rirMax: 3, rationale: 'x' }, experience: 'advanced', goal: 'strength' }));
    for (const week of plan.weeks) {
      for (const day of week.days) {
        for (const ex of day.exercises) {
          expect(ex.rir).toBeGreaterThanOrEqual(1);
        }
      }
    }
  });
});

describe('volume progression', () => {
  it('reduces volume in the deload week', () => {
    const plan = buildProgressionPlan(makeInput({ experience: 'intermediate', goal: 'build_muscle' }));
    const lastWeek = plan.weeks[plan.weekCount - 1]!;
    const peakWeek = plan.weeks[plan.fatigueModel.peakWeek]!;
    expect(lastWeek.totalWeeklySets).toBeLessThan(peakWeek.totalWeeklySets);
  });

  it('keeps at least 2 sets per exercise even under deload', () => {
    const plan = buildProgressionPlan(makeInput({ experience: 'intermediate', goal: 'build_muscle' }));
    const deloadWeek = plan.weeks[plan.weekCount - 1]!;
    for (const day of deloadWeek.days) {
      for (const ex of day.exercises) {
        expect(ex.sets).toBeGreaterThanOrEqual(2);
      }
    }
  });
});

describe('fatigue model', () => {
  it('tracks weekly volume trend and peak week', () => {
    const plan = buildProgressionPlan(makeInput({ experience: 'intermediate', goal: 'build_muscle' }));
    expect(plan.fatigueModel.weeklyVolumeTrend.length).toBe(plan.weekCount);
    expect(plan.fatigueModel.peakWeek).toBeGreaterThanOrEqual(0);
    expect(plan.fatigueModel.assumptions.length).toBeGreaterThan(0);
  });

  it('marks deload weeks in the trend', () => {
    const plan = buildProgressionPlan(makeInput({ experience: 'advanced', goal: 'strength' }));
    const deloadEntries = plan.fatigueModel.weeklyVolumeTrend.filter((w) => w.isDeload);
    expect(deloadEntries.length).toBe(plan.deloadWeeks.length);
  });
});

describe('plan integrity', () => {
  it('preserves the day count of the base plan across every week', () => {
    const plan = buildProgressionPlan(makeInput({ experience: 'intermediate', goal: 'build_muscle' }));
    for (const week of plan.weeks) {
      expect(week.days.length).toBe(1);
    }
  });

  it('titles each week distinctly', () => {
    const plan = buildProgressionPlan(makeInput({ experience: 'advanced', goal: 'strength' }));
    const titles = plan.weeks.map((w) => w.title);
    expect(new Set(titles).size).toBeGreaterThan(1);
  });
});
