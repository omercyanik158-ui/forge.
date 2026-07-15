import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { FORGE_PROGRAM_TEMPLATES } from '@/workout-programming/generated/templates.generated';
import { FORGE_PROGRESSION_RULES } from '@/workout-programming/generated/progressionRules.generated';
import {
  defaultProgressionRule,
  inferEquipmentKind,
  validateAllActiveTemplateSemantics,
  validateTemplateSemantics,
} from '@/workout-programming';
import { ruleTypeFromGeneratedRule } from '@/workout-programming/progression/progressionUtils';

type CsvRow = Record<string, string>;

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

function readTemplateExerciseCsv(): CsvRow[] {
  const file = path.join(process.cwd(), 'data/forge_workout_csv_pack/forge_template_exercises.csv');
  const lines = fs.readFileSync(file, 'utf-8').trim().split(/\r?\n/);
  const headers = parseCsvLine(lines[0]!);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));
  });
}

const allExercises = FORGE_PROGRAM_TEMPLATES.flatMap((template) =>
  template.workouts.flatMap((day) =>
    day.exercises.map((exercise) => ({ template, day, exercise })),
  ),
);

const knownRuleIds = new Set(FORGE_PROGRESSION_RULES.map((rule) => rule.progressionRuleId));
const strengthTypes = new Set(['linear_load', 'percentage_based', 'top_set_backoff']);
const accessoryTypes = new Set(['double_progression', 'rep_range', 'linear_reps', 'fixed_load']);
const hypertrophyTypes = new Set(['double_progression', 'rep_range', 'linear_reps']);

describe('Phase 5 explicit exercise-level progression rule assignments', () => {
  it('every progressible exercise across all 26 templates has an explicit known rule', () => {
    expect(FORGE_PROGRAM_TEMPLATES).toHaveLength(26);
    expect(allExercises).toHaveLength(564);
    expect(allExercises.every(({ exercise }) => !!exercise.progressionRuleId)).toBe(true);
    expect(allExercises.every(({ exercise }) => knownRuleIds.has(exercise.progressionRuleId))).toBe(true);
  });

  it('main strength lifts use compatible strength rules and strength accessories may use accessory rules', () => {
    for (const { template, exercise } of allExercises.filter((item) => item.template.goal === 'strength')) {
      const ruleType = ruleTypeFromGeneratedRule(exercise.progressionRuleId, template.goal, exercise.role);
      if (exercise.role === 'main_lift' && exercise.required) {
        expect(strengthTypes.has(ruleType)).toBe(true);
      } else {
        expect(strengthTypes.has(ruleType) || accessoryTypes.has(ruleType)).toBe(true);
      }
    }
  });

  it('hypertrophy compounds and isolations use hypertrophy-compatible rules', () => {
    for (const { template, exercise } of allExercises.filter((item) => item.template.goal === 'hypertrophy')) {
      const ruleType = ruleTypeFromGeneratedRule(exercise.progressionRuleId, template.goal, exercise.role);
      if (['secondary_compound', 'accessory_compound', 'isolation'].includes(exercise.role)) {
        expect(hypertrophyTypes.has(ruleType)).toBe(true);
      }
      if (exercise.role === 'isolation') {
        expect(strengthTypes.has(ruleType)).toBe(false);
      }
    }
  });

  it('powerbuilding main lifts and accessories use different compatible rule families', () => {
    const mainTypes = new Set<string>();
    const accessoryRuleTypes = new Set<string>();
    for (const { template, exercise } of allExercises.filter((item) => item.template.goal === 'powerbuilding')) {
      const ruleType = ruleTypeFromGeneratedRule(exercise.progressionRuleId, template.goal, exercise.role);
      if (exercise.role === 'main_lift') mainTypes.add(ruleType);
      else accessoryRuleTypes.add(ruleType);
    }
    expect(mainTypes).toContain('top_set_backoff');
    expect(accessoryRuleTypes).toContain('double_progression');
    expect([...mainTypes].some((type) => accessoryRuleTypes.has(type))).toBe(false);
  });

  it('bodyweight exercises and conditioning do not receive load-based progression', () => {
    for (const { template, exercise } of allExercises) {
      const equipmentKind = inferEquipmentKind(exercise.equipment);
      const ruleType = ruleTypeFromGeneratedRule(exercise.progressionRuleId, template.goal, exercise.role);
      if (equipmentKind === 'bodyweight') {
        expect(['linear_reps', 'fixed_load', 'time_based', 'distance_based']).toContain(ruleType);
      }
      if (exercise.role === 'conditioning') {
        expect(['time_based', 'distance_based']).toContain(ruleType);
      }
    }
  });

  it('missing exercise-level rule fails closed and template-level rule is not silently used', () => {
    const template = FORGE_PROGRAM_TEMPLATES[0]!;
    const exercise = template.workouts[0]!.exercises[0]!;
    const resolved = defaultProgressionRule({
      ruleId: undefined,
      goal: template.goal,
      role: exercise.role,
      sets: exercise.sets,
      repsMin: exercise.repsMin,
      repsMax: exercise.repsMax,
      equipmentKind: inferEquipmentKind(exercise.equipment),
    });
    expect(resolved).toBeNull();
  });

  it('unknown exercise-level rule fails semantic validation', () => {
    const template = JSON.parse(JSON.stringify(FORGE_PROGRAM_TEMPLATES[0]!)) as {
      [key: string]: unknown;
      workouts: Array<{
        exercises: Array<Record<string, unknown> & { progressionRuleId: string }>;
      }>;
    };
    template.workouts[0]!.exercises[0]!.progressionRuleId = 'unknown_rule';
    const result = validateTemplateSemantics(template as Parameters<typeof validateTemplateSemantics>[0]);
    expect(result.errors.some((issue) => issue.code === 'UNKNOWN_PROGRESSION_RULE')).toBe(true);
  });

  it('production semantic validation has zero explicit progression errors', () => {
    const results = validateAllActiveTemplateSemantics();
    const progressionErrors = results.flatMap((result) =>
      result.errors.filter((issue) => issue.code.startsWith('PROGRESSION_RULE') || issue.code.includes('PROGRESSION')),
    );
    expect(progressionErrors).toEqual([]);
  });

  it('generated TypeScript exactly matches CSV exercise progression assignments', () => {
    const csvRows = readTemplateExerciseCsv();
    const csvMap = new Map(csvRows.map((row) => [
      `${row.template_id}:${row.day_index}:${row.exercise_order}:${row.exercise_id}`,
      row.progression_rule_id,
    ]));
    for (const { template, day, exercise } of allExercises) {
      const key = `${template.templateId}:${day.dayIndex}:${exercise.order}:${exercise.canonicalExerciseId}`;
      expect(exercise.progressionRuleId).toBe(csvMap.get(key));
    }
  });

  it('every exercise success, partial and failure fixture resolves its own rule', () => {
    for (const { template, exercise } of allExercises) {
      const rule = defaultProgressionRule({
        ruleId: exercise.progressionRuleId,
        goal: template.goal,
        role: exercise.role,
        sets: exercise.sets,
        repsMin: exercise.repsMin,
        repsMax: exercise.repsMax,
        equipmentKind: inferEquipmentKind(exercise.equipment),
      });
      expect(rule?.ruleId).toBe(exercise.progressionRuleId);
    }
  });
});
