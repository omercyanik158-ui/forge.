import type { AssembledDay } from './aiProgramAssembly';
import type { SessionVolumeBlueprint } from './aiProgramVolume';
import type { AIProgramExperience, AIProgramGoal } from './aiProgram';

/**
 * Faz 7 — Progression & Fatigue
 *
 * Faz 6'nın tek haftalık gün listesini çok-haftalı bir bloğa dönüştürür.
 * createWeeks()'in (programCatalog.ts) yerini alır: blanket linear RIR düşürme
 * yerine, effort ceiling, progression archetype ve deload cadence ile
 * bireyselleştirilmiş ilerleme uygular.
 *
 * Constitution: ilerleme ölçülü ve sürdürülebilirdir. Reaktif autoregülasyon
 * (Faz 10) gelene kadar sadece zamanlanmış deload kullanılır.
 */

export type ProgressionWeek = {
  weekIndex: number;
  title: string;
  guidance: string;
  days: AssembledDay[];
  totalWeeklySets: number;
  isDeload: boolean;
  /** RIR kayması (negatif = daha agresif). */
  rirDelta: number;
  /** Hacim çarpanı (1.0 = baseline, 0.6 = deload). */
  volumeFactor: number;
};

export type FatigueModelSnapshot = {
  weeklyVolumeTrend: { weekIndex: number; totalSets: number; isDeload: boolean }[];
  peakWeek: number;
  deloadWeeks: number[];
  assumptions: string[];
};

export type ProgressionPlan = {
  weeks: ProgressionWeek[];
  weekCount: number;
  deloadWeeks: number[];
  fatigueModel: FatigueModelSnapshot;
};

export type ProgressionEngineInput = {
  baseDays: AssembledDay[];
  effort: SessionVolumeBlueprint['effort'];
  experience: AIProgramExperience;
  goal: AIProgramGoal;
};
