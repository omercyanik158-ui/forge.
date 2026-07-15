import type {
  ProgramTemplate,
  TemplateMuscleGroup,
  TemplateMovementPattern,
  TemplateVolumeReport,
} from "../types/programTemplate";

function addCount<T extends string>(
  target: Partial<Record<T, number>>,
  key: T,
  value: number,
): void {
  target[key] = Number(((target[key] ?? 0) + value).toFixed(2));
}

export function calculateTemplateVolumeReport(template: ProgramTemplate): TemplateVolumeReport {
  const directSetsByMuscle: Partial<Record<TemplateMuscleGroup, number>> = {};
  const indirectSetsByMuscle: Partial<Record<TemplateMuscleGroup, number>> = {};
  const frequencyByMuscle: Partial<Record<TemplateMuscleGroup, number>> = {};
  const movementPatternDistribution: Partial<Record<TemplateMovementPattern, number>> = {};
  let mainLiftFrequency = 0;
  let hingeFrequency = 0;
  let squatPatternFrequency = 0;
  let horizontalPush = 0;
  let horizontalPull = 0;
  let verticalPush = 0;
  let verticalPull = 0;

  template.workouts.forEach((workout) => {
    const musclesTouchedThisSession = new Set<TemplateMuscleGroup>();
    workout.exercises.forEach((exercise) => {
      addCount(movementPatternDistribution, exercise.movementPattern, 1);
      if (exercise.role === "main_lift") mainLiftFrequency += 1;
      if (exercise.movementPattern === "hinge") hingeFrequency += 1;
      if (exercise.movementPattern === "squat") squatPatternFrequency += 1;
      if (exercise.movementPattern === "horizontal_push") horizontalPush += 1;
      if (exercise.movementPattern === "horizontal_pull") horizontalPull += 1;
      if (exercise.movementPattern === "vertical_push") verticalPush += 1;
      if (exercise.movementPattern === "vertical_pull") verticalPull += 1;

      exercise.primaryMuscles.forEach((muscle) => {
        if (muscle === "unknown") return;
        addCount(directSetsByMuscle, muscle, exercise.sets);
        musclesTouchedThisSession.add(muscle);
      });
      exercise.secondaryMuscles.forEach((muscle) => {
        if (muscle === "unknown") return;
        addCount(indirectSetsByMuscle, muscle, exercise.sets * 0.5);
        musclesTouchedThisSession.add(muscle);
      });
    });
    musclesTouchedThisSession.forEach((muscle) => addCount(frequencyByMuscle, muscle, 1));
  });

  return {
    templateId: template.id,
    directSetsByMuscle,
    indirectSetsByMuscle,
    frequencyByMuscle,
    exercisesPerSession: template.workouts.map((workout) => workout.exercises.length),
    estimatedSessionMinutes: template.workouts.map((workout) => workout.estimatedMinutes),
    movementPatternDistribution,
    mainLiftFrequency,
    hingeFrequency,
    squatPatternFrequency,
    horizontalPushPullRatio: { horizontalPush, horizontalPull },
    verticalPushPullRatio: { verticalPush, verticalPull },
  };
}
