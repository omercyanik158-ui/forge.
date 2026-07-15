import { describe, expect, it } from 'vitest';
import { buildCoachAdjustment } from '@/services/coachAdjustmentEngine';
import type { ExerciseStrengthProgress } from '@/services/strengthProgress';
import type { SessionFeedback } from '@/types/aiProgramFeedback';

function feedback(
  rpe: number,
  rir: number,
  recovery: SessionFeedback['recoveryNextDay'],
  pain: SessionFeedback['painReported'] = ['none'],
): SessionFeedback {
  return {
    id: `feedback-${rpe}-${rir}-${recovery}`,
    planId: 'plan-1',
    exerciseIds: ['bench'],
    completedAt: new Date().toISOString(),
    perceivedExertion: rpe,
    averageRir: rir,
    painReported: pain,
    recoveryNextDay: recovery,
  };
}

function stalledProgress(id: string): ExerciseStrengthProgress {
  const firstRecord = {
    id: `${id}-first`,
    workoutId: 'w-1',
    exerciseId: id,
    exerciseName: id,
    completedAt: '2026-07-01T10:00:00.000Z',
    kg: 50,
    reps: 8,
    volumeKg: 400,
    estimatedOneRepMaxKg: 63.3,
  };
  const records = [
    firstRecord,
    { ...firstRecord, id: `${id}-second`, workoutId: 'w-2', completedAt: '2026-07-05T10:00:00.000Z' },
    { ...firstRecord, id: `${id}-third`, workoutId: 'w-3', completedAt: '2026-07-09T10:00:00.000Z' },
  ];
  return {
    exerciseId: id,
    exerciseName: id,
    muscleGroup: 'Göğüs',
    records,
    firstRecord,
    latestRecord: records[2]!,
    comparisonRecord: firstRecord,
    personalRecord: firstRecord,
    weightChangeKg: 0,
    repChange: 0,
    estimatedStrengthChangeKg: 0,
    estimatedStrengthChangePct: 0,
  };
}

describe('coach adjustment engine', () => {
  it('reduces volume or intensity when recent sessions are too hard', () => {
    const adjustment = buildCoachAdjustment({
      feedbacks: [feedback(9, 1, 'poor'), feedback(9, 0, 'poor')],
      strengthProgress: [],
    });

    expect(['reduce_volume', 'reduce_intensity']).toContain(adjustment.decision);
    expect(adjustment.reasons).toContain('poor_recovery');
  });

  it('does not progress when pain is reported', () => {
    const adjustment = buildCoachAdjustment({
      feedbacks: [feedback(7, 2, 'okay', ['shoulder'])],
      strengthProgress: [],
    });

    expect(adjustment.decision).toBe('swap_exercise');
    expect(adjustment.painReported).toContain('shoulder');
  });

  it('progresses only when effort is easy and recovery is good', () => {
    const adjustment = buildCoachAdjustment({
      feedbacks: [
        feedback(5, 4, 'good'),
        feedback(5, 4, 'good'),
        feedback(5, 3, 'good'),
      ],
      strengthProgress: [],
    });

    expect(adjustment.decision).toBe('progress');
    expect(adjustment.reasons).toContain('strong_progress');
  });

  it('turns lighter cycle phase into a conservative intensity decision', () => {
    const adjustment = buildCoachAdjustment({
      feedbacks: [],
      strengthProgress: [],
      cycleIntensity: 'lighter',
    });

    expect(adjustment.decision).toBe('reduce_intensity');
    expect(adjustment.reasons).toContain('cycle_lighter');
  });

  it('suggests a repeat or deload when multiple exercises stall', () => {
    const adjustment = buildCoachAdjustment({
      feedbacks: [],
      strengthProgress: [stalledProgress('bench'), stalledProgress('squat')],
    });

    expect(['repeat_week', 'deload']).toContain(adjustment.decision);
    expect(adjustment.reasons).toContain('plateau_detected');
  });
});
