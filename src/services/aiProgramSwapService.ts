import { getExerciseById } from "./exerciseCatalog";
import {
  getExerciseMeta,
  getReplacementsFor,
  isPreferredForLimitation,
} from "./exerciseKB";
import type { ExerciseLibraryItem } from "@/types";
import type {
  AIProgramEquipmentKey,
  AIProgramPainLimitation,
} from "@/types/aiProgram";
import type { ExerciseProgrammingMeta, MuscleRole } from "@/types/exerciseKB";

export type SwapOption = {
  exerciseId: string;
  displayName: string;
  muscleGroup: string;
  targetLabel: string;
  isPreferredForLimitation: boolean;
  why: string;
};

export type SwapInput = {
  exerciseId: string;
  availableEquipment: AIProgramEquipmentKey[];
  limitations: AIProgramPainLimitation[];
  excludeExerciseIds?: string[];
  fallbackExerciseIds?: string[];
};

export function getSwapOptions(input: SwapInput): SwapOption[] {
  const {
    exerciseId,
    availableEquipment,
    limitations,
    excludeExerciseIds = [],
    fallbackExerciseIds = [],
  } = input;
  const excluded = new Set([exerciseId, ...excludeExerciseIds]);
  const sourceMeta = getExerciseMeta(exerciseId);
  const sourceCatalog = getExerciseById(exerciseId);
  const hasPain = limitations.some((item) => item !== "none" && item !== "other");

  const knowledgeBaseOptions = getReplacementsFor(
    exerciseId,
    availableEquipment,
    limitations,
  )
    .filter((meta) => !excluded.has(meta.exerciseId))
    .filter((meta) => isStrictSwapMatch(sourceMeta, meta))
    .map((meta) => {
      const catalog = getExerciseById(meta.exerciseId);
      const preferred = hasPain && isPreferredForLimitation(meta, limitations);
      const whyParts = [formatPatternReason(meta.pattern)];
      if (meta.category === "compound") whyParts.push("çok eklemli");
      if (meta.stimulusToFatigue === "low") whyParts.push("düşük yorgunluk");
      if (preferred) whyParts.push("bildirilen hassas bölge için daha uygun");

      return {
        exerciseId: meta.exerciseId,
        displayName: catalog?.displayName ?? meta.exerciseId.replaceAll("_", " "),
        muscleGroup: catalog?.muscleGroup ?? "—",
        targetLabel: formatTargetLabel(meta.primaryMuscles[0]),
        isPreferredForLimitation: preferred,
        why: whyParts.join("; "),
      };
    });

  const uniqueKnowledgeBaseOptions = uniqueOptions(knowledgeBaseOptions);
  if (uniqueKnowledgeBaseOptions.length > 0) return uniqueKnowledgeBaseOptions;

  return uniqueOptions(
    fallbackExerciseIds
      .filter((id) => !excluded.has(id))
      .map((id) => getExerciseById(id))
      .filter((item): item is ExerciseLibraryItem => !!item)
      .filter((item) => isCatalogFallbackSimilar(sourceMeta, sourceCatalog, item))
      .map((item) => ({
        exerciseId: item.id,
        displayName: item.displayName,
        muscleGroup: item.muscleGroup,
        targetLabel: item.muscleGroup,
        isPreferredForLimitation: false,
        why: "aynı bölgeye yakın alternatif",
      })),
  );
}

export function canSwap(input: SwapInput): boolean {
  return getSwapOptions(input).length > 0;
}

export function getSourceExerciseContext(exerciseId: string): {
  displayName: string;
  muscleGroup: string;
  pattern: string | null;
} {
  const catalog = getExerciseById(exerciseId);
  const meta = getExerciseMeta(exerciseId);
  return {
    displayName: catalog?.displayName ?? exerciseId.replaceAll("_", " "),
    muscleGroup: catalog?.muscleGroup ?? "—",
    pattern: meta ? meta.pattern : null,
  };
}

function uniqueOptions(options: SwapOption[]): SwapOption[] {
  const seen = new Set<string>();
  return options.filter((option) => {
    if (seen.has(option.exerciseId)) return false;
    seen.add(option.exerciseId);
    return true;
  });
}

function isCatalogFallbackSimilar(
  sourceMeta: ExerciseProgrammingMeta | undefined,
  source: ExerciseLibraryItem | undefined,
  candidate: ExerciseLibraryItem,
): boolean {
  if (!source) return true;
  if (candidate.muscleGroup !== source.muscleGroup) return false;
  const candidateMeta = getExerciseMeta(candidate.id);
  if (sourceMeta && candidateMeta && !isStrictSwapMatch(sourceMeta, candidateMeta)) {
    return false;
  }
  const sourceTargets = new Set(source.targetMuscles);
  return candidate.targetMuscles.some((muscle) => sourceTargets.has(muscle));
}

function isStrictSwapMatch(
  source: ExerciseProgrammingMeta | undefined,
  candidate: ExerciseProgrammingMeta,
): boolean {
  if (!source) return true;
  if (candidate.pattern !== source.pattern) return false;

  if (source.pattern === "horizontal_push") {
    if ((source.angleVariant ?? "flat") !== (candidate.angleVariant ?? "flat")) {
      return false;
    }
    const sourceChestRole = source.primaryMuscles.find(isChestRole);
    if (sourceChestRole && !candidate.primaryMuscles.includes(sourceChestRole)) {
      return false;
    }
  }

  return candidate.primaryMuscles.some((muscle) =>
    source.primaryMuscles.includes(muscle),
  );
}

function isChestRole(role: MuscleRole): boolean {
  return role === "upper_chest" || role === "mid_chest" || role === "lower_chest";
}

function formatTargetLabel(role: MuscleRole | undefined): string {
  switch (role) {
    case "upper_chest":
      return "Üst göğüs";
    case "mid_chest":
      return "Orta göğüs";
    case "lower_chest":
      return "Alt göğüs";
    case "front_delts":
      return "Ön omuz";
    case "side_delts":
      return "Yan omuz";
    case "rear_delts":
      return "Arka omuz";
    case "upper_back":
      return "Üst sırt";
    case "lats":
      return "Kanat";
    case "triceps":
      return "Triceps";
    case "biceps":
      return "Biceps";
    case "quads":
    case "quads_rectus":
    case "quads_vastus":
      return "Ön bacak";
    case "hamstrings":
      return "Arka bacak";
    case "glutes":
      return "Kalça";
    case "calves":
    case "gastrocnemius":
    case "soleus":
      return "Baldır";
    case "abs":
    case "upper_abs":
    case "obliques":
      return "Core";
    case "lower_back":
      return "Bel";
    default:
      return "Aynı bölge";
  }
}

function formatPatternReason(pattern: string): string {
  switch (pattern) {
    case "horizontal_push":
      return "aynı yatay press paterni";
    case "vertical_push":
      return "aynı dikey press paterni";
    case "horizontal_pull":
      return "aynı row paterni";
    case "vertical_pull":
      return "aynı dikey çekiş paterni";
    case "squat_pattern":
      return "aynı squat/diz dominant patern";
    case "hinge_pattern":
      return "aynı kalça menteşe paterni";
    case "lunge_pattern":
      return "aynı tek taraflı bacak paterni";
    case "elbow_flexion":
      return "aynı biceps curl paterni";
    case "elbow_extension":
      return "aynı triceps extension paterni";
    default:
      return "aynı hareket paterni";
  }
}
