import { FORGE_ADAPTATION_RULES } from '@/workout-programming/generated/adaptationRules.generated';
import { FORGE_PROGRAM_TEMPLATES } from '@/workout-programming/generated/templates.generated';
import { FORGE_EXERCISE_SUBSTITUTIONS } from '@/workout-programming/generated/substitutions.generated';
import { FORGE_PROGRESSION_RULES } from '@/workout-programming/generated/progressionRules.generated';
import { FORGE_CANONICAL_EXERCISES } from '@/workout-programming/generated/exerciseCatalog.generated';
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

export const USE_TEMPLATE_PROGRAM_ENGINE =
  process.env.EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE !== 'false';

const ADAPTATION_VERSION = 2;

export type TemplateGoal = 'strength' | 'hypertrophy' | 'powerbuilding' | 'general_fitness';
export type TemplateLevel = 'beginner' | 'intermediate' | 'advanced';
export type TemplateSplit = 'full_body' | 'upper_lower' | 'push_pull_legs' | 'body_part' | 'powerbuilding' | 'custom';
export type TemplateEquipmentProfile = 'full_gym' | 'dumbbell_only' | 'bodyweight_home' | 'resistance_band_bodyweight' | 'custom';

export type TemplateRejectionCode =
  | 'GOAL_MISMATCH'
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
  level: TemplateLevel;
  daysPerWeek: number;
  preferredSessionMinutes: number;
  equipmentProfile: TemplateEquipmentProfile;
  availableEquipment: string[];
  focusMuscles: string[];
  physiqueFocus: ForgePhysiqueFocus[];
  restrictedExerciseIds: string[];
  limitations: string[];
  preferredSplit?: TemplateSplit;
  forceNewVariation?: boolean;
  previousTemplateId?: string;
};

export type TemplateMatchResult = {
  templateId: string;
  totalScore: number;
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
  type: 'exercise_substitution' | 'limitation_substitution' | 'volume_added' | 'focus_reordered';
  reason: string;
  focusMuscle?: string;
  triggeringLimitation?: CanonicalLimitation;
  dayIndex?: number;
  exerciseId?: string;
  replacementExerciseId?: string;
  setsChanged?: number;
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
  requestFingerprint: string;
  selectedTemplateId: string;
  selectedTemplateVersion: number;
  match: TemplateMatchResult;
  rejectedTemplates: TemplateMatchResult[];
  adaptations: AppliedAdaptation[];
  validation: ProgramValidationResult;
  reusedExisting: boolean;
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

export const PROGRAM_TEMPLATES: ProgramTemplate[] = FORGE_PROGRAM_TEMPLATES.map((template) => ({
  ...template,
  id: template.templateId,
  name: template.nameTr,
  focusMuscles: template.compatibleFocusMuscles,
})).sort((left, right) => left.id.localeCompare(right.id));

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
  if (equipment.has('barbell')) equipment.add('rack');
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
  if (exerciseEquipmentFits(exercise.equipment, request)) return true;
  return FORGE_EXERCISE_SUBSTITUTIONS
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
      const generatedReplacement = FORGE_EXERCISE_SUBSTITUTIONS.find((item) =>
        item.sourceExerciseId === exercise.canonicalExerciseId && item.alternativeExerciseId === replacementId,
      );
      const catalogReplacement = FORGE_CANONICAL_EXERCISES.find((item) => item.canonicalExerciseId === replacementId);
      const replacement: LimitationReplacement | null = generatedReplacement
        ? {
            alternativeExerciseId: generatedReplacement.alternativeExerciseId,
            alternativeAppExerciseId: generatedReplacement.alternativeAppExerciseId,
            alternativeEquipment: generatedReplacement.alternativeEquipment,
            reason: generatedReplacement.reason,
          }
        : catalogReplacement?.appExerciseId
          ? {
              alternativeExerciseId: catalogReplacement.canonicalExerciseId,
              alternativeAppExerciseId: catalogReplacement.appExerciseId,
              alternativeEquipment: catalogReplacement.equipment,
              reason: `reviewed limitation replacement for ${limitation}`,
            }
          : null;
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
  return FORGE_EXERCISE_SUBSTITUTIONS
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
    muscle,
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
}): ProgramRequest {
  const { answers, physiqueSummary } = input;
  const physiqueFocus = answers.useLatestPhysiqueAnalysis ? physiqueFocusFromSummary(physiqueSummary) : [];
  const availableEquipment = normalizeList([
    ...answers.equipment.map(normalizeEquipmentKey),
    answers.location === 'home' ? 'bodyweight' : '',
  ]);
  return {
    userId: input.userId ?? 'local_user',
    goal: goalFromAnswers(answers),
    level: levelFromAnswers(answers),
    daysPerWeek: Math.min(7, Math.max(1, answers.trainingDays ?? 3)),
    preferredSessionMinutes: Math.min(120, Math.max(20, answers.sessionDurationMin ?? 60)),
    equipmentProfile: equipmentProfileFromAnswers(answers, availableEquipment),
    availableEquipment,
    focusMuscles: normalizeList([
      ...answers.priorityMuscles,
      ...physiqueFocus.filter((item) => item.confidence >= 0.6).map((item) => item.muscle),
    ]),
    physiqueFocus,
    restrictedExerciseIds: normalizeList([...(answers.avoidedExerciseIds ?? [])]),
    limitations: normalizeLimitations(answers.painLimitations.length ? answers.painLimitations : ['none']),
    preferredSplit: splitFromAnswers(answers),
    forceNewVariation: !!input.forceNewVariation,
    previousTemplateId: input.previousTemplateId?.trim() || undefined,
  };
}

export function fingerprintProgramRequest(request: ProgramRequest, templateVersionSeed = ''): string {
  const hash = stableHash(stableStringify({
    engineVersion: 'selection-v3',
    goal: request.goal,
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
    templateVersionSeed,
    adaptationVersion: ADAPTATION_VERSION,
  }));
  return `forge-program-request:v1:${hash}`;
}

function templateRejections(template: ProgramTemplate, request: ProgramRequest): TemplateRejectionReason[] {
  const rejections: TemplateRejectionReason[] = [];
  if (template.goal !== request.goal) rejections.push({ code: 'GOAL_MISMATCH', message: `Template goal ${template.goal} does not match request goal ${request.goal}.`, field: 'goal' });
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
  const adaptationCostPenalty = template.workouts.flatMap((workout) => workout.exercises).reduce((penalty, exercise) => {
    const equipmentPenalty = exercise.required && !exerciseEquipmentFits(exercise.equipment, request) ? -5 : 0;
    const limitationPenalty = exercise.required && getExerciseLimitationConflicts(exercise, request.limitations).length > 0 ? -6 : 0;
    return penalty + equipmentPenalty + limitationPenalty;
  }, 0);
  const breakdown = {
    goal: template.goal === request.goal ? 35 : 0,
    days: template.daysPerWeek === request.daysPerWeek ? 25 : 0,
    level: template.level === request.level ? 15 : 0,
    equipment: equipmentProfileScore(template, request),
    duration: durationDistance <= 10 ? 5 : durationDistance <= 20 ? 3 : 1,
    focus: Math.min(5, focusHits * 2),
    split: request.preferredSplit && request.preferredSplit === template.split ? 5 : 0,
    adaptationCostPenalty,
  };
  return {
    templateId: template.id,
    totalScore: Object.values(breakdown).reduce((sum, item) => sum + item, 0),
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

function selectTemplate(request: ProgramRequest): { template: ProgramTemplate; match: TemplateMatchResult; rejected: TemplateMatchResult[]; compatible: TemplateMatchResult[] } {
  const { compatible, rejected } = matchTemplates(request);
  let pool = compatible;
  if (request.forceNewVariation && request.previousTemplateId && compatible.length > 1) {
    const bestScore = compatible[0]?.totalScore ?? 0;
    const alternativePool = compatible.filter((item) => item.templateId !== request.previousTemplateId && item.totalScore >= bestScore - 8);
    if (alternativePool.length) pool = alternativePool;
  }
  const match = pool[0];
  if (!match) throw new Error(`No compatible FORGE CSV template found: ${rejected.map((item) => `${item.templateId}:${item.rejectionReasons?.join('/')}`).join(', ')}`);
  const template = PROGRAM_TEMPLATES.find((item) => item.id === match.templateId);
  if (!template) throw new Error(`Selected template ${match.templateId} is missing.`);
  return { template, match, rejected, compatible };
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
  const candidates = FORGE_EXERCISE_SUBSTITUTIONS
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

function eligibleFocus(request: ProgramRequest, template: ProgramTemplate): ForgePhysiqueFocus[] {
  const fromPhysique = request.physiqueFocus
    .filter((item) => item.confidence >= 0.6)
    .filter((item) => template.compatibleFocusMuscles.includes(item.muscle));
  const fromUser = request.focusMuscles
    .filter((muscle) => template.compatibleFocusMuscles.includes(muscle))
    .map((muscle): ForgePhysiqueFocus => ({ muscle, priority: 'medium', confidence: 0.75 }));
  const merged = [...fromPhysique, ...fromUser].sort((left, right) => {
    const priorityScore = { high: 3, medium: 2, low: 1 };
    return priorityScore[right.priority] - priorityScore[left.priority] || right.confidence - left.confidence || left.muscle.localeCompare(right.muscle);
  });
  const seen = new Set<string>();
  return merged.filter((item) => {
    if (seen.has(item.muscle)) return false;
    seen.add(item.muscle);
    return true;
  }).slice(0, template.maxFocusMuscles);
}

function adaptTemplate(template: ProgramTemplate, request: ProgramRequest): { workouts: MutableWorkoutDay[]; adaptations: AppliedAdaptation[] } {
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

  const focusItems = eligibleFocus(request, template);
  const adaptedFocus = new Set<string>();
  for (const focus of focusItems) {
    const rule = FORGE_ADAPTATION_RULES.find((item) => item.focusMuscle === focus.muscle && item.goal === template.goal);
    if (!rule) continue;
    const maxByConfidence = focus.confidence > 0.9 ? rule.maxExtraDirectSetsWeek : focus.confidence >= 0.75 ? Math.min(rule.maxExtraDirectSetsWeek, 2) : 1;
    const maxExtra = Math.min(maxByConfidence, template.maxExtraSetsPerFocusMuscleWeek);
    if (maxExtra <= 0) continue;
    const target = workouts
      .flatMap((workout) => workout.exercises.map((exercise) => ({ workout, exercise })))
      .find(({ exercise }) => exercise.primaryMuscles.includes(focus.muscle) && !exercise.required && exercise.role !== 'main_lift');
    if (!target) continue;
    const added = Math.min(1, maxExtra);
    target.exercise.sets += added;
    adaptedFocus.add(focus.muscle);
    adaptations.push({
      type: 'volume_added',
      reason: rule.userFacingCopyTr,
      focusMuscle: focus.muscle,
      dayIndex: target.workout.dayIndex,
      exerciseId: target.exercise.exerciseId,
      setsChanged: added,
    });
  }

  if (adaptedFocus.size > template.maxFocusMuscles) {
    throw new Error(`Too many focus muscles adapted for ${template.id}`);
  }

  return { workouts, adaptations };
}

function validateProgram(template: ProgramTemplate, request: ProgramRequest, workouts: MutableWorkoutDay[], adaptations: AppliedAdaptation[]): ProgramValidationResult {
  const errors: TemplateValidationIssue[] = [];
  const warnings: TemplateValidationIssue[] = [];
  if (workouts.length !== request.daysPerWeek) errors.push({ code: 'day_count_mismatch', message: 'Requested day count was not preserved.' });
  if (new Set(adaptations.filter((item) => item.focusMuscle).map((item) => item.focusMuscle)).size > template.maxFocusMuscles) {
    errors.push({ code: 'focus_cap_exceeded', message: 'More than two focus muscles were adapted.' });
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
      if (template.goal === 'strength' && exercise.role === 'main_lift' && exercise.repsMax > 6) {
        warnings.push({ code: 'strength_main_lift_reps', message: 'Strength main lift uses a higher rep prescription from the curated CSV.', location: exercise.exerciseId });
      }
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

function artifacts(template: ProgramTemplate, request: ProgramRequest, match: TemplateMatchResult, compatible: TemplateMatchResult[], validation: ProgramValidationResult, adaptations: AppliedAdaptation[]): Pick<AIProgramPlan, 'sourceBlueprint' | 'sourceVolume' | 'sourceAssembly' | 'sourceProgression' | 'validation' | 'explanation'> {
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
    rationale: [`Template score: ${match.totalScore}`, `Source template: ${template.id}@${template.version}`],
    goalStrategy: [`${request.goal} hedefi için curated CSV template seçildi.`],
    priorityMuscleStrategy: adaptations.filter((item) => item.focusMuscle).map((item) => item.reason),
    recoveryStrategy: ['Adaptasyon kontrollü tutulur; log ve check-in ileride koç motoruna aktarılır.'],
    volumeDirection: request.level === 'advanced' ? 'moderate_high' : request.level === 'beginner' ? 'conservative' : 'moderate',
    effortStrategy: ['RIR hedefleri CSV prescription içinden gelir.'],
    frequencyStrategy: [`Haftada ${template.daysPerWeek} gün.`],
    safetyConstraints: validation.warnings.map((item) => item.message),
    assumptions: ['Program rastgele yazılmadı; curated CSV template seçildi.'],
    confidence: match.totalScore >= 85 ? 'high' : 'medium',
    confidenceRationale: [`Deterministic score: ${match.totalScore}.`],
    alternativesConsidered: alternatives,
    evidenceCategories: ['template_match', 'csv_template_match', 'controlled_adaptation'],
    whyThisPlan: ['Hedeflerine ve tercihlerine göre en uygun program seçildi ve sana göre uyarlandı.'],
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
    sourceAssembly: { split: splitKey(template.split), days: [], selectionNotes: adaptations.map((item) => item.reason), warnings: validation.warnings.map((item) => item.message) },
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
      whyThisPlan: ['Hedeflerine ve tercihlerine göre en uygun program seçildi ve sana göre uyarlandı.'],
      archetypeRationale: [`${template.name} CSV source-of-truth template olarak seçildi.`],
      progressionModelRationale: [progressionRule?.loadOrRepLogic ?? template.progressionRuleId],
      roleDistributionRationale: ['Egzersiz sırası ve rolleri canonical CSV template yapısından gelir.'],
      structureRationale: [`${template.daysPerWeek} gün · ${template.durationWeeks} hafta · ${template.split}.`],
      volumeRationale: [`Odak kas başına maksimum ekstra set: ${template.maxExtraSetsPerFocusMuscleWeek}.`],
      selectionRationale: [`Template score: ${match.totalScore}.`, ...Object.entries(match.breakdown).map(([key, value]) => `${key}: ${value}`)],
      progressionRationale: [progressionRule?.accessoryLogic ?? 'CSV progression rule preserved.'],
      safetyNotes: validation.warnings.map((item) => item.message),
      uncertaintyNotes: validation.valid ? [] : ['Invalid programs must not be persisted.'],
      assumptions: ['Bu program rastgele oluşturulmadı; curated CSV paketi içinden seçildi.'],
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
      requestFingerprint,
      selectedTemplateId: input.existingPlan.selectedTemplateId ?? 'unknown',
      selectedTemplateVersion: input.existingPlan.selectedTemplateVersion ?? 1,
      match: { templateId: input.existingPlan.selectedTemplateId ?? 'unknown', totalScore: 100, breakdown: { goal: 35, days: 25, level: 15, equipment: 10, duration: 5, focus: 5, split: 5 } },
      rejectedTemplates: [],
      adaptations: input.existingPlan.appliedAdaptations ?? [],
      validation: { valid: input.existingPlan.validation.isValid, errors: [], warnings: [] },
      reusedExisting: true,
    };
  }
  const selected = selectTemplate(input.request);
  const adapted = adaptTemplate(selected.template, input.request);
  const orderedWorkouts = orderProgramWorkouts(selected.template, adapted.workouts);
  const validation = validateProgram(selected.template, input.request, orderedWorkouts, adapted.adaptations);
  const builtArtifacts = artifacts(selected.template, input.request, selected.match, selected.compatible, validation, adapted.adaptations);
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
    adaptationVersion: ADAPTATION_VERSION,
    requestSnapshot: input.request,
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
    requestFingerprint,
    selectedTemplateId: selected.template.id,
    selectedTemplateVersion: selected.template.version,
    match: selected.match,
    rejectedTemplates: selected.rejected,
    adaptations: adapted.adaptations,
    validation,
    reusedExisting: false,
  };
}
