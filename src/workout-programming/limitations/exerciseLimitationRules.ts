import type { ForgeGeneratedExercise } from '@/workout-programming/types/csvWorkoutBrain';

export type CanonicalLimitation =
  | 'knee_pain'
  | 'lower_back_pain'
  | 'shoulder_pain'
  | 'elbow_pain'
  | 'wrist_pain'
  | 'hip_pain'
  | 'ankle_pain'
  | 'overhead_restriction'
  | 'deep_knee_flexion_restriction'
  | 'spinal_loading_restriction';

export type ExerciseLimitationRule = {
  exerciseId: string;
  conflictsWith: CanonicalLimitation[];
  reviewedSubstitutions?: Partial<Record<CanonicalLimitation, string[]>>;
};

const NONE_VALUES = new Set(['none', 'no_limitations', 'no limitation', 'no limitations', 'yok', 'hayır', '']);

const LIMITATION_ALIASES: Record<string, CanonicalLimitation> = {
  knee: 'knee_pain',
  knee_pain: 'knee_pain',
  'knee pain': 'knee_pain',
  'diz ağrısı': 'knee_pain',
  'diz agrisi': 'knee_pain',
  'diz problemi': 'knee_pain',
  lower_back: 'lower_back_pain',
  lower_back_pain: 'lower_back_pain',
  'lower back pain': 'lower_back_pain',
  back_pain: 'lower_back_pain',
  'bel ağrısı': 'lower_back_pain',
  'bel agrisi': 'lower_back_pain',
  'bel problemi': 'lower_back_pain',
  shoulder: 'shoulder_pain',
  shoulder_pain: 'shoulder_pain',
  'shoulder pain': 'shoulder_pain',
  'omuz ağrısı': 'shoulder_pain',
  'omuz agrisi': 'shoulder_pain',
  'omuz problemi': 'shoulder_pain',
  elbow: 'elbow_pain',
  elbow_pain: 'elbow_pain',
  'dirsek ağrısı': 'elbow_pain',
  'dirsek agrisi': 'elbow_pain',
  wrist: 'wrist_pain',
  wrist_pain: 'wrist_pain',
  'el bileği ağrısı': 'wrist_pain',
  'el bilegi agrisi': 'wrist_pain',
  hip: 'hip_pain',
  hip_pain: 'hip_pain',
  'kalça ağrısı': 'hip_pain',
  'kalca agrisi': 'hip_pain',
  ankle: 'ankle_pain',
  ankle_pain: 'ankle_pain',
  'ayak bileği ağrısı': 'ankle_pain',
  'ayak bilegi agrisi': 'ankle_pain',
  overhead_restriction: 'overhead_restriction',
  'overhead restriction': 'overhead_restriction',
  'baş üstü hareket yapamıyorum': 'overhead_restriction',
  'bas ustu hareket yapamiyorum': 'overhead_restriction',
  'baş üstü': 'overhead_restriction',
  'bas ustu': 'overhead_restriction',
  deep_knee_flexion_restriction: 'deep_knee_flexion_restriction',
  'deep knee flexion restriction': 'deep_knee_flexion_restriction',
  'derin squat yapamıyorum': 'deep_knee_flexion_restriction',
  'derin squat yapamiyorum': 'deep_knee_flexion_restriction',
  spinal_loading_restriction: 'spinal_loading_restriction',
  'spinal loading restriction': 'spinal_loading_restriction',
  'omurga yükleme': 'spinal_loading_restriction',
  'omurga yukleme': 'spinal_loading_restriction',
};

export const EXERCISE_LIMITATION_RULES: ExerciseLimitationRule[] = [
  {
    exerciseId: 'back_squat',
    conflictsWith: ['knee_pain', 'deep_knee_flexion_restriction', 'lower_back_pain', 'spinal_loading_restriction'],
    reviewedSubstitutions: {
      knee_pain: ['leg_press', 'hack_squat'],
      deep_knee_flexion_restriction: ['leg_press'],
      lower_back_pain: ['leg_press', 'hack_squat'],
    },
  },
  {
    exerciseId: 'front_squat',
    conflictsWith: ['knee_pain', 'deep_knee_flexion_restriction', 'lower_back_pain', 'spinal_loading_restriction'],
    reviewedSubstitutions: {
      knee_pain: ['leg_press'],
      deep_knee_flexion_restriction: ['leg_press'],
      lower_back_pain: ['leg_press'],
    },
  },
  {
    exerciseId: 'conventional_deadlift',
    conflictsWith: ['lower_back_pain', 'spinal_loading_restriction'],
    reviewedSubstitutions: {
      lower_back_pain: ['trap_bar_deadlift'],
    },
  },
  {
    exerciseId: 'romanian_deadlift',
    conflictsWith: ['lower_back_pain', 'spinal_loading_restriction'],
    reviewedSubstitutions: {
      lower_back_pain: ['dumbbell_rdl'],
    },
  },
  {
    exerciseId: 'overhead_press',
    conflictsWith: ['shoulder_pain', 'overhead_restriction'],
    reviewedSubstitutions: {
      overhead_restriction: ['machine_chest_press'],
    },
  },
  {
    exerciseId: 'dumbbell_shoulder_press',
    conflictsWith: ['shoulder_pain', 'overhead_restriction'],
    reviewedSubstitutions: {
      overhead_restriction: ['machine_chest_press'],
    },
  },
  {
    exerciseId: 'machine_shoulder_press',
    conflictsWith: ['shoulder_pain', 'overhead_restriction'],
    reviewedSubstitutions: {
      overhead_restriction: ['machine_chest_press'],
    },
  },
  {
    exerciseId: 'skull_crusher',
    conflictsWith: ['elbow_pain'],
  },
  {
    exerciseId: 'ab_wheel',
    conflictsWith: ['lower_back_pain'],
  },
];

export function normalizeLimitationValue(value: string): CanonicalLimitation | null {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, ' ');
  if (NONE_VALUES.has(normalized)) return null;
  return LIMITATION_ALIASES[normalized] ?? null;
}

export function normalizeLimitations(values: string[]): CanonicalLimitation[] {
  return [...new Set(values.map(normalizeLimitationValue).filter((value): value is CanonicalLimitation => value !== null))]
    .sort((left, right) => left.localeCompare(right));
}

export function getExerciseLimitationRule(exerciseId: string): ExerciseLimitationRule | undefined {
  return EXERCISE_LIMITATION_RULES.find((rule) => rule.exerciseId === exerciseId);
}

export function getExerciseLimitationConflicts(exercise: Pick<ForgeGeneratedExercise, 'canonicalExerciseId'>, limitations: string[]): CanonicalLimitation[] {
  const normalized = normalizeLimitations(limitations);
  const rule = getExerciseLimitationRule(exercise.canonicalExerciseId);
  if (!rule) return [];
  return normalized.filter((limitation) => rule.conflictsWith.includes(limitation));
}

