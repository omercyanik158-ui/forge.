import { describe, expect, it } from 'vitest';
import { compareFood, comparePhysique } from '@/services/aiHubComparison';
import { extractGramsFromPortion, scaleFoodAnalysisResult } from '@/services/aiHubFoodScaling';
import { parseFoodAnalysisResult, parsePhysiqueAnalysisResult } from '@/services/aiHubValidation';
import type { FoodAnalysisLog, PhysiqueAnalysisLog } from '@/types/aiHub';

describe('AI Hub result validation', () => {
  it('clamps unsafe food values and trims output', () => {
    const result = parseFoodAnalysisResult({
      yemekAdi: '  Tavuklu pilav  ',
      porsiyon: '1 tabak',
      kalori: 9000,
      protein: -2,
      karbonhidrat: 80,
      yag: 20,
      guvenPuani: 120,
      aciklama: ' Yaklaşık değer. ',
    });

    expect(result.yemekAdi).toBe('Tavuklu pilav');
    expect(result.kalori).toBe(5000);
    expect(result.protein).toBe(0);
    expect(result.guvenPuani).toBe(100);
  });

  it('limits physique arrays and normalizes numbers', () => {
    const result = parsePhysiqueAnalysisResult({
      generalDurum: 'Dengeli görünüm',
      eksikBolgeler: ['Omuz', 'Sırt', 'Bacak', 'Göğüs', 'Kol', 'Karın', 'Kalça'],
      odaklanmasiGerekenHareketler: [{ hareketAdi: 'Row', neden: 'Sırt odağı' }],
      tahminiYagOrani: 90,
      kasKutlesiYorumu: 'Orta',
      guvenPuani: 75,
      pozKalitesiYorumu: 'Işık yeterli',
    });

    expect(result.eksikBolgeler).toHaveLength(6);
    expect(result.tahminiYagOrani).toBe(60);
  });
});

describe('AI Hub text comparisons', () => {
  it('compares food macros', () => {
    const base = {
      id: '1', type: 'food' as const, createdAt: '2026-01-02', primaryImageUri: 'file://one',
      result: { yemekAdi: 'A', porsiyon: '1', kalori: 500, protein: 30, karbonhidrat: 50, yag: 20, guvenPuani: 80, aciklama: '' },
    } satisfies FoodAnalysisLog;
    const previous = {
      ...base, id: '2', createdAt: '2026-01-01',
      result: { ...base.result, kalori: 400, protein: 25 },
    } satisfies FoodAnalysisLog;

    expect(compareFood(base, previous)).toMatchObject({ calorieDelta: 100, proteinDelta: 5 });
  });

  it('finds changed physique focus regions', () => {
    const current = {
      id: '1', type: 'physique' as const, createdAt: '2026-01-02', primaryImageUri: 'front', secondaryImageUri: 'back',
      result: { generalDurum: '', eksikBolgeler: ['Omuz'], odaklanmasiGerekenHareketler: [], tahminiYagOrani: 18, kasKutlesiYorumu: '', guvenPuani: 80, pozKalitesiYorumu: '' },
    } satisfies PhysiqueAnalysisLog;
    const previous = {
      ...current, id: '2', createdAt: '2026-01-01',
      result: { ...current.result, eksikBolgeler: ['Omuz', 'Sırt'], tahminiYagOrani: 20 },
    } satisfies PhysiqueAnalysisLog;

    expect(comparePhysique(current, previous)).toMatchObject({ bodyFatDelta: -2, resolvedRegions: ['Sırt'] });
  });
});

describe('AI Hub food scaling', () => {
  it('extracts grams from common portion labels', () => {
    expect(extractGramsFromPortion('225 g')).toBe(225);
    expect(extractGramsFromPortion('2 plates')).toBeNull();
    expect(extractGramsFromPortion('180')).toBe(180);
  });

  it('rescales macros when the total grams change', () => {
    const scaled = scaleFoodAnalysisResult(
      {
        yemekAdi: 'Tavuk',
        porsiyon: '100 g',
        kalori: 165,
        protein: 31,
        karbonhidrat: 0,
        yag: 3.6,
        guvenPuani: 88,
        aciklama: 'Örnek',
      },
      250,
    );

    expect(scaled.porsiyon).toBe('250 g');
    expect(scaled.kalori).toBe(412.5);
    expect(scaled.protein).toBe(77.5);
    expect(scaled.yag).toBe(9);
  });
});
