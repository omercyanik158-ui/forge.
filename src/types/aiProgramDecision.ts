import type {
  AIProgramDecisionContext,
  AIProgramGoal,
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
