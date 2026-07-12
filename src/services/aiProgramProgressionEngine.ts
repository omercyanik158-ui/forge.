import type { AssembledDay, AssembledExercise } from '@/types/aiProgramAssembly';
import type {
  FatigueModelSnapshot,
  ProgressionEngineInput,
  ProgressionPlan,
  ProgressionWeek,
} from '@/types/aiProgramProgression';
import type { AIProgramExperience, AIProgramGoal } from '@/types/aiProgram';

/**
 * Faz 7 — Progression & Fatigue Engine
 *
 * Faz 6'nın base gün listesini çok-haftalı bloğa dönüştürür. Deterministik,
 * Constitution uyumlu: ölçülü ilerleme, zamanlanmış deload, fake-precision yok.
 */

function decideWeekCount(experience: AIProgramExperience, goal: AIProgramGoal): number {
  switch (experience) {
    case 'beginner':
      return 4;
    case 'returning':
      return 4;
    case 'intermediate':
      return goal === 'strength' || goal === 'athletic_performance' ? 6 : 5;
    case 'advanced':
      return 6;
  }
}

function isDeloadWeek(weekIndex: number, weekCount: number): boolean {
  // son hafta 5+ haftalık blokta her zaman deload
  if (weekIndex + 1 === weekCount && weekCount >= 5) return true;
  // 6 haftalık blokta orta deload (4. hafta)
  if (weekCount >= 6 && weekIndex === 3) return true;
  return false;
}

type WeekProgression = {
  rirDelta: number;
  volumeFactor: number;
  isDeload: boolean;
  title: string;
  guidance: string;
};

function computeWeekProgression(
  weekIndex: number,
  weekCount: number,
  effort: ProgressionEngineInput['effort'],
): WeekProgression {
  const deload = isDeloadWeek(weekIndex, weekCount);
  if (deload) {
    return {
      rirDelta: 2,
      volumeFactor: 0.6,
      isDeload: true,
      title: `${weekIndex + 1}. Hafta — Toparlanma`,
      guidance: 'Hacmi düşür, temiz tekrarlarla toparlanarak bloğu tamamla.',
    };
  }

  const stage = Math.min(Math.floor(weekIndex / 2), 2);
  const volumeFactor = weekIndex === 0 ? 0.9 : 1.0;
  const titles = ['Giriş', 'Geliştirme', 'Yoğunlaştırma', 'Zirve'];
  const guidanceMap = [
    'Tekniği sabitle; çalışma setlerinde yedek bırak.',
    'Tekrar aralığının üst sınırını yakaladığında küçük yük artışı yap.',
    'Form bozulmadan ilerle; ana hareketlerde 1 tekrar yedek hedefle.',
    'Bloğun en yoğun haftası; yorgunluğu izle.',
  ];
  const stageIndex = Math.min(stage, titles.length - 1);
  return {
    rirDelta: -stage,
    volumeFactor,
    isDeload: false,
    title: `${weekIndex + 1}. Hafta — ${titles[stageIndex]}`,
    guidance: guidanceMap[stageIndex] ?? guidanceMap[0]!,
  };
}

function applyRir(baseRir: number, rirDelta: number, effort: ProgressionEngineInput['effort']): number {
  const shifted = baseRir + rirDelta;
  return Math.max(effort.rirMin, Math.min(shifted, effort.rirMax + 2));
}

function applyVolume(baseSets: number, volumeFactor: number): number {
  return Math.max(2, Math.round(baseSets * volumeFactor));
}

function progressDay(baseDay: AssembledDay, rirDelta: number, volumeFactor: number, effort: ProgressionEngineInput['effort']): AssembledDay {
  const exercises: AssembledExercise[] = baseDay.exercises.map((exercise) => ({
    ...exercise,
    rir: applyRir(exercise.rir, rirDelta, effort),
    sets: applyVolume(exercise.sets, volumeFactor),
  }));
  const totalSets = exercises.reduce((sum, item) => sum + item.sets, 0);
  return {
    ...baseDay,
    exercises,
    totalSets,
    estimatedDurationMin: Math.round(totalSets * 3),
  };
}

function buildFatigueModel(weeks: ProgressionWeek[]): FatigueModelSnapshot {
  const weeklyVolumeTrend = weeks.map((week) => ({
    weekIndex: week.weekIndex,
    totalSets: week.totalWeeklySets,
    isDeload: week.isDeload,
  }));
  let peakWeek = 0;
  let peakVolume = 0;
  for (const week of weeks) {
    if (!week.isDeload && week.totalWeeklySets > peakVolume) {
      peakVolume = week.totalWeeklySets;
      peakWeek = week.weekIndex;
    }
  }
  return {
    weeklyVolumeTrend,
    peakWeek,
    deloadWeeks: weeks.filter((w) => w.isDeload).map((w) => w.weekIndex),
    assumptions: [
      'Yorgunluk modeli zamanlanmış deload varsayar; gerçek toparlanma (Faz 10) reaktif tetikler ekler.',
      'Toplam set, seans sıklığı ve süre tahminine dayanır; bireysel toparlanma değişir.',
    ],
  };
}

export function buildProgressionPlan(input: ProgressionEngineInput): ProgressionPlan {
  const weekCount = decideWeekCount(input.experience, input.goal);
  const weeks: ProgressionWeek[] = [];

  for (let weekIndex = 0; weekIndex < weekCount; weekIndex++) {
    const progression = computeWeekProgression(weekIndex, weekCount, input.effort);
    const days = input.baseDays.map((day) => progressDay(day, progression.rirDelta, progression.volumeFactor, input.effort));
    const totalWeeklySets = days.reduce((sum, day) => sum + day.totalSets, 0);
    weeks.push({
      weekIndex,
      title: progression.title,
      guidance: progression.guidance,
      days,
      totalWeeklySets,
      isDeload: progression.isDeload,
      rirDelta: progression.rirDelta,
      volumeFactor: progression.volumeFactor,
    });
  }

  const deloadWeeks = weeks.filter((w) => w.isDeload).map((w) => w.weekIndex);
  const fatigueModel = buildFatigueModel(weeks);

  return {
    weeks,
    weekCount,
    deloadWeeks,
    fatigueModel,
  };
}
