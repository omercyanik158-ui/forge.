import type { FoodAnalysisResult } from '@/types/aiHub';

const DEFAULT_SCALING_BASE_GRAMS = 100;
const GRAM_PATTERN = /(\d+(?:[.,]\d+)?)\s*(g|gr|gram|grams)\b/i;

function roundFoodMetric(value: number): number {
  return Math.round(value * 10) / 10;
}

export function extractGramsFromPortion(portion: string): number | null {
  const match = portion.match(GRAM_PATTERN);
  if (match) {
    const parsed = Number(match[1].replace(',', '.'));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  const trimmed = portion.trim();
  if (!trimmed || /porsiyon|serving|tabak|plate/i.test(trimmed)) return null;
  const fallback = Number(trimmed.replace(',', '.'));
  return Number.isFinite(fallback) && fallback >= 20 && fallback <= 2000 ? fallback : null;
}

export function formatGramsLabel(grams: number): string {
  const rounded = roundFoodMetric(grams);
  return Number.isInteger(rounded) ? `${rounded} g` : `${rounded.toFixed(1).replace(/\.0$/, '')} g`;
}

export function scaleFoodAnalysisResult(
  result: FoodAnalysisResult,
  nextGrams: number,
  previousGrams?: number | null,
): FoodAnalysisResult {
  if (!Number.isFinite(nextGrams) || nextGrams <= 0) return result;

  const detectedGrams = extractGramsFromPortion(result.porsiyon);
  const baselineGrams =
    previousGrams && Number.isFinite(previousGrams) && previousGrams > 0
      ? previousGrams
      : detectedGrams ?? DEFAULT_SCALING_BASE_GRAMS;
  const ratio = nextGrams / baselineGrams;

  return {
    ...result,
    porsiyon: formatGramsLabel(nextGrams),
    kalori: Math.max(0, roundFoodMetric(result.kalori * ratio)),
    protein: Math.max(0, roundFoodMetric(result.protein * ratio)),
    karbonhidrat: Math.max(0, roundFoodMetric(result.karbonhidrat * ratio)),
    yag: Math.max(0, roundFoodMetric(result.yag * ratio)),
  };
}
