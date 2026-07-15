import { describe, expect, it } from 'vitest';
import { CSV_EXERCISES, CSV_PROGRAMS, TRAINING_CATALOG_IMPORT_META } from '@/data/trainingCatalog.generated';
import { hasExercise, searchExercises } from '@/services/exerciseCatalog';
import { FORGE_REVIEWED_EXERCISES } from '@/workout-programming/data/exerciseIdMap';
import {
  ALL_PROGRAMS,
  CSV_RECOMMENDED_PROGRAMS,
  FREE_PROGRAMS,
  PREMIUM_PROGRAMS,
  filterProgramPlans,
  getProgramById,
  getProgramDayCount,
  validateProgramCatalog,
} from '@/services/programCatalog';

describe('CSV-only program catalog', () => {
  it('uses the generated CSV catalog as the only program source', () => {
    expect(ALL_PROGRAMS).toBe(CSV_PROGRAMS);
    expect(CSV_RECOMMENDED_PROGRAMS).toBe(CSV_PROGRAMS);
    expect(FREE_PROGRAMS.length).toBeGreaterThan(0);
    expect(PREMIUM_PROGRAMS.length).toBeGreaterThan(0);
    expect(getProgramById('kadin-pilates-akisi')).toBeUndefined();
    expect(getProgramById('forge-start-full-body')).toBeUndefined();
  });

  it('keeps every program exercise connected to the CSV exercise catalog', () => {
    expect(validateProgramCatalog()).toEqual([]);
    for (const program of ALL_PROGRAMS) {
      expect(getProgramDayCount(program)).toBeGreaterThan(0);
      for (const week of program.weeks) {
        for (const day of week.days) {
          expect(day.exercises.length).toBeGreaterThan(0);
          for (const exercise of day.exercises) {
            expect(hasExercise(exercise.exerciseId)).toBe(true);
            expect(exercise.sets).toBeGreaterThan(0);
            expect(exercise.reps).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  it('searches generated CSV exercises plus reviewed FORGE mappings', () => {
    const results = searchExercises('bench');
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((exercise) => exercise.id.startsWith('csv-') || exercise.id.startsWith('forge-'))).toBe(true);
    expect(searchExercises('').length).toBe(CSV_EXERCISES.length + FORGE_REVIEWED_EXERCISES.length);
  });

  it('filters generated programs by discoverable metadata', () => {
    const upperLower = filterProgramPlans(ALL_PROGRAMS, { style: 'Upper/Lower' });
    const threeDay = filterProgramPlans(ALL_PROGRAMS, { daysPerWeek: 3 });
    const query = filterProgramPlans(ALL_PROGRAMS, { query: ALL_PROGRAMS[0]!.title.slice(0, 4) });

    expect(upperLower.every((program) => program.trainingStyle === 'Upper/Lower')).toBe(true);
    expect(threeDay.every((program) => program.daysPerWeek === 3)).toBe(true);
    expect(query.length).toBeGreaterThan(0);
  });

  it('records the CSV import report metadata', () => {
    expect(TRAINING_CATALOG_IMPORT_META.selectedPrograms).toBe(ALL_PROGRAMS.length);
    expect(TRAINING_CATALOG_IMPORT_META.selectedExercises).toBe(CSV_EXERCISES.length);
    expect(TRAINING_CATALOG_IMPORT_META.failures).toEqual([]);
  });
});
