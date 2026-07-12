import type { AIProgramDecisionConfidence, AIProgramDecisionProfile } from '@/types/aiProgramDecision';

export type AIProgramDecisionOverrides = {
  recommendedTrainingDays: number;
  safetyConstraints: string[];
  confidencePenalties: string[];
};

export function buildDecisionSafetyOverrides(profile: AIProgramDecisionProfile): AIProgramDecisionOverrides {
  let recommendedTrainingDays = profile.trainingDays ?? 3;
  const safetyConstraints: string[] = [];
  const confidencePenalties: string[] = [];

  if (profile.experience === 'beginner' && recommendedTrainingDays >= 6) {
    recommendedTrainingDays = 4;
    safetyConstraints.push('FORGE should start below 6 days because beginner skill and recovery are not yet stable enough for a high-frequency split.');
    confidencePenalties.push('The requested training frequency is aggressive for a beginner.');
  }

  if (profile.experience === 'returning' && recommendedTrainingDays >= 6) {
    recommendedTrainingDays = Math.min(recommendedTrainingDays, 4);
    safetyConstraints.push('A returning lifter should rebuild workload gradually instead of matching past capacity immediately.');
    confidencePenalties.push('Recent training tolerance is uncertain after time away.');
  }

  if (profile.recoveryQuality === 'poor' && recommendedTrainingDays >= 5) {
    recommendedTrainingDays = Math.min(recommendedTrainingDays, 4);
    safetyConstraints.push('Poor recovery requires a lower starting frequency and simpler fatigue management.');
    confidencePenalties.push('Poor recovery lowers certainty around aggressive weekly structure.');
  }

  if (profile.goal === 'lose_fat' && profile.recoveryQuality === 'poor') {
    safetyConstraints.push('Diet-phase recovery should favor muscle retention and adherence over maximum training volume.');
  }

  if (profile.painLimitations.some((item) => item !== 'none')) {
    safetyConstraints.push('Reported pain or limitations require conservative future exercise selection and progression choices.');
    confidencePenalties.push('Pain information adds uncertainty until exercise tolerance is tested gradually.');
  }

  if (profile.painLimitations.includes('other')) {
    confidencePenalties.push('An unspecified limitation lowers confidence because the exact loading issue is unclear.');
  }

  if (!profile.experience) confidencePenalties.push('Training age is incomplete.');
  if (!profile.recoveryQuality) confidencePenalties.push('Recovery quality is incomplete.');
  if (profile.priorityMuscles.length >= 3) confidencePenalties.push('Three priority muscles increase complexity and reduce decision certainty.');
  if (profile.physiqueAnalysisUsed && !profile.experience) confidencePenalties.push('Physique context is present without full training-age context.');

  return {
    recommendedTrainingDays,
    safetyConstraints,
    confidencePenalties,
  };
}

export function evaluateDecisionConfidence(
  profile: AIProgramDecisionProfile,
  penalties: string[],
): { confidence: AIProgramDecisionConfidence; rationale: string[] } {
  const rationale: string[] = [];

  if (profile.missingInfo.some((item) => item.level === 'critical')) {
    rationale.push('Critical profile information is still missing.');
    return { confidence: 'low', rationale };
  }

  rationale.push('Primary goal, schedule, and equipment are defined.');

  if (penalties.length >= 3) {
    rationale.push(...penalties.slice(0, 3));
    return { confidence: 'low', rationale };
  }

  if (penalties.length > 0 || profile.missingInfo.some((item) => item.level === 'important')) {
    rationale.push(...penalties.slice(0, 2));
    if (profile.missingInfo.some((item) => item.level === 'important')) {
      rationale.push('Some important context is still incomplete, so the structure stays conservative.');
    }
    return { confidence: 'medium', rationale };
  }

  rationale.push('Recovery, experience, and priorities are sufficiently clear for a personalized starting structure.');
  return { confidence: 'high', rationale };
}
