import type { FoodAnalysisLog, PhysiqueAnalysisLog } from '@/types/aiHub';

export type PhysiqueComparison = {
  bodyFatDelta: number;
  confidenceDelta: number;
  resolvedRegions: string[];
  newFocusRegions: string[];
  summary: { tr: string; en: string };
};

export type FoodComparison = {
  calorieDelta: number;
  proteinDelta: number;
  summary: { tr: string; en: string };
};

function normalizedSet(values: string[]): Set<string> {
  return new Set(values.map((value) => value.trim().toLocaleLowerCase('tr-TR')));
}

export function comparePhysique(current: PhysiqueAnalysisLog, previous: PhysiqueAnalysisLog): PhysiqueComparison {
  const currentRegions = normalizedSet(current.result.eksikBolgeler);
  const previousRegions = normalizedSet(previous.result.eksikBolgeler);
  const resolvedRegions = previous.result.eksikBolgeler.filter(
    (region) => !currentRegions.has(region.trim().toLocaleLowerCase('tr-TR')),
  );
  const newFocusRegions = current.result.eksikBolgeler.filter(
    (region) => !previousRegions.has(region.trim().toLocaleLowerCase('tr-TR')),
  );
  const bodyFatDelta = Math.round((current.result.tahminiYagOrani - previous.result.tahminiYagOrani) * 10) / 10;
  const confidenceDelta = Math.round((current.result.guvenPuani - previous.result.guvenPuani) * 10) / 10;

  return {
    bodyFatDelta,
    confidenceDelta,
    resolvedRegions,
    newFocusRegions,
    summary: bodyFatDelta === 0
      ? { tr: 'Görsel yağ oranı tahmini önceki analizle aynı seviyede.', en: 'The visual body-fat estimate is level with the previous analysis.' }
      : bodyFatDelta < 0
        ? { tr: `Görsel yağ oranı tahmini önceki analize göre ${Math.abs(bodyFatDelta)} puan daha düşük.`, en: `The visual body-fat estimate is ${Math.abs(bodyFatDelta)} points lower than the previous analysis.` }
        : { tr: `Görsel yağ oranı tahmini önceki analize göre ${bodyFatDelta} puan daha yüksek.`, en: `The visual body-fat estimate is ${bodyFatDelta} points higher than the previous analysis.` },
  };
}

export function compareFood(current: FoodAnalysisLog, previous: FoodAnalysisLog): FoodComparison {
  const calorieDelta = Math.round(current.result.kalori - previous.result.kalori);
  const proteinDelta = Math.round((current.result.protein - previous.result.protein) * 10) / 10;
  return {
    calorieDelta,
    proteinDelta,
    summary: {
      tr: `Önceki kayda göre ${Math.abs(calorieDelta)} kcal ${calorieDelta >= 0 ? 'daha yüksek' : 'daha düşük'}, protein farkı ${proteinDelta >= 0 ? '+' : ''}${proteinDelta} g.`,
      en: `${Math.abs(calorieDelta)} kcal ${calorieDelta >= 0 ? 'higher' : 'lower'} than the previous entry, with a ${proteinDelta >= 0 ? '+' : ''}${proteinDelta} g protein difference.`,
    },
  };
}
