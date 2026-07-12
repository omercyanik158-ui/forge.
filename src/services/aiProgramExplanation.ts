import type { AIProgramExplanation } from '@/types/aiProgramPlan';
import type { AIProgramDecisionBlueprint } from '@/types/aiProgramDecision';
import type { AIProgramDecisionContext } from '@/types/aiProgram';
import type { SessionVolumeBlueprint } from '@/types/aiProgramVolume';
import type { SessionAssemblyPlan } from '@/types/aiProgramAssembly';
import type { ProgressionPlan } from '@/types/aiProgramProgression';

/**
 * Faz 8 — Explainability Artifact Builder
 *
 * Constitution: her öneri açıklanabilirdir. Bu fonksiyon, motor çıktılarından
 * yapılandırılmış bir açıklama üretir. UI (Faz 9) bunu katmanlı gösterir:
 * headline -> whyThisPlan -> detay başlıkları. LLM (Faz 13) bu artifacti
 * doğal dile çevirir ama mantığı DEĞİL.
 */

export type ExplanationInput = {
  context: AIProgramDecisionContext;
  blueprint: AIProgramDecisionBlueprint;
  volumeBlueprint: SessionVolumeBlueprint;
  assemblyPlan: SessionAssemblyPlan;
  progressionPlan: ProgressionPlan;
};

function formatGoalLabel(goal?: string): string {
  switch (goal) {
    case 'build_muscle':
      return 'kas gelişimi';
    case 'lose_fat':
      return 'yağ kaybı';
    case 'recomposition':
      return 'rekompozisyon';
    case 'strength':
      return 'güç';
    case 'athletic_performance':
      return 'atletik performans';
    case 'return_to_training':
      return 'antrenmana dönüş';
    default:
      return 'genel form';
  }
}

export function buildAIProgramExplanation(input: ExplanationInput): AIProgramExplanation {
  const { context, blueprint, volumeBlueprint, assemblyPlan, progressionPlan } = input;
  const profile = context.userProfile;

  const headline = `${blueprint.recommendedSplitLabel} · ${blueprint.recommendedTrainingDays} gün · ${formatGoalLabel(profile.goal)} odaklı ${progressionPlan.weekCount} haftalık blok`;

  const whyThisPlan = [
    ...blueprint.whyThisPlan.slice(0, 4),
    `Güven seviyesi: ${blueprint.confidence}.`,
  ];

  const structureRationale = [
    ...blueprint.rationale.slice(0, 3),
    `Alternatif olarak ${blueprint.alternativesConsidered
      .slice(1)
      .map((alt) => alt.label)
      .join(', ')} değerlendirildi ama ${blueprint.recommendedSplitLabel} daha iyi uydu.`,
  ];

  const volumeRationale: string[] = [
    `${volumeBlueprint.fatigue.weeklySetCeiling} set haftalık yorgunluk tavanı, ${volumeBlueprint.fatigue.perSessionSetCeiling} set seans tavanı.`,
    `Çaba hedefi RIR ${volumeBlueprint.effort.rirMin}-${volumeBlueprint.effort.rirMax}.`,
  ];
  const priorityTargets = volumeBlueprint.targets.filter((t) => t.isPriority);
  for (const target of priorityTargets) {
    volumeRationale.push(`${target.bucket}: haftada ${target.weeklySets} set (${target.frequency} seansta, kanıt bandı ${target.band.mev}-${target.band.mrv}).`);
  }

  const selectionRationale = [
    ...assemblyPlan.selectionNotes,
    `Hareketler compound -> accessory -> isolation sırasına göre, bildirilen ekipman ve limitasyonlarla filtrelendi.`,
  ];
  if (assemblyPlan.warnings.length > 0) {
    selectionRationale.push(...assemblyPlan.warnings);
  }

  const progressionRationale = [
    `${progressionPlan.weekCount} haftalık blok; RIR kademeli olarak düşer, deload haftalarında toparlanma için hacim azalır.`,
    progressionPlan.deloadWeeks.length > 0
      ? `Toparlanma haftaları: ${progressionPlan.deloadWeeks.map((w) => w + 1).join(', ')}. hafta.`
      : 'Bu blok kısa olduğu için zamanlanmış deload yok; ilerleme ölçülü kalmalı.',
  ];

  const safetyNotes: string[] = [...blueprint.safetyConstraints];
  if (profile.safetyFlags.includes('pain_reported')) {
    safetyNotes.push('Bildirilen ağrı/limitasyon için güvenli olmayan hareketler elendi.');
  }
  if (profile.safetyFlags.includes('physique_is_estimate_only')) {
    safetyNotes.push('Fizik analizi yalnızca yumuşak sinyal olarak kullanıldı, tanı değil.');
  }

  const uncertaintyNotes = [
    ...blueprint.confidenceRationale.slice(0, 2),
    ...volumeBlueprint.uncertaintyNotes,
  ];

  const assumptions = [
    ...profile.assumptions,
    ...blueprint.assumptions,
    ...volumeBlueprint.assumptions,
  ];

  return {
    headline,
    whyThisPlan,
    structureRationale,
    volumeRationale,
    selectionRationale,
    progressionRationale,
    safetyNotes,
    uncertaintyNotes,
    assumptions,
  };
}
