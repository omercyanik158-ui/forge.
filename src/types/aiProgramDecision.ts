import type {
  AIProgramFamily,
  AIProgramGoalClassification,
  AIProgramDecisionContext,
  AIProgramGoal,
  AIProgramLiftPattern,
  AIProgramPreferredStyle,
  AIProgramPriorityMuscle,
} from './aiProgram';

export type AIProgramSplitKey =
  | 'full_body'
  | 'upper_lower'
  | 'push_pull_legs'
  | 'torso_limbs'
  | 'anterior_posterior'
  | 'body_part_emphasis'
  | 'hybrid'
  | 'minimalist_home';

export type AIProgramArchetypeKey =
  | 'full_body_strength_skill'
  | 'full_body_hypertrophy'
  | 'upper_lower_strength'
  | 'upper_lower_hypertrophy'
  | 'ppl_hypertrophy'
  | 'hybrid_athletic'
  | 'body_part_specialization'
  | 'minimalist_home'
  | 'posterior_chain_focus'
  | 'glute_core_focus';

export type AIProgramWeeklyDayRole =
  | 'volume_day'
  | 'intensity_day'
  | 'technique_day'
  | 'recovery_day'
  | 'variation_day'
  | 'competition_specific_day'
  | 'hypertrophy_assistance_day'
  | 'gpp_day'
  | 'priority_block_day'
  | 'balanced_hypertrophy_day'
  | 'maintenance_day';

export type AIProgramProgressionModel =
  | 'session_to_session_lp'
  | 'weekly_linear'
  | 'rep_range_linear'
  | 'training_max_cycle'
  | 'top_set_backoff'
  | 'heavy_light_medium'
  | 'daily_undulating'
  | 'block_periodization'
  | 'volume_to_intensity_transition'
  | 'double_progression'
  | 'set_addition'
  | 'fatigue_held'
  | 'specialization_microcycle';

export type AIProgramExerciseRolePolicy =
  | 'strength_role_driven'
  | 'hypertrophy_region_driven'
  | 'powerbuilding_hybrid'
  | 'general_fitness_minimum_effective';

export type AIProgramWeeklyArchitecture = {
  label: string;
  split: AIProgramSplitKey;
  dayRoles: AIProgramWeeklyDayRole[];
  notes: string[];
};

export type AIProgramVolumeDirection =
  | 'conservative'
  | 'moderate'
  | 'moderate_high'
  | 'specialization';

export type AIProgramDecisionConfidence = 'low' | 'medium' | 'high';

export type AIProgramAlternativeDecision = {
  split: AIProgramSplitKey;
  label: string;
  weeklyStructure: string[];
  score: number;
  rationale: string[];
  tradeoffs: string[];
  rejectedReason?: string;
};

export type AIProgramDecisionBlueprint = {
  stylePreference: AIProgramPreferredStyle;
  programFamily: AIProgramFamily;
  goalClassification: AIProgramGoalClassification;
  targetLiftPatterns: AIProgramLiftPattern[];
  programArchetype: AIProgramArchetypeKey;
  programArchetypeLabel: string;
  programArchetypeRationale: string[];
  weeklyArchitecture: AIProgramWeeklyArchitecture;
  progressionModel: AIProgramProgressionModel;
  fatigueStrategy: string[];
  exerciseRolePolicy: AIProgramExerciseRolePolicy;
  specializationStrategy?: string[];
  stallProtocol?: string[];
  recommendedSplit: AIProgramSplitKey;
  recommendedSplitLabel: string;
  recommendedTrainingDays: number;
  weeklyStructure: string[];
  rationale: string[];
  goalStrategy: string[];
  priorityMuscleStrategy: string[];
  recoveryStrategy: string[];
  volumeDirection: AIProgramVolumeDirection;
  effortStrategy: string[];
  frequencyStrategy: string[];
  safetyConstraints: string[];
  assumptions: string[];
  confidence: AIProgramDecisionConfidence;
  confidenceRationale: string[];
  alternativesConsidered: AIProgramAlternativeDecision[];
  evidenceCategories: string[];
  whyThisPlan: string[];
  futureExerciseConstraints: string[];
};

export type AIProgramDecisionProfile = AIProgramDecisionContext['userProfile'];

export type AIProgramSplitCandidate = {
  split: AIProgramSplitKey;
  label: string;
  score: number;
  weeklyStructure: string[];
  rationale: string[];
  tradeoffs: string[];
};

export type AIProgramRuleResult = {
  lines: string[];
  splitBias?: Partial<Record<AIProgramSplitKey, number>>;
  maxRecommendedDays?: number;
  volumeDirection?: AIProgramVolumeDirection;
};

export const UPPER_BODY_PRIORITY_MUSCLES: AIProgramPriorityMuscle[] = [
  'chest',
  'shoulders',
  'lats',
  'upper_back',
  'arms',
];

export const LOWER_BODY_PRIORITY_MUSCLES: AIProgramPriorityMuscle[] = [
  'glutes',
  'quads',
  'hamstrings',
  'calves',
];

export const GOAL_LABELS: Record<AIProgramGoal, string> = {
  build_muscle: 'Build muscle',
  lose_fat: 'Lose fat',
  recomposition: 'Recomposition',
  strength: 'Strength',
  athletic_performance: 'Athletic performance',
  general_fitness: 'General fitness',
  return_to_training: 'Return to training',
};
