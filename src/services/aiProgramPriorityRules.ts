import {
  LOWER_BODY_PRIORITY_MUSCLES,
  UPPER_BODY_PRIORITY_MUSCLES,
  type AIProgramDecisionProfile,
  type AIProgramRuleResult,
} from '@/types/aiProgramDecision';

export function buildPriorityMuscleRules(profile: AIProgramDecisionProfile): AIProgramRuleResult {
  if (profile.priorityMuscles.length === 0 || profile.priorityMuscles.includes('full_body_balance')) {
    return {
      lines: [
        'Keep a balanced structure because no narrow specialization demand clearly outweighs full-body development.',
      ],
      splitBias: {
        full_body: 1,
        upper_lower: 1,
      },
    };
  }

  const upperCount = profile.priorityMuscles.filter((item) => UPPER_BODY_PRIORITY_MUSCLES.includes(item)).length;
  const lowerCount = profile.priorityMuscles.filter((item) => LOWER_BODY_PRIORITY_MUSCLES.includes(item)).length;

  const lines = [
    `Priority muscles should receive earlier placement, cleaner fatigue management, and slightly higher weekly attention: ${profile.priorityMuscles.join(', ')}.`,
    'Priority emphasis must not erase leg training, joint tolerance, or overall push-pull balance.',
  ];

  const splitBias: AIProgramRuleResult['splitBias'] = {};
  if (upperCount >= 2) {
    splitBias.torso_limbs = 2;
    splitBias.hybrid = 2;
    splitBias.upper_lower = 1;
  }
  if (lowerCount >= 2) {
    splitBias.upper_lower = 2;
    splitBias.anterior_posterior = 2;
    splitBias.hybrid = 1;
  }
  if (profile.priorityMuscles.length === 3) {
    lines.push('Three priorities reduce confidence slightly, so specialization should stay measured rather than extreme.');
    splitBias.body_part_emphasis = -1;
  }
  if (profile.recoveryQuality === 'poor') {
    lines.push('Poor recovery limits how much extra priority volume can be added at the start.');
    splitBias.body_part_emphasis = (splitBias.body_part_emphasis ?? 0) - 2;
  }

  return {
    lines,
    splitBias,
  };
}
