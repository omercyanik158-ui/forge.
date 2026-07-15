import type {
  FoodAnalysisResult,
  PhysiqueAnalysisResult,
  PhysiqueDevelopmentLevel,
  PhysiqueImpactLevel,
  PhysiqueMuscleBalance,
  PhysiqueObservation,
  PhysiquePriorityLevel,
  PhysiquePriorityRoadmapItem,
  PhysiqueProgramMuscle,
  PhysiqueProgramSignals,
  PhysiqueRegionAssessment,
  PhysiqueVTaperAnalysis,
} from '@/types/aiHub';

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function cleanText(value: unknown, fallback: string, maxLength = 600): string {
  if (typeof value !== 'string') return fallback;
  const cleaned = value.trim().replace(/\s+/g, ' ');
  return cleaned ? cleaned.slice(0, maxLength) : fallback;
}

function cleanNumber(value: unknown, minimum: number, maximum: number): number {
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(number)) return minimum;
  return Math.round(Math.min(maximum, Math.max(minimum, number)) * 10) / 10;
}

function cleanEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && allowed.includes(value as T) ? (value as T) : fallback;
}

function cleanStringArray(value: unknown, maxItems: number, maxLength = 100): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => cleanText(item, '', maxLength))
    .filter(Boolean)
    .slice(0, maxItems);
}

export function parseFoodAnalysisResult(value: unknown): FoodAnalysisResult {
  if (!isRecord(value)) throw new Error('INVALID_FOOD_RESULT');

  return {
    yemekAdi: cleanText(value.yemekAdi, 'Tanımlanamayan yemek', 120),
    porsiyon: cleanText(value.porsiyon, '1 porsiyon', 80),
    kalori: cleanNumber(value.kalori, 0, 5000),
    protein: cleanNumber(value.protein, 0, 500),
    karbonhidrat: cleanNumber(value.karbonhidrat, 0, 1000),
    yag: cleanNumber(value.yag, 0, 500),
    guvenPuani: cleanNumber(value.guvenPuani, 0, 100),
    aciklama: cleanText(
      value.aciklama,
      'Değerler fotoğrafa dayalı yaklaşık tahminlerdir.',
      500,
    ),
  };
}

export function parsePhysiqueAnalysisResult(value: unknown): PhysiqueAnalysisResult {
  if (!isRecord(value)) throw new Error('INVALID_PHYSIQUE_RESULT');

  const rawExercises = Array.isArray(value.odaklanmasiGerekenHareketler)
    ? value.odaklanmasiGerekenHareketler
    : [];
  const priorityRoadmap = parsePriorityRoadmap(value.priorityRoadmap);
  const programSignals = parseProgramSignals(value.programSignals, priorityRoadmap, value.guvenPuani);
  const derivedRegions = priorityRoadmap.map((item) => item.targetArea);
  const explicitRegions = cleanStringArray(value.eksikBolgeler, 6, 80);
  const derivedExercises = priorityRoadmap.flatMap((item) =>
    item.exerciseEmphasis.map((exercise) => ({
      hareketAdi: exercise,
      neden: item.reason,
    })),
  );
  const explicitExercises = rawExercises
    .filter(isRecord)
    .map((exercise) => ({
      hareketAdi: cleanText(exercise.hareketAdi, '', 100),
      neden: cleanText(exercise.neden, '', 280),
    }))
    .filter((exercise) => exercise.hareketAdi && exercise.neden);
  const coachSummary = cleanText(value.coachSummary, '', 900);
  const generalDurum = coachSummary || cleanText(value.generalDurum, 'Görsel değerlendirme tamamlandı.', 900);
  const vTaper = parseVTaper(value.vTaper);
  const muscleBalance = parseMuscleBalance(value.muscleBalance);
  const symmetry = parseObservations(value.symmetry, 4);
  const proportion = parseObservations(value.proportion, 4);
  const posture = parseObservations(value.posture, 4);
  const fatDistribution = parseObservations(value.fatDistribution, 4);

  const result: PhysiqueAnalysisResult = {
    generalDurum,
    eksikBolgeler: (derivedRegions.length > 0 ? derivedRegions : explicitRegions).slice(0, 6),
    odaklanmasiGerekenHareketler: (derivedExercises.length > 0 ? derivedExercises : explicitExercises).slice(0, 6),
    tahminiYagOrani: cleanNumber(value.tahminiYagOrani, 2, 60),
    kasKutlesiYorumu: cleanText(value.kasKutlesiYorumu, 'Kas kütlesi görünümü değerlendirilemedi.', 700),
    guvenPuani: cleanNumber(value.guvenPuani, 0, 100),
    pozKalitesiYorumu: cleanText(
      value.pozKalitesiYorumu,
      'Sonuç, ışık ve poz koşullarından etkilenebilir.',
      400,
    ),
  };
  if (value.analysisVersion === 2 || priorityRoadmap.length > 0 || programSignals) {
    result.analysisVersion = 2;
    result.coachSummary = generalDurum;
    if (vTaper) result.vTaper = vTaper;
    if (muscleBalance) result.muscleBalance = muscleBalance;
    result.symmetry = symmetry;
    result.proportion = proportion;
    result.posture = posture;
    result.fatDistribution = fatDistribution;
    result.strengths = cleanStringArray(value.strengths, 5, 120);
    result.improvementAreas = cleanStringArray(value.improvementAreas, 5, 120);
    result.priorityRoadmap = priorityRoadmap;
    result.programSignals = programSignals;
  }
  return result;
}

const DEVELOPMENT_LEVELS: readonly PhysiqueDevelopmentLevel[] = ['weak', 'average', 'strong'];
const PRIORITY_LEVELS: readonly PhysiquePriorityLevel[] = ['low', 'medium', 'high'];
const IMPACT_LEVELS: readonly PhysiqueImpactLevel[] = ['low', 'medium', 'high', 'very_high'];
const PROGRAM_MUSCLES: readonly PhysiqueProgramMuscle[] = [
  'chest',
  'shoulders',
  'lats',
  'upper_back',
  'arms',
  'glutes',
  'quads',
  'hamstrings',
  'calves',
  'core',
];

function parseVTaper(value: unknown): PhysiqueVTaperAnalysis | undefined {
  if (!isRecord(value)) return undefined;
  return {
    shoulderWaistLook: cleanEnum(value.shoulderWaistLook, DEVELOPMENT_LEVELS, 'average'),
    latWidthLook: cleanEnum(value.latWidthLook, DEVELOPMENT_LEVELS, 'average'),
    waistDominance: cleanEnum(value.waistDominance, PRIORITY_LEVELS, 'medium'),
    impactLevel: cleanEnum(value.impactLevel, IMPACT_LEVELS, 'medium'),
    comment: cleanText(value.comment, 'V-taper görünümü fotoğraf koşullarına göre değerlendirildi.', 360),
  };
}

function parseRegionAssessments(value: unknown, maxItems: number): PhysiqueRegionAssessment[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isRecord)
    .map((item) => ({
      region: cleanText(item.region, '', 80),
      developmentLevel: cleanEnum(item.developmentLevel, DEVELOPMENT_LEVELS, 'average'),
      proportion: cleanEnum(item.proportion, PRIORITY_LEVELS, 'medium'),
      symmetry: cleanEnum(item.symmetry, PRIORITY_LEVELS, 'medium'),
      aestheticImpact: cleanEnum(item.aestheticImpact, IMPACT_LEVELS, 'medium'),
      priority: cleanEnum(item.priority, PRIORITY_LEVELS, 'medium'),
      note: cleanText(item.note, 'Görsel değerlendirme fotoğraf koşullarından etkilenebilir.', 260),
    }))
    .filter((item) => item.region.length > 0)
    .slice(0, maxItems);
}

function parseMuscleBalance(value: unknown): PhysiqueMuscleBalance | undefined {
  if (!isRecord(value)) return undefined;
  return {
    chest: parseRegionAssessments(value.chest, 3),
    shoulders: parseRegionAssessments(value.shoulders, 3),
    arms: parseRegionAssessments(value.arms, 3),
    back: parseRegionAssessments(value.back, 3),
    legs: parseRegionAssessments(value.legs, 4),
    abs: parseRegionAssessments(value.abs, 2),
  };
}

function parseObservations(value: unknown, maxItems: number): PhysiqueObservation[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isRecord)
    .map((item) => ({
      title: cleanText(item.title, '', 90),
      description: cleanText(item.description, '', 320),
      confidence: cleanEnum(item.confidence, PRIORITY_LEVELS, 'medium'),
    }))
    .filter((item) => item.title && item.description)
    .slice(0, maxItems);
}

function parsePriorityRoadmap(value: unknown): PhysiquePriorityRoadmapItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isRecord)
    .map((item, index) => ({
      rank: Math.round(cleanNumber(item.rank, 1, 4)) || index + 1,
      targetArea: cleanText(item.targetArea, '', 100),
      targetMuscle: cleanEnum(item.targetMuscle, PROGRAM_MUSCLES, 'shoulders'),
      aestheticImpact: cleanEnum(item.aestheticImpact, IMPACT_LEVELS, 'medium'),
      reason: cleanText(item.reason, 'Bu bölge genel görünüm dengesini etkileyebilir.', 320),
      exerciseEmphasis: cleanStringArray(item.exerciseEmphasis, 4, 100),
      volumeSignal: cleanEnum(item.volumeSignal, ['conservative', 'moderate', 'moderate_high'] as const, 'moderate'),
    }))
    .filter((item) => item.targetArea && item.exerciseEmphasis.length > 0)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 4);
}

function parseProgramSignals(
  value: unknown,
  roadmap: PhysiquePriorityRoadmapItem[],
  rawConfidence: unknown,
): PhysiqueProgramSignals | undefined {
  const confidenceNumber = cleanNumber(rawConfidence, 0, 100);
  const inferredConfidence = confidenceNumber >= 80 ? 'high' : confidenceNumber >= 60 ? 'medium' : 'low';
  const fallbackFocus = roadmap.map((item) => item.targetMuscle).slice(0, 3);
  const fallbackExercises = roadmap.flatMap((item) => item.exerciseEmphasis).slice(0, 6);
  if (!isRecord(value)) {
    if (roadmap.length === 0) return undefined;
    return {
      focusMuscles: fallbackFocus,
      volumeBias: roadmap.some((item) => item.volumeSignal === 'moderate_high') && inferredConfidence === 'high' ? 'moderate_high' : 'moderate',
      splitBiasHint: inferSplitBiasFromProgramMuscles(fallbackFocus),
      exerciseEmphasis: fallbackExercises,
      postureCautions: [],
      confidenceLevel: inferredConfidence,
    };
  }
  const focusMuscles = cleanProgramMuscles(value.focusMuscles, fallbackFocus);
  return {
    focusMuscles,
    volumeBias: cleanEnum(value.volumeBias, ['conservative', 'moderate', 'moderate_high'] as const, inferredConfidence === 'low' ? 'conservative' : 'moderate'),
    splitBiasHint: cleanEnum(value.splitBiasHint, ['balanced', 'upper_focus', 'lower_focus', 'posterior_focus'] as const, inferSplitBiasFromProgramMuscles(focusMuscles)),
    exerciseEmphasis: cleanStringArray(value.exerciseEmphasis, 6, 100).length > 0
      ? cleanStringArray(value.exerciseEmphasis, 6, 100)
      : fallbackExercises,
    postureCautions: cleanStringArray(value.postureCautions, 4, 120),
    confidenceLevel: cleanEnum(value.confidenceLevel, ['low', 'medium', 'high'] as const, inferredConfidence),
  };
}

function cleanProgramMuscles(value: unknown, fallback: PhysiqueProgramMuscle[]): PhysiqueProgramMuscle[] {
  if (!Array.isArray(value)) return fallback;
  const muscles: PhysiqueProgramMuscle[] = [];
  for (const item of value) {
    const muscle = cleanEnum(item, PROGRAM_MUSCLES, 'shoulders');
    if (!muscles.includes(muscle)) muscles.push(muscle);
  }
  return muscles.slice(0, 3);
}

function inferSplitBiasFromProgramMuscles(muscles: PhysiqueProgramMuscle[]): PhysiqueProgramSignals['splitBiasHint'] {
  const upper = muscles.filter((item) => ['chest', 'shoulders', 'lats', 'upper_back', 'arms'].includes(item)).length;
  const lower = muscles.filter((item) => ['glutes', 'quads', 'hamstrings', 'calves'].includes(item)).length;
  if (muscles.some((item) => ['lats', 'upper_back', 'glutes', 'hamstrings'].includes(item))) return 'posterior_focus';
  if (upper >= 2) return 'upper_focus';
  if (lower >= 2) return 'lower_focus';
  return 'balanced';
}
