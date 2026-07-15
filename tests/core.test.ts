import { describe, expect, it } from 'vitest';
import { calorieGoal, navyBodyFat } from '../src/services/calculations';
import { summarizeCycleTracking } from '../src/services/cycleTracking';
import { dateKey, timestampForDateKey } from '../src/services/dateUtils';
import { analyzeWeeklyTraining } from '../src/services/trainingAnalysis';
import type { CycleTracking, UserProfile, WorkoutLog } from '../src/types';

const profile: UserProfile = {
  name: 'Test',
  gender: 'male',
  age: 30,
  weightKg: 80,
  heightCm: 180,
  activityLevel: 'moderate',
  neckCm: 40,
  waistCm: 90,
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('hesaplamalar', () => {
  it('hedefe göre kalori açığı ve fazlası uygular', () => {
    const maintain = calorieGoal({ ...profile, goalType: 'maintain' });
    expect(calorieGoal({ ...profile, goalType: 'loss' })).toBe(maintain - 500);
    expect(calorieGoal({ ...profile, goalType: 'gain' })).toBe(maintain + 500);
  });

  it('geçersiz çevre ölçümünde yağ oranı üretmez', () => {
    expect(navyBodyFat({ ...profile, waistCm: 35, neckCm: 40 })).toBeNull();
  });
});

describe('yerel tarihler', () => {
  it('seçili günü saati koruyarak ISO zamana çevirir', () => {
    const clock = new Date(2026, 5, 30, 14, 25, 10);
    expect(dateKey(new Date(timestampForDateKey('2026-06-12', clock)))).toBe('2026-06-12');
  });
});

describe('antrenman analizi', () => {
  it('çok hareketli seansta setleri gerçek egzersizlerine yazar', () => {
    const completedAt = new Date().toISOString();
    const log: WorkoutLog = {
      id: 'multi',
      title: 'Üst vücut',
      durationMin: 45,
      kcal: 250,
      difficulty: 'Orta',
      completedAt,
      source: 'custom',
      exerciseIds: ['csv-bench-press-barbell', 'csv-barbell-row'],
      setEntries: [
        ...Array.from({ length: 4 }, (_, order) => ({ order: order + 1, kind: 'working' as const, exerciseId: 'csv-bench-press-barbell', kg: 60, reps: 8, completedAt })),
        { order: 5, kind: 'working', exerciseId: 'csv-barbell-row', kg: 50, reps: 8, completedAt },
      ],
    };
    const analysis = analyzeWeeklyTraining([log]);
    expect(analysis.regionResults.find((item) => item.region === 'Göğüs')?.sets).toBe(4);
    expect(analysis.regionResults.find((item) => item.region === 'Sırt')?.sets).toBe(1);
  });
});

describe('döngü takibi', () => {
  it('bir sonraki dönem ve faz özetini hesaplar', () => {
    const tracking: CycleTracking = {
      lastPeriodStartDate: '2026-06-01',
      cycleLengthDays: 28,
      periodLengthDays: 5,
      updatedAt: '2026-06-01T12:00:00.000Z',
    };

    const summary = summarizeCycleTracking(tracking, '2026-06-15');
    expect(summary).not.toBeNull();
    expect(summary).toMatchObject({
      cycleDay: 15,
      currentCycleStartDate: '2026-06-01',
      nextPeriodStartDate: '2026-06-29',
      ovulationDate: '2026-06-14',
      daysUntilNextPeriod: 14,
      phase: 'luteal',
    });
  });
});
