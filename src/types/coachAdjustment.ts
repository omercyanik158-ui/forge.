import type { AIProgramPainLimitation } from './aiProgram';

export type CoachAdjustmentDecision =
  | 'maintain'
  | 'progress'
  | 'reduce_volume'
  | 'reduce_intensity'
  | 'deload'
  | 'swap_exercise'
  | 'repeat_week';

export type CoachAdjustmentReason =
  | 'high_rpe_trend'
  | 'poor_recovery'
  | 'pain_reported'
  | 'plateau_detected'
  | 'strong_progress'
  | 'cycle_lighter'
  | 'physique_focus'
  | 'insufficient_data';

export type CoachAdjustment = {
  id: string;
  planId?: string;
  programDayId?: string;
  createdAt: string;
  decision: CoachAdjustmentDecision;
  reasons: CoachAdjustmentReason[];
  title: string;
  summary: string;
  nextSessionFocus: string;
  confidence: 'low' | 'medium' | 'high';
  affectedExerciseIds: string[];
  painReported: AIProgramPainLimitation[];
};

export type WeeklyCoachReview = {
  id: string;
  createdAt: string;
  planId?: string;
  observed: string;
  adjustment: string;
  rationale: string;
  nextFocus: string;
  latestAdjustment?: CoachAdjustment;
};
