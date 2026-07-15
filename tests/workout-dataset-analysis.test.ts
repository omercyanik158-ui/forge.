import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  normalizeExercise,
  normalizeGoal,
  normalizeLevel,
} from "@/../scripts/analyze-workout-dataset";

const root = process.cwd();

describe("workout dataset analysis normalization", () => {
  it("normalizes goal labels conservatively", () => {
    expect(normalizeGoal("['Bodybuilding']")).toBe("hypertrophy");
    expect(normalizeGoal("['Powerbuilding']")).toBe("powerbuilding");
    expect(normalizeGoal("['Powerlifting']")).toBe("strength");
    expect(normalizeGoal("")).toBe("unknown");
  });

  it("marks mixed level labels instead of guessing aggressively", () => {
    expect(normalizeLevel("['Beginner']")).toBe("beginner");
    expect(normalizeLevel("['Beginner', 'Intermediate']")).toBe("mixed");
    expect(normalizeLevel("")).toBe("unknown");
  });

  it("classifies common exercise roles and movement patterns", () => {
    expect(normalizeExercise("Barbell Bench Press")).toMatchObject({
      role: "main_lift",
      movementPattern: "horizontal_push",
    });
    expect(normalizeExercise("Lat Pulldown")).toMatchObject({
      role: "secondary_compound",
      movementPattern: "vertical_pull",
    });
    expect(normalizeExercise("Cable Lateral Raise")).toMatchObject({
      role: "isolation",
      movementPattern: "shoulder_abduction",
    });
  });
});

describe("workout dataset analysis outputs", () => {
  it("writes the required derived files", () => {
    const requiredFiles = [
      "docs/forge-programming-bible-v1.md",
      "docs/workout-dataset-audit-v1.md",
      "docs/workout-pattern-analysis-v1.md",
      "docs/forge-programming-guardrails-v1.md",
      "data/derived/workout-analysis-summary.json",
      "data/derived/program-clusters.json",
      "data/derived/program-quality-report.json",
    ];
    for (const file of requiredFiles) {
      expect(fs.existsSync(path.join(root, file))).toBe(true);
    }
  });

  it("keeps generated summary aligned with the supplied CSV row counts", () => {
    const summaryPath = path.join(root, "data/derived/workout-analysis-summary.json");
    const summary = JSON.parse(fs.readFileSync(summaryPath, "utf8")) as {
      rowCounts: { summary: number; detailed: number };
      uniqueProgramCount: number;
      qualityCounts: Record<string, number>;
    };
    expect(summary.rowCounts.summary).toBe(2598);
    expect(summary.rowCounts.detailed).toBe(605033);
    expect(summary.uniqueProgramCount).toBe(2598);
    expect(summary.qualityCounts.structurally_reliable).toBeGreaterThan(0);
  });
});
