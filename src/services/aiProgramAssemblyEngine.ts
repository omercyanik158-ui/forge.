import { EXERCISE_PROGRAMMING_META } from '@/data/exerciseProgrammingMeta';
import {
  bucketToMuscleRoles,
  getReplacementsFor,
  isCompatibleWithEquipment,
  isPreferredForLimitation,
  isSafeForLimitations,
} from '@/services/exerciseKB';
import type { ExerciseCategory, ExerciseProgrammingMeta, MovementPattern, PriorityMuscleBucket } from '@/types/exerciseKB';
import type { AIProgramArchetypeKey, AIProgramSplitKey } from '@/types/aiProgramDecision';
import type { AIProgramEquipmentKey, AIProgramExperience, AIProgramGoal, AIProgramRecoveryQuality } from '@/types/aiProgram';
import type {
  AssembledDay,
  AssembledExercise,
  AssemblyEngineInput,
  ProgramAuditCategoryKey,
  ProgramAuditCategoryScore,
  ProgramAuditResult,
  SessionAssemblyPlan,
  StrengthProgressionMethod,
  StrengthSessionBlockRole,
} from '@/types/aiProgramAssembly';

/**
 * Faz 6 — Selection & Assembly Engine
 *
 * Deterministik, lokal, açıklanabilir hareket seçimi. Faz 4 KB ve Faz 5
 * volume blueprint'i birleştirerek her gün için hareket listesi üretir.
 *
 * Kurallar:
 * - compound hareketler taze (gün başı) yerleşir; izolasyon sonra.
 * - aynı pattern'den gereksiz tekrar önlenir (redundancy).
 * - bildirilen ağrı için 'avoid' hareketler elenir, 'preferred' önceliklenir.
 * - seans süresi perSessionSetCeiling'i aşarsa izolasyon kırpılır.
 */

type DayFocus = {
  title: string;
  buckets: PriorityMuscleBucket[];
};

type StrengthSlot =
  | 'squat_or_leg_press'
  | 'bench_press'
  | 'deadlift_or_rdl'
  | 'overhead_press'
  | 'row'
  | 'vertical_pull'
  | 'bench_accessory'
  | 'single_leg'
  | 'hamstring_accessory'
  | 'triceps'
  | 'biceps'
  | 'lateral_raise'
  | 'rear_delt'
  | 'core';

type StrengthDayTemplate = {
  title: string;
  mainSlots: StrengthSlot[];
  accessorySlots: StrengthSlot[];
};

type StrengthArchetypeKey = 'novice_linear' | 'late_beginner_rep_range' | 'intermediate_hlm';

type StrengthLiftPattern = 'squat' | 'bench' | 'deadlift' | 'press' | 'row' | 'pullup';

type NormalizedTrainingProfile = {
  experience: AIProgramExperience;
  sessionDurationMin: number;
  recoveryQuality: AIProgramRecoveryQuality;
  availableEquipment: AssemblyEngineInput['availableEquipment'];
  limitations: AssemblyEngineInput['limitations'];
  preferredExerciseIds: string[];
  avoidedExerciseIds: string[];
};

type StrengthBlockSpec = {
  role: StrengthSessionBlockRole;
  label: string;
  patterns: MovementPattern[];
  liftPatterns: StrengthLiftPattern[];
  main: boolean;
  optional?: boolean;
  progressionMethod?: StrengthProgressionMethod;
  preferredIds?: string[];
};

type ThreeDayStrengthBlueprintDay = {
  title: string;
  dayRole: string;
  blocks: StrengthBlockSpec[];
};

type HypertrophyRole = 'primary_compound' | 'secondary' | 'isolation' | 'pump';

type HypertrophySlot = {
  role: HypertrophyRole;
  exerciseIds: string[];
};

type MovementSide = 'push' | 'pull' | 'lower' | 'core' | 'arms' | 'conditioning';

type PriorityTrainingStrategy = {
  priorityBuckets: PriorityMuscleBucket[];
  priorityOrder: Map<PriorityMuscleBucket, number>;
};

const UPPER: PriorityMuscleBucket[] = ['chest', 'shoulders', 'lats', 'upper_back', 'arms'];
const LOWER: PriorityMuscleBucket[] = ['quads', 'hamstrings', 'glutes', 'calves', 'core'];
const PUSH: PriorityMuscleBucket[] = ['chest', 'shoulders', 'arms'];
const PULL: PriorityMuscleBucket[] = ['lats', 'upper_back', 'arms'];
const LEGS: PriorityMuscleBucket[] = ['quads', 'hamstrings', 'glutes', 'calves', 'core'];
const TORSO: PriorityMuscleBucket[] = ['chest', 'shoulders', 'lats', 'upper_back', 'arms', 'core'];
const LIMBS: PriorityMuscleBucket[] = ['quads', 'hamstrings', 'glutes', 'calves'];
const ANTERIOR: PriorityMuscleBucket[] = ['chest', 'shoulders', 'quads', 'core'];
const POSTERIOR: PriorityMuscleBucket[] = ['lats', 'upper_back', 'hamstrings', 'glutes', 'core'];
const FULL: PriorityMuscleBucket[] = ['chest', 'shoulders', 'lats', 'upper_back', 'quads', 'hamstrings', 'glutes', 'core'];

const STRENGTH_SLOT_IDS: Record<StrengthSlot, string[]> = {
  squat_or_leg_press: ['Barbell_Squat', 'Front_Barbell_Squat', 'Leg_Press'],
  bench_press: ['Barbell_Bench_Press_-_Medium_Grip', 'Smith_Machine_Bench_Press', 'Dumbbell_Bench_Press'],
  deadlift_or_rdl: ['Barbell_Deadlift', 'Romanian_Deadlift', 'Leg_Press'],
  overhead_press: ['Barbell_Shoulder_Press', 'Smith_Machine_Overhead_Shoulder_Press', 'Dumbbell_Shoulder_Press', 'Seated_Dumbbell_Press'],
  row: ['Bent_Over_Barbell_Row', 'Seated_Cable_Rows', 'T-Bar_Row_with_Handle', 'One-Arm_Dumbbell_Row'],
  vertical_pull: ['Pullups', 'Wide-Grip_Lat_Pulldown', 'Close-Grip_Front_Lat_Pulldown'],
  bench_accessory: ['Incline_Dumbbell_Press', 'Close-Grip_Barbell_Bench_Press', 'Barbell_Incline_Bench_Press_-_Medium_Grip'],
  single_leg: ['Dumbbell_Lunges', 'Leg_Press', 'Bodyweight_Squat'],
  hamstring_accessory: ['Romanian_Deadlift', 'Leg_Curl', 'Band_Good_Morning'],
  triceps: ['Triceps_Pushdown', 'Close-Grip_Barbell_Bench_Press'],
  biceps: ['Barbell_Curl', 'Dumbbell_Biceps_Curl'],
  lateral_raise: ['Side_Lateral_Raise', 'Cable_Seated_Lateral_Raise'],
  rear_delt: ['Face_Pull', 'Bent_Over_Rear_Delt_Raise'],
  core: ['Plank', 'Crunches', 'Dead_Bug'],
};

const DECLINE_PRESS_IDS = new Set([
  'Decline_Barbell_Bench_Press',
  'Decline_Dumbbell_Bench_Press',
  'Decline_Dumbbell_Flyes',
  'Decline_Push-Up',
  'Leverage_Decline_Chest_Press',
]);

const THREE_DAY_STRENGTH_MAIN_ROLES = new Set<StrengthSessionBlockRole>([
  'main_lower_lift',
  'main_upper_lift',
]);

const STRENGTH_PATTERN_BUCKETS: Partial<Record<MovementPattern, PriorityMuscleBucket>> = {
  squat_pattern: 'quads',
  hinge_pattern: 'hamstrings',
  horizontal_push: 'chest',
  vertical_push: 'shoulders',
  horizontal_pull: 'upper_back',
  vertical_pull: 'lats',
  lunge_pattern: 'quads',
  knee_flexion: 'hamstrings',
  elbow_flexion: 'arms',
  elbow_extension: 'arms',
  core_anti_extension: 'core',
  core_flexion: 'core',
  core_anti_rotation: 'core',
  core_rotation: 'core',
};

const STRENGTH_BLOCK_FALLBACK_IDS: Partial<Record<StrengthSessionBlockRole, string[]>> = {
  main_lower_lift: [
    'Barbell_Squat',
    'Front_Barbell_Squat',
    'Leg_Press',
    'Barbell_Deadlift',
    'Romanian_Deadlift',
    'Band_Good_Morning',
    'Bodyweight_Squat',
  ],
  main_upper_lift: [
    'Barbell_Bench_Press_-_Medium_Grip',
    'Smith_Machine_Bench_Press',
    'Dumbbell_Bench_Press',
    'Pushups',
    'Barbell_Shoulder_Press',
    'Smith_Machine_Overhead_Shoulder_Press',
    'Dumbbell_Shoulder_Press',
    'Seated_Dumbbell_Press',
  ],
  primary_pull: [
    'Seated_Cable_Rows',
    'One-Arm_Dumbbell_Row',
    'Bent_Over_Barbell_Row',
    'T-Bar_Row_with_Handle',
    'Wide-Grip_Lat_Pulldown',
    'Close-Grip_Front_Lat_Pulldown',
    'Pullups',
    'Band_Pull_Apart',
  ],
  secondary_strength_movement: [
    'Romanian_Deadlift',
    'Dumbbell_Lunges',
    'Leg_Press',
    'Close-Grip_Barbell_Bench_Press',
    'Incline_Dumbbell_Press',
    'Face_Pull',
  ],
  assistance: [
    'Lying_Leg_Curls',
    'Face_Pull',
    'Band_Pull_Apart',
    'Triceps_Pushdown',
    'Dumbbell_Bicep_Curl',
    'Barbell_Curl',
  ],
  core_bracing: ['Plank', 'Dead_Bug', 'Side_Bridge', 'Cable_Crunch'],
};

const BIG_HYPERTROPHY_BUCKETS = new Set<PriorityMuscleBucket>([
  'chest',
  'shoulders',
  'lats',
  'upper_back',
  'glutes',
  'quads',
  'hamstrings',
]);

const REGIONAL_PRIORITY_ORDER: Partial<Record<PriorityMuscleBucket, string[]>> = {
  chest: ['incline', 'flat', 'decline', 'fly', 'base'],
  shoulders: ['vertical_push', 'shoulder_abduction', 'scapular_retraction', 'base'],
  lats: ['vertical_pull', 'straight_arm_pull', 'base'],
  upper_back: ['horizontal_pull', 'scapular_retraction', 'base'],
  quads: ['squat_pattern', 'lunge_pattern', 'knee_extension', 'base'],
  hamstrings: ['hinge_pattern', 'knee_flexion', 'base'],
  glutes: ['hip_extension', 'lunge_pattern', 'hinge_pattern', 'base'],
  arms: ['elbow_flexion', 'elbow_extension', 'base'],
  core: ['core_anti_extension', 'core_flexion', 'core_rotation', 'base'],
};

const HYPERTROPHY_SLOT_IDS: Record<PriorityMuscleBucket, HypertrophySlot[]> = {
  chest: [
    {
      role: 'primary_compound',
      exerciseIds: ['Barbell_Bench_Press_-_Medium_Grip', 'Dumbbell_Bench_Press', 'Smith_Machine_Bench_Press', 'Leverage_Chest_Press', 'Pushups'],
    },
    {
      role: 'secondary',
      exerciseIds: ['Incline_Dumbbell_Press', 'Barbell_Incline_Bench_Press_-_Medium_Grip', 'Leverage_Incline_Chest_Press', 'Smith_Machine_Incline_Bench_Press'],
    },
    {
      role: 'isolation',
      exerciseIds: ['Cable_Crossover', 'Dumbbell_Flyes', 'Incline_Cable_Flye', 'Incline_Dumbbell_Flyes', 'Low_Cable_Crossover', 'Decline_Dumbbell_Flyes'],
    },
  ],
  shoulders: [
    {
      role: 'primary_compound',
      exerciseIds: ['Dumbbell_Shoulder_Press', 'Seated_Dumbbell_Press', 'Leverage_Shoulder_Press', 'Barbell_Shoulder_Press', 'Arnold_Dumbbell_Press'],
    },
    {
      role: 'isolation',
      exerciseIds: ['Side_Lateral_Raise', 'Cable_Seated_Lateral_Raise'],
    },
    {
      role: 'pump',
      exerciseIds: ['Face_Pull', 'Back_Flyes_-_With_Bands', 'Band_Pull_Apart'],
    },
  ],
  lats: [
    {
      role: 'primary_compound',
      exerciseIds: ['Wide-Grip_Lat_Pulldown', 'Close-Grip_Front_Lat_Pulldown', 'Pullups', 'V-Bar_Pulldown', 'Underhand_Cable_Pulldowns'],
    },
    {
      role: 'isolation',
      exerciseIds: ['Straight-Arm_Pulldown'],
    },
  ],
  upper_back: [
    {
      role: 'primary_compound',
      exerciseIds: ['Seated_Cable_Rows', 'One-Arm_Dumbbell_Row', 'T-Bar_Row_with_Handle', 'Bent_Over_Barbell_Row', 'Smith_Machine_Bent_Over_Row'],
    },
    {
      role: 'pump',
      exerciseIds: ['Face_Pull', 'Back_Flyes_-_With_Bands', 'Band_Pull_Apart'],
    },
  ],
  arms: [
    {
      role: 'isolation',
      exerciseIds: ['Dumbbell_Bicep_Curl'],
    },
    {
      role: 'isolation',
      exerciseIds: ['Triceps_Pushdown', 'Close-Grip_Barbell_Bench_Press'],
    },
  ],
  glutes: [
    {
      role: 'primary_compound',
      exerciseIds: ['Barbell_Hip_Thrust', 'Dumbbell_Lunges', 'Butt_Lift_Bridge'],
    },
    {
      role: 'secondary',
      exerciseIds: ['Romanian_Deadlift', 'Single_Leg_Glute_Bridge', 'Pelvic_Tilt_Into_Bridge'],
    },
  ],
  quads: [
    {
      role: 'primary_compound',
      exerciseIds: ['Barbell_Squat', 'Front_Barbell_Squat', 'Leg_Press', 'Bodyweight_Squat'],
    },
    {
      role: 'secondary',
      exerciseIds: ['Dumbbell_Lunges', 'Bodyweight_Walking_Lunge'],
    },
    {
      role: 'isolation',
      exerciseIds: ['Leg_Extensions'],
    },
  ],
  hamstrings: [
    {
      role: 'primary_compound',
      exerciseIds: ['Romanian_Deadlift', 'Barbell_Deadlift', 'Band_Good_Morning'],
    },
    {
      role: 'isolation',
      exerciseIds: ['Lying_Leg_Curls'],
    },
  ],
  calves: [
    {
      role: 'isolation',
      exerciseIds: ['Standing_Calf_Raises'],
    },
  ],
  core: [
    {
      role: 'secondary',
      exerciseIds: ['Plank', 'Dead_Bug', 'Cable_Crunch'],
    },
    {
      role: 'isolation',
      exerciseIds: ['Crunches', 'Alternate_Heel_Touchers', 'Side_Bridge'],
    },
  ],
};

function isThreeDayFullBodyStrength(input: AssemblyEngineInput): boolean {
  return input.goal === 'strength'
    && input.recommendedTrainingDays === 3
    && (input.split === 'full_body' || input.programArchetype === 'full_body_strength_skill');
}

function normalizeTrainingProfile(input: AssemblyEngineInput): NormalizedTrainingProfile {
  return {
    experience: input.experience ?? 'intermediate',
    sessionDurationMin: input.sessionDurationMin ?? 60,
    recoveryQuality: input.recoveryQuality ?? 'okay',
    availableEquipment: input.availableEquipment,
    limitations: input.limitations,
    preferredExerciseIds: input.preferredExerciseIds ?? [],
    avoidedExerciseIds: input.avoidedExerciseIds ?? [],
  };
}

function selectStrengthArchetype(profile: NormalizedTrainingProfile): StrengthArchetypeKey {
  if (profile.experience === 'beginner' || profile.experience === 'returning') {
    return 'novice_linear';
  }
  if (profile.experience === 'intermediate' && profile.recoveryQuality !== 'poor') {
    return 'intermediate_hlm';
  }
  return 'late_beginner_rep_range';
}

function progressionForArchetype(archetype: StrengthArchetypeKey, main: boolean): StrengthProgressionMethod | undefined {
  if (!main) return undefined;
  if (archetype === 'novice_linear') return 'linear_load_progression';
  if (archetype === 'late_beginner_rep_range') return 'rep_range_progression';
  return 'top_set_backoff';
}

function buildThreeDayFullBodyStrengthBlueprint(archetype: StrengthArchetypeKey): ThreeDayStrengthBlueprintDay[] {
  const mainProgression = progressionForArchetype(archetype, true);
  return [
    {
      title: 'Squat Strength',
      dayRole: 'Squat emphasis + bench emphasis',
      blocks: [
        {
          role: 'main_lower_lift',
          label: 'Main Lower Lift',
          patterns: ['squat_pattern'],
          liftPatterns: ['squat'],
          main: true,
          progressionMethod: mainProgression,
          preferredIds: ['Barbell_Squat', 'Front_Barbell_Squat', 'Leg_Press', 'Bodyweight_Squat'],
        },
        {
          role: 'main_upper_lift',
          label: 'Main Upper Lift',
          patterns: ['horizontal_push'],
          liftPatterns: ['bench'],
          main: true,
          progressionMethod: mainProgression,
          preferredIds: ['Barbell_Bench_Press_-_Medium_Grip', 'Smith_Machine_Bench_Press', 'Dumbbell_Bench_Press', 'Pushups'],
        },
        {
          role: 'primary_pull',
          label: 'Primary Pull',
          patterns: ['horizontal_pull'],
          liftPatterns: ['row'],
          main: false,
          preferredIds: ['Seated_Cable_Rows', 'One-Arm_Dumbbell_Row', 'Bent_Over_Barbell_Row', 'T-Bar_Row_with_Handle'],
        },
        {
          role: 'core_bracing',
          label: 'Core / Bracing',
          patterns: ['core_anti_extension'],
          liftPatterns: [],
          main: false,
          optional: true,
          preferredIds: ['Plank', 'Dead_Bug'],
        },
      ],
    },
    {
      title: 'Deadlift Strength',
      dayRole: 'Hinge emphasis + overhead press',
      blocks: [
        {
          role: 'main_lower_lift',
          label: 'Main Lower Lift',
          patterns: ['hinge_pattern'],
          liftPatterns: ['deadlift'],
          main: true,
          progressionMethod: mainProgression,
          preferredIds: ['Barbell_Deadlift', 'Romanian_Deadlift', 'Band_Good_Morning'],
        },
        {
          role: 'main_upper_lift',
          label: 'Main Upper Lift',
          patterns: ['vertical_push'],
          liftPatterns: ['press'],
          main: true,
          progressionMethod: mainProgression,
          preferredIds: ['Barbell_Shoulder_Press', 'Smith_Machine_Overhead_Shoulder_Press', 'Dumbbell_Shoulder_Press', 'Seated_Dumbbell_Press'],
        },
        {
          role: 'primary_pull',
          label: 'Primary Pull',
          patterns: ['vertical_pull', 'horizontal_pull'],
          liftPatterns: ['pullup', 'row'],
          main: false,
          preferredIds: ['Pullups', 'Wide-Grip_Lat_Pulldown', 'Close-Grip_Front_Lat_Pulldown', 'One-Arm_Dumbbell_Row', 'Band_Pull_Apart'],
        },
        {
          role: 'assistance',
          label: 'Limited Assistance',
          patterns: ['lunge_pattern', 'core_anti_rotation', 'core_anti_extension'],
          liftPatterns: [],
          main: false,
          optional: true,
          preferredIds: ['Dumbbell_Lunges', 'Side_Bridge', 'Dead_Bug'],
        },
      ],
    },
    {
      title: 'Bench Strength',
      dayRole: 'Squat variation + bench variation',
      blocks: [
        {
          role: 'main_lower_lift',
          label: 'Main Lower Lift',
          patterns: ['squat_pattern'],
          liftPatterns: ['squat'],
          main: true,
          progressionMethod: mainProgression,
          preferredIds: ['Front_Barbell_Squat', 'Leg_Press', 'Barbell_Squat', 'Bodyweight_Squat'],
        },
        {
          role: 'main_upper_lift',
          label: 'Main Upper Lift',
          patterns: ['horizontal_push'],
          liftPatterns: ['bench'],
          main: true,
          progressionMethod: mainProgression,
          preferredIds: ['Barbell_Bench_Press_-_Medium_Grip', 'Dumbbell_Bench_Press', 'Close-Grip_Barbell_Bench_Press', 'Smith_Machine_Bench_Press', 'Pushups'],
        },
        {
          role: 'primary_pull',
          label: 'Primary Pull',
          patterns: ['horizontal_pull', 'vertical_pull'],
          liftPatterns: ['row', 'pullup'],
          main: false,
          preferredIds: ['Seated_Cable_Rows', 'One-Arm_Dumbbell_Row', 'Wide-Grip_Lat_Pulldown', 'Close-Grip_Front_Lat_Pulldown', 'Band_Pull_Apart'],
        },
        {
          role: 'assistance',
          label: 'Limited Assistance',
          patterns: ['knee_flexion', 'elbow_extension', 'core_anti_extension'],
          liftPatterns: [],
          main: false,
          optional: true,
          preferredIds: ['Lying_Leg_Curls', 'Triceps_Pushdown', 'Dead_Bug'],
        },
      ],
    },
  ];
}

function strengthSimilarityGroup(meta: ExerciseProgrammingMeta): string {
  if (meta.pattern === 'horizontal_push') return `${meta.angleVariant ?? 'flat'}_horizontal_press`;
  if (meta.pattern === 'vertical_push') return 'vertical_press';
  if (meta.pattern === 'horizontal_pull') return 'horizontal_row';
  if (meta.pattern === 'vertical_pull') return 'vertical_pull';
  if (meta.pattern === 'squat_pattern') return 'squat_pattern';
  if (meta.pattern === 'hinge_pattern') return 'hip_hinge';
  if (meta.pattern === 'lunge_pattern') return 'single_leg_lower';
  if (meta.pattern === 'knee_flexion') return 'hamstring_knee_flexion';
  if (meta.pattern === 'elbow_flexion') return 'elbow_flexion';
  if (meta.pattern === 'elbow_extension') return 'elbow_extension';
  if (meta.pattern.startsWith('core_')) return 'core_bracing';
  return meta.pattern;
}

function fatigueScore(meta: ExerciseProgrammingMeta): number {
  if (meta.stimulusToFatigue === 'high') return 3;
  if (meta.stimulusToFatigue === 'moderate') return 2;
  return 1;
}

function strengthSuitabilityScore(
  meta: ExerciseProgrammingMeta,
  block: StrengthBlockSpec,
  profile: NormalizedTrainingProfile,
): number {
  let score = 0;
  if (block.main && meta.strengthRoles.includes('main_lift')) score += 40;
  if (block.main && meta.strengthRoles.includes('primary_variation')) score += 28;
  if (!block.main && meta.strengthRoles.includes('secondary_strength_lift')) score += 28;
  if (!block.main && meta.strengthRoles.includes('structural_balance')) score += 20;
  if (block.role === 'core_bracing' && meta.strengthRoles.includes('core_bracing')) score += 32;
  if (meta.category === 'compound') score += block.main ? 18 : 10;
  if (meta.category === 'accessory') score += block.main ? 4 : 12;
  if (block.liftPatterns.some((pattern) => meta.supportedLiftPatterns.includes(pattern))) score += 18;
  const preferredIndex = block.preferredIds?.indexOf(meta.exerciseId) ?? -1;
  if (preferredIndex >= 0) score += Math.max(4, 22 - preferredIndex * 4);
  const bestSpecificity = block.liftPatterns
    .map((pattern) => meta.strengthSpecificityTiers?.[pattern])
    .filter((tier): tier is NonNullable<typeof tier> => !!tier)[0];
  if (bestSpecificity === 'S') score += 18;
  if (bestSpecificity === 'A') score += 12;
  if (bestSpecificity === 'B') score += 7;
  if (profile.preferredExerciseIds.includes(meta.exerciseId)) score += 8;
  if (isPreferredForLimitation(meta, profile.limitations)) score += 10;
  if (profile.experience === 'beginner' || profile.experience === 'returning') {
    if (meta.technicalDemand === 'high') score -= 8;
    if (meta.stabilityDemand === 'high' && !meta.strengthRoles.includes('main_lift')) score -= 4;
  }
  if (profile.recoveryQuality === 'poor' && meta.stimulusToFatigue === 'high') score -= 6;
  return Math.max(0, score);
}

function hasStrengthEquipment(available: AssemblyEngineInput['availableEquipment'], equipment: AIProgramEquipmentKey): boolean {
  if (equipment === 'dumbbells') {
    return available.includes('dumbbells') || available.includes('adjustable_dumbbells');
  }
  return available.includes(equipment);
}

function isStrictStrengthEquipmentCompatible(meta: ExerciseProgrammingMeta, available: AssemblyEngineInput['availableEquipment']): boolean {
  if (meta.equipment.includes('bodyweight_only')) return true;

  const requiresBench = meta.equipment.includes('bench');
  const hasBench = !requiresBench || hasStrengthEquipment(available, 'bench');
  if (!hasBench) return false;

  if (meta.equipment.includes('smith_machine') || meta.exerciseId.includes('Smith_Machine')) {
    return hasStrengthEquipment(available, 'smith_machine');
  }
  if (meta.exerciseId.includes('Barbell')) {
    return hasStrengthEquipment(available, 'barbells');
  }
  if (meta.exerciseId.includes('Dumbbell')) {
    return hasStrengthEquipment(available, 'dumbbells');
  }
  if (meta.equipment.includes('leg_press')) {
    return hasStrengthEquipment(available, 'leg_press') || hasStrengthEquipment(available, 'machines');
  }
  if (meta.equipment.includes('barbells') && meta.equipment.includes('dumbbells')) {
    return hasStrengthEquipment(available, 'barbells') || hasStrengthEquipment(available, 'dumbbells');
  }

  return isCompatibleWithEquipment(meta, available);
}

function strengthBucketForPattern(pattern: MovementPattern): PriorityMuscleBucket {
  return STRENGTH_PATTERN_BUCKETS[pattern] ?? 'core';
}

function strengthExerciseRejectionReason(
  meta: ExerciseProgrammingMeta,
  block: StrengthBlockSpec,
  input: AssemblyEngineInput,
  usedIds: Set<string>,
  usedSimilarityGroups: Set<string>,
): string | null {
  if (DECLINE_PRESS_IDS.has(meta.exerciseId)) return 'decline press strength ana omurgasında kullanılmaz';
  if (input.avoidedExerciseIds?.includes(meta.exerciseId)) return 'kullanıcı bu hareketi istemiyor';
  if (usedIds.has(meta.exerciseId)) return 'bu seans içinde zaten seçildi';
  if (!isStrictStrengthEquipmentCompatible(meta, input.availableEquipment)) return 'ekipman uyumsuz';
  if (!isSafeForLimitations(meta, input.limitations)) return 'bildirilen limitasyonla uyumsuz';
  if (!block.patterns.includes(meta.pattern)) return 'blok hareket paterniyle eşleşmiyor';
  if (block.main && meta.category === 'isolation') return 'ana lift slotunda izolasyon kullanılmaz';
  if (block.main && meta.defaultRepRange.max <= 1) return 'ana lift için progresif strength yüklemesine uygun değil';
  if (block.main && meta.pattern === 'horizontal_push' && meta.angleVariant === 'decline') return 'bench strength için decline ana lift değildir';
  if (usedSimilarityGroups.has(strengthSimilarityGroup(meta)) && block.role !== 'core_bracing') return 'aynı seans içinde benzer uyaran zaten var';
  return null;
}

function strengthCandidatesForBlock(
  block: StrengthBlockSpec,
  input: AssemblyEngineInput,
  profile: NormalizedTrainingProfile,
  usedIds: Set<string>,
  usedSimilarityGroups: Set<string>,
  seed: string,
): { candidates: ExerciseProgrammingMeta[]; rejected: { exerciseId: string; reason: string }[] } {
  const fallbackIds = STRENGTH_BLOCK_FALLBACK_IDS[block.role] ?? [];
  const preferredIdSet = new Set([...(block.preferredIds ?? []), ...fallbackIds]);
  const preferredMetas = [...preferredIdSet]
    .map(metaById)
    .filter((meta): meta is ExerciseProgrammingMeta => !!meta);
  const patternMetas = EXERCISE_PROGRAMMING_META.filter((meta) => block.patterns.includes(meta.pattern));
  const pool = [...preferredMetas, ...patternMetas].filter((meta, index, source) => (
    source.findIndex((item) => item.exerciseId === meta.exerciseId) === index
  ));

  const rejected: { exerciseId: string; reason: string }[] = [];
  const candidates = pool.filter((meta) => {
    const reason = strengthExerciseRejectionReason(meta, block, input, usedIds, usedSimilarityGroups);
    if (reason) {
      rejected.push({ exerciseId: meta.exerciseId, reason });
      return false;
    }
    return true;
  });

  const rotated = rotateAllCandidates(candidates, seed);
  return {
    candidates: rotated.sort((a, b) => (
      strengthSuitabilityScore(b, block, profile) - strengthSuitabilityScore(a, block, profile)
    )),
    rejected: rejected.slice(0, 8),
  };
}

function strengthPrescriptionForBlock(
  meta: ExerciseProgrammingMeta,
  block: StrengthBlockSpec,
  profile: NormalizedTrainingProfile,
): Pick<AssembledExercise, 'sets' | 'reps' | 'repLabel' | 'restSeconds' | 'rir'> {
  const conservative = profile.recoveryQuality === 'poor' || profile.sessionDurationMin <= 45;
  if (block.main) {
    if (meta.pattern === 'hinge_pattern') {
      if (meta.exerciseId === 'Barbell_Deadlift') {
        return { sets: conservative ? 2 : 3, reps: 3, repLabel: '3 tekrar', restSeconds: 180, rir: 2 };
      }
      return { sets: conservative ? 2 : 3, reps: 5, repLabel: '5-6 tekrar', restSeconds: 150, rir: 2 };
    }
    if (block.progressionMethod === 'top_set_backoff') {
      return { sets: 4, reps: 5, repLabel: 'Top set 3-5 + 2 back-off', restSeconds: 180, rir: 2 };
    }
    return { sets: conservative ? 3 : 4, reps: 5, repLabel: '3-6 tekrar', restSeconds: 150, rir: 2 };
  }
  if (block.role === 'primary_pull' || block.role === 'secondary_strength_movement') {
    return { sets: conservative ? 2 : 3, reps: 8, repLabel: '6-10 tekrar', restSeconds: 120, rir: 2 };
  }
  if (block.role === 'core_bracing') {
    return { sets: 2, reps: meta.defaultRepRange.min === 1 ? 1 : 10, repLabel: meta.defaultRepRange.min === 1 ? '30-45 sn' : '8-12 tekrar', restSeconds: 60, rir: 1 };
  }
  return { sets: 2, reps: 12, repLabel: '10-15 tekrar', restSeconds: 75, rir: 2 };
}

function strengthWhy(block: StrengthBlockSpec, dayRole: string, meta: ExerciseProgrammingMeta): string {
  if (block.role === 'main_lower_lift') {
    return `${dayRole}: ana alt gövde lift'i; kuvvet ilerlemesi için düşük-orta tekrar ve uzun dinlenme.`;
  }
  if (block.role === 'main_upper_lift') {
    return `${dayRole}: ana üst gövde lift'i; ana kaldırış pratiği ve kontrollü progresyon sağlar.`;
  }
  if (block.role === 'primary_pull') {
    return `${dayRole}: press/squat omurgasını dengeleyen ana çekiş; üst sırt ve lat desteği sağlar.`;
  }
  if (block.role === 'core_bracing') {
    return `${dayRole}: ana liftler için bracing ve gövde kontrolünü destekler.`;
  }
  return `${dayRole}: ana liftleri destekleyen sınırlı aksesuar; yorgunluğu büyütmeden zayıf halkayı tamamlar.`;
}

function addStrengthExerciseFromBlock(
  day: ThreeDayStrengthBlueprintDay,
  block: StrengthBlockSpec,
  dayIndex: number,
  input: AssemblyEngineInput,
  profile: NormalizedTrainingProfile,
  usedIds: Set<string>,
  usedSimilarityGroups: Set<string>,
): { exercise: AssembledExercise | null; rejected: { exerciseId: string; reason: string }[] } {
  const seed = `${input.selectionSeed ?? 'default'}:${dayIndex}:${day.dayRole}:${block.role}:${block.label}`;
  const { candidates, rejected } = strengthCandidatesForBlock(block, input, profile, usedIds, usedSimilarityGroups, seed);
  const meta = candidates[0];
  if (!meta) return { exercise: null, rejected };

  const similarityGroup = strengthSimilarityGroup(meta);
  const prescription = strengthPrescriptionForBlock(meta, block, profile);
  usedIds.add(meta.exerciseId);
  usedSimilarityGroups.add(similarityGroup);

  return {
    exercise: {
      exerciseId: meta.exerciseId,
      ...prescription,
      alternatives: getReplacementsFor(meta.exerciseId, input.availableEquipment, input.limitations).map((item) => item.exerciseId),
      why: strengthWhy(block, day.dayRole, meta),
      category: meta.category,
      pattern: meta.pattern,
      primaryBucket: strengthBucketForPattern(meta.pattern),
      strengthSlot: block.role,
      progressionMethod: block.progressionMethod,
      debug: {
        slot: block.role,
        dayRole: day.dayRole,
        rejectedExerciseIds: rejected,
        similarityGroup,
        fatigueScore: fatigueScore(meta),
        strengthSuitability: strengthSuitabilityScore(meta, block, profile),
        progressionMethod: block.progressionMethod,
      },
    },
    rejected,
  };
}

function estimateStrengthDuration(exercises: AssembledExercise[]): number {
  return Math.round(exercises.reduce((sum, item) => {
    if (item.restSeconds >= 150) return sum + item.sets * 4.5;
    if (item.restSeconds >= 120) return sum + item.sets * 3.5;
    if (item.restSeconds >= 75) return sum + item.sets * 2.75;
    return sum + item.sets * 2.25;
  }, 0));
}

function buildStrengthSessionBlocks(
  day: ThreeDayStrengthBlueprintDay,
  dayIndex: number,
  input: AssemblyEngineInput,
  profile: NormalizedTrainingProfile,
): AssembledDay {
  const usedIds = new Set<string>();
  const usedSimilarityGroups = new Set<string>();
  const exercises: AssembledExercise[] = [];
  const bucketsCovered: PriorityMuscleBucket[] = [];
  const notes: string[] = [
    `${day.dayRole}: main lower + main upper + pull blokları önce, aksesuarlar sınırlı kuruldu.`,
  ];

  for (const block of day.blocks) {
    const result = addStrengthExerciseFromBlock(day, block, dayIndex, input, profile, usedIds, usedSimilarityGroups);
    if (!result.exercise) {
      if (!block.optional) {
        notes.push(`${block.label} için ekipman/limitasyon uyumlu hareket bulunamadı.`);
      }
      continue;
    }
    exercises.push(result.exercise);
    if (!bucketsCovered.includes(result.exercise.primaryBucket)) {
      bucketsCovered.push(result.exercise.primaryBucket);
    }
  }

  const maxExercises = profile.sessionDurationMin <= 45 ? 5 : 6;
  while (exercises.length > maxExercises) {
    const optionalIndex = exercises.findLastIndex((exercise) => (
      exercise.strengthSlot === 'assistance' || exercise.strengthSlot === 'core_bracing'
    ));
    const removeIndex = optionalIndex >= 0 ? optionalIndex : exercises.length - 1;
    const removed = exercises.splice(removeIndex, 1)[0];
    if (!removed) break;
    notes.push(`${removed.exerciseId} süre hedefi için çıkarıldı.`);
  }

  const totalSets = exercises.reduce((sum, item) => sum + item.sets, 0);
  return {
    dayIndex,
    title: day.title,
    exercises,
    totalSets,
    estimatedDurationMin: estimateStrengthDuration(exercises),
    bucketsCovered,
    notes,
  };
}

function buildStrengthAuditCategory(
  key: ProgramAuditCategoryKey,
  label: string,
  maxScore: number,
  deduction: number,
): ProgramAuditCategoryScore {
  return { key, label, maxScore, score: Math.max(0, maxScore - deduction) };
}

function countStrengthChestExercises(day: AssembledDay): number {
  return day.exercises.filter((exercise) => {
    const meta = metaById(exercise.exerciseId);
    return exercise.pattern === 'horizontal_push' || !!meta?.primaryMuscles.some((muscle) => muscle.includes('chest'));
  }).length;
}

function auditStrengthProgram(
  days: AssembledDay[],
  input: AssemblyEngineInput,
  profile: NormalizedTrainingProfile,
): ProgramAuditResult {
  const warnings: string[] = [];
  const requiredFixes: string[] = [];
  let sequencingIssues = 0;
  let selectionIssues = 0;
  let redundancyIssues = 0;
  let fatigueIssues = 0;
  let userFitIssues = 0;
  const weeklyPatterns = new Set<MovementPattern>();

  days.forEach((day) => {
    const ids = new Set<string>();
    const similarityCounts = new Map<string, number>();
    const mainExercises = day.exercises.filter((exercise) => (
      exercise.strengthSlot && THREE_DAY_STRENGTH_MAIN_ROLES.has(exercise.strengthSlot)
    ));
    const firstNonMainIndex = day.exercises.findIndex((exercise) => (
      !exercise.strengthSlot || !THREE_DAY_STRENGTH_MAIN_ROLES.has(exercise.strengthSlot)
    ));

    if (mainExercises.length === 0) {
      requiredFixes.push(`${day.title}: ana lift yok.`);
      selectionIssues += 4;
    }
    mainExercises.forEach((exercise) => {
      if (!exercise.progressionMethod) {
        requiredFixes.push(`${day.title}: ${exercise.exerciseId} için progression modeli yok.`);
        selectionIssues += 3;
      }
    });

    day.exercises.forEach((exercise, index) => {
      weeklyPatterns.add(exercise.pattern);
      const meta = metaById(exercise.exerciseId);
      if (!meta) {
        requiredFixes.push(`${day.title}: ${exercise.exerciseId} metadata bulunamadı.`);
        selectionIssues += 4;
        return;
      }
      if (ids.has(exercise.exerciseId)) {
        requiredFixes.push(`${day.title}: ${exercise.exerciseId} aynı seansta tekrar ediyor.`);
        redundancyIssues += 4;
      }
      ids.add(exercise.exerciseId);
      if (!isStrictStrengthEquipmentCompatible(meta, input.availableEquipment)) {
        requiredFixes.push(`${day.title}: ${exercise.exerciseId} ekipmanla uyumsuz.`);
        userFitIssues += 4;
      }
      if (!isSafeForLimitations(meta, input.limitations)) {
        requiredFixes.push(`${day.title}: ${exercise.exerciseId} bildirilen limitasyonla uyumsuz.`);
        userFitIssues += 5;
      }
      if (DECLINE_PRESS_IDS.has(exercise.exerciseId)) {
        requiredFixes.push(`${day.title}: decline press strength ana omurgasında olmamalı.`);
        selectionIssues += 4;
      }
      const similarityGroup = exercise.debug?.similarityGroup ?? strengthSimilarityGroup(meta);
      similarityCounts.set(similarityGroup, (similarityCounts.get(similarityGroup) ?? 0) + 1);
      if (exercise.category === 'isolation' && firstNonMainIndex >= 0 && index < firstNonMainIndex) {
        requiredFixes.push(`${day.title}: izolasyon ana liftlerden önce gelmiş.`);
        sequencingIssues += 4;
      }
    });

    similarityCounts.forEach((count, group) => {
      if (count > 1 && group !== 'core_bracing') {
        requiredFixes.push(`${day.title}: ${group} benzer uyaranı aynı seansta fazla tekrar ediyor.`);
        redundancyIssues += 3;
      }
    });

    if (countStrengthChestExercises(day) >= 3) {
      requiredFixes.push(`${day.title}: strength seansında 3 chest hareketi bodybuilding davranışı oluşturuyor.`);
      redundancyIssues += 5;
    }

    const heavyLowerCount = day.exercises.filter((exercise) => {
      const meta = metaById(exercise.exerciseId);
      return !!meta
        && (exercise.pattern === 'squat_pattern' || exercise.pattern === 'hinge_pattern')
        && meta.stimulusToFatigue === 'high';
    }).length;
    if (heavyLowerCount > 2) {
      requiredFixes.push(`${day.title}: ağır squat/deadlift/hinge yorgunluğu aynı güne yığılmış.`);
      fatigueIssues += 5;
    }

    const maxExercises = profile.sessionDurationMin <= 45 ? 5 : 6;
    if (day.exercises.length > maxExercises) {
      requiredFixes.push(`${day.title}: ${day.exercises.length} hareket süre hedefi için fazla.`);
      fatigueIssues += 3;
    }
    if (day.estimatedDurationMin > profile.sessionDurationMin + 10) {
      requiredFixes.push(`${day.title}: tahmini süre hedefi aşıyor (${day.estimatedDurationMin} dk).`);
      fatigueIssues += 4;
    }
  });

  const hasWeeklySquat = weeklyPatterns.has('squat_pattern');
  const hasWeeklyHinge = weeklyPatterns.has('hinge_pattern');
  const hasWeeklyPush = weeklyPatterns.has('horizontal_push') || weeklyPatterns.has('vertical_push');
  const hasWeeklyPull = weeklyPatterns.has('horizontal_pull') || weeklyPatterns.has('vertical_pull') || weeklyPatterns.has('scapular_retraction');
  if (!hasWeeklySquat) {
    requiredFixes.push('Haftalık squat/leg press paterni eksik.');
    selectionIssues += 5;
  }
  if (!hasWeeklyHinge) {
    requiredFixes.push('Haftalık hinge/deadlift/RDL paterni eksik.');
    selectionIssues += 5;
  }
  if (!hasWeeklyPush) {
    requiredFixes.push('Haftalık press paterni eksik.');
    selectionIssues += 5;
  }
  if (!hasWeeklyPull) {
    requiredFixes.push('Haftalık çekiş paterni eksik.');
    selectionIssues += 5;
  }

  if (requiredFixes.length > 0) {
    warnings.push(...requiredFixes);
  }

  const categories: ProgramAuditCategoryScore[] = [
    buildStrengthAuditCategory('exerciseSelection', 'Strength rol netliği', 20, selectionIssues),
    buildStrengthAuditCategory('sequencing', 'Ana lift sırası', 15, sequencingIssues),
    buildStrengthAuditCategory('redundancy', 'Bodybuilding taşması', 15, redundancyIssues),
    buildStrengthAuditCategory('fatigue', 'Yorgunluk yönetimi', 15, fatigueIssues),
    buildStrengthAuditCategory('frequency', 'Haftalık patern kapsama', 15, selectionIssues > 0 ? Math.min(8, selectionIssues) : 0),
    buildStrengthAuditCategory('userFit', 'Ekipman / limitasyon uyumu', 10, userFitIssues),
    buildStrengthAuditCategory('weeklyVolume', 'Süre ve hacim', 10, fatigueIssues > 0 ? Math.min(6, fatigueIssues) : 0),
  ];
  const score = categories.reduce((sum, category) => sum + category.score, 0);
  return {
    score,
    passed: requiredFixes.length === 0 && score >= 90,
    categories,
    warnings: [...new Set(warnings)],
    requiredFixes: [...new Set(requiredFixes)],
  };
}

function repairStrengthProgram(
  days: AssembledDay[],
  profile: NormalizedTrainingProfile,
): { days: AssembledDay[]; repairs: string[] } {
  const repairs: string[] = [];
  const repaired = days.map((day) => {
    const exercises = [...day.exercises];
    const maxExercises = profile.sessionDurationMin <= 45 ? 5 : 6;

    for (let index = exercises.length - 1; index >= 0; index -= 1) {
      const exercise = exercises[index]!;
      const meta = metaById(exercise.exerciseId);
      if (!meta) continue;
      const group = exercise.debug?.similarityGroup ?? strengthSimilarityGroup(meta);
      const firstIndex = exercises.findIndex((item) => {
        const itemMeta = metaById(item.exerciseId);
        return itemMeta && (item.debug?.similarityGroup ?? strengthSimilarityGroup(itemMeta)) === group;
      });
      if (firstIndex !== index && group !== 'core_bracing' && exercise.strengthSlot !== 'main_lower_lift' && exercise.strengthSlot !== 'main_upper_lift') {
        exercises.splice(index, 1);
        repairs.push(`${day.title}: ${exercise.exerciseId} benzer uyaran tekrarı nedeniyle çıkarıldı.`);
      }
    }

    while (countStrengthChestExercises({ ...day, exercises }) >= 3) {
      const removeIndex = exercises.findLastIndex((exercise) => (
        exercise.pattern === 'horizontal_push'
        && exercise.strengthSlot !== 'main_upper_lift'
      ));
      if (removeIndex < 0) break;
      const removed = exercises.splice(removeIndex, 1)[0];
      if (removed) repairs.push(`${day.title}: ${removed.exerciseId} üçüncü chest hareketini önlemek için çıkarıldı.`);
    }

    while (exercises.length > maxExercises) {
      const removeIndex = exercises.findLastIndex((exercise) => (
        exercise.strengthSlot === 'assistance' || exercise.strengthSlot === 'core_bracing'
      ));
      const index = removeIndex >= 0 ? removeIndex : exercises.length - 1;
      const removed = exercises.splice(index, 1)[0];
      if (removed) repairs.push(`${day.title}: ${removed.exerciseId} süre/hareket limiti için çıkarıldı.`);
    }

    let duration = estimateStrengthDuration(exercises);
    while (duration > profile.sessionDurationMin + 10 && exercises.length > 3) {
      const removeIndex = exercises.findLastIndex((exercise) => (
        exercise.strengthSlot === 'assistance' || exercise.strengthSlot === 'core_bracing'
      ));
      if (removeIndex < 0) break;
      const removed = exercises.splice(removeIndex, 1)[0];
      if (removed) repairs.push(`${day.title}: ${removed.exerciseId} süre hedefi için çıkarıldı.`);
      duration = estimateStrengthDuration(exercises);
    }

    const totalSets = exercises.reduce((sum, item) => sum + item.sets, 0);
    return {
      ...day,
      exercises,
      totalSets,
      estimatedDurationMin: estimateStrengthDuration(exercises),
      bucketsCovered: [...new Set(exercises.map((exercise) => exercise.primaryBucket))],
      notes: repairs.length > 0 ? [...(day.notes ?? []), 'Strength audit sonrası küçük onarımlar uygulandı.'] : day.notes,
    };
  });

  return { days: repaired, repairs };
}

function assembleThreeDayFullBodyStrengthProgram(input: AssemblyEngineInput): SessionAssemblyPlan {
  const profile = normalizeTrainingProfile(input);
  const archetype = selectStrengthArchetype(profile);
  const blueprint = buildThreeDayFullBodyStrengthBlueprint(archetype);
  const days = blueprint.map((day, index) => buildStrengthSessionBlocks(day, index, input, profile));
  const initialAudit = auditStrengthProgram(days, input, profile);
  const repaired = initialAudit.passed ? { days, repairs: [] } : repairStrengthProgram(days, profile);
  const finalAudit = auditStrengthProgram(repaired.days, input, profile);
  const warnings = finalAudit.passed
    ? finalAudit.warnings
    : [...finalAudit.warnings, 'Strength audit hâlâ fail verdi; kullanıcıya gösterilmeden önce profil/ekipman girişi gözden geçirilmeli.'];

  return {
    split: input.split,
    programArchetype: input.programArchetype,
    days: repaired.days,
    selectionNotes: [
      '3 günlük full body strength özel motoru kullanıldı.',
      `${archetype.replaceAll('_', ' ')} arketipi seçildi.`,
      'Hafta squat, hinge, press, pull ve bracing paternleriyle kuruldu; her seansta 1-2 ana lift sınırı korundu.',
      'Ana liftlerde progression metodu açık tanımlandı; aksesuarlar sınırlı tutuldu.',
    ],
    warnings: [...new Set(warnings)],
    audit: finalAudit,
    debug: {
      strength: {
        archetype,
        weeklyBlueprint: blueprint.map((day) => day.title),
        dayRoles: blueprint.map((day) => day.dayRole),
        fatigueDistribution: repaired.days.map((day) => ({
          dayIndex: day.dayIndex,
          title: day.title,
          totalSets: day.totalSets,
          highFatigueCount: day.exercises.filter((exercise) => {
            const meta = metaById(exercise.exerciseId);
            return meta?.stimulusToFatigue === 'high';
          }).length,
        })),
        audit: finalAudit,
        repairs: repaired.repairs,
      },
    },
  };
}

function getArchetypeFocuses(archetype: AIProgramArchetypeKey, days: number): DayFocus[] | null {
  const range = (count: number) => Array.from({ length: count }, (_, i) => i);
  switch (archetype) {
    case 'full_body_strength_skill':
      return range(days).map((i) => ({
        title: `Full Body Strength ${String.fromCharCode(65 + (i % 4))}`,
        buckets: i % 2 === 0 ? ['chest', 'upper_back', 'quads', 'core'] : ['shoulders', 'lats', 'hamstrings', 'glutes', 'core'],
      }));
    case 'full_body_hypertrophy':
      return range(days).map((i) => ({
        title: `Full Body Hipertrofi ${String.fromCharCode(65 + (i % 4))}`,
        buckets: i % 3 === 0 ? FULL : i % 3 === 1 ? ['chest', 'shoulders', 'quads', 'glutes', 'core'] : ['lats', 'upper_back', 'hamstrings', 'arms', 'core'],
      }));
    case 'upper_lower_strength':
      return range(days).map((i) => ({
        title: i % 2 === 0 ? 'Upper Strength' : 'Lower Strength',
        buckets: i % 2 === 0 ? ['chest', 'upper_back', 'shoulders', 'lats'] : ['quads', 'hamstrings', 'glutes', 'core'],
      }));
    case 'upper_lower_hypertrophy':
      return range(days).map((i) => ({
        title: i % 2 === 0 ? 'Upper Hipertrofi' : 'Lower Hipertrofi',
        buckets: i % 2 === 0 ? TORSO : ['quads', 'glutes', 'hamstrings', 'calves', 'core'],
      }));
    case 'ppl_hypertrophy': {
      const rotation: DayFocus[] = [
        { title: 'Push Hipertrofi', buckets: PUSH },
        { title: 'Pull Hipertrofi', buckets: PULL },
        { title: 'Legs Hipertrofi', buckets: LEGS },
        { title: 'Upper Weak Point', buckets: ['shoulders', 'upper_back', 'chest', 'arms'] },
        { title: 'Lower / Posterior', buckets: ['glutes', 'hamstrings', 'quads', 'calves', 'core'] },
        { title: 'PPL Pump', buckets: ['arms', 'shoulders', 'lats', 'core'] },
      ];
      return range(days).map((i) => rotation[i % rotation.length] ?? rotation[0]!);
    }
    case 'hybrid_athletic': {
      const rotation: DayFocus[] = [
        { title: 'Full Body Strength', buckets: ['chest', 'upper_back', 'quads', 'core'] },
        { title: 'Upper Hipertrofi', buckets: TORSO },
        { title: 'Lower Athletic', buckets: ['quads', 'hamstrings', 'glutes', 'calves', 'core'] },
        { title: 'Pump / Accessory', buckets: ['shoulders', 'arms', 'lats', 'glutes', 'core'] },
        { title: 'Posterior Engine', buckets: POSTERIOR },
        { title: 'Full Body Flow', buckets: FULL },
      ];
      return range(days).map((i) => rotation[i % rotation.length] ?? rotation[0]!);
    }
    case 'body_part_specialization': {
      const rotation: DayFocus[] = [
        { title: 'Chest / Shoulder', buckets: ['chest', 'shoulders', 'arms'] },
        { title: 'Back', buckets: ['lats', 'upper_back', 'arms'] },
        { title: 'Legs', buckets: ['quads', 'hamstrings', 'glutes', 'calves'] },
        { title: 'Arms / Delts', buckets: ['arms', 'shoulders', 'upper_back'] },
        { title: 'Glute / Posterior', buckets: ['glutes', 'hamstrings', 'calves', 'core'] },
        { title: 'Weak Point Pump', buckets: ['shoulders', 'lats', 'arms', 'core'] },
      ];
      return range(days).map((i) => rotation[i % rotation.length] ?? rotation[0]!);
    }
    case 'minimalist_home':
      return range(days).map((i) => ({
        title: `Minimalist Full Body ${String.fromCharCode(65 + (i % 4))}`,
        buckets: i % 2 === 0 ? ['chest', 'shoulders', 'quads', 'glutes', 'core'] : ['lats', 'upper_back', 'hamstrings', 'arms', 'core'],
      }));
    case 'posterior_chain_focus':
      return range(days).map((i) => ({
        title: i % 2 === 0 ? 'Posterior Chain' : 'Anterior Balance',
        buckets: i % 2 === 0 ? POSTERIOR : ANTERIOR,
      }));
    case 'glute_core_focus':
      return range(days).map((i) => ({
        title: i % 2 === 0 ? 'Glute / Core' : 'Upper Balance',
        buckets: i % 2 === 0 ? ['glutes', 'hamstrings', 'quads', 'core', 'calves'] : ['upper_back', 'shoulders', 'lats', 'chest', 'core'],
      }));
  }
}

function getStrengthTemplates(days: number): StrengthDayTemplate[] {
  if (days <= 3) {
    const templates: StrengthDayTemplate[] = [
      {
        title: 'Squat Strength',
        mainSlots: ['squat_or_leg_press', 'bench_press'],
        accessorySlots: ['deadlift_or_rdl', 'vertical_pull', 'lateral_raise', 'core'],
      },
      {
        title: 'Deadlift Strength',
        mainSlots: ['deadlift_or_rdl', 'overhead_press'],
        accessorySlots: ['row', 'single_leg', 'biceps', 'triceps'],
      },
      {
        title: 'Bench Strength',
        mainSlots: ['bench_press', 'squat_or_leg_press'],
        accessorySlots: ['vertical_pull', 'bench_accessory', 'hamstring_accessory', 'rear_delt'],
      },
    ];
    return templates.slice(0, days);
  }
  if (days === 4) {
    const templates: StrengthDayTemplate[] = [
      { title: 'Upper Strength', mainSlots: ['bench_press', 'row'], accessorySlots: ['overhead_press', 'vertical_pull', 'triceps'] },
      { title: 'Lower Strength', mainSlots: ['squat_or_leg_press', 'deadlift_or_rdl'], accessorySlots: ['hamstring_accessory', 'core'] },
      { title: 'Bench Support', mainSlots: ['bench_press', 'overhead_press'], accessorySlots: ['bench_accessory', 'row', 'rear_delt'] },
      { title: 'Lower Posterior', mainSlots: ['deadlift_or_rdl'], accessorySlots: ['squat_or_leg_press', 'single_leg', 'core'] },
    ];
    return templates;
  }
  const rotation: StrengthDayTemplate[] = [
    { title: 'Squat Strength', mainSlots: ['squat_or_leg_press'], accessorySlots: ['bench_press', 'hamstring_accessory', 'vertical_pull', 'core'] },
    { title: 'Bench Strength', mainSlots: ['bench_press'], accessorySlots: ['row', 'bench_accessory', 'triceps', 'rear_delt'] },
    { title: 'Deadlift Strength', mainSlots: ['deadlift_or_rdl'], accessorySlots: ['overhead_press', 'row', 'single_leg', 'biceps'] },
    { title: 'Overhead / Upper Back', mainSlots: ['overhead_press', 'row'], accessorySlots: ['vertical_pull', 'lateral_raise', 'triceps'] },
    { title: 'Volume / Accessory', mainSlots: ['bench_press'], accessorySlots: ['squat_or_leg_press', 'vertical_pull', 'hamstring_accessory', 'rear_delt'] },
    { title: 'Technique Strength', mainSlots: ['squat_or_leg_press', 'bench_press'], accessorySlots: ['row', 'core'] },
  ];
  return rotation.slice(0, days);
}

function getDayFocuses(split: AIProgramSplitKey, days: number, archetype?: AIProgramArchetypeKey): DayFocus[] {
  const archetypeFocuses = archetype ? getArchetypeFocuses(archetype, days) : null;
  if (archetypeFocuses) return archetypeFocuses;
  const range = (count: number) => Array.from({ length: count }, (_, i) => i);
  switch (split) {
    case 'full_body':
      return range(days).map((i) => ({ title: `Tüm Vücut ${String.fromCharCode(65 + (i % 3))}`, buckets: FULL }));
    case 'minimalist_home':
      return range(days).map((i) => ({ title: `Minimal Akış ${String.fromCharCode(65 + (i % 3))}`, buckets: FULL }));
    case 'upper_lower':
      return range(days).map((i) => ({
        title: i % 2 === 0 ? 'Üst Vücut' : 'Alt Vücut',
        buckets: i % 2 === 0 ? UPPER : LOWER,
      }));
    case 'torso_limbs':
      return range(days).map((i) => ({
        title: i % 2 === 0 ? 'Üst Vücut' : 'Alt Vücut',
        buckets: i % 2 === 0 ? TORSO : LIMBS,
      }));
    case 'anterior_posterior':
      return range(days).map((i) => ({
        title: i % 2 === 0 ? 'Ön Zincir' : 'Arka Zincir',
        buckets: i % 2 === 0 ? ANTERIOR : POSTERIOR,
      }));
    case 'push_pull_legs': {
      const cycle: PriorityMuscleBucket[][] = [PUSH, PULL, LEGS];
      return range(days).map((i) => ({
        title: ['İtiş', 'Çekiş', 'Bacak'][i % 3] ?? 'Tüm Vücut',
        buckets: cycle[i % 3] ?? FULL,
      }));
    }
    case 'hybrid': {
      if (days <= 2) return range(days).map(() => ({ title: 'Tüm Vücut', buckets: FULL }));
      if (days === 3) {
        return [
          { title: 'Tüm Vücut', buckets: FULL },
          { title: 'Üst Vücut', buckets: UPPER },
          { title: 'Alt Vücut', buckets: LOWER },
        ];
      }
      return range(days).map((i) => ({
        title: i % 2 === 0 ? 'Üst Vücut' : 'Alt Vücut',
        buckets: i % 2 === 0 ? UPPER : LOWER,
      }));
    }
    case 'body_part_emphasis': {
      // 5-6 gün: öncelik üst, alt, çekiş, itiş, alt detay, kol detay
      const rotation: DayFocus[] = [
        { title: 'Öncelikli Üst', buckets: ['chest', 'shoulders', 'arms'] },
        { title: 'Alt Vücut', buckets: LOWER },
        { title: 'Çekiş', buckets: PULL },
        { title: 'İtiş', buckets: PUSH },
        { title: 'Alt Vücut Detay', buckets: ['glutes', 'hamstrings', 'calves', 'core'] },
        { title: 'Kol Detayı', buckets: ['arms', 'shoulders'] },
      ];
      return range(days).map((i) => rotation[i % rotation.length] ?? rotation[0]!);
    }
  }
}

function goalRepBias(goal: AIProgramGoal): 'low' | 'mid' | 'high' {
  switch (goal) {
    case 'strength':
      return 'low';
    case 'build_muscle':
    case 'recomposition':
      return 'mid';
    case 'lose_fat':
    case 'general_fitness':
    case 'return_to_training':
    case 'home_workout':
    case 'yoga':
    case 'pilates':
      return 'high';
    case 'athletic_performance':
      return 'low';
  }
}

function resolveReps(meta: ExerciseProgrammingMeta, goal: AIProgramGoal): number {
  const bias = goalRepBias(goal);
  const { min, max } = meta.defaultRepRange;
  if (min === max) return min;
  if (bias === 'low') return Math.max(min, Math.round(min + (max - min) * 0.25));
  if (bias === 'high') return Math.round(min + (max - min) * 0.75);
  return Math.round((min + max) / 2);
}

function resolveRir(meta: ExerciseProgrammingMeta, rirMin: number, rirMax: number): number {
  // compound daha muhafazakar (rirMax civarı), izolasyon daha agressive (rirMin civarı)
  if (meta.category === 'compound') return rirMax;
  if (meta.category === 'isolation') return rirMin;
  return Math.round((rirMin + rirMax) / 2);
}

function buildRepLabel(reps: number, meta: ExerciseProgrammingMeta): string {
  const range = meta.defaultRepRange;
  const spread = range.max - range.min;
  if (spread >= 6) return `${Math.max(range.min, reps - 2)}-${reps + 2} tekrar`;
  if (spread >= 3) return `${Math.max(range.min, reps - 1)}-${reps + 1} tekrar`;
  return `${reps} tekrar`;
}

const CATEGORY_ORDER: Record<ExerciseCategory, number> = { compound: 0, accessory: 1, isolation: 2 };

function diversityKey(meta: ExerciseProgrammingMeta): string {
  return `${meta.pattern}:${meta.angleVariant ?? ''}`;
}

function regionalDiversityKey(exercise: AssembledExercise): string {
  const meta = metaById(exercise.exerciseId);
  return `${exercise.primaryBucket}:${exercise.pattern}:${meta?.angleVariant ?? 'base'}:${exercise.category}`;
}

function regionalPriorityKey(exercise: AssembledExercise): string {
  const meta = metaById(exercise.exerciseId);
  return meta?.angleVariant ?? exercise.pattern ?? 'base';
}

function getPriorityTrainingStrategy(input: AssemblyEngineInput): PriorityTrainingStrategy {
  const priorityBuckets = input.volumeBlueprint.targets
    .filter((target) => target.isPriority)
    .map((target) => target.bucket);
  return {
    priorityBuckets,
    priorityOrder: new Map(priorityBuckets.map((bucket, index) => [bucket, index])),
  };
}

function getDayPriorityBuckets(day: AssembledDay, strategy: PriorityTrainingStrategy): PriorityMuscleBucket[] {
  return strategy.priorityBuckets.filter((bucket) => day.exercises.some((exercise) => exercise.primaryBucket === bucket));
}

function priorityBlockScore(exercise: AssembledExercise, strategy: PriorityTrainingStrategy): number {
  const bucketScore = strategy.priorityOrder.get(exercise.primaryBucket) ?? 99;
  const regionalOrder = REGIONAL_PRIORITY_ORDER[exercise.primaryBucket] ?? [];
  const regionalKey = regionalPriorityKey(exercise);
  const regionalScore = regionalOrder.includes(regionalKey)
    ? regionalOrder.indexOf(regionalKey)
    : regionalOrder.includes(exercise.pattern)
      ? regionalOrder.indexOf(exercise.pattern)
      : regionalOrder.length;
  return bucketScore * 1_000 + CATEGORY_ORDER[exercise.category] * 100 + regionalScore * 10 + sequenceScore(exercise);
}

function stableHash(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function rotateCandidates(candidates: ExerciseProgrammingMeta[], seed: string): ExerciseProgrammingMeta[] {
  if (candidates.length <= 1) return candidates;
  const pushups = candidates.find((candidate) => candidate.exerciseId === 'Pushups');
  const source = pushups
    ? candidates.filter((candidate) => candidate.exerciseId !== 'Pushups')
    : candidates;
  const categories: ExerciseCategory[] = ['compound', 'accessory', 'isolation'];
  const rotated = categories.flatMap((category) => {
    const group = source.filter((candidate) => candidate.category === category);
    if (group.length <= 1) return group;
    const [head, ...tail] = group;
    if (tail.length <= 1) return group;
    const offset = stableHash(`${seed}:${category}`) % tail.length;
    return [head!, ...tail.slice(offset), ...tail.slice(0, offset)];
  });
  return pushups ? [pushups, ...rotated] : rotated;
}

function rotateAllCandidates(candidates: ExerciseProgrammingMeta[], seed: string): ExerciseProgrammingMeta[] {
  if (candidates.length <= 1) return candidates;
  const offset = stableHash(seed) % candidates.length;
  return [...candidates.slice(offset), ...candidates.slice(0, offset)];
}

function metaById(exerciseId: string): ExerciseProgrammingMeta | undefined {
  return EXERCISE_PROGRAMMING_META.find((meta) => meta.exerciseId === exerciseId);
}

function isStrengthMainCompatible(meta: ExerciseProgrammingMeta, input: AssemblyEngineInput): boolean {
  if (DECLINE_PRESS_IDS.has(meta.exerciseId)) return false;
  return isStrictStrengthEquipmentCompatible(meta, input.availableEquipment) && isSafeForLimitations(meta, input.limitations);
}

function pickStrengthMeta(slot: StrengthSlot, input: AssemblyEngineInput, usedIds: Set<string>): ExerciseProgrammingMeta | null {
  const candidates = STRENGTH_SLOT_IDS[slot]
    .map(metaById)
    .filter((meta): meta is ExerciseProgrammingMeta => !!meta)
    .filter((meta) => !usedIds.has(meta.exerciseId))
    .filter((meta) => isStrengthMainCompatible(meta, input));
  return candidates[0] ?? null;
}

function strengthBucketForSlot(slot: StrengthSlot): PriorityMuscleBucket {
  if (slot === 'squat_or_leg_press') return 'quads';
  if (slot === 'deadlift_or_rdl' || slot === 'hamstring_accessory' || slot === 'single_leg') return 'hamstrings';
  if (slot === 'bench_press' || slot === 'bench_accessory') return 'chest';
  if (slot === 'overhead_press' || slot === 'lateral_raise' || slot === 'rear_delt') return 'shoulders';
  if (slot === 'row') return 'upper_back';
  if (slot === 'vertical_pull') return 'lats';
  if (slot === 'triceps' || slot === 'biceps') return 'arms';
  return 'core';
}

function strengthPrescription(meta: ExerciseProgrammingMeta, slot: StrengthSlot, main: boolean): Pick<AssembledExercise, 'sets' | 'reps' | 'repLabel' | 'restSeconds' | 'rir'> {
  if (main) {
    if (slot === 'deadlift_or_rdl' && meta.exerciseId === 'Barbell_Deadlift') {
      return { sets: 3, reps: 3, repLabel: '3 tekrar', restSeconds: 180, rir: 2 };
    }
    return { sets: slot === 'bench_press' ? 4 : 3, reps: slot === 'bench_press' ? 5 : 5, repLabel: '3-6 tekrar', restSeconds: Math.max(meta.defaultRestSeconds, 150), rir: 2 };
  }
  if (meta.category === 'isolation') {
    return { sets: 3, reps: 12, repLabel: '10-15 tekrar', restSeconds: Math.max(45, meta.defaultRestSeconds), rir: 2 };
  }
  return { sets: 3, reps: 8, repLabel: '6-12 tekrar', restSeconds: Math.max(90, meta.defaultRestSeconds), rir: 2 };
}

function movementSide(pattern: MovementPattern): MovementSide {
  if (pattern === 'horizontal_push' || pattern === 'vertical_push' || pattern === 'shoulder_abduction') return 'push';
  if (pattern === 'horizontal_pull' || pattern === 'vertical_pull' || pattern === 'scapular_retraction') return 'pull';
  if (
    pattern === 'squat_pattern'
    || pattern === 'hinge_pattern'
    || pattern === 'lunge_pattern'
    || pattern === 'knee_extension'
    || pattern === 'knee_flexion'
    || pattern === 'hip_extension'
    || pattern === 'plantar_flexion'
  ) return 'lower';
  if (pattern === 'elbow_flexion' || pattern === 'elbow_extension' || pattern === 'carry') return 'arms';
  if (pattern.startsWith('core_')) return 'core';
  return 'conditioning';
}

function sequenceTier(exercise: AssembledExercise): number {
  const side = movementSide(exercise.pattern);
  const meta = metaById(exercise.exerciseId);
  if (side === 'conditioning') return 7;
  if (side === 'core') return 6;
  if (exercise.category === 'isolation') return side === 'arms' ? 5 : 4;
  if (exercise.category === 'accessory') return side === 'arms' ? 5 : 3;
  if (meta?.stimulusToFatigue === 'high') return 1;
  return 2;
}

function sequenceScore(exercise: AssembledExercise): number {
  const meta = metaById(exercise.exerciseId);
  const sideScore: Record<MovementSide, number> = {
    push: 0,
    pull: 1,
    lower: 2,
    arms: 3,
    core: 4,
    conditioning: 5,
  };
  const fatigueScore = meta?.stimulusToFatigue === 'high' ? 0 : meta?.stimulusToFatigue === 'moderate' ? 1 : 2;
  return sequenceTier(exercise) * 100 + fatigueScore * 10 + sideScore[movementSide(exercise.pattern)];
}

function alternatePushPullWithinTiers(exercises: AssembledExercise[]): AssembledExercise[] {
  const grouped = new Map<number, AssembledExercise[]>();
  exercises.forEach((exercise) => {
    const tier = sequenceTier(exercise);
    grouped.set(tier, [...(grouped.get(tier) ?? []), exercise]);
  });

  return [...grouped.entries()]
    .sort(([a], [b]) => a - b)
    .flatMap(([, tierExercises]) => {
      const remaining = [...tierExercises].sort((a, b) => sequenceScore(a) - sequenceScore(b));
      const ordered: AssembledExercise[] = [];
      let lastSide: MovementSide | null = null;
      while (remaining.length > 0) {
        const preferredIndex = remaining.findIndex((exercise) => {
          const side = movementSide(exercise.pattern);
          return (lastSide === 'push' && side === 'pull') || (lastSide === 'pull' && side === 'push');
        });
        const index = preferredIndex >= 0 ? preferredIndex : 0;
        const [next] = remaining.splice(index, 1);
        if (!next) break;
        ordered.push(next);
        lastSide = movementSide(next.pattern);
      }
      return ordered;
    });
}

function hasSplitPriorityBlock(day: AssembledDay, priorityBucket: PriorityMuscleBucket): boolean {
  let seenPriority = false;
  let leftPriorityBlock = false;
  for (const exercise of day.exercises) {
    if (exercise.primaryBucket === priorityBucket) {
      if (leftPriorityBlock) return true;
      seenPriority = true;
    } else if (seenPriority) {
      leftPriorityBlock = true;
    }
  }
  return false;
}

function orderWithPriorityBlocks(day: AssembledDay, strategy: PriorityTrainingStrategy): AssembledExercise[] {
  const dayPriorityBuckets = getDayPriorityBuckets(day, strategy);
  if (dayPriorityBuckets.length === 0) return alternatePushPullWithinTiers(day.exercises);

  const priorityBucketSet = new Set(dayPriorityBuckets);
  const priorityExercises = day.exercises
    .filter((exercise) => priorityBucketSet.has(exercise.primaryBucket))
    .sort((a, b) => priorityBlockScore(a, strategy) - priorityBlockScore(b, strategy));
  const supportExercises = day.exercises.filter((exercise) => !priorityBucketSet.has(exercise.primaryBucket));

  return [
    ...priorityExercises,
    ...alternatePushPullWithinTiers(supportExercises),
  ];
}

function isHighFatigueExercise(exercise: AssembledExercise): boolean {
  const meta = metaById(exercise.exerciseId);
  if (!meta) return false;
  return meta.stimulusToFatigue === 'high'
    || exercise.pattern === 'hinge_pattern'
    || exercise.pattern === 'squat_pattern';
}

function dayHasFullBodyBalance(day: AssembledDay): boolean {
  const sides = new Set(day.exercises.map((exercise) => movementSide(exercise.pattern)));
  return (sides.has('push') || sides.has('pull')) && sides.has('lower');
}

function auditDayQuality(day: AssembledDay, input: AssemblyEngineInput, strategy: PriorityTrainingStrategy): string[] {
  const warnings: string[] = [];
  const patternCounts = new Map<MovementPattern, number>();
  const diversityCounts = new Map<string, number>();
  let highFatigueStreak = 0;

  for (const exercise of day.exercises) {
    patternCounts.set(exercise.pattern, (patternCounts.get(exercise.pattern) ?? 0) + 1);
    const diversity = regionalDiversityKey(exercise);
    diversityCounts.set(diversity, (diversityCounts.get(diversity) ?? 0) + 1);
    if (isHighFatigueExercise(exercise)) {
      highFatigueStreak += 1;
      if (highFatigueStreak >= 3) {
        warnings.push(`${day.title}: yüksek sistemik yorgunluk oluşturan hareketler arka arkaya yığılmış olabilir.`);
        break;
      }
    } else {
      highFatigueStreak = 0;
    }
  }

  for (const [pattern, count] of patternCounts.entries()) {
    const limit = isHypertrophyAssemblyGoal(input.goal) && pattern === 'horizontal_push' ? 3 : 2;
    if (count > limit) {
      warnings.push(`${day.title}: ${pattern.replaceAll('_', ' ')} paterni gereğinden fazla tekrar ediyor.`);
    }
  }
  for (const [key, count] of diversityCounts.entries()) {
    if (count > 1) {
      warnings.push(`${day.title}: ${key.replaceAll('_', ' ')} uyaranında gereksiz tekrar riski var.`);
    }
  }
  for (const bucket of getDayPriorityBuckets(day, strategy)) {
    if (hasSplitPriorityBlock(day, bucket)) {
      warnings.push(`${day.title}: ${bucket} önceliği destek hareketleriyle bölünmüş; ana blok daha tutarlı olmalı.`);
    }
    const priorityRegionalKeys = new Set(
      day.exercises
        .filter((exercise) => exercise.primaryBucket === bucket)
        .map(regionalDiversityKey),
    );
    if (BIG_HYPERTROPHY_BUCKETS.has(bucket) && priorityRegionalKeys.size < 2 && day.exercises.filter((exercise) => exercise.primaryBucket === bucket).length >= 2) {
      warnings.push(`${day.title}: ${bucket} önceliği için bölgesel açı çeşitliliği zayıf.`);
    }
  }
  if ((input.split === 'full_body' || input.programArchetype === 'full_body_hypertrophy' || input.programArchetype === 'minimalist_home') && !dayHasFullBodyBalance(day)) {
    warnings.push(`${day.title}: full body gününde üst gövde ve alt gövde dengesi zayıf.`);
  }
  return [...new Set(warnings)];
}

function optimizeDayWithCoachAudit(day: AssembledDay, input: AssemblyEngineInput, strategy: PriorityTrainingStrategy): { day: AssembledDay; warnings: string[] } {
  const dayPriorityBuckets = getDayPriorityBuckets(day, strategy);
  const orderedExercises = orderWithPriorityBlocks(day, strategy);
  const totalSets = orderedExercises.reduce((sum, item) => sum + item.sets, 0);
  const estimatedDurationMin = Math.round(orderedExercises.reduce((sum, item) => {
    const longRest = item.restSeconds >= 150;
    const mediumRest = item.restSeconds >= 90;
    return sum + item.sets * (longRest ? 4 : mediumRest ? 3 : 2.5);
  }, 0));
  const optimized: AssembledDay = {
    ...day,
    exercises: orderedExercises,
    totalSets,
    estimatedDurationMin,
    notes: [
      ...(day.notes ?? []),
      dayPriorityBuckets.length > 0
        ? `Koç denetimi: ${dayPriorityBuckets.join(', ')} önceliği seans başında ana blok olarak korundu; destek işler sonra dengelendi.`
        : 'Koç denetimi: sıralama, hareket dengesi, gereksiz tekrar ve yorgunluk yığılması kontrol edildi.',
    ],
  };
  return {
    day: optimized,
    warnings: auditDayQuality(optimized, input, strategy),
  };
}

function isHypertrophyAssemblyGoal(goal: AIProgramGoal): boolean {
  return goal === 'build_muscle' || goal === 'recomposition';
}

function hypertrophyRoleOrder(role: HypertrophyRole): number {
  if (role === 'primary_compound') return 0;
  if (role === 'secondary') return 1;
  if (role === 'isolation') return 2;
  return 3;
}

function compatibleMetaByIds(exerciseIds: string[], input: AssemblyEngineInput, usedIds: Set<string>, seed: string): ExerciseProgrammingMeta[] {
  const metas = exerciseIds
    .map(metaById)
    .filter((meta): meta is ExerciseProgrammingMeta => !!meta)
    .filter((meta) => !usedIds.has(meta.exerciseId))
    .filter((meta) => isCompatibleWithEquipment(meta, input.availableEquipment))
    .filter((meta) => isSafeForLimitations(meta, input.limitations));
  return rotateAllCandidates(metas, seed);
}

function fallbackHypertrophyCandidates(
  bucket: PriorityMuscleBucket,
  role: HypertrophyRole,
  input: AssemblyEngineInput,
  usedIds: Set<string>,
  seed: string,
): ExerciseProgrammingMeta[] {
  const preferredCategory: ExerciseCategory =
    role === 'primary_compound' ? 'compound' : role === 'secondary' ? 'accessory' : 'isolation';
  const candidates = candidatesForBucket(bucket, input)
    .filter((meta) => !usedIds.has(meta.exerciseId))
    .sort((a, b) => {
      const categoryScore = (meta: ExerciseProgrammingMeta) => (meta.category === preferredCategory ? 0 : 1);
      const stimulusScore = (meta: ExerciseProgrammingMeta) => (meta.stimulusToFatigue === 'low' ? 0 : meta.stimulusToFatigue === 'moderate' ? 1 : 2);
      const categoryDiff = categoryScore(a) - categoryScore(b);
      if (categoryDiff !== 0) return categoryDiff;
      return stimulusScore(a) - stimulusScore(b);
    });
  return rotateCandidates(candidates, seed);
}

function pickHypertrophyMeta(
  bucket: PriorityMuscleBucket,
  slot: HypertrophySlot,
  input: AssemblyEngineInput,
  usedIds: Set<string>,
  dayIndex: number,
): ExerciseProgrammingMeta | null {
  const seed = `${input.selectionSeed ?? 'default'}:${dayIndex}:${bucket}:${slot.role}`;
  const direct = compatibleMetaByIds(slot.exerciseIds, input, usedIds, seed);
  if (direct[0]) return direct[0];
  return fallbackHypertrophyCandidates(bucket, slot.role, input, usedIds, seed)[0] ?? null;
}

function clampRir(value: number, input: AssemblyEngineInput): number {
  const { rirMin, rirMax } = input.volumeBlueprint.effort;
  return Math.max(rirMin, Math.min(value, rirMax));
}

function hypertrophyPrescription(
  meta: ExerciseProgrammingMeta,
  role: HypertrophyRole,
  bucket: PriorityMuscleBucket,
  isPriority: boolean,
  input: AssemblyEngineInput,
): Pick<AssembledExercise, 'sets' | 'reps' | 'repLabel' | 'restSeconds' | 'rir'> {
  const conservative = input.goal === 'recomposition' || input.volumeBlueprint.effort.rirMin >= 2;
  const priorityBonus = input.goal === 'build_muscle' && isPriority && BIG_HYPERTROPHY_BUCKETS.has(bucket) ? 1 : 0;

  if (role === 'primary_compound') {
    const sets = Math.min(4, Math.max(3, meta.defaultSetBand.min + priorityBonus));
    return {
      sets,
      reps: meta.defaultRepRange.min <= 5 ? 6 : 8,
      repLabel: '5-8 tekrar',
      restSeconds: Math.max(meta.defaultRestSeconds, 120),
      rir: clampRir(conservative ? 2 : 1, input),
    };
  }

  if (role === 'secondary') {
    return {
      sets: conservative ? 2 : 3,
      reps: 10,
      repLabel: '8-12 tekrar',
      restSeconds: Math.max(meta.defaultRestSeconds, 90),
      rir: clampRir(conservative ? 2 : 1, input),
    };
  }

  if (meta.category === 'compound') {
    return {
      sets: conservative ? 2 : 3,
      reps: 10,
      repLabel: '8-12 tekrar',
      restSeconds: Math.max(meta.defaultRestSeconds, 90),
      rir: clampRir(conservative ? 2 : 1, input),
    };
  }

  return {
    sets: conservative ? 2 : 3,
    reps: 15,
    repLabel: '12-20 tekrar',
    restSeconds: Math.max(meta.defaultRestSeconds, 60),
    rir: clampRir(conservative ? 2 : 0, input),
  };
}

function hypertrophyWhy(bucket: PriorityMuscleBucket, role: HypertrophyRole, meta: ExerciseProgrammingMeta): string {
  const bucketLabels: Record<PriorityMuscleBucket, string> = {
    chest: 'göğüs',
    shoulders: 'omuz',
    lats: 'lat',
    upper_back: 'üst sırt',
    arms: 'kol',
    glutes: 'kalça',
    quads: 'ön bacak',
    hamstrings: 'arka bacak',
    calves: 'kalf',
    core: 'core',
  };
  if (bucket === 'chest' && meta.angleVariant === 'incline') return 'Incline press üst göğüs hacmini tamamlar.';
  if (bucket === 'chest' && meta.category === 'isolation') return 'Fly/cable varyasyonu göğsü düşük yorgunlukla daha uzun ROM içinde tamamlar.';
  if (bucket === 'lats' && meta.pattern === 'vertical_pull') return 'Vertical pull lat gelişimi için dikey çekiş açısını sağlar.';
  if (bucket === 'upper_back' && meta.pattern === 'horizontal_pull') return 'Row varyasyonu sırtı yatay çekiş açısıyla çalıştırır.';
  if (bucket === 'shoulders' && meta.pattern === 'shoulder_abduction') return 'Lateral raise yan omuz hacmini düşük yorgunlukla artırır.';
  if (bucket === 'shoulders' && meta.pattern === 'scapular_retraction') return 'Rear delt/scapula işi omuz dengesini ve arka omuz hacmini tamamlar.';
  if (role === 'primary_compound') return `${bucketLabels[bucket]} için ana hypertrophy hareketi; mekanik gerilim ve progresif yükleme sağlar.`;
  if (role === 'secondary') return `${bucketLabels[bucket]} hacmini farklı açı veya unilateral destekle tamamlar.`;
  return `${bucketLabels[bucket]} için izolasyon/pump slotu; kaliteli sete düşük sistemik yorgunluk ekler.`;
}

function desiredHypertrophySlotCount(bucket: PriorityMuscleBucket, perSessionSets: number, isPriority: boolean): number {
  if (bucket === 'calves' || bucket === 'core') return perSessionSets >= 4 && isPriority ? 2 : 1;
  if (bucket === 'arms') return perSessionSets >= 4 ? 2 : 1;
  if (isPriority && BIG_HYPERTROPHY_BUCKETS.has(bucket)) return 3;
  if (BIG_HYPERTROPHY_BUCKETS.has(bucket) && perSessionSets >= 4) return 2;
  return 1;
}

function assembleHypertrophyDay(focus: DayFocus, dayIndex: number, input: AssemblyEngineInput): AssembledDay {
  const usedIds = new Set<string>();
  const exercises: AssembledExercise[] = [];
  const bucketsCovered: PriorityMuscleBucket[] = [];
  const notes: string[] = ['Hypertrophy günü kaliteli set, açı çeşitliliği ve RIR kontrolüyle kuruldu.'];

  const priorityBuckets = input.volumeBlueprint.targets
    .filter((target) => target.isPriority)
    .map((target) => target.bucket);
  const orderedBuckets = [...focus.buckets].sort((a, b) => {
    const priorityDiff = (priorityBuckets.includes(b) ? 1 : 0) - (priorityBuckets.includes(a) ? 1 : 0);
    if (priorityDiff !== 0) return priorityDiff;
    const bigDiff = (BIG_HYPERTROPHY_BUCKETS.has(b) ? 1 : 0) - (BIG_HYPERTROPHY_BUCKETS.has(a) ? 1 : 0);
    if (bigDiff !== 0) return bigDiff;
    return 0;
  });

  for (const bucket of orderedBuckets) {
    const target = input.volumeBlueprint.targets.find((item) => item.bucket === bucket);
    const slots = HYPERTROPHY_SLOT_IDS[bucket];
    if (!target || !slots) continue;

    const perSessionSets = Math.max(1, Math.round(target.weeklySets / target.frequency));
    const slotCount = Math.min(slots.length, desiredHypertrophySlotCount(bucket, perSessionSets, target.isPriority));
    const selectedSlots = slots
      .slice(0, slotCount)
      .sort((a, b) => hypertrophyRoleOrder(a.role) - hypertrophyRoleOrder(b.role));

    for (const slot of selectedSlots) {
      const meta = pickHypertrophyMeta(bucket, slot, input, usedIds, dayIndex);
      if (!meta) {
        notes.push(`${bucket} için ${slot.role} slotunda ekipman/limitasyon uyumlu hareket bulunamadı.`);
        continue;
      }
      usedIds.add(meta.exerciseId);
      if (!bucketsCovered.includes(bucket)) bucketsCovered.push(bucket);
      exercises.push({
        exerciseId: meta.exerciseId,
        ...hypertrophyPrescription(meta, slot.role, bucket, target.isPriority, input),
        alternatives: getReplacementsFor(meta.exerciseId, input.availableEquipment, input.limitations).map((item) => item.exerciseId),
        why: hypertrophyWhy(bucket, slot.role, meta),
        category: meta.category,
        pattern: meta.pattern,
        primaryBucket: bucket,
      });
    }
  }

  exercises.sort((a, b) => {
    const aPriority = priorityBuckets.includes(a.primaryBucket) ? 0 : 1;
    const bPriority = priorityBuckets.includes(b.primaryBucket) ? 0 : 1;
    if (aPriority !== bPriority) return aPriority - bPriority;
    return CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category];
  });

  const ceiling = input.volumeBlueprint.fatigue.perSessionSetCeiling;
  let totalSets = exercises.reduce((sum, item) => sum + item.sets, 0);
  let trimmed = false;
  while (totalSets > ceiling && exercises.length > 4) {
    let removeIndex = -1;
    for (let i = exercises.length - 1; i >= 0; i -= 1) {
      const item = exercises[i]!;
      if (item.category === 'isolation' && !priorityBuckets.includes(item.primaryBucket)) {
        removeIndex = i;
        break;
      }
    }
    const index = removeIndex >= 0 ? removeIndex : exercises.length - 1;
    const removed = exercises.splice(index, 1)[0];
    if (!removed) break;
    totalSets -= removed.sets;
    trimmed = true;
  }
  for (let i = exercises.length - 1; totalSets > ceiling && i >= 0; i -= 1) {
    const exercise = exercises[i]!;
    if (exercise.sets <= 2) continue;
    const reduction = Math.min(exercise.sets - 2, totalSets - ceiling);
    exercise.sets -= reduction;
    totalSets -= reduction;
    trimmed = true;
  }
  while (totalSets > ceiling && exercises.length > 4) {
    const removed = exercises.pop();
    if (!removed) break;
    totalSets -= removed.sets;
    trimmed = true;
  }
  if (trimmed) notes.push('Seans tavanını korumak için öncelik dışı izolasyon hacmi kırpıldı.');

  return {
    dayIndex,
    title: focus.title,
    exercises,
    totalSets,
    estimatedDurationMin: Math.round(exercises.reduce((sum, item) => sum + item.sets * (item.restSeconds >= 120 ? 4 : 3), 0)),
    bucketsCovered,
    notes,
  };
}

function assembleStrengthDay(template: StrengthDayTemplate, dayIndex: number, input: AssemblyEngineInput): AssembledDay {
  const usedIds = new Set<string>();
  const exercises: AssembledExercise[] = [];
  const bucketsCovered: PriorityMuscleBucket[] = [];
  const notes: string[] = ['Strength günü ana lift slotları önce yerleştirildi.'];

  const addSlot = (slot: StrengthSlot, main: boolean) => {
    const meta = pickStrengthMeta(slot, input, usedIds);
    if (!meta) {
      notes.push(`${slot} için ekipman/limitasyon uyumlu hareket bulunamadı.`);
      return;
    }
    const bucket = strengthBucketForSlot(slot);
    const prescription = strengthPrescription(meta, slot, main);
    usedIds.add(meta.exerciseId);
    if (!bucketsCovered.includes(bucket)) bucketsCovered.push(bucket);
    exercises.push({
      exerciseId: meta.exerciseId,
      ...prescription,
      alternatives: getReplacementsFor(meta.exerciseId, input.availableEquipment, input.limitations).map((item) => item.exerciseId),
      why: main
        ? `${template.title} için ana lift; kuvvet hedefinde düşük-orta tekrar ve uzun dinlenme.`
        : `${template.title} ana liftini destekleyen aksesuar hareket.`,
      category: meta.category,
      pattern: meta.pattern,
      primaryBucket: bucket,
    });
  };

  template.mainSlots.slice(0, 2).forEach((slot) => addSlot(slot, true));
  template.accessorySlots.forEach((slot) => addSlot(slot, false));

  const ceiling = input.volumeBlueprint.fatigue.perSessionSetCeiling;
  let totalSets = exercises.reduce((sum, item) => sum + item.sets, 0);
  while (totalSets > ceiling && exercises.length > 4) {
    const removed = exercises.pop();
    if (!removed) break;
    totalSets -= removed.sets;
  }

  return {
    dayIndex,
    title: template.title,
    exercises,
    totalSets,
    estimatedDurationMin: Math.round(exercises.reduce((sum, item) => sum + item.sets * (item.restSeconds >= 150 ? 4 : 3), 0)),
    bucketsCovered,
    notes,
  };
}

function candidatesForBucket(
  bucket: PriorityMuscleBucket,
  input: AssemblyEngineInput,
): ExerciseProgrammingMeta[] {
  const roles = bucketToMuscleRoles(bucket);
  const hasPain = input.limitations.some((item) => item !== 'none' && item !== 'other');
  return EXERCISE_PROGRAMMING_META.filter((meta) => meta.pattern !== 'conditioning')
    .filter((meta) => meta.primaryMuscles.some((role) => roles.includes(role)))
    .filter((meta) => isCompatibleWithEquipment(meta, input.availableEquipment))
    .filter((meta) => isSafeForLimitations(meta, input.limitations))
    .sort((a, b) => {
      if (input.availableEquipment.includes('bodyweight_only')) {
        const bodyweightScore = (meta: ExerciseProgrammingMeta) => {
          if (meta.exerciseId === 'Pushups') return 4;
          if (meta.exerciseId.includes('Bodyweight') || meta.exerciseId.includes('Dips')) return 2;
          return 0;
        };
        const scoreDiff = bodyweightScore(b) - bodyweightScore(a);
        if (scoreDiff !== 0) return scoreDiff;
      }
      if (input.sex === 'female') {
        const femaleScore = (meta: ExerciseProgrammingMeta) => {
          if (input.availableEquipment.includes('bodyweight_only')) return 0;
          let score = 0;
          if (meta.primaryMuscles.includes('glutes')) score += 3;
          if (meta.primaryMuscles.includes('abs') || meta.primaryMuscles.includes('obliques')) score += 2;
          if (meta.primaryMuscles.includes('upper_back')) score += 1;
          if (meta.pattern === 'hinge_pattern' || meta.pattern === 'lunge_pattern') score += 1;
          return score;
        };
        const scoreDiff = femaleScore(b) - femaleScore(a);
        if (scoreDiff !== 0) return scoreDiff;
      }
      if (hasPain) {
        const aPref = isPreferredForLimitation(a, input.limitations) ? 0 : 1;
        const bPref = isPreferredForLimitation(b, input.limitations) ? 0 : 1;
        if (aPref !== bPref) return aPref - bPref;
      }
      return CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category];
    });
}

function pickExercisesForBucket(
  bucket: PriorityMuscleBucket,
  perSessionSets: number,
  input: AssemblyEngineInput,
): AssembledExercise[] {
  const candidates = rotateCandidates(
    candidatesForBucket(bucket, input),
    `${input.selectionSeed ?? 'default'}:${input.programArchetype ?? input.split}:${bucket}`,
  );
  if (candidates.length === 0) return [];

  const setsPerExercise = 3;
  const exerciseCount = Math.max(1, Math.min(candidates.length, Math.ceil(perSessionSets / setsPerExercise)));
  const rirMin = input.volumeBlueprint.effort.rirMin;
  const rirMax = input.volumeBlueprint.effort.rirMax;

  const chosen: ExerciseProgrammingMeta[] = [];
  const usedKeys = new Set<string>();

  // Pattern + angle diversity allows useful variants, such as flat and incline presses.
  for (const candidate of candidates) {
    if (chosen.length >= exerciseCount) break;
    const key = diversityKey(candidate);
    if (usedKeys.has(key)) continue;
    chosen.push(candidate);
    usedKeys.add(key);
  }

  const totalChosen = chosen.length;
  const setsEach = Math.max(2, Math.ceil(perSessionSets / totalChosen));

  const hasPain = input.limitations.some((item) => item !== 'none' && item !== 'other');

  return chosen.map((meta, index) => {
    const reps = resolveReps(meta, input.goal);
    const rir = resolveRir(meta, rirMin, rirMax);
    const isPreferred = hasPain && isPreferredForLimitation(meta, input.limitations);
    const whyParts: string[] = [`${bucket} için ${meta.category} ${meta.pattern.replace('_', ' ')}`];
    if (index === 0) whyParts.push('bucket için birincil hareket');
    if (meta.category === 'compound') whyParts.push('taze yerleşim için gün başında');
    if (isPreferred) whyParts.push('bildirilen limitasyon için güvenli alternatif');
    if (meta.stimulusToFatigue === 'low') whyParts.push('düşük yorgunluk maliyeti');

    const replacements = getReplacementsFor(meta.exerciseId, input.availableEquipment, input.limitations);

    return {
      exerciseId: meta.exerciseId,
      sets: setsEach,
      reps,
      repLabel: buildRepLabel(reps, meta),
      restSeconds: meta.defaultRestSeconds,
      rir,
      alternatives: replacements.map((item) => item.exerciseId),
      why: whyParts.join('; '),
      category: meta.category,
      pattern: meta.pattern,
      primaryBucket: bucket,
    };
  });
}

function assembleDay(focus: DayFocus, dayIndex: number, input: AssemblyEngineInput): AssembledDay {
  const seenExerciseIds = new Set<string>();
  const patternCounts = new Map<string, number>();
  const exercises: AssembledExercise[] = [];
  const bucketsCovered: PriorityMuscleBucket[] = [];
  const notes: string[] = [];

  // compound bucket'ları önce işle (chest/quads/back gibi büyük kaslar),
  // böylece gün başına taze yerleşim doğal olarak olur.
  const orderedBuckets = [...focus.buckets].sort((a, b) => {
    const aCompound = candidatesForBucket(a, input).some((m) => m.category === 'compound');
    const bCompound = candidatesForBucket(b, input).some((m) => m.category === 'compound');
    return (aCompound ? 0 : 1) - (bCompound ? 0 : 1);
  });

  for (const bucket of orderedBuckets) {
    const target = input.volumeBlueprint.targets.find((t) => t.bucket === bucket);
    if (!target) continue;
    const perSession = Math.max(1, Math.round(target.weeklySets / target.frequency));
    const picked = pickExercisesForBucket(bucket, perSession, input).filter((item) => {
      if (seenExerciseIds.has(item.exerciseId)) return false;
      return (patternCounts.get(item.pattern) ?? 0) < 2;
    });
    if (picked.length === 0) {
      notes.push(`${bucket} için uygun hareket bulunamadı (ekipman/limitasyon filtresi).`);
      continue;
    }
    picked.forEach((item) => {
      seenExerciseIds.add(item.exerciseId);
      patternCounts.set(item.pattern, (patternCounts.get(item.pattern) ?? 0) + 1);
    });
    exercises.push(...picked);
    if (!bucketsCovered.includes(bucket)) bucketsCovered.push(bucket);
  }

  // sıralama: compound -> accessory -> isolation
  exercises.sort((a, b) => CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category]);

  // duration guard: perSessionSetCeiling aşılırsa önce izolasyon/accessory kırpar,
  // hala aşıyorsa compound setlerini 3'e indir, son olarak fazla compound'ları çıkarır.
  const ceiling = input.volumeBlueprint.fatigue.perSessionSetCeiling;
  let totalSets = exercises.reduce((sum, item) => sum + item.sets, 0);
  let trimmed = false;

  while (totalSets > ceiling && exercises.length > 1) {
    const last = exercises[exercises.length - 1]!;
    if (last.category === 'isolation' || last.category === 'accessory') {
      totalSets -= last.sets;
      exercises.pop();
      trimmed = true;
    } else {
      break;
    }
  }
  // hala ceiling üstündeyse compound setlerini düşür
  if (totalSets > ceiling) {
    for (const ex of exercises) {
      if (ex.sets > 3) {
        totalSets -= ex.sets - 3;
        ex.sets = 3;
        trimmed = true;
      }
    }
  }
  // hala ceiling üstündeyse en sondaki compound'ları çıkar (en az kritik)
  while (totalSets > ceiling && exercises.length > 3) {
    const last = exercises[exercises.length - 1]!;
    if (last.category === 'compound') {
      totalSets -= last.sets;
      exercises.pop();
      trimmed = true;
    } else {
      break;
    }
  }

  const estimatedDurationMin = Math.round(totalSets * 3);

  if (trimmed) {
    notes.push('Seans süresi tavanını aşmaması için izolasyon hareketleri kırıldı.');
  }

  const day: AssembledDay = {
    dayIndex,
    title: focus.title,
    exercises,
    totalSets,
    estimatedDurationMin,
    bucketsCovered,
    notes: notes.length > 0 ? notes : undefined,
  };
  return day;
}

function buildAuditCategory(
  key: ProgramAuditCategoryKey,
  label: string,
  maxScore: number,
  deductions: number[],
): ProgramAuditCategoryScore {
  const score = Math.max(0, maxScore - deductions.reduce((sum, value) => sum + value, 0));
  return { key, label, score, maxScore };
}

function buildProgramAudit(
  days: AssembledDay[],
  input: AssemblyEngineInput,
  strategy: PriorityTrainingStrategy,
  warnings: string[],
): ProgramAuditResult {
  const totalWeeklySets = days.reduce((sum, day) => sum + day.totalSets, 0);
  const priorityCoverage = strategy.priorityBuckets.map((bucket) => ({
    bucket,
    dayCount: days.filter((day) => day.exercises.some((exercise) => exercise.primaryBucket === bucket)).length,
  }));
  const priorityMissing = priorityCoverage.filter((item) => item.dayCount === 0).length;
  const priorityLowFrequency = isHypertrophyAssemblyGoal(input.goal)
    ? priorityCoverage.filter((item) => item.dayCount > 0 && item.dayCount < 2).length
    : 0;
  const hasPrioritySplitWarning = warnings.some((warning) => warning.includes('önceliği destek hareketleriyle bölünmüş'));
  const regionalWarnings = warnings.filter((warning) => warning.includes('bölgesel') || warning.includes('uyaranında')).length;
  const sequencingWarnings = warnings.filter((warning) => warning.includes('sıralama') || warning.includes('yığılmış') || warning.includes('full body')).length;
  const redundancyWarnings = warnings.filter((warning) => warning.includes('paterni') || warning.includes('uyaranında')).length;
  const emptyOrMissingWarnings = warnings.filter((warning) => warning.includes('hareket kalmadı') || warning.includes('uygun hareket bulunamadı')).length;
  const ceilingExceeded = totalWeeklySets > input.volumeBlueprint.fatigue.weeklySetCeiling;

  const categories: ProgramAuditCategoryScore[] = [
    buildAuditCategory('musclePrioritization', 'Kas önceliği', 15, [
      priorityMissing * 6,
      priorityLowFrequency * 2,
      hasPrioritySplitWarning ? 8 : 0,
    ]),
    buildAuditCategory('regionalBalance', 'Bölgesel denge', 15, [Math.min(6, regionalWarnings)]),
    buildAuditCategory('sequencing', 'Egzersiz sırası', 15, [Math.min(10, sequencingWarnings * 3), hasPrioritySplitWarning ? 6 : 0]),
    buildAuditCategory('weeklyVolume', 'Haftalık hacim', 10, [ceilingExceeded ? 2 : 0]),
    buildAuditCategory('frequency', 'Frekans', 10, [priorityLowFrequency * 2]),
    buildAuditCategory('exerciseSelection', 'Hareket seçimi', 10, [Math.min(8, emptyOrMissingWarnings * 4)]),
    buildAuditCategory('redundancy', 'Tekrar riski', 10, [Math.min(5, redundancyWarnings)]),
    buildAuditCategory('fatigue', 'Yorgunluk yönetimi', 10, [ceilingExceeded ? 1 : 0, sequencingWarnings > 0 ? 2 : 0]),
    buildAuditCategory('userFit', 'Kullanıcı uyumu', 5, [Math.min(4, emptyOrMissingWarnings * 2)]),
  ];
  const score = categories.reduce((sum, category) => sum + category.score, 0);
  const requiredFixes: string[] = [];

  if (priorityMissing > 0) {
    requiredFixes.push('Öncelik verilen kaslar haftalık plana en az bir kez yerleşmeli.');
  }
  if (hasPrioritySplitWarning) {
    requiredFixes.push('Öncelik kası ana çalışması destek hareketlerle bölünmeden blok halinde tutulmalı.');
  }
  if (score < 90) {
    requiredFixes.push('Program denetim skoru 90 altına düştü; hacim, sıralama veya hareket seçimi yeniden dengelenmeli.');
  }

  return {
    score,
    passed: score >= 90 && requiredFixes.length === 0,
    categories,
    warnings: [...new Set(warnings)],
    requiredFixes: [...new Set(requiredFixes)],
  };
}

export function assembleSessionPlan(input: AssemblyEngineInput): SessionAssemblyPlan {
  if (isThreeDayFullBodyStrength(input)) {
    return assembleThreeDayFullBodyStrengthProgram(input);
  }

  const strengthTemplates = input.goal === 'strength' ? getStrengthTemplates(input.recommendedTrainingDays) : null;
  const focuses = strengthTemplates ? [] : getDayFocuses(input.split, input.recommendedTrainingDays, input.programArchetype);
  const days = strengthTemplates
    ? strengthTemplates.map((template, index) => assembleStrengthDay(template, index, input))
    : focuses.map((focus, index) => (
      isHypertrophyAssemblyGoal(input.goal)
        ? assembleHypertrophyDay(focus, index, input)
        : assembleDay(focus, index, input)
    ));
  const priorityStrategy = getPriorityTrainingStrategy(input);
  const audited = days.map((day) => optimizeDayWithCoachAudit(day, input, priorityStrategy));
  const optimizedDays = audited.map((item) => item.day);
  const selectionNotes: string[] = [];
  const warnings: string[] = audited.flatMap((item) => item.warnings);

  const totalWeeklySets = optimizedDays.reduce((sum, day) => sum + day.totalSets, 0);
  if (totalWeeklySets > input.volumeBlueprint.fatigue.weeklySetCeiling) {
    warnings.push(
      `Toplam haftalık set (${totalWeeklySets}) yorgunluk tavanını aşıyor; ilerleme fazında hacim ayarlaması gerekli.`,
    );
  }

  const emptyBuckets = optimizedDays.some((day) => day.bucketsCovered.length === 0);
  if (emptyBuckets) {
    warnings.push('Bazı günlerde ekipman/limitasyon filtresi sonrası hareket kalmadı.');
  }

  selectionNotes.push(`${input.split.replace('_', ' ')} split'i için ${days.length} gün kuruldu.`);
  if (input.goal === 'strength') {
    selectionNotes.push('Strength hedefi için ana lift + destek hareketleri şablonu kullanıldı.');
  }
  if (isHypertrophyAssemblyGoal(input.goal)) {
    selectionNotes.push('Hypertrophy hedefi için kaliteli set, açı çeşitliliği ve compound/accessory/isolation dengesi uygulandı.');
  }
  if (input.programArchetype) selectionNotes.push(`${input.programArchetype.replaceAll('_', ' ')} arketipi uygulandı.`);
  selectionNotes.push('Hareketler compound -> accessory -> isolation sırasına göre dizildi.');
  if (priorityStrategy.priorityBuckets.length > 0) {
    selectionNotes.push(`Öncelik kasları (${priorityStrategy.priorityBuckets.join(', ')}) seans içinde ana blok olarak korundu.`);
  }
  selectionNotes.push('Koç denetimi hareket sırası, pattern dengesi, yorgunluk ve gereksiz tekrar riskini kontrol etti.');
  const uniqueWarnings = [...new Set(warnings)];
  const audit = buildProgramAudit(optimizedDays, input, priorityStrategy, uniqueWarnings);

  return {
    split: input.split,
    programArchetype: input.programArchetype,
    days: optimizedDays,
    selectionNotes,
    warnings: uniqueWarnings,
    audit,
  };
}

export { getDayFocuses };
export type { DayFocus };
