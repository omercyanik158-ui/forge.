import type {
  ProgramTemplate,
  ProgramTemplateGoal,
  ProgramTemplateLevel,
  ProgramTemplateProgressionModel,
  ProgramTemplateSplit,
  TemplateAdaptationRules,
  TemplateExercise,
  TemplateExerciseRole,
  TemplateMovementPattern,
  TemplateMuscleGroup,
  TemplateRepPrescription,
  TemplateVolumeTarget,
  WorkoutDayTemplate,
} from "../types/programTemplate";

const PHASE_1_REFERENCES = [
  "forge-programming-bible-v1",
  "workout-pattern-analysis-v1",
  "forge-programming-guardrails-v1",
];

const DEFAULT_ADAPTATION_RULES: TemplateAdaptationRules = {
  allowExerciseSubstitution: true,
  allowAccessoryVolumeChanges: true,
  allowMainLiftChanges: false,
  preserveMainLiftOrder: true,
  maxExtraSetsPerMusclePerWeek: 4,
  maxRemovedSetsPerMusclePerWeek: 4,
  allowedSessionTimeAdjustmentPercent: 15,
  maxFocusMuscles: 2,
};

type ExerciseSeed = {
  id: string;
  role: TemplateExerciseRole;
  pattern: TemplateMovementPattern;
  primary: TemplateMuscleGroup[];
  secondary?: TemplateMuscleGroup[];
  sets: number;
  reps: TemplateRepPrescription;
  rest: number;
  substitutionGroupId?: string;
  required?: boolean;
  notes?: string;
  intensity?: TemplateExercise["intensity"];
};

type TemplateSeed = {
  id: string;
  name: string;
  shortDescription: string;
  goal: ProgramTemplateGoal;
  level: ProgramTemplateLevel;
  daysPerWeek: number;
  durationWeeks: number;
  split: ProgramTemplateSplit;
  sessionMinutes: ProgramTemplate["sessionMinutes"];
  equipmentRequired: string[];
  equipmentOptional?: string[];
  compatibleFocusMuscles: TemplateMuscleGroup[];
  progressionModel: ProgramTemplateProgressionModel;
  progressionConfig: Record<string, unknown>;
  volumeTargets: TemplateVolumeTarget[];
  workouts: WorkoutDayTemplate[];
  internalNotes?: string;
  adaptationRules?: Partial<TemplateAdaptationRules>;
};

const range = (min: number, max: number): TemplateRepPrescription => ({ type: "range", min, max });
const rir = (min: number, max: number): TemplateExercise["intensity"] => ({ type: "rir", min, max });
const pct = (min: number, max: number): TemplateExercise["intensity"] => ({ type: "percentage", min, max });

const ROLE_RANK: Record<TemplateExerciseRole, number> = {
  mobility: 0,
  main_lift: 1,
  secondary_compound: 2,
  accessory_compound: 3,
  isolation: 4,
  core: 5,
  conditioning: 6,
};

function ex(seed: ExerciseSeed, order: number): TemplateExercise {
  return {
    exerciseId: seed.id,
    order,
    role: seed.role,
    movementPattern: seed.pattern,
    primaryMuscles: seed.primary,
    secondaryMuscles: seed.secondary ?? [],
    sets: seed.sets,
    reps: seed.reps,
    restSeconds: seed.rest,
    substitutionGroupId: seed.substitutionGroupId,
    required: seed.required,
    notes: seed.notes,
    intensity: seed.intensity,
  };
}

function day(
  dayIndex: number,
  name: string,
  focus: TemplateMuscleGroup[],
  estimatedMinutes: number,
  exercises: ExerciseSeed[],
): WorkoutDayTemplate {
  return {
    dayIndex,
    name,
    focus,
    estimatedMinutes,
    exercises: [...exercises]
      .sort((left, right) => ROLE_RANK[left.role] - ROLE_RANK[right.role])
      .map((item, index) => ex(item, index + 1)),
  };
}

function reindexDays(days: WorkoutDayTemplate[]): WorkoutDayTemplate[] {
  return days.map((workout, index) => ({
    ...workout,
    dayIndex: index + 1,
    exercises: workout.exercises.map((exercise, exerciseIndex) => ({
      ...exercise,
      order: exerciseIndex + 1,
    })),
  }));
}

function template(seed: TemplateSeed): ProgramTemplate {
  return {
    id: seed.id,
    version: 1,
    status: "active",
    name: seed.name,
    shortDescription: seed.shortDescription,
    internalNotes: seed.internalNotes,
    goal: seed.goal,
    level: seed.level,
    daysPerWeek: seed.daysPerWeek,
    durationWeeks: seed.durationWeeks,
    split: seed.split,
    sessionMinutes: seed.sessionMinutes,
    equipmentRequired: seed.equipmentRequired,
    equipmentOptional: seed.equipmentOptional ?? [],
    compatibleFocusMuscles: seed.compatibleFocusMuscles,
    progressionModel: seed.progressionModel,
    progressionConfig: seed.progressionConfig,
    adaptationRules: { ...DEFAULT_ADAPTATION_RULES, ...seed.adaptationRules },
    volumeTargets: seed.volumeTargets,
    workouts: seed.workouts,
    sourceMetadata: {
      derivedFromPhase1: true,
      datasetPatternReferences: PHASE_1_REFERENCES,
      programmingBibleVersion: "v1",
      authoringVersion: "phase-2-template-library-v1",
    },
  };
}

const gym = ["barbells", "dumbbells", "bench", "cables", "machines", "pullup_bar"];
const dbOnly = ["dumbbells", "bench"];
const bodyweight = ["bodyweight_only", "pullup_bar", "bands"];

const E = {
  bench: (sets = 3, reps: TemplateRepPrescription = range(3, 6)): ExerciseSeed => ({
    id: "csv-bench-press-barbell",
    role: "main_lift",
    pattern: "horizontal_push",
    primary: ["chest"],
    secondary: ["triceps", "front_delts"],
    sets,
    reps,
    rest: 180,
    substitutionGroupId: "bench_flat",
    required: true,
    intensity: rir(1, 3),
  }),
  pausedBench: (): ExerciseSeed => ({
    id: "csv-bench-press-paused",
    role: "main_lift",
    pattern: "horizontal_push",
    primary: ["chest"],
    secondary: ["triceps", "front_delts"],
    sets: 3,
    reps: range(2, 5),
    rest: 180,
    substitutionGroupId: "bench_flat",
    required: true,
    intensity: pct(72, 82),
  }),
  dbBench: (sets = 3, reps: TemplateRepPrescription = range(8, 12)): ExerciseSeed => ({
    id: "csv-bench-press-dumbbell",
    role: "secondary_compound",
    pattern: "horizontal_push",
    primary: ["chest"],
    secondary: ["triceps", "front_delts"],
    sets,
    reps,
    rest: 120,
    substitutionGroupId: "bench_flat",
    intensity: rir(1, 2),
  }),
  inclineDb: (sets = 3): ExerciseSeed => ({
    id: "csv-incline-bench-press-dumbbell",
    role: "secondary_compound",
    pattern: "horizontal_push",
    primary: ["upper_chest"],
    secondary: ["chest", "front_delts"],
    sets,
    reps: range(8, 12),
    rest: 120,
    substitutionGroupId: "bench_incline",
    intensity: rir(1, 2),
  }),
  fly: (sets = 2): ExerciseSeed => ({
    id: "csv-chest-fly-cable",
    role: "isolation",
    pattern: "horizontal_push",
    primary: ["chest"],
    secondary: [],
    sets,
    reps: range(12, 18),
    rest: 75,
    substitutionGroupId: "chest_fly",
    intensity: rir(0, 2),
  }),
  squat: (sets = 3, reps: TemplateRepPrescription = range(3, 6)): ExerciseSeed => ({
    id: "csv-squat-barbell",
    role: "main_lift",
    pattern: "squat",
    primary: ["quads"],
    secondary: ["glutes", "core"],
    sets,
    reps,
    rest: 180,
    substitutionGroupId: "squat",
    required: true,
    intensity: rir(1, 3),
  }),
  frontSquat: (): ExerciseSeed => ({
    id: "csv-front-squat-barbell",
    role: "secondary_compound",
    pattern: "squat",
    primary: ["quads"],
    secondary: ["glutes", "core"],
    sets: 3,
    reps: range(4, 6),
    rest: 150,
    substitutionGroupId: "squat",
    intensity: rir(2, 3),
  }),
  gobletSquat: (): ExerciseSeed => ({
    id: "csv-goblet-squat",
    role: "secondary_compound",
    pattern: "squat",
    primary: ["quads"],
    secondary: ["glutes", "core"],
    sets: 3,
    reps: range(8, 12),
    rest: 90,
    substitutionGroupId: "squat",
    intensity: rir(1, 3),
  }),
  legPress: (sets = 3): ExerciseSeed => ({
    id: "csv-leg-press",
    role: "secondary_compound",
    pattern: "squat",
    primary: ["quads"],
    secondary: ["glutes"],
    sets,
    reps: range(8, 12),
    rest: 120,
    substitutionGroupId: "squat",
    intensity: rir(1, 2),
  }),
  deadlift: (sets = 3, reps: TemplateRepPrescription = range(2, 5)): ExerciseSeed => ({
    id: "csv-deadlift-barbell",
    role: "main_lift",
    pattern: "hinge",
    primary: ["hamstrings", "glutes"],
    secondary: ["back", "core"],
    sets,
    reps,
    rest: 210,
    substitutionGroupId: "hinge",
    required: true,
    intensity: rir(1, 3),
  }),
  rdl: (sets = 3, reps: TemplateRepPrescription = range(6, 10)): ExerciseSeed => ({
    id: "csv-romanian-deadlift-barbell",
    role: "secondary_compound",
    pattern: "hinge",
    primary: ["hamstrings"],
    secondary: ["glutes", "back"],
    sets,
    reps,
    rest: 150,
    substitutionGroupId: "hinge",
    intensity: rir(1, 3),
  }),
  dbRdl: (): ExerciseSeed => ({
    id: "csv-romanian-deadlift-dumbbell",
    role: "secondary_compound",
    pattern: "hinge",
    primary: ["hamstrings"],
    secondary: ["glutes", "back"],
    sets: 3,
    reps: range(8, 12),
    rest: 120,
    substitutionGroupId: "hinge",
    intensity: rir(1, 3),
  }),
  overhead: (sets = 3, reps: TemplateRepPrescription = range(3, 6)): ExerciseSeed => ({
    id: "csv-overhead-press-barbell",
    role: "main_lift",
    pattern: "vertical_push",
    primary: ["shoulders"],
    secondary: ["triceps", "front_delts"],
    sets,
    reps,
    rest: 150,
    substitutionGroupId: "overhead_press",
    intensity: rir(1, 3),
  }),
  dbOverhead: (): ExerciseSeed => ({
    id: "csv-overhead-press-dumbbell",
    role: "secondary_compound",
    pattern: "vertical_push",
    primary: ["shoulders"],
    secondary: ["triceps"],
    sets: 3,
    reps: range(8, 12),
    rest: 120,
    substitutionGroupId: "overhead_press",
    intensity: rir(1, 2),
  }),
  row: (sets = 3, reps: TemplateRepPrescription = range(6, 10)): ExerciseSeed => ({
    id: "csv-barbell-row",
    role: "secondary_compound",
    pattern: "horizontal_pull",
    primary: ["upper_back"],
    secondary: ["lats", "biceps"],
    sets,
    reps,
    rest: 120,
    substitutionGroupId: "row",
    intensity: rir(1, 2),
  }),
  cableRow: (sets = 3): ExerciseSeed => ({
    id: "csv-seated-row-cable",
    role: "accessory_compound",
    pattern: "horizontal_pull",
    primary: ["upper_back"],
    secondary: ["lats", "biceps"],
    sets,
    reps: range(8, 12),
    rest: 105,
    substitutionGroupId: "row",
    intensity: rir(1, 2),
  }),
  dbRow: (): ExerciseSeed => ({
    id: "csv-dumbbell-row",
    role: "accessory_compound",
    pattern: "horizontal_pull",
    primary: ["upper_back"],
    secondary: ["lats", "biceps"],
    sets: 3,
    reps: range(8, 12),
    rest: 105,
    substitutionGroupId: "row",
    intensity: rir(1, 2),
  }),
  pulldown: (sets = 3): ExerciseSeed => ({
    id: "csv-lat-pulldown",
    role: "accessory_compound",
    pattern: "vertical_pull",
    primary: ["lats"],
    secondary: ["biceps", "upper_back"],
    sets,
    reps: range(8, 12),
    rest: 105,
    substitutionGroupId: "vertical_pull",
    intensity: rir(1, 2),
  }),
  pullup: (sets = 3): ExerciseSeed => ({
    id: "csv-pull-up-bodyweight",
    role: "secondary_compound",
    pattern: "vertical_pull",
    primary: ["lats"],
    secondary: ["biceps", "upper_back"],
    sets,
    reps: range(5, 10),
    rest: 120,
    substitutionGroupId: "vertical_pull",
    intensity: rir(1, 3),
  }),
  lunge: (): ExerciseSeed => ({
    id: "csv-lunge-dumbbell",
    role: "accessory_compound",
    pattern: "lunge",
    primary: ["quads", "glutes"],
    secondary: ["core"],
    sets: 2,
    reps: range(8, 12),
    rest: 90,
    substitutionGroupId: "lunge",
    intensity: rir(1, 3),
  }),
  splitSquat: (): ExerciseSeed => ({
    id: "csv-bulgarian-split-squat-dumbbell",
    role: "accessory_compound",
    pattern: "lunge",
    primary: ["quads", "glutes"],
    secondary: [],
    sets: 3,
    reps: range(8, 12),
    rest: 105,
    substitutionGroupId: "lunge",
    intensity: rir(1, 2),
  }),
  legCurl: (sets = 2): ExerciseSeed => ({
    id: "csv-leg-curl",
    role: "isolation",
    pattern: "knee_flexion",
    primary: ["hamstrings"],
    sets,
    reps: range(10, 15),
    rest: 75,
    substitutionGroupId: "hamstring_isolation",
    intensity: rir(0, 2),
  }),
  legExt: (sets = 2): ExerciseSeed => ({
    id: "csv-leg-extension",
    role: "isolation",
    pattern: "squat",
    primary: ["quads"],
    sets,
    reps: range(10, 15),
    rest: 75,
    substitutionGroupId: "quad_isolation",
    intensity: rir(0, 2),
  }),
  lateral: (sets = 2): ExerciseSeed => ({
    id: "csv-lateral-raise-dumbbell",
    role: "isolation",
    pattern: "shoulder_abduction",
    primary: ["side_delts"],
    sets,
    reps: range(12, 20),
    rest: 60,
    substitutionGroupId: "lateral_raise",
    intensity: rir(0, 2),
  }),
  rearDelt: (sets = 2): ExerciseSeed => ({
    id: "csv-rear-delt-fly-machine",
    role: "isolation",
    pattern: "horizontal_pull",
    primary: ["rear_delts"],
    secondary: ["upper_back"],
    sets,
    reps: range(12, 20),
    rest: 60,
    substitutionGroupId: "rear_delt",
    intensity: rir(0, 2),
  }),
  facePull: (): ExerciseSeed => ({
    id: "csv-face-pull",
    role: "isolation",
    pattern: "horizontal_pull",
    primary: ["rear_delts", "upper_back"],
    sets: 2,
    reps: range(12, 20),
    rest: 60,
    substitutionGroupId: "rear_delt",
    intensity: rir(1, 2),
  }),
  curl: (sets = 2): ExerciseSeed => ({
    id: "csv-bicep-curl-dumbbell",
    role: "isolation",
    pattern: "elbow_flexion",
    primary: ["biceps"],
    secondary: ["forearms"],
    sets,
    reps: range(10, 15),
    rest: 60,
    substitutionGroupId: "biceps",
    intensity: rir(0, 2),
  }),
  triceps: (sets = 2): ExerciseSeed => ({
    id: "csv-tricep-pushdown-cable",
    role: "isolation",
    pattern: "elbow_extension",
    primary: ["triceps"],
    sets,
    reps: range(10, 15),
    rest: 60,
    substitutionGroupId: "triceps",
    intensity: rir(0, 2),
  }),
  calf: (sets = 2): ExerciseSeed => ({
    id: "csv-calf-raise-machine",
    role: "isolation",
    pattern: "calf_raise",
    primary: ["calves"],
    sets,
    reps: range(10, 15),
    rest: 60,
    substitutionGroupId: "calves",
    intensity: rir(0, 2),
  }),
  plank: (sets = 2): ExerciseSeed => ({
    id: "csv-plank",
    role: "core",
    pattern: "anti_extension",
    primary: ["core"],
    sets,
    reps: range(30, 60),
    rest: 60,
    substitutionGroupId: "core",
  }),
  crunch: (sets = 2): ExerciseSeed => ({
    id: "csv-cable-crunch",
    role: "core",
    pattern: "spinal_flexion",
    primary: ["core"],
    sets,
    reps: range(10, 15),
    rest: 60,
    substitutionGroupId: "core",
    intensity: rir(1, 2),
  }),
  pushup: (): ExerciseSeed => ({
    id: "csv-push-up",
    role: "secondary_compound",
    pattern: "horizontal_push",
    primary: ["chest"],
    secondary: ["triceps", "front_delts"],
    sets: 3,
    reps: range(8, 15),
    rest: 75,
    substitutionGroupId: "bench_flat",
    intensity: rir(1, 3),
  }),
  invertedRow: (): ExerciseSeed => ({
    id: "csv-inverted-row",
    role: "accessory_compound",
    pattern: "horizontal_pull",
    primary: ["upper_back"],
    secondary: ["lats", "biceps"],
    sets: 3,
    reps: range(8, 12),
    rest: 75,
    substitutionGroupId: "row",
    intensity: rir(1, 3),
  }),
  bandPullApart: (): ExerciseSeed => ({
    id: "csv-band-pull-apart",
    role: "isolation",
    pattern: "horizontal_pull",
    primary: ["rear_delts", "upper_back"],
    sets: 2,
    reps: range(15, 25),
    rest: 45,
    substitutionGroupId: "rear_delt",
    intensity: rir(1, 3),
  }),
  bodyLunge: (): ExerciseSeed => ({
    id: "csv-lunge-bodyweight",
    role: "accessory_compound",
    pattern: "lunge",
    primary: ["quads", "glutes"],
    sets: 2,
    reps: range(10, 16),
    rest: 60,
    substitutionGroupId: "lunge",
    intensity: rir(1, 3),
  }),
  pistolSquat: (): ExerciseSeed => ({
    id: "csv-pistol-squat",
    role: "secondary_compound",
    pattern: "squat",
    primary: ["quads"],
    secondary: ["glutes", "core"],
    sets: 2,
    reps: range(5, 10),
    rest: 75,
    substitutionGroupId: "squat",
    intensity: rir(2, 4),
  }),
  gluteKickback: (): ExerciseSeed => ({
    id: "csv-glute-kickback",
    role: "accessory_compound",
    pattern: "hinge",
    primary: ["glutes"],
    secondary: ["hamstrings"],
    sets: 2,
    reps: range(12, 18),
    rest: 60,
    substitutionGroupId: "hinge",
    intensity: rir(1, 3),
  }),
  hipThrust: (sets = 3): ExerciseSeed => ({
    id: "csv-hip-thrust-barbell",
    role: "accessory_compound",
    pattern: "hinge",
    primary: ["glutes"],
    secondary: ["hamstrings"],
    sets,
    reps: range(8, 12),
    rest: 105,
    substitutionGroupId: "glute_bridge",
    intensity: rir(1, 2),
  }),
};

const strengthProgression = {
  loadIncrease: "increase after all required sets hit target reps with stable technique",
  missProtocol: "repeat load once; reduce 5-10% or slow progression after repeated miss",
  effortTarget: "leave 1-3 reps in reserve on most main lift work",
};

const topSetBackoff = {
  topSet: "one top set at target RPE, then 2-4 back-off sets at reduced load",
  backoffReductionPercent: 8,
  missProtocol: "hold load or reduce back-off volume before changing exercises",
};

const doubleProgression = {
  method: "increase reps inside the range before adding load",
  loadIncrease: "add load when all sets reach the top of the range at target RIR",
  effortTarget: "0-2 RIR on isolation, 1-3 RIR on compounds",
};

function balancedVolume(target = 10): TemplateVolumeTarget[] {
  return [
    "chest",
    "upper_back",
    "lats",
    "shoulders",
    "quads",
    "hamstrings",
    "glutes",
    "core",
  ].map((muscle) => ({
    muscleGroup: muscle as TemplateMuscleGroup,
    directSetsPerWeek: { min: Math.max(4, target - 4), target, max: target + 4 },
  }));
}

const strengthBase = (id: string, name: string, level: ProgramTemplateLevel, daysPerWeek: number, workouts: WorkoutDayTemplate[], split: ProgramTemplateSplit): ProgramTemplate =>
  template({
    id,
    name,
    shortDescription: "Ana kaldırışları erken sıraya alan, aksesuarları güç gelişimini desteklemek için sınırlı tutan FORGE güç tabanı.",
    goal: "strength",
    level,
    daysPerWeek,
    durationWeeks: level === "advanced" ? 8 : 6,
    split,
    sessionMinutes: { min: 45, target: level === "beginner" ? 55 : 65, max: 80 },
    equipmentRequired: gym,
    equipmentOptional: ["belt", "lifting_straps"],
    compatibleFocusMuscles: ["chest", "upper_back", "lats", "quads", "hamstrings", "glutes", "shoulders"],
    progressionModel: level === "beginner" ? "linear" : "top_set_backoff",
    progressionConfig: level === "beginner" ? strengthProgression : topSetBackoff,
    volumeTargets: balancedVolume(level === "beginner" ? 6 : 8),
    workouts,
  });

const hypertrophyBase = (id: string, name: string, level: ProgramTemplateLevel, daysPerWeek: number, workouts: WorkoutDayTemplate[], split: ProgramTemplateSplit): ProgramTemplate =>
  template({
    id,
    name,
    shortDescription: "Kas gelişimi için kaliteli set, açı çeşitliliği ve kontrollü double progression kullanan FORGE hipertrofi tabanı.",
    goal: "hypertrophy",
    level,
    daysPerWeek,
    durationWeeks: 8,
    split,
    sessionMinutes: { min: 45, target: daysPerWeek >= 5 ? 65 : 60, max: 85 },
    equipmentRequired: gym,
    equipmentOptional: ["straps"],
    compatibleFocusMuscles: ["upper_chest", "chest", "lats", "upper_back", "rear_delts", "side_delts", "biceps", "triceps", "quads", "hamstrings", "glutes", "calves", "core"],
    progressionModel: "double_progression",
    progressionConfig: doubleProgression,
    volumeTargets: balancedVolume(level === "advanced" ? 14 : 11),
    workouts,
    adaptationRules: { maxExtraSetsPerMusclePerWeek: level === "advanced" ? 6 : 4 },
  });

const powerbuildingBase = (id: string, name: string, level: ProgramTemplateLevel, daysPerWeek: number, workouts: WorkoutDayTemplate[]): ProgramTemplate =>
  template({
    id,
    name,
    shortDescription: "Ana lift progresyonunu korurken aksesuar hacmiyle kas gelişimini destekleyen FORGE powerbuilding tabanı.",
    goal: "powerbuilding",
    level,
    daysPerWeek,
    durationWeeks: level === "advanced" ? 8 : 6,
    split: "powerbuilding",
    sessionMinutes: { min: 55, target: 70, max: 90 },
    equipmentRequired: gym,
    equipmentOptional: ["belt", "lifting_straps"],
    compatibleFocusMuscles: ["chest", "upper_back", "lats", "quads", "hamstrings", "glutes", "shoulders", "side_delts"],
    progressionModel: "custom",
    progressionConfig: {
      mainLifts: topSetBackoff,
      accessories: doubleProgression,
      fatigueRule: "do not add accessory sets when main lift performance drops across two exposures",
    },
    volumeTargets: balancedVolume(level === "advanced" ? 12 : 10),
    workouts,
  });

const generalBase = (
  id: string,
  name: string,
  level: ProgramTemplateLevel,
  daysPerWeek: number,
  workouts: WorkoutDayTemplate[],
  required: string[],
): ProgramTemplate =>
  template({
    id,
    name,
    shortDescription: "Ana hareket örüntülerini kapsayan, karmaşıklığı düşük ve sürdürülebilir FORGE genel fitness tabanı.",
    goal: "general_fitness",
    level,
    daysPerWeek,
    durationWeeks: 6,
    split: "full_body",
    sessionMinutes: { min: 30, target: 45, max: 60 },
    equipmentRequired: required,
    equipmentOptional: gym,
    compatibleFocusMuscles: ["chest", "upper_back", "lats", "quads", "hamstrings", "glutes", "core", "side_delts"],
    progressionModel: "rep_goal",
    progressionConfig: {
      method: "add reps first, then load or harder variation",
      conditioning: "add small time or density only when recovery remains good",
    },
    volumeTargets: balancedVolume(7),
    workouts,
  });

const fbStrengthDays = [
  day(1, "Squat Strength", ["quads", "chest", "upper_back"], 55, [E.squat(4), E.bench(4), E.row(3), E.rdl(2), E.plank(2)]),
  day(2, "Hinge Strength", ["hamstrings", "shoulders", "lats"], 55, [E.deadlift(3), E.overhead(4), E.pulldown(3), E.lunge(), E.facePull()]),
  day(3, "Bench Strength", ["chest", "quads", "lats"], 55, [E.bench(5, range(3, 5)), E.frontSquat(), E.pullup(3), E.inclineDb(2), E.legCurl(2)]),
];

const upperStrength = day(1, "Upper Strength", ["chest", "upper_back", "shoulders"], 65, [E.bench(4), E.row(4), E.overhead(3), E.pulldown(3), E.triceps(2)]);
const lowerStrength = day(2, "Lower Strength", ["quads", "hamstrings", "glutes"], 65, [E.squat(4), E.deadlift(2), E.legPress(2), E.legCurl(2), E.plank(2)]);
const upperVolumeStrength = day(3, "Upper Volume Support", ["chest", "lats", "rear_delts"], 60, [E.pausedBench(), E.pullup(3), E.dbBench(3, range(6, 10)), E.facePull(), E.curl(2)]);
const lowerPosteriorStrength = day(4, "Lower Posterior Support", ["hamstrings", "quads", "core"], 60, [E.frontSquat(), E.rdl(3), E.splitSquat(), E.calf(2), E.crunch(2)]);

const upperHypertrophy = day(1, "Upper Hypertrophy", ["chest", "upper_back", "side_delts"], 60, [E.dbBench(3), E.cableRow(3), E.inclineDb(3), E.pulldown(3), E.lateral(3), E.triceps(2)]);
const lowerHypertrophy = day(2, "Lower Hypertrophy", ["quads", "hamstrings", "glutes"], 60, [E.legPress(4), E.rdl(3), E.splitSquat(), E.legCurl(3), E.calf(3), E.plank(2)]);
const upperHypertrophyB = day(3, "Upper Angle Coverage", ["upper_chest", "lats", "rear_delts"], 60, [E.inclineDb(4), E.pulldown(3), E.cableRow(3), E.fly(2), E.rearDelt(3), E.curl(2)]);
const lowerHypertrophyB = day(4, "Lower Pump And Balance", ["quads", "glutes", "calves"], 60, [E.squat(3, range(6, 8)), E.hipThrust(3), E.legExt(3), E.legCurl(2), E.calf(3), E.crunch(2)]);

const pushDay = day(1, "Push", ["chest", "shoulders", "triceps"], 65, [E.bench(3, range(5, 8)), E.inclineDb(3), E.dbOverhead(), E.fly(2), E.lateral(3), E.triceps(3)]);
const pullDay = day(2, "Pull", ["lats", "upper_back", "biceps"], 65, [E.pullup(3), E.row(3), E.cableRow(3), E.rearDelt(3), E.curl(3), E.plank(2)]);
const legsDay = day(3, "Legs", ["quads", "hamstrings", "glutes"], 65, [E.squat(3, range(6, 8)), E.rdl(3), E.legPress(3), E.legCurl(3), E.calf(3), E.crunch(2)]);

export const PROGRAM_TEMPLATE_DEFINITIONS: ProgramTemplate[] = [
  strengthBase("forge_strength_fullbody_beginner_3d_v1", "Temel Güç 3 Gün", "beginner", 3, fbStrengthDays, "full_body"),
  strengthBase("forge_strength_upper_lower_beginner_4d_v1", "Dengeli Güç Başlangıç 4 Gün", "beginner", 4, [upperStrength, lowerStrength, upperVolumeStrength, lowerPosteriorStrength], "upper_lower"),
  strengthBase("forge_strength_fullbody_intermediate_3d_v1", "Güç Becerisi 3 Gün", "intermediate", 3, [
    day(1, "Volume Full Body", ["quads", "chest"], 65, [E.squat(4, range(4, 6)), E.bench(4, range(4, 6)), E.row(4), E.legCurl(2), E.plank(2)]),
    day(2, "Technique Full Body", ["hamstrings", "shoulders"], 60, [E.deadlift(3, range(2, 4)), E.overhead(4, range(3, 5)), E.pulldown(3), E.lunge(), E.facePull()]),
    day(3, "Intensity Full Body", ["chest", "quads"], 65, [E.pausedBench(), E.frontSquat(), E.pullup(4), E.rdl(2), E.triceps(2)]),
  ], "full_body"),
  strengthBase("forge_strength_upper_lower_intermediate_4d_v1", "Güç Upper/Lower 4 Gün", "intermediate", 4, [upperStrength, lowerStrength, upperVolumeStrength, lowerPosteriorStrength], "upper_lower"),
  strengthBase("forge_strength_split_intermediate_4d_v1", "Ana Lift Split 4 Gün", "intermediate", 4, [
    day(1, "Squat Day", ["quads", "core"], 65, [E.squat(5, range(3, 5)), E.legPress(3), E.legCurl(2), E.calf(2), E.plank(2)]),
    day(2, "Bench Day", ["chest", "upper_back"], 65, [E.bench(5, range(3, 5)), E.row(4), E.inclineDb(2), E.facePull(), E.triceps(2)]),
    day(3, "Deadlift Day", ["hamstrings", "glutes"], 65, [E.deadlift(3, range(2, 4)), E.frontSquat(), E.pulldown(3), E.splitSquat(), E.crunch(2)]),
    day(4, "Press And Pull", ["shoulders", "lats"], 60, [E.overhead(4), E.pullup(4), E.dbBench(2), E.lateral(2), E.curl(2)]),
  ], "custom"),
  strengthBase("forge_strength_focused_intermediate_5d_v1", "Güç Odaklı 5 Gün", "intermediate", 5, [
    day(1, "Squat Strength", ["quads"], 65, [E.squat(5), E.legPress(2), E.legCurl(2), E.plank(2)]),
    day(2, "Bench Strength", ["chest"], 65, [E.bench(5), E.row(4), E.inclineDb(2), E.triceps(2)]),
    day(3, "Hinge Strength", ["hamstrings"], 65, [E.deadlift(3), E.frontSquat(), E.pulldown(3), E.crunch(2)]),
    day(4, "Press Skill", ["shoulders", "upper_back"], 55, [E.overhead(4), E.pullup(3), E.facePull(), E.curl(2)]),
    day(5, "Volume Support", ["full_body"], 55, [E.pausedBench(), E.rdl(2), E.cableRow(3), E.lunge(), E.lateral(2)]),
  ], "custom"),
  strengthBase("forge_strength_advanced_4d_v1", "İleri Güç 4 Gün", "advanced", 4, [upperStrength, lowerStrength, upperVolumeStrength, lowerPosteriorStrength], "upper_lower"),
  strengthBase("forge_strength_advanced_5d_v1", "İleri Ana Lift 5 Gün", "advanced", 5, [
    day(1, "Squat Volume", ["quads"], 70, [E.squat(5, range(3, 5)), E.frontSquat(), E.legCurl(2), E.plank(2)]),
    day(2, "Bench Volume", ["chest"], 70, [E.bench(5, range(3, 5)), E.row(4), E.inclineDb(2), E.triceps(2)]),
    day(3, "Deadlift Intensity", ["hamstrings"], 65, [E.deadlift(3, range(1, 3)), E.legPress(2), E.pulldown(3), E.crunch(2)]),
    day(4, "Upper Back Press", ["shoulders", "upper_back"], 60, [E.overhead(4), E.pullup(4), E.facePull(), E.curl(2)]),
    day(5, "Technique Bridge", ["full_body"], 55, [E.pausedBench(), E.frontSquat(), E.rdl(2), E.cableRow(3), E.lateral(2)]),
  ], "custom"),

  hypertrophyBase("forge_hypertrophy_fullbody_beginner_3d_v1", "Kas Gelişimi Başlangıç 3 Gün", "beginner", 3, [
    day(1, "Full Body A", ["chest", "quads", "upper_back"], 55, [E.dbBench(3), E.legPress(3), E.cableRow(3), E.legCurl(2), E.lateral(2), E.plank(2)]),
    day(2, "Full Body B", ["lats", "glutes", "shoulders"], 55, [E.gobletSquat(), E.pulldown(3), E.dbOverhead(), E.dbRdl(), E.curl(2), E.crunch(2)]),
    day(3, "Full Body C", ["upper_chest", "quads", "rear_delts"], 55, [E.inclineDb(3), E.legPress(3), E.cableRow(3), E.legExt(2), E.rearDelt(2), E.triceps(2)]),
  ], "full_body"),
  hypertrophyBase("forge_hypertrophy_upper_lower_beginner_4d_v1", "Kas Gelişimi Upper/Lower Başlangıç", "beginner", 4, [upperHypertrophy, lowerHypertrophy, upperHypertrophyB, lowerHypertrophyB], "upper_lower"),
  hypertrophyBase("forge_hypertrophy_fullbody_intermediate_3d_v1", "Dengeli Hipertrofi 3 Gün", "intermediate", 3, [
    day(1, "Full Body Push Bias", ["chest", "quads"], 65, [E.bench(3, range(5, 8)), E.legPress(4), E.cableRow(3), E.fly(2), E.legCurl(2), E.lateral(2)]),
    day(2, "Full Body Pull Bias", ["lats", "hamstrings"], 65, [E.rdl(3), E.pullup(3), E.dbOverhead(), E.splitSquat(), E.rearDelt(2), E.curl(2)]),
    day(3, "Full Body Volume", ["upper_chest", "glutes"], 65, [E.inclineDb(4), E.hipThrust(3), E.pulldown(3), E.legExt(2), E.triceps(2), E.crunch(2)]),
  ], "full_body"),
  hypertrophyBase("forge_hypertrophy_upper_lower_intermediate_4d_v1", "Kas Gelişimi Upper/Lower", "intermediate", 4, [upperHypertrophy, lowerHypertrophy, upperHypertrophyB, lowerHypertrophyB], "upper_lower"),
  hypertrophyBase("forge_hypertrophy_intermediate_5d_v1", "Yoğun Hipertrofi 5 Gün", "intermediate", 5, reindexDays([pushDay, pullDay, legsDay, upperHypertrophyB, lowerHypertrophyB]), "custom"),
  hypertrophyBase("forge_hypertrophy_body_part_intermediate_5d_v1", "Bölgesel Hipertrofi 5 Gün", "intermediate", 5, [
    day(1, "Chest And Delts", ["chest", "upper_chest", "side_delts"], 65, [E.bench(3, range(5, 8)), E.inclineDb(3), E.fly(3), E.lateral(3), E.triceps(2)]),
    day(2, "Back Width And Thickness", ["lats", "upper_back"], 65, [E.pullup(3), E.row(4), E.pulldown(3), E.rearDelt(3), E.curl(2)]),
    day(3, "Legs", ["quads", "hamstrings", "glutes"], 70, [E.squat(3, range(6, 8)), E.legPress(3), E.rdl(3), E.legCurl(3), E.calf(3)]),
    day(4, "Arms And Delts", ["biceps", "triceps", "side_delts"], 55, [E.dbOverhead(), E.lateral(4), E.curl(3), E.triceps(3), E.facePull()]),
    day(5, "Posterior And Core", ["glutes", "hamstrings", "core"], 55, [E.hipThrust(4), E.splitSquat(), E.legCurl(2), E.calf(2), E.crunch(3)]),
  ], "body_part"),
  hypertrophyBase("forge_hypertrophy_ppl_intermediate_6d_v1", "PPL Hipertrofi 6 Gün", "intermediate", 6, [pushDay, pullDay, legsDay, pushDay, pullDay, legsDay].map((item, index) => ({ ...item, dayIndex: index + 1, name: `${item.name} ${index < 3 ? "A" : "B"}` })), "push_pull_legs"),
  hypertrophyBase("forge_hypertrophy_upper_lower_advanced_4d_v1", "İleri Upper/Lower Hipertrofi", "advanced", 4, [upperHypertrophy, lowerHypertrophy, upperHypertrophyB, lowerHypertrophyB], "upper_lower"),
  hypertrophyBase("forge_hypertrophy_advanced_5d_v1", "İleri Hipertrofi 5 Gün", "advanced", 5, reindexDays([pushDay, pullDay, legsDay, upperHypertrophyB, lowerHypertrophyB]), "custom"),
  hypertrophyBase("forge_hypertrophy_ppl_advanced_6d_v1", "İleri PPL Hipertrofi 6 Gün", "advanced", 6, [pushDay, pullDay, legsDay, pushDay, pullDay, legsDay].map((item, index) => ({ ...item, dayIndex: index + 1, name: `${item.name} ${index < 3 ? "Strength Bias" : "Volume Bias"}` })), "push_pull_legs"),

  powerbuildingBase("forge_powerbuilding_intermediate_4d_v1", "Güç ve Kas 4 Gün", "intermediate", 4, [upperStrength, lowerStrength, upperHypertrophyB, lowerHypertrophyB]),
  powerbuildingBase("forge_powerbuilding_intermediate_5d_v1", "Güç ve Kas 5 Gün", "intermediate", 5, reindexDays([upperStrength, lowerStrength, pushDay, pullDay, legsDay])),
  powerbuildingBase("forge_powerbuilding_advanced_4d_v1", "İleri Güç ve Kas 4 Gün", "advanced", 4, [upperStrength, lowerStrength, upperHypertrophyB, lowerHypertrophyB]),
  powerbuildingBase("forge_powerbuilding_advanced_5d_v1", "İleri Güç ve Kas 5 Gün", "advanced", 5, reindexDays([upperStrength, lowerStrength, pushDay, pullDay, legsDay])),

  generalBase("forge_general_fitness_gym_beginner_3d_v1", "Genel Fitness Gym 3 Gün", "beginner", 3, [
    day(1, "Full Body Base", ["full_body"], 45, [E.gobletSquat(), E.dbBench(2), E.cableRow(2), E.dbRdl(), E.plank(2)]),
    day(2, "Pull And Legs", ["full_body"], 45, [E.legPress(2), E.pulldown(2), E.dbOverhead(), E.lunge(), E.crunch(2)]),
    day(3, "Balanced Circuit", ["full_body"], 45, [E.pushup(), E.dbRow(), E.gobletSquat(), E.legCurl(2), E.bandPullApart(), E.plank(2)]),
  ], gym),
  generalBase("forge_general_fitness_dumbbell_beginner_3d_v1", "Dumbbell Başlangıç 3 Gün", "beginner", 3, [
    day(1, "Dumbbell Full Body A", ["full_body"], 40, [E.gobletSquat(), E.dbBench(3), E.dbRow(), E.dbRdl(), E.plank(2)]),
    day(2, "Dumbbell Full Body B", ["full_body"], 40, [E.lunge(), E.dbOverhead(), E.dbRow(), E.bodyLunge(), E.curl(2), E.plank(2)]),
    day(3, "Dumbbell Full Body C", ["full_body"], 40, [E.gobletSquat(), E.pushup(), E.dbRdl(), E.lateral(2), E.crunch(2)]),
  ], dbOnly),
  generalBase("forge_general_fitness_home_bodyweight_beginner_3d_v1", "Evde Başlangıç 3 Gün", "beginner", 3, [
    day(1, "Home Full Body A", ["full_body"], 35, [E.pushup(), E.pistolSquat(), E.invertedRow(), E.gluteKickback(), E.bandPullApart(), E.plank(2)]),
    day(2, "Home Full Body B", ["full_body"], 35, [E.pushup(), E.pullup(2), E.pistolSquat(), E.gluteKickback(), E.bandPullApart(), E.crunch(2)]),
    day(3, "Home Full Body C", ["full_body"], 35, [E.pushup(), E.invertedRow(), E.pistolSquat(), E.gluteKickback(), E.bandPullApart(), E.plank(2)]),
  ], bodyweight),
  generalBase("forge_general_fitness_gym_beginner_4d_v1", "Genel Fitness Gym 4 Gün", "beginner", 4, [upperHypertrophy, lowerHypertrophy, upperHypertrophyB, lowerHypertrophyB], gym),
  generalBase("forge_general_fitness_intermediate_3d_v1", "Genel Fitness Dengeli 3 Gün", "intermediate", 3, [fbStrengthDays[0]!, fbStrengthDays[1]!, fbStrengthDays[2]!], gym),
  generalBase("forge_general_fitness_intermediate_4d_v1", "Genel Fitness Dengeli 4 Gün", "intermediate", 4, [upperHypertrophy, lowerHypertrophy, upperHypertrophyB, lowerHypertrophyB], gym),
];
