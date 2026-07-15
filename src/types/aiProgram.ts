import type { PhysiqueAnalysisResult } from './aiHub';
import type { AIProgramDecisionBlueprint } from './aiProgramDecision';

export type AIProgramEntryPath = 'ai_hub' | 'physique_result' | 'physique_history' | 'resume';

export type AIProgramStepId =
  | 'intro'
  | 'goal'
  | 'style'
  | 'days'
  | 'duration'
  | 'location'
  | 'equipment'
  | 'experience'
  | 'priority'
  | 'limitations'
  | 'exercise_preferences'
  | 'recovery'
  | 'summary';

export type AIProgramGoal =
  | 'build_muscle'
  | 'lose_fat'
  | 'recomposition'
  | 'strength'
  | 'athletic_performance'
  | 'general_fitness'
  | 'return_to_training'
  | 'home_workout'
  | 'yoga'
  | 'pilates';

export type AIProgramSecondaryGoal = 'none' | 'strength' | 'conditioning' | 'mobility' | 'body_composition';

export type AIProgramGoalClassification =
  | 'general_strength'
  | 'powerlifting_strength'
  | 'lift_specific_strength'
  | 'hypertrophy'
  | 'muscle_specialization'
  | 'powerbuilding'
  | 'general_fitness'
  | 'fat_loss_strength_retention';

export type AIProgramFamily =
  | 'strength'
  | 'hypertrophy'
  | 'powerbuilding'
  | 'general_fitness';

export type AIProgramLiftPattern =
  | 'squat'
  | 'bench'
  | 'deadlift'
  | 'press'
  | 'row'
  | 'pullup';

export type AIProgramLocation = 'gym' | 'home' | 'both';

export type AIProgramExperience = 'beginner' | 'returning' | 'intermediate' | 'advanced';

export type AIProgramPriorityMuscle =
  | 'chest'
  | 'shoulders'
  | 'lats'
  | 'upper_back'
  | 'arms'
  | 'glutes'
  | 'quads'
  | 'hamstrings'
  | 'calves'
  | 'core'
  | 'full_body_balance';

export type AIProgramPainLimitation =
  | 'none'
  | 'shoulder'
  | 'elbow'
  | 'wrist'
  | 'lower_back'
  | 'hip'
  | 'knee'
  | 'ankle'
  | 'other';

export type AIProgramRecoveryQuality = 'great' | 'okay' | 'poor';

export type AIProgramSleepContext = 'under_6h' | '6_7h' | '7_8h' | '8h_plus';

export type AIProgramStressContext = 'low' | 'medium' | 'high';

export type AIProgramPreferredStyle =
  | 'auto'
  | 'full_body'
  | 'upper_lower'
  | 'push_pull_legs'
  | 'hybrid_athletic'
  | 'body_part'
  | 'minimalist_home';

export type AIProgramEquipmentKey =
  | 'machines'
  | 'cables'
  | 'dumbbells'
  | 'adjustable_dumbbells'
  | 'barbells'
  | 'smith_machine'
  | 'pullup_station'
  | 'pullup_bar'
  | 'leg_press'
  | 'cardio_machines'
  | 'bodyweight_only'
  | 'bands'
  | 'bench'
  | 'kettlebell';

export type AIProgramMissingInfoLevel = 'critical' | 'important' | 'optional';

export type AIProgramValidationCode =
  | 'missing_goal'
  | 'missing_training_days'
  | 'missing_duration'
  | 'missing_location'
  | 'missing_equipment'
  | 'missing_limitations'
  | 'too_many_priority_muscles'
  | 'beginner_high_frequency'
  | 'poor_recovery_high_frequency'
  | 'pain_requires_conservative_flag';

export type AIProgramSafetyFlag =
  | 'high_frequency_beginner'
  | 'high_frequency_poor_recovery'
  | 'pain_reported'
  | 'physique_is_estimate_only'
  | 'cycle_context_present';

export type AIProgramGenerationStatus = 'idle' | 'processing' | 'paused' | 'failed' | 'ready';

export type AIProgramPhysiqueSummary = {
  source: 'current_result' | 'saved_log';
  createdAt: string;
  confidenceLevel: 'low' | 'medium' | 'high';
  estimateNote?: string;
  focusAreas: string[];
  focusMuscles: AIProgramPriorityMuscle[];
  volumeBias: 'conservative' | 'moderate' | 'moderate_high';
  splitBiasHint: 'balanced' | 'upper_focus' | 'lower_focus' | 'posterior_focus';
  exerciseEmphasis: string[];
  recommendedExercises: string[];
  generalSummary?: string;
};

export type ProgramInfluenceSummary = {
  focusMuscles: AIProgramPriorityMuscle[];
  focusLabels: string[];
  splitImpact: string;
  volumeImpact: string;
  exerciseEmphasis: string[];
  confidenceLevel: 'low' | 'medium' | 'high';
  explanation: string;
};

export type AIProgramAnswers = {
  mainGoal?: AIProgramGoal;
  secondaryGoal?: AIProgramSecondaryGoal;
  preferredProgramStyle?: AIProgramPreferredStyle;
  trainingDays?: 2 | 3 | 4 | 5 | 6;
  sessionDurationMin?: 30 | 45 | 60 | 75 | 90;
  location?: AIProgramLocation;
  equipment: AIProgramEquipmentKey[];
  experience?: AIProgramExperience;
  priorityMuscles: AIProgramPriorityMuscle[];
  painLimitations: AIProgramPainLimitation[];
  limitationNote?: string;
  preferredExerciseIds?: string[];
  avoidedExerciseIds?: string[];
  preferredExercises?: string;
  avoidedExercises?: string;
  recoveryQuality?: AIProgramRecoveryQuality;
  sleepContext?: AIProgramSleepContext;
  stressContext?: AIProgramStressContext;
  useLatestPhysiqueAnalysis: boolean;
};

export type AIProgramMissingInfo = {
  level: AIProgramMissingInfoLevel;
  field: keyof AIProgramAnswers | 'profile';
};

export type AIProgramUserProfileContext = {
  age?: number;
  sex?: 'male' | 'female';
  heightCm?: number;
  weightKg?: number;
  experience?: AIProgramExperience;
  goal?: AIProgramGoal;
  secondaryGoal?: AIProgramSecondaryGoal;
  preferredProgramStyle: AIProgramPreferredStyle;
  trainingDays?: number;
  sessionDuration?: number;
  location?: AIProgramLocation;
  equipment: AIProgramEquipmentKey[];
  priorityMuscles: AIProgramPriorityMuscle[];
  painLimitations: AIProgramPainLimitation[];
  preferredExerciseIds?: string[];
  avoidedExerciseIds?: string[];
  preferredExercises?: string;
  avoidedExercises?: string;
  recoveryQuality?: AIProgramRecoveryQuality;
  sleepContext?: AIProgramSleepContext;
  stressContext?: AIProgramStressContext;
  inferredGoalClassification?: AIProgramGoalClassification;
  targetLiftPatterns?: AIProgramLiftPattern[];
  physiqueAnalysisUsed: boolean;
  physiqueAnalysisSummary?: AIProgramPhysiqueSummary;
  programInfluence?: ProgramInfluenceSummary;
  confidenceLevel: 'low' | 'medium' | 'high';
  missingInfo: AIProgramMissingInfo[];
  assumptions: string[];
  safetyFlags: AIProgramSafetyFlag[];
};

export type AIProgramScientificContext = {
  relevantEvidenceCategories: string[];
  uncertaintyNotes: string[];
  programmingConstraints: string[];
  riskFactors: string[];
  expectedAdaptationFocus: string[];
};

export type AIProgramUXContext = {
  entryPath: AIProgramEntryPath;
  completedSteps: AIProgramStepId[];
  skippedSteps: AIProgramStepId[];
  draftId: string;
  canResume: boolean;
  generationStatus: AIProgramGenerationStatus;
};

export type AIProgramDecisionContext = {
  userProfile: AIProgramUserProfileContext;
  scientific: AIProgramScientificContext;
  ux: AIProgramUXContext;
};

export type AIProgramDraft = {
  id: string;
  version: 1;
  entryPath: AIProgramEntryPath;
  startedAt: string;
  updatedAt: string;
  currentStep: AIProgramStepId;
  completedSteps: AIProgramStepId[];
  skippedSteps: AIProgramStepId[];
  answers: AIProgramAnswers;
  generationStatus: AIProgramGenerationStatus;
  validationCodes: AIProgramValidationCode[];
  cautionCodes: AIProgramValidationCode[];
  latestPhysiqueSummary?: AIProgramPhysiqueSummary;
  decisionContext?: AIProgramDecisionContext;
  decisionBlueprint?: AIProgramDecisionBlueprint;
};

export type AIProgramPhysiqueSeed = {
  result: PhysiqueAnalysisResult;
  createdAt: string;
  source: 'current_result';
};
