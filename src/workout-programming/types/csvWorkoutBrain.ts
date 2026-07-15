export type ForgeTemplateGoal = "strength" | "hypertrophy" | "powerbuilding" | "general_fitness";
export type ForgeTemplateLevel = "beginner" | "intermediate" | "advanced";
export type ForgeTemplateStatus = "active" | "draft" | "deprecated";

export type ForgeGeneratedExercise = {
  canonicalExerciseId: string;
  exerciseId: string;
  exerciseName: string;
  order: number;
  movementPattern: string;
  primaryMuscles: string[];
  equipment: string[];
  role: string;
  sets: number;
  repsMin: number;
  repsMax: number;
  targetRir: number;
  restSeconds: number;
  required: boolean;
  notes: string;
};

export type ForgeGeneratedWorkoutDay = {
  dayIndex: number;
  name: string;
  focus: string[];
  exercises: ForgeGeneratedExercise[];
};

export type ForgeGeneratedTemplate = {
  templateId: string;
  version: number;
  status: ForgeTemplateStatus;
  nameTr: string;
  goal: ForgeTemplateGoal;
  level: ForgeTemplateLevel;
  split: string;
  daysPerWeek: number;
  durationWeeks: number;
  sessionMinutes: {
    min: number;
    target: number;
    max: number;
  };
  equipmentProfile: string;
  progressionRuleId: string;
  compatibleFocusMuscles: string[];
  maxExtraSetsPerFocusMuscleWeek: number;
  maxFocusMuscles: number;
  descriptionTr: string;
  sourceBasis: string;
  workouts: ForgeGeneratedWorkoutDay[];
};

export type ForgeProgressionRule = {
  progressionRuleId: string;
  nameTr: string;
  appliesTo: string[];
  loadOrRepLogic: string;
  failureLogic: string;
  deloadLogic: string;
  accessoryLogic: string;
};

export type ForgeAdaptationRule = {
  focusMuscle: string;
  goal: string;
  priority: string;
  actionType: string;
  targetMovementPattern: string;
  preferredExerciseIds: string[];
  maxExtraDirectSetsWeek: number;
  maxFrequencyIncreasePerWeek: number;
  constraints: string;
  userFacingCopyTr: string;
};

export type ForgeExerciseSubstitution = {
  sourceExerciseId: string;
  alternativeExerciseId: string;
  sourceAppExerciseId: string;
  alternativeAppExerciseId: string;
  movementPattern: string;
  alternativeEquipment: string[];
  reason: string;
  constraint: string;
  preserveRole: boolean;
  deterministicRank: number;
};

export type ForgeCanonicalExercise = {
  canonicalExerciseId: string;
  exerciseName: string;
  movementPattern: string;
  primaryMuscles: string[];
  equipment: string[];
  defaultRole: string;
  appExerciseId?: string;
};

export type ForgePhysiqueFocus = {
  muscle: string;
  priority: "low" | "medium" | "high";
  confidence: number;
};

export type ForgeNormalizedProgramRequest = {
  userId: string;
  goal: ForgeTemplateGoal;
  level: ForgeTemplateLevel;
  daysPerWeek: number;
  preferredSessionMinutes: number;
  availableEquipment: string[];
  focusMuscles: string[];
  physiqueFocus: ForgePhysiqueFocus[];
  restrictedExerciseIds: string[];
  preferredSplit?: string;
  forceNewVariation?: boolean;
  previousTemplateId?: string;
};

export type ForgeAppliedAdaptation = {
  type: "exercise_substitution" | "focus_volume_added" | "focus_reordered";
  reason: string;
  focusMuscle?: string;
  dayIndex?: number;
  canonicalExerciseId?: string;
  exerciseId?: string;
  replacementExerciseId?: string;
  setsChanged?: number;
};

export type ForgeProgramValidationIssue = {
  code: string;
  message: string;
  location?: string;
};

export type ForgeProgramValidationResult = {
  valid: boolean;
  errors: ForgeProgramValidationIssue[];
  warnings: ForgeProgramValidationIssue[];
};
