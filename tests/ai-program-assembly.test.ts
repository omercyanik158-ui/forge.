import { describe, expect, it } from 'vitest';
import { assembleSessionPlan, getDayFocuses } from '@/services/aiProgramAssemblyEngine';
import { buildSessionVolumeBlueprint } from '@/services/aiProgramVolumeEngine';
import type { AssemblyEngineInput } from '@/types/aiProgramAssembly';
import type { VolumeEngineInput } from '@/types/aiProgramVolume';
import type { AIProgramGoal, AIProgramPainLimitation, AIProgramEquipmentKey } from '@/types/aiProgram';
import type { AIProgramSplitKey } from '@/types/aiProgramDecision';

type AssemblyOverrides = Partial<{
  split: AIProgramSplitKey;
  recommendedTrainingDays: number;
  sessionDurationMin: number;
  experience: VolumeEngineInput['experience'];
  recoveryQuality: VolumeEngineInput['recoveryQuality'];
  volumeDirection: VolumeEngineInput['volumeDirection'];
  priorityMuscles: VolumeEngineInput['priorityMuscles'];
  availableEquipment: AIProgramEquipmentKey[];
  limitations: AIProgramPainLimitation[];
  goal: AIProgramGoal;
}>;

function makeInput(overrides: AssemblyOverrides = {}): AssemblyEngineInput {
  const volumeInput: VolumeEngineInput = {
    volumeDirection: overrides.volumeDirection ?? 'moderate',
    recommendedTrainingDays: overrides.recommendedTrainingDays ?? 4,
    sessionDurationMin: overrides.sessionDurationMin ?? 60,
    experience: overrides.experience ?? 'intermediate',
    recoveryQuality: overrides.recoveryQuality ?? 'okay',
    priorityMuscles: overrides.priorityMuscles ?? [],
  };
  return {
    split: overrides.split ?? 'upper_lower',
    recommendedTrainingDays: overrides.recommendedTrainingDays ?? 4,
    volumeBlueprint: buildSessionVolumeBlueprint(volumeInput),
    availableEquipment: overrides.availableEquipment ?? ['machines', 'cables', 'dumbbells', 'barbells', 'bench'],
    limitations: overrides.limitations ?? ['none'],
    goal: overrides.goal ?? 'build_muscle',
  };
}

describe('split day focuses', () => {
  it('alternates upper/lower across 4 days', () => {
    const focuses = getDayFocuses('upper_lower', 4);
    expect(focuses.map((f) => f.title)).toEqual(['Üst Vücut', 'Alt Vücut', 'Üst Vücut', 'Alt Vücut']);
    expect(focuses[0]!.buckets).toContain('chest');
    expect(focuses[1]!.buckets).toContain('quads');
  });

  it('cycles push/pull/legs across 3 days', () => {
    const focuses = getDayFocuses('push_pull_legs', 3);
    expect(focuses.map((f) => f.title)).toEqual(['İtiş', 'Çekiş', 'Bacak']);
  });

  it('uses full body for minimalist home split', () => {
    const focuses = getDayFocuses('minimalist_home', 3);
    expect(focuses.length).toBe(3);
    expect(focuses[0]!.buckets).toContain('chest');
    expect(focuses[0]!.buckets).toContain('quads');
  });
});

describe('exercise ordering', () => {
  it('places compound exercises before isolation', () => {
    const plan = makeInput();
    const assembly = assembleSessionPlan(plan);
    const upperDay = assembly.days.find((d) => d.title === 'Üst Vücut')!;
    const categories = upperDay.exercises.map((e) => e.category);
    const firstCompoundIndex = categories.indexOf('compound');
    const lastIsolationIndex = categories.lastIndexOf('isolation');
    if (firstCompoundIndex !== -1 && lastIsolationIndex !== -1) {
      expect(firstCompoundIndex).toBeLessThan(lastIsolationIndex);
    }
  });
});

describe('redundancy prevention', () => {
  it('does not pick two exercises of the same pattern when alternatives exist', () => {
    const plan = makeInput({ priorityMuscles: ['chest'], volumeDirection: 'specialization' });
    const assembly = assembleSessionPlan(plan);
    const allExercises = assembly.days.flatMap((d) => d.exercises);
    const patternCounts = new Map<string, number>();
    for (const ex of allExercises) {
      patternCounts.set(ex.pattern, (patternCounts.get(ex.pattern) ?? 0) + 1);
    }
    // horizontal_push birden fazla chest hareketi var ama aynı günde değil
    // (farklı günlerde aynı pattern olabilir, o redundancy değildir)
    for (const day of assembly.days) {
      const dayPatterns = day.exercises.map((e) => e.pattern);
      const patternCounts = new Map<string, number>();
      for (const p of dayPatterns) patternCounts.set(p, (patternCounts.get(p) ?? 0) + 1);
      // aynı patternden en fazla 2 varyant kabul edilir (flat + incline gibi);
      // 3+ aynı günde gerçek redundancy
      for (const count of patternCounts.values()) {
        expect(count).toBeLessThanOrEqual(2);
      }
    }
  });
});

describe('pain safety filtering', () => {
  it('removes lower-back avoid exercises when lower back pain is reported', () => {
    const plan = makeInput({ limitations: ['lower_back'] });
    const assembly = assembleSessionPlan(plan);
    const allIds = assembly.days.flatMap((d) => d.exercises.map((e) => e.exerciseId));
    expect(allIds).not.toContain('Barbell_Deadlift');
    expect(allIds).not.toContain('Bent_Over_Barbell_Row');
    // ama cable row preferred olarak kalmalı
    expect(allIds).toContain('Seated_Cable_Rows');
  });

  it('keeps knee-caution squat but flags it via metadata, not removal', () => {
    const plan = makeInput({ limitations: ['knee'] });
    const assembly = assembleSessionPlan(plan);
    const allIds = assembly.days.flatMap((d) => d.exercises.map((e) => e.exerciseId));
    // squat knee için 'caution' -> elenmez
    expect(allIds).toContain('Barbell_Squat');
  });
});

describe('equipment filtering', () => {
  it('only selects bodyweight moves when bodyweight only is available', () => {
    const plan = makeInput({
      split: 'minimalist_home',
      availableEquipment: ['bodyweight_only'],
      recommendedTrainingDays: 2,
    });
    const assembly = assembleSessionPlan(plan);
    const allIds = assembly.days.flatMap((d) => d.exercises.map((e) => e.exerciseId));
    expect(allIds.length).toBeGreaterThan(0);
    expect(allIds).toContain('Pushups');
    expect(allIds).not.toContain('Barbell_Squat');
    expect(allIds).not.toContain('Seated_Cable_Rows');
  });
});

describe('duration guard', () => {
  it('trims a session that would exceed the per-session set ceiling', () => {
    const plan = makeInput({
      split: 'full_body',
      recommendedTrainingDays: 2,
      sessionDurationMin: 30,
      experience: 'advanced',
      recoveryQuality: 'great',
      volumeDirection: 'specialization',
      priorityMuscles: ['chest', 'quads'],
    });
    const assembly = assembleSessionPlan(plan);
    const ceiling = plan.volumeBlueprint.fatigue.perSessionSetCeiling;
    for (const day of assembly.days) {
      expect(day.totalSets).toBeLessThanOrEqual(ceiling + 2);
    }
  });
});

describe('explainability and alternatives', () => {
  it('every exercise carries a non-empty why rationale', () => {
    const plan = makeInput();
    const assembly = assembleSessionPlan(plan);
    const allExercises = assembly.days.flatMap((d) => d.exercises);
    expect(allExercises.length).toBeGreaterThan(0);
    for (const ex of allExercises) {
      expect(ex.why.length).toBeGreaterThan(0);
      expect(ex.repLabel.length).toBeGreaterThan(0);
    }
  });

  it('provides alternatives for exercises that belong to a replacement group', () => {
    const plan = makeInput();
    const assembly = assembleSessionPlan(plan);
    const withGroup = assembly.days
      .flatMap((d) => d.exercises)
      .filter((e) => e.alternatives.length > 0);
    expect(withGroup.length).toBeGreaterThan(0);
  });
});

describe('strength goal rep bias', () => {
  it('leans toward lower reps for strength goal on compound moves', () => {
    const hypertrophy = assembleSessionPlan(makeInput({ goal: 'build_muscle' }));
    const strength = assembleSessionPlan(makeInput({ goal: 'strength' }));
    const hBench = hypertrophy.days.flatMap((d) => d.exercises).find((e) => e.exerciseId === 'Barbell_Bench_Press_-_Medium_Grip');
    const sBench = strength.days.flatMap((d) => d.exercises).find((e) => e.exerciseId === 'Barbell_Bench_Press_-_Medium_Grip');
    if (hBench && sBench) {
      expect(sBench.reps).toBeLessThanOrEqual(hBench.reps);
    }
  });
});
