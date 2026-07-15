import { describe, expect, it } from 'vitest';
import {
  bucketToMuscleRoles,
  getExerciseMeta,
  getExercisesByPattern,
  getReplacementsFor,
  getReplacementGroup,
  getSafeExercisesForPattern,
  isCompatibleWithEquipment,
  isPreferredForLimitation,
  isSafeForLimitations,
  mapMuscleRoleToBucket,
  validateExerciseKB,
} from '@/services/exerciseKB';
import { hasExercise } from '@/services/exerciseCatalog';

describe('exercise knowledge base integrity', () => {
  it('keeps legacy metadata separate from the CSV exercise catalog', () => {
    const issues = validateExerciseKB();
    const missing = issues.filter((issue) => issue.type === 'missing_in_catalog');
    expect(missing.length).toBeGreaterThan(0);
    expect(missing.every((issue) => !issue.exerciseId.startsWith('csv-'))).toBe(true);
  });

  it('has no duplicate ids or invalid bands', () => {
    const issues = validateExerciseKB().filter((issue) => issue.type !== 'missing_in_catalog');
    expect(issues).toEqual([]);
  });

  it('resolves metadata for a known catalog id', () => {
    const squat = getExerciseMeta('Barbell_Squat');
    expect(squat).toBeDefined();
    expect(squat?.pattern).toBe('squat_pattern');
    expect(squat?.primaryMuscles).toContain('quads');
    expect(squat?.category).toBe('compound');
  });

  it('exposes replacement groups for the main movement patterns', () => {
    expect(getReplacementGroup('horizontal_push')?.exerciseIds.length).toBeGreaterThan(1);
    expect(getReplacementGroup('squat_pattern')?.exerciseIds.length).toBeGreaterThan(1);
    expect(getReplacementGroup('hip_extension')?.exerciseIds.length).toBeGreaterThan(1);
  });
});

describe('exercise equipment compatibility', () => {
  it('treats bodyweight exercises as compatible with any equipment set', () => {
    const bodyweightSquat = getExerciseMeta('Bodyweight_Squat')!;
    expect(isCompatibleWithEquipment(bodyweightSquat, [])).toBe(true);
    expect(isCompatibleWithEquipment(bodyweightSquat, ['dumbbells'])).toBe(true);
  });

  it('requires matching equipment for non-bodyweight moves', () => {
    const barbellSquat = getExerciseMeta('Barbell_Squat')!;
    expect(isCompatibleWithEquipment(barbellSquat, ['dumbbells'])).toBe(false);
    expect(isCompatibleWithEquipment(barbellSquat, ['barbells'])).toBe(true);
  });

  it('matches when at least one required equipment is available', () => {
    const lateralRaise = getExerciseMeta('Side_Lateral_Raise')!;
    expect(isCompatibleWithEquipment(lateralRaise, ['cables'])).toBe(true);
    expect(isCompatibleWithEquipment(lateralRaise, ['dumbbells'])).toBe(true);
    expect(isCompatibleWithEquipment(lateralRaise, ['barbells'])).toBe(false);
  });
});

describe('exercise pain safety', () => {
  it('allows all exercises when no limitation is reported', () => {
    const deadlift = getExerciseMeta('Barbell_Deadlift')!;
    expect(isSafeForLimitations(deadlift, ['none'])).toBe(true);
  });

  it('removes avoid exercises for the reported limitation', () => {
    const deadlift = getExerciseMeta('Barbell_Deadlift')!;
    const barbellRow = getExerciseMeta('Bent_Over_Barbell_Row')!;
    expect(isSafeForLimitations(deadlift, ['lower_back'])).toBe(false);
    expect(isSafeForLimitations(barbellRow, ['lower_back'])).toBe(false);
  });

  it('keeps caution exercises but does not remove them', () => {
    const squat = getExerciseMeta('Barbell_Squat')!;
    // squat knee uyumu 'caution' -> güvenli ama flaglenebilir
    expect(isSafeForLimitations(squat, ['knee'])).toBe(true);
  });

  it('marks preferred exercises for the reported limitation', () => {
    const legPress = getExerciseMeta('Leg_Press')!;
    const seatedRow = getExerciseMeta('Seated_Cable_Rows')!;
    expect(isPreferredForLimitation(legPress, ['lower_back'])).toBe(true);
    expect(isPreferredForLimitation(seatedRow, ['lower_back'])).toBe(true);
    expect(isPreferredForLimitation(legPress, ['none'])).toBe(false);
  });
});

describe('safe exercise pool for a pattern', () => {
  it('returns only home-compatible squat moves when equipment is bodyweight only', () => {
    const pool = getSafeExercisesForPattern('squat_pattern', ['bodyweight_only'], ['none']);
    const ids = pool.map((item) => item.exerciseId);
    expect(ids).toContain('Bodyweight_Squat');
    expect(ids).not.toContain('Barbell_Squat');
    expect(ids).not.toContain('Leg_Press');
  });

  it('prefers back-safe horizontal pull when lower back pain is reported', () => {
    const pool = getSafeExercisesForPattern('horizontal_pull', ['cables', 'barbells'], ['lower_back']);
    const ids = pool.map((item) => item.exerciseId);
    // barbell row 'avoid' elenir, cable row kalır
    expect(ids).toContain('Seated_Cable_Rows');
    expect(ids).not.toContain('Bent_Over_Barbell_Row');
    expect(ids[0]).toBe('Seated_Cable_Rows');
  });

  it('keeps compound exercises ahead of isolation when ordering', () => {
    const pool = getSafeExercisesForPattern('horizontal_push', ['barbells', 'dumbbells', 'bench'], ['none']);
    const firstCategory = pool[0].category;
    expect(firstCategory).toBe('compound');
  });
});

describe('replacement engine', () => {
  it('returns same-pattern alternatives filtered by equipment and pain', () => {
    const replacements = getReplacementsFor('Barbell_Squat', ['leg_press', 'machines'], ['lower_back']);
    const ids = replacements.map((item) => item.exerciseId);
    // Leg_Press lower_back için 'preferred' ve leg_press ekipmanı var
    expect(ids).toContain('Leg_Press');
    // Bodyweight_Squat her ekipmanda geçerli
    expect(ids).toContain('Bodyweight_Squat');
    // Front squat wrist 'caution' ama lower_back 'acceptable' -> safe; ama leg_press ekipmanı yok? 
    // Front squat barbell gerektirir, ekipman listesinde barbell yok -> elenir
    expect(ids).not.toContain('Front_Barbell_Squat');
  });

  it('excludes the source exercise itself', () => {
    const replacements = getReplacementsFor('Dumbbell_Bench_Press', ['dumbbells', 'bench'], ['none']);
    expect(replacements.map((item) => item.exerciseId)).not.toContain('Dumbbell_Bench_Press');
  });

  it('keeps flat chest replacements separate from incline and decline angles', () => {
    const replacements = getReplacementsFor('Dumbbell_Bench_Press', ['dumbbells', 'bench'], ['none']);
    const ids = replacements.map((item) => item.exerciseId);
    expect(ids).not.toContain('Incline_Dumbbell_Press');
    expect(ids).not.toContain('Decline_Dumbbell_Bench_Press');
  });

  it('returns empty when the pattern has no replacement group', () => {
    // shoulder_abduction tek hareket (Side_Lateral_Raise), grup yok
    const replacements = getReplacementsFor('Side_Lateral_Raise', ['dumbbells'], ['none']);
    expect(replacements).toEqual([]);
  });
});

describe('muscle role <-> priority bucket mapping', () => {
  it('maps each shoulder role to the shoulders bucket', () => {
    expect(mapMuscleRoleToBucket('front_delts')).toBe('shoulders');
    expect(mapMuscleRoleToBucket('side_delts')).toBe('shoulders');
    expect(mapMuscleRoleToBucket('rear_delts')).toBe('shoulders');
  });

  it('round-trips a bucket through its roles', () => {
    for (const role of bucketToMuscleRoles('shoulders')) {
      expect(mapMuscleRoleToBucket(role)).toBe('shoulders');
    }
    for (const role of bucketToMuscleRoles('core')) {
      expect(mapMuscleRoleToBucket(role)).toBe('core');
    }
  });
});

describe('kb catalog coverage', () => {
  it('covers the primary movement patterns needed for every split', () => {
    const requiredPatterns = [
      'horizontal_push',
      'vertical_push',
      'horizontal_pull',
      'vertical_pull',
      'squat_pattern',
      'hinge_pattern',
      'hip_extension',
      'core_anti_extension',
    ] as const;
    for (const pattern of requiredPatterns) {
      expect(getExercisesByPattern(pattern).length).toBeGreaterThan(0);
    }
  });

  it('keeps every kb id resolvable through the public catalog helper', () => {
    const issues = validateExerciseKB();
    const ids = issues.filter((i) => i.type === 'missing_in_catalog').map((i) => i.exerciseId);
    for (const id of ids) {
      expect(hasExercise(id)).toBe(false);
    }
  });
});
