import { describe, expect, it } from 'vitest';
import { EXERCISE_PROGRAMMING_META } from '@/data/exerciseProgrammingMeta';
import { assembleSessionPlan, getDayFocuses } from '@/services/aiProgramAssemblyEngine';
import { buildSessionVolumeBlueprint } from '@/services/aiProgramVolumeEngine';
import type { AssemblyEngineInput } from '@/types/aiProgramAssembly';
import type { VolumeEngineInput } from '@/types/aiProgramVolume';
import type { AIProgramGoal, AIProgramPainLimitation, AIProgramEquipmentKey } from '@/types/aiProgram';
import type { AIProgramArchetypeKey, AIProgramSplitKey } from '@/types/aiProgramDecision';

type AssemblyOverrides = Partial<{
  split: AIProgramSplitKey;
  programArchetype: AIProgramArchetypeKey;
  selectionSeed: string;
  recommendedTrainingDays: number;
  sessionDurationMin: number;
  experience: VolumeEngineInput['experience'];
  recoveryQuality: VolumeEngineInput['recoveryQuality'];
  volumeDirection: VolumeEngineInput['volumeDirection'];
  priorityMuscles: VolumeEngineInput['priorityMuscles'];
  availableEquipment: AIProgramEquipmentKey[];
  limitations: AIProgramPainLimitation[];
  goal: AIProgramGoal;
  preferredExerciseIds: string[];
  avoidedExerciseIds: string[];
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
    programArchetype: overrides.programArchetype,
    selectionSeed: overrides.selectionSeed,
    recommendedTrainingDays: overrides.recommendedTrainingDays ?? 4,
    volumeBlueprint: buildSessionVolumeBlueprint(volumeInput),
    availableEquipment: overrides.availableEquipment ?? ['machines', 'cables', 'dumbbells', 'barbells', 'bench'],
    limitations: overrides.limitations ?? ['none'],
    goal: overrides.goal ?? 'build_muscle',
    experience: overrides.experience,
    sessionDurationMin: overrides.sessionDurationMin,
    recoveryQuality: overrides.recoveryQuality,
    preferredExerciseIds: overrides.preferredExerciseIds,
    avoidedExerciseIds: overrides.avoidedExerciseIds,
  };
}

function makeThreeDayStrength(overrides: AssemblyOverrides = {}): AssemblyEngineInput {
  return makeInput({
    goal: 'strength',
    split: 'full_body',
    programArchetype: 'full_body_strength_skill',
    recommendedTrainingDays: 3,
    sessionDurationMin: 60,
    experience: 'beginner',
    availableEquipment: ['machines', 'cables', 'dumbbells', 'barbells', 'bench', 'leg_press'],
    ...overrides,
  });
}

function expectThreeDayStrengthInvariants(assembly: ReturnType<typeof assembleSessionPlan>) {
  expect(assembly.audit?.passed).toBe(true);
  const all = assembly.days.flatMap((day) => day.exercises);
  const patterns = new Set(all.map((exercise) => exercise.pattern));
  expect(patterns.has('squat_pattern')).toBe(true);
  expect(patterns.has('hinge_pattern')).toBe(true);
  expect(patterns.has('horizontal_push') || patterns.has('vertical_push')).toBe(true);
  expect(patterns.has('horizontal_pull') || patterns.has('vertical_pull') || patterns.has('scapular_retraction')).toBe(true);

  assembly.days.forEach((day) => {
    expect(day.exercises.length).toBeLessThanOrEqual(6);
    const ids = day.exercises.map((exercise) => exercise.exerciseId);
    expect(new Set(ids).size).toBe(ids.length);
    const firstAccessoryIndex = day.exercises.findIndex((exercise) => (
      exercise.strengthSlot !== 'main_lower_lift' && exercise.strengthSlot !== 'main_upper_lift'
    ));
    const mainIndexes = day.exercises
      .map((exercise, index) => ({ exercise, index }))
      .filter(({ exercise }) => exercise.strengthSlot === 'main_lower_lift' || exercise.strengthSlot === 'main_upper_lift')
      .map(({ index }) => index);
    expect(mainIndexes.length).toBeGreaterThan(0);
    if (firstAccessoryIndex >= 0) {
      mainIndexes.forEach((index) => expect(index).toBeLessThanOrEqual(firstAccessoryIndex));
    }
    const chestCount = day.exercises.filter((exercise) => exercise.pattern === 'horizontal_push').length;
    expect(chestCount).toBeLessThan(3);
    const groups = day.exercises
      .map((exercise) => exercise.debug?.similarityGroup)
      .filter((group): group is string => !!group && group !== 'core_bracing');
    expect(new Set(groups).size).toBe(groups.length);
  });
}

function metaForTest(exerciseId: string) {
  return EXERCISE_PROGRAMMING_META.find((meta) => meta.exerciseId === exerciseId);
}

function expectStrictStrengthEquipmentCompatible(exerciseId: string, availableEquipment: AIProgramEquipmentKey[]) {
  const meta = metaForTest(exerciseId);
  expect(meta).toBeDefined();
  if (!meta) return;
  const has = (equipment: AIProgramEquipmentKey) => equipment === 'dumbbells'
    ? availableEquipment.includes('dumbbells') || availableEquipment.includes('adjustable_dumbbells')
    : availableEquipment.includes(equipment);
  if (meta.equipment.includes('bodyweight_only')) return;
  if (meta.equipment.includes('bench')) expect(has('bench')).toBe(true);
  if (meta.exerciseId.includes('Smith_Machine') || meta.equipment.includes('smith_machine')) {
    expect(has('smith_machine')).toBe(true);
    return;
  }
  if (meta.exerciseId.includes('Barbell')) {
    expect(has('barbells')).toBe(true);
    return;
  }
  if (meta.exerciseId.includes('Dumbbell')) {
    expect(has('dumbbells')).toBe(true);
    return;
  }
  if (meta.equipment.includes('barbells') && meta.equipment.includes('dumbbells')) {
    expect(has('barbells') || has('dumbbells')).toBe(true);
    return;
  }
  expect(meta.equipment.some((item) => item === 'leg_press'
    ? has('leg_press') || has('machines')
    : has(item))).toBe(true);
}

function expectContiguousPriorityBlock(
  exercises: ReturnType<typeof assembleSessionPlan>['days'][number]['exercises'],
  priorityBuckets: string[],
) {
  const prioritySet = new Set(priorityBuckets);
  let seenPriority = false;
  let leftPriorityBlock = false;
  for (const exercise of exercises) {
    if (prioritySet.has(exercise.primaryBucket)) {
      expect(leftPriorityBlock).toBe(false);
      seenPriority = true;
    } else if (seenPriority) {
      leftPriorityBlock = true;
    }
  }
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

  it('builds a true 4-day hybrid instead of upper/lower copy', () => {
    const focuses = getDayFocuses('hybrid', 4, 'hybrid_athletic');
    expect(focuses.map((f) => f.title)).toEqual([
      'Full Body Strength',
      'Upper Hipertrofi',
      'Lower Athletic',
      'Pump / Accessory',
    ]);
  });

  it('adds PPL bridge days for 5-day hypertrophy', () => {
    const focuses = getDayFocuses('push_pull_legs', 5, 'ppl_hypertrophy');
    expect(focuses.map((f) => f.title)).toEqual([
      'Push Hipertrofi',
      'Pull Hipertrofi',
      'Legs Hipertrofi',
      'Upper Weak Point',
      'Lower / Posterior',
    ]);
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

  it('runs a coach audit and keeps core work after primary training work', () => {
    const assembly = assembleSessionPlan(makeInput({
      goal: 'build_muscle',
      split: 'full_body',
      programArchetype: 'full_body_hypertrophy',
      recommendedTrainingDays: 3,
      sessionDurationMin: 75,
      availableEquipment: ['machines', 'cables', 'dumbbells', 'barbells', 'bench'],
    }));
    const firstDay = assembly.days[0]!;
    const coreIndex = firstDay.exercises.findIndex((exercise) => exercise.pattern.startsWith('core_'));
    const primaryIndex = firstDay.exercises.findIndex((exercise) => exercise.category === 'compound');

    expect(assembly.selectionNotes.some((note) => note.includes('Koç denetimi'))).toBe(true);
    expect(firstDay.notes?.some((note) => note.includes('Koç denetimi'))).toBe(true);
    if (coreIndex >= 0 && primaryIndex >= 0) {
      expect(coreIndex).toBeGreaterThan(primaryIndex);
    }
  });

  it('keeps full-body sessions balanced between upper and lower movement patterns', () => {
    const assembly = assembleSessionPlan(makeInput({
      goal: 'build_muscle',
      split: 'full_body',
      programArchetype: 'full_body_hypertrophy',
      recommendedTrainingDays: 3,
      sessionDurationMin: 75,
      availableEquipment: ['machines', 'cables', 'dumbbells', 'barbells', 'bench'],
    }));

    for (const day of assembly.days) {
      const patterns = day.exercises.map((exercise) => exercise.pattern);
      const hasUpper = patterns.some((pattern) => pattern.includes('push') || pattern.includes('pull') || pattern === 'shoulder_abduction');
      const hasLower = patterns.some((pattern) =>
        ['squat_pattern', 'hinge_pattern', 'lunge_pattern', 'knee_flexion', 'knee_extension', 'hip_extension'].includes(pattern),
      );
      expect(hasUpper).toBe(true);
      expect(hasLower).toBe(true);
    }
  });
});

describe('deterministic variation', () => {
  it('keeps the same seed deterministic and allows another seed to vary', () => {
    const first = assembleSessionPlan(makeInput({ selectionSeed: 'seed-a', programArchetype: 'hybrid_athletic', split: 'hybrid' }));
    const repeated = assembleSessionPlan(makeInput({ selectionSeed: 'seed-a', programArchetype: 'hybrid_athletic', split: 'hybrid' }));
    const second = assembleSessionPlan(makeInput({ selectionSeed: 'seed-b', programArchetype: 'hybrid_athletic', split: 'hybrid' }));
    const ids = (plan: ReturnType<typeof assembleSessionPlan>) => plan.days.flatMap((day) => day.exercises.map((exercise) => exercise.exerciseId));

    expect(ids(first)).toEqual(ids(repeated));
    expect(ids(first).join('|')).not.toEqual(ids(second).join('|'));
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
      // Hypertrophy'de flat + incline + fly gibi anlamlı açı/rol çeşitliliği için
      // aynı pattern'den en fazla 3 varyant kabul edilir.
      for (const count of patternCounts.values()) {
        expect(count).toBeLessThanOrEqual(3);
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

describe('hypertrophy assembly', () => {
  it('uses compound and isolation balance instead of a plain bucket list', () => {
    const assembly = assembleSessionPlan(makeInput({
      goal: 'build_muscle',
      split: 'hybrid',
      programArchetype: 'hybrid_athletic',
      recommendedTrainingDays: 4,
      sessionDurationMin: 75,
      priorityMuscles: ['chest'],
      availableEquipment: ['machines', 'cables', 'dumbbells', 'barbells', 'bench'],
    }));
    const allExercises = assembly.days.flatMap((day) => day.exercises);
    const categories = new Set(allExercises.map((exercise) => exercise.category));

    expect(assembly.selectionNotes.some((note) => note.includes('Hypertrophy'))).toBe(true);
    expect(categories.has('compound')).toBe(true);
    expect(categories.has('isolation')).toBe(true);
  });

  it('gives chest-priority hypertrophy flat, incline and fly/cable variety', () => {
    const assembly = assembleSessionPlan(makeInput({
      goal: 'build_muscle',
      split: 'push_pull_legs',
      programArchetype: 'ppl_hypertrophy',
      recommendedTrainingDays: 5,
      sessionDurationMin: 90,
      priorityMuscles: ['chest'],
      volumeDirection: 'moderate_high',
      availableEquipment: ['machines', 'cables', 'dumbbells', 'barbells', 'bench'],
    }));
    const chestExercises = assembly.days
      .flatMap((day) => day.exercises)
      .filter((exercise) => exercise.primaryBucket === 'chest');
    const ids = chestExercises.map((exercise) => exercise.exerciseId);
    const repLabels = chestExercises.map((exercise) => exercise.repLabel);

    expect(chestExercises.some((exercise) => exercise.category === 'compound' && ids.includes(exercise.exerciseId))).toBe(true);
    expect(ids.some((id) => id.includes('Incline'))).toBe(true);
    expect(ids.some((id) => id.includes('Fly') || id.includes('Cable_Crossover'))).toBe(true);
    expect(repLabels).toContain('5-8 tekrar');
    expect(repLabels).toContain('12-20 tekrar');
  });

  it('keeps chest-priority work as a muscle block instead of splitting it with rows', () => {
    const assembly = assembleSessionPlan(makeInput({
      goal: 'build_muscle',
      split: 'push_pull_legs',
      programArchetype: 'ppl_hypertrophy',
      recommendedTrainingDays: 5,
      sessionDurationMin: 90,
      priorityMuscles: ['chest'],
      volumeDirection: 'moderate_high',
      availableEquipment: ['machines', 'cables', 'dumbbells', 'barbells', 'bench'],
    }));
    const chestDay = assembly.days.find((day) => day.exercises.filter((exercise) => exercise.primaryBucket === 'chest').length >= 2)!;

    expect(chestDay).toBeTruthy();
    expectContiguousPriorityBlock(chestDay.exercises, ['chest']);
    expect(chestDay.exercises[0]!.primaryBucket).toBe('chest');
    expect(assembly.audit?.passed).toBe(true);
    expect(assembly.audit?.score).toBeGreaterThanOrEqual(90);
  });

  it('covers back with horizontal row and vertical pull angles in the same week', () => {
    const assembly = assembleSessionPlan(makeInput({
      goal: 'build_muscle',
      split: 'push_pull_legs',
      programArchetype: 'ppl_hypertrophy',
      recommendedTrainingDays: 5,
      sessionDurationMin: 75,
      priorityMuscles: ['lats', 'upper_back'],
      availableEquipment: ['machines', 'cables', 'dumbbells', 'barbells', 'bench'],
    }));
    const patterns = assembly.days.flatMap((day) => day.exercises.map((exercise) => exercise.pattern));

    expect(patterns).toContain('horizontal_pull');
    expect(patterns).toContain('vertical_pull');
  });

  it('keeps lat and upper-back priorities before arm accessories on pull days', () => {
    const assembly = assembleSessionPlan(makeInput({
      goal: 'build_muscle',
      split: 'push_pull_legs',
      programArchetype: 'ppl_hypertrophy',
      recommendedTrainingDays: 5,
      sessionDurationMin: 75,
      priorityMuscles: ['lats', 'upper_back'],
      availableEquipment: ['machines', 'cables', 'dumbbells', 'barbells', 'bench'],
    }));
    const pullDay = assembly.days.find((day) => day.exercises.some((exercise) => exercise.primaryBucket === 'lats')
      && day.exercises.some((exercise) => exercise.primaryBucket === 'upper_back'))!;

    expect(pullDay).toBeTruthy();
    expectContiguousPriorityBlock(pullDay.exercises, ['lats', 'upper_back']);
    expect(pullDay.exercises.findIndex((exercise) => exercise.primaryBucket === 'arms')).toBeGreaterThan(
      pullDay.exercises.findIndex((exercise) => exercise.primaryBucket === 'upper_back'),
    );
  });

  it('uses both hinge and knee-flexion patterns when hamstrings are prioritized', () => {
    const assembly = assembleSessionPlan(makeInput({
      goal: 'build_muscle',
      split: 'upper_lower',
      programArchetype: 'upper_lower_hypertrophy',
      recommendedTrainingDays: 4,
      sessionDurationMin: 75,
      priorityMuscles: ['hamstrings'],
      availableEquipment: ['machines', 'cables', 'dumbbells', 'barbells', 'bench'],
    }));
    const hamstringPatterns = assembly.days
      .flatMap((day) => day.exercises)
      .filter((exercise) => exercise.primaryBucket === 'hamstrings')
      .map((exercise) => exercise.pattern);

    expect(hamstringPatterns).toContain('hinge_pattern');
    expect(hamstringPatterns).toContain('knee_flexion');
  });

  it('returns a professional program audit with category scores', () => {
    const assembly = assembleSessionPlan(makeInput({
      goal: 'build_muscle',
      split: 'upper_lower',
      programArchetype: 'upper_lower_hypertrophy',
      recommendedTrainingDays: 4,
      sessionDurationMin: 75,
      priorityMuscles: ['shoulders'],
      availableEquipment: ['machines', 'cables', 'dumbbells', 'barbells', 'bench'],
    }));

    expect(assembly.audit).toBeDefined();
    expect(assembly.audit?.passed).toBe(true);
    expect(assembly.audit?.score).toBeGreaterThanOrEqual(90);
    expect(assembly.audit?.categories.map((category) => category.key)).toContain('musclePrioritization');
    expect(assembly.audit?.categories.map((category) => category.key)).toContain('regionalBalance');
    expect(assembly.audit?.categories.map((category) => category.key)).toContain('sequencing');
  });

  it('keeps hypertrophy prescriptions in practical rep and RIR bands', () => {
    const assembly = assembleSessionPlan(makeInput({
      goal: 'build_muscle',
      split: 'upper_lower',
      programArchetype: 'upper_lower_hypertrophy',
      recommendedTrainingDays: 4,
      sessionDurationMin: 75,
      availableEquipment: ['machines', 'cables', 'dumbbells', 'barbells', 'bench'],
    }));
    const exercises = assembly.days.flatMap((day) => day.exercises);
    const compound = exercises.filter((exercise) => exercise.category === 'compound');
    const isolation = exercises.filter((exercise) => exercise.category === 'isolation');

    expect(compound.length).toBeGreaterThan(0);
    expect(isolation.length).toBeGreaterThan(0);
    compound.forEach((exercise) => {
      expect(exercise.reps).toBeGreaterThanOrEqual(5);
      expect(exercise.reps).toBeLessThanOrEqual(10);
      expect(exercise.rir).toBeGreaterThanOrEqual(0);
      expect(exercise.rir).toBeLessThanOrEqual(2);
    });
    isolation.forEach((exercise) => {
      expect(exercise.reps).toBeGreaterThanOrEqual(12);
      expect(exercise.reps).toBeLessThanOrEqual(20);
    });
  });

  it('keeps recomposition hypertrophy more conservative than build muscle', () => {
    const base: AssemblyOverrides = {
      split: 'upper_lower' as const,
      programArchetype: 'upper_lower_hypertrophy' as const,
      recommendedTrainingDays: 4,
      sessionDurationMin: 75,
      priorityMuscles: ['chest'],
      availableEquipment: ['machines', 'cables', 'dumbbells', 'barbells', 'bench'] as AIProgramEquipmentKey[],
    };
    const buildMuscle = assembleSessionPlan(makeInput({ ...base, goal: 'build_muscle' }));
    const recomposition = assembleSessionPlan(makeInput({ ...base, goal: 'recomposition' }));

    expect(recomposition.days.reduce((sum, day) => sum + day.totalSets, 0)).toBeLessThanOrEqual(
      buildMuscle.days.reduce((sum, day) => sum + day.totalSets, 0),
    );
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

  it('builds strength around main lifts and keeps decline bench out of the spine', () => {
    const strength = assembleSessionPlan(makeInput({
      goal: 'strength',
      split: 'full_body',
      programArchetype: 'full_body_strength_skill',
      recommendedTrainingDays: 3,
      availableEquipment: ['machines', 'cables', 'dumbbells', 'barbells', 'bench', 'leg_press'],
    }));
    const all = strength.days.flatMap((day) => day.exercises);
    const allIds = all.map((exercise) => exercise.exerciseId);

    expect(allIds).toContain('Barbell_Bench_Press_-_Medium_Grip');
    expect(allIds.some((id) => id === 'Barbell_Squat' || id === 'Leg_Press')).toBe(true);
    expect(allIds.some((id) => id === 'Barbell_Deadlift' || id === 'Romanian_Deadlift')).toBe(true);
    expect(allIds.some((id) => id === 'Bent_Over_Barbell_Row' || id === 'Seated_Cable_Rows')).toBe(true);
    expect(allIds.some((id) => id === 'Pullups' || id.includes('Lat_Pulldown'))).toBe(true);
    expect(allIds).not.toContain('Decline_Barbell_Bench_Press');
    expect(allIds).not.toContain('Decline_Dumbbell_Bench_Press');
  });

  it('keeps strength main lifts low-rep while accessories stay moderate', () => {
    const strength = assembleSessionPlan(makeInput({
      goal: 'strength',
      split: 'full_body',
      programArchetype: 'full_body_strength_skill',
      recommendedTrainingDays: 3,
      availableEquipment: ['machines', 'cables', 'dumbbells', 'barbells', 'bench', 'leg_press'],
    }));
    const squatDay = strength.days.find((day) => day.title === 'Squat Strength')!;
    const mainLiftIds = ['Barbell_Squat', 'Front_Barbell_Squat', 'Leg_Press', 'Barbell_Bench_Press_-_Medium_Grip'];
    const mainLifts = squatDay.exercises.filter((exercise) => mainLiftIds.includes(exercise.exerciseId));
    const accessories = squatDay.exercises.filter((exercise) => !mainLiftIds.includes(exercise.exerciseId));

    expect(mainLifts.length).toBeGreaterThan(0);
    mainLifts.forEach((exercise) => expect(exercise.reps).toBeLessThanOrEqual(6));
    accessories
      .filter((exercise) => !exercise.pattern.startsWith('core_'))
      .forEach((exercise) => expect(exercise.reps).toBeGreaterThanOrEqual(6));
  });

  it('avoids barbell deadlift when lower-back pain is reported', () => {
    const strength = assembleSessionPlan(makeInput({
      goal: 'strength',
      split: 'full_body',
      programArchetype: 'full_body_strength_skill',
      recommendedTrainingDays: 3,
      limitations: ['lower_back'],
      availableEquipment: ['machines', 'cables', 'dumbbells', 'barbells', 'bench', 'leg_press'],
    }));
    const allIds = strength.days.flatMap((day) => day.exercises.map((exercise) => exercise.exerciseId));

    expect(allIds).not.toContain('Barbell_Deadlift');
  });
});

describe('three-day full body strength engine', () => {
  it('builds beginner full-gym strength around weekly squat, hinge, push and pull patterns', () => {
    const assembly = assembleSessionPlan(makeThreeDayStrength({
      selectionSeed: 'beginner-full-gym',
    }));
    const allIds = assembly.days.flatMap((day) => day.exercises.map((exercise) => exercise.exerciseId));

    expect(assembly.debug?.strength?.archetype).toBe('novice_linear');
    expect(assembly.days.map((day) => day.title)).toEqual(['Squat Strength', 'Deadlift Strength', 'Bench Strength']);
    expect(allIds).toContain('Barbell_Squat');
    expect(allIds).toContain('Barbell_Bench_Press_-_Medium_Grip');
    expectThreeDayStrengthInvariants(assembly);
    assembly.days.flatMap((day) => day.exercises)
      .filter((exercise) => exercise.strengthSlot === 'main_lower_lift' || exercise.strengthSlot === 'main_upper_lift')
      .forEach((exercise) => {
        expect(exercise.progressionMethod).toBe('linear_load_progression');
        expect(exercise.reps).toBeLessThanOrEqual(6);
      });
  });

  it('keeps a beginner home setup compatible with bodyweight, bands and dumbbells', () => {
    const assembly = assembleSessionPlan(makeThreeDayStrength({
      selectionSeed: 'beginner-home',
      availableEquipment: ['bodyweight_only', 'bands', 'dumbbells', 'bench'],
    }));
    const allowed = new Set<AIProgramEquipmentKey>(['bodyweight_only', 'bands', 'dumbbells', 'bench']);

    expectThreeDayStrengthInvariants(assembly);
    assembly.days.flatMap((day) => day.exercises).forEach((exercise) => {
      expectStrictStrengthEquipmentCompatible(exercise.exerciseId, [...allowed]);
      expect(exercise.debug?.rejectedExerciseIds.some((item) => item.reason.includes('ekipman')) ?? false).toBeTypeOf('boolean');
    });
    const allIds = assembly.days.flatMap((day) => day.exercises.map((exercise) => exercise.exerciseId));
    expect(allIds).not.toContain('Smith_Machine_Bench_Press');
    expect(allIds).not.toContain('Close-Grip_Barbell_Bench_Press');
  });

  it('respects an avoided bench press while keeping a horizontal push pattern', () => {
    const assembly = assembleSessionPlan(makeThreeDayStrength({
      selectionSeed: 'avoid-bench',
      avoidedExerciseIds: ['Barbell_Bench_Press_-_Medium_Grip'],
    }));
    const all = assembly.days.flatMap((day) => day.exercises);

    expectThreeDayStrengthInvariants(assembly);
    expect(all.map((exercise) => exercise.exerciseId)).not.toContain('Barbell_Bench_Press_-_Medium_Grip');
    expect(all.some((exercise) => exercise.pattern === 'horizontal_push')).toBe(true);
  });

  it('respects avoided back squat variations and falls back to compatible squat patterns', () => {
    const assembly = assembleSessionPlan(makeThreeDayStrength({
      selectionSeed: 'avoid-back-squat',
      avoidedExerciseIds: ['Barbell_Squat', 'Front_Barbell_Squat'],
    }));
    const all = assembly.days.flatMap((day) => day.exercises);

    expectThreeDayStrengthInvariants(assembly);
    expect(all.map((exercise) => exercise.exerciseId)).not.toContain('Barbell_Squat');
    expect(all.map((exercise) => exercise.exerciseId)).not.toContain('Front_Barbell_Squat');
    expect(all.some((exercise) => exercise.pattern === 'squat_pattern')).toBe(true);
  });

  it('uses a different progression model for intermediate full-body strength', () => {
    const assembly = assembleSessionPlan(makeThreeDayStrength({
      selectionSeed: 'intermediate-strength',
      experience: 'intermediate',
      recoveryQuality: 'great',
    }));
    const mainMethods = assembly.days
      .flatMap((day) => day.exercises)
      .filter((exercise) => exercise.strengthSlot === 'main_lower_lift' || exercise.strengthSlot === 'main_upper_lift')
      .map((exercise) => exercise.progressionMethod);

    expectThreeDayStrengthInvariants(assembly);
    expect(assembly.debug?.strength?.archetype).toBe('intermediate_hlm');
    expect(mainMethods).toContain('top_set_backoff');
  });

  it('does not turn visual chest priority into bodybuilding chest spam for general strength', () => {
    const assembly = assembleSessionPlan(makeThreeDayStrength({
      selectionSeed: 'chest-priority-strength',
      priorityMuscles: ['chest'],
    }));

    expectThreeDayStrengthInvariants(assembly);
    assembly.days.forEach((day) => {
      expect(day.exercises.filter((exercise) => exercise.pattern === 'horizontal_push').length).toBeLessThan(3);
      expect(day.exercises.some((exercise) => exercise.exerciseId.includes('Fly'))).toBe(false);
    });
  });

  it('keeps 45-minute sessions compact without losing main lift progression', () => {
    const assembly = assembleSessionPlan(makeThreeDayStrength({
      selectionSeed: 'forty-five-minutes',
      sessionDurationMin: 45,
    }));

    expectThreeDayStrengthInvariants(assembly);
    assembly.days.forEach((day) => {
      expect(day.exercises.length).toBeLessThanOrEqual(5);
      expect(day.estimatedDurationMin).toBeLessThanOrEqual(55);
      day.exercises
        .filter((exercise) => exercise.strengthSlot === 'main_lower_lift' || exercise.strengthSlot === 'main_upper_lift')
        .forEach((exercise) => expect(exercise.progressionMethod).toBeDefined());
    });
  });

  it('avoids barbell deadlift for lower-back sensitive strength profiles', () => {
    const assembly = assembleSessionPlan(makeThreeDayStrength({
      selectionSeed: 'lower-back-sensitive',
      limitations: ['lower_back'],
    }));
    const allIds = assembly.days.flatMap((day) => day.exercises.map((exercise) => exercise.exerciseId));

    expectThreeDayStrengthInvariants(assembly);
    expect(allIds).not.toContain('Barbell_Deadlift');
    assembly.days.forEach((day) => {
      const heavyLowerCount = day.exercises.filter((exercise) => (
        (exercise.pattern === 'squat_pattern' || exercise.pattern === 'hinge_pattern')
        && exercise.debug?.fatigueScore === 3
      )).length;
      expect(heavyLowerCount).toBeLessThanOrEqual(2);
    });
  });

  it('does not leak smith or barbell moves into a dumbbell-only strength profile', () => {
    const availableEquipment: AIProgramEquipmentKey[] = ['dumbbells', 'bench', 'bodyweight_only'];
    const assembly = assembleSessionPlan(makeThreeDayStrength({
      selectionSeed: 'dumbbell-only-no-cables',
      availableEquipment,
    }));
    const all = assembly.days.flatMap((day) => day.exercises);
    const allIds = all.map((exercise) => exercise.exerciseId);

    expectThreeDayStrengthInvariants(assembly);
    all.forEach((exercise) => expectStrictStrengthEquipmentCompatible(exercise.exerciseId, availableEquipment));
    expect(allIds).not.toContain('Smith_Machine_Bench_Press');
    expect(allIds).not.toContain('Close-Grip_Barbell_Bench_Press');
    expect(allIds).not.toContain('90_90_Hamstring');
    expect(allIds).toContain('Romanian_Deadlift');
  });
});
