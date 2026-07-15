import type { CoachPreferences, GoalType, UserProfile } from '@/types';
import type { PhysiqueAnalysisResult } from '@/types/aiHub';
import type {
  AIProgramAnswers,
  AIProgramDecisionContext,
  AIProgramDraft,
  AIProgramEntryPath,
  AIProgramEquipmentKey,
  AIProgramPainLimitation,
  AIProgramPhysiqueSummary,
  AIProgramPriorityMuscle,
  ProgramInfluenceSummary,
  AIProgramSafetyFlag,
  AIProgramStepId,
  AIProgramValidationCode,
} from '@/types/aiProgram';
import type { AIProgramPlan } from '@/types/aiProgramPlan';
import type { CycleTrackingSummary } from './cycleTracking';

const AI_PROGRAM_STEP_ORDER: AIProgramStepId[] = [
  'intro',
  'goal',
  'style',
  'days',
  'duration',
  'location',
  'equipment',
  'experience',
  'priority',
  'limitations',
  'exercise_preferences',
  'recovery',
  'summary',
];

const GYM_EQUIPMENT: AIProgramEquipmentKey[] = [
  'machines',
  'cables',
  'dumbbells',
  'barbells',
  'smith_machine',
  'pullup_station',
  'leg_press',
  'cardio_machines',
];

const HOME_EQUIPMENT: AIProgramEquipmentKey[] = [
  'bodyweight_only',
  'dumbbells',
  'adjustable_dumbbells',
  'bands',
  'bench',
  'pullup_bar',
  'kettlebell',
];

const LIMITATION_RISK_MAP: Record<Exclude<AIProgramPainLimitation, 'none' | 'other'>, string> = {
  shoulder: 'Overhead pressing and unstable shoulder loading may need modification.',
  elbow: 'High-irritation pressing and arm-isolation volume may need reduction.',
  wrist: 'Bar position and grip-loading choices may need adjustment.',
  lower_back: 'Axial loading and hip-hinge fatigue should stay conservative.',
  hip: 'Deep flexion and unilateral loading may need careful selection.',
  knee: 'Deep knee-flexion loading and impact should stay conservative.',
  ankle: 'Impact tolerance and lower-limb balance work may need scaling.',
};

function createDraftId(): string {
  return `ai-program-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function mapGoalType(goalType?: GoalType) {
  if (goalType === 'gain') return 'build_muscle' as const;
  if (goalType === 'loss') return 'lose_fat' as const;
  if (goalType === 'maintain') return 'general_fitness' as const;
  return undefined;
}

function mapCoachEquipment(equipment?: CoachPreferences['equipment']): { location?: AIProgramAnswers['location']; equipment: AIProgramEquipmentKey[] } {
  if (equipment === 'bodyweight') return { location: 'home', equipment: ['bodyweight_only'] };
  if (equipment === 'home') return { location: 'home', equipment: ['dumbbells', 'bands', 'bench'] };
  if (equipment === 'gym') return { location: 'gym', equipment: ['machines', 'cables', 'dumbbells', 'barbells'] };
  return { equipment: [] };
}

function mapCoachLimitation(value: CoachPreferences['limitations'][number]): AIProgramPainLimitation {
  if (value === 'back') return 'lower_back';
  if (value === 'knee') return 'knee';
  return 'shoulder';
}

const PHYSIQUE_REGION_TO_PRIORITY: { patterns: string[]; muscle: AIProgramPriorityMuscle }[] = [
  { patterns: ['gogus', 'göğüs', 'chest', 'pec'], muscle: 'chest' },
  { patterns: ['omuz', 'shoulder', 'deltoid'], muscle: 'shoulders' },
  { patterns: ['lat', 'kanat'], muscle: 'lats' },
  { patterns: ['sirt', 'sırt', 'back', 'trapez', 'trap'], muscle: 'upper_back' },
  { patterns: ['kol', 'biceps', 'triceps', 'arm'], muscle: 'arms' },
  { patterns: ['kalca', 'kalça', 'glute'], muscle: 'glutes' },
  { patterns: ['quadriceps', 'quad', 'on bacak', 'ön bacak'], muscle: 'quads' },
  { patterns: ['hamstring', 'arka bacak'], muscle: 'hamstrings' },
  { patterns: ['calf', 'kalf', 'baldir', 'baldır'], muscle: 'calves' },
  { patterns: ['karin', 'karın', 'core', 'abs'], muscle: 'core' },
];

function normalizeRegion(value: string): string {
  return value.trim().toLocaleLowerCase('tr-TR');
}

function inferFocusMuscles(focusAreas: string[]): AIProgramPriorityMuscle[] {
  const muscles: AIProgramPriorityMuscle[] = [];
  for (const area of focusAreas) {
    const normalized = normalizeRegion(area);
    const match = PHYSIQUE_REGION_TO_PRIORITY.find((entry) =>
      entry.patterns.some((pattern) => normalized.includes(pattern)),
    );
    if (match && !muscles.includes(match.muscle)) muscles.push(match.muscle);
  }
  return muscles.slice(0, 3);
}

function inferSplitBiasHint(focusMuscles: AIProgramPriorityMuscle[]): AIProgramPhysiqueSummary['splitBiasHint'] {
  const upper = focusMuscles.filter((item) => ['chest', 'shoulders', 'lats', 'upper_back', 'arms'].includes(item)).length;
  const lower = focusMuscles.filter((item) => ['glutes', 'quads', 'hamstrings', 'calves'].includes(item)).length;
  if (focusMuscles.includes('upper_back') || focusMuscles.includes('lats') || focusMuscles.includes('hamstrings') || focusMuscles.includes('glutes')) {
    return 'posterior_focus';
  }
  if (upper >= 2) return 'upper_focus';
  if (lower >= 2) return 'lower_focus';
  return 'balanced';
}

function inferVolumeBias(confidenceLevel: AIProgramPhysiqueSummary['confidenceLevel'], focusMuscles: AIProgramPriorityMuscle[]): AIProgramPhysiqueSummary['volumeBias'] {
  if (confidenceLevel === 'low') return 'conservative';
  if (focusMuscles.length >= 2 && confidenceLevel === 'high') return 'moderate_high';
  return 'moderate';
}

function isPriorityMuscle(value: string): value is AIProgramPriorityMuscle {
  return [
    'chest',
    'shoulders',
    'lats',
    'upper_back',
    'arms',
    'glutes',
    'quads',
    'hamstrings',
    'calves',
    'core',
    'full_body_balance',
  ].includes(value);
}

function hasLowPoseConfidence(result: PhysiqueAnalysisResult): boolean {
  const pose = result.pozKalitesiYorumu.toLocaleLowerCase('tr-TR');
  return pose.includes('kotu') || pose.includes('kötü') || pose.includes('dusuk') || pose.includes('düşük') || pose.includes('belirsiz');
}

function normalizeProgramFocusMuscles(result: PhysiqueAnalysisResult, fallbackAreas: string[]): AIProgramPriorityMuscle[] {
  const signalMuscles = result.programSignals?.focusMuscles
    .filter(isPriorityMuscle)
    .slice(0, 3) ?? [];
  if (signalMuscles.length > 0) return signalMuscles;

  const roadmapMuscles = result.priorityRoadmap
    ?.map((item) => item.targetMuscle)
    .filter(isPriorityMuscle)
    .slice(0, 3) ?? [];
  if (roadmapMuscles.length > 0) return roadmapMuscles;

  return inferFocusMuscles(fallbackAreas);
}

function normalizeProgramExercises(result: PhysiqueAnalysisResult): string[] {
  const signalExercises = result.programSignals?.exerciseEmphasis.slice(0, 6) ?? [];
  if (signalExercises.length > 0) return signalExercises;
  const roadmapExercises = result.priorityRoadmap
    ?.flatMap((item) => item.exerciseEmphasis)
    .slice(0, 6) ?? [];
  if (roadmapExercises.length > 0) return roadmapExercises;
  return result.odaklanmasiGerekenHareketler.map((item) => item.hareketAdi).slice(0, 4);
}

function normalizeVolumeBias(
  result: PhysiqueAnalysisResult,
  confidenceLevel: AIProgramPhysiqueSummary['confidenceLevel'],
  focusMuscles: AIProgramPriorityMuscle[],
): AIProgramPhysiqueSummary['volumeBias'] {
  if (confidenceLevel === 'low' || hasLowPoseConfidence(result)) return 'conservative';
  return result.programSignals?.volumeBias ?? inferVolumeBias(confidenceLevel, focusMuscles);
}

function normalizeSplitBias(
  result: PhysiqueAnalysisResult,
  focusMuscles: AIProgramPriorityMuscle[],
): AIProgramPhysiqueSummary['splitBiasHint'] {
  return result.programSignals?.splitBiasHint ?? inferSplitBiasHint(focusMuscles);
}

function priorityLabel(muscle: AIProgramPriorityMuscle): string {
  const labels: Record<AIProgramPriorityMuscle, string> = {
    chest: 'Göğüs',
    shoulders: 'Omuz',
    lats: 'Lat',
    upper_back: 'Üst sırt',
    arms: 'Kol',
    glutes: 'Kalça',
    quads: 'Ön bacak',
    hamstrings: 'Arka bacak',
    calves: 'Kalf',
    core: 'Core',
    full_body_balance: 'Tüm vücut dengesi',
  };
  return labels[muscle];
}

export function buildProgramInfluenceSummary(
  physiqueSummary?: AIProgramPhysiqueSummary,
): ProgramInfluenceSummary | undefined {
  if (!physiqueSummary) return undefined;
  const focusMuscles = physiqueSummary.focusMuscles.length > 0
    ? physiqueSummary.focusMuscles
    : inferFocusMuscles(physiqueSummary.focusAreas);
  const focusLabels = focusMuscles.length > 0
    ? focusMuscles.map(priorityLabel)
    : physiqueSummary.focusAreas.slice(0, 3);
  const splitImpact =
    physiqueSummary.splitBiasHint === 'upper_focus'
      ? 'Üst vücut temasları program kararlarında biraz öne alınır.'
      : physiqueSummary.splitBiasHint === 'lower_focus'
        ? 'Alt vücut temasları program kararlarında biraz öne alınır.'
        : physiqueSummary.splitBiasHint === 'posterior_focus'
          ? 'Sırt, kalça veya arka zincir teması split seçiminde daha görünür olur.'
          : 'Split dengeli kalır; analiz yalnızca ince ayar olarak kullanılır.';
  const volumeImpact =
    physiqueSummary.volumeBias === 'moderate_high'
      ? 'Odak bölgelerde ölçülü ek hacim önerilir.'
      : physiqueSummary.volumeBias === 'conservative'
        ? 'Düşük güven nedeniyle hacim artışı sınırlı tutulur.'
        : 'Odak bölgelerde sürdürülebilir, orta düzey hacim vurgusu yapılır.';

  return {
    focusMuscles,
    focusLabels,
    splitImpact,
    volumeImpact,
    exerciseEmphasis: physiqueSummary.exerciseEmphasis.length > 0
      ? physiqueSummary.exerciseEmphasis
      : physiqueSummary.recommendedExercises,
    confidenceLevel: physiqueSummary.confidenceLevel,
    explanation: 'Fizik analizi programı yumuşak bir sinyal olarak etkiler; hedef, toparlanma, ekipman ve ağrı-limitasyonları daha önceliklidir.',
  };
}

export function summarizePhysiqueForProgram(
  result: PhysiqueAnalysisResult,
  createdAt: string,
  source: AIProgramPhysiqueSummary['source'],
): AIProgramPhysiqueSummary {
  const confidenceLevel =
    result.programSignals?.confidenceLevel ?? (result.guvenPuani >= 80 ? 'high' : result.guvenPuani >= 60 ? 'medium' : 'low');
  const focusAreas = result.priorityRoadmap?.length
    ? result.priorityRoadmap.map((item) => item.targetArea).slice(0, 3)
    : result.eksikBolgeler.slice(0, 3);
  const focusMuscles = normalizeProgramFocusMuscles(result, focusAreas);
  const splitBiasHint = normalizeSplitBias(result, focusMuscles);
  const volumeBias = normalizeVolumeBias(result, confidenceLevel, focusMuscles);
  const exerciseEmphasis = normalizeProgramExercises(result);
  return {
    source,
    createdAt,
    confidenceLevel,
    estimateNote: result.coachSummary ?? result.kasKutlesiYorumu,
    focusAreas,
    focusMuscles,
    volumeBias,
    splitBiasHint,
    exerciseEmphasis: exerciseEmphasis.slice(0, 4),
    recommendedExercises: exerciseEmphasis.slice(0, 4),
    generalSummary: result.coachSummary ?? result.generalDurum,
  };
}

export function createInitialAIProgramDraft(params: {
  entryPath: AIProgramEntryPath;
  profile: UserProfile | null;
  coachPreferences: CoachPreferences | null;
  physiqueSummary?: AIProgramPhysiqueSummary;
}): AIProgramDraft {
  const coachEquipment = mapCoachEquipment(params.coachPreferences?.equipment);
  const painLimitations = params.coachPreferences?.limitations.map(mapCoachLimitation) ?? [];
  const physiqueFocusMuscles = params.physiqueSummary?.focusMuscles ?? [];
  return {
    id: createDraftId(),
    version: 1,
    entryPath: params.entryPath,
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    currentStep: 'intro',
    completedSteps: [],
    skippedSteps: [],
    answers: {
      mainGoal: mapGoalType(params.profile?.goalType),
      preferredProgramStyle: 'auto',
      location: coachEquipment.location,
      equipment: coachEquipment.equipment,
      priorityMuscles: physiqueFocusMuscles,
      painLimitations,
      preferredExerciseIds: [],
      avoidedExerciseIds: [],
      useLatestPhysiqueAnalysis: !!params.physiqueSummary,
    },
    generationStatus: 'idle',
    validationCodes: [],
    cautionCodes: [],
    latestPhysiqueSummary: params.physiqueSummary,
  };
}

export function getAIProgramStepOrder(): AIProgramStepId[] {
  return [...AI_PROGRAM_STEP_ORDER];
}

export function validateAIProgramAnswers(answers: AIProgramAnswers): {
  blocking: AIProgramValidationCode[];
  cautions: AIProgramValidationCode[];
} {
  const normalizedLimitations =
    answers.painLimitations.length > 0 ? answers.painLimitations : ['none'];
  const blocking = new Set<AIProgramValidationCode>();
  const cautions = new Set<AIProgramValidationCode>();

  if (!answers.mainGoal) blocking.add('missing_goal');
  if (!answers.trainingDays) blocking.add('missing_training_days');
  if (!answers.sessionDurationMin) blocking.add('missing_duration');
  if (!answers.location) blocking.add('missing_location');
  if (answers.equipment.length === 0) blocking.add('missing_equipment');
  if (answers.priorityMuscles.length > 3) blocking.add('too_many_priority_muscles');

  if (answers.experience === 'beginner' && answers.trainingDays === 6) {
    cautions.add('beginner_high_frequency');
  }
  if (answers.recoveryQuality === 'poor' && (answers.trainingDays ?? 0) >= 5) {
    cautions.add('poor_recovery_high_frequency');
  }
  if (normalizedLimitations.some((item) => item !== 'none')) {
    cautions.add('pain_requires_conservative_flag');
  }

  return {
    blocking: [...blocking],
    cautions: [...cautions],
  };
}

function buildSafetyFlags(
  answers: AIProgramAnswers,
  cycle?: CycleTrackingSummary | null,
  physiqueSummary?: AIProgramPhysiqueSummary,
): AIProgramSafetyFlag[] {
  const normalizedLimitations =
    answers.painLimitations.length > 0 ? answers.painLimitations : ['none'];
  const flags = new Set<AIProgramSafetyFlag>();
  if (answers.experience === 'beginner' && answers.trainingDays === 6) flags.add('high_frequency_beginner');
  if (answers.recoveryQuality === 'poor' && (answers.trainingDays ?? 0) >= 5) flags.add('high_frequency_poor_recovery');
  if (normalizedLimitations.some((item) => item !== 'none')) flags.add('pain_reported');
  if (physiqueSummary) flags.add('physique_is_estimate_only');
  if (cycle) flags.add('cycle_context_present');
  return [...flags];
}

function collectMissingInfo(answers: AIProgramAnswers) {
  const missing: AIProgramDecisionContext['userProfile']['missingInfo'] = [];
  const preferredExerciseIds = answers.preferredExerciseIds ?? [];
  const avoidedExerciseIds = answers.avoidedExerciseIds ?? [];
  if (!answers.mainGoal) missing.push({ level: 'critical', field: 'mainGoal' });
  if (!answers.trainingDays) missing.push({ level: 'critical', field: 'trainingDays' });
  if (!answers.location) missing.push({ level: 'critical', field: 'location' });
  if (answers.equipment.length === 0) missing.push({ level: 'critical', field: 'equipment' });
  if (!answers.experience) missing.push({ level: 'important', field: 'experience' });
  if (!answers.recoveryQuality) missing.push({ level: 'important', field: 'recoveryQuality' });
  if (answers.priorityMuscles.length === 0) missing.push({ level: 'important', field: 'priorityMuscles' });
  if (preferredExerciseIds.length === 0 && !answers.preferredExercises) missing.push({ level: 'optional', field: 'preferredExercises' });
  if (avoidedExerciseIds.length === 0 && !answers.avoidedExercises) missing.push({ level: 'optional', field: 'avoidedExercises' });
  if (!answers.sleepContext) missing.push({ level: 'optional', field: 'sleepContext' });
  if (!answers.stressContext) missing.push({ level: 'optional', field: 'stressContext' });
  return missing;
}

function buildAssumptions(answers: AIProgramAnswers, profile: UserProfile | null, cycle?: CycleTrackingSummary | null): string[] {
  const assumptions: string[] = [];
  if (!answers.secondaryGoal || answers.secondaryGoal === 'none') assumptions.push('No secondary goal was prioritized.');
  if (!answers.sleepContext) assumptions.push('Sleep quality was not specified, so recovery will be treated conservatively.');
  if (!answers.stressContext) assumptions.push('Stress load was not specified, so fatigue tolerance will not be assumed to be high.');
  if (!profile?.goalType && !answers.mainGoal) assumptions.push('A primary goal must be confirmed before future generation.');
  if (cycle) assumptions.push('Cycle context can guide fatigue management but never overrides explicit pain or preference inputs.');
  return assumptions;
}

function buildEvidenceCategories(answers: AIProgramAnswers): string[] {
  const normalizedLimitations =
    answers.painLimitations.length > 0 ? answers.painLimitations : ['none'];
  const categories = [
    'Professional position stands',
    'Systematic reviews and meta-analyses',
    'Progressive overload and fatigue-management principles',
  ];
  if (answers.mainGoal === 'strength') categories.push('Strength-specific progression evidence');
  if (answers.mainGoal === 'build_muscle' || answers.mainGoal === 'recomposition') categories.push('Hypertrophy volume and frequency evidence');
  if (answers.mainGoal === 'athletic_performance') categories.push('Performance and specificity evidence');
  if (normalizedLimitations.some((item) => item !== 'none')) categories.push('Conservative exercise-modification guidance');
  return categories;
}

function buildProgrammingConstraints(answers: AIProgramAnswers): string[] {
  const constraints = [
    `${answers.trainingDays ?? '?'} training days per week`,
    `${answers.sessionDurationMin ?? '?'} minute sessions`,
  ];
  if (answers.location === 'home') constraints.push('Home-only equipment must constrain exercise selection.');
  if (answers.location === 'both') constraints.push('Split selection must remain portable between home and gym.');
  if (answers.equipment.includes('bodyweight_only')) constraints.push('Program must work without external load.');
  if (answers.priorityMuscles.length > 0) constraints.push('Priority muscles can bias volume but cannot dominate every day.');
  return constraints;
}

function buildRiskFactors(answers: AIProgramAnswers): string[] {
  const normalizedLimitations =
    answers.painLimitations.length > 0 ? answers.painLimitations : ['none'];
  const risks: string[] = [];
  if (answers.recoveryQuality === 'poor') risks.push('Recovery tolerance is currently limited.');
  for (const limitation of normalizedLimitations) {
    if (limitation !== 'none' && limitation !== 'other' && limitation in LIMITATION_RISK_MAP) {
      risks.push(LIMITATION_RISK_MAP[limitation as keyof typeof LIMITATION_RISK_MAP]);
    }
  }
  if (normalizedLimitations.includes('other')) risks.push('An unspecified limitation requires conservative exercise selection.');
  return risks;
}

function buildAdaptationFocus(
  answers: AIProgramAnswers,
  physiqueSummary?: AIProgramPhysiqueSummary,
): string[] {
  const focus: string[] = [];
  if (answers.mainGoal === 'build_muscle') focus.push('Hypertrophy and weekly volume balance');
  if (answers.mainGoal === 'lose_fat') focus.push('Adherence, recoverable volume, and muscle retention');
  if (answers.mainGoal === 'recomposition') focus.push('Moderate volume with recovery-sensitive progression');
  if (answers.mainGoal === 'strength') focus.push('Skill retention on primary lifts and recoverable intensity');
  if (answers.mainGoal === 'athletic_performance') focus.push('Specificity and fatigue control');
  if (answers.mainGoal === 'general_fitness') focus.push('Sustainable full-body consistency');
  if (answers.mainGoal === 'return_to_training') focus.push('Gradual re-entry and technique confidence');
  if (physiqueSummary?.focusAreas.length) focus.push(`Soft physique priorities: ${physiqueSummary.focusAreas.join(', ')}`);
  return focus;
}

function computeContextConfidence(answers: AIProgramAnswers, physiqueSummary?: AIProgramPhysiqueSummary) {
  const criticalMissing = collectMissingInfo(answers).some((item) => item.level === 'critical');
  if (criticalMissing) return 'low' as const;
  if (physiqueSummary?.confidenceLevel === 'low' || !answers.experience || !answers.recoveryQuality) return 'medium' as const;
  return 'high' as const;
}

export function buildAIProgramDecisionContext(params: {
  draft: AIProgramDraft;
  profile: UserProfile | null;
  cycle?: CycleTrackingSummary | null;
}): AIProgramDecisionContext {
  const { draft, profile, cycle } = params;
  const missingInfo = collectMissingInfo(draft.answers);
  const confidenceLevel = computeContextConfidence(draft.answers, draft.latestPhysiqueSummary);

  return {
    userProfile: {
      age: profile?.age,
      sex: profile?.gender,
      heightCm: profile?.heightCm,
      weightKg: profile?.weightKg,
      experience: draft.answers.experience,
      goal: draft.answers.mainGoal,
      secondaryGoal: draft.answers.secondaryGoal,
      preferredProgramStyle: draft.answers.preferredProgramStyle ?? 'auto',
      trainingDays: draft.answers.trainingDays,
      sessionDuration: draft.answers.sessionDurationMin,
      location: draft.answers.location,
      equipment: draft.answers.equipment,
      priorityMuscles: draft.answers.priorityMuscles,
      painLimitations: draft.answers.painLimitations.length > 0 ? draft.answers.painLimitations : ['none'],
      preferredExerciseIds: draft.answers.preferredExerciseIds ?? [],
      avoidedExerciseIds: draft.answers.avoidedExerciseIds ?? [],
      preferredExercises: draft.answers.preferredExercises,
      avoidedExercises: draft.answers.avoidedExercises,
      recoveryQuality: draft.answers.recoveryQuality,
      sleepContext: draft.answers.sleepContext,
      stressContext: draft.answers.stressContext,
      physiqueAnalysisUsed: !!(draft.answers.useLatestPhysiqueAnalysis && draft.latestPhysiqueSummary),
      physiqueAnalysisSummary: draft.answers.useLatestPhysiqueAnalysis ? draft.latestPhysiqueSummary : undefined,
      programInfluence: buildProgramInfluenceSummary(
        draft.answers.useLatestPhysiqueAnalysis ? draft.latestPhysiqueSummary : undefined,
      ),
      confidenceLevel,
      missingInfo,
      assumptions: buildAssumptions(draft.answers, profile, cycle),
      safetyFlags: buildSafetyFlags(draft.answers, cycle, draft.answers.useLatestPhysiqueAnalysis ? draft.latestPhysiqueSummary : undefined),
    },
    scientific: {
      relevantEvidenceCategories: buildEvidenceCategories(draft.answers),
      uncertaintyNotes: [
        'Physique analysis is treated as a soft estimate only.',
        'When evidence is mixed, future modules must prefer safer and more sustainable choices.',
      ],
      programmingConstraints: buildProgrammingConstraints(draft.answers),
      riskFactors: buildRiskFactors(draft.answers),
      expectedAdaptationFocus: buildAdaptationFocus(draft.answers, draft.answers.useLatestPhysiqueAnalysis ? draft.latestPhysiqueSummary : undefined),
    },
    ux: {
      entryPath: draft.entryPath,
      completedSteps: draft.completedSteps,
      skippedSteps: draft.skippedSteps,
      draftId: draft.id,
      canResume: true,
      generationStatus: draft.generationStatus,
    },
  };
}

export function mergeAIProgramDraft(
  draft: AIProgramDraft,
  next: Omit<Partial<AIProgramDraft>, 'answers'> & { answers?: Partial<AIProgramAnswers> },
): AIProgramDraft {
  return {
    ...draft,
    ...next,
    answers: {
      ...draft.answers,
      ...next.answers,
    },
    updatedAt: new Date().toISOString(),
  };
}

export function createAIProgramDraftFromPhysiqueSeed(params: {
  entryPath: AIProgramEntryPath;
  profile: UserProfile | null;
  coachPreferences: CoachPreferences | null;
  seed: { result: PhysiqueAnalysisResult; createdAt: string };
}): AIProgramDraft {
  return createInitialAIProgramDraft({
    entryPath: params.entryPath,
    profile: params.profile,
    coachPreferences: params.coachPreferences,
    physiqueSummary: summarizePhysiqueForProgram(params.seed.result, params.seed.createdAt, 'current_result'),
  });
}

function clampDurationToPreset(duration: number): 30 | 45 | 60 | 75 | 90 {
  const presets = [30, 45, 60, 75, 90] as const;
  return presets.reduce((closest, current) =>
    Math.abs(current - duration) < Math.abs(closest - duration) ? current : closest,
  );
}

export function createAIProgramDraftFromSavedPlan(params: {
  entryPath: AIProgramEntryPath;
  profile: UserProfile | null;
  coachPreferences: CoachPreferences | null;
  plan: AIProgramPlan;
  physiqueSummary?: AIProgramPhysiqueSummary;
}): AIProgramDraft {
  const baseDraft = createInitialAIProgramDraft({
    entryPath: params.entryPath,
    profile: params.profile,
    coachPreferences: params.coachPreferences,
    physiqueSummary: params.physiqueSummary,
  });
  const firstWeekDurations = params.plan.weeks[0]?.days.map((day) => day.durationMin) ?? [];
  const averageDuration =
    firstWeekDurations.length > 0
      ? Math.round(firstWeekDurations.reduce((sum, item) => sum + item, 0) / firstWeekDurations.length)
      : undefined;
  const priorPriorityMuscles = params.plan.sourceContextSummary.priorityMuscles as AIProgramAnswers['priorityMuscles'];
  const physiquePriorityMuscles = params.physiqueSummary?.focusMuscles ?? [];
  const mergedPriorityMuscles = [...new Set([...physiquePriorityMuscles, ...priorPriorityMuscles])].slice(0, 3) as AIProgramAnswers['priorityMuscles'];

  return mergeAIProgramDraft(baseDraft, {
    answers: {
      mainGoal: params.plan.sourceContextSummary.mainGoal as AIProgramAnswers['mainGoal'],
      preferredProgramStyle: params.plan.sourceBlueprint.stylePreference ?? 'auto',
      trainingDays: params.plan.daysPerWeek as AIProgramAnswers['trainingDays'],
      sessionDurationMin:
        averageDuration != null ? clampDurationToPreset(averageDuration) : baseDraft.answers.sessionDurationMin,
      experience: params.plan.sourceContextSummary.experience as AIProgramAnswers['experience'],
      priorityMuscles: mergedPriorityMuscles,
      painLimitations: params.plan.sourceContextSummary.painLimitations as AIProgramAnswers['painLimitations'],
      recoveryQuality: params.plan.sourceContextSummary.recoveryQuality as AIProgramAnswers['recoveryQuality'],
      useLatestPhysiqueAnalysis: Boolean(params.physiqueSummary) || baseDraft.answers.useLatestPhysiqueAnalysis,
    },
  });
}

export { GYM_EQUIPMENT, HOME_EQUIPMENT };
