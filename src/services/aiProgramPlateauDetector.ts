import type { ExerciseStrengthProgress } from '@/services/strengthProgress';
import type { PlateauAssessment } from '@/types/aiProgramFeedback';

/**
 * Faz 10 — Plateau Detector
 *
 * Bir egzersizin güç kayıtlarından stall/plato tespiti. Son N seansta
 * anlamlı ilerleme yoksa stalled işaretlenir. Constitution: tespit
 * ölçülüdür; kısa süreli dalgalanma plato sayılmaz.
 */

const STALL_SESSION_THRESHOLD = 3;
const MIN_PROGRESS_PCT = 2;

export function assessPlateau(progress: ExerciseStrengthProgress): PlateauAssessment {
  const records = [...progress.records].sort(
    (a, b) => +new Date(a.completedAt) - +new Date(b.completedAt),
  );
  if (records.length === 0) {
    return {
      exerciseId: progress.exerciseId,
      exerciseName: progress.exerciseName,
      isStalled: false,
      sessionsWithoutProgress: 0,
      recommendation: 'continue',
      rationale: 'Kayıt yok.',
    };
  }

  const first1RM = records[0]!.estimatedOneRepMaxKg;
  const recent = records.slice(-STALL_SESSION_THRESHOLD);
  const recent1RMs = recent.map((r) => r.estimatedOneRepMaxKg);
  const recentMin = Math.min(...recent1RMs);
  const recentMax = Math.max(...recent1RMs);
  const recentRangePct = first1RM > 0 ? ((recentMax - recentMin) / first1RM) * 100 : 0;
  const isStalled = recent.length >= STALL_SESSION_THRESHOLD && recentRangePct < MIN_PROGRESS_PCT;

  // PR'dan bu yana kaç seans geçti (ilerleme örneği yok)
  let sessionsWithoutProgress = 0;
  for (let i = records.length - 1; i >= 0; i--) {
    const changePct = first1RM > 0 ? ((records[i]!.estimatedOneRepMaxKg - first1RM) / first1RM) * 100 : 0;
    if (changePct >= MIN_PROGRESS_PCT) break;
    sessionsWithoutProgress += 1;
  }

  let recommendation: PlateauAssessment['recommendation'];
  let rationale: string;
  if (!isStalled) {
    recommendation = 'continue';
    rationale = 'Son seansta ilerleme izlendi; devam et.';
  } else if (sessionsWithoutProgress >= STALL_SESSION_THRESHOLD + 2) {
    recommendation = 'deload';
    rationale = `${sessionsWithoutProgress} seansta anlamlı ilerleme yok; toparlanma haftası önerilir.`;
  } else {
    recommendation = 'volume_adjust';
    rationale = `${sessionsWithoutProgress} seansta ilerleme yavaşladı; hacim veya çeşitlilik ayarlaması önerilir.`;
  }

  return {
    exerciseId: progress.exerciseId,
    exerciseName: progress.exerciseName,
    isStalled,
    sessionsWithoutProgress,
    recommendation,
    rationale,
  };
}

export function assessAllPlateaus(progresses: ExerciseStrengthProgress[]): PlateauAssessment[] {
  return progresses.map(assessPlateau);
}
