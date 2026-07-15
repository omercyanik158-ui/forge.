export type ProgramTemplateStatus = "draft" | "active" | "deprecated";

export type ProgramTemplateGoal =
  | "strength"
  | "hypertrophy"
  | "powerbuilding"
  | "general_fitness";

export type ProgramTemplateLevel = "beginner" | "intermediate" | "advanced";

export type ProgramTemplateSplit =
  | "full_body"
  | "upper_lower"
  | "push_pull_legs"
  | "body_part"
  | "powerbuilding"
  | "custom";

export type ProgramTemplateProgressionModel =
  | "linear"
  | "double_progression"
  | "percentage_based"
  | "rpe_based"
  | "rep_goal"
  | "top_set_backoff"
  | "custom";

export type TemplateExerciseRole =
  | "main_lift"
  | "secondary_compound"
  | "accessory_compound"
  | "isolation"
  | "core"
  | "conditioning"
  | "mobility";

export type TemplateMovementPattern =
  | "horizontal_push"
  | "vertical_push"
  | "horizontal_pull"
  | "vertical_pull"
  | "squat"
  | "hinge"
  | "lunge"
  | "knee_flexion"
  | "elbow_flexion"
  | "elbow_extension"
  | "shoulder_abduction"
  | "calf_raise"
  | "loaded_carry"
  | "anti_extension"
  | "anti_rotation"
  | "spinal_flexion"
  | "spinal_extension"
  | "mobility"
  | "unknown";

export type TemplateMuscleGroup =
  | "chest"
  | "upper_chest"
  | "back"
  | "lats"
  | "upper_back"
  | "shoulders"
  | "front_delts"
  | "side_delts"
  | "rear_delts"
  | "biceps"
  | "triceps"
  | "forearms"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "core"
  | "full_body"
  | "unknown";

export type TemplateRepPrescription =
  | { type: "fixed"; value: number }
  | { type: "range"; min: number; max: number };

export type TemplateIntensityPrescription =
  | { type: "rpe"; value?: number; min?: number; max?: number }
  | { type: "rir"; value?: number; min?: number; max?: number }
  | { type: "percentage"; value?: number; min?: number; max?: number };

export type TemplateExercise = {
  exerciseId: string;
  order: number;
  role: TemplateExerciseRole;
  movementPattern: TemplateMovementPattern;
  primaryMuscles: TemplateMuscleGroup[];
  secondaryMuscles: TemplateMuscleGroup[];
  sets: number;
  reps: TemplateRepPrescription;
  intensity?: TemplateIntensityPrescription;
  restSeconds: number;
  substitutionGroupId?: string;
  required?: boolean;
  notes?: string;
};

export type WorkoutDayTemplate = {
  dayIndex: number;
  name: string;
  focus: TemplateMuscleGroup[];
  estimatedMinutes: number;
  exercises: TemplateExercise[];
};

export type TemplateAdaptationRules = {
  allowExerciseSubstitution: boolean;
  allowAccessoryVolumeChanges: boolean;
  allowMainLiftChanges: boolean;
  preserveMainLiftOrder: boolean;
  maxExtraSetsPerMusclePerWeek: number;
  maxRemovedSetsPerMusclePerWeek: number;
  allowedSessionTimeAdjustmentPercent: number;
  maxFocusMuscles: number;
};

export type TemplateVolumeTarget = {
  muscleGroup: TemplateMuscleGroup;
  directSetsPerWeek: {
    min: number;
    target: number;
    max: number;
  };
};

export type ProgramTemplate = {
  id: string;
  version: number;
  status: ProgramTemplateStatus;
  name: string;
  shortDescription: string;
  internalNotes?: string;
  goal: ProgramTemplateGoal;
  level: ProgramTemplateLevel;
  daysPerWeek: number;
  durationWeeks: number;
  split: ProgramTemplateSplit;
  sessionMinutes: {
    min: number;
    target: number;
    max: number;
  };
  equipmentRequired: string[];
  equipmentOptional: string[];
  compatibleFocusMuscles: TemplateMuscleGroup[];
  progressionModel: ProgramTemplateProgressionModel;
  progressionConfig: Record<string, unknown>;
  adaptationRules: TemplateAdaptationRules;
  volumeTargets: TemplateVolumeTarget[];
  workouts: WorkoutDayTemplate[];
  sourceMetadata: {
    derivedFromPhase1: boolean;
    datasetPatternReferences: string[];
    programmingBibleVersion: string;
    authoringVersion: string;
  };
};

export type TemplateValidationSeverity = "error" | "warning";

export type TemplateValidationIssue = {
  severity: TemplateValidationSeverity;
  code: string;
  message: string;
  templateId: string;
  location?: string;
};

export type TemplateValidationResult = {
  valid: boolean;
  errors: TemplateValidationIssue[];
  warnings: TemplateValidationIssue[];
};

export type TemplateVolumeReport = {
  templateId: string;
  directSetsByMuscle: Partial<Record<TemplateMuscleGroup, number>>;
  indirectSetsByMuscle: Partial<Record<TemplateMuscleGroup, number>>;
  frequencyByMuscle: Partial<Record<TemplateMuscleGroup, number>>;
  exercisesPerSession: number[];
  estimatedSessionMinutes: number[];
  movementPatternDistribution: Partial<Record<TemplateMovementPattern, number>>;
  mainLiftFrequency: number;
  hingeFrequency: number;
  squatPatternFrequency: number;
  horizontalPushPullRatio: {
    horizontalPush: number;
    horizontalPull: number;
  };
  verticalPushPullRatio: {
    verticalPush: number;
    verticalPull: number;
  };
};
