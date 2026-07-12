import { buildSessionVolumeBlueprint, priorityMuscleToBucket } from "@/services/aiProgramVolumeEngine";
import { assembleSessionPlan } from "@/services/aiProgramAssemblyEngine";
import { buildProgressionPlan } from "@/services/aiProgramProgressionEngine";
import { buildAIProgramExplanation } from "@/services/aiProgramExplanation";
import { validateAIProgramPlan } from "@/services/aiProgramValidator";
import type {
  AIDayPrescription,
  AIGeneratedWeek,
  AIProgramPlan,
  OrchestrationInput,
  OrchestrationOutput,
} from "@/types/aiProgramPlan";
import type { AIProgramExperience } from "@/types/aiProgram";
import type { WarmupItem } from "@/types";

function createPlanId(draftId: string): string {
  return `ai-program-${draftId}`;
}

function difficultyForExperience(experience?: AIProgramExperience): string {
  switch (experience) {
    case "beginner":
    case "returning":
      return "Başlangıç";
    case "intermediate":
      return "Orta";
    case "advanced":
      return "Zor";
    default:
      return "Orta";
  }
}

function goalLabel(goal?: string): string {
  switch (goal) {
    case "build_muscle":
      return "Kas Gelişimi";
    case "lose_fat":
      return "Yağ Kaybı";
    case "recomposition":
      return "Rekompozisyon";
    case "strength":
      return "Güç";
    case "athletic_performance":
      return "Atletik Performans";
    case "return_to_training":
      return "Ritme Dönüş";
    default:
      return "Genel Form";
  }
}

function buildPremiumPlanTitle(goal: string | undefined, splitLabel: string): string {
  return `${goalLabel(goal)} · ${splitLabel}`;
}

function inferAIWarmup(dayTitle: string): WarmupItem[] {
  const title = dayTitle.toLocaleLowerCase("tr-TR");
  if (title.includes("üst") || title.includes("itiş") || title.includes("çekiş")) {
    return [
      { title: "Omuz aktivasyonu", repsLabel: "15 tekrar" },
      { title: "Kol daireleri", repsLabel: "20 tekrar" },
      { title: "Kürek sabitleme", repsLabel: "12 tekrar" },
    ];
  }
  if (
    title.includes("alt") ||
    title.includes("bacak") ||
    title.includes("kalça") ||
    title.includes("zincir")
  ) {
    return [
      { title: "Kalça köprüsü", repsLabel: "12 tekrar" },
      { title: "Hamstring hazırlığı", repsLabel: "Her taraf 8" },
      { title: "Vücut ağırlığı squat", repsLabel: "12 tekrar" },
    ];
  }
  return [
    { title: "Dinamik mobilite", repsLabel: "2 tur" },
    { title: "Core aktivasyonu", repsLabel: "Her taraf 10" },
  ];
}

function normalizeAIDayTitle(title: string, dayIndex: number): string {
  const lower = title.toLocaleLowerCase("tr-TR");
  const upperLowerSuffix = String.fromCharCode(65 + Math.floor(dayIndex / 2));
  const flowSuffix = String.fromCharCode(65 + (dayIndex % 3));

  if (lower.includes("üst") || lower.includes("ãœst") || lower.includes("ust")) {
    return `Üst Vücut ${upperLowerSuffix}`;
  }
  if (lower.includes("alt")) {
    return `Alt Vücut ${upperLowerSuffix}`;
  }
  if (lower.includes("tüm") || lower.includes("tã¼m") || lower.includes("tam")) {
    return `Tüm Vücut ${flowSuffix}`;
  }

  return title;
}

function toDayPrescription(
  planId: string,
  weekIndex: number,
  day: import("@/types/aiProgramAssembly").AssembledDay,
  difficulty: string,
): AIDayPrescription {
  const id = `${planId}-w${weekIndex + 1}-d${day.dayIndex + 1}`;
  const exercises = day.exercises.map((exercise) => ({
    exerciseId: exercise.exerciseId,
    sets: exercise.sets,
    reps: exercise.reps,
    repLabel: exercise.repLabel,
    restSeconds: exercise.restSeconds,
    rir: exercise.rir,
    alternatives: exercise.alternatives,
  }));
  return {
    id,
    weekIndex,
    dayIndex: day.dayIndex,
    title: normalizeAIDayTitle(day.title, day.dayIndex),
    subtitle: day.bucketsCovered.join(", "),
    durationMin: day.estimatedDurationMin,
    difficulty,
    totalSets: day.totalSets,
    warmup: inferAIWarmup(day.title),
    exercises,
    exerciseIds: exercises.map((entry) => entry.exerciseId),
    notes: day.notes?.join(" ") ?? "",
  };
}

export function orchestrateAIProgram(input: OrchestrationInput): OrchestrationOutput {
  const { draftId, context, blueprint } = input;
  const profile = context.userProfile;

  const priorityBuckets = profile.priorityMuscles
    .map(priorityMuscleToBucket)
    .filter((bucket): bucket is NonNullable<typeof bucket> => bucket !== null);

  const volumeBlueprint = buildSessionVolumeBlueprint({
    volumeDirection: blueprint.volumeDirection,
    recommendedTrainingDays: blueprint.recommendedTrainingDays,
    sessionDurationMin: profile.sessionDuration ?? 60,
    experience: profile.experience ?? "intermediate",
    recoveryQuality: profile.recoveryQuality ?? "okay",
    priorityMuscles: priorityBuckets,
  });

  const assemblyPlan = assembleSessionPlan({
    split: blueprint.recommendedSplit,
    recommendedTrainingDays: blueprint.recommendedTrainingDays,
    volumeBlueprint,
    availableEquipment: profile.equipment,
    limitations: profile.painLimitations,
    goal: profile.goal ?? "general_fitness",
    sex: profile.sex,
  });

  const progressionPlan = buildProgressionPlan({
    baseDays: assemblyPlan.days,
    effort: volumeBlueprint.effort,
    experience: profile.experience ?? "intermediate",
    goal: profile.goal ?? "general_fitness",
  });

  const validation = validateAIProgramPlan({
    progression: progressionPlan,
    volumeBlueprint,
    limitations: profile.painLimitations,
    equipment: profile.equipment,
  });

  const explanation = buildAIProgramExplanation({
    context,
    blueprint,
    volumeBlueprint,
    assemblyPlan,
    progressionPlan,
  });

  const difficulty = difficultyForExperience(profile.experience);
  const planId = createPlanId(draftId);

  const weeks: AIGeneratedWeek[] = progressionPlan.weeks.map((week) => ({
    weekIndex: week.weekIndex,
    title: week.title,
    guidance: week.guidance,
    days: week.days.map((day) =>
      toDayPrescription(planId, week.weekIndex, day, difficulty),
    ),
    isDeload: week.isDeload,
  }));

  const plan: AIProgramPlan = {
    id: planId,
    version: 1,
    title: buildPremiumPlanTitle(profile.goal, blueprint.recommendedSplitLabel),
    subtitle: `${blueprint.recommendedTrainingDays} gün · ${progressionPlan.weekCount} hafta · ${difficulty}`,
    generatedAt: new Date().toISOString(),
    daysPerWeek: blueprint.recommendedTrainingDays,
    weekCount: progressionPlan.weekCount,
    trainingStyle: blueprint.recommendedSplitLabel,
    goal: profile.goal ?? "general_fitness",
    difficultyLevel: difficulty,
    weeks,
    explanation,
    validation,
    sourceBlueprint: blueprint,
    sourceVolume: volumeBlueprint,
    sourceAssembly: assemblyPlan,
    sourceProgression: progressionPlan,
    sourceContextSummary: {
      entryPath: context.ux.entryPath,
      mainGoal: profile.goal ?? "unknown",
      experience: profile.experience ?? "unknown",
      recoveryQuality: profile.recoveryQuality ?? "unknown",
      priorityMuscles: profile.priorityMuscles,
      painLimitations: profile.painLimitations,
      physiqueAnalysisUsed: profile.physiqueAnalysisUsed,
      confidence: profile.confidenceLevel,
    },
  };

  return {
    plan,
    volumeBlueprint,
    assemblyPlan,
    progressionPlan,
    validation,
    explanation,
  };
}
