import { describe, expect, it } from 'vitest';
import { summarizeCycleTracking } from '@/services/cycleTracking';
import type { CycleTracking } from '@/types';

const tracking: CycleTracking = {
  lastPeriodStartDate: '2026-06-01',
  cycleLengthDays: 28,
  periodLengthDays: 5,
  updatedAt: '2026-06-01T12:00:00.000Z',
};

describe('döngü özeti fazları', () => {
  it('lastPeriodStartDate yoksa null döner', () => {
    expect(summarizeCycleTracking({ ...tracking, lastPeriodStartDate: null })).toBeNull();
    expect(summarizeCycleTracking({ ...tracking, lastPeriodStartDate: 'gecersiz' })).toBeNull();
  });

  it('menstrüasyon döneminde period fazı verir', () => {
    expect(summarizeCycleTracking(tracking, '2026-06-01')?.phase).toBe('period');
    expect(summarizeCycleTracking(tracking, '2026-06-05')?.phase).toBe('period');
  });

  it('period sonrası folliküler faz verir', () => {
    expect(summarizeCycleTracking(tracking, '2026-06-08')?.phase).toBe('follicular');
  });

  it('fertil pencerede fertile fazı verir', () => {
    expect(summarizeCycleTracking(tracking, '2026-06-10')?.phase).toBe('fertile');
    expect(summarizeCycleTracking(tracking, '2026-06-13')?.phase).toBe('fertile');
  });

  it('ovülasyon gününde ovulation fazı verir', () => {
    expect(summarizeCycleTracking(tracking, '2026-06-14')?.phase).toBe('ovulation');
  });

  it('ovülasyon sonrası luteal fazı verir', () => {
    expect(summarizeCycleTracking(tracking, '2026-06-20')?.phase).toBe('luteal');
  });
});

describe('döngü rollover', () => {
  it('bir sonraki döngüde cycleDay 1 olur ve yeni başlangıç hesaplanır', () => {
    const summary = summarizeCycleTracking(tracking, '2026-06-29');
    expect(summary?.cycleDay).toBe(1);
    expect(summary?.currentCycleStartDate).toBe('2026-06-29');
    expect(summary?.nextPeriodStartDate).toBe('2026-07-27');
    expect(summary?.daysUntilNextPeriod).toBe(28);
  });

  it('daysUntilNextPeriod negatif olmaz', () => {
    expect(summarizeCycleTracking(tracking, '2026-06-28')?.daysUntilNextPeriod).toBe(1);
  });
});

describe('uzunluk clamp', () => {
  it('cycleLengthDays 21–40 dışı değeri 21 tabanına çeker', () => {
    // Girdi 15 → 21'e çekilir; 16. gün (2026-06-16) cycleDay 16 olur (21 günlük döngü)
    const summary = summarizeCycleTracking(
      { ...tracking, cycleLengthDays: 15 },
      '2026-06-16',
    );
    expect(summary?.cycleDay).toBe(16);
  });

  it('cycleLengthDays 40 üstü değeri 40 tavanına çeker', () => {
    // Girdi 50 → 40'a çekilir; 35. gün hâlâ aynı döngüde cycleDay 35 olur
    const summary = summarizeCycleTracking(
      { ...tracking, cycleLengthDays: 50 },
      '2026-07-05',
    );
    expect(summary?.cycleDay).toBe(35);
  });

  it('periodLengthDays 10 üstü değeri 10 tavanına çeker', () => {
    // Girdi 15 → 10'a çekilir; 12. gün artık period değil fertile olur
    const summary = summarizeCycleTracking(
      { ...tracking, periodLengthDays: 15 },
      '2026-06-12',
    );
    expect(summary?.phase).toBe('fertile');
  });

  it('periodLengthDays 2 altı değeri 2 tabanına çeker', () => {
    // Girdi 1 → 2'ye çekilir; 3. gün artık period değil follicular olur
    const summary = summarizeCycleTracking(
      { ...tracking, periodLengthDays: 1 },
      '2026-06-03',
    );
    expect(summary?.phase).toBe('follicular');
  });
});
