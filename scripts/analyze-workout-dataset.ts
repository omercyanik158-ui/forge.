import fs from "node:fs";
import path from "node:path";

type CsvRow = Record<string, string>;

export type NormalizedGoal =
  | "strength"
  | "hypertrophy"
  | "powerbuilding"
  | "general_fitness"
  | "conditioning"
  | "mobility"
  | "mixed"
  | "unknown";

export type NormalizedLevel =
  | "beginner"
  | "novice"
  | "intermediate"
  | "advanced"
  | "mixed"
  | "unknown";

export type SplitCandidate =
  | "full_body"
  | "upper_lower"
  | "push_pull_legs"
  | "body_part"
  | "powerlifting"
  | "powerbuilding"
  | "circuit"
  | "home_bodyweight"
  | "unknown";

export type ExerciseRole =
  | "main_lift"
  | "secondary_compound"
  | "accessory_compound"
  | "isolation"
  | "core"
  | "conditioning"
  | "mobility"
  | "unknown";

export type MovementPattern =
  | "horizontal_push"
  | "vertical_push"
  | "horizontal_pull"
  | "vertical_pull"
  | "squat"
  | "hinge"
  | "lunge"
  | "knee_flexion"
  | "elbow_flexion"
  | "elbow_extension"
  | "shoulder_abduction"
  | "calf_raise"
  | "loaded_carry"
  | "anti_extension"
  | "anti_rotation"
  | "spinal_flexion"
  | "spinal_extension"
  | "mobility"
  | "unknown";

export type MuscleGroup =
  | "chest"
  | "upper_chest"
  | "back"
  | "lats"
  | "upper_back"
  | "shoulders"
  | "front_delts"
  | "side_delts"
  | "rear_delts"
  | "biceps"
  | "triceps"
  | "forearms"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "core"
  | "full_body"
  | "unknown";

type QualityClass =
  | "structurally_reliable"
  | "usable_with_caution"
  | "structurally_unreliable";

type NormalizedExercise = {
  rawName: string;
  role: ExerciseRole;
  movementPattern: MovementPattern;
  primaryMuscles: MuscleGroup[];
};

type ProgramExercise = {
  week: number | null;
  day: number | null;
  position: number;
  exerciseName: string;
  normalizedExercise: NormalizedExercise;
  sets: number | null;
  reps: number | null;
  intensity: number | null;
};

type ProgramRecord = {
  title: string;
  description: string;
  rawGoal: string;
  rawLevel: string;
  rawEquipment: string;
  goal: NormalizedGoal;
  level: NormalizedLevel;
  split: SplitCandidate;
  programLength: number | null;
  timePerWorkout: number | null;
  totalExercises: number | null;
  exercises: ProgramExercise[];
};

type QualityReportItem = {
  title: string;
  qualityClass: QualityClass;
  score: number;
  reasons: string[];
  goal: NormalizedGoal;
  level: NormalizedLevel;
  split: SplitCandidate;
  daysPerWeek: number;
  exerciseRows: number;
};

type ClusterItem = {
  title: string;
  goal: NormalizedGoal;
  level: NormalizedLevel;
  split: SplitCandidate;
  cluster: string;
  confidence: "high" | "medium" | "low";
  daysPerWeek: number;
  weeks: number;
};

type NumericStats = {
  count: number;
  median: number | null;
  q1: number | null;
  q3: number | null;
  min: number | null;
  max: number | null;
};

type AnalysisSummary = {
  generatedAt: string;
  files: Record<string, { sizeBytes: number; rowCount: number; columns: string[] }>;
  schema: Record<string, Record<string, string>>;
  missingRates: Record<string, Record<string, number>>;
  rowCounts: { summary: number; detailed: number };
  uniqueProgramCount: number;
  duplicateRows: { summary: number; detailed: number };
  duplicateProgramTitles: number;
  qualityCounts: Record<QualityClass, number>;
  suspiciousValues: {
    unusualSets: number;
    unusualReps: number;
    unusualIntensity: number;
    invalidWeekDayRows: number;
    emptyExerciseNameRows: number;
  };
  aggregateStats: {
    sets: NumericStats;
    reps: NumericStats;
    intensity: NumericStats;
    exercisesPerSession: NumericStats;
    daysPerWeek: NumericStats;
    programLength: NumericStats;
  };
  goalDistribution: Record<NormalizedGoal, number>;
  levelDistribution: Record<NormalizedLevel, number>;
  splitDistribution: Record<SplitCandidate, number>;
  reliableCategoryStats: Record<string, {
    programCount: number;
    daysPerWeek: NumericStats;
    exercisesPerSession: NumericStats;
    sets: NumericStats;
    reps: NumericStats;
    commonFirstExercises: { name: string; count: number }[];
    roleDistribution: Record<ExerciseRole, number>;
    movementDistribution: Record<MovementPattern, number>;
    muscleDirectSets: Record<MuscleGroup, number>;
  }>;
  normalizationNotes: string[];
  limitations: string[];
  scientificSources: {
    title: string;
    authors: string;
    year: number;
    sourceType: string;
    identifier: string;
    relevance: string;
  }[];
};

const ROOT = process.cwd();
const SUMMARY_FILE = path.join(ROOT, "program_summary.csv");
const DETAILED_FILE = path.join(ROOT, "programs_detailed_boostcamp_kaggle.csv");
const DERIVED_DIR = path.join(ROOT, "data", "derived");
const DOCS_DIR = path.join(ROOT, "docs");
const STABLE_GENERATED_AT = "2026-07-15T00:00:00.000Z";

const QUALITY_CLASSES: QualityClass[] = [
  "structurally_reliable",
  "usable_with_caution",
  "structurally_unreliable",
];

function parseCsv(input: string): { columns: string[]; rows: CsvRow[] } {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];
    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }
    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(current);
      if (row.some((cell) => cell.length > 0)) rows.push(row);
      row = [];
      current = "";
      continue;
    }
    current += char;
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current);
    if (row.some((cell) => cell.length > 0)) rows.push(row);
  }

  const columns = rows[0] ?? [];
  const dataRows = rows.slice(1).map((cells) => {
    const record: CsvRow = {};
    columns.forEach((column, index) => {
      record[column] = cells[index] ?? "";
    });
    return record;
  });
  return { columns, rows: dataRows };
}

function readCsv(filePath: string): { columns: string[]; rows: CsvRow[]; sizeBytes: number } {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing required CSV file: ${filePath}`);
  }
  const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  const parsed = parseCsv(raw);
  return { ...parsed, sizeBytes: fs.statSync(filePath).size };
}

function parseNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function tokensFromListLike(raw: string): string[] {
  const cleaned = raw
    .replace(/^\[/, "")
    .replace(/\]$/, "")
    .replaceAll("'", "")
    .replaceAll('"', "");
  return cleaned
    .split(",")
    .map((item) => normalizeText(item))
    .filter(Boolean);
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim();
}

export function normalizeGoal(raw: string): NormalizedGoal {
  const tokens = tokensFromListLike(raw).join(" ");
  const has = (term: string) => tokens.includes(term);
  const goals = new Set<NormalizedGoal>();
  if (has("powerlifting") || has("strength")) goals.add("strength");
  if (has("bodybuilding") || has("muscle") || has("sculpting") || has("hypertrophy")) goals.add("hypertrophy");
  if (has("powerbuilding")) goals.add("powerbuilding");
  if (has("athletics") || has("fitness") || has("bodyweight")) goals.add("general_fitness");
  if (has("conditioning") || has("cardio") || has("endurance")) goals.add("conditioning");
  if (has("mobility") || has("yoga") || has("stretch")) goals.add("mobility");
  if (goals.size === 0) return "unknown";
  if (goals.size > 1) {
    if (goals.has("powerbuilding")) return "powerbuilding";
    return "mixed";
  }
  return [...goals][0] ?? "unknown";
}

export function normalizeLevel(raw: string): NormalizedLevel {
  const tokens = tokensFromListLike(raw).join(" ");
  const levels = new Set<NormalizedLevel>();
  if (tokens.includes("beginner")) levels.add("beginner");
  if (tokens.includes("novice")) levels.add("novice");
  if (tokens.includes("intermediate")) levels.add("intermediate");
  if (tokens.includes("advanced")) levels.add("advanced");
  if (levels.size === 0) return "unknown";
  if (levels.size > 1) return "mixed";
  return [...levels][0] ?? "unknown";
}

function inferSplit(title: string, description: string, equipment: string): SplitCandidate {
  const text = normalizeText(`${title} ${description} ${equipment}`);
  if (text.includes("push pull legs") || text.includes("ppl")) return "push_pull_legs";
  if (text.includes("upper lower")) return "upper_lower";
  if (text.includes("full body") || text.includes("total body")) return "full_body";
  if (text.includes("powerlifting") || text.includes("sbd") || text.includes("squat bench deadlift")) return "powerlifting";
  if (text.includes("powerbuilding")) return "powerbuilding";
  if (text.includes("body part") || text.includes("bro split") || text.includes("chest back legs arms")) return "body_part";
  if (text.includes("circuit") || text.includes("conditioning")) return "circuit";
  if (text.includes("bodyweight") || text.includes("home")) return "home_bodyweight";
  return "unknown";
}

export function normalizeExercise(name: string): NormalizedExercise {
  const text = normalizeText(name);
  const includes = (term: string) => text.includes(term);

  if (includes("stretch") || includes("mobility") || includes("distraction") || includes("test")) {
    return { rawName: name, role: "mobility", movementPattern: "mobility", primaryMuscles: ["unknown"] };
  }
  if (includes("run") || includes("bike") || includes("row erg") || includes("jumping jack") || includes("burpee")) {
    return { rawName: name, role: "conditioning", movementPattern: "unknown", primaryMuscles: ["full_body"] };
  }
  if (includes("plank") || includes("dead bug") || includes("pallof")) {
    return { rawName: name, role: "core", movementPattern: includes("pallof") ? "anti_rotation" : "anti_extension", primaryMuscles: ["core"] };
  }
  if (includes("crunch") || includes("sit up") || includes("leg raise")) {
    return { rawName: name, role: "core", movementPattern: "spinal_flexion", primaryMuscles: ["core"] };
  }
  if (includes("bench press") || includes("push up") || includes("dip") || includes("chest press")) {
    return { rawName: name, role: includes("bench press") ? "main_lift" : "secondary_compound", movementPattern: "horizontal_push", primaryMuscles: ["chest", "triceps", "front_delts"] };
  }
  if (includes("incline") && (includes("press") || includes("fly"))) {
    return { rawName: name, role: includes("fly") ? "isolation" : "secondary_compound", movementPattern: "horizontal_push", primaryMuscles: ["upper_chest", "chest"] };
  }
  if (includes("overhead press") || includes("shoulder press") || includes("military press")) {
    return { rawName: name, role: "main_lift", movementPattern: "vertical_push", primaryMuscles: ["shoulders", "front_delts", "triceps"] };
  }
  if (includes("lateral raise")) {
    return { rawName: name, role: "isolation", movementPattern: "shoulder_abduction", primaryMuscles: ["side_delts"] };
  }
  if (includes("rear delt") || includes("face pull")) {
    return { rawName: name, role: "isolation", movementPattern: "horizontal_pull", primaryMuscles: ["rear_delts", "upper_back"] };
  }
  if (includes("pull up") || includes("chin up") || includes("pulldown")) {
    return { rawName: name, role: "secondary_compound", movementPattern: "vertical_pull", primaryMuscles: ["lats", "biceps"] };
  }
  if (includes("row")) {
    return { rawName: name, role: includes("barbell") ? "secondary_compound" : "accessory_compound", movementPattern: "horizontal_pull", primaryMuscles: ["upper_back", "lats", "biceps"] };
  }
  if (includes("deadlift") || includes("romanian deadlift") || includes("rdl") || includes("good morning")) {
    return { rawName: name, role: includes("deadlift") && !includes("romanian") ? "main_lift" : "secondary_compound", movementPattern: "hinge", primaryMuscles: ["hamstrings", "glutes", "back"] };
  }
  if (includes("squat") || includes("leg press")) {
    return { rawName: name, role: includes("back squat") || includes("front squat") || includes("squat") ? "main_lift" : "secondary_compound", movementPattern: "squat", primaryMuscles: ["quads", "glutes"] };
  }
  if (includes("lunge") || includes("split squat") || includes("step up")) {
    return { rawName: name, role: "accessory_compound", movementPattern: "lunge", primaryMuscles: ["quads", "glutes"] };
  }
  if (includes("leg curl")) {
    return { rawName: name, role: "isolation", movementPattern: "knee_flexion", primaryMuscles: ["hamstrings"] };
  }
  if (includes("leg extension")) {
    return { rawName: name, role: "isolation", movementPattern: "squat", primaryMuscles: ["quads"] };
  }
  if (includes("hip thrust") || includes("glute bridge")) {
    return { rawName: name, role: "accessory_compound", movementPattern: "hinge", primaryMuscles: ["glutes", "hamstrings"] };
  }
  if (includes("calf raise")) {
    return { rawName: name, role: "isolation", movementPattern: "calf_raise", primaryMuscles: ["calves"] };
  }
  if (includes("curl")) {
    return { rawName: name, role: "isolation", movementPattern: "elbow_flexion", primaryMuscles: ["biceps", "forearms"] };
  }
  if (includes("tricep") || includes("skullcrusher") || includes("pushdown") || includes("extension")) {
    return { rawName: name, role: "isolation", movementPattern: "elbow_extension", primaryMuscles: ["triceps"] };
  }
  if (includes("carry") || includes("farmer")) {
    return { rawName: name, role: "conditioning", movementPattern: "loaded_carry", primaryMuscles: ["full_body", "forearms"] };
  }
  return { rawName: name, role: "unknown", movementPattern: "unknown", primaryMuscles: ["unknown"] };
}

function inferColumnType(rows: CsvRow[], column: string): string {
  const values = rows.map((row) => row[column]).filter((value) => value.trim().length > 0);
  if (values.length === 0) return "empty";
  const numeric = values.filter((value) => parseNumber(value) !== null).length / values.length;
  if (numeric > 0.95) return "number";
  if (values.every((value) => /^\d{4}-\d{2}-\d{2}/.test(value))) return "datetime";
  if (values.some((value) => value.startsWith("[") && value.endsWith("]"))) return "list-like-string";
  return "string";
}

function missingRates(rows: CsvRow[], columns: string[]): Record<string, number> {
  const result: Record<string, number> = {};
  columns.forEach((column) => {
    const missing = rows.filter((row) => row[column].trim().length === 0).length;
    result[column] = Number((missing / Math.max(rows.length, 1)).toFixed(4));
  });
  return result;
}

function duplicateRowCount(rows: CsvRow[]): number {
  const seen = new Set<string>();
  let duplicates = 0;
  rows.forEach((row) => {
    const key = JSON.stringify(row);
    if (seen.has(key)) duplicates += 1;
    seen.add(key);
  });
  return duplicates;
}

function percentile(values: number[], p: number): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return Number(sorted[lower]!.toFixed(2));
  const weighted = sorted[lower]! * (upper - index) + sorted[upper]! * (index - lower);
  return Number(weighted.toFixed(2));
}

function numericStats(values: (number | null)[]): NumericStats {
  const clean = values.filter((value): value is number => value !== null && Number.isFinite(value));
  let min: number | null = null;
  let max: number | null = null;
  clean.forEach((value) => {
    min = min === null ? value : Math.min(min, value);
    max = max === null ? value : Math.max(max, value);
  });
  return {
    count: clean.length,
    median: percentile(clean, 0.5),
    q1: percentile(clean, 0.25),
    q3: percentile(clean, 0.75),
    min,
    max,
  };
}

function countBy<T extends string>(values: T[]): Record<T, number> {
  const result = {} as Record<T, number>;
  values.forEach((value) => {
    result[value] = (result[value] ?? 0) + 1;
  });
  return result;
}

function topCounts(values: string[], limit: number): { name: string; count: number }[] {
  return Object.entries(countBy(values))
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

function buildPrograms(summaryRows: CsvRow[], detailedRows: CsvRow[]): ProgramRecord[] {
  const summaryByTitle = new Map<string, CsvRow>();
  summaryRows.forEach((row) => summaryByTitle.set(row.title, row));
  const detailByTitle = new Map<string, CsvRow[]>();
  detailedRows.forEach((row) => {
    const list = detailByTitle.get(row.title) ?? [];
    list.push(row);
    detailByTitle.set(row.title, list);
  });

  return [...detailByTitle.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([title, detailRows]) => {
      const summary = summaryByTitle.get(title) ?? detailRows[0]!;
      const description = summary.description ?? "";
      const rawGoal = summary.goal ?? detailRows[0]?.goal ?? "";
      const rawLevel = summary.level ?? detailRows[0]?.level ?? "";
      const rawEquipment = summary.equipment ?? detailRows[0]?.equipment ?? "";
      return {
        title,
        description,
        rawGoal,
        rawLevel,
        rawEquipment,
        goal: normalizeGoal(rawGoal),
        level: normalizeLevel(rawLevel),
        split: inferSplit(title, description, rawEquipment),
        programLength: parseNumber(summary.program_length ?? ""),
        timePerWorkout: parseNumber(summary.time_per_workout ?? ""),
        totalExercises: parseNumber(summary.total_exercises ?? ""),
        exercises: detailRows
          .map((row, index): ProgramExercise => ({
            week: parseNumber(row.week),
            day: parseNumber(row.day),
            position: index,
            exerciseName: row.exercise_name,
            normalizedExercise: normalizeExercise(row.exercise_name),
            sets: parseNumber(row.sets),
            reps: parseNumber(row.reps),
            intensity: parseNumber(row.intensity),
          }))
          .sort((left, right) => (left.week ?? 999) - (right.week ?? 999) || (left.day ?? 999) - (right.day ?? 999) || left.position - right.position),
      };
    });
}

function uniqueDays(program: ProgramRecord): string[] {
  return [...new Set(program.exercises.filter((exercise) => exercise.week !== null && exercise.day !== null).map((exercise) => `${exercise.week}:${exercise.day}`))].sort();
}

function daysPerWeek(program: ProgramRecord): number {
  const weekOne = new Set(program.exercises.filter((exercise) => exercise.week === 1 && exercise.day !== null).map((exercise) => exercise.day));
  if (weekOne.size > 0) return weekOne.size;
  const byWeek = new Map<number, Set<number>>();
  program.exercises.forEach((exercise) => {
    if (exercise.week === null || exercise.day === null) return;
    const days = byWeek.get(exercise.week) ?? new Set<number>();
    days.add(exercise.day);
    byWeek.set(exercise.week, days);
  });
  const values = [...byWeek.values()].map((days) => days.size);
  return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
}

function qualityForProgram(program: ProgramRecord): QualityReportItem {
  let score = 100;
  const reasons: string[] = [];
  const days = uniqueDays(program);
  const exerciseRows = program.exercises.length;
  const invalidSets = program.exercises.filter((exercise) => exercise.sets === null || exercise.sets <= 0 || exercise.sets > 12).length;
  const invalidReps = program.exercises.filter((exercise) => exercise.reps === null || exercise.reps <= 0 || exercise.reps > 100).length;
  const invalidWeekDay = program.exercises.filter((exercise) => exercise.week === null || exercise.week <= 0 || exercise.day === null || exercise.day <= 0).length;
  const unknownExercises = program.exercises.filter((exercise) => exercise.normalizedExercise.role === "unknown").length;
  const emptyNames = program.exercises.filter((exercise) => exercise.exerciseName.trim().length === 0).length;
  const dayCounts = new Map<string, number>();
  program.exercises.forEach((exercise) => {
    const key = `${exercise.week ?? "?"}:${exercise.day ?? "?"}`;
    dayCounts.set(key, (dayCounts.get(key) ?? 0) + 1);
  });
  const excessiveDays = [...dayCounts.values()].filter((count) => count > 14).length;
  const emptyDaySignal = program.totalExercises !== null && program.totalExercises > exerciseRows;
  const duplicateSameDay = program.exercises.filter((exercise, index) =>
    program.exercises.some((other, otherIndex) =>
      otherIndex < index &&
      other.week === exercise.week &&
      other.day === exercise.day &&
      normalizeText(other.exerciseName) === normalizeText(exercise.exerciseName),
    ),
  ).length;
  const patterns = new Set(program.exercises.map((exercise) => exercise.normalizedExercise.movementPattern).filter((pattern) => pattern !== "unknown" && pattern !== "mobility"));

  if (days.length === 0) {
    score -= 30;
    reasons.push("No valid week/day structure.");
  }
  if (invalidWeekDay > 0) {
    score -= Math.min(25, invalidWeekDay * 2);
    reasons.push(`${invalidWeekDay} rows have invalid week/day values.`);
  }
  if (invalidSets > 0) {
    score -= Math.min(25, invalidSets * 2);
    reasons.push(`${invalidSets} rows have missing or unusual set values.`);
  }
  if (invalidReps > 0) {
    score -= Math.min(30, invalidReps * 2);
    reasons.push(`${invalidReps} rows have missing, negative, zero or extreme rep values.`);
  }
  if (unknownExercises / Math.max(exerciseRows, 1) > 0.35) {
    score -= 15;
    reasons.push("More than 35% of exercise rows could not be confidently classified.");
  }
  if (emptyNames > 0) {
    score -= 20;
    reasons.push(`${emptyNames} rows have empty exercise names.`);
  }
  if (excessiveDays > 0) {
    score -= 15;
    reasons.push(`${excessiveDays} sessions contain more than 14 exercise rows.`);
  }
  if (emptyDaySignal) {
    score -= 8;
    reasons.push("Summary total_exercises exceeds detailed exercise rows.");
  }
  if (duplicateSameDay > 3) {
    score -= 8;
    reasons.push("Multiple duplicate exercise names appear inside the same session.");
  }
  if (program.goal === "unknown") {
    score -= 8;
    reasons.push("Goal metadata is unknown.");
  }
  if (program.level === "unknown") {
    score -= 6;
    reasons.push("Level metadata is unknown.");
  }
  if (program.goal !== "mobility" && patterns.size < 3) {
    score -= 8;
    reasons.push("Major movement-pattern coverage is narrow for a resistance-training program.");
  }

  const qualityClass: QualityClass =
    score >= 78 ? "structurally_reliable" : score >= 50 ? "usable_with_caution" : "structurally_unreliable";

  return {
    title: program.title,
    qualityClass,
    score: Math.max(0, score),
    reasons,
    goal: program.goal,
    level: program.level,
    split: program.split,
    daysPerWeek: daysPerWeek(program),
    exerciseRows,
  };
}

function clusterFor(program: ProgramRecord, quality: QualityReportItem): ClusterItem {
  const days = quality.daysPerWeek;
  const weeks = Math.max(...program.exercises.map((exercise) => exercise.week ?? 0), 0);
  let cluster = "unknown";
  let confidence: ClusterItem["confidence"] = "low";
  if (program.goal === "strength") {
    if (program.split === "powerlifting") cluster = "strength_powerlifting_oriented";
    else if (days === 3 && program.split === "full_body") cluster = "strength_beginner_3_day_full_body";
    else if (days === 4 && program.split === "upper_lower") cluster = "strength_4_day_upper_lower";
    else if (days === 5) cluster = "strength_5_day";
    else cluster = `strength_${days || "unknown"}_day`;
  } else if (program.goal === "hypertrophy") {
    if (days === 3 && program.split === "full_body") cluster = "hypertrophy_3_day_full_body";
    else if (days === 4 && program.split === "upper_lower") cluster = "hypertrophy_4_day_upper_lower";
    else if (days === 5 && program.split === "body_part") cluster = "hypertrophy_5_day_body_part";
    else if (days === 6 && program.split === "push_pull_legs") cluster = "hypertrophy_6_day_ppl";
    else cluster = `hypertrophy_${days || "unknown"}_day`;
  } else if (program.goal === "powerbuilding") {
    cluster = days === 4 || days === 5 ? `powerbuilding_${days}_day` : "powerbuilding_other";
  } else if (program.goal === "general_fitness") {
    cluster = program.split === "home_bodyweight" ? "general_fitness_home_bodyweight" : `general_fitness_${days || "unknown"}_day`;
  } else if (program.goal === "mobility") {
    cluster = "mobility_or_preparation";
  } else {
    cluster = `${program.goal}_${days || "unknown"}_day`;
  }
  if (quality.qualityClass === "structurally_reliable" && program.split !== "unknown" && days > 0) confidence = "high";
  else if (quality.qualityClass !== "structurally_unreliable" && days > 0) confidence = "medium";
  return {
    title: program.title,
    goal: program.goal,
    level: program.level,
    split: program.split,
    cluster,
    confidence,
    daysPerWeek: days,
    weeks,
  };
}

function buildCategoryStats(programs: ProgramRecord[], qualityReports: QualityReportItem[]): AnalysisSummary["reliableCategoryStats"] {
  const reliableTitles = new Set(qualityReports.filter((item) => item.qualityClass === "structurally_reliable").map((item) => item.title));
  const reliable = programs.filter((program) => reliableTitles.has(program.title));
  const categories = new Map<string, ProgramRecord[]>();
  reliable.forEach((program) => {
    const key = `${program.goal}:${program.split}`;
    const list = categories.get(key) ?? [];
    list.push(program);
    categories.set(key, list);
  });
  const result: AnalysisSummary["reliableCategoryStats"] = {};
  [...categories.entries()].sort(([left], [right]) => left.localeCompare(right)).forEach(([key, categoryPrograms]) => {
    const allExercises = categoryPrograms.flatMap((program) => program.exercises);
    const sessionCounts = categoryPrograms.flatMap((program) => {
      const counts = new Map<string, number>();
      program.exercises.forEach((exercise) => {
        const dayKey = `${exercise.week}:${exercise.day}`;
        counts.set(dayKey, (counts.get(dayKey) ?? 0) + 1);
      });
      return [...counts.values()];
    });
    const firstExercises = categoryPrograms.flatMap((program) => {
      const byDay = new Map<string, ProgramExercise[]>();
      program.exercises.forEach((exercise) => {
        const dayKey = `${exercise.week}:${exercise.day}`;
        const list = byDay.get(dayKey) ?? [];
        list.push(exercise);
        byDay.set(dayKey, list);
      });
      return [...byDay.values()].map((dayExercises) => dayExercises[0]?.exerciseName ?? "").filter(Boolean);
    });
    const muscleDirectSets: Record<MuscleGroup, number> = {} as Record<MuscleGroup, number>;
    allExercises.forEach((exercise) => {
      const directSets = exercise.sets ?? 0;
      exercise.normalizedExercise.primaryMuscles.forEach((muscle, index) => {
        if (muscle === "unknown") return;
        const contribution = index === 0 ? directSets : directSets * 0.5;
        muscleDirectSets[muscle] = Number(((muscleDirectSets[muscle] ?? 0) + contribution).toFixed(2));
      });
    });
    result[key] = {
      programCount: categoryPrograms.length,
      daysPerWeek: numericStats(categoryPrograms.map(daysPerWeek)),
      exercisesPerSession: numericStats(sessionCounts),
      sets: numericStats(allExercises.map((exercise) => exercise.sets)),
      reps: numericStats(allExercises.map((exercise) => exercise.reps)),
      commonFirstExercises: topCounts(firstExercises, 10),
      roleDistribution: countBy(allExercises.map((exercise) => exercise.normalizedExercise.role)),
      movementDistribution: countBy(allExercises.map((exercise) => exercise.normalizedExercise.movementPattern)),
      muscleDirectSets,
    };
  });
  return result;
}

function generateSummary(summaryData: ReturnType<typeof readCsv>, detailedData: ReturnType<typeof readCsv>): {
  summary: AnalysisSummary;
  programs: ProgramRecord[];
  qualityReports: QualityReportItem[];
  clusters: ClusterItem[];
} {
  const programs = buildPrograms(summaryData.rows, detailedData.rows);
  const qualityReports = programs.map(qualityForProgram);
  const clusters = programs.map((program) => clusterFor(program, qualityReports.find((item) => item.title === program.title)!));
  const allExercises = programs.flatMap((program) => program.exercises);
  const duplicateTitles = summaryData.rows.length - new Set(summaryData.rows.map((row) => row.title)).size;
  const fileMeta = {
    [path.basename(SUMMARY_FILE)]: { sizeBytes: summaryData.sizeBytes, rowCount: summaryData.rows.length, columns: summaryData.columns },
    [path.basename(DETAILED_FILE)]: { sizeBytes: detailedData.sizeBytes, rowCount: detailedData.rows.length, columns: detailedData.columns },
  };
  const schema = {
    [path.basename(SUMMARY_FILE)]: Object.fromEntries(summaryData.columns.map((column) => [column, inferColumnType(summaryData.rows, column)])),
    [path.basename(DETAILED_FILE)]: Object.fromEntries(detailedData.columns.map((column) => [column, inferColumnType(detailedData.rows, column)])),
  };
  const summary: AnalysisSummary = {
    generatedAt: STABLE_GENERATED_AT,
    files: fileMeta,
    schema,
    missingRates: {
      [path.basename(SUMMARY_FILE)]: missingRates(summaryData.rows, summaryData.columns),
      [path.basename(DETAILED_FILE)]: missingRates(detailedData.rows, detailedData.columns),
    },
    rowCounts: { summary: summaryData.rows.length, detailed: detailedData.rows.length },
    uniqueProgramCount: programs.length,
    duplicateRows: { summary: duplicateRowCount(summaryData.rows), detailed: duplicateRowCount(detailedData.rows) },
    duplicateProgramTitles: duplicateTitles,
    qualityCounts: Object.fromEntries(QUALITY_CLASSES.map((qualityClass) => [qualityClass, qualityReports.filter((item) => item.qualityClass === qualityClass).length])) as Record<QualityClass, number>,
    suspiciousValues: {
      unusualSets: allExercises.filter((exercise) => exercise.sets === null || exercise.sets <= 0 || exercise.sets > 12).length,
      unusualReps: allExercises.filter((exercise) => exercise.reps === null || exercise.reps <= 0 || exercise.reps > 100).length,
      unusualIntensity: allExercises.filter((exercise) => exercise.intensity !== null && (exercise.intensity < 0 || exercise.intensity > 10)).length,
      invalidWeekDayRows: allExercises.filter((exercise) => exercise.week === null || exercise.week <= 0 || exercise.day === null || exercise.day <= 0).length,
      emptyExerciseNameRows: allExercises.filter((exercise) => exercise.exerciseName.trim().length === 0).length,
    },
    aggregateStats: {
      sets: numericStats(allExercises.map((exercise) => exercise.sets)),
      reps: numericStats(allExercises.map((exercise) => exercise.reps)),
      intensity: numericStats(allExercises.map((exercise) => exercise.intensity)),
      exercisesPerSession: numericStats(programs.flatMap((program) => {
        const counts = new Map<string, number>();
        program.exercises.forEach((exercise) => counts.set(`${exercise.week}:${exercise.day}`, (counts.get(`${exercise.week}:${exercise.day}`) ?? 0) + 1));
        return [...counts.values()];
      })),
      daysPerWeek: numericStats(programs.map(daysPerWeek)),
      programLength: numericStats(programs.map((program) => program.programLength)),
    },
    goalDistribution: countBy(programs.map((program) => program.goal)),
    levelDistribution: countBy(programs.map((program) => program.level)),
    splitDistribution: countBy(programs.map((program) => program.split)),
    reliableCategoryStats: buildCategoryStats(programs, qualityReports),
    normalizationNotes: [
      "Raw list-like goal and level strings are tokenized conservatively; multi-goal records become mixed unless powerbuilding is explicit.",
      "Exercise roles, muscles and movement patterns are heuristic labels for analysis only; ambiguous exercise names remain unknown.",
      "Compound secondary muscles are counted as fractional exposure in aggregate volume estimates, not full direct sets.",
      "Split classification uses title/description/equipment text and should be treated as a candidate label, not ground truth.",
    ],
    limitations: [
      "Dataset popularity or frequency is not evidence of effectiveness.",
      "The detailed CSV has malformed negative rep values and mobility-test rows that are not normal prescription data.",
      "Rest intervals, explicit RPE/RIR and progression models are sparsely represented or absent in the structured columns.",
      "Descriptions may contain copyrighted program names; documents intentionally summarize patterns rather than reproduce complete programs.",
      "Yoga and Pilates are not meaningfully supported by this resistance-training dataset.",
    ],
    scientificSources: [
      {
        title: "Progression Models in Resistance Training for Healthy Adults",
        authors: "American College of Sports Medicine",
        year: 2009,
        sourceType: "Position stand / guideline",
        identifier: "doi:10.1249/MSS.0b013e3181915670; PMID:19204579",
        relevance: "General resistance-training progression variables, frequency, volume, intensity and rest guidance.",
      },
      {
        title: "Effects of Resistance Training Frequency on Measures of Muscle Hypertrophy",
        authors: "Schoenfeld, Ogborn, Krieger",
        year: 2016,
        sourceType: "Systematic review and meta-analysis",
        identifier: "doi:10.1007/s40279-016-0543-8; PMID:27102172",
        relevance: "Frequency and hypertrophy interpretation; useful but not a rigid rule when volume is equated.",
      },
      {
        title: "Dose-response relationship between weekly resistance training volume and increases in muscle mass",
        authors: "Schoenfeld, Ogborn, Krieger",
        year: 2017,
        sourceType: "Systematic review and meta-analysis",
        identifier: "doi:10.1080/02640414.2016.1210197",
        relevance: "Volume ranges and dose-response framing for hypertrophy guardrails.",
      },
      {
        title: "Strength and Hypertrophy Adaptations Between Low- vs. High-Load Resistance Training",
        authors: "Schoenfeld, Grgic, Ogborn, Krieger",
        year: 2017,
        sourceType: "Systematic review and meta-analysis",
        identifier: "doi:10.1519/JSC.0000000000002200; PMID:28834797",
        relevance: "Load ranges for strength versus hypertrophy; supports context instead of one fixed rep range.",
      },
      {
        title: "The effects of short versus long inter-set rest intervals in resistance training on measures of muscle hypertrophy",
        authors: "Grgic, Lazinica, Mikulic, Krieger, Schoenfeld",
        year: 2017,
        sourceType: "Systematic review",
        identifier: "doi:10.1080/17461391.2017.1340524; PMID:28641044",
        relevance: "Rest interval recommendations should distinguish dataset absence from evidence-informed product guidance.",
      },
    ],
  };
  return { summary, programs, qualityReports, clusters };
}

function table(headers: string[], rows: (string | number | null)[][]): string {
  const header = `| ${headers.join(" |")} |`;
  const divider = `| ${headers.map(() => "---").join(" |")} |`;
  const body = rows.map((row) => `| ${row.map((cell) => String(cell ?? "")).join(" |")} |`);
  return [header, divider, ...body].join("\n");
}

function statsLine(stats: NumericStats): string {
  return `n=${stats.count}, median=${stats.median ?? "unknown"}, IQR=${stats.q1 ?? "unknown"}-${stats.q3 ?? "unknown"}, min=${stats.min ?? "unknown"}, max=${stats.max ?? "unknown"}`;
}

function generateAuditDoc(summary: AnalysisSummary, qualityReports: QualityReportItem[]): string {
  const worstReasons = topCounts(qualityReports.flatMap((item) => item.reasons), 12);
  return `# Workout Dataset Audit v1

Generated: ${summary.generatedAt}

## Scope

This audit is derived only from \`program_summary.csv\` and \`programs_detailed_boostcamp_kaggle.csv\`. It describes structure and data quality. It does not claim that any dataset program is effective.

## Files And Schema

${table(["File", "Size bytes", "Rows", "Columns"], Object.entries(summary.files).map(([file, meta]) => [file, meta.sizeBytes, meta.rowCount, meta.columns.join(", ")]))}

## Column Types

${Object.entries(summary.schema).map(([file, schema]) => `### ${file}\n\n${table(["Column", "Detected type", "Missing rate"], Object.entries(schema).map(([column, type]) => [column, type, summary.missingRates[file]?.[column] ?? 0]))}`).join("\n\n")}

## Quality Counts

${table(["Class", "Program count"], QUALITY_CLASSES.map((qualityClass) => [qualityClass, summary.qualityCounts[qualityClass]]))}

## Suspicious Values

${table(["Signal", "Rows"], Object.entries(summary.suspiciousValues).map(([key, value]) => [key, value]))}

## Most Common Exclusion Or Caution Reasons

${table(["Reason", "Program count"], worstReasons.map((item) => [item.name, item.count]))}

## Normalization Decisions

${summary.normalizationNotes.map((note) => `- ${note}`).join("\n")}

## Limitations

${summary.limitations.map((note) => `- ${note}`).join("\n")}
`;
}

function generatePatternDoc(summary: AnalysisSummary, clusters: ClusterItem[]): string {
  const clusterCounts = topCounts(clusters.map((item) => item.cluster), 25);
  const categoryRows = Object.entries(summary.reliableCategoryStats)
    .sort((left, right) => right[1].programCount - left[1].programCount)
    .slice(0, 20)
    .map(([category, stats]) => [
      category,
      stats.programCount,
      statsLine(stats.daysPerWeek),
      statsLine(stats.exercisesPerSession),
      statsLine(stats.sets),
      statsLine(stats.reps),
    ]);
  return `# Workout Pattern Analysis v1

Generated: ${summary.generatedAt}

## Dataset-Derived Findings

These findings are observations from structurally reliable programs only unless otherwise stated. They are not scientific proof and should not be copied into templates without coaching judgment.

## Program And Cluster Distribution

${table(["Cluster", "Program count"], clusterCounts.map((item) => [item.name, item.count]))}

## Goal Distribution

${table(["Goal", "Program count"], Object.entries(summary.goalDistribution).map(([goal, count]) => [goal, count]))}

## Level Distribution

${table(["Level", "Program count"], Object.entries(summary.levelDistribution).map(([level, count]) => [level, count]))}

## Split Distribution

${table(["Split candidate", "Program count"], Object.entries(summary.splitDistribution).map(([split, count]) => [split, count]))}

## Aggregate Prescription Statistics

${table(["Metric", "Stats"], Object.entries(summary.aggregateStats).map(([key, value]) => [key, statsLine(value)]))}

## Reliable Category Statistics

${table(["Category", "Programs", "Days/week", "Exercises/session", "Sets", "Reps"], categoryRows)}

## Exercise Order Findings

Across reliable categories, first exercises are commonly large compound or preparation movements. Mobility-heavy programs often start with tests or drills, which should not be interpreted as strength/hypertrophy ordering. FORGE validators should therefore evaluate exercise order in context: strength and powerbuilding days should normally place main lifts early; hypertrophy days should place priority muscles and high-skill compounds before low-skill isolation; core/conditioning usually belongs later unless it is the session goal.

## Volume Counting Assumptions

Direct set estimates count the first classified muscle as 1.0 set and secondary listed muscles as 0.5 exposure. This is an analysis approximation only. It prevents every compound set from becoming a full direct set for every assisting muscle.

## Progression Findings

Structured progression is not reliably encoded in the CSV columns. Program descriptions sometimes mention progression, but this analysis does not classify progression unless the structured fields support it. FORGE Phase 2 should define progression from first principles instead of assuming it from the dataset.

## Rest, RPE And RIR Coverage

The supplied structured columns do not contain rest periods or explicit RPE/RIR fields. The \`intensity\` column is present but ambiguous; values are treated as raw dataset observations, not validated RPE or percentage prescriptions.
`;
}

function generateGuardrailsDoc(summary: AnalysisSummary): string {
  return `# FORGE Programming Guardrails v1

Generated: ${summary.generatedAt}

## Purpose

These are proposed configurable guardrails for future validators and adaptation engines. They are not production code in Phase 1.

## High-Confidence Product Rules

- Strength sessions must preserve a clear main-lift or primary-strength role before accessories.
- A template adaptation must not make the original template unrecognizable.
- Injury and limitation constraints override physique-focus adjustments and user style preference.
- Unknown or malformed exercise prescriptions must be rejected or routed to a safe fallback.
- Beginner plans should avoid excessive day counts, excessive axial fatigue and advanced intensity techniques.
- Dataset frequency is never treated as proof of program quality.
- Rest, RPE and RIR recommendations must be labeled evidence-informed when not present in CSV data.

## Context-Dependent Guidelines

- Hypertrophy volume should start conservatively and increase only when recovery and adherence support it.
- Frequency can distribute volume and skill practice, but it is not a universal rule independent of volume, recovery and schedule.
- Strength rep ranges usually bias lower reps for main lifts, while accessories can use moderate reps.
- Hypertrophy can use broad rep ranges when proximity to failure, execution and progression are appropriate.
- Deloads should be triggered by block design, fatigue accumulation, performance trend or user feedback rather than added automatically to every plan.

## Proposed Starting Ranges

${table(["Goal", "Experience", "Direct sets/week", "Sessions/muscle/week", "Sets/session", "Confidence"], [
  ["strength", "beginner", "4-10 by main pattern", "2-3 skill exposures", "1-4 hard main-lift sets", "medium"],
  ["strength", "intermediate", "6-14 by main pattern", "2-4 exposures", "2-6 work sets", "medium"],
  ["hypertrophy", "beginner", "6-10 per priority muscle", "1-2", "2-6 direct sets/muscle", "medium"],
  ["hypertrophy", "intermediate", "8-16 per priority muscle", "2-3", "3-8 direct sets/muscle", "medium"],
  ["powerbuilding", "intermediate", "strength work plus 6-12 accessory sets", "2-3", "controlled accessory volume", "medium"],
  ["general_fitness", "beginner", "balanced movement exposure", "2-3 full-body contacts", "moderate", "medium"],
])}

## Redundancy Detectors To Implement Later

- Excessive pressing redundancy: multiple similar horizontal presses in one session without a distinct role.
- Excessive rowing redundancy: repeated row variants with the same torso angle and grip pattern.
- Excessive vertical pulling: several pulldown/pull-up variants without need.
- Excessive knee-dominant work: squat, leg press, lunge and extension volume stacked beyond recovery.
- Excessive hinge fatigue: deadlift/RDL/good morning/hip hinge density without lower-back control.
- Excessive elbow-flexion or extension isolation in beginner or short-duration sessions.
- Missing antagonist work when a plan repeatedly emphasizes one side of a joint action.
- Excessive session length when exercise count and estimated rest cannot fit the requested duration.
- Too much failure training if RPE/RIR data later indicates repeated failure across compounds.

## Physique Focus Boundaries

- Upper chest focus: prefer incline substitution/reordering or small added exposure, not several new presses.
- Lats focus: prefer vertical pull and shoulder-extension-biased work; avoid row spam.
- Upper back/rear delt focus: prefer retraction, face-pull/rear-delt slots and balanced pressing.
- Side delt focus: use low-fatigue lateral raise exposure; do not count pressing as enough direct side-delt work.
- Arms focus: add limited isolation after compound work and respect elbow recovery.
- Quads/hamstrings/glutes focus: add or reorder one targeted pattern while controlling axial and knee/hip fatigue.
- Calves/core focus: small frequent exposure is safer than bloating one session.

## Refuse Or Fallback Conditions

- No template matches mandatory equipment and limitation constraints.
- Required main lift is contraindicated by a limitation and no safe substitute exists.
- Requested session duration cannot safely contain the selected template structure.
- CSV-derived record is structurally unreliable and no curated FORGE template exists yet.
`;
}

function generateBibleDoc(summary: AnalysisSummary): string {
  const sourceList = summary.scientificSources.map((source) => `- ${source.authors} (${source.year}). ${source.title}. ${source.sourceType}. ${source.identifier}. ${source.relevance}`).join("\n");
  return `# FORGE Programming Bible v1

Generated: ${summary.generatedAt}

## 1. Purpose And Scope

This document is the Phase 1 programming constitution for FORGE. It analyzes the supplied CSV files and separates dataset observations, evidence-informed resistance-training principles, product decisions and known uncertainty. It does not create final templates and does not replace production workout behavior.

## 2. Source Hierarchy

1. User safety, limitations and recoverability.
2. Evidence-informed resistance-training principles from primary or review literature.
3. FORGE product constraints: deterministic selection, explainability, session duration and template preservation.
4. Dataset-derived patterns from structurally reliable CSV programs.
5. Practitioner judgment for ambiguous cases.

## 3. Dataset Limitations

${summary.limitations.map((item) => `- ${item}`).join("\n")}

## 4. Terminology

- Main lift: a high-priority compound lift used to drive strength skill or load progression.
- Accessory: a supporting movement selected for transfer, hypertrophy, balance or limitation management.
- Direct set: a set where the target muscle is the primary mover in the analysis label.
- Indirect exposure: fractional stimulus from secondary muscles in compound exercises.
- Structurally reliable: a dataset program that is usable for pattern analysis after conservative quality screening.

## 5. Strength Programming

Evidence-informed rule: strength plans should prioritize specific main lifts, sufficient rest, controlled fatigue and progressive overload. Dataset-derived observation: strength-labeled reliable programs frequently expose major compound patterns early in sessions, but CSV frequency is not proof of optimal design. FORGE decision: future strength templates must avoid bodybuilding-style chest/back/chest redundancy and must keep accessories in service of the main lift.

## 6. Hypertrophy Programming

Evidence-informed rule: hypertrophy can be achieved across a broad loading spectrum when sets are sufficiently challenging and volume/recovery are managed. FORGE decision: hypertrophy templates should balance compound and isolation work, distribute priority-muscle volume, and prevent redundant same-angle exercise stacking. Dataset-derived observation: reliable hypertrophy categories commonly use moderate set and rep prescriptions, but the exact range should remain configurable.

## 7. Powerbuilding Programming

Powerbuilding must preserve strength-specific main-lift work while using accessory volume for hypertrophy. FORGE should separate strength block fatigue from accessory block fatigue and prevent heavy compounds from being stacked without a role.

## 8. General Fitness Programming

General fitness should prioritize movement-pattern coverage, adherence, moderate session complexity and safe progression. Dataset-derived general-fitness records are mixed and should be used cautiously.

## 9. Home And Bodyweight Programming

Home/bodyweight programming should progress through leverage, range of motion, tempo, pauses, unilateral variations, load alternatives and proximity to failure. Pulling-pattern limitations require minimum-equipment fallbacks such as bands, suspension trainers or rows when possible.

## 10. Yoga And Pilates Limitations

Requires Separate Domain Source. The supplied dataset does not meaningfully validate yoga or Pilates programming. FORGE needs separate professional review, movement taxonomies, contraindication rules, progression standards and scope boundaries before creating those templates.

## 11. Exercise Ordering

FORGE standard: technical main lifts and priority compounds usually appear before accessories. Isolation, core and conditioning appear later unless they are the session goal or warm-up/prehab. Dataset-derived first-exercise patterns must be filtered by goal because mobility programs often begin with drills/tests.

## 12. Movement-Pattern Balance

Templates should track horizontal push, vertical push, horizontal pull, vertical pull, squat, hinge, lunge, knee flexion, shoulder abduction, elbow flexion/extension, calf and core patterns. Missing major patterns can be acceptable only when the template goal explicitly excludes them.

## 13. Sets, Reps And Intensity

Dataset aggregate sets: ${statsLine(summary.aggregateStats.sets)}. Dataset aggregate reps: ${statsLine(summary.aggregateStats.reps)}. Evidence-informed decision: strength main lifts generally bias lower reps and higher loads, hypertrophy can use wider rep ranges, and accessories should match their role.

## 14. Weekly Volume

Volume guardrails are starting ranges, not universal truths. Direct and indirect exposure must be counted separately. Automatic physique-focus increases should be small and reversible.

## 15. Frequency

Frequency distributes volume and skill practice. It should be selected from goal, level, recovery and schedule, not enforced as a universal two-times-per-week rule.

## 16. Rest Intervals

CSV rest data is absent. Evidence-informed product guidance should use longer rest for heavy main lifts and adequate rest for hypertrophy performance, but must label this as external guidance, not dataset-derived.

## 17. RPE, RIR And Failure

CSV does not reliably encode RPE/RIR. FORGE should avoid repeated failure on main compounds, allow closer-to-failure isolation when appropriate, and use check-ins to adapt.

## 18. Progression Models

Progression is not reliably structured in the CSV files. Phase 2 templates should define progression explicitly: linear, double progression, top-set/back-off, percentage-based, RPE-based or block progression depending on goal and level.

## 19. Fatigue And Recovery

Fatigue management must consider axial loading, hinge density, pressing density, session length, cycle context, pain and recent performance. Recovery overrides aesthetic focus.

## 20. Deload Logic

Deloads should be block-specific or feedback-triggered. They are not mandatory in every plan, especially short beginner plans.

## 21. Exercise Substitutions

Substitutions must preserve role, movement pattern, equipment feasibility and limitation safety. A substitution should not convert a strength main lift into a random hypertrophy accessory unless the plan explicitly changes scope.

## 22. Focus-Muscle Specialization

Specialization should use minimum effective changes: reorder, substitute, add one to two direct sets, split volume across sessions or replace a redundant movement. The original template remains recognizable.

## 23. Physique-Analysis Adaptation Boundaries

Physique analysis is a soft signal. It can influence focus muscles, low-risk accessory choices and small volume changes. It cannot override goal, pain, equipment, days, recovery or safety constraints.

## 24. Session-Duration Adaptation

If duration is tight, reduce low-priority accessories first, not warm-up safety, main lift intent or required pulling balance.

## 25. Beginner Safeguards

Beginner templates should limit exercise count, avoid aggressive specialization, avoid high-frequency heavy deadlifting, and prefer simple repeatable progression.

## 26. Intermediate Programming

Intermediate templates can use more variation, upper/lower or PPL structures, top-set/back-off, double progression and controlled specialization.

## 27. Advanced-Programming Cautions

Advanced templates require stronger assumptions about recovery, technique and intent. FORGE should avoid assigning advanced blocks solely from enthusiasm or high goal ambition.

## 28. Validation Requirements

Future validators should reject impossible set/rep values, missing days, empty sessions, unsafe limitation conflicts, same-pattern redundancy, missing progression and duration mismatch.

## 29. Configurable Guardrails

All numeric limits are proposed defaults, not hard-coded truths. Guardrails live in configuration and can evolve with evidence and product data.

## 30. Open Research Questions

- Better direct/indirect set accounting by exercise.
- Reliable progression extraction from unstructured descriptions.
- Separate yoga/Pilates domain rules.
- User outcome data needed to validate FORGE-specific recommendations.

## 31. Source List

${sourceList}

## 32. Version History

- v1, ${summary.generatedAt}: Phase 1 dataset audit and programming constitution. No production workout behavior changed.
`;
}

function writeJson(filePath: string, value: unknown): void {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

export function runWorkoutDatasetAnalysis(): AnalysisSummary {
  const summaryData = readCsv(SUMMARY_FILE);
  const detailedData = readCsv(DETAILED_FILE);
  const { summary, qualityReports, clusters } = generateSummary(summaryData, detailedData);
  fs.mkdirSync(DERIVED_DIR, { recursive: true });
  fs.mkdirSync(DOCS_DIR, { recursive: true });
  writeJson(path.join(DERIVED_DIR, "workout-analysis-summary.json"), summary);
  writeJson(path.join(DERIVED_DIR, "program-quality-report.json"), qualityReports);
  writeJson(path.join(DERIVED_DIR, "program-clusters.json"), clusters);
  fs.writeFileSync(path.join(DOCS_DIR, "workout-dataset-audit-v1.md"), generateAuditDoc(summary, qualityReports));
  fs.writeFileSync(path.join(DOCS_DIR, "workout-pattern-analysis-v1.md"), generatePatternDoc(summary, clusters));
  fs.writeFileSync(path.join(DOCS_DIR, "forge-programming-guardrails-v1.md"), generateGuardrailsDoc(summary));
  fs.writeFileSync(path.join(DOCS_DIR, "forge-programming-bible-v1.md"), generateBibleDoc(summary));
  return summary;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const summary = runWorkoutDatasetAnalysis();
  console.log(JSON.stringify({
    rowCounts: summary.rowCounts,
    uniqueProgramCount: summary.uniqueProgramCount,
    qualityCounts: summary.qualityCounts,
    suspiciousValues: summary.suspiciousValues,
  }, null, 2));
}
