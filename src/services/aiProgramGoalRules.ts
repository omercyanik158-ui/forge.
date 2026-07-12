import type { AIProgramDecisionProfile, AIProgramRuleResult } from '@/types/aiProgramDecision';

export function buildGoalStrategyRules(profile: AIProgramDecisionProfile): AIProgramRuleResult {
  switch (profile.goal) {
    case 'build_muscle':
      return {
        lines: [
          'Bias weekly structure toward recoverable hypertrophy volume and stable progression.',
          'Keep effort mostly moderate-to-high while avoiding junk volume and unnecessary fatigue spikes.',
        ],
        splitBias: {
          upper_lower: 2,
          torso_limbs: 2,
          hybrid: 2,
          push_pull_legs: 1,
          body_part_emphasis: 1,
        },
        volumeDirection: profile.recoveryQuality === 'great' ? 'moderate_high' : 'moderate',
      };
    case 'lose_fat':
      return {
        lines: [
          'Use the structure to preserve muscle and strength while keeping recovery realistic for a diet phase.',
          'Avoid chasing high volume if sleep, stress, or recovery are already weak.',
        ],
        splitBias: {
          full_body: 2,
          upper_lower: 1,
          hybrid: 2,
          body_part_emphasis: -2,
        },
        volumeDirection: profile.recoveryQuality === 'poor' ? 'conservative' : 'moderate',
      };
    case 'recomposition':
      return {
        lines: [
          'Favor balanced hypertrophy and consistency rather than extreme specialization.',
          'Use moderate volume with recovery-aware progression and repeatable execution.',
        ],
        splitBias: {
          full_body: 1,
          upper_lower: 2,
          hybrid: 2,
          torso_limbs: 1,
        },
        volumeDirection: 'moderate',
      };
    case 'strength':
      return {
        lines: [
          'Prioritize lift practice, movement specificity, and recoverable heavier loading exposure.',
          'Reduce non-essential fatigue so technique quality and progression stay stable.',
        ],
        splitBias: {
          full_body: 2,
          upper_lower: 3,
          hybrid: 1,
          body_part_emphasis: -3,
        },
        volumeDirection: 'moderate',
      };
    case 'athletic_performance':
      return {
        lines: [
          'Keep movement quality and freshness high enough to support future athletic work.',
          'Avoid structures that create excessive soreness or unnecessary local fatigue.',
        ],
        splitBias: {
          full_body: 2,
          upper_lower: 1,
          hybrid: 2,
          body_part_emphasis: -2,
        },
        volumeDirection: 'moderate',
      };
    case 'general_fitness':
      return {
        lines: [
          'Choose the lowest-friction structure that supports balanced full-body training.',
          'Sustainability and adherence matter more than specialization.',
        ],
        splitBias: {
          full_body: 3,
          hybrid: 2,
          minimalist_home: 2,
          body_part_emphasis: -3,
        },
        volumeDirection: 'conservative',
      };
    case 'return_to_training':
      return {
        lines: [
          'Start with a conservative re-entry structure and rebuild consistency before pushing volume.',
          'Use extra recovery buffer instead of trying to match old capacity immediately.',
        ],
        splitBias: {
          full_body: 3,
          upper_lower: 1,
          hybrid: 1,
          push_pull_legs: -2,
          body_part_emphasis: -3,
        },
        volumeDirection: 'conservative',
      };
    default:
      return {
        lines: [
          'Use a conservative default until the primary goal is fully confirmed.',
        ],
        volumeDirection: 'conservative',
      };
  }
}
