import { hasExercise } from './exerciseCatalog';
import { EXERCISE_PROGRAMMING_META, REPLACEMENT_GROUPS } from '@/data/exerciseProgrammingMeta';
import type {
  ExerciseCategory,
  ExerciseProgrammingMeta,
  MovementPattern,
  MuscleRole,
  PainCompatibility,
  PriorityMuscleBucket,
  ReplacementGroup,
} from '@/types/exerciseKB';
import type { AIProgramEquipmentKey, AIProgramPainLimitation } from '@/types/aiProgram';

const META_BY_ID = new Map<string, ExerciseProgrammingMeta>(
  EXERCISE_PROGRAMMING_META.map((item) => [item.exerciseId, item]),
);

export function getExerciseMeta(exerciseId: string): ExerciseProgrammingMeta | undefined {
  return META_BY_ID.get(exerciseId);
}

export function hasExerciseMeta(exerciseId: string): boolean {
  return META_BY_ID.has(exerciseId);
}

export function getAllProgrammableExercises(): ExerciseProgrammingMeta[] {
  return EXERCISE_PROGRAMMING_META;
}

export function getExercisesByPattern(pattern: MovementPattern): ExerciseProgrammingMeta[] {
  return EXERCISE_PROGRAMMING_META.filter((item) => item.pattern === pattern);
}

export function getExercisesByMuscleRole(role: MuscleRole): ExerciseProgrammingMeta[] {
  return EXERCISE_PROGRAMMING_META.filter(
    (item) => item.primaryMuscles.includes(role) || item.secondaryMuscles.includes(role),
  );
}

export function getPrimaryMuscleExercises(role: MuscleRole): ExerciseProgrammingMeta[] {
  return EXERCISE_PROGRAMMING_META.filter((item) => item.primaryMuscles.includes(role));
}

export function getExercisesByCategory(category: ExerciseCategory): ExerciseProgrammingMeta[] {
  return EXERCISE_PROGRAMMING_META.filter((item) => item.category === category);
}

/**
 * MuscleRole -> AIProgramPriorityMuscle bucket eşlemesi. Faz 5 (volume),
 * physique analizi "eksik bölge" sinyalini ve kullanıcının priorityMuscles
 * seçimini MuscleRole bazlı metadata ile eşleştirmek için kullanır.
 */
export function mapMuscleRoleToBucket(role: MuscleRole): PriorityMuscleBucket {
  switch (role) {
    case 'upper_chest':
    case 'mid_chest':
    case 'lower_chest':
      return 'chest';
    case 'front_delts':
    case 'side_delts':
    case 'rear_delts':
      return 'shoulders';
    case 'lats':
      return 'lats';
    case 'upper_back':
    case 'traps':
      return 'upper_back';
    case 'biceps':
    case 'triceps':
    case 'forearms':
      return 'arms';
    case 'glutes':
      return 'glutes';
    case 'quads':
    case 'quads_rectus':
    case 'quads_vastus':
    case 'adductors':
      return 'quads';
    case 'hamstrings':
      return 'hamstrings';
    case 'calves':
    case 'gastrocnemius':
    case 'soleus':
      return 'calves';
    case 'abs':
    case 'upper_abs':
    case 'obliques':
    case 'lower_back':
      return 'core';
  }
}

/**
 * Bir bucket'a hizmet eden tüm MuscleRole'leri döndürür (ters eşleme).
 * Faz 5, bir öncelik kası için hangi rollerin hacim alacağını bulur.
 */
export function bucketToMuscleRoles(bucket: PriorityMuscleBucket): MuscleRole[] {
  switch (bucket) {
    case 'chest':
      return ['upper_chest', 'mid_chest', 'lower_chest'];
    case 'shoulders':
      return ['front_delts', 'side_delts', 'rear_delts'];
    case 'lats':
      return ['lats'];
    case 'upper_back':
      return ['upper_back', 'traps'];
    case 'arms':
      return ['biceps', 'triceps', 'forearms'];
    case 'glutes':
      return ['glutes'];
    case 'quads':
      return ['quads', 'quads_rectus', 'quads_vastus', 'adductors'];
    case 'hamstrings':
      return ['hamstrings'];
    case 'calves':
      return ['calves', 'gastrocnemius', 'soleus'];
    case 'core':
      return ['abs', 'upper_abs', 'obliques', 'lower_back'];
  }
}

/**
 * Bir hareketin kullanıcının ekipmanıyla uyumlu olup olmadığı.
 * - bodyweight_only içeren hareketler her zaman uyumludur (ekipman gerekmez).
 * - Aksi halde hareketin ekipman listesindeki en az bir item kullanıcının
 *   ekipmanında olmalıdır.
 */
export function isCompatibleWithEquipment(meta: ExerciseProgrammingMeta, available: AIProgramEquipmentKey[]): boolean {
  if (meta.equipment.includes('bodyweight_only')) return true;
  if (available.length === 0) return false;
  return meta.equipment.some((item) => available.includes(item));
}

/**
 * Bir hareketin tek bir limitasyon için uyum seviyesi.
 * Tanımsız (metadata'da yoksa) 'acceptable' varsayılır.
 */
export function getPainCompatibility(meta: ExerciseProgrammingMeta, limitation: AIProgramPainLimitation): PainCompatibility {
  return meta.painCompatibility[limitation] ?? 'acceptable';
}

/**
 * Bir hareketin bildirilen tüm limitasyonlar için güvenli olup olmadığı.
 * Güvenli = bildirilen hiçbir gerçek limitasyon (none/other hariç) için 'avoid' değil.
 * 'caution' hareketleri elenmez; Faz 6 bunları flagleyip tercih sıralamasında
 * aşağı çeker, böylece güvenli taraf korunur (Constitution: risk minimization).
 */
export function isSafeForLimitations(meta: ExerciseProgrammingMeta, limitations: AIProgramPainLimitation[]): boolean {
  const realLimitations = limitations.filter((item) => item !== 'none' && item !== 'other');
  if (realLimitations.length === 0) return true;
  return realLimitations.every((limitation) => getPainCompatibility(meta, limitation) !== 'avoid');
}

/**
 * Bir limitasyon için özellikle önerilen (preferred) hareketler.
 * Faz 6, ağrı bildiren kullanıcıda bunları tercih sıralamasında yukarı çeker.
 */
export function isPreferredForLimitation(meta: ExerciseProgrammingMeta, limitations: AIProgramPainLimitation[]): boolean {
  const realLimitations = limitations.filter((item) => item !== 'none' && item !== 'other');
  if (realLimitations.length === 0) return false;
  return realLimitations.some((limitation) => getPainCompatibility(meta, limitation) === 'preferred');
}

/**
 * Ekipman ve limitasyon filtreli hareket havuzu. Faz 6'nın temel sorgusu.
 * Sıralama: preferred (ağrı varsa) önce, sonra category (compound > accessory > isolation),
 * sonra stimulusToFatigue (yüksek önce — taze yerleşim için).
 */
export function getSafeExercisesForPattern(
  pattern: MovementPattern,
  availableEquipment: AIProgramEquipmentKey[],
  limitations: AIProgramPainLimitation[],
): ExerciseProgrammingMeta[] {
  const hasPain = limitations.some((item) => item !== 'none' && item !== 'other');
  const categoryOrder: Record<ExerciseCategory, number> = { compound: 0, accessory: 1, isolation: 2 };
  return getExercisesByPattern(pattern)
    .filter((item) => isCompatibleWithEquipment(item, availableEquipment))
    .filter((item) => isSafeForLimitations(item, limitations))
    .sort((left, right) => {
      if (hasPain) {
        const leftPreferred = isPreferredForLimitation(left, limitations) ? 0 : 1;
        const rightPreferred = isPreferredForLimitation(right, limitations) ? 0 : 1;
        if (leftPreferred !== rightPreferred) return leftPreferred - rightPreferred;
      }
      const categoryDelta = categoryOrder[left.category] - categoryOrder[right.category];
      if (categoryDelta !== 0) return categoryDelta;
      return 0;
    });
}

export function getReplacementGroup(pattern: MovementPattern): ReplacementGroup | undefined {
  return REPLACEMENT_GROUPS.find((group) => group.pattern === pattern);
}

function getReplacementGroupForExercise(
  source: ExerciseProgrammingMeta,
): ReplacementGroup | undefined {
  return (
    REPLACEMENT_GROUPS.find(
      (group) =>
        group.pattern === source.pattern &&
        group.exerciseIds.includes(source.exerciseId),
    ) ?? getReplacementGroup(source.pattern)
  );
}

/**
 * Bir hareket için değiştirme adaylarını döndürür: aynı pattern grubundan,
 * ekipman ve limitasyon filtreli, hareketin kendisi hariç. Faz 9 (swap) bunu
 * session player'da kullanır.
 */
export function getReplacementsFor(
  exerciseId: string,
  availableEquipment: AIProgramEquipmentKey[],
  limitations: AIProgramPainLimitation[],
): ExerciseProgrammingMeta[] {
  const source = getExerciseMeta(exerciseId);
  if (!source) return [];
  const group = getReplacementGroupForExercise(source);
  if (!group) return [];
  return group.exerciseIds
    .filter((id) => id !== exerciseId)
    .map((id) => getExerciseMeta(id))
    .filter((item): item is ExerciseProgrammingMeta => !!item)
    .filter((item) => isCompatibleWithEquipment(item, availableEquipment))
    .filter((item) => isSafeForLimitations(item, limitations));
}

export type ExerciseKBValidationIssue = {
  type: 'missing_in_catalog' | 'duplicate_id' | 'invalid_set_band' | 'invalid_rep_range' | 'empty_muscles_for_programmable';
  exerciseId: string;
  detail: string;
};

/**
 * KB bütünlük kontrolü. Her exerciseId egzersiz kataloğunda var mı,
 * tekrar id yok mu, set/rep bantları geçerli mi. Faz 8 program seviye
 * doğrulayıcısından ayrı olarak KB'nin kendi tutarlılığını garanti eder.
 */
export function validateExerciseKB(): ExerciseKBValidationIssue[] {
  const issues: ExerciseKBValidationIssue[] = [];
  const seen = new Set<string>();

  for (const entry of EXERCISE_PROGRAMMING_META) {
    if (seen.has(entry.exerciseId)) {
      issues.push({ type: 'duplicate_id', exerciseId: entry.exerciseId, detail: 'Aynı exerciseId birden fazla kez tanımlanmış.' });
    }
    seen.add(entry.exerciseId);

    if (!hasExercise(entry.exerciseId)) {
      issues.push({ type: 'missing_in_catalog', exerciseId: entry.exerciseId, detail: 'Egzersiz kataloğunda bulunamadı; session player sessizce düşürür.' });
    }
    if (entry.defaultSetBand.min > entry.defaultSetBand.max) {
      issues.push({ type: 'invalid_set_band', exerciseId: entry.exerciseId, detail: 'Set bandı min > max.' });
    }
    if (entry.defaultRepRange.min > entry.defaultRepRange.max) {
      issues.push({ type: 'invalid_rep_range', exerciseId: entry.exerciseId, detail: 'Tekrar aralığı min > max.' });
    }
    if (entry.pattern !== 'conditioning' && entry.primaryMuscles.length === 0) {
      issues.push({ type: 'empty_muscles_for_programmable', exerciseId: entry.exerciseId, detail: 'Kondisyon dışı hareketin birincil kası yok.' });
    }
  }

  return issues;
}
