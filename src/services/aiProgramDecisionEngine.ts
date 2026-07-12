import { buildGoalStrategyRules } from './aiProgramGoalRules';
import { buildPriorityMuscleRules } from './aiProgramPriorityRules';
import { buildRecoveryAdjustedRules } from './aiProgramRecoveryRules';
import { buildDecisionSafetyOverrides, evaluateDecisionConfidence } from './aiProgramDecisionValidator';
import { evaluateSplitCandidates } from './aiProgramSplitRules';
import type {
  AIProgramDecisionBlueprint,
  AIProgramVolumeDirection,
} from '@/types/aiProgramDecision';
import type { AIProgramDecisionContext } from '@/types/aiProgram';

const VOLUME_ORDER: AIProgramVolumeDirection[] = [
  'conservative',
  'moderate',
  'moderate_high',
  'specialization',
];

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
    case 'general_fitness':
      return 'genel form';
    case 'return_to_training':
      return 'antrenmana dönüş';
    default:
      return 'genel form';
  }
}

function formatRecoveryLabel(recovery?: string): string {
  switch (recovery) {
    case 'great':
      return 'çok iyi';
    case 'okay':
      return 'idare eder';
    case 'poor':
      return 'zayıf';
    default:
      return 'belirsiz';
  }
}

function formatPriorityMuscleLabel(muscle: string): string {
  switch (muscle) {
    case 'chest':
      return 'göğüs';
    case 'shoulders':
      return 'omuz';
    case 'lats':
      return 'lat';
    case 'upper_back':
      return 'üst sırt';
    case 'arms':
      return 'kollar';
    case 'glutes':
      return 'kalça';
    case 'quads':
      return 'ön bacak';
    case 'hamstrings':
      return 'arka bacak';
    case 'calves':
      return 'kalf';
    case 'core':
      return 'core';
    case 'full_body_balance':
      return 'tüm vücut denge';
    default:
      return muscle.replaceAll('_', ' ');
  }
}

function mergeSplitBiases(
  ...biasGroups: (Partial<Record<AIProgramDecisionBlueprint['recommendedSplit'], number>> | undefined)[]
): Partial<Record<AIProgramDecisionBlueprint['recommendedSplit'], number>> {
  const merged: Partial<Record<AIProgramDecisionBlueprint['recommendedSplit'], number>> = {};
  for (const biasGroup of biasGroups) {
    if (!biasGroup) continue;
    for (const [key, value] of Object.entries(biasGroup)) {
      if (!value) continue;
      const typedKey = key as AIProgramDecisionBlueprint['recommendedSplit'];
      merged[typedKey] = (merged[typedKey] ?? 0) + value;
    }
  }
  return merged;
}

function pickLowerVolumeDirection(
  left?: AIProgramVolumeDirection,
  right?: AIProgramVolumeDirection,
): AIProgramVolumeDirection {
  const leftIndex = VOLUME_ORDER.indexOf(left ?? 'moderate');
  const rightIndex = VOLUME_ORDER.indexOf(right ?? 'moderate');
  return VOLUME_ORDER[Math.min(leftIndex, rightIndex)];
}

function buildEffortStrategy(context: AIProgramDecisionContext): string[] {
  const { userProfile } = context;
  if (userProfile.experience === 'beginner') {
    return [
      'Temel çok eklemli hareketler teknik oturana kadar çoğunlukla RIR 2-4 bandında kalmalı.',
      'Teknik ve toparlanma daha öngörülebilir olana kadar sık tükenişten kaçınılmalı.',
    ];
  }
  if (userProfile.experience === 'returning') {
    return [
      'Tolerans yeniden kurulurken daha konservatif bir artış ve tükenişten uzak duruş tercih edilmeli.',
      'Özellikle bloğun başında temel hareketler agresif değil temiz tekrar odaklı kalmalı.',
    ];
  }
  if (userProfile.experience === 'advanced') {
    return [
      'Stratejik olarak tükenişe yaklaşan setler kullanılabilir ama yorgunluk maliyeti anlamlı kalmalı.',
      'Temel hareketlerde yine de izolasyonlara göre daha konservatif tükeniş maruziyeti tercih edilmeli.',
    ];
  }
  const lines = [
    'Çoğu çalışma RIR 1-3 civarında kalmalı; temel hareketler izolasyonlara göre daha konservatif yönetilmeli.',
  ];
  if (userProfile.recoveryQuality === 'poor') {
    lines.push('Toparlanma zayıfsa sık sık tükenişe yaklaşmak daha da azaltılmalı.');
  }
  return lines;
}

function buildFrequencyStrategy(context: AIProgramDecisionContext, recommendedSplitLabel: string): string[] {
  const { userProfile } = context;
  const lines = [
    `${recommendedSplitLabel.toLowerCase()} yapısında çoğu kas grubu haftada 1-3 kaliteli temas almalı.`,
  ];
  if (userProfile.priorityMuscles.length > 0) {
    lines.push('Öncelikli bölgeler toparlanma uygunsa haftada 2-3 kez, genelde seansın erken kısmında yer alabilir.');
  }
  if (userProfile.experience === 'beginner') {
    lines.push('Başlangıç seviyesinde daha düşük seans hacmiyle daha sık pratik genelde daha verimlidir.');
  }
  if (userProfile.experience === 'advanced') {
    lines.push('İleri seviyede sıklık sabit şablondan çok uzmanlaşma toleransına göre ayarlanmalıdır.');
  }
  return lines;
}

function buildWhyThisPlan(context: AIProgramDecisionContext, recommendedSplitLabel: string, recommendedDays: number): string[] {
  const { userProfile } = context;
  const lines = [
    `${userProfile.trainingDays ?? recommendedDays} gün ayırabildiğini belirttin; FORGE başlangıç için ${recommendedDays} yapılandırılmış gün öneriyor.`,
    `Ana hedefin ${formatGoalLabel(userProfile.goal)}, bu yüzden split seçimi toparlanmayı ihmal etmeden bu hedefe öncelik veriyor.`,
  ];
  if (userProfile.priorityMuscles.length > 0) {
    lines.push(`Öncelikli bölgelerin (${userProfile.priorityMuscles.map(formatPriorityMuscleLabel).join(', ')}) taze çalışmanın nereye yerleşeceğini etkiliyor.`);
  }
  if (userProfile.recoveryQuality) {
    lines.push(`Toparlanma durumun ${formatRecoveryLabel(userProfile.recoveryQuality)} olduğu için plan sürdürülebilir yoğunluk ve hacim seviyesinden başlıyor.`);
  }
  if (userProfile.physiqueAnalysisUsed) {
    lines.push('Son fizik analizin yalnızca yumuşak bir kişiselleştirme sinyali olarak kullanıldı; tanı veya sert bir override değil.');
  }
  lines.push(`FORGE, uyaran, yorgunluk ve sürdürülebilirliği en dengeli noktada tuttuğu için ${recommendedSplitLabel} yapısını seçti.`);
  return lines;
}

export function buildAIProgramDecisionBlueprint(context: AIProgramDecisionContext): AIProgramDecisionBlueprint {
  const goalRules = buildGoalStrategyRules(context.userProfile);
  const recoveryRules = buildRecoveryAdjustedRules(context.userProfile);
  const priorityRules = buildPriorityMuscleRules(context.userProfile);
  const overrides = buildDecisionSafetyOverrides(context.userProfile);
  const mergedSplitBias = mergeSplitBiases(goalRules.splitBias, recoveryRules.splitBias, priorityRules.splitBias);
  const recommendedTrainingDays = Math.min(
    overrides.recommendedTrainingDays,
    recoveryRules.maxRecommendedDays ?? overrides.recommendedTrainingDays,
  );

  const candidates = evaluateSplitCandidates(context.userProfile, recommendedTrainingDays, mergedSplitBias);
  const topCandidates = candidates.slice(0, Math.max(2, Math.min(3, candidates.length)));
  const selected = topCandidates[0] ?? candidates[0];
  const alternativesConsidered = topCandidates.map((candidate, index) => ({
    split: candidate.split,
    label: candidate.label,
    weeklyStructure: candidate.weeklyStructure,
    score: candidate.score,
    rationale: candidate.rationale,
    tradeoffs: candidate.tradeoffs,
    rejectedReason:
      index === 0
        ? undefined
        : `${candidate.label} uygulanabilirdi ancak ${selected.label} toparlanma, sürdürülebilirlik ve öncelik kas yerleşimi açısından daha iyi eşleşti.`,
  }));

  const confidence = evaluateDecisionConfidence(context.userProfile, overrides.confidencePenalties);

  return {
    recommendedSplit: selected.split,
    recommendedSplitLabel: selected.label,
    recommendedTrainingDays,
    weeklyStructure: selected.weeklyStructure,
    rationale: [
      ...selected.rationale,
      ...goalRules.lines,
      ...priorityRules.lines,
    ],
    goalStrategy: goalRules.lines,
    priorityMuscleStrategy: priorityRules.lines,
    recoveryStrategy: recoveryRules.lines,
    volumeDirection: pickLowerVolumeDirection(goalRules.volumeDirection, recoveryRules.volumeDirection),
    effortStrategy: buildEffortStrategy(context),
    frequencyStrategy: buildFrequencyStrategy(context, selected.label),
    safetyConstraints: [
      ...overrides.safetyConstraints,
      ...context.scientific.riskFactors,
    ],
    assumptions: context.userProfile.assumptions,
    confidence: confidence.confidence,
    confidenceRationale: confidence.rationale,
    alternativesConsidered,
    evidenceCategories: context.scientific.relevantEvidenceCategories,
    whyThisPlan: buildWhyThisPlan(context, selected.label, recommendedTrainingDays),
    futureExerciseConstraints: context.scientific.programmingConstraints,
  };
}
