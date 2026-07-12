import { describe, expect, it } from 'vitest';
import { assessPlateau } from '@/services/aiProgramPlateauDetector';
import { computeAutoregulation, recommendBlockTransition } from '@/services/aiProgramAutoregulation';
import type { ExerciseStrengthProgress, StrengthRecord } from '@/services/strengthProgress';
import type { SessionFeedback, PlateauAssessment } from '@/types/aiProgramFeedback';

function makeRecord(kg: number, reps: number, daysAgo: number): StrengthRecord {
  const estimatedOneRepMaxKg = reps <= 1 ? kg : kg * (1 + reps / 30);
  return {
    id: `r-${kg}-${reps}-${daysAgo}`,
    workoutId: 'w',
    exerciseId: 'Barbell_Bench_Press_-_Medium_Grip',
    exerciseName: 'Bench',
    completedAt: new Date(Date.now() - daysAgo * 86400000).toISOString(),
    kg,
    reps,
    volumeKg: kg * reps,
    estimatedOneRepMaxKg,
  };
}

function makeProgress(records: StrengthRecord[]): ExerciseStrengthProgress {
  const sorted = [...records].sort((a, b) => +new Date(a.completedAt) - +new Date(b.completedAt));
  const latest = sorted[sorted.length - 1]!;
  const first = sorted[0]!;
  const pr = [...sorted].sort((a, b) => b.estimatedOneRepMaxKg - a.estimatedOneRepMaxKg)[0]!;
  return {
    exerciseId: 'Barbell_Bench_Press_-_Medium_Grip',
    exerciseName: 'Bench',
    muscleGroup: 'Göğüs',
    records: sorted,
    firstRecord: first,
    latestRecord: latest,
    comparisonRecord: first,
    personalRecord: pr,
    weightChangeKg: latest.kg - first.kg,
    repChange: latest.reps - first.reps,
    estimatedStrengthChangeKg: latest.estimatedOneRepMaxKg - first.estimatedOneRepMaxKg,
    estimatedStrengthChangePct: ((latest.estimatedOneRepMaxKg - first.estimatedOneRepMaxKg) / first.estimatedOneRepMaxKg) * 100,
  };
}

function feedback(rpe: number, rir: number, recovery: SessionFeedback['recoveryNextDay'], pain: SessionFeedback['painReported'] = ['none']): SessionFeedback {
  return {
    id: `f-${rpe}-${rir}`,
    exerciseIds: [],
    completedAt: new Date().toISOString(),
    perceivedExertion: rpe,
    averageRir: rir,
    painReported: pain,
    recoveryNextDay: recovery,
  };
}

describe('plateau detector', () => {
  it('marks progressing exercise as not stalled', () => {
    const progress = makeProgress([
      makeRecord(60, 8, 30),
      makeRecord(65, 8, 20),
      makeRecord(70, 8, 10),
      makeRecord(72, 8, 2),
    ]);
    const assessment = assessPlateau(progress);
    expect(assessment.isStalled).toBe(false);
    expect(assessment.recommendation).toBe('continue');
  });

  it('flags a stalled exercise after several flat sessions', () => {
    const progress = makeProgress([
      makeRecord(70, 8, 30),
      makeRecord(70, 8, 20),
      makeRecord(70, 8, 10),
      makeRecord(70, 8, 2),
    ]);
    const assessment = assessPlateau(progress);
    expect(assessment.isStalled).toBe(true);
    expect(['volume_adjust', 'deload']).toContain(assessment.recommendation);
  });
});

describe('autoregulation engine', () => {
  it('reduces volume when pain is reported', () => {
    const feedbacks = [feedback(7, 2, 'okay', ['knee'])];
    const result = computeAutoregulation(feedbacks, []);
    expect(result.volumeChange).toBeLessThan(0);
    expect(result.triggers).toContain('pain_reported');
  });

  it('reduces volume under sustained high RPE', () => {
    const feedbacks = [
      feedback(9, 1, 'okay'),
      feedback(9, 0, 'poor'),
    ];
    const result = computeAutoregulation(feedbacks, []);
    expect(result.volumeChange).toBeLessThanOrEqual(0);
    expect(result.triggers.some((t) => t === 'high_rpe_trend' || t === 'poor_recovery')).toBe(true);
  });

  it('suggests deload when many exercises stall', () => {
    const plateaus: PlateauAssessment[] = [
      { exerciseId: 'a', exerciseName: 'A', isStalled: true, sessionsWithoutProgress: 4, recommendation: 'deload', rationale: '' },
      { exerciseId: 'b', exerciseName: 'B', isStalled: true, sessionsWithoutProgress: 4, recommendation: 'deload', rationale: '' },
      { exerciseId: 'c', exerciseName: 'C', isStalled: true, sessionsWithoutProgress: 5, recommendation: 'deload', rationale: '' },
    ];
    const result = computeAutoregulation([], plateaus);
    expect(result.suggestDeload).toBe(true);
  });

  it('allows volume increase on strong progress', () => {
    const feedbacks = [
      feedback(5, 4, 'good'),
      feedback(5, 4, 'good'),
      feedback(5, 3, 'good'),
    ];
    const result = computeAutoregulation(feedbacks, []);
    expect(result.volumeChange).toBeGreaterThan(0);
    expect(result.triggers).toContain('strong_progress');
  });

  it('keeps current plan with no data', () => {
    const result = computeAutoregulation([], []);
    expect(result.volumeChange).toBe(0);
  });
});

describe('block transition recommendation', () => {
  it('resets to conservative on pain', () => {
    const rec = recommendBlockTransition([feedback(7, 2, 'okay', ['lower_back'])], [], 'moderate');
    expect(rec.recommendation).toBe('deload_reset');
    expect(rec.volumeDirectionTarget).toBe('conservative');
  });

  it('progresses on strong recovery', () => {
    const rec = recommendBlockTransition(
      [feedback(5, 4, 'good'), feedback(5, 4, 'good'), feedback(5, 3, 'good')],
      [],
      'conservative',
    );
    expect(rec.recommendation).toBe('progress');
    expect(rec.volumeDirectionTarget).toBe('moderate');
  });

  it('maintains when signals are neutral', () => {
    const rec = recommendBlockTransition([], [], 'moderate');
    expect(rec.recommendation).toBe('maintain');
  });
});
