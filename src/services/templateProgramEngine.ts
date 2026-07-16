import { FORGE_ADAPTATION_RULES as FORGE_ADAPTATION_RULES_STABLE } from '@/workout-programming/generated/adaptationRules.generated';
import { FORGE_ADAPTATION_RULES_300 } from '@/workout-programming/generated/adaptationRules300.generated';
import { FORGE_PROGRAM_TEMPLATES as FORGE_PROGRAM_TEMPLATES_STABLE } from '@/workout-programming/generated/templates.generated';
import { FORGE_PROGRAM_TEMPLATES_300 } from '@/workout-programming/generated/templates300.generated';
import { FORGE_EXERCISE_SUBSTITUTIONS as FORGE_EXERCISE_SUBSTITUTIONS_STABLE } from '@/workout-programming/generated/substitutions.generated';
import { FORGE_EXERCISE_SUBSTITUTIONS_300 } from '@/workout-programming/generated/substitutions300.generated';
import { FORGE_PROGRESSION_RULES as FORGE_PROGRESSION_RULES_STABLE } from '@/workout-programming/generated/progressionRules.generated';
import { FORGE_PROGRESSION_RULES_300 } from '@/workout-programming/generated/progressionRules300.generated';
import { FORGE_CANONICAL_EXERCISES as FORGE_CANONICAL_EXERCISES_STABLE } from '@/workout-programming/generated/exerciseCatalog.generated';
import { FORGE_CANONICAL_EXERCISES_300 } from '@/workout-programming/generated/exerciseCatalog300.generated';
import {
  focusAreaAllowsVolume,
  normalizeFocusMuscleValue,
  normalizePhysiqueFocusAreas,
  selectPhysiqueFocusAreas,
  type CanonicalFocusMuscle,
  type IgnoredPhysiqueFocusArea,
  type PhysiqueFocusArea,
  type PhysiqueFocusSeverity,
  type PhysiqueFocusSource,
} from '@/workout-programming/adaptation/physiqueFocusRules';
import {
  getExerciseLimitationConflicts,
  getExerciseLimitationRule,
  normalizeLimitations,
  type CanonicalLimitation,
} from '@/workout-programming/limitations/exerciseLimitationRules';
import { orderProgramWorkouts } from '@/workout-programming/ordering/orderWorkoutExercises';
import type {
  ForgeGeneratedExercise,
  ForgeGeneratedTemplate,
  ForgeGeneratedWorkoutDay,
  ForgePhysiqueFocus,
} from '@/workout-programming/types/csvWorkoutBrain';
import type { AIProgramAnswers, AIProgramPhysiqueSummary } from '@/types/aiProgram';
import type { AIProgramAlternativeDecision, AIProgramDecisionBlueprint, AIProgramSplitKey } from '@/types/aiProgramDecision';
import type { AIDayPrescription, AIGeneratedWeek, AIProgramPlan } from '@/types/aiProgramPlan';
import { hasExercise } from './exerciseCatalog';
import { getTemplateProgramEngineFeatureState, getWorkoutLibraryVersionState } from './workoutEngineFeatureFlags';

export const USE_TEMPLATE_PROGRAM_ENGINE =
  getTemplateProgramEngineFeatureState().enabled;

const ADAPTATION_VERSION = 2;

export type TemplateGoal = 'strength' | 'hypertrophy' | 'powerbuilding' | 'general_fitness';
export type TemplateModality = 'strength' | 'hypertrophy' | 'powerbuilding' | 'general_fitness' | 'home' | 'yoga' | 'pilates';
export type TemplateLevel = 'beginner' | 'intermediate' | 'advanced';
export type TemplateSplit = 'full_body' | 'upper_lower' | 'push_pull_legs' | 'body_part' | 'powerbuilding' | 'custom';
export type TemplateEquipmentProfile = 'full_gym' | 'dumbbell_only' | 'bodyweight_home' | 'resistance_band_bodyweight' | 'custom';

export type TemplateRejectionCode =
  | 'GOAL_MISMATCH'
  | 'MODALITY_MISMATCH'
  | 'DAY_COUNT_MISMATCH'
  | 'LEVEL_MISMATCH'
  | 'EQUIPMENT_MISMATCH'
  | 'DURATION_INCOMPATIBLE'
  | 'SPLIT_MISMATCH'
  | 'REQUIRED_EXERCISE_RESTRICTED'
  | 'LIMITATION_CONFLICT'
  | 'NO_VALID_SUBSTITUTION';

export type TemplateRejectionReason = {
  code: TemplateRejectionCode;
  message: string;
  field?: string;
};

export type ProgramTemplate = ForgeGeneratedTemplate & {
  id: string;
  name: string;
  focusMuscles: string[];
};

export type ProgramRequest = {
  userId: string;
  goal: TemplateGoal;
  modality?: TemplateModality;
  level: TemplateLevel;
  daysPerWeek: number;
  preferredSessionMinutes: number;
  equipmentProfile: TemplateEquipmentProfile;
  availableEquipment: string[];
  equipmentSpecified: boolean; // Distinguishes unspecified equipment from explicit empty selection
  focusMuscles: string[];
  physiqueFocus: ForgePhysiqueFocus[];
  restrictedExerciseIds: string[];
  limitations: string[];
  preferredSplit?: TemplateSplit;
  forceNewVariation?: boolean;
  previousTemplateId?: string;
  selectedTemplateId?: string; // Force this specific template to be used (for recommendation selection)
};

export type TemplateMatchResult = {
  templateId: string;
  totalScore: number;
  matchMode?: 'strict_match' | 'relaxed_match' | 'no_safe_match';
  relaxationsApplied?: string[];
  breakdown: {
    goal: number;
    days: number;
    level: number;
    equipment: number;
    duration: number;
    focus: number;
      split: number;
      adaptationCostPenalty?: number;
  };
  explanation?: string[];
  rejectionReasons?: string[];
  rejectionDetails?: TemplateRejectionReason[];
};

export type AppliedAdaptation = {
  id?: string;
  type: 'priority_change' | 'exercise_substitution' | 'limitation_substitution' | 'volume_added' | 'volume_removed' | 'volume_reallocated' | 'focus_reordered';
  reason: string;
  focusMuscle?: CanonicalFocusMuscle;
  confidence?: number;
  severity?: PhysiqueFocusSeverity;
  source?: PhysiqueFocusSource;
  triggeringLimitation?: CanonicalLimitation;
  dayIndex?: number;
  exerciseId?: string;
  replacementExerciseId?: string;
  setsChanged?: number;
  previousSets?: number;
  newSets?: number;
  reasonCode?: string;
  userFacingReason?: string;
};

export type TemplateValidationIssue = {
  code: string;
  message: string;
  location?: string;
};

export type ProgramValidationResult = {
  valid: boolean;
  errors: TemplateValidationIssue[];
  warnings: TemplateValidationIssue[];
};

export type TemplateEngineResult = {
  plan: AIProgramPlan;
  request: ProgramRequest;
  effectiveRequest: ProgramRequest;
  requestFingerprint: string;
  selectedTemplateId: string;
  selectedTemplateVersion: number;
  matchMode: 'strict_match' | 'relaxed_match' | 'no_safe_match';
  relaxationsApplied: string[];
  match: TemplateMatchResult;
  rejectedTemplates: TemplateMatchResult[];
  adaptations: AppliedAdaptation[];
  validation: ProgramValidationResult;
  reusedExisting: boolean;
  adaptationFingerprint?: string;
  ignoredPhysiqueFocus?: IgnoredPhysiqueFocusArea[];
};

export type SupportedProgramOptionsInput = Partial<Pick<ProgramRequest, 'goal' | 'modality' | 'level' | 'equipmentProfile'>>;

export type SupportedProgramOptions = {
  supportedDayCounts: number[];
  supportedSessionDurations: number[];
  supportedSplits: TemplateSplit[];
  supportedEquipmentProfiles: TemplateEquipmentProfile[];
  compatibleTemplateCount: number;
};

export type ExactMatches = {
  goal: boolean;
  modality: boolean;
  daysPerWeek: boolean;
  level: boolean;
  equipment: boolean;
  duration: boolean;
  split: boolean;
  focusMuscles: boolean;
};

export type RecommendationMatch = {
  templateId: string;
  title: string;
  matchScore: number; // 0-100
  exactMatches: ExactMatches;
  approximateMatches: string[];
  matchingReasons: string[];
  compromises: string[];
  assumptions: string[];
  requiredEquipment: string[];
  estimatedSessionMinutes: number;
  daysPerWeek: number;
  goal: TemplateGoal;
  modality: TemplateModality;
  level: TemplateLevel;
  equipmentProfile: TemplateEquipmentProfile;
  split: TemplateSplit;
  durationWeeks: number;
};

export type ProgramRecommendations = {
  bestMatch: RecommendationMatch;
  alternatives: RecommendationMatch[];
  totalCompatible: number;
  totalRejected: number;
};

export type NoMatchExplanation = {
  blockingConstraints: string[];
  rejectionCounts: Record<string, number>;
  suggestedChanges: string[];
  hasAnyTemplates: boolean;
};

type MutableExercise = ForgeGeneratedExercise & {
  adaptedFromExerciseId?: string;
};

type MutableWorkoutDay = Omit<ForgeGeneratedWorkoutDay, 'exercises'> & {
  exercises: MutableExercise[];
};

type LimitationReplacement = {
  alternativeExerciseId: string;
  alternativeAppExerciseId: string;
  alternativeEquipment: string[];
  reason: string;
};

export const WORKOUT_LIBRARY_VERSION = getWorkoutLibraryVersionState().version;
const ACTIVE_PROGRAM_TEMPLATES = WORKOUT_LIBRARY_VERSION === '300' ? FORGE_PROGRAM_TEMPLATES_300 : FORGE_PROGRAM_TEMPLATES_STABLE;
const ACTIVE_ADAPTATION_RULES = WORKOUT_LIBRARY_VERSION === '300' ? FORGE_ADAPTATION_RULES_300 : FORGE_ADAPTATION_RULES_STABLE;
const ACTIVE_EXERCISE_SUBSTITUTIONS = WORKOUT_LIBRARY_VERSION === '300' ? FORGE_EXERCISE_SUBSTITUTIONS_300 : FORGE_EXERCISE_SUBSTITUTIONS_STABLE;
export const FORGE_PROGRESSION_RULES = WORKOUT_LIBRARY_VERSION === '300' ? FORGE_PROGRESSION_RULES_300 : FORGE_PROGRESSION_RULES_STABLE;
const ACTIVE_CANONICAL_EXERCISES = WORKOUT_LIBRARY_VERSION === '300' ? FORGE_CANONICAL_EXERCISES_300 : FORGE_CANONICAL_EXERCISES_STABLE;

export const LEGACY_PROGRAM_TEMPLATES: ProgramTemplate[] = FORGE_PROGRAM_TEMPLATES_STABLE.map((template) => ({
  ...template,
  id: template.templateId,
  name: template.nameTr,
  focusMuscles: template.compatibleFocusMuscles,
})).sort((left, right) => left.id.localeCompare(right.id));

export const PROGRAM_TEMPLATES: ProgramTemplate[] = ACTIVE_PROGRAM_TEMPLATES.map((template) => ({
  ...template,
  id: template.templateId,
  name: template.nameTr,
  focusMuscles: template.compatibleFocusMuscles,
})).sort((left, right) => left.id.localeCompare(right.id));

export const READ_COMPAT_PROGRAM_TEMPLATES: ProgramTemplate[] = [
  ...PROGRAM_TEMPLATES,
  ...LEGACY_PROGRAM_TEMPLATES.filter((legacy) => !PROGRAM_TEMPLATES.some((active) => active.id === legacy.id)),
];

export function getSupportedProgramOptions(input: SupportedProgramOptionsInput = {}): SupportedProgramOptions {
  const templates = PROGRAM_TEMPLATES.filter((template) =>
    (!input.goal || template.goal === input.goal) &&
    (!input.modality || (template.modality ?? template.goal) === input.modality) &&
    (!input.level || template.level === input.level) &&
    (!input.equipmentProfile || template.equipmentProfile === input.equipmentProfile)
  );
  return {
    supportedDayCounts: [...new Set(templates.map((template) => template.daysPerWeek))].sort((left, right) => left - right),
    supportedSessionDurations: [...new Set(templates.map((template) => template.sessionMinutes.target))].sort((left, right) => left - right),
    supportedSplits: [...new Set(templates.map((template) => template.split).filter((split): split is TemplateSplit =>
      ['full_body', 'upper_lower', 'push_pull_legs', 'body_part', 'powerbuilding', 'custom'].includes(split),
    ))].sort((left, right) => left.localeCompare(right)),
    supportedEquipmentProfiles: [...new Set(templates.map((template) => template.equipmentProfile).filter((profile): profile is TemplateEquipmentProfile =>
      ['full_gym', 'dumbbell_only', 'bodyweight_home', 'resistance_band_bodyweight', 'custom'].includes(profile),
    ))].sort((left, right) => left.localeCompare(right)),
    compatibleTemplateCount: templates.length,
  };
}

export function recommendPrograms(request: ProgramRequest): ProgramRecommendations | NoMatchExplanation {
  // Score all templates
  const allScores = PROGRAM_TEMPLATES.map((template) => scoreTemplate(template, request));

  // Separate compatible and rejected
  const compatible = allScores.filter((result) => !result.rejectionReasons?.length);
  const rejected = allScores.filter((result) => result.rejectionReasons?.length);

  // Handle zero-result case
  if (compatible.length === 0) {
    const rejectionCounts: Record<string, number> = {};
    rejected.forEach((result) => {
      result.rejectionReasons?.forEach((code) => {
        rejectionCounts[code] = (rejectionCounts[code] || 0) + 1;
      });
    });

    const blockingConstraints = Object.keys(rejectionCounts);
    const suggestedChanges: string[] = [];

    // Generate suggested changes based on rejection reasons
    if (rejectionCounts['DAY_COUNT_MISMATCH']) {
      const availableDays = [...new Set(PROGRAM_TEMPLATES.map((t) => t.daysPerWeek))].sort((a, b) => a - b);
      suggestedChanges.push(`Try training days: ${availableDays.slice(0, 3).join(', ')}`);
    }
    if (rejectionCounts['LEVEL_MISMATCH']) {
      suggestedChanges.push('Consider adjusting your experience level');
    }
    if (rejectionCounts['EQUIPMENT_MISMATCH'] || rejectionCounts['NO_VALID_SUBSTITUTION']) {
      suggestedChanges.push('Review your equipment selections or try "bodyweight only"');
    }
    if (rejectionCounts['MODALITY_MISMATCH']) {
      suggestedChanges.push('Try a different training style or modality');
    }
    if (rejectionCounts['LIMITATION_CONFLICT']) {
      suggestedChanges.push('Some limitations may restrict available programs');
    }

    return {
      blockingConstraints,
      rejectionCounts,
      suggestedChanges,
      hasAnyTemplates: PROGRAM_TEMPLATES.length > 0,
    };
  }

  // Sort compatible templates by score (descending)
  const sorted = compatible.sort((a, b) => {
    // Primary: total score
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;

    // Secondary: fewer assumptions (better for unspecified fields)
    const aAssumptions = a.breakdown.adaptationCostPenalty ?? 0;
    const bAssumptions = b.breakdown.adaptationCostPenalty ?? 0;
    if (aAssumptions !== bAssumptions) return bAssumptions - aAssumptions; // Higher (less negative) is better

    // Tertiary: template ID for deterministic ordering
    return a.templateId.localeCompare(b.templateId);
  });

  // Take top 3
  const top3 = sorted.slice(0, 3);

  // Convert to RecommendationMatch format
  const recommendations = top3.map((match): RecommendationMatch => {
    const template = PROGRAM_TEMPLATES.find((t) => t.id === match.templateId)!;
    const exactMatches: ExactMatches = {
      goal: template.goal === request.goal,
      modality: WORKOUT_LIBRARY_VERSION === '300' && request.modality
        ? (template.modality ?? template.goal) === request.modality
        : template.goal === request.goal,
      daysPerWeek: template.daysPerWeek === request.daysPerWeek,
      level: template.level === request.level,
      equipment: request.equipmentSpecified
        ? template.equipmentProfile === request.equipmentProfile
        : true, // When unspecified, all are "compatible"
      duration: Math.abs(request.preferredSessionMinutes - template.sessionMinutes.target) <= 15,
      split: request.preferredSplit === template.split,
      focusMuscles: request.focusMuscles.length > 0 &&
        request.focusMuscles.some((m) => template.compatibleFocusMuscles.includes(m)),
    };

    const matchingReasons: string[] = [];
    const compromises: string[] = [];
    const assumptions: string[] = [];
    const approximateMatches: string[] = [];

    // Build matching reasons and compromises
    if (exactMatches.goal) matchingReasons.push(`Goal: ${template.goal}`);
    else if (template.goal !== request.goal) approximateMatches.push(`Goal: ${request.goal} → ${template.goal}`);

    if (exactMatches.modality && WORKOUT_LIBRARY_VERSION === '300') {
      matchingReasons.push(`Modality: ${template.modality ?? template.goal}`);
    } else if (WORKOUT_LIBRARY_VERSION === '300' && request.modality && (template.modality ?? template.goal) !== request.modality) {
      compromises.push(`Modality: ${request.modality} → ${template.modality ?? template.goal}`);
    }

    if (exactMatches.daysPerWeek) matchingReasons.push(`${template.daysPerWeek} days/week`);
    else compromises.push(`${request.daysPerWeek} → ${template.daysPerWeek} days/week`);

    if (exactMatches.level) matchingReasons.push(`Level: ${template.level}`);
    else compromises.push(`Level: ${request.level} → ${template.level}`);

    if (request.equipmentSpecified) {
      if (exactMatches.equipment) matchingReasons.push(`Equipment: ${template.equipmentProfile}`);
      else compromises.push(`Equipment: ${request.equipmentProfile} (may require substitutions)`);
    } else {
      assumptions.push(`Equipment unspecified: ${template.equipmentProfile} program shown as option`);
    }

    if (exactMatches.duration) matchingReasons.push(`Duration: ~${template.sessionMinutes.target} min`);
    else approximateMatches.push(`Duration: ${template.sessionMinutes.target} min (preferred: ${request.preferredSessionMinutes} min)`);

    if (exactMatches.split) matchingReasons.push(`Split: ${template.split}`);
    else if (request.preferredSplit) approximateMatches.push(`Split: ${template.split} (preferred: ${request.preferredSplit})`);

    if (exactMatches.focusMuscles) matchingReasons.push(`Focus muscles match`);
    else if (request.focusMuscles.length > 0) {
      assumptions.push(`Focus muscles may be adapted`);
    }

    // Determine required equipment from template exercises
    const requiredEquipment = new Set<string>();
    template.workouts.forEach((workout) => {
      workout.exercises.forEach((exercise) => {
        exercise.equipment.forEach((eq) => requiredEquipment.add(eq));
      });
    });

    return {
      templateId: template.id,
      title: template.name,
      matchScore: match.totalScore,
      exactMatches,
      approximateMatches,
      matchingReasons,
      compromises,
      assumptions,
      requiredEquipment: Array.from(requiredEquipment),
      estimatedSessionMinutes: template.sessionMinutes.target,
      daysPerWeek: template.daysPerWeek,
      goal: template.goal,
      modality: (template.modality ?? template.goal) as TemplateModality,
      level: template.level,
      equipmentProfile: template.equipmentProfile as TemplateEquipmentProfile,
      split: template.split as TemplateSplit,
      durationWeeks: template.durationWeeks,
    };
  });

  return {
    bestMatch: recommendations[0],
    alternatives: recommendations.slice(1),
    totalCompatible: compatible.length,
    totalRejected: rejected.length,
  };
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function stableHash(input: string): string {
  let hash = 5381;
  for (let index = 0; index < input.length; index += 1) {
    hash = ((hash << 5) + hash) ^ input.charCodeAt(index);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function adaptationId(parts: string[]): string {
  return `adapt-${stableHash(parts.join('|'))}`;
}

function normalizeList(values: string[]): string[] {
  return [...new Set(values.map((item) => item.trim().toLowerCase()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function normalizeEquipmentKey(value: string): string {
  const normalized = value.trim().toLowerCase();
  const map: Record<string, string> = {
    barbells: 'barbell',
    dumbbells: 'dumbbell',
    machines: 'machine',
    cables: 'cable',
    bodyweight_only: 'bodyweight',
    pullup_bar: 'pullup_bar',
    pullup_station: 'pullup_bar',
    bench: 'bench',
    bands: 'resistance_band',
    band: 'resistance_band',
    resistance_bands: 'resistance_band',
    kettlebells: 'kettlebell',
    kettlebell: 'kettlebell',
    rack: 'rack',
    bodyweight: 'bodyweight',
  };
  return map[normalized] ?? normalized;
}

function normalizeSplitKey(value?: string): TemplateSplit | undefined {
  const normalized = value?.trim().toLowerCase();
  if (!normalized || normalized === 'auto' || normalized === 'otomatik seç') return undefined;
  const map: Record<string, TemplateSplit> = {
    full_body: 'full_body',
    'full body': 'full_body',
    'tüm vücut': 'full_body',
    upper_lower: 'upper_lower',
    'upper/lower': 'upper_lower',
    'üst alt': 'upper_lower',
    push_pull_legs: 'push_pull_legs',
    ppl: 'push_pull_legs',
    'push pull legs': 'push_pull_legs',
    body_part: 'body_part',
    'body part': 'body_part',
    bölgesel: 'body_part',
    powerbuilding: 'powerbuilding',
    home_bodyweight: 'full_body',
    minimalist_home: 'full_body',
    minimal_ev_programı: 'full_body',
  };
  return map[normalized] ?? undefined;
}

function equipmentProfileFromAnswers(answers: AIProgramAnswers, equipment: string[]): TemplateEquipmentProfile {
  const set = new Set(equipment.map(normalizeEquipmentKey));
  if (answers.location === 'home') {
    if (set.has('resistance_band')) return 'resistance_band_bodyweight';
    if (set.has('dumbbell')) return 'dumbbell_only';
    return 'bodyweight_home';
  }
  if (set.has('barbell') || set.has('machine') || set.has('cable')) return 'full_gym';
  if (set.has('dumbbell')) return 'dumbbell_only';
  if (set.has('resistance_band')) return 'resistance_band_bodyweight';
  if (set.has('bodyweight')) return 'bodyweight_home';
  return 'custom';
}

function requestEquipmentSet(request: ProgramRequest): Set<string> {
  const equipment = new Set(request.availableEquipment.map(normalizeEquipmentKey));
  if (request.equipmentProfile === 'full_gym') {
    if (equipment.has('barbell')) equipment.add('rack');
    equipment.add('bench');
    equipment.add('pullup_bar');
    equipment.add('assisted_machine');
    equipment.add('stationary_bike');
    equipment.add('treadmill');
    equipment.add('ab_wheel');
    equipment.add('trap_bar');
    equipment.add('resistance_band');
  }
  if (equipment.has('machine')) {
    equipment.add('assisted_machine');
    equipment.add('stationary_bike');
    equipment.add('treadmill');
  }
  if (equipment.has('dumbbell')) equipment.add('dumbbell_or_kettlebell');
  if (equipment.has('dumbbell')) equipment.add('machine_or_dumbbell');
  if (equipment.has('machine')) equipment.add('machine_or_dumbbell');
  if (equipment.has('cable')) equipment.add('cable_or_band');
  if (equipment.has('resistance_band')) equipment.add('cable_or_band');
  if (equipment.has('pullup_bar')) equipment.add('bar_or_rings');
  if (equipment.has('resistance_band')) {
    equipment.add('cable_or_band');
    equipment.add('bodyweight');
  }
  if (equipment.has('barbell') || equipment.has('machine') || equipment.has('cable')) {
    equipment.add('full_gym');
  }
  return equipment;
}

function exerciseEquipmentFits(equipment: string[], request: ProgramRequest): boolean {
  const available = requestEquipmentSet(request);
  if (equipment.length === 0 || equipment.includes('bodyweight')) return true;
  return equipment.every((item) => available.has(normalizeEquipmentKey(item)));
}

function equipmentProfileFits(template: ProgramTemplate, request: ProgramRequest): boolean {
  // When equipment is not specified, don't reject templates based on equipment
  // Equipment accessibility becomes a ranking factor instead
  if (!request.equipmentSpecified) {
    return true;
  }

  const available = requestEquipmentSet(request);
  if (template.equipmentProfile === 'resistance_band_bodyweight') return available.has('bodyweight') && available.has('resistance_band');
  if (template.equipmentProfile === 'bodyweight_home') return available.has('bodyweight') && (request.equipmentProfile === 'bodyweight_home' || available.has('resistance_band'));
  if (template.equipmentProfile === 'dumbbell_only') return available.has('dumbbell');
  if (template.equipmentProfile === 'full_gym') {
    return available.has('barbell') || available.has('machine') || (available.has('dumbbell') && available.has('bench'));
  }
  return true;
}

function equipmentProfileScore(template: ProgramTemplate, request: ProgramRequest): number {
  if (template.equipmentProfile === request.equipmentProfile) return 10;
  if (request.equipmentProfile === 'full_gym' && template.equipmentProfile === 'full_gym') return 10;
  return equipmentProfileFits(template, request) ? 6 : 0;
}

function requiredExerciseFitsOrCanSubstitute(exercise: ForgeGeneratedExercise, request: ProgramRequest): boolean {
  // When equipment is not specified, allow all exercises
  // They can be substituted during adaptation if needed
  if (!request.equipmentSpecified) {
    return true;
  }

  if (
    request.goal === 'strength'
    && exercise.required
    && exercise.role === 'main_lift'
    && exercise.equipment.map(normalizeEquipmentKey).includes('barbell')
    && !requestEquipmentSet(request).has('barbell')
  ) {
    return false;
  }
  if (exerciseEquipmentFits(exercise.equipment, request)) return true;
  return ACTIVE_EXERCISE_SUBSTITUTIONS
    .filter((item) => item.sourceExerciseId === exercise.canonicalExerciseId)
    .some((item) => exerciseEquipmentFits(item.alternativeEquipment, request));
}

function limitationSubstitutionCandidates(exercise: ForgeGeneratedExercise, limitation: CanonicalLimitation): string[] {
  return getExerciseLimitationRule(exercise.canonicalExerciseId)?.reviewedSubstitutions?.[limitation] ?? [];
}

function findValidLimitationSubstitution(
  exercise: ForgeGeneratedExercise,
  request: ProgramRequest,
  conflicts: CanonicalLimitation[],
  usedExerciseIds = new Set<string>(),
): { limitation: CanonicalLimitation; replacement: LimitationReplacement } | null {
  for (const limitation of conflicts) {
    const reviewedIds = limitationSubstitutionCandidates(exercise, limitation);
    for (const replacementId of reviewedIds) {
      const generatedReplacement = ACTIVE_EXERCISE_SUBSTITUTIONS.find((item) =>
        item.sourceExerciseId === exercise.canonicalExerciseId && item.alternativeExerciseId === replacementId,
      );
      const catalogReplacement = ACTIVE_CANONICAL_EXERCISES.find((item) => item.canonicalExerciseId === replacementId);
      let replacement: LimitationReplacement | null = null;
      if (generatedReplacement) {
        replacement = {
          alternativeExerciseId: generatedReplacement.alternativeExerciseId,
          alternativeAppExerciseId: generatedReplacement.alternativeAppExerciseId,
          alternativeEquipment: generatedReplacement.alternativeEquipment,
          reason: generatedReplacement.reason,
        };
      } else if (catalogReplacement && 'appExerciseId' in catalogReplacement && catalogReplacement.appExerciseId) {
        replacement = {
          alternativeExerciseId: catalogReplacement.canonicalExerciseId,
          alternativeAppExerciseId: catalogReplacement.appExerciseId,
          alternativeEquipment: catalogReplacement.equipment,
          reason: `reviewed limitation replacement for ${limitation}`,
        };
      }
      if (!replacement) continue;
      if (usedExerciseIds.has(replacement.alternativeAppExerciseId)) continue;
      if (request.restrictedExerciseIds.includes(replacement.alternativeAppExerciseId)) continue;
      if (request.restrictedExerciseIds.includes(replacement.alternativeExerciseId)) continue;
      if (getExerciseLimitationConflicts({ canonicalExerciseId: replacement.alternativeExerciseId }, request.limitations).length > 0) continue;
      if (!exerciseEquipmentFits(replacement.alternativeEquipment, request)) continue;
      return { limitation, replacement };
    }
  }
  return null;
}

function limitationConflictCanSubstitute(exercise: ForgeGeneratedExercise, request: ProgramRequest): boolean {
  const conflicts = getExerciseLimitationConflicts(exercise, request.limitations);
  if (conflicts.length === 0) return true;
  return findValidLimitationSubstitution(exercise, request, conflicts) !== null;
}

function restrictedRequiredExerciseHasSubstitution(exercise: ForgeGeneratedExercise, request: ProgramRequest): boolean {
  if (!request.restrictedExerciseIds.includes(exercise.exerciseId) && !request.restrictedExerciseIds.includes(exercise.canonicalExerciseId)) return true;
  return ACTIVE_EXERCISE_SUBSTITUTIONS
    .filter((item) => item.sourceExerciseId === exercise.canonicalExerciseId)
    .some((item) =>
      !request.restrictedExerciseIds.includes(item.alternativeAppExerciseId)
      && !request.restrictedExerciseIds.includes(item.alternativeExerciseId)
      && exerciseEquipmentFits(item.alternativeEquipment, request),
    );
}

function goalFromAnswers(answers: AIProgramAnswers): TemplateGoal {
  if (answers.mainGoal === 'strength') return 'strength';
  if (answers.mainGoal === 'build_muscle') return 'hypertrophy';
  if (answers.mainGoal === 'recomposition') return 'powerbuilding';
  return 'general_fitness';
}

function modalityFromAnswers(answers: AIProgramAnswers): TemplateModality {
  if (answers.mainGoal === 'home_workout') return 'home';
  if (answers.mainGoal === 'yoga') return 'yoga';
  if (answers.mainGoal === 'pilates') return 'pilates';
  if (answers.mainGoal === 'strength') return 'strength';
  if (answers.mainGoal === 'build_muscle') return 'hypertrophy';
  if (answers.mainGoal === 'recomposition') return 'powerbuilding';
  return 'general_fitness';
}

function levelFromAnswers(answers: AIProgramAnswers): TemplateLevel {
  if (answers.experience === 'advanced') return 'advanced';
  if (answers.experience === 'intermediate') return 'intermediate';
  return 'beginner';
}

function splitFromAnswers(answers: AIProgramAnswers): TemplateSplit | undefined {
  return normalizeSplitKey(answers.preferredProgramStyle);
}

function physiqueFocusFromSummary(summary?: AIProgramPhysiqueSummary): ForgePhysiqueFocus[] {
  if (!summary) return [];
  const confidence = summary.confidenceLevel === 'high' ? 0.9 : summary.confidenceLevel === 'medium' ? 0.75 : 0.55;
  return (summary.focusMuscles ?? []).map((muscle, index) => ({
    muscle: normalizeFocusMuscleValue(muscle) ?? muscle,
    priority: index === 0 ? 'high' : 'medium',
    confidence,
  }));
}

export function createProgramRequestFromAnswers(input: {
  userId?: string;
  answers: AIProgramAnswers;
  physiqueSummary?: AIProgramPhysiqueSummary;
  forceNewVariation?: boolean;
  previousTemplateId?: string;
  selectedTemplateId?: string;
}): ProgramRequest {
  const { answers, physiqueSummary } = input;
  const physiqueFocus = answers.useLatestPhysiqueAnalysis ? physiqueFocusFromSummary(physiqueSummary) : [];
  const availableEquipment = normalizeList([
    ...answers.equipment.map(normalizeEquipmentKey),
    answers.location === 'home' ? 'bodyweight' : '',
  ]);
  // Equipment is considered "specified" when user explicitly selected equipment OR location
  const equipmentSpecified = answers.equipment.length > 0 || answers.location !== undefined;
  return {
    userId: input.userId ?? 'local_user',
    goal: goalFromAnswers(answers),
    modality: modalityFromAnswers(answers),
    level: levelFromAnswers(answers),
    daysPerWeek: Math.min(7, Math.max(1, answers.trainingDays ?? 3)),
    preferredSessionMinutes: Math.min(120, Math.max(20, answers.sessionDurationMin ?? 60)),
    equipmentProfile: equipmentProfileFromAnswers(answers, availableEquipment),
    availableEquipment,
    equipmentSpecified,
    focusMuscles: normalizeList(answers.priorityMuscles.map((item) => normalizeFocusMuscleValue(item) ?? item)),
    physiqueFocus,
    restrictedExerciseIds: normalizeList([...(answers.avoidedExerciseIds ?? [])]),
    limitations: normalizeLimitations(answers.painLimitations.length ? answers.painLimitations : ['none']),
    preferredSplit: splitFromAnswers(answers),
    forceNewVariation: !!input.forceNewVariation,
    previousTemplateId: input.previousTemplateId?.trim() || undefined,
    selectedTemplateId: input.selectedTemplateId?.trim() || undefined,
  };
}

export function fingerprintPhysiqueAdaptation(input: {
  requestFingerprint: string;
  templateId: string;
  templateVersion: number;
  focusAreas: PhysiqueFocusArea[];
  equipment: string[];
  limitations: string[];
}): string {
  const hash = stableHash(stableStringify({
    adaptationEngineVersion: 'physique-adaptation-v1',
    requestFingerprint: input.requestFingerprint,
    templateId: input.templateId,
    templateVersion: input.templateVersion,
    focusAreas: input.focusAreas.map((area) => ({
      muscle: area.muscle,
      confidence: Math.round(area.confidence * 100) / 100,
      severity: area.severity,
      source: area.source,
    })),
    equipment: normalizeList(input.equipment),
    limitations: normalizeList(input.limitations),
    adaptationRulesVersion: 'generated-v1',
    substitutionRulesVersion: 'generated-v1',
    orderingRulesVersion: 'focus-order-v1',
  }));
  return `forge-physique-adaptation:v1:${hash}`;
}

export function fingerprintProgramRequest(request: ProgramRequest, templateVersionSeed = ''): string {
  const hash = stableHash(stableStringify({
    engineVersion: 'selection-v3',
    goal: request.goal,
    modality: request.modality,
    level: request.level,
    daysPerWeek: request.daysPerWeek,
    preferredSessionMinutes: request.preferredSessionMinutes,
    equipmentProfile: request.equipmentProfile,
    availableEquipment: normalizeList(request.availableEquipment),
    focusMuscles: normalizeList(request.focusMuscles),
    physiqueFocus: request.physiqueFocus
      .filter((item) => item.confidence >= 0.6)
      .map((item) => ({ muscle: item.muscle, priority: item.priority, confidence: Math.round(item.confidence * 100) / 100 }))
      .sort((a, b) => a.muscle.localeCompare(b.muscle)),
    restrictedExerciseIds: normalizeList(request.restrictedExerciseIds),
    limitations: normalizeList(request.limitations),
    preferredSplit: request.preferredSplit,
    forceNewVariation: !!request.forceNewVariation,
    previousTemplateId: request.previousTemplateId,
    selectedTemplateId: request.selectedTemplateId,
    templateVersionSeed,
    adaptationVersion: ADAPTATION_VERSION,
  }));
  return `forge-program-request:v1:${hash}`;
}

function templateRejections(template: ProgramTemplate, request: ProgramRequest): TemplateRejectionReason[] {
  const rejections: TemplateRejectionReason[] = [];
  if (template.goal !== request.goal) rejections.push({ code: 'GOAL_MISMATCH', message: `Template goal ${template.goal} does not match request goal ${request.goal}.`, field: 'goal' });
  if (WORKOUT_LIBRARY_VERSION === '300' && request.modality && (template.modality ?? template.goal) !== request.modality) {
    rejections.push({ code: 'MODALITY_MISMATCH', message: `Template modality ${template.modality ?? template.goal} does not match request modality ${request.modality}.`, field: 'modality' });
  }
  if (template.daysPerWeek !== request.daysPerWeek) rejections.push({ code: 'DAY_COUNT_MISMATCH', message: `Template has ${template.daysPerWeek} days, request needs ${request.daysPerWeek}.`, field: 'daysPerWeek' });
  if (template.level !== request.level) rejections.push({ code: 'LEVEL_MISMATCH', message: `Template level ${template.level} does not match request level ${request.level}.`, field: 'level' });
  if (!equipmentProfileFits(template, request)) rejections.push({ code: 'EQUIPMENT_MISMATCH', message: `Template equipment profile ${template.equipmentProfile} is unavailable.`, field: 'equipmentProfile' });
  if (request.preferredSplit && request.preferredSplit !== template.split && !(request.preferredSplit === 'full_body' && template.split === 'home_bodyweight')) {
    rejections.push({ code: 'SPLIT_MISMATCH', message: `Template split ${template.split} does not match requested split ${request.preferredSplit}.`, field: 'preferredSplit' });
  }
  if (request.preferredSessionMinutes < template.sessionMinutes.min * 0.85 || request.preferredSessionMinutes > template.sessionMinutes.max * 1.15) {
    rejections.push({ code: 'DURATION_INCOMPATIBLE', message: `Requested ${request.preferredSessionMinutes} minutes is outside template range ${template.sessionMinutes.min}-${template.sessionMinutes.max}.`, field: 'preferredSessionMinutes' });
  }
  for (const workout of template.workouts) {
    for (const exercise of workout.exercises) {
      const restricted = request.restrictedExerciseIds.includes(exercise.exerciseId) || request.restrictedExerciseIds.includes(exercise.canonicalExerciseId);
      if (restricted && exercise.required && !restrictedRequiredExerciseHasSubstitution(exercise, request)) {
        rejections.push({ code: 'REQUIRED_EXERCISE_RESTRICTED', message: `Required exercise ${exercise.exerciseName} is restricted and has no valid reviewed substitution.`, field: 'restrictedExerciseIds' });
      }
      if (exercise.required && !requiredExerciseFitsOrCanSubstitute(exercise, request)) {
        rejections.push({ code: 'NO_VALID_SUBSTITUTION', message: `Required exercise ${exercise.exerciseName} needs unavailable equipment and has no valid substitution.`, field: 'availableEquipment' });
      }
      const limitationConflicts = getExerciseLimitationConflicts(exercise, request.limitations);
      if (exercise.required && limitationConflicts.length > 0 && !limitationConflictCanSubstitute(exercise, request)) {
        rejections.push({
          code: 'LIMITATION_CONFLICT',
          message: `Required exercise ${exercise.exerciseName} conflicts with ${limitationConflicts.join(', ')} and has no reviewed compatible substitution.`,
          field: 'limitations',
        });
      }
    }
  }
  const seen = new Set<string>();
  return rejections.filter((item) => {
    const key = `${item.code}:${item.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function scoreTemplate(template: ProgramTemplate, request: ProgramRequest): TemplateMatchResult {
  const rejections = templateRejections(template, request);
  const focusHits = request.focusMuscles.filter((muscle) => template.compatibleFocusMuscles.includes(muscle)).length;
  const durationDistance = Math.abs(request.preferredSessionMinutes - template.sessionMinutes.target);

  // Goal/Modality scoring (30 points max)
  let goalScore = 0;
  if (template.goal === request.goal) {
    goalScore = 30;
    // Bonus for modality match in 300-library
    if (WORKOUT_LIBRARY_VERSION === '300' && request.modality && (template.modality ?? template.goal) === request.modality) {
      goalScore = 30; // Already max for exact goal match
    }
  } else {
    // Partial score for goal proximity
    const goalHierarchy: Record<TemplateGoal, number> = { strength: 3, powerbuilding: 2, hypertrophy: 2, general_fitness: 1 };
    const requestLevel = goalHierarchy[request.goal] ?? 1;
    const templateLevel = goalHierarchy[template.goal] ?? 1;
    goalScore = Math.max(0, 15 - Math.abs(requestLevel - templateLevel) * 5);
  }

  // Days per week scoring (25 points max)
  const daysScore = template.daysPerWeek === request.daysPerWeek ? 25 : Math.max(0, 25 - Math.abs(template.daysPerWeek - request.daysPerWeek) * 8);

  // Equipment compatibility/accessibility scoring (20 points max)
  let equipmentScore = 0;
  if (request.equipmentSpecified) {
    // When equipment is specified, exact match gets max score
    equipmentScore = equipmentProfileScore(template, request);
    // Scale up to 20 points max
    if (equipmentScore === 10) equipmentScore = 20;
    else if (equipmentScore === 6) equipmentScore = 12;
    else equipmentScore = 0;
  } else {
    // When equipment is unspecified, score based on accessibility
    // Fewer equipment requirements = more accessible = higher score
    const equipmentComplexity: Record<TemplateEquipmentProfile, number> = {
      bodyweight_home: 20,
      resistance_band_bodyweight: 18,
      dumbbell_only: 15,
      full_gym: 10,
      custom: 5,
    };
    equipmentScore = equipmentComplexity[template.equipmentProfile as TemplateEquipmentProfile] ?? 5;
  }

  // Level proximity scoring (10 points max)
  const levelHierarchy: Record<TemplateLevel, number> = { beginner: 1, intermediate: 2, advanced: 3 };
  const requestLevel = levelHierarchy[request.level] ?? 1;
  const templateLevel = levelHierarchy[template.level] ?? 1;
  const levelDistance = Math.abs(requestLevel - templateLevel);
  const levelScore = levelDistance === 0 ? 10 : levelDistance === 1 ? 6 : 2;

  // Duration proximity scoring (10 points max)
  let durationScore = 0;
  if (durationDistance === 0) durationScore = 10;
  else if (durationDistance <= 10) durationScore = 8;
  else if (durationDistance <= 20) durationScore = 5;
  else if (durationDistance <= 30) durationScore = 3;
  else durationScore = 1;

  // Split and focus muscle preference scoring (5 points max)
  const splitScore = request.preferredSplit && request.preferredSplit === template.split ? 3 : 0;
  const focusScore = Math.min(2, focusHits); // Max 2 points for focus muscles

  // Adaptation cost penalty (only when equipment is specified)
  const adaptationCostPenalty = request.equipmentSpecified ? template.workouts.flatMap((workout) => workout.exercises).reduce((penalty, exercise) => {
    const equipmentPenalty = exercise.required && !exerciseEquipmentFits(exercise.equipment, request) ? -3 : 0;
    const limitationPenalty = exercise.required && getExerciseLimitationConflicts(exercise, request.limitations).length > 0 ? -4 : 0;
    return penalty + equipmentPenalty + limitationPenalty;
  }, 0) : 0;

  const breakdown = {
    goal: goalScore,
    days: daysScore,
    level: levelScore,
    equipment: equipmentScore,
    duration: durationScore,
    focus: focusScore,
    split: splitScore,
    adaptationCostPenalty,
  };

  return {
    templateId: template.id,
    totalScore: Object.values(breakdown).reduce((sum, item) => sum + (typeof item === 'number' ? item : 0), 0),
    matchMode: 'strict_match',
    relaxationsApplied: [],
    breakdown,
    explanation: [
      `goal=${breakdown.goal}`,
      `days=${breakdown.days}`,
      `level=${breakdown.level}`,
      `equipment=${breakdown.equipment}`,
      `duration=${breakdown.duration}`,
      `focus=${breakdown.focus}`,
      `split=${breakdown.split}`,
      `adaptationCostPenalty=${breakdown.adaptationCostPenalty}`,
    ],
    rejectionReasons: rejections.length ? rejections.map((item) => item.code) : undefined,
    rejectionDetails: rejections.length ? rejections : undefined,
  };
}

export function matchTemplates(request: ProgramRequest): { compatible: TemplateMatchResult[]; rejected: TemplateMatchResult[] } {
  const scored = PROGRAM_TEMPLATES.map((template) => scoreTemplate(template, request));
  const compatible = scored
    .filter((item) => !item.rejectionReasons?.length)
    .sort((left, right) => {
      if (right.totalScore !== left.totalScore) return right.totalScore - left.totalScore;
      const leftTemplate = PROGRAM_TEMPLATES.find((template) => template.id === left.templateId)!;
      const rightTemplate = PROGRAM_TEMPLATES.find((template) => template.id === right.templateId)!;
      const leftDuration = Math.abs(request.preferredSessionMinutes - leftTemplate.sessionMinutes.target);
      const rightDuration = Math.abs(request.preferredSessionMinutes - rightTemplate.sessionMinutes.target);
      const leftPenalty = left.breakdown.adaptationCostPenalty ?? 0;
      const rightPenalty = right.breakdown.adaptationCostPenalty ?? 0;
      if (rightPenalty !== leftPenalty) return rightPenalty - leftPenalty;
      if (leftDuration !== rightDuration) return leftDuration - rightDuration;
      if (right.breakdown.equipment !== left.breakdown.equipment) return right.breakdown.equipment - left.breakdown.equipment;
      if (right.breakdown.split !== left.breakdown.split) return right.breakdown.split - left.breakdown.split;
      if (!request.forceNewVariation && request.previousTemplateId) {
        if (left.templateId === request.previousTemplateId) return -1;
        if (right.templateId === request.previousTemplateId) return 1;
      }
      return left.templateId.localeCompare(right.templateId);
    });
  return { compatible, rejected: scored.filter((item) => item.rejectionReasons?.length) };
}

type RelaxedRequestCandidate = {
  request: ProgramRequest;
  relaxationsApplied: string[];
};

function cloneRequest(request: ProgramRequest): ProgramRequest {
  return {
    ...request,
    availableEquipment: [...request.availableEquipment],
    focusMuscles: [...request.focusMuscles],
    physiqueFocus: request.physiqueFocus.map((item) => ({ ...item })),
    restrictedExerciseIds: [...request.restrictedExerciseIds],
    limitations: [...request.limitations],
    equipmentSpecified: request.equipmentSpecified,
  };
}

function createRelaxedRequestCandidates(request: ProgramRequest): RelaxedRequestCandidate[] {
  const candidates: RelaxedRequestCandidate[] = [];
  const add = (patch: Partial<ProgramRequest>, reason: string) => {
    candidates.push({
      request: { ...cloneRequest(request), ...patch },
      relaxationsApplied: [reason],
    });
  };
  const addCombo = (patch: Partial<ProgramRequest>, reasons: string[]) => {
    candidates.push({
      request: { ...cloneRequest(request), ...patch },
      relaxationsApplied: reasons,
    });
  };

  if (request.preferredSplit) {
    add({ preferredSplit: undefined }, 'Split tercihini otomatik kabul ettik.');
  }

  if (request.preferredSessionMinutes < 50) {
    add({ preferredSessionMinutes: 60 }, `Süre hedefini ${request.preferredSessionMinutes} dk yerine 60 dk template toleransına çektik.`);
  } else if (request.preferredSessionMinutes > 75) {
    add({ preferredSessionMinutes: 75 }, `Süre hedefini ${request.preferredSessionMinutes} dk yerine 75 dk template toleransına çektik.`);
  }

  const dayCandidates = [3, 4, 5, 6]
    .filter((days) => days !== request.daysPerWeek)
    .sort((left, right) => Math.abs(left - request.daysPerWeek) - Math.abs(right - request.daysPerWeek) || left - right);
  for (const days of dayCandidates.slice(0, 2)) {
    add({ daysPerWeek: days }, `${request.daysPerWeek} gün için tam eşleşme yoktu; en yakın güvenli ${days} günlük planı değerlendirdik.`);
  }

  if (request.level === 'advanced') {
    add({ level: 'intermediate' }, 'Advanced seviyede tam eşleşme yoktu; intermediate curated template güvenli alternatif olarak değerlendirildi.');
  } else if (request.level === 'intermediate') {
    add({ level: 'beginner' }, 'Intermediate seviyede tam eşleşme yoktu; beginner curated template daha güvenli alternatif olarak değerlendirildi.');
  }

  if (request.goal !== 'general_fitness' && request.goal !== 'strength') {
    const reason = request.equipmentProfile === 'full_gym'
      ? `${request.goal} hedefinde tam eşleşme yoktu; güvenli general fitness template alternatif olarak değerlendirildi.`
      : `Seçili ekipmanla ${request.goal} curated template yoktu; güvenli general fitness template alternatif olarak değerlendirildi.`;
    add({ goal: 'general_fitness' }, reason);
  }

  const safeBase: Partial<ProgramRequest> = {
    preferredSplit: undefined,
    preferredSessionMinutes: request.preferredSessionMinutes < 50 ? 60 : Math.min(75, Math.max(60, request.preferredSessionMinutes)),
  };
  for (const days of dayCandidates.slice(0, 2)) {
    addCombo(
      { ...safeBase, daysPerWeek: days },
      [
        'Split tercihini otomatik kabul ettik.',
        `${request.daysPerWeek} gün için tam eşleşme yoktu; en yakın güvenli ${days} günlük planı değerlendirdik.`,
      ],
    );
  }

  if (request.goal !== 'general_fitness' && request.goal !== 'strength') {
    const fallbackDays = request.daysPerWeek <= 4 ? 3 : 4;
    addCombo(
      {
        ...safeBase,
        goal: 'general_fitness',
        daysPerWeek: fallbackDays,
        level: request.level === 'advanced' ? 'intermediate' : request.level,
      },
      [
        'Tam eşleşme yoktu; en yakın güvenli planı seçmek için tercihleri kontrollü gevşettik.',
        `Seçili hedef/ekipman kombinasyonu için curated template yoktu; general fitness template güvenli alternatif olarak değerlendirildi.`,
        `${request.daysPerWeek} gün yerine ${fallbackDays} günlük güvenli plan değerlendirildi.`,
      ],
    );
    if (request.equipmentProfile !== 'full_gym' || request.level !== 'beginner') {
      addCombo(
        {
          ...safeBase,
          goal: 'general_fitness',
          daysPerWeek: 3,
          level: 'beginner',
        },
        [
          'Tam eşleşme yoktu; en yakın güvenli planı seçmek için tercihleri kontrollü gevşettik.',
          `Seçili hedef/ekipman kombinasyonu için curated template yoktu; beginner general fitness template güvenli alternatif olarak değerlendirildi.`,
          `${request.daysPerWeek} gün yerine 3 günlük güvenli plan değerlendirildi.`,
        ],
      );
    }
  }

  const seen = new Set<string>();
  return candidates.filter((candidate) => {
    const key = stableStringify({
      goal: candidate.request.goal,
      level: candidate.request.level,
      daysPerWeek: candidate.request.daysPerWeek,
      preferredSessionMinutes: candidate.request.preferredSessionMinutes,
      preferredSplit: candidate.request.preferredSplit,
    });
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function matchTemplatesWithRelaxation(request: ProgramRequest): {
  compatible: TemplateMatchResult[];
  rejected: TemplateMatchResult[];
  effectiveRequest: ProgramRequest;
  matchMode: 'strict_match' | 'relaxed_match' | 'no_safe_match';
  relaxationsApplied: string[];
  strictRejected: TemplateMatchResult[];
} {
  const strict = matchTemplates(request);
  if (WORKOUT_LIBRARY_VERSION === '300') {
    return {
      ...strict,
      effectiveRequest: request,
      matchMode: strict.compatible.length > 0 ? 'strict_match' : 'no_safe_match',
      relaxationsApplied: [],
      strictRejected: strict.rejected,
    };
  }
  if (strict.compatible.length > 0) {
    return {
      ...strict,
      effectiveRequest: request,
      matchMode: 'strict_match',
      relaxationsApplied: [],
      strictRejected: strict.rejected,
    };
  }

  for (const candidate of createRelaxedRequestCandidates(request)) {
    const relaxed = matchTemplates(candidate.request);
    if (relaxed.compatible.length > 0) {
      const compatible = relaxed.compatible.map((item) => ({
        ...item,
        matchMode: 'relaxed_match' as const,
        relaxationsApplied: [...candidate.relaxationsApplied],
      }));
      return {
        compatible,
        rejected: relaxed.rejected,
        effectiveRequest: candidate.request,
        matchMode: 'relaxed_match',
        relaxationsApplied: [...candidate.relaxationsApplied],
        strictRejected: strict.rejected,
      };
    }
  }

  return {
    compatible: [],
    rejected: strict.rejected,
    effectiveRequest: request,
    matchMode: 'no_safe_match',
    relaxationsApplied: [],
    strictRejected: strict.rejected,
  };
}

function selectTemplateWithRelaxation(request: ProgramRequest): {
  template: ProgramTemplate;
  match: TemplateMatchResult;
  rejected: TemplateMatchResult[];
  compatible: TemplateMatchResult[];
  effectiveRequest: ProgramRequest;
  matchMode: 'strict_match' | 'relaxed_match' | 'no_safe_match';
  relaxationsApplied: string[];
} {
  // If a specific template is selected, use it directly
  if (request.selectedTemplateId) {
    const template = PROGRAM_TEMPLATES.find((item) => item.id === request.selectedTemplateId);
    if (!template) throw new Error(`Selected template ${request.selectedTemplateId} is missing.`);

    // Score the selected template for consistent match result
    const match = scoreTemplate(template, request);
    if (match.rejectionReasons?.length) {
      throw new Error(`Selected template ${request.selectedTemplateId} is incompatible: ${match.rejectionReasons.join(', ')}`);
    }

    const allMatches = matchTemplatesWithRelaxation(request);
    return {
      template,
      match,
      rejected: allMatches.matchMode === 'relaxed_match' ? allMatches.strictRejected : allMatches.rejected,
      compatible: allMatches.compatible,
      effectiveRequest: allMatches.effectiveRequest,
      matchMode: 'strict_match',
      relaxationsApplied: [],
    };
  }

  const matches = matchTemplatesWithRelaxation(request);
  let pool = matches.compatible;
  if (matches.effectiveRequest.forceNewVariation && matches.effectiveRequest.previousTemplateId && matches.compatible.length > 1) {
    const bestScore = matches.compatible[0]?.totalScore ?? 0;
    const alternativePool = matches.compatible.filter((item) => item.templateId !== matches.effectiveRequest.previousTemplateId && item.totalScore >= bestScore - 8);
    if (alternativePool.length) pool = alternativePool;
  }
  const match = pool[0];
  if (!match) throw new Error(`No compatible FORGE CSV template found: ${matches.rejected.map((item) => `${item.templateId}:${item.rejectionReasons?.join('/')}`).join(', ')}`);
  const selectedTemplate = PROGRAM_TEMPLATES.find((item) => item.id === match.templateId);
  if (!selectedTemplate) throw new Error(`Selected template ${match.templateId} is missing.`);
  return {
    template: selectedTemplate,
    match,
    rejected: matches.matchMode === 'relaxed_match' ? matches.strictRejected : matches.rejected,
    compatible: matches.compatible,
    effectiveRequest: matches.effectiveRequest,
    matchMode: matches.matchMode,
    relaxationsApplied: matches.relaxationsApplied,
  };
}

function cloneWorkouts(template: ProgramTemplate): MutableWorkoutDay[] {
  return template.workouts.map((workout) => ({
    ...workout,
    focus: [...workout.focus],
    exercises: workout.exercises.map((exercise) => ({
      ...exercise,
      primaryMuscles: [...exercise.primaryMuscles],
      equipment: [...exercise.equipment],
    })),
  }));
}

function substituteExercise(exercise: MutableExercise, request: ProgramRequest, usedExerciseIds: Set<string>): AppliedAdaptation | null {
  const candidates = ACTIVE_EXERCISE_SUBSTITUTIONS
    .filter((item) => item.sourceExerciseId === exercise.canonicalExerciseId)
    .sort((left, right) => left.deterministicRank - right.deterministicRank);
  const replacement = candidates.find((candidate) =>
    !usedExerciseIds.has(candidate.alternativeAppExerciseId)
    && !request.restrictedExerciseIds.includes(candidate.alternativeAppExerciseId)
    && !request.restrictedExerciseIds.includes(candidate.alternativeExerciseId)
    && exerciseEquipmentFits(candidate.alternativeEquipment, request),
  );
  if (!replacement) return null;
  const previous = exercise.exerciseId;
  exercise.adaptedFromExerciseId = previous;
  exercise.exerciseId = replacement.alternativeAppExerciseId;
  exercise.canonicalExerciseId = replacement.alternativeExerciseId;
  exercise.equipment = [...replacement.alternativeEquipment];
  return {
    type: 'exercise_substitution',
    reason: replacement.reason,
    dayIndex: undefined,
    exerciseId: previous,
    replacementExerciseId: replacement.alternativeAppExerciseId,
  };
}

function substituteForLimitation(exercise: MutableExercise, request: ProgramRequest, usedExerciseIds: Set<string>): AppliedAdaptation | null {
  const conflicts = getExerciseLimitationConflicts(exercise, request.limitations);
  if (conflicts.length === 0) return null;
  const match = findValidLimitationSubstitution(exercise, request, conflicts, usedExerciseIds);
  if (!match) return null;
  const previous = exercise.exerciseId;
  exercise.adaptedFromExerciseId = previous;
  exercise.exerciseId = match.replacement.alternativeAppExerciseId;
  exercise.canonicalExerciseId = match.replacement.alternativeExerciseId;
  exercise.equipment = [...match.replacement.alternativeEquipment];
  return {
    type: 'limitation_substitution',
    reason: `Reviewed replacement for ${match.limitation}.`,
    triggeringLimitation: match.limitation,
    dayIndex: undefined,
    exerciseId: previous,
    replacementExerciseId: match.replacement.alternativeAppExerciseId,
  };
}

function eligibleFocus(request: ProgramRequest, template: ProgramTemplate): { selected: PhysiqueFocusArea[]; ignored: IgnoredPhysiqueFocusArea[] } {
  if (template.modality === 'yoga' || template.modality === 'pilates') {
    const normalized = normalizePhysiqueFocusAreas({
      manualFocusMuscles: request.focusMuscles,
      physiqueFocus: request.physiqueFocus,
    });
    return {
      selected: [],
      ignored: [
        ...normalized.ignored,
        ...normalized.focusAreas.map((area) => ({
          rawMuscle: area.muscle,
          reason: 'TEMPLATE_INCOMPATIBLE' as const,
        })),
      ],
    };
  }
  const normalized = normalizePhysiqueFocusAreas({
    manualFocusMuscles: request.focusMuscles,
    physiqueFocus: request.physiqueFocus,
  });
  const selected = selectPhysiqueFocusAreas({
    focusAreas: normalized.focusAreas,
    compatibleFocusMuscles: template.compatibleFocusMuscles,
    maxFocusMuscles: template.maxFocusMuscles,
  });
  return { selected: selected.selected, ignored: [...normalized.ignored, ...selected.ignored] };
}

function estimateSessionMinutes(workout: MutableWorkoutDay): number {
  const workSeconds = workout.exercises.reduce((sum, exercise) => sum + (exercise.sets * 45) + Math.max(0, exercise.sets - 1) * exercise.restSeconds, 0);
  return Math.ceil(workSeconds / 60);
}

function adaptTemplate(template: ProgramTemplate, request: ProgramRequest): { workouts: MutableWorkoutDay[]; adaptations: AppliedAdaptation[]; selectedFocusAreas: PhysiqueFocusArea[]; ignoredFocusAreas: IgnoredPhysiqueFocusArea[] } {
  const workouts = cloneWorkouts(template);
  const adaptations: AppliedAdaptation[] = [];
  for (const workout of workouts) {
    const used = new Set(workout.exercises.map((exercise) => exercise.exerciseId));
    for (const exercise of workout.exercises) {
      const limitationConflicts = getExerciseLimitationConflicts(exercise, request.limitations);
      const restricted = request.restrictedExerciseIds.includes(exercise.exerciseId) || request.restrictedExerciseIds.includes(exercise.canonicalExerciseId);
      const unavailable = !exerciseEquipmentFits(exercise.equipment, request);
      if ((!restricted && !unavailable && limitationConflicts.length === 0) || exercise.required && restricted) continue;
      used.delete(exercise.exerciseId);
      const adaptation = limitationConflicts.length > 0
        ? substituteForLimitation(exercise, request, used)
        : substituteExercise(exercise, request, used);
      if (adaptation) {
        adaptation.dayIndex = workout.dayIndex;
        adaptations.push(adaptation);
        used.add(exercise.exerciseId);
      }
    }
  }

  const focusSelection = eligibleFocus(request, template);
  const focusItems = focusSelection.selected;
  const adaptedFocus = new Set<string>();
  const totalWeeklySetIncreaseCap = request.level === 'beginner' ? 2 : 4;
  let totalWeeklySetIncrease = 0;
  for (const focus of focusItems) {
    const rule = ACTIVE_ADAPTATION_RULES.find((item) => item.focusMuscle === focus.muscle && item.goal === template.goal);
    if (!rule) continue;
    const preferredIds = new Set<string>(rule.preferredExerciseIds);
    const priorityTarget = workouts
      .flatMap((workout) => workout.exercises.map((exercise) => ({ workout, exercise })))
      .find(({ exercise }) => preferredIds.has(exercise.canonicalExerciseId) && !exercise.required);
    if (priorityTarget) {
      adaptations.push({
        id: adaptationId([template.id, String(priorityTarget.workout.dayIndex), priorityTarget.exercise.exerciseId, focus.muscle, 'priority']),
        type: 'priority_change',
        reason: rule.userFacingCopyTr,
        focusMuscle: focus.muscle,
        confidence: focus.confidence,
        severity: focus.severity,
        source: focus.source,
        dayIndex: priorityTarget.workout.dayIndex,
        exerciseId: priorityTarget.exercise.exerciseId,
        reasonCode: 'PHYSIQUE_PRIORITY',
        userFacingReason: rule.userFacingCopyTr,
      });
    }

    const maxByConfidence = focus.confidence >= 0.9 ? Math.min(rule.maxExtraDirectSetsWeek, 2) : focus.confidence >= 0.75 ? Math.min(rule.maxExtraDirectSetsWeek, 2) : 0;
    const levelCap = request.level === 'beginner' && focus.source !== 'manual_user_choice' ? 2 : maxByConfidence;
    const maxExtra = Math.min(levelCap, template.maxExtraSetsPerFocusMuscleWeek, totalWeeklySetIncreaseCap - totalWeeklySetIncrease);
    if (maxExtra <= 0 || !focusAreaAllowsVolume(focus)) {
      adaptedFocus.add(focus.muscle);
      continue;
    }
    const target = workouts
      .flatMap((workout) => workout.exercises.map((exercise) => ({ workout, exercise })))
      .find(({ exercise }) => exercise.primaryMuscles.includes(focus.muscle) && !exercise.required && exercise.role !== 'main_lift');
    if (!target) continue;
    if (estimateSessionMinutes(target.workout) + 3 > template.sessionMinutes.max) continue;
    const added = Math.min(1, maxExtra);
    const previousSets = target.exercise.sets;
    target.exercise.sets += added;
    totalWeeklySetIncrease += added;
    adaptedFocus.add(focus.muscle);
    adaptations.push({
      id: adaptationId([template.id, String(target.workout.dayIndex), target.exercise.exerciseId, focus.muscle, 'volume', String(added)]),
      type: 'volume_added',
      reason: rule.userFacingCopyTr,
      focusMuscle: focus.muscle,
      confidence: focus.confidence,
      severity: focus.severity,
      source: focus.source,
      dayIndex: target.workout.dayIndex,
      exerciseId: target.exercise.exerciseId,
      setsChanged: added,
      previousSets,
      newSets: target.exercise.sets,
      reasonCode: 'PHYSIQUE_VOLUME_ADDED',
      userFacingReason: rule.userFacingCopyTr,
    });
  }

  if (adaptedFocus.size > template.maxFocusMuscles) {
    throw new Error(`Too many focus muscles adapted for ${template.id}`);
  }

  return { workouts, adaptations, selectedFocusAreas: focusItems, ignoredFocusAreas: focusSelection.ignored };
}

function validateProgram(template: ProgramTemplate, request: ProgramRequest, workouts: MutableWorkoutDay[], adaptations: AppliedAdaptation[]): ProgramValidationResult {
  const errors: TemplateValidationIssue[] = [];
  const warnings: TemplateValidationIssue[] = [];
  if (workouts.length !== request.daysPerWeek) errors.push({ code: 'day_count_mismatch', message: 'Requested day count was not preserved.' });
  if (new Set(adaptations.filter((item) => item.focusMuscle).map((item) => item.focusMuscle)).size > template.maxFocusMuscles) {
    errors.push({ code: 'focus_cap_exceeded', message: 'More than two focus muscles were adapted.' });
  }
  const weeklySetDelta = adaptations.reduce((sum, item) => sum + (item.type === 'volume_added' ? (item.setsChanged ?? 0) : item.type === 'volume_removed' ? -(item.setsChanged ?? 0) : 0), 0);
  const weeklySetCap = request.level === 'beginner' ? 2 : 4;
  if (weeklySetDelta > weeklySetCap) {
    errors.push({ code: 'physique_volume_cap_exceeded', message: `Physique adaptation added ${weeklySetDelta} sets; cap is ${weeklySetCap}.` });
  }
  for (const workout of workouts) {
    if (!workout.exercises.length) errors.push({ code: 'empty_day', message: 'Workout day is empty.', location: String(workout.dayIndex) });
    const ids = new Set<string>();
    const firstIsolation = workout.exercises.find((exercise) => exercise.role === 'isolation')?.order ?? Infinity;
    for (const exercise of workout.exercises) {
      if (!hasExercise(exercise.exerciseId)) errors.push({ code: 'missing_exercise', message: `Exercise ${exercise.exerciseId} does not exist.`, location: exercise.exerciseId });
      if (ids.has(exercise.exerciseId)) errors.push({ code: 'duplicate_exercise', message: 'Duplicate exercise in one day.', location: `${workout.dayIndex}:${exercise.exerciseId}` });
      ids.add(exercise.exerciseId);
      if (request.restrictedExerciseIds.includes(exercise.exerciseId) || request.restrictedExerciseIds.includes(exercise.canonicalExerciseId)) {
        errors.push({ code: 'restricted_exercise', message: 'Restricted exercise remains in program.', location: exercise.exerciseId });
      }
      const limitationConflicts = getExerciseLimitationConflicts(exercise, request.limitations);
      if (exercise.required && limitationConflicts.length > 0) {
        errors.push({ code: 'limitation_conflict', message: `Required exercise conflicts with declared limitations: ${limitationConflicts.join(', ')}.`, location: exercise.exerciseId });
      }
      if (!exerciseEquipmentFits(exercise.equipment, request) && !exercise.adaptedFromExerciseId) {
        warnings.push({ code: 'equipment_uncertain', message: 'Exercise equipment may not match request.', location: exercise.exerciseId });
      }
      if (exercise.role === 'main_lift' && exercise.order > firstIsolation) {
        errors.push({ code: 'main_lift_after_isolation', message: 'Main lift appears after isolation.', location: `${workout.dayIndex}:${exercise.exerciseId}` });
      }
      if (exercise.sets < 1 || exercise.repsMin < 1 || exercise.repsMax < exercise.repsMin) {
        errors.push({ code: 'invalid_prescription', message: 'Invalid sets or reps.', location: exercise.exerciseId });
      }
      if (exercise.sets > 6) {
        errors.push({ code: 'exercise_set_cap_exceeded', message: 'Exercise set cap exceeded after adaptation.', location: exercise.exerciseId });
      }
      if (template.goal === 'strength' && exercise.role === 'main_lift' && exercise.repsMax > 6) {
        warnings.push({ code: 'strength_main_lift_reps', message: 'Strength main lift uses a higher rep prescription from the curated CSV.', location: exercise.exerciseId });
      }
    }
    if (estimateSessionMinutes(workout) > template.sessionMinutes.max) {
      errors.push({ code: 'session_duration_limit', message: 'Adapted session exceeds template duration max.', location: String(workout.dayIndex) });
    }
    const patternCounts = workout.exercises.reduce<Record<string, number>>((acc, exercise) => {
      acc[exercise.movementPattern] = (acc[exercise.movementPattern] ?? 0) + 1;
      return acc;
    }, {});
    for (const [pattern, count] of Object.entries(patternCounts)) {
      if (count > 3) warnings.push({ code: 'same_pattern_redundancy', message: `Potential redundancy: ${pattern}.`, location: String(workout.dayIndex) });
    }
  }
  return { valid: errors.length === 0, errors, warnings };
}

function repsLabel(exercise: MutableExercise): { reps: number; label: string } {
  if (exercise.prescriptionType === 'duration') {
    const max = exercise.durationSecondsMax ?? exercise.durationSecondsMin ?? exercise.repsMax;
    return { reps: max, label: `${max} sn` };
  }
  if (exercise.prescriptionType === 'breaths') {
    const min = exercise.breathsMin ?? exercise.repsMin;
    const max = exercise.breathsMax ?? exercise.repsMax;
    return { reps: max, label: min === max ? `${max} nefes` : `${min}-${max} nefes` };
  }
  if (exercise.prescriptionType === 'rounds') {
    return { reps: exercise.repsMax, label: `${exercise.sets} tur` };
  }
  if (exercise.repsMin === exercise.repsMax) return { reps: exercise.repsMax, label: exercise.repsMax > 25 ? `${exercise.repsMax} sn` : `${exercise.repsMax} tekrar` };
  return { reps: exercise.repsMax, label: `${exercise.repsMin}-${exercise.repsMax} tekrar` };
}

function toWeeks(planId: string, template: ProgramTemplate, workouts: MutableWorkoutDay[]): AIGeneratedWeek[] {
  return Array.from({ length: template.durationWeeks }, (_, weekIndex) => ({
    weekIndex,
    title: `${weekIndex + 1}. Hafta`,
    guidance: weekIndex === 0 ? 'Template yapısını tanı ve uygun çalışma ağırlığını seç.' : 'Progression kuralına göre tekrar veya yükü küçük artır.',
    isDeload: weekIndex === template.durationWeeks - 1 && template.durationWeeks >= 8,
    days: workouts.map((workout, dayIndex): AIDayPrescription => {
      const exercises = workout.exercises.map((exercise) => {
        const rep = repsLabel(exercise);
        return {
          exerciseId: exercise.exerciseId,
          sets: weekIndex === template.durationWeeks - 1 && template.durationWeeks >= 8 ? Math.max(2, exercise.sets - 1) : exercise.sets,
          reps: rep.reps,
          repLabel: rep.label,
          prescriptionType: exercise.prescriptionType ?? 'reps',
          durationSecondsMin: exercise.durationSecondsMin,
          durationSecondsMax: exercise.durationSecondsMax,
          breathsMin: exercise.breathsMin,
          breathsMax: exercise.breathsMax,
          restSeconds: exercise.restSeconds,
          rir: weekIndex === template.durationWeeks - 1 && template.durationWeeks >= 8 ? Math.max(3, exercise.targetRir) : exercise.targetRir,
          alternatives: [],
        };
      });
      return {
        id: `${planId}-w${weekIndex + 1}-d${dayIndex + 1}`,
        weekIndex,
        dayIndex,
        title: workout.name,
        subtitle: workout.focus.join(' + '),
        durationMin: template.sessionMinutes.target,
        difficulty: 'Orta',
        totalSets: exercises.reduce((sum, exercise) => sum + exercise.sets, 0),
        exercises,
        exerciseIds: exercises.map((exercise) => exercise.exerciseId),
        notes: 'Hedeflerine ve tercihlerine göre en uygun program seçildi ve sana göre uyarlandı.',
      };
    }),
  }));
}

function splitKey(split: string): AIProgramSplitKey {
  if (split === 'full_body') return 'full_body';
  if (split === 'upper_lower' || split === 'powerbuilding') return 'upper_lower';
  if (split === 'push_pull_legs') return 'push_pull_legs';
  if (split === 'body_part') return 'body_part_emphasis';
  return 'hybrid';
}

function progressionModel(template: ProgramTemplate): AIProgramDecisionBlueprint['progressionModel'] {
  if (template.progressionRuleId.includes('linear')) return 'session_to_session_lp';
  if (template.progressionRuleId.includes('double')) return 'double_progression';
  if (template.progressionRuleId.includes('top_set')) return 'top_set_backoff';
  return 'rep_range_linear';
}

function programFamily(goal: TemplateGoal): AIProgramDecisionBlueprint['programFamily'] {
  if (goal === 'hypertrophy') return 'hypertrophy';
  if (goal === 'powerbuilding') return 'powerbuilding';
  if (goal === 'strength') return 'strength';
  return 'general_fitness';
}

function goalClassification(goal: TemplateGoal): AIProgramDecisionBlueprint['goalClassification'] {
  if (goal === 'hypertrophy') return 'hypertrophy';
  if (goal === 'powerbuilding') return 'powerbuilding';
  if (goal === 'strength') return 'general_strength';
  return 'general_fitness';
}

function artifacts(template: ProgramTemplate, request: ProgramRequest, match: TemplateMatchResult, compatible: TemplateMatchResult[], validation: ProgramValidationResult, adaptations: AppliedAdaptation[], relaxationsApplied: string[]): Pick<AIProgramPlan, 'sourceBlueprint' | 'sourceVolume' | 'sourceAssembly' | 'sourceProgression' | 'validation' | 'explanation'> {
  const alternatives: AIProgramAlternativeDecision[] = compatible.slice(1, 3).map((item) => {
    const candidate = PROGRAM_TEMPLATES.find((templateItem) => templateItem.id === item.templateId)!;
    return {
      split: splitKey(candidate.split),
      label: candidate.name,
      weeklyStructure: candidate.workouts.map((workout) => workout.name),
      score: item.totalScore,
      rationale: [`Template score: ${item.totalScore}`],
      tradeoffs: [`${candidate.daysPerWeek} gün · ${candidate.equipmentProfile}`],
    };
  });
  const blueprint: AIProgramDecisionBlueprint = {
    stylePreference: 'auto',
    programFamily: programFamily(template.goal),
    goalClassification: goalClassification(template.goal),
    targetLiftPatterns: template.goal === 'strength' ? ['squat', 'bench', 'deadlift', 'row'] : [],
    programArchetype: template.split === 'full_body' ? (template.goal === 'strength' ? 'full_body_strength_skill' : 'full_body_hypertrophy') : template.split === 'upper_lower' ? (template.goal === 'strength' ? 'upper_lower_strength' : 'upper_lower_hypertrophy') : template.split === 'push_pull_legs' ? 'ppl_hypertrophy' : 'hybrid_athletic',
    programArchetypeLabel: template.name,
    programArchetypeRationale: [`CSV source-of-truth template ${template.id} seçildi.`],
    weeklyArchitecture: { label: template.split, split: splitKey(template.split), dayRoles: [], notes: template.workouts.map((workout) => workout.name) },
    progressionModel: progressionModel(template),
    fatigueStrategy: ['CSV progression kuralı ve template hacim sınırları korunur.'],
    exerciseRolePolicy: template.goal === 'strength' ? 'strength_role_driven' : template.goal === 'hypertrophy' ? 'hypertrophy_region_driven' : template.goal === 'powerbuilding' ? 'powerbuilding_hybrid' : 'general_fitness_minimum_effective',
    recommendedSplit: splitKey(template.split),
    recommendedSplitLabel: template.split,
    recommendedTrainingDays: template.daysPerWeek,
    weeklyStructure: template.workouts.map((workout) => workout.name),
    rationale: [`Template score: ${match.totalScore}`, `Source template: ${template.id}@${template.version}`, ...relaxationsApplied],
    goalStrategy: [`${request.goal} hedefi için curated CSV template seçildi.`],
    priorityMuscleStrategy: adaptations.filter((item) => item.focusMuscle).map((item) => item.reason),
    recoveryStrategy: ['Adaptasyon kontrollü tutulur; log ve check-in ileride koç motoruna aktarılır.'],
    volumeDirection: request.level === 'advanced' ? 'moderate_high' : request.level === 'beginner' ? 'conservative' : 'moderate',
    effortStrategy: ['RIR hedefleri CSV prescription içinden gelir.'],
    frequencyStrategy: [`Haftada ${template.daysPerWeek} gün.`],
    safetyConstraints: validation.warnings.map((item) => item.message),
    assumptions: ['Program rastgele yazılmadı; curated CSV template seçildi.', ...relaxationsApplied],
    confidence: match.totalScore >= 85 ? 'high' : 'medium',
    confidenceRationale: [`Deterministic score: ${match.totalScore}.`],
    alternativesConsidered: alternatives,
    evidenceCategories: ['template_match', 'csv_template_match', 'controlled_adaptation'],
    whyThisPlan: relaxationsApplied.length
      ? ['Tam eşleşme yoktu; en yakın güvenli planı seçtik.', ...relaxationsApplied]
      : ['Hedeflerine ve tercihlerine göre en uygun program seçildi ve sana göre uyarlandı.'],
    futureExerciseConstraints: [],
  };
  const totalSets = template.workouts.reduce((sum, workout) => sum + workout.exercises.reduce((daySum, exercise) => daySum + exercise.sets, 0), 0);
  const progressionRule = FORGE_PROGRESSION_RULES.find((rule) => rule.progressionRuleId === template.progressionRuleId);
  return {
    sourceBlueprint: blueprint,
    sourceVolume: {
      targets: [],
      totalWeeklySets: totalSets,
      effort: { rirMin: 0, rirMax: 3, rationale: 'CSV target_rir alanlarından türetilir.' },
      fatigue: { weeklySetCeiling: totalSets + template.maxExtraSetsPerFocusMuscleWeek, perSessionSetCeiling: 34, rationale: 'CSV template hacim sınırları.' },
      assumptions: ['Volume CSV template satırlarından gelir.'],
      uncertaintyNotes: [],
    },
    sourceAssembly: { split: splitKey(template.split), days: [], selectionNotes: [...relaxationsApplied, ...adaptations.map((item) => item.reason)], warnings: validation.warnings.map((item) => item.message) },
    sourceProgression: {
      weeks: [],
      weekCount: template.durationWeeks,
      deloadWeeks: template.durationWeeks >= 8 ? [template.durationWeeks - 1] : [],
      fatigueModel: { weeklyVolumeTrend: [], peakWeek: Math.max(0, template.durationWeeks - 2), deloadWeeks: [], assumptions: [progressionRule?.deloadLogic ?? 'CSV progression rule preserved.'] },
      model: blueprint.progressionModel,
      family: blueprint.programFamily,
      goalClassification: blueprint.goalClassification,
      progressionNotes: [progressionRule?.loadOrRepLogic ?? `Progression rule: ${template.progressionRuleId}`],
    },
    validation: {
      isValid: validation.valid,
      issues: [
        ...validation.errors.map((item) => ({ severity: 'error' as const, code: item.code, message: item.message, location: item.location })),
        ...validation.warnings.map((item) => ({ severity: 'warning' as const, code: item.code, message: item.message, location: item.location })),
      ],
    },
    explanation: {
      headline: 'Programın hazır.',
      whyThisPlan: relaxationsApplied.length
        ? ['Tam eşleşme yoktu; en yakın güvenli planı seçtik.', ...relaxationsApplied]
        : ['Hedeflerine ve tercihlerine göre en uygun program seçildi ve sana göre uyarlandı.'],
      archetypeRationale: [`${template.name} CSV source-of-truth template olarak seçildi.`],
      progressionModelRationale: [progressionRule?.loadOrRepLogic ?? template.progressionRuleId],
      roleDistributionRationale: ['Egzersiz sırası ve rolleri canonical CSV template yapısından gelir.'],
      structureRationale: [`${template.daysPerWeek} gün · ${template.durationWeeks} hafta · ${template.split}.`],
      volumeRationale: [`Odak kas başına maksimum ekstra set: ${template.maxExtraSetsPerFocusMuscleWeek}.`],
      selectionRationale: [`Template score: ${match.totalScore}.`, ...relaxationsApplied, ...Object.entries(match.breakdown).map(([key, value]) => `${key}: ${value}`)],
      progressionRationale: [progressionRule?.accessoryLogic ?? 'CSV progression rule preserved.'],
      safetyNotes: validation.warnings.map((item) => item.message),
      uncertaintyNotes: validation.valid ? relaxationsApplied : ['Invalid programs must not be persisted.'],
      assumptions: ['Bu program rastgele oluşturulmadı; curated CSV paketi içinden seçildi.', ...relaxationsApplied],
    },
  };
}

export function buildTemplateProgram(input: { request: ProgramRequest; existingPlan?: AIProgramPlan | null }): TemplateEngineResult {
  const versionSeed = PROGRAM_TEMPLATES.map((template) => `${template.id}:${template.version}`).join('|');
  const requestFingerprint = fingerprintProgramRequest(input.request, versionSeed);
  if (!input.request.forceNewVariation && input.existingPlan?.requestFingerprint === requestFingerprint) {
    return {
      plan: input.existingPlan,
      request: input.request,
      effectiveRequest: input.existingPlan.requestSnapshot ?? input.request,
      requestFingerprint,
      selectedTemplateId: input.existingPlan.selectedTemplateId ?? 'unknown',
      selectedTemplateVersion: input.existingPlan.selectedTemplateVersion ?? 1,
      matchMode: input.existingPlan.templateMatchMode ?? 'strict_match',
      relaxationsApplied: input.existingPlan.templateRelaxationsApplied ?? [],
      match: { templateId: input.existingPlan.selectedTemplateId ?? 'unknown', totalScore: 100, breakdown: { goal: 35, days: 25, level: 15, equipment: 10, duration: 5, focus: 5, split: 5 } },
      rejectedTemplates: [],
      adaptations: input.existingPlan.appliedAdaptations ?? [],
      validation: { valid: input.existingPlan.validation.isValid, errors: [], warnings: [] },
      reusedExisting: true,
      adaptationFingerprint: input.existingPlan.adaptationFingerprint,
      ignoredPhysiqueFocus: [],
    };
  }
  const selected = selectTemplateWithRelaxation(input.request);
  const adapted = adaptTemplate(selected.template, selected.effectiveRequest);
  const adaptationFingerprint = fingerprintPhysiqueAdaptation({
    requestFingerprint,
    templateId: selected.template.id,
    templateVersion: selected.template.version,
    focusAreas: adapted.selectedFocusAreas,
    equipment: selected.effectiveRequest.availableEquipment,
    limitations: selected.effectiveRequest.limitations,
  });
  const orderedWorkouts = orderProgramWorkouts(selected.template, adapted.workouts, adapted.selectedFocusAreas.map((area) => area.muscle));
  const validation = validateProgram(selected.template, selected.effectiveRequest, orderedWorkouts, adapted.adaptations);
  const builtArtifacts = artifacts(selected.template, input.request, selected.match, selected.compatible, validation, adapted.adaptations, selected.relaxationsApplied);
  const planId = `template-${selected.template.id}-${requestFingerprint.slice(0, 8)}`;
  const plan: AIProgramPlan = {
    id: planId,
    version: 1,
    title: selected.template.name,
    subtitle: `${selected.template.daysPerWeek} gün · ${selected.template.durationWeeks} hafta · ${selected.template.level}`,
    generatedAt: `1970-01-01T00:00:${String(parseInt(requestFingerprint.slice(0, 2), 16) % 60).padStart(2, '0')}.000Z`,
    daysPerWeek: selected.template.daysPerWeek,
    weekCount: selected.template.durationWeeks,
    trainingStyle: selected.template.split,
    goal: selected.template.goal,
    difficultyLevel: selected.template.level,
    weeks: toWeeks(planId, selected.template, orderedWorkouts),
    requestFingerprint,
    selectedTemplateId: selected.template.id,
    selectedTemplateVersion: selected.template.version,
    templateMatchMode: selected.matchMode,
    templateRelaxationsApplied: selected.relaxationsApplied,
    adaptationVersion: ADAPTATION_VERSION,
    adaptationFingerprint,
    requestSnapshot: selected.effectiveRequest,
    appliedAdaptations: adapted.adaptations,
    ...builtArtifacts,
    sourceContextSummary: {
      entryPath: 'ai_hub',
      mainGoal: input.request.goal,
      experience: input.request.level,
      recoveryQuality: 'okay',
      priorityMuscles: input.request.focusMuscles,
      painLimitations: input.request.limitations,
      physiqueAnalysisUsed: input.request.physiqueFocus.some((item) => item.confidence >= 0.6),
      confidence: builtArtifacts.sourceBlueprint.confidence,
    },
  };
  return {
    plan,
    request: input.request,
    effectiveRequest: selected.effectiveRequest,
    requestFingerprint,
    selectedTemplateId: selected.template.id,
    selectedTemplateVersion: selected.template.version,
    matchMode: selected.matchMode,
    relaxationsApplied: selected.relaxationsApplied,
    match: selected.match,
    rejectedTemplates: selected.rejected,
    adaptations: adapted.adaptations,
    validation,
    reusedExisting: false,
    adaptationFingerprint,
    ignoredPhysiqueFocus: adapted.ignoredFocusAreas,
  };
}
