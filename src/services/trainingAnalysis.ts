import type { ExerciseLibraryItem, WorkoutLog } from '@/types';
import { getExerciseById } from './exerciseCatalog';
import { localDateKeyFromIso, weekStartKey } from './dateUtils';
import { normalizedText } from './textUtils';
import { loadWorkoutLogs } from './workoutStore';

export type AnalysisRegion = '\u0047\u00f6\u011f\u00fcs' | 'S\u0131rt' | 'Omuz' | 'Biceps' | 'Bacak' | 'Triceps';
export const ANALYSIS_REGIONS: AnalysisRegion[] = ['\u0047\u00f6\u011f\u00fcs', 'S\u0131rt', 'Omuz', 'Biceps', 'Bacak', 'Triceps'];

export type RegionStatus = 'eksik' | 'dusuk' | 'dengeli' | 'yeterli' | 'yogun';
export type PplBalance = 'dengeli' | 'itis_fazla' | 'cekis_fazla' | 'bacak_dusuk';
export type PplSide = 'push' | 'pull' | 'legs';
export type AnalysisSufficiency = 'empty' | 'limited' | 'sufficient';

export const MIN_LOGS_FOR_ANALYSIS = 3;

export type RegionResult = {
  region: AnalysisRegion;
  sets: number;
  status: RegionStatus;
};

export type TrainingAnalysis = {
  sufficiency: AnalysisSufficiency;
  regionResults: RegionResult[];
  ppl: Record<PplSide, number>;
  pplBalance: PplBalance;
  headline: string;
  headlineDetail: string;
  regionPhrase: (region: AnalysisRegion) => string;
  pplPhrase: string;
};

type Contribution = {
  region: AnalysisRegion | null;
  ppl: PplSide | 'core' | null;
  sets: number;
};

const STATUS_THRESHOLDS: { min: number; status: RegionStatus }[] = [
  { min: 18, status: 'yogun' },
  { min: 12, status: 'yeterli' },
  { min: 6, status: 'dengeli' },
  { min: 1, status: 'dusuk' },
];

const SECONDARY_WEIGHT = 0.5;

function canonicalMuscleKey(value: string): string {
  return normalizedText(value)
    .replace(/\u0131/g, 'i')
    .replace(/\u011f/g, 'g')
    .replace(/\u00fc/g, 'u')
    .replace(/\u00f6/g, 'o')
    .replace(/\u015f/g, 's')
    .replace(/\u00e7/g, 'c');
}

function regionFromMuscleLabel(value: string): AnalysisRegion | null {
  const key = canonicalMuscleKey(value);

  if (key === 'gogus') return '\u0047\u00f6\u011f\u00fcs';
  if (key === 'sirt' || key === 'orta sirt' || key === 'alt sirt' || key === 'lat' || key === 'trapez') return 'S\u0131rt';
  if (key === 'omuz' || key === 'boyun') return 'Omuz';
  if (key === 'biceps') return 'Biceps';
  if (key === 'triceps') return 'Triceps';
  if (key === 'quadriceps' || key === 'hamstring' || key === 'calf' || key === 'kalca' || key === 'kalca dis' || key === 'ic bacak') {
    return 'Bacak';
  }

  return null;
}

function resolvePrimaryRegion(exercise: ExerciseLibraryItem): AnalysisRegion | null {
  const group = canonicalMuscleKey(exercise.muscleGroup);

  if (group === 'gogus') return '\u0047\u00f6\u011f\u00fcs';
  if (group === 'sirt') return 'S\u0131rt';
  if (group === 'omuz') return 'Omuz';
  if (group === 'bacak') return 'Bacak';

  if (group === 'kol') {
    for (const muscle of exercise.targetMuscles) {
      const region = regionFromMuscleLabel(muscle);
      if (region === 'Biceps' || region === 'Triceps') return region;
    }
  }

  for (const muscle of exercise.targetMuscles) {
    const region = regionFromMuscleLabel(muscle);
    if (region) return region;
  }

  const descriptor = canonicalMuscleKey(`${exercise.id} ${exercise.name} ${exercise.displayName}`);
  if (descriptor.includes('row') || descriptor.includes('pulldown') || descriptor.includes('pull up') || descriptor.includes('pullup') || descriptor.includes('deadlift')) {
    return 'S\u0131rt';
  }
  if (descriptor.includes('bench') || descriptor.includes('press') || descriptor.includes('fly') || descriptor.includes('push up') || descriptor.includes('pushup')) {
    return '\u0047\u00f6\u011f\u00fcs';
  }
  if (descriptor.includes('curl')) return 'Biceps';
  if (descriptor.includes('extension') || descriptor.includes('pushdown')) return 'Triceps';
  if (descriptor.includes('squat') || descriptor.includes('lunge') || descriptor.includes('leg') || descriptor.includes('calf')) return 'Bacak';

  return null;
}

function classifyPpl(exercise: ExerciseLibraryItem): PplSide | 'core' | null {
  const group = canonicalMuscleKey(exercise.muscleGroup);

  if (group === 'gogus' || group === 'omuz') return 'push';
  if (group === 'sirt') return 'pull';
  if (group === 'bacak') return 'legs';
  if (group === 'karin') return 'core';

  if (group === 'kol') {
    const isBiceps = exercise.targetMuscles.some((muscle) => regionFromMuscleLabel(muscle) === 'Biceps');
    return isBiceps ? 'pull' : 'push';
  }

  const targetRegion = resolvePrimaryRegion(exercise);
  if (targetRegion === '\u0047\u00f6\u011f\u00fcs' || targetRegion === 'Omuz' || targetRegion === 'Triceps') return 'push';
  if (targetRegion === 'S\u0131rt' || targetRegion === 'Biceps') return 'pull';
  if (targetRegion === 'Bacak') return 'legs';

  return null;
}

function contributionsForExercise(exercise: ExerciseLibraryItem, setCount: number = exercise.defaultSets): Contribution[] {
  const region = resolvePrimaryRegion(exercise);
  const ppl = classifyPpl(exercise);
  const contributions: Contribution[] = [{ region, ppl, sets: setCount }];

  const secondaryRegions = new Set<AnalysisRegion>();
  for (const muscle of exercise.secondaryMuscles) {
    const mapped = regionFromMuscleLabel(muscle);
    if (mapped && mapped !== region) secondaryRegions.add(mapped);
  }

  for (const secondaryRegion of secondaryRegions) {
    contributions.push({ region: secondaryRegion, ppl: null, sets: setCount * SECONDARY_WEIGHT });
  }

  return contributions;
}

function resolveExerciseIds(log: WorkoutLog): string[] {
  if (log.exerciseIds && log.exerciseIds.length > 0) return log.exerciseIds;
  if (log.exerciseId) return [log.exerciseId];
  return [];
}

function resolvePplFromGroup(group: string): PplSide | 'core' | null {
  const key = canonicalMuscleKey(group);
  if (key === 'gogus' || key === 'omuz') return 'push';
  if (key === 'sirt') return 'pull';
  if (key === 'bacak') return 'legs';
  if (key === 'karin') return 'core';
  return null;
}

function contributionsForLog(log: WorkoutLog): Contribution[] {
  const exerciseIds = resolveExerciseIds(log);

  if (exerciseIds.length > 0) {
    const setCountByExercise = new Map<string, number>();
    for (const entry of log.setEntries ?? []) {
      const exerciseId = entry.exerciseId ?? (exerciseIds.length === 1 ? exerciseIds[0] : undefined);
      if (exerciseId) setCountByExercise.set(exerciseId, (setCountByExercise.get(exerciseId) ?? 0) + 1);
    }

    return exerciseIds.flatMap((id) => {
      const exercise = getExerciseById(id);
      const loggedSetCount = setCountByExercise.get(id);
      return exercise ? contributionsForExercise(exercise, loggedSetCount ?? exercise.defaultSets) : [];
    });
  }

  const fallbackSets = log.setEntries?.length ?? 3;
  return (log.muscleGroups ?? []).map((group) => ({
    region: regionFromMuscleLabel(group),
    ppl: resolvePplFromGroup(group),
    sets: fallbackSets,
  }));
}

function statusForSets(sets: number): RegionStatus {
  return STATUS_THRESHOLDS.find((threshold) => sets >= threshold.min)?.status ?? 'eksik';
}

function assessPplBalance(ppl: Record<PplSide, number>): PplBalance {
  const { push, pull, legs } = ppl;
  const total = push + pull + legs;

  if (total === 0) return 'dengeli';
  if (legs <= 0) return 'bacak_dusuk';

  const pushOverPull = push - pull;
  if (pushOverPull >= 6 && push > pull * 1.25) return 'itis_fazla';
  if (-pushOverPull >= 6 && pull > push * 1.25) return 'cekis_fazla';

  return 'dengeli';
}

const REGION_STATUS_PHRASE: Record<RegionStatus, string> = {
  eksik: 'eksik kald\u0131',
  dusuk: 'd\u00fc\u015f\u00fck kald\u0131',
  dengeli: 'dengeli',
  yeterli: 'yeterli',
  yogun: 'yo\u011fun ge\u00e7ti',
};

export function regionStatusPhrase(region: AnalysisRegion, status: RegionStatus): string {
  if (region === 'Bacak') {
    if (status === 'yeterli') return 'hacmi iyi';
    if (status === 'eksik') return 'hacmi eksik';
    if (status === 'dusuk') return 'hacmi d\u00fc\u015f\u00fck';
  }

  return REGION_STATUS_PHRASE[status];
}

const PPL_BALANCE_PHRASE: Record<PplBalance, string> = {
  dengeli: '\u0130ti\u015f ve \u00e7eki\u015f dengesi yak\u0131n',
  itis_fazla: 'Bu hafta iti\u015f taraf\u0131 biraz fazla',
  cekis_fazla: 'Bu hafta \u00e7eki\u015f taraf\u0131 a\u011f\u0131r bas\u0131yor',
  bacak_dusuk: 'Bacak \u00e7al\u0131\u015fmas\u0131 d\u00fc\u015f\u00fck kald\u0131',
};

function pplDetail(balance: PplBalance, ppl: Record<PplSide, number>): string {
  switch (balance) {
    case 'itis_fazla':
      return `\u0130ti\u015f ${Math.round(ppl.push)} set, \u00e7eki\u015f ${Math.round(ppl.pull)} set.`;
    case 'cekis_fazla':
      return `\u00c7eki\u015f ${Math.round(ppl.pull)} set, iti\u015f ${Math.round(ppl.push)} set.`;
    case 'bacak_dusuk':
      return 'Bacak b\u00f6lgesinde bu hafta set kayd\u0131 yok.';
    default:
      return `\u0130ti\u015f ${Math.round(ppl.push)}, \u00e7eki\u015f ${Math.round(ppl.pull)}, bacak ${Math.round(ppl.legs)} set.`;
  }
}

function buildHeadline(analysis: Omit<TrainingAnalysis, 'headline' | 'headlineDetail'>): { headline: string; headlineDetail: string } {
  if (analysis.sufficiency === 'empty') {
    return {
      headline: 'Hen\u00fcz yeterli antrenman verisi yok',
      headlineDetail: 'Bu hafta kas dengesi analizi i\u00e7in kay\u0131t yok. Bir egzersiz tamamla, analiz olu\u015fmaya ba\u015flas\u0131n.',
    };
  }

  if (analysis.sufficiency === 'limited') {
    return {
      headline: 'Kas dengesi analizi i\u00e7in daha fazla kay\u0131t gerekli',
      headlineDetail: 'Bu hafta birka\u00e7 antrenman daha ekle; ard\u0131ndan b\u00f6lgesel \u00f6zet netle\u015fecek.',
    };
  }

  const missing = analysis.regionResults.find((result) => result.status === 'eksik');
  if (missing) {
    return {
      headline: `${missing.region} b\u00f6lgesi eksik kald\u0131`,
      headlineDetail: `${missing.region} i\u00e7in bu hafta kay\u0131tl\u0131 set yok. Bir hareket eklemeyi d\u00fc\u015f\u00fcnebilirsin.`,
    };
  }

  if (analysis.pplBalance !== 'dengeli') {
    return {
      headline: analysis.pplPhrase,
      headlineDetail: pplDetail(analysis.pplBalance, analysis.ppl),
    };
  }

  const low = analysis.regionResults.find((result) => result.status === 'dusuk');
  if (low) {
    return {
      headline: `${low.region} d\u00fc\u015f\u00fck kald\u0131`,
      headlineDetail: `${low.region} i\u00e7in haftal\u0131k set hacmini biraz art\u0131rabilirsin.`,
    };
  }

  const high = analysis.regionResults.find((result) => result.status === 'yogun');
  if (high) {
    return {
      headline: 'Yo\u011fun bir hafta ge\u00e7irdin',
      headlineDetail: `${high.region} b\u00f6lgesi olduk\u00e7a yo\u011fun; toparlanmaya yer b\u0131rak.`,
    };
  }

  return {
    headline: 'Dengeli bir hafta yakalad\u0131n',
    headlineDetail: 'B\u00f6lgeler aras\u0131nda ciddi bir dengesizlik g\u00f6r\u00fcnm\u00fcyor.',
  };
}

export function analyzeWeeklyTraining(logs: WorkoutLog[], referenceDate: Date = new Date()): TrainingAnalysis {
  const weekStart = weekStartKey(referenceDate);
  const referenceKey = localDateKeyFromIso(referenceDate.toISOString());
  const weeklyLogs = logs.filter((log) => {
    const key = localDateKeyFromIso(log.completedAt);
    return key >= weekStart && key <= referenceKey;
  });

  const regionSets = new Map<AnalysisRegion, number>();
  for (const region of ANALYSIS_REGIONS) regionSets.set(region, 0);

  const ppl: Record<PplSide, number> = { push: 0, pull: 0, legs: 0 };

  for (const log of weeklyLogs) {
    for (const contribution of contributionsForLog(log)) {
      if (contribution.region) {
        regionSets.set(contribution.region, (regionSets.get(contribution.region) ?? 0) + contribution.sets);
      }
      if (contribution.ppl && contribution.ppl !== 'core') {
        ppl[contribution.ppl] += contribution.sets;
      }
    }
  }

  const regionResults: RegionResult[] = ANALYSIS_REGIONS.map((region) => {
    const sets = regionSets.get(region) ?? 0;
    return {
      region,
      sets: Math.round(sets * 10) / 10,
      status: statusForSets(sets),
    };
  });

  const pplBalance = assessPplBalance(ppl);
  const sufficiency: AnalysisSufficiency =
    weeklyLogs.length === 0 ? 'empty' : weeklyLogs.length < MIN_LOGS_FOR_ANALYSIS ? 'limited' : 'sufficient';
  const pplPhrase = PPL_BALANCE_PHRASE[pplBalance];

  const base: Omit<TrainingAnalysis, 'headline' | 'headlineDetail'> = {
    sufficiency,
    regionResults,
    ppl,
    pplBalance,
    regionPhrase: (region) => {
      const result = regionResults.find((item) => item.region === region);
      return result ? regionStatusPhrase(result.region, result.status) : '';
    },
    pplPhrase,
  };

  return { ...base, ...buildHeadline(base) };
}

export async function loadTrainingAnalysis(referenceDate: Date = new Date()): Promise<TrainingAnalysis> {
  const logs = await loadWorkoutLogs();
  return analyzeWeeklyTraining(logs, referenceDate);
}
