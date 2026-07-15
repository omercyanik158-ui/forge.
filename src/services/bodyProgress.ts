import { comparePhysique } from './aiHubComparison';
import { buildWeeklyCoachReview } from './coachAdjustmentEngine';
import { loadCoachAdjustments } from './coachAdjustmentStore';
import { getLogs } from './storageService';
import {
  loadStrengthProgress,
  type ExerciseStrengthProgress,
  type StrengthProgressSnapshot,
} from './strengthProgress';
import type { PhysiqueAnalysisLog } from '@/types/aiHub';
import type { CoachAdjustment, WeeklyCoachReview } from '@/types/coachAdjustment';

export type PhysiqueScoreSnapshot = {
  id: string;
  createdAt: string;
  score: number;
  bodyFatEstimate: number;
  confidence: number;
  focusAreas: string[];
  resolvedFocusAreas: string[];
  newFocusAreas: string[];
  summary: string;
};

export type BodyProgressSnapshot = {
  physiqueScores: PhysiqueScoreSnapshot[];
  latestPhysiqueScore: PhysiqueScoreSnapshot | null;
  previousPhysiqueScore: PhysiqueScoreSnapshot | null;
  scoreDelta: number | null;
  strength: StrengthProgressSnapshot;
  topStrengthProgress: ExerciseStrengthProgress[];
  coachAdjustments: CoachAdjustment[];
  latestCoachReview: WeeklyCoachReview | null;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeFocusKey(value: string): string {
  return value.trim().toLocaleLowerCase('tr-TR');
}

function impactPenalty(impact: string): number {
  if (impact === 'very_high') return 8;
  if (impact === 'high') return 6;
  if (impact === 'medium') return 4;
  return 2;
}

function confidenceFromObservation(value: string): number {
  if (value === 'high') return 90;
  if (value === 'medium') return 76;
  return 62;
}

function calculateFocusScore(result: PhysiqueAnalysisLog['result']): number {
  if (result.priorityRoadmap?.length) {
    const penalty = result.priorityRoadmap.reduce((sum, item) => sum + impactPenalty(item.aestheticImpact), 0);
    return clamp(96 - penalty, 42, 96);
  }
  return clamp(88 - result.eksikBolgeler.length * 7, 42, 96);
}

function calculateBalanceScore(result: PhysiqueAnalysisLog['result']): number {
  const observations = [
    ...(result.symmetry ?? []),
    ...(result.proportion ?? []),
    ...(result.posture ?? []),
  ];
  if (observations.length === 0) return 76;
  const average = observations.reduce((sum, item) => sum + confidenceFromObservation(item.confidence), 0) / observations.length;
  const postureCaution = result.programSignals?.postureCautions.length ? 6 : 0;
  return clamp(average - postureCaution, 45, 94);
}

function calculateScore(current: PhysiqueAnalysisLog, previous?: PhysiqueAnalysisLog): number {
  const result = current.result;
  const baselineBodyFat = previous?.result.tahminiYagOrani ?? result.tahminiYagOrani;
  const bodyFatDelta = previous ? result.tahminiYagOrani - baselineBodyFat : 0;
  const bodyFatScore = previous
    ? clamp(78 - Math.max(0, bodyFatDelta) * 3 + Math.max(0, -bodyFatDelta) * 2, 45, 92)
    : 74;
  const focusScore = calculateFocusScore(result);
  const confidenceScore = clamp(result.guvenPuani, 35, 100);
  const poseText = result.pozKalitesiYorumu.toLocaleLowerCase('tr-TR');
  const poseScore = poseText.includes('kotu') || poseText.includes('kötü') || poseText.includes('dusuk') || poseText.includes('düşük')
    ? 62
    : poseText.includes('iyi') || poseText.includes('net')
      ? 88
      : 76;
  const balanceScore = calculateBalanceScore(result);

  let trendAdjustment = 0;
  if (previous) {
    const comparison = comparePhysique(current, previous);
    trendAdjustment += comparison.resolvedRegions.length * 2.4;
    trendAdjustment -= comparison.newFocusRegions.length * 1.8;
    trendAdjustment -= Math.max(0, comparison.bodyFatDelta) * 0.45;
    trendAdjustment += Math.max(0, -comparison.bodyFatDelta) * 0.35;
  }

  const raw = bodyFatScore * 0.18 + focusScore * 0.33 + balanceScore * 0.2 + confidenceScore * 0.17 + poseScore * 0.12 + trendAdjustment;
  const dampened = result.guvenPuani < 60 && previous
    ? ((raw * 0.55) + (calculateScore(previous) * 0.45))
    : raw;

  return Math.round(clamp(dampened, 1, 100) * 10) / 10;
}

function buildScoreSnapshots(logs: PhysiqueAnalysisLog[]): PhysiqueScoreSnapshot[] {
  const chronological = [...logs].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return chronological.map((log, index) => {
    const previous = chronological[index - 1];
    const comparison = previous ? comparePhysique(log, previous) : null;
    const resolved = comparison?.resolvedRegions ?? [];
    const nextFocus = comparison?.newFocusRegions ?? [];
    const score = calculateScore(log, previous);
    const previousFocus = new Set(previous?.result.eksikBolgeler.map(normalizeFocusKey) ?? []);
    const stableFocus = log.result.eksikBolgeler.filter((area) => previousFocus.has(normalizeFocusKey(area)));

    return {
      id: log.id,
      createdAt: log.createdAt,
      score,
      bodyFatEstimate: log.result.tahminiYagOrani,
      confidence: log.result.guvenPuani,
      focusAreas: log.result.eksikBolgeler,
      resolvedFocusAreas: resolved,
      newFocusAreas: nextFocus,
      summary: resolved.length > 0
        ? `${resolved.slice(0, 2).join(', ')} odağı önceki analize göre iyileşmiş görünüyor.`
        : stableFocus.length > 0
          ? `${stableFocus.slice(0, 2).join(', ')} odağı takip edilmeye devam ediyor.`
          : 'Bu analiz gelişim takibi için başlangıç noktası olarak kaydedildi.',
    };
  });
}

export async function loadBodyProgress(): Promise<BodyProgressSnapshot> {
  const [logs, strength, coachAdjustments] = await Promise.all([
    getLogs('physique', 100),
    loadStrengthProgress(),
    loadCoachAdjustments(),
  ]);
  const physiqueLogs = logs.filter((log): log is PhysiqueAnalysisLog => log.type === 'physique');
  const physiqueScores = buildScoreSnapshots(physiqueLogs);
  const latestPhysiqueScore = physiqueScores.at(-1) ?? null;
  const previousPhysiqueScore = physiqueScores.at(-2) ?? null;

  return {
    physiqueScores,
    latestPhysiqueScore,
    previousPhysiqueScore,
    scoreDelta: latestPhysiqueScore && previousPhysiqueScore
      ? Math.round((latestPhysiqueScore.score - previousPhysiqueScore.score) * 10) / 10
      : null,
    strength,
    topStrengthProgress: strength.exercises
      .filter((item) => item.records.length > 0)
      .sort((a, b) => Math.abs(b.estimatedStrengthChangePct) - Math.abs(a.estimatedStrengthChangePct))
      .slice(0, 5),
    coachAdjustments,
    latestCoachReview: coachAdjustments[0] ? buildWeeklyCoachReview(coachAdjustments[0]) : null,
  };
}
