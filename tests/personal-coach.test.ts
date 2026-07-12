import { describe, expect, it } from 'vitest';
import { applyCycleIntensity, computeCycleIntensity, type CycleAdjustable } from '@/services/personalCoach';
import type { CycleTrackingSummary } from '@/services/cycleTracking';

const baseSummary: CycleTrackingSummary = {
  cycleDay: 1,
  currentCycleStartDate: '2026-06-01',
  nextPeriodStartDate: '2026-06-29',
  daysUntilNextPeriod: 28,
  fertileWindowStartDate: '2026-06-09',
  fertileWindowEndDate: '2026-06-15',
  ovulationDate: '2026-06-14',
  phase: 'period',
};

function summaryWith(phase: CycleTrackingSummary['phase']): CycleTrackingSummary {
  return { ...baseSummary, phase };
}

describe('döngü yoğunluğu hesaplama', () => {
  it('döngü yokken normal döner', () => {
    expect(computeCycleIntensity(null)).toBe('normal');
    expect(computeCycleIntensity(undefined)).toBe('normal');
  });

  it('menstrüasyon ve luteal fazda lighter döner', () => {
    expect(computeCycleIntensity(summaryWith('period'))).toBe('lighter');
    expect(computeCycleIntensity(summaryWith('luteal'))).toBe('lighter');
  });

  it('folliküler, fertil ve ovülasyon fazında strong döner', () => {
    expect(computeCycleIntensity(summaryWith('follicular'))).toBe('strong');
    expect(computeCycleIntensity(summaryWith('fertile'))).toBe('strong');
    expect(computeCycleIntensity(summaryWith('ovulation'))).toBe('strong');
  });
});

describe('döngü yoğunluğu egzersize uygula', () => {
  it('lighter set sayısını azaltır, rir artırır ve dinlenmeyi uzatır', () => {
    const result = applyCycleIntensity({ sets: 4, rir: 2, restSeconds: 60 }, 'lighter');
    expect(result.sets).toBe(3);
    expect(result.rir).toBe(3);
    expect(result.restSeconds).toBe(72);
  });

  it('lighter set sayısı en az 2 olur', () => {
    const result = applyCycleIntensity({ sets: 2, rir: 1, restSeconds: 90 }, 'lighter');
    expect(result.sets).toBe(2);
    expect(result.restSeconds).toBe(108);
  });

  it('lighter rir en fazla 4 olur', () => {
    const result = applyCycleIntensity({ sets: 3, rir: 4 } as CycleAdjustable, 'lighter');
    expect(result.rir).toBe(4);
    expect(result.restSeconds).toBeUndefined();
  });

  it('lighter restSeconds tanımsızsa tanımsız kalır', () => {
    const result = applyCycleIntensity({ sets: 3, rir: 1 } as CycleAdjustable, 'lighter');
    expect(result.restSeconds).toBeUndefined();
  });

  it('strong yalnızca rir düşürür', () => {
    const result = applyCycleIntensity({ sets: 4, rir: 3, restSeconds: 60 }, 'strong');
    expect(result.rir).toBe(2);
    expect(result.sets).toBe(4);
    expect(result.restSeconds).toBe(60);
  });

  it('strong rir en az 1 olur', () => {
    const result = applyCycleIntensity({ sets: 3, rir: 1 }, 'strong');
    expect(result.rir).toBe(1);
  });

  it('normal egzersizi değiştirmeden döner', () => {
    const exercise = { sets: 4, rir: 2, restSeconds: 60 };
    const result = applyCycleIntensity(exercise, 'normal');
    expect(result).toEqual({ sets: 4, rir: 2, restSeconds: 60 });
  });

  it('ek alanları korur', () => {
    const result = applyCycleIntensity(
      { id: 'squat', name: 'Squat', sets: 3, rir: 2, restSeconds: 90 },
      'lighter',
    );
    expect(result).toMatchObject({ id: 'squat', name: 'Squat', sets: 2, rir: 3, restSeconds: 108 });
  });
});
