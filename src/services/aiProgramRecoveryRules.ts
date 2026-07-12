import type { AIProgramDecisionProfile, AIProgramRuleResult } from '@/types/aiProgramDecision';

export function buildRecoveryAdjustedRules(profile: AIProgramDecisionProfile): AIProgramRuleResult {
  if (profile.recoveryQuality === 'poor') {
    return {
      lines: [
        'Start with lower volume, fewer near-failure exposures, and a simpler progression path.',
        'Prefer conservative structures that distribute fatigue cleanly and avoid 6-day aggressiveness.',
      ],
      splitBias: {
        full_body: 2,
        upper_lower: 2,
        minimalist_home: 2,
        push_pull_legs: -3,
        body_part_emphasis: -4,
      },
      maxRecommendedDays: 4,
      volumeDirection: 'conservative',
    };
  }

  if (profile.recoveryQuality === 'okay') {
    return {
      lines: [
        'Use normal progression and moderate volume without assuming unlimited fatigue tolerance.',
        'Specialization can exist, but only if weekly structure remains recoverable.',
      ],
      splitBias: {
        upper_lower: 1,
        hybrid: 1,
      },
      maxRecommendedDays: 5,
      volumeDirection: 'moderate',
    };
  }

  if (profile.recoveryQuality === 'great') {
    return {
      lines: [
        'A slightly more aggressive progression path is available, but still within recoverable boundaries.',
        'Extra specialization is acceptable only when frequency, fatigue, and adherence still balance well.',
      ],
      splitBias: {
        torso_limbs: 1,
        push_pull_legs: 1,
        body_part_emphasis: 1,
      },
      maxRecommendedDays: 6,
      volumeDirection: 'moderate_high',
    };
  }

  return {
    lines: [
      'Recovery markers are incomplete, so the starting structure should stay conservative.',
    ],
    maxRecommendedDays: 4,
    volumeDirection: 'conservative',
  };
}
