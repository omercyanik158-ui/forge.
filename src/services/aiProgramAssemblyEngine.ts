import { EXERCISE_PROGRAMMING_META } from '@/data/exerciseProgrammingMeta';
import {
  bucketToMuscleRoles,
  getReplacementsFor,
  isCompatibleWithEquipment,
  isPreferredForLimitation,
  isSafeForLimitations,
} from '@/services/exerciseKB';
import type { ExerciseCategory, ExerciseProgrammingMeta, PriorityMuscleBucket } from '@/types/exerciseKB';
import type { AIProgramSplitKey } from '@/types/aiProgramDecision';
import type { AIProgramGoal } from '@/types/aiProgram';
import type {
  AssembledDay,
  AssembledExercise,
  AssemblyEngineInput,
  SessionAssemblyPlan,
} from '@/types/aiProgramAssembly';

/**
 * Faz 6 — Selection & Assembly Engine
 *
 * Deterministik, lokal, açıklanabilir hareket seçimi. Faz 4 KB ve Faz 5
 * volume blueprint'i birleştirerek her gün için hareket listesi üretir.
 *
 * Kurallar:
 * - compound hareketler taze (gün başı) yerleşir; izolasyon sonra.
 * - aynı pattern'den gereksiz tekrar önlenir (redundancy).
 * - bildirilen ağrı için 'avoid' hareketler elenir, 'preferred' önceliklenir.
 * - seans süresi perSessionSetCeiling'i aşarsa izolasyon kırpılır.
 */

type DayFocus = {
  title: string;
  buckets: PriorityMuscleBucket[];
};

const UPPER: PriorityMuscleBucket[] = ['chest', 'shoulders', 'lats', 'upper_back', 'arms'];
const LOWER: PriorityMuscleBucket[] = ['quads', 'hamstrings', 'glutes', 'calves', 'core'];
const PUSH: PriorityMuscleBucket[] = ['chest', 'shoulders', 'arms'];
const PULL: PriorityMuscleBucket[] = ['lats', 'upper_back', 'arms'];
const LEGS: PriorityMuscleBucket[] = ['quads', 'hamstrings', 'glutes', 'calves', 'core'];
const TORSO: PriorityMuscleBucket[] = ['chest', 'shoulders', 'lats', 'upper_back', 'arms', 'core'];
const LIMBS: PriorityMuscleBucket[] = ['quads', 'hamstrings', 'glutes', 'calves'];
const ANTERIOR: PriorityMuscleBucket[] = ['chest', 'shoulders', 'quads', 'core'];
const POSTERIOR: PriorityMuscleBucket[] = ['lats', 'upper_back', 'hamstrings', 'glutes', 'core'];
const FULL: PriorityMuscleBucket[] = ['chest', 'shoulders', 'lats', 'upper_back', 'quads', 'hamstrings', 'glutes', 'core'];

function getDayFocuses(split: AIProgramSplitKey, days: number): DayFocus[] {
  const range = (count: number) => Array.from({ length: count }, (_, i) => i);
  switch (split) {
    case 'full_body':
      return range(days).map((i) => ({ title: `Tüm Vücut ${String.fromCharCode(65 + (i % 3))}`, buckets: FULL }));
    case 'minimalist_home':
      return range(days).map((i) => ({ title: `Minimal Akış ${String.fromCharCode(65 + (i % 3))}`, buckets: FULL }));
    case 'upper_lower':
      return range(days).map((i) => ({
        title: i % 2 === 0 ? 'Üst Vücut' : 'Alt Vücut',
        buckets: i % 2 === 0 ? UPPER : LOWER,
      }));
    case 'torso_limbs':
      return range(days).map((i) => ({
        title: i % 2 === 0 ? 'Üst Vücut' : 'Alt Vücut',
        buckets: i % 2 === 0 ? TORSO : LIMBS,
      }));
    case 'anterior_posterior':
      return range(days).map((i) => ({
        title: i % 2 === 0 ? 'Ön Zincir' : 'Arka Zincir',
        buckets: i % 2 === 0 ? ANTERIOR : POSTERIOR,
      }));
    case 'push_pull_legs': {
      const cycle: PriorityMuscleBucket[][] = [PUSH, PULL, LEGS];
      return range(days).map((i) => ({
        title: ['İtiş', 'Çekiş', 'Bacak'][i % 3] ?? 'Tüm Vücut',
        buckets: cycle[i % 3] ?? FULL,
      }));
    }
    case 'hybrid': {
      if (days <= 2) return range(days).map(() => ({ title: 'Tüm Vücut', buckets: FULL }));
      if (days === 3) {
        return [
          { title: 'Tüm Vücut', buckets: FULL },
          { title: 'Üst Vücut', buckets: UPPER },
          { title: 'Alt Vücut', buckets: LOWER },
        ];
      }
      return range(days).map((i) => ({
        title: i % 2 === 0 ? 'Üst Vücut' : 'Alt Vücut',
        buckets: i % 2 === 0 ? UPPER : LOWER,
      }));
    }
    case 'body_part_emphasis': {
      // 5-6 gün: öncelik üst, alt, çekiş, itiş, alt detay, kol detay
      const rotation: DayFocus[] = [
        { title: 'Öncelikli Üst', buckets: ['chest', 'shoulders', 'arms'] },
        { title: 'Alt Vücut', buckets: LOWER },
        { title: 'Çekiş', buckets: PULL },
        { title: 'İtiş', buckets: PUSH },
        { title: 'Alt Vücut Detay', buckets: ['glutes', 'hamstrings', 'calves', 'core'] },
        { title: 'Kol Detayı', buckets: ['arms', 'shoulders'] },
      ];
      return range(days).map((i) => rotation[i % rotation.length] ?? rotation[0]!);
    }
  }
}

function goalRepBias(goal: AIProgramGoal): 'low' | 'mid' | 'high' {
  switch (goal) {
    case 'strength':
      return 'low';
    case 'build_muscle':
    case 'recomposition':
      return 'mid';
    case 'lose_fat':
    case 'general_fitness':
    case 'return_to_training':
      return 'high';
    case 'athletic_performance':
      return 'low';
  }
}

function resolveReps(meta: ExerciseProgrammingMeta, goal: AIProgramGoal): number {
  const bias = goalRepBias(goal);
  const { min, max } = meta.defaultRepRange;
  if (min === max) return min;
  if (bias === 'low') return Math.max(min, Math.round(min + (max - min) * 0.25));
  if (bias === 'high') return Math.round(min + (max - min) * 0.75);
  return Math.round((min + max) / 2);
}

function resolveRir(meta: ExerciseProgrammingMeta, rirMin: number, rirMax: number): number {
  // compound daha muhafazakar (rirMax civarı), izolasyon daha agressive (rirMin civarı)
  if (meta.category === 'compound') return rirMax;
  if (meta.category === 'isolation') return rirMin;
  return Math.round((rirMin + rirMax) / 2);
}

function buildRepLabel(reps: number, meta: ExerciseProgrammingMeta): string {
  const range = meta.defaultRepRange;
  const spread = range.max - range.min;
  if (spread >= 6) return `${Math.max(range.min, reps - 2)}-${reps + 2} tekrar`;
  if (spread >= 3) return `${Math.max(range.min, reps - 1)}-${reps + 1} tekrar`;
  return `${reps} tekrar`;
}

const CATEGORY_ORDER: Record<ExerciseCategory, number> = { compound: 0, accessory: 1, isolation: 2 };

function diversityKey(meta: ExerciseProgrammingMeta): string {
  return `${meta.pattern}:${meta.angleVariant ?? ''}`;
}

function candidatesForBucket(
  bucket: PriorityMuscleBucket,
  input: AssemblyEngineInput,
): ExerciseProgrammingMeta[] {
  const roles = bucketToMuscleRoles(bucket);
  const hasPain = input.limitations.some((item) => item !== 'none' && item !== 'other');
  return EXERCISE_PROGRAMMING_META.filter((meta) => meta.pattern !== 'conditioning')
    .filter((meta) => meta.primaryMuscles.some((role) => roles.includes(role)))
    .filter((meta) => isCompatibleWithEquipment(meta, input.availableEquipment))
    .filter((meta) => isSafeForLimitations(meta, input.limitations))
    .sort((a, b) => {
      if (input.sex === 'female') {
        const femaleScore = (meta: ExerciseProgrammingMeta) => {
          if (input.availableEquipment.includes('bodyweight_only')) return 0;
          let score = 0;
          if (meta.primaryMuscles.includes('glutes')) score += 3;
          if (meta.primaryMuscles.includes('abs') || meta.primaryMuscles.includes('obliques')) score += 2;
          if (meta.primaryMuscles.includes('upper_back')) score += 1;
          if (meta.pattern === 'hinge_pattern' || meta.pattern === 'lunge_pattern') score += 1;
          return score;
        };
        const scoreDiff = femaleScore(b) - femaleScore(a);
        if (scoreDiff !== 0) return scoreDiff;
      }
      if (hasPain) {
        const aPref = isPreferredForLimitation(a, input.limitations) ? 0 : 1;
        const bPref = isPreferredForLimitation(b, input.limitations) ? 0 : 1;
        if (aPref !== bPref) return aPref - bPref;
      }
      return CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category];
    });
}

function pickExercisesForBucket(
  bucket: PriorityMuscleBucket,
  perSessionSets: number,
  input: AssemblyEngineInput,
): AssembledExercise[] {
  const candidates = candidatesForBucket(bucket, input);
  if (candidates.length === 0) return [];

  const setsPerExercise = 3;
  const exerciseCount = Math.max(1, Math.min(candidates.length, Math.ceil(perSessionSets / setsPerExercise)));
  const rirMin = input.volumeBlueprint.effort.rirMin;
  const rirMax = input.volumeBlueprint.effort.rirMax;

  const chosen: ExerciseProgrammingMeta[] = [];
  const usedKeys = new Set<string>();

  // Pattern + angle diversity allows useful variants, such as flat and incline presses.
  for (const candidate of candidates) {
    if (chosen.length >= exerciseCount) break;
    const key = diversityKey(candidate);
    if (usedKeys.has(key)) continue;
    chosen.push(candidate);
    usedKeys.add(key);
  }

  const totalChosen = chosen.length;
  const setsEach = Math.max(2, Math.ceil(perSessionSets / totalChosen));

  const hasPain = input.limitations.some((item) => item !== 'none' && item !== 'other');

  return chosen.map((meta, index) => {
    const reps = resolveReps(meta, input.goal);
    const rir = resolveRir(meta, rirMin, rirMax);
    const isPreferred = hasPain && isPreferredForLimitation(meta, input.limitations);
    const whyParts: string[] = [`${bucket} için ${meta.category} ${meta.pattern.replace('_', ' ')}`];
    if (index === 0) whyParts.push('bucket için birincil hareket');
    if (meta.category === 'compound') whyParts.push('taze yerleşim için gün başında');
    if (isPreferred) whyParts.push('bildirilen limitasyon için güvenli alternatif');
    if (meta.stimulusToFatigue === 'low') whyParts.push('düşük yorgunluk maliyeti');

    const replacements = getReplacementsFor(meta.exerciseId, input.availableEquipment, input.limitations);

    return {
      exerciseId: meta.exerciseId,
      sets: setsEach,
      reps,
      repLabel: buildRepLabel(reps, meta),
      restSeconds: meta.defaultRestSeconds,
      rir,
      alternatives: replacements.map((item) => item.exerciseId),
      why: whyParts.join('; '),
      category: meta.category,
      pattern: meta.pattern,
      primaryBucket: bucket,
    };
  });
}

function assembleDay(focus: DayFocus, dayIndex: number, input: AssemblyEngineInput): AssembledDay {
  const seenExerciseIds = new Set<string>();
  const exercises: AssembledExercise[] = [];
  const bucketsCovered: PriorityMuscleBucket[] = [];
  const notes: string[] = [];

  // compound bucket'ları önce işle (chest/quads/back gibi büyük kaslar),
  // böylece gün başına taze yerleşim doğal olarak olur.
  const orderedBuckets = [...focus.buckets].sort((a, b) => {
    const aCompound = candidatesForBucket(a, input).some((m) => m.category === 'compound');
    const bCompound = candidatesForBucket(b, input).some((m) => m.category === 'compound');
    return (aCompound ? 0 : 1) - (bCompound ? 0 : 1);
  });

  for (const bucket of orderedBuckets) {
    const target = input.volumeBlueprint.targets.find((t) => t.bucket === bucket);
    if (!target) continue;
    const perSession = Math.max(1, Math.round(target.weeklySets / target.frequency));
    const picked = pickExercisesForBucket(bucket, perSession, input).filter(
      (item) => !seenExerciseIds.has(item.exerciseId),
    );
    if (picked.length === 0) {
      notes.push(`${bucket} için uygun hareket bulunamadı (ekipman/limitasyon filtresi).`);
      continue;
    }
    picked.forEach((item) => seenExerciseIds.add(item.exerciseId));
    exercises.push(...picked);
    if (!bucketsCovered.includes(bucket)) bucketsCovered.push(bucket);
  }

  // sıralama: compound -> accessory -> isolation
  exercises.sort((a, b) => CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category]);

  // duration guard: perSessionSetCeiling aşılırsa önce izolasyon/accessory kırpar,
  // hala aşıyorsa compound setlerini 3'e indir, son olarak fazla compound'ları çıkarır.
  const ceiling = input.volumeBlueprint.fatigue.perSessionSetCeiling;
  let totalSets = exercises.reduce((sum, item) => sum + item.sets, 0);
  let trimmed = false;

  while (totalSets > ceiling && exercises.length > 1) {
    const last = exercises[exercises.length - 1]!;
    if (last.category === 'isolation' || last.category === 'accessory') {
      totalSets -= last.sets;
      exercises.pop();
      trimmed = true;
    } else {
      break;
    }
  }
  // hala ceiling üstündeyse compound setlerini düşür
  if (totalSets > ceiling) {
    for (const ex of exercises) {
      if (ex.sets > 3) {
        totalSets -= ex.sets - 3;
        ex.sets = 3;
        trimmed = true;
      }
    }
  }
  // hala ceiling üstündeyse en sondaki compound'ları çıkar (en az kritik)
  while (totalSets > ceiling && exercises.length > 3) {
    const last = exercises[exercises.length - 1]!;
    if (last.category === 'compound') {
      totalSets -= last.sets;
      exercises.pop();
      trimmed = true;
    } else {
      break;
    }
  }

  const estimatedDurationMin = Math.round(totalSets * 3);

  if (trimmed) {
    notes.push('Seans süresi tavanını aşmaması için izolasyon hareketleri kırıldı.');
  }

  const day: AssembledDay = {
    dayIndex,
    title: focus.title,
    exercises,
    totalSets,
    estimatedDurationMin,
    bucketsCovered,
    notes: notes.length > 0 ? notes : undefined,
  };
  return day;
}

export function assembleSessionPlan(input: AssemblyEngineInput): SessionAssemblyPlan {
  const focuses = getDayFocuses(input.split, input.recommendedTrainingDays);
  const days = focuses.map((focus, index) => assembleDay(focus, index, input));
  const selectionNotes: string[] = [];
  const warnings: string[] = [];

  const totalWeeklySets = days.reduce((sum, day) => sum + day.totalSets, 0);
  if (totalWeeklySets > input.volumeBlueprint.fatigue.weeklySetCeiling) {
    warnings.push(
      `Toplam haftalık set (${totalWeeklySets}) yorgunluk tavanını aşıyor; ilerleme fazında hacim ayarlaması gerekli.`,
    );
  }

  const emptyBuckets = days.some((day) => day.bucketsCovered.length === 0);
  if (emptyBuckets) {
    warnings.push('Bazı günlerde ekipman/limitasyon filtresi sonrası hareket kalmadı.');
  }

  selectionNotes.push(`${input.split.replace('_', ' ')} split'i için ${days.length} gün kuruldu.`);
  selectionNotes.push('Hareketler compound -> accessory -> isolation sırasına göre dizildi.');

  return {
    split: input.split,
    days,
    selectionNotes,
    warnings,
  };
}

export { getDayFocuses };
export type { DayFocus };
