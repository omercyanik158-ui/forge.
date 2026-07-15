import { describe, expect, it } from "vitest";
import { hasExercise } from "@/services/exerciseCatalog";
import {
  PROGRAM_TEMPLATE_REGISTRY,
  calculateTemplateVolumeReport,
  validateProgramTemplate,
  validateProgramTemplateRegistry,
} from "@/workout-programming";
import type { ProgramTemplate } from "@/workout-programming";

function roleRank(role: ProgramTemplate["workouts"][number]["exercises"][number]["role"]): number {
  const ranks = {
    mobility: 0,
    main_lift: 1,
    secondary_compound: 2,
    accessory_compound: 3,
    isolation: 4,
    core: 5,
    conditioning: 6,
  } as const;
  return ranks[role];
}

describe("FORGE program template registry", () => {
  it("contains the Phase 2 active template coverage", () => {
    expect(PROGRAM_TEMPLATE_REGISTRY).toHaveLength(28);
  });

  it("is sorted by stable template ID", () => {
    const ids = PROGRAM_TEMPLATE_REGISTRY.map((template) => template.id);
    expect(ids).toEqual([...ids].sort((left, right) => left.localeCompare(right)));
  });

  it("has unique IDs and valid versions", () => {
    const ids = PROGRAM_TEMPLATE_REGISTRY.map((template) => template.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const template of PROGRAM_TEMPLATE_REGISTRY) {
      expect(template.version).toBeGreaterThanOrEqual(1);
      expect(template.status).toBe("active");
      expect(template.id).toMatch(/^forge_/);
    }
  });

  it("does not expose mutable template objects", () => {
    const first = PROGRAM_TEMPLATE_REGISTRY[0]!;
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.workouts)).toBe(true);
    expect(Object.isFrozen(first.workouts[0])).toBe(true);
  });
});

describe("FORGE program template validation", () => {
  it("passes every active template through the validator without errors", () => {
    const registryResult = validateProgramTemplateRegistry([...PROGRAM_TEMPLATE_REGISTRY]);
    expect(registryResult.errors).toEqual([]);
  });

  it.each(PROGRAM_TEMPLATE_REGISTRY.map((template) => [template.id, template] as const))(
    "%s is structurally valid",
    (_templateId, template) => {
      const result = validateProgramTemplate(template);
      expect(result.errors).toEqual([]);
      expect(template.workouts).toHaveLength(template.daysPerWeek);
      expect(template.progressionConfig).toBeTruthy();
    },
  );

  it("uses only exercise IDs that exist in the current exercise catalog", () => {
    for (const template of PROGRAM_TEMPLATE_REGISTRY) {
      for (const workout of template.workouts) {
        for (const exercise of workout.exercises) {
          expect(hasExercise(exercise.exerciseId), `${template.id} -> ${exercise.exerciseId}`).toBe(true);
        }
      }
    }
  });

  it("keeps workout days ordered and sessions duplicate-free", () => {
    for (const template of PROGRAM_TEMPLATE_REGISTRY) {
      expect(template.workouts.map((workout) => workout.dayIndex)).toEqual(
        Array.from({ length: template.daysPerWeek }, (_, index) => index + 1),
      );
      for (const workout of template.workouts) {
        const ids = workout.exercises.map((exercise) => exercise.exerciseId);
        expect(new Set(ids).size, `${template.id} day ${workout.dayIndex}`).toBe(ids.length);
        expect(workout.exercises.map((exercise) => exercise.order)).toEqual(
          Array.from({ length: workout.exercises.length }, (_, index) => index + 1),
        );
      }
    }
  });

  it("keeps main lifts before accessory and isolation work", () => {
    for (const template of PROGRAM_TEMPLATE_REGISTRY) {
      for (const workout of template.workouts) {
        const ranks = workout.exercises.map((exercise) => roleRank(exercise.role));
        expect(ranks, `${template.id} day ${workout.dayIndex}`).toEqual([...ranks].sort((left, right) => left - right));
      }
    }
  });
});

describe("FORGE template goal-specific standards", () => {
  it("strength templates have appropriate main-lift structure", () => {
    const strengthTemplates = PROGRAM_TEMPLATE_REGISTRY.filter((template) => template.goal === "strength");
    expect(strengthTemplates).toHaveLength(8);
    for (const template of strengthTemplates) {
      const report = calculateTemplateVolumeReport(template);
      expect(report.mainLiftFrequency).toBeGreaterThanOrEqual(template.daysPerWeek);
      const mainLiftRepMaxes = template.workouts.flatMap((workout) =>
        workout.exercises
          .filter((exercise) => exercise.role === "main_lift")
          .map((exercise) => exercise.reps.type === "fixed" ? exercise.reps.value : exercise.reps.max),
      );
      expect(Math.max(...mainLiftRepMaxes)).toBeLessThanOrEqual(6);
    }
  });

  it("hypertrophy templates contain appropriate volume work", () => {
    const hypertrophyTemplates = PROGRAM_TEMPLATE_REGISTRY.filter((template) => template.goal === "hypertrophy");
    expect(hypertrophyTemplates).toHaveLength(10);
    for (const template of hypertrophyTemplates) {
      const report = calculateTemplateVolumeReport(template);
      const totalChest = (report.directSetsByMuscle.chest ?? 0) + (report.directSetsByMuscle.upper_chest ?? 0);
      expect(totalChest).toBeGreaterThan(4);
      expect(report.directSetsByMuscle.quads ?? 0).toBeGreaterThan(4);
      expect(template.progressionModel).toBe("double_progression");
    }
  });

  it("powerbuilding templates include both heavy and hypertrophy work", () => {
    const powerbuildingTemplates = PROGRAM_TEMPLATE_REGISTRY.filter((template) => template.goal === "powerbuilding");
    expect(powerbuildingTemplates).toHaveLength(4);
    for (const template of powerbuildingTemplates) {
      const report = calculateTemplateVolumeReport(template);
      expect(report.mainLiftFrequency).toBeGreaterThan(0);
      expect(template.progressionConfig).toHaveProperty("mainLifts");
      expect(template.progressionConfig).toHaveProperty("accessories");
    }
  });

  it("general fitness templates cover major movement patterns", () => {
    const generalFitnessTemplates = PROGRAM_TEMPLATE_REGISTRY.filter((template) => template.goal === "general_fitness");
    expect(generalFitnessTemplates).toHaveLength(6);
    for (const template of generalFitnessTemplates) {
      const patterns = calculateTemplateVolumeReport(template).movementPatternDistribution;
      expect(patterns.horizontal_push ?? 0).toBeGreaterThan(0);
      expect(patterns.horizontal_pull ?? 0).toBeGreaterThan(0);
      expect(patterns.squat ?? 0).toBeGreaterThan(0);
      expect(patterns.hinge ?? 0).toBeGreaterThan(0);
      expect(patterns.anti_extension ?? 0).toBeGreaterThan(0);
    }
  });
});

describe("FORGE template reports", () => {
  it("calculates deterministic weekly volume reports", () => {
    const template = PROGRAM_TEMPLATE_REGISTRY.find((item) => item.id === "forge_hypertrophy_upper_lower_intermediate_4d_v1")!;
    expect(calculateTemplateVolumeReport(template)).toEqual(calculateTemplateVolumeReport(template));
  });

  it("calculates deterministic session duration arrays", () => {
    const template = PROGRAM_TEMPLATE_REGISTRY.find((item) => item.id === "forge_strength_fullbody_beginner_3d_v1")!;
    expect(calculateTemplateVolumeReport(template).estimatedSessionMinutes).toEqual([55, 55, 55]);
  });
});
