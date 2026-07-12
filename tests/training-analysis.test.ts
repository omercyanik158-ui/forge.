import { describe, expect, it } from 'vitest';
import { analyzeWeeklyTraining } from '@/services/trainingAnalysis';
import type { WorkoutLog, WorkoutSetLogEntry } from '@/types';

const referenceDate = new Date(2026, 5, 15, 12, 0, 0);
const completedAt = referenceDate.toISOString();

function makeSetEntries(count: number): WorkoutSetLogEntry[] {
  return Array.from({ length: count }, (_, index) => ({
    order: index + 1,
    kind: 'working' as const,
    kg: 60,
    reps: 8,
    completedAt,
  }));
}

function makeLog(overrides: Partial<WorkoutLog> & Pick<WorkoutLog, 'id'>): WorkoutLog {
  return {
    title: 'Antrenman',
    durationMin: 30,
    kcal: 200,
    difficulty: 'Orta',
    completedAt,
    source: 'custom',
    ...overrides,
  };
}

describe('antrenman analizi yeterlilik', () => {
  it('kayıt yoksa empty döner', () => {
    expect(analyzeWeeklyTraining([], referenceDate).sufficiency).toBe('empty');
  });

  it('1–2 kayıtta limited döner', () => {
    expect(
      analyzeWeeklyTraining([makeLog({ id: '1', muscleGroups: ['Göğüs'] })], referenceDate).sufficiency,
    ).toBe('limited');
    expect(
      analyzeWeeklyTraining(
        [makeLog({ id: '1', muscleGroups: ['Göğüs'] }), makeLog({ id: '2', muscleGroups: ['Sırt'] })],
        referenceDate,
      ).sufficiency,
    ).toBe('limited');
  });

  it('3 ve üzeri kayıtta sufficient döner', () => {
    const logs = [
      makeLog({ id: '1', muscleGroups: ['Göğüs'] }),
      makeLog({ id: '2', muscleGroups: ['Sırt'] }),
      makeLog({ id: '3', muscleGroups: ['Bacak'] }),
    ];
    expect(analyzeWeeklyTraining(logs, referenceDate).sufficiency).toBe('sufficient');
  });
});

describe('itiş çekiş dengesi', () => {
  it('dengeli hafta dengeli döner', () => {
    const result = analyzeWeeklyTraining(
      [
        makeLog({ id: 'p', muscleGroups: ['Göğüs'] }),
        makeLog({ id: 'q', muscleGroups: ['Sırt'] }),
        makeLog({ id: 'l', muscleGroups: ['Bacak'] }),
      ],
      referenceDate,
    );
    expect(result.pplBalance).toBe('dengeli');
  });

  it('bacak kaydı yoksa bacak_dusuk döner', () => {
    const result = analyzeWeeklyTraining(
      [makeLog({ id: 'p', muscleGroups: ['Göğüs'] }), makeLog({ id: 'q', muscleGroups: ['Sırt'] })],
      referenceDate,
    );
    expect(result.pplBalance).toBe('bacak_dusuk');
  });

  it('itiş fazlaysa itis_fazla döner', () => {
    const result = analyzeWeeklyTraining(
      [
        makeLog({ id: 'p', muscleGroups: ['Göğüs'], setEntries: makeSetEntries(12) }),
        makeLog({ id: 'q', muscleGroups: ['Sırt'], setEntries: makeSetEntries(3) }),
        makeLog({ id: 'l', muscleGroups: ['Bacak'], setEntries: makeSetEntries(3) }),
      ],
      referenceDate,
    );
    expect(result.pplBalance).toBe('itis_fazla');
  });

  it('çekiş fazlaysa cekis_fazla döner', () => {
    const result = analyzeWeeklyTraining(
      [
        makeLog({ id: 'p', muscleGroups: ['Göğüs'], setEntries: makeSetEntries(3) }),
        makeLog({ id: 'q', muscleGroups: ['Sırt'], setEntries: makeSetEntries(12) }),
        makeLog({ id: 'l', muscleGroups: ['Bacak'], setEntries: makeSetEntries(3) }),
      ],
      referenceDate,
    );
    expect(result.pplBalance).toBe('cekis_fazla');
  });
});

describe('bölge set hacmi eşikleri', () => {
  function chestStatus(sets: number): string {
    const result = analyzeWeeklyTraining(
      [makeLog({ id: 'g', muscleGroups: ['Göğüs'], setEntries: makeSetEntries(sets) })],
      referenceDate,
    );
    return result.regionResults.find((r) => r.region === 'Göğüs')?.status ?? '';
  }

  it('set kaydı olmayan bölge eksik kalır', () => {
    const result = analyzeWeeklyTraining(
      [makeLog({ id: 's', muscleGroups: ['Sırt'], setEntries: makeSetEntries(3) })],
      referenceDate,
    );
    expect(result.regionResults.find((r) => r.region === 'Göğüs')?.status).toBe('eksik');
  });

  it('eşik sınırları doğru statü üretir', () => {
    expect(chestStatus(3)).toBe('dusuk');
    expect(chestStatus(6)).toBe('dengeli');
    expect(chestStatus(12)).toBe('yeterli');
    expect(chestStatus(18)).toBe('yogun');
  });
});

describe('hafta filtreleme ve fallback', () => {
  it('hafta dışı loglar hariç tutulur', () => {
    const outside = makeLog({ id: 'old', muscleGroups: ['Göğüs'], setEntries: makeSetEntries(12) });
    outside.completedAt = new Date(2026, 4, 15, 12, 0, 0).toISOString();
    const result = analyzeWeeklyTraining([outside], referenceDate);
    expect(result.sufficiency).toBe('empty');
    expect(result.regionResults.find((r) => r.region === 'Göğüs')?.sets).toBe(0);
  });

  it('exerciseIds olmadan muscleGroups fallback yolu bölgeyi sayar', () => {
    const result = analyzeWeeklyTraining(
      [makeLog({ id: 'fb', muscleGroups: ['Omuz'], setEntries: makeSetEntries(6) })],
      referenceDate,
    );
    expect(result.regionResults.find((r) => r.region === 'Omuz')?.sets).toBe(6);
    expect(result.ppl.push).toBe(6);
  });
});
