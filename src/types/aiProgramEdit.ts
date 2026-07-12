import type { AIProgramEquipmentKey, AIProgramPainLimitation } from './aiProgram';

/**
 * Faz 9 (tam) — Editing, Regenerate, Program History/Evolution
 *
 * Bu faz, üretilen AI programının üzerinde güvenli düzenleme yapma ve blok
 * bazlı evrim (lineage) sağlar. Kullanıcı bir hareketi değiştirebilir,
 * set/rep/rir ayarlayabilir, hareket silebilir/yeniden sıralayabilir.
 * Guardrail'ler güvenlik (pain/equipment) ve bütünlük (gün boş değil)
 * kurallarını uygular.
 *
 * Constitution: düzenleme güvenlik kurallarını esnetemez. Bir düzenleme
 * pain-safety'yi ihlal ederse uygulanır ama warning verilir; kullanıcı
 * bilinçli karar verir.
 */

export type EditOperation =
  | {
      type: 'replaceExercise';
      weekIndex: number;
      dayIndex: number;
      exerciseIndex: number;
      newExerciseId: string;
    }
  | {
      type: 'updatePrescription';
      weekIndex: number;
      dayIndex: number;
      exerciseIndex: number;
      sets?: number;
      reps?: number;
      rir?: number;
    }
  | {
      type: 'removeExercise';
      weekIndex: number;
      dayIndex: number;
      exerciseIndex: number;
    }
  | {
      type: 'reorderExercise';
      weekIndex: number;
      dayIndex: number;
      fromIndex: number;
      toIndex: number;
    };

export type EditContext = {
  availableEquipment: AIProgramEquipmentKey[];
  limitations: AIProgramPainLimitation[];
};

export type EditResult = {
  plan: import('./aiProgramPlan').AIProgramPlan;
  applied: boolean;
  warnings: string[];
  error?: string;
};

export type BlockTransition = {
  fromPlanId: string;
  toPlanId: string;
  volumeAdjustmentFactor: number;
  rationale: string;
  createdAt: string;
};

export type ProgramLineage = {
  planId: string;
  parentId?: string;
  transition?: BlockTransition;
};
