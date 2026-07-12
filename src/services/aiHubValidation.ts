import type { FoodAnalysisResult, PhysiqueAnalysisResult } from '@/types/aiHub';

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function cleanText(value: unknown, fallback: string, maxLength = 600): string {
  if (typeof value !== 'string') return fallback;
  const cleaned = value.trim().replace(/\s+/g, ' ');
  return cleaned ? cleaned.slice(0, maxLength) : fallback;
}

function cleanNumber(value: unknown, minimum: number, maximum: number): number {
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(number)) return minimum;
  return Math.round(Math.min(maximum, Math.max(minimum, number)) * 10) / 10;
}

export function parseFoodAnalysisResult(value: unknown): FoodAnalysisResult {
  if (!isRecord(value)) throw new Error('INVALID_FOOD_RESULT');

  return {
    yemekAdi: cleanText(value.yemekAdi, 'Tanımlanamayan yemek', 120),
    porsiyon: cleanText(value.porsiyon, '1 porsiyon', 80),
    kalori: cleanNumber(value.kalori, 0, 5000),
    protein: cleanNumber(value.protein, 0, 500),
    karbonhidrat: cleanNumber(value.karbonhidrat, 0, 1000),
    yag: cleanNumber(value.yag, 0, 500),
    guvenPuani: cleanNumber(value.guvenPuani, 0, 100),
    aciklama: cleanText(
      value.aciklama,
      'Değerler fotoğrafa dayalı yaklaşık tahminlerdir.',
      500,
    ),
  };
}

export function parsePhysiqueAnalysisResult(value: unknown): PhysiqueAnalysisResult {
  if (!isRecord(value)) throw new Error('INVALID_PHYSIQUE_RESULT');

  const rawRegions = Array.isArray(value.eksikBolgeler) ? value.eksikBolgeler : [];
  const rawExercises = Array.isArray(value.odaklanmasiGerekenHareketler)
    ? value.odaklanmasiGerekenHareketler
    : [];

  return {
    generalDurum: cleanText(value.generalDurum, 'Görsel değerlendirme tamamlandı.', 900),
    eksikBolgeler: rawRegions
      .map((region) => cleanText(region, '', 80))
      .filter(Boolean)
      .slice(0, 6),
    odaklanmasiGerekenHareketler: rawExercises
      .filter(isRecord)
      .map((exercise) => ({
        hareketAdi: cleanText(exercise.hareketAdi, '', 100),
        neden: cleanText(exercise.neden, '', 280),
      }))
      .filter((exercise) => exercise.hareketAdi && exercise.neden)
      .slice(0, 6),
    tahminiYagOrani: cleanNumber(value.tahminiYagOrani, 2, 60),
    kasKutlesiYorumu: cleanText(value.kasKutlesiYorumu, 'Kas kütlesi görünümü değerlendirilemedi.', 700),
    guvenPuani: cleanNumber(value.guvenPuani, 0, 100),
    pozKalitesiYorumu: cleanText(
      value.pozKalitesiYorumu,
      'Sonuç, ışık ve poz koşullarından etkilenebilir.',
      400,
    ),
  };
}
