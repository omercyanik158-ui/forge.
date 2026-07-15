import { CSV_PROGRAMS } from '@/data/trainingCatalog.generated';
import type { Program, WarmupItem } from '@/types';
import { hasExercise } from './exerciseCatalog';
import { normalizedText } from './textUtils';

export type ProgramExercisePrescription = {
  exerciseId: string;
  sets: number;
  reps: number;
  repLabel: string;
  restSeconds: number;
  rir: number;
  alternatives: string[];
};

export type ProgramDay = {
  id: string;
  title: string;
  subtitle: string;
  durationMin: number;
  difficulty: string;
  warmup?: WarmupItem[];
  exercises: ProgramExercisePrescription[];
  exerciseIds: string[];
  notes: string;
};

export type ProgramWeek = {
  id: string;
  title: string;
  guidance: string;
  days: ProgramDay[];
};

export type ProgramPlan = Program & {
  weeks: ProgramWeek[];
};

export const PROGRAM_STYLE_OPTIONS = ['Tümü', 'Full Body', 'Upper/Lower', 'Powerlifting', 'Powerbuilding', 'Split', 'Pilates', 'Yoga', 'Home Fitness'] as const;
export const PROGRAM_DIFFICULTY_OPTIONS = ['Tümü', 'Başlangıç', 'Orta', 'Zor'] as const;
export const PROGRAM_DAY_OPTIONS = ['Tümü', 3, 4, 5] as const;

export type ProgramStyleFilter = (typeof PROGRAM_STYLE_OPTIONS)[number];
export type ProgramDifficultyFilter = (typeof PROGRAM_DIFFICULTY_OPTIONS)[number];
export type ProgramDayFilter = (typeof PROGRAM_DAY_OPTIONS)[number];

export type ProgramDiscoveryFilters = {
  query?: string;
  style?: ProgramStyleFilter;
  difficulty?: ProgramDifficultyFilter;
  daysPerWeek?: ProgramDayFilter;
};

export const CSV_RECOMMENDED_PROGRAMS: ProgramPlan[] = CSV_PROGRAMS;
export const ALL_PROGRAMS: ProgramPlan[] = CSV_PROGRAMS;
export const FREE_PROGRAMS: ProgramPlan[] = CSV_PROGRAMS.filter((program) => program.tier === 'free');
export const PREMIUM_PROGRAMS: ProgramPlan[] = CSV_PROGRAMS.filter((program) => program.tier === 'premium');

function foldSearchText(value: string): string {
  return normalizedText(value)
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u');
}

export function filterProgramPlans(programs: ProgramPlan[], filters: ProgramDiscoveryFilters): ProgramPlan[] {
  const query = foldSearchText(filters.query ?? '');
  const style = filters.style ?? 'Tümü';
  const difficulty = filters.difficulty ?? 'Tümü';
  const days = filters.daysPerWeek ?? 'Tümü';

  return programs.filter((program) => {
    if (style !== 'Tümü' && program.trainingStyle !== style) return false;
    if (difficulty !== 'Tümü' && program.difficultyLevel !== difficulty) return false;
    if (days !== 'Tümü' && program.daysPerWeek !== days) return false;
    if (!query) return true;

    return foldSearchText([
      program.title,
      program.summary,
      program.focus,
      program.goal,
      program.trainingStyle,
      program.equipment,
      ...program.searchTerms,
    ].join(' ')).includes(query);
  });
}

export function getProgramById(programId: string): ProgramPlan | undefined {
  return ALL_PROGRAMS.find((program) => program.id === programId);
}

export function getProgramDayCount(program: ProgramPlan): number {
  return program.weeks.reduce((sum, week) => sum + week.days.length, 0);
}

export function validateProgramCatalog(): string[] {
  const failures: string[] = [];

  for (const program of ALL_PROGRAMS) {
    for (const week of program.weeks) {
      for (const programDay of week.days) {
        for (const exercise of programDay.exercises) {
          if (!hasExercise(exercise.exerciseId)) failures.push(`${program.title}: ${exercise.exerciseId} bulunamadı`);
          if (exercise.sets < 1 || exercise.reps < 1) failures.push(`${program.title}: geçersiz set/tekrar`);
        }
      }
    }
  }

  return failures;
}
