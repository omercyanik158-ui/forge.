import type { AIProgramPlan } from '@/types/aiProgramPlan';
import type { BlockTransition, ProgramLineage } from '@/types/aiProgramEdit';
import type { AIProgramVolumeDirection } from '@/types/aiProgramDecision';

/**
 * Faz 9 (tam) — Program History & Evolution
 *
 * Bir antrenman bloğu bittiğinde sonraki blok önerir (lineage). Constitution:
 * ilerleme ölçülü ve sürdürülebilirdir; hacim bir anda zıplamaz.
 */

const VOLUME_LADDER: AIProgramVolumeDirection[] = [
  'conservative',
  'moderate',
  'moderate_high',
  'specialization',
];

export type NextBlockSuggestion = {
  suggestedVolumeDirection: AIProgramVolumeDirection;
  rationale: string;
  volumeAdjustmentFactor: number;
};

/**
 * Mevcut bloğun volume direction'ına göre bir sonraki blok önerisi.
 * Güvenli kademeli ilerleme: bir kademe yukarı, plateau'da sabit,
 * specialization sonrası reset.
 */
export function suggestNextBlock(current: AIProgramPlan): NextBlockSuggestion {
  const currentDirection = current.sourceBlueprint.volumeDirection;
  const currentIndex = VOLUME_LADDER.indexOf(currentDirection);
  const next = VOLUME_LADDER[Math.min(currentIndex + 1, VOLUME_LADDER.length - 1)]!;

  if (currentDirection === 'specialization') {
    return {
      suggestedVolumeDirection: 'moderate',
      rationale: 'Özelleştirme bloğundan sonra toparlanma için hacmi orta seviyeye indirmek daha sürdürülebilir.',
      volumeAdjustmentFactor: 0.85,
    };
  }

  if (currentDirection === 'moderate_high') {
    return {
      suggestedVolumeDirection: 'moderate_high',
      rationale: 'Hacim zaten yüksek bölgede; bir sonraki blok için aynı seviyeyi korumak, toparlanmayı izlemek daha güvenli.',
      volumeAdjustmentFactor: 1.0,
    };
  }

  return {
    suggestedVolumeDirection: next,
    rationale: 'Önceki blok iyi tolere edildiyse bir kademe hacim artışı ölçülü ilerleme sağlar.',
    volumeAdjustmentFactor: 1.1,
  };
}

/**
 * Mevcut bloktan türetilmiş bir sonraki blok planı oluşturur. Klon + lineage
 * metadata. Gerçek hacim/efor üretimi için orkestratör (Faz 8) güncellenmiş
 * context ile tekrar çağrılmalıdır; bu fonksiyon sadece lineage çerçevesini
 * ve placeholder bir sonraki blok verir.
 */
export function createNextBlockLineage(current: AIProgramPlan, suggestion: NextBlockSuggestion): {
  parentId: string;
  volumeDirection: AIProgramVolumeDirection;
  rationale: string;
} {
  return {
    parentId: current.id,
    volumeDirection: suggestion.suggestedVolumeDirection,
    rationale: suggestion.rationale,
  };
}

export function buildLineage(plan: AIProgramPlan): ProgramLineage {
  return {
    planId: plan.id,
    parentId: plan.parentId,
  };
}

export function buildTransition(current: AIProgramPlan, next: AIProgramPlan, suggestion: NextBlockSuggestion): BlockTransition {
  return {
    fromPlanId: current.id,
    toPlanId: next.id,
    volumeAdjustmentFactor: suggestion.volumeAdjustmentFactor,
    rationale: suggestion.rationale,
    createdAt: next.generatedAt,
  };
}
