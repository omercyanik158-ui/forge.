import type {
  AIProgramFamily,
  AIProgramGoalClassification,
  AIProgramLiftPattern,
  AIProgramUserProfileContext,
} from '@/types/aiProgram';

export type GoalClassificationResult = {
  programFamily: AIProgramFamily;
  goalClassification: AIProgramGoalClassification;
  targetLiftPatterns: AIProgramLiftPattern[];
  rationale: string[];
};

function inferTargetLifts(profile: AIProgramUserProfileContext): AIProgramLiftPattern[] {
  const haystack = [
    profile.preferredExercises ?? '',
    profile.avoidedExercises ?? '',
    ...(profile.preferredExerciseIds ?? []),
  ].join(' ').toLocaleLowerCase('en-US');
  const lifts = new Set<AIProgramLiftPattern>();
  if (haystack.includes('bench')) lifts.add('bench');
  if (haystack.includes('squat')) lifts.add('squat');
  if (haystack.includes('deadlift') || haystack.includes('rdl')) lifts.add('deadlift');
  if (haystack.includes('overhead') || haystack.includes('shoulder press')) lifts.add('press');
  if (haystack.includes('row')) lifts.add('row');
  if (haystack.includes('pullup') || haystack.includes('pulldown')) lifts.add('pullup');
  return [...lifts];
}

export function classifyProgramGoal(profile: AIProgramUserProfileContext): GoalClassificationResult {
  const targetLiftPatterns = profile.targetLiftPatterns?.length ? profile.targetLiftPatterns : inferTargetLifts(profile);
  const rationale: string[] = [];

  if (profile.goal === 'strength') {
    if (targetLiftPatterns.some((lift) => lift === 'squat' || lift === 'bench' || lift === 'deadlift')) {
      if (targetLiftPatterns.length >= 2) {
        rationale.push('Birden fazla ana kaldırış sinyali olduğu için powerlifting-strength yönü seçildi.');
        return {
          programFamily: 'strength',
          goalClassification: 'powerlifting_strength',
          targetLiftPatterns,
          rationale,
        };
      }
      rationale.push('Belirli bir ana kaldırış odağı görüldüğü için lift-specific strength seçildi.');
      return {
        programFamily: 'strength',
        goalClassification: 'lift_specific_strength',
        targetLiftPatterns,
        rationale,
      };
    }
    rationale.push('Strength hedefi genel kuvvet odağına eşlendi.');
    return {
      programFamily: 'strength',
      goalClassification: 'general_strength',
      targetLiftPatterns,
      rationale,
    };
  }

  if (profile.goal === 'build_muscle' && profile.secondaryGoal === 'strength') {
    rationale.push('Kas gelişimi yanında strength ikincil hedefi olduğu için powerbuilding yönü seçildi.');
    return {
      programFamily: 'powerbuilding',
      goalClassification: 'powerbuilding',
      targetLiftPatterns,
      rationale,
    };
  }

  if (profile.goal === 'build_muscle') {
    if (profile.priorityMuscles.length >= 1) {
      rationale.push('Belirgin kas önceliği olduğu için muscle specialization sınıfı seçildi.');
      return {
        programFamily: 'hypertrophy',
        goalClassification: 'muscle_specialization',
        targetLiftPatterns,
        rationale,
      };
    }
    rationale.push('Build muscle hedefi genel hypertrophy olarak sınıflandırıldı.');
    return {
      programFamily: 'hypertrophy',
      goalClassification: 'hypertrophy',
      targetLiftPatterns,
      rationale,
    };
  }

  if (profile.goal === 'recomposition') {
    rationale.push('Recomposition hedefi yağ kaybı sırasında strength retention odaklı sınıflandırıldı.');
    return {
      programFamily: 'general_fitness',
      goalClassification: 'fat_loss_strength_retention',
      targetLiftPatterns,
      rationale,
    };
  }

  rationale.push('Hedef daha genel ve güvenli olduğu için general fitness sınıfı seçildi.');
  return {
    programFamily: profile.goal === 'athletic_performance' ? 'strength' : 'general_fitness',
    goalClassification: 'general_fitness',
    targetLiftPatterns,
    rationale,
  };
}
