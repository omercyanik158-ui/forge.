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

function formatGoalClassificationLabel(classification: string): string {
  switch (classification) {
    case 'general_strength':
      return 'general strength';
    case 'powerlifting_strength':
      return 'powerlifting strength';
    case 'lift_specific_strength':
      return 'lift-specific strength';
    case 'hypertrophy':
      return 'hypertrophy';
    case 'muscle_specialization':
      return 'muscle specialization';
    case 'powerbuilding':
      return 'powerbuilding';
    case 'fat_loss_strength_retention':
      return 'fat loss with strength retention';
    default:
      return 'general fitness';
  }
}

export function buildAIProgramExplanation(input: ExplanationInput): AIProgramExplanation {
  const { context, blueprint, volumeBlueprint, assemblyPlan, progressionPlan } = input;
  const profile = context.userProfile;

  const headline = `${blueprint.recommendedSplitLabel} · ${blueprint.recommendedTrainingDays} gün · ${formatGoalClassificationLabel(blueprint.goalClassification)} odaklı ${progressionPlan.weekCount} haftalık blok`;

  const whyThisPlan = [
    ...(blueprint.programFamily === 'strength'
      ? ['Bu plan ana kaldırışlarda ilerleme için kuruldu; her seansta 1-2 ana lift ve ardından destek hareketleri var.']
      : []),
    ...(blueprint.programFamily === 'hypertrophy' || blueprint.goalClassification === 'muscle_specialization'
      ? ['Bu plan kas gelişimi için kaliteli haftalık set, 2x frekans, kontrollü RIR ve zamanla artan tekrar/ağırlık mantığıyla kuruldu.']
      : []),
    ...(profile.goal === 'recomposition'
      ? ['Bu plan recomp için kas gelişimi prensiplerini daha kontrollü hacimle kullanır; amaç kası koruyup geliştirebilecek kaliteli setler üretmektir.']
      : []),
    ...blueprint.whyThisPlan.slice(0, 4),
    `Güven seviyesi: ${blueprint.confidence}.`,
  ];

  const archetypeRationale = [
    `Neden bu archetype? ${blueprint.programArchetypeLabel}, ${formatGoalClassificationLabel(blueprint.goalClassification)} hedefi ve ${blueprint.recommendedTrainingDays} gün yapısına göre seçildi.`,
    ...blueprint.programArchetypeRationale,
  ];

  const progressionModelRationale = [
    `Neden bu progression modeli? ${blueprint.progressionModel.replaceAll('_', ' ')} yaklaşımı ${formatGoalClassificationLabel(blueprint.goalClassification)} hedefi için seçildi.`,
    ...progressionPlan.progressionNotes,
    ...(blueprint.stallProtocol ?? []),
  ];

  const roleDistributionRationale = [
    `Neden bu kas/rol dağılımı? ${blueprint.exerciseRolePolicy.replaceAll('_', ' ')} politikası kullanıldı.`,
    ...blueprint.weeklyArchitecture.notes,
    ...(blueprint.specializationStrategy ?? []),
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
    ...(blueprint.programFamily !== 'strength'
      ? ['Double progression: önce tekrar aralığının üstüne yaklaş, sonra ağırlığı küçük artırıp tekrar aralığının altına dön.']
      : []),
    ...progressionPlan.progressionNotes,
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
    archetypeRationale,
    progressionModelRationale,
    roleDistributionRationale,
    structureRationale,
    volumeRationale,
    selectionRationale,
    progressionRationale,
    safetyNotes,
    uncertaintyNotes,
    assumptions,
  };
}
