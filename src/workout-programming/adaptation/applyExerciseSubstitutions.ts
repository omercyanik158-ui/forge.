import { FORGE_EXERCISE_SUBSTITUTIONS } from '../generated/substitutions.generated';

export function getDeterministicSubstitutionCandidates(canonicalExerciseId: string) {
  return FORGE_EXERCISE_SUBSTITUTIONS
    .filter((item) => item.sourceExerciseId === canonicalExerciseId)
    .sort((left, right) => left.deterministicRank - right.deterministicRank);
}
