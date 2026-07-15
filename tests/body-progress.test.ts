import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadBodyProgress } from '@/services/bodyProgress';
import { getLogs } from '@/services/storageService';
import { loadStrengthProgress } from '@/services/strengthProgress';
import { loadCoachAdjustments } from '@/services/coachAdjustmentStore';
import type { PhysiqueAnalysisLog } from '@/types/aiHub';

vi.mock('@/services/storageService', () => ({
  getLogs: vi.fn(),
}));

vi.mock('@/services/strengthProgress', () => ({
  loadStrengthProgress: vi.fn(),
}));

vi.mock('@/services/coachAdjustmentStore', () => ({
  loadCoachAdjustments: vi.fn(),
}));

const getLogsMock = vi.mocked(getLogs);
const loadStrengthProgressMock = vi.mocked(loadStrengthProgress);
const loadCoachAdjustmentsMock = vi.mocked(loadCoachAdjustments);

function physiqueLog(
  id: string,
  createdAt: string,
  eksikBolgeler: string[],
  tahminiYagOrani: number,
  guvenPuani = 82,
): PhysiqueAnalysisLog {
  return {
    id,
    type: 'physique',
    createdAt,
    primaryImageUri: 'front',
    secondaryImageUri: 'back',
    result: {
      generalDurum: 'Dengeli',
      eksikBolgeler,
      odaklanmasiGerekenHareketler: [],
      tahminiYagOrani,
      kasKutlesiYorumu: 'Orta',
      guvenPuani,
      pozKalitesiYorumu: 'Net',
    },
  };
}

describe('Body progress', () => {
  beforeEach(() => {
    getLogsMock.mockReset();
    loadStrengthProgressMock.mockReset();
    loadCoachAdjustmentsMock.mockReset();
    loadCoachAdjustmentsMock.mockResolvedValue([]);
  });

  it('builds physique score trend while keeping strength separate', async () => {
    getLogsMock.mockResolvedValue([
      physiqueLog('latest', '2026-07-15T10:00:00.000Z', ['Omuz'], 17, 88),
      physiqueLog('first', '2026-07-01T10:00:00.000Z', ['Omuz', 'Sırt'], 19, 84),
    ]);
    loadStrengthProgressMock.mockResolvedValue({
      totalWorkingSets: 4,
      personalRecordCount: 1,
      exercises: [
        {
          exerciseId: 'bench_press',
          exerciseName: 'Bench Press',
          muscleGroup: 'Göğüs',
          records: [
            {
              id: 'r1',
              workoutId: 'w1',
              exerciseId: 'bench_press',
              exerciseName: 'Bench Press',
              completedAt: '2026-07-15T10:00:00.000Z',
              kg: 80,
              reps: 8,
              volumeKg: 640,
              estimatedOneRepMaxKg: 101.3,
            },
          ],
          firstRecord: {
            id: 'r0',
            workoutId: 'w0',
            exerciseId: 'bench_press',
            exerciseName: 'Bench Press',
            completedAt: '2026-07-01T10:00:00.000Z',
            kg: 75,
            reps: 8,
            volumeKg: 600,
            estimatedOneRepMaxKg: 95,
          },
          latestRecord: {
            id: 'r1',
            workoutId: 'w1',
            exerciseId: 'bench_press',
            exerciseName: 'Bench Press',
            completedAt: '2026-07-15T10:00:00.000Z',
            kg: 80,
            reps: 8,
            volumeKg: 640,
            estimatedOneRepMaxKg: 101.3,
          },
          comparisonRecord: {
            id: 'r0',
            workoutId: 'w0',
            exerciseId: 'bench_press',
            exerciseName: 'Bench Press',
            completedAt: '2026-07-01T10:00:00.000Z',
            kg: 75,
            reps: 8,
            volumeKg: 600,
            estimatedOneRepMaxKg: 95,
          },
          personalRecord: {
            id: 'r1',
            workoutId: 'w1',
            exerciseId: 'bench_press',
            exerciseName: 'Bench Press',
            completedAt: '2026-07-15T10:00:00.000Z',
            kg: 80,
            reps: 8,
            volumeKg: 640,
            estimatedOneRepMaxKg: 101.3,
          },
          weightChangeKg: 5,
          repChange: 0,
          estimatedStrengthChangeKg: 6,
          estimatedStrengthChangePct: 8,
        },
      ],
    });

    const progress = await loadBodyProgress();

    expect(progress.physiqueScores).toHaveLength(2);
    expect(progress.latestPhysiqueScore?.resolvedFocusAreas).toEqual(['Sırt']);
    expect(progress.scoreDelta).not.toBeNull();
    expect(progress.topStrengthProgress[0]?.exerciseName).toBe('Bench Press');
    expect(progress.coachAdjustments).toEqual([]);
  });

  it('reads V1 and V2 physique logs together for score history', async () => {
    const v2 = physiqueLog('v2', '2026-07-15T10:00:00.000Z', ['Legacy'], 18, 86);
    v2.result = {
      ...v2.result,
      analysisVersion: 2,
      coachSummary: 'Yan omuz ve lat odağı takip ediliyor.',
      eksikBolgeler: ['Yan omuz', 'Lat genişliği'],
      priorityRoadmap: [
        { rank: 1, targetArea: 'Yan omuz', targetMuscle: 'shoulders', aestheticImpact: 'very_high', reason: 'V-taper görünümünü etkiler.', exerciseEmphasis: ['Lateral Raise'], volumeSignal: 'moderate_high' },
        { rank: 2, targetArea: 'Lat genişliği', targetMuscle: 'lats', aestheticImpact: 'high', reason: 'Üst gövde genişliğini etkiler.', exerciseEmphasis: ['Lat Pulldown'], volumeSignal: 'moderate' },
      ],
      symmetry: [{ title: 'Omuz seviyesi', description: 'Fotoğrafta hafif fark görünüyor.', confidence: 'medium' }],
      proportion: [{ title: 'Omuz-bel oranı', description: 'Geliştirilebilir görünüyor.', confidence: 'medium' }],
      posture: [{ title: 'Omuz pozisyonu', description: 'Görselde öne kapanma eğilimi var.', confidence: 'medium' }],
      programSignals: {
        focusMuscles: ['shoulders', 'lats'],
        volumeBias: 'moderate_high',
        splitBiasHint: 'posterior_focus',
        exerciseEmphasis: ['Lateral Raise', 'Lat Pulldown'],
        postureCautions: ['rounded_shoulders_visual'],
        confidenceLevel: 'high',
      },
    };
    getLogsMock.mockResolvedValue([
      v2,
      physiqueLog('v1', '2026-07-01T10:00:00.000Z', ['Yan omuz', 'Lat genişliği', 'Baldır'], 20, 80),
    ]);
    loadStrengthProgressMock.mockResolvedValue({
      totalWorkingSets: 0,
      personalRecordCount: 0,
      exercises: [],
    });

    const progress = await loadBodyProgress();

    expect(progress.physiqueScores).toHaveLength(2);
    expect(progress.latestPhysiqueScore?.focusAreas).toEqual(['Yan omuz', 'Lat genişliği']);
    expect(progress.latestPhysiqueScore?.score).toBeGreaterThan(0);
    expect(progress.topStrengthProgress).toEqual([]);
  });
});
