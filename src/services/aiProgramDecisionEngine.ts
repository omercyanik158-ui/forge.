import { buildGoalStrategyRules } from './aiProgramGoalRules';
import { buildPriorityMuscleRules } from './aiProgramPriorityRules';
import { buildRecoveryAdjustedRules } from './aiProgramRecoveryRules';
import { buildDecisionSafetyOverrides, evaluateDecisionConfidence } from './aiProgramDecisionValidator';
import { evaluateSplitCandidates } from './aiProgramSplitRules';
import { classifyProgramGoal } from './aiProgramGoalClassifier';
import type {
  AIProgramArchetypeKey,
  AIProgramDecisionBlueprint,
  AIProgramSplitKey,
  AIProgramExerciseRolePolicy,
  AIProgramProgressionModel,
  AIProgramWeeklyArchitecture,
  AIProgramWeeklyDayRole,
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

function buildPhysiqueSplitBias(context: AIProgramDecisionContext): Partial<Record<AIProgramDecisionBlueprint['recommendedSplit'], number>> {
  const hint = context.userProfile.physiqueAnalysisSummary?.splitBiasHint;
  if (!context.userProfile.physiqueAnalysisUsed || !hint) return {};
  if (hint === 'upper_focus') return { upper_lower: 1, torso_limbs: 1, hybrid: 1 };
  if (hint === 'lower_focus') return { upper_lower: 1, anterior_posterior: 1 };
  if (hint === 'posterior_focus') return { upper_lower: 1, anterior_posterior: 1, hybrid: 1 };
  return { full_body: 1, upper_lower: 1 };
}

function pickPhysiqueVolumeDirection(
  context: AIProgramDecisionContext,
): AIProgramVolumeDirection | undefined {
  const bias = context.userProfile.physiqueAnalysisSummary?.volumeBias;
  if (!context.userProfile.physiqueAnalysisUsed || !bias) return undefined;
  if (bias === 'moderate_high') return 'moderate_high';
  if (bias === 'conservative') return 'conservative';
  return 'moderate';
}

function pickLowerVolumeDirection(
  left?: AIProgramVolumeDirection,
  right?: AIProgramVolumeDirection,
): AIProgramVolumeDirection {
  const leftIndex = VOLUME_ORDER.indexOf(left ?? 'moderate');
  const rightIndex = VOLUME_ORDER.indexOf(right ?? 'moderate');
  return VOLUME_ORDER[Math.min(leftIndex, rightIndex)];
}

type ArchetypeDecision = {
  archetype: AIProgramArchetypeKey;
  label: string;
  split: AIProgramSplitKey;
  rationale: string[];
  splitBias: Partial<Record<AIProgramSplitKey, number>>;
};

function archetypeLabel(archetype: AIProgramArchetypeKey): string {
  switch (archetype) {
    case 'full_body_strength_skill':
      return 'Full Body Strength Skill';
    case 'full_body_hypertrophy':
      return 'Full Body Hipertrofi';
    case 'upper_lower_strength':
      return 'Upper/Lower Strength';
    case 'upper_lower_hypertrophy':
      return 'Upper/Lower Hipertrofi';
    case 'ppl_hypertrophy':
      return 'PPL Hipertrofi';
    case 'hybrid_athletic':
      return 'Hibrit Atletik';
    case 'body_part_specialization':
      return 'Bölgesel Hipertrofi';
    case 'minimalist_home':
      return 'Minimalist Ev Programı';
    case 'posterior_chain_focus':
      return 'Posterior Chain Focus';
    case 'glute_core_focus':
      return 'Glute/Core Focus';
  }
}

function decisionForArchetype(archetype: AIProgramArchetypeKey, rationale: string[]): ArchetypeDecision {
  switch (archetype) {
    case 'minimalist_home':
      return { archetype, label: archetypeLabel(archetype), split: 'minimalist_home', rationale, splitBias: { minimalist_home: 8, full_body: 2 } };
    case 'full_body_strength_skill':
    case 'full_body_hypertrophy':
      return { archetype, label: archetypeLabel(archetype), split: 'full_body', rationale, splitBias: { full_body: 8, hybrid: 2 } };
    case 'upper_lower_strength':
      return { archetype, label: archetypeLabel(archetype), split: 'upper_lower', rationale, splitBias: { upper_lower: 8, hybrid: 1 } };
    case 'upper_lower_hypertrophy':
      return { archetype, label: archetypeLabel(archetype), split: 'torso_limbs', rationale, splitBias: { torso_limbs: 7, upper_lower: 3, hybrid: 2 } };
    case 'ppl_hypertrophy':
      return { archetype, label: archetypeLabel(archetype), split: 'push_pull_legs', rationale, splitBias: { push_pull_legs: 8, hybrid: 3, body_part_emphasis: 2 } };
    case 'hybrid_athletic':
      return { archetype, label: archetypeLabel(archetype), split: 'hybrid', rationale, splitBias: { hybrid: 8, full_body: 2, anterior_posterior: 2 } };
    case 'body_part_specialization':
      return { archetype, label: archetypeLabel(archetype), split: 'body_part_emphasis', rationale, splitBias: { body_part_emphasis: 8, push_pull_legs: 2 } };
    case 'posterior_chain_focus':
      return { archetype, label: archetypeLabel(archetype), split: 'anterior_posterior', rationale, splitBias: { anterior_posterior: 8, hybrid: 2 } };
    case 'glute_core_focus':
      return { archetype, label: archetypeLabel(archetype), split: 'anterior_posterior', rationale, splitBias: { anterior_posterior: 6, hybrid: 3, torso_limbs: 2 } };
  }
}

function chooseProgramArchetype(context: AIProgramDecisionContext, recommendedDays: number): ArchetypeDecision {
  const profile = context.userProfile;
  const goalClassification = profile.inferredGoalClassification;
  const style = profile.preferredProgramStyle ?? 'auto';
  const beginnerOrReturning = profile.experience === 'beginner' || profile.experience === 'returning';
  const poorRecovery = profile.recoveryQuality === 'poor';
  const homeMinimal = profile.location === 'home' && profile.equipment.includes('bodyweight_only');
  const focus = profile.priorityMuscles;
  const posteriorFocus = focus.some((item) => item === 'upper_back' || item === 'lats' || item === 'hamstrings');
  const gluteCoreFocus = focus.includes('glutes') || focus.includes('core');
  const unsafeAggressive = beginnerOrReturning || poorRecovery || recommendedDays < 4;
  const rationale: string[] = [];

  if (style !== 'auto') {
    rationale.push(`Kullanıcı program tarzı olarak ${style.replaceAll('_', ' ')} seçti.`);
  }
  if (beginnerOrReturning) rationale.push('Seviye nedeniyle teknik pratik ve toparlanabilir hacim önceliklendirildi.');
  if (poorRecovery) rationale.push('Toparlanma zayıf olduğu için agresif uzmanlaşma sınırlandı.');
  if (homeMinimal) rationale.push('Ekipman sınırlı olduğu için minimalist/full body akış daha uygun.');

  if (style === 'minimalist_home' || homeMinimal) {
    return decisionForArchetype('minimalist_home', rationale);
  }
  if (style === 'full_body') {
    return decisionForArchetype(profile.goal === 'strength' ? 'full_body_strength_skill' : 'full_body_hypertrophy', rationale);
  }
  if (style === 'upper_lower') {
    return decisionForArchetype(profile.goal === 'strength' ? 'upper_lower_strength' : 'upper_lower_hypertrophy', rationale);
  }
  if (style === 'push_pull_legs') {
    if (!unsafeAggressive && recommendedDays >= 3) return decisionForArchetype('ppl_hypertrophy', rationale);
    return decisionForArchetype('hybrid_athletic', [...rationale, 'PPL isteği korundu ama güvenlik nedeniyle hibrit yapı daha uygun seçildi.']);
  }
  if (style === 'hybrid_athletic') {
    return decisionForArchetype('hybrid_athletic', rationale);
  }
  if (style === 'body_part') {
    if (!unsafeAggressive && recommendedDays >= 5) return decisionForArchetype('body_part_specialization', rationale);
    return decisionForArchetype('upper_lower_hypertrophy', [...rationale, 'Bölgesel uzmanlaşma için recovery/gün sayısı yeterli olmadığı için daha dengeli yapı seçildi.']);
  }

  if (recommendedDays <= 2) return decisionForArchetype(homeMinimal ? 'minimalist_home' : (goalClassification?.includes('strength') ? 'full_body_strength_skill' : 'full_body_hypertrophy'), rationale);
  if (recommendedDays === 3) {
    if (beginnerOrReturning) return decisionForArchetype('full_body_hypertrophy', rationale);
    if (goalClassification?.includes('strength') || profile.goal === 'strength') return decisionForArchetype('full_body_strength_skill', rationale);
    if (profile.goal === 'build_muscle' && profile.experience === 'advanced' && profile.recoveryQuality === 'great') {
      return decisionForArchetype('ppl_hypertrophy', rationale);
    }
    return decisionForArchetype('hybrid_athletic', rationale);
  }
  if (profile.goal === 'athletic_performance') return decisionForArchetype('hybrid_athletic', rationale);
  if (goalClassification?.includes('strength') || profile.goal === 'strength') return decisionForArchetype('upper_lower_strength', rationale);
  if (posteriorFocus) return decisionForArchetype('posterior_chain_focus', rationale);
  if (gluteCoreFocus && profile.sex === 'female' && profile.physiqueAnalysisUsed) return decisionForArchetype('glute_core_focus', rationale);
  if (profile.goal === 'build_muscle' && recommendedDays >= 5 && profile.recoveryQuality === 'great') {
    return decisionForArchetype('ppl_hypertrophy', rationale);
  }
  if (profile.goal === 'build_muscle' && recommendedDays >= 4 && !poorRecovery) {
    return decisionForArchetype('hybrid_athletic', rationale);
  }
  return decisionForArchetype('full_body_hypertrophy', rationale);
}

function chooseProgressionModel(context: AIProgramDecisionContext): AIProgramProgressionModel {
  const { userProfile } = context;
  const classification = userProfile.inferredGoalClassification;
  if (classification === 'general_strength') {
    if (userProfile.experience === 'beginner' || userProfile.experience === 'returning') return 'session_to_session_lp';
    if (userProfile.experience === 'intermediate') return 'heavy_light_medium';
    return 'block_periodization';
  }
  if (classification === 'powerlifting_strength' || classification === 'lift_specific_strength') {
    if (userProfile.experience === 'beginner') return 'weekly_linear';
    if (userProfile.experience === 'intermediate') return 'top_set_backoff';
    return 'block_periodization';
  }
  if (classification === 'powerbuilding') return 'top_set_backoff';
  if (classification === 'muscle_specialization') return 'specialization_microcycle';
  if (classification === 'hypertrophy') return 'double_progression';
  if (classification === 'fat_loss_strength_retention') return 'fatigue_held';
  return 'weekly_linear';
}

function chooseExerciseRolePolicy(context: AIProgramDecisionContext): AIProgramExerciseRolePolicy {
  const classification = context.userProfile.inferredGoalClassification;
  if (classification?.includes('strength')) return 'strength_role_driven';
  if (classification === 'powerbuilding') return 'powerbuilding_hybrid';
  if (classification === 'hypertrophy' || classification === 'muscle_specialization') return 'hypertrophy_region_driven';
  return 'general_fitness_minimum_effective';
}

function buildWeeklyArchitecture(blueprintSplit: AIProgramSplitKey, archetype: ArchetypeDecision, context: AIProgramDecisionContext): AIProgramWeeklyArchitecture {
  const classification = context.userProfile.inferredGoalClassification;
  let dayRoles: AIProgramWeeklyDayRole[] = [];
  if (classification?.includes('strength')) {
    if (context.userProfile.experience === 'beginner' || context.userProfile.experience === 'returning') {
      const noviceRoles: AIProgramWeeklyDayRole[] = ['competition_specific_day', 'technique_day', 'hypertrophy_assistance_day'];
      dayRoles = noviceRoles.slice(0, context.userProfile.trainingDays ?? 3);
    } else if (context.userProfile.trainingDays && context.userProfile.trainingDays >= 4) {
      const strengthRoles: AIProgramWeeklyDayRole[] = ['volume_day', 'intensity_day', 'variation_day', 'recovery_day'];
      dayRoles = strengthRoles.slice(0, context.userProfile.trainingDays);
    } else {
      dayRoles = ['volume_day', 'intensity_day', 'technique_day'];
    }
  } else if (classification === 'muscle_specialization') {
    const specializationRoles: AIProgramWeeklyDayRole[] = ['priority_block_day', 'balanced_hypertrophy_day', 'priority_block_day', 'maintenance_day'];
    dayRoles = specializationRoles.slice(0, context.userProfile.trainingDays ?? 4);
  } else {
    const hypertrophyRoles: AIProgramWeeklyDayRole[] = ['balanced_hypertrophy_day', 'balanced_hypertrophy_day', 'maintenance_day', 'balanced_hypertrophy_day'];
    dayRoles = hypertrophyRoles.slice(0, context.userProfile.trainingDays ?? 4);
  }
  return {
    label: archetype.label,
    split: blueprintSplit,
    dayRoles,
    notes: [
      classification?.includes('strength')
        ? 'Haftalık mimari ana kaldırış frekansı ve gün rolü etrafında kuruldu.'
        : 'Haftalık mimari öncelik kas blokları ve dengeli hacim dağılımı etrafında kuruldu.',
    ],
  };
}

function buildFatigueStrategy(context: AIProgramDecisionContext): string[] {
  const classification = context.userProfile.inferredGoalClassification;
  if (classification?.includes('strength')) {
    return [
      'Ana kaldırışlar dışındaki hacim, performansı gölgelemeyecek kadar sınırlı tutulmalı.',
      'Kötü gün ve toparlanma sinyallerinde egzersiz değiştirmeden önce yük-zaman ölçeği ayarlanmalı.',
    ];
  }
  return [
    'Hacim artışı ancak kalite ve toparlanma uygunsa küçük adımlarla düşünülmeli.',
    'Lokal yorgunluk yükselirse aynı hacim ikinci temasa dağıtılmalı veya redundant slot değiştirilmeli.',
  ];
}

function buildSpecializationStrategy(context: AIProgramDecisionContext): string[] | undefined {
  if (context.userProfile.inferredGoalClassification !== 'muscle_specialization') return undefined;
  return [
    'Öncelikli kası seansın başına al.',
    'Gerekirse haftaya ikinci temas ekle.',
    'Diğer kasları maintenance hacmine çekerek minimum etkili ek hacim kullan.',
  ];
}

function buildStallProtocol(context: AIProgramDecisionContext): string[] | undefined {
  if (!context.userProfile.inferredGoalClassification?.includes('strength')) return undefined;
  return [
    'Tek seferlik kötü günü ayıkla.',
    'ROM, teknik ve RPE tahminini kontrol et.',
    'Aynı yükü tekrar et veya mikro yükleme dene.',
    'Gerekirse hacim/yoğunluk küçük ayar görsün; varyasyon en son gelsin.',
  ];
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
  const classifiedGoal = classifyProgramGoal(context.userProfile);
  context.userProfile.inferredGoalClassification = classifiedGoal.goalClassification;
  context.userProfile.targetLiftPatterns = classifiedGoal.targetLiftPatterns;
  const goalRules = buildGoalStrategyRules(context.userProfile);
  const recoveryRules = buildRecoveryAdjustedRules(context.userProfile);
  const priorityRules = buildPriorityMuscleRules(context.userProfile);
  const overrides = buildDecisionSafetyOverrides(context.userProfile);
  const physiqueSplitBias = buildPhysiqueSplitBias(context);
  const physiqueVolumeDirection = pickPhysiqueVolumeDirection(context);
  const recommendedTrainingDays = Math.min(
    overrides.recommendedTrainingDays,
    recoveryRules.maxRecommendedDays ?? overrides.recommendedTrainingDays,
  );
  const archetype = chooseProgramArchetype(context, recommendedTrainingDays);
  const mergedSplitBias = mergeSplitBiases(goalRules.splitBias, recoveryRules.splitBias, priorityRules.splitBias, physiqueSplitBias, archetype.splitBias);

  const candidates = evaluateSplitCandidates(context.userProfile, recommendedTrainingDays, mergedSplitBias);
  const selected = candidates.find((candidate) => candidate.split === archetype.split) ?? candidates[0];
  const topCandidates = [
    selected,
    ...candidates.filter((candidate) => candidate.split !== selected?.split),
  ].filter((candidate): candidate is NonNullable<typeof candidate> => !!candidate).slice(0, Math.max(2, Math.min(3, candidates.length)));
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
  const progressionModel = chooseProgressionModel(context);
  const exerciseRolePolicy = chooseExerciseRolePolicy(context);
  const weeklyArchitecture = buildWeeklyArchitecture(selected.split, archetype, context);

  return {
    stylePreference: context.userProfile.preferredProgramStyle ?? 'auto',
    programFamily: classifiedGoal.programFamily,
    goalClassification: classifiedGoal.goalClassification,
    targetLiftPatterns: classifiedGoal.targetLiftPatterns,
    programArchetype: archetype.archetype,
    programArchetypeLabel: archetype.label,
    programArchetypeRationale: archetype.rationale.length > 0
      ? archetype.rationale
      : [`${recommendedTrainingDays} gün, ${formatGoalLabel(context.userProfile.goal)} hedefi ve toparlanma sinyalleri bu arketipi öne çıkardı.`],
    weeklyArchitecture,
    progressionModel,
    fatigueStrategy: buildFatigueStrategy(context),
    exerciseRolePolicy,
    specializationStrategy: buildSpecializationStrategy(context),
    stallProtocol: buildStallProtocol(context),
    recommendedSplit: selected.split,
    recommendedSplitLabel: archetype.label,
    recommendedTrainingDays,
    weeklyStructure: selected.weeklyStructure,
    rationale: [
      ...classifiedGoal.rationale,
      ...selected.rationale,
      ...goalRules.lines,
      ...priorityRules.lines,
      ...(context.userProfile.programInfluence
        ? [
            `Fizik analizi etkisi: ${context.userProfile.programInfluence.focusLabels.join(', ') || 'denge'} odağı programa yumuşak sinyal olarak eklendi.`,
          ]
        : []),
    ],
    goalStrategy: goalRules.lines,
    priorityMuscleStrategy: priorityRules.lines,
    recoveryStrategy: recoveryRules.lines,
    volumeDirection: physiqueVolumeDirection
      ? pickLowerVolumeDirection(pickLowerVolumeDirection(goalRules.volumeDirection, recoveryRules.volumeDirection), physiqueVolumeDirection)
      : pickLowerVolumeDirection(goalRules.volumeDirection, recoveryRules.volumeDirection),
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
