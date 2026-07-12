import type { AIProgramDecisionContext } from './aiProgram';
import type { AIProgramDecisionBlueprint } from './aiProgramDecision';
import type { SessionVolumeBlueprint } from './aiProgramVolume';
import type { AssembledExercise, SessionAssemblyPlan } from './aiProgramAssembly';
import type { ProgressionPlan } from './aiProgramProgression';
import type { WarmupItem } from '@/types';

/**
 * Faz 8 — Program Orchestration, Validation & Explainability
 *
 * Bu faz, Faz 4-7 çıktılarını tek bir çalıştırılabilir AIProgramPlan'a
 * birleştirir. AIProgramPlan, mevcut Program/ProgramPlan tipinden AYRIDIR
 * (kullanıcının kararı: AI programları ayrı saklanır). Session player'ın
 * beklediği alanları taşır ama AI-specific metadata ile zenginleştirilmiştir.
 *
 * Constitution: her çıktı açıklanabilirdir; program neden seçildiği
 * (explanation artifact) ile birlikte gelir.
 */

export type AIGeneratedExercise = AssembledExercise & {
  weekIndex: number;
  dayIndex: number;
  programDayId: string;
  isDeloadWeek: boolean;
};

export type AIGeneratedDay = {
  programDayId: string;
  weekIndex: number;
  dayIndex: number;
  title: string;
  exercises: AIGeneratedExercise[];
  totalSets: number;
  estimatedDurationMin: number;
};

/**
 * AI programı için çalıştırılabilir bir antrenman günü. Session player
 * (program-session.tsx) bu yapıyı ProgramDay'e benzer şekilde tüketir,
 * ama AI programları ayrı bir tip altında saklanır.
 */
export type AIDayPrescription = {
  id: string;
  weekIndex: number;
  dayIndex: number;
  title: string;
  subtitle: string;
  durationMin: number;
  difficulty: string;
  totalSets: number;
  warmup?: WarmupItem[];
  exercises: {
    exerciseId: string;
    sets: number;
    reps: number;
    repLabel: string;
    restSeconds: number;
    rir: number;
    alternatives: string[];
  }[];
  exerciseIds: string[];
  notes: string;
};

export type AIGeneratedWeek = {
  weekIndex: number;
  title: string;
  guidance: string;
  days: AIDayPrescription[];
  isDeload: boolean;
};

export type AIProgramPlan = {
  id: string;
  version: 1;
  title: string;
  subtitle: string;
  generatedAt: string;
  /** Bir önceki bloktan türetildiyse onun id'si (lineage). */
  parentId?: string;
  daysPerWeek: number;
  weekCount: number;
  trainingStyle: string;
  goal: string;
  difficultyLevel: string;
  weeks: AIGeneratedWeek[];
  /** Açıklama artifacti (neden bu program). */
  explanation: AIProgramExplanation;
  /** Programın geçerlilik durumu (validator çıktısı). */
  validation: AIProgramValidationResult;
  /** Üretimde kullanılan karar/motor çıktıları (debug + audit). */
  sourceBlueprint: AIProgramDecisionBlueprint;
  sourceVolume: SessionVolumeBlueprint;
  sourceAssembly: SessionAssemblyPlan;
  sourceProgression: ProgressionPlan;
  /** Faz 9'un history/evolution için sakladığı kaynak context snapshot'ı. */
  sourceContextSummary: {
    entryPath: string;
    mainGoal: string;
    experience: string;
    recoveryQuality: string;
    priorityMuscles: string[];
    painLimitations: string[];
    physiqueAnalysisUsed: boolean;
    confidence: string;
  };
};

export type AIProgramExplanation = {
  headline: string;
  whyThisPlan: string[];
  structureRationale: string[];
  volumeRationale: string[];
  selectionRationale: string[];
  progressionRationale: string[];
  safetyNotes: string[];
  uncertaintyNotes: string[];
  assumptions: string[];
};

export type AIProgramValidationIssue = {
  severity: 'error' | 'warning';
  code: string;
  message: string;
  location?: string;
};

export type AIProgramValidationResult = {
  isValid: boolean;
  issues: AIProgramValidationIssue[];
};

export type OrchestrationInput = {
  draftId: string;
  context: AIProgramDecisionContext;
  blueprint: AIProgramDecisionBlueprint;
};

export type OrchestrationOutput = {
  plan: AIProgramPlan;
  volumeBlueprint: SessionVolumeBlueprint;
  assemblyPlan: SessionAssemblyPlan;
  progressionPlan: ProgressionPlan;
  validation: AIProgramValidationResult;
  explanation: AIProgramExplanation;
};
