import type { AIProgramGoal, AIProgramPainLimitation, AIProgramEquipmentKey } from './aiProgram';
import type { AIProgramSplitKey } from './aiProgramDecision';
import type { ExerciseCategory, MovementPattern, PriorityMuscleBucket } from './exerciseKB';
import type { SessionVolumeBlueprint } from './aiProgramVolume';

/**
 * Faz 6 — Selection & Assembly Engine
 *
 * Bu faz, Faz 4 (KB) ve Faz 5 (volume blueprint) çıktılarını birleştirerek
 * her antrenman günü için somut hareket listesi üretir. ProgramExercisePrescription
 * ile uyumlu ama henüz çok-haftalı ilerleme içermiyor (o Faz 7'nin işi).
 *
 * Constitution: seçim deterministik ve açıklanabilirdir. Her hareket bir
 * "neden" (why) taşır. Aynı pattern'den gereksiz tekrar önlenir (redundancy).
 */

export type AssembledExercise = {
  exerciseId: string;
  sets: number;
  reps: number;
  repLabel: string;
  restSeconds: number;
  rir: number;
  alternatives: string[];
  /** Bu hareketin seçilme nedeni (açıklanabilirlik). */
  why: string;
  category: ExerciseCategory;
  pattern: MovementPattern;
  primaryBucket: PriorityMuscleBucket;
};

export type AssembledDay = {
  dayIndex: number;
  title: string;
  exercises: AssembledExercise[];
  totalSets: number;
  estimatedDurationMin: number;
  bucketsCovered: PriorityMuscleBucket[];
  notes?: string[];
};

export type SessionAssemblyPlan = {
  split: AIProgramSplitKey;
  days: AssembledDay[];
  selectionNotes: string[];
  warnings: string[];
};

export type AssemblyEngineInput = {
  split: AIProgramSplitKey;
  recommendedTrainingDays: number;
  volumeBlueprint: SessionVolumeBlueprint;
  availableEquipment: AIProgramEquipmentKey[];
  limitations: AIProgramPainLimitation[];
  goal: AIProgramGoal;
  sex?: 'male' | 'female';
};
