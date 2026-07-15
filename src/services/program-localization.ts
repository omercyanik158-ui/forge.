import type { ProgramPlan } from './programCatalog';
import type { AppLanguage } from './localization';

const DIFFICULTY_EN: Record<string, string> = {
  Başlangıç: 'Beginner',
  Orta: 'Intermediate',
  Zor: 'Advanced',
};

const GOAL_EN: Record<string, string> = {
  'Genel Form': 'General Fitness',
  'Kas Gelişimi': 'Muscle Growth',
  Güç: 'Strength',
  'Güç + Kas': 'Strength + Muscle',
};

function repLabelEn(value: string): string {
  return value
    .replace(/^Her bacak\s*/i, 'Each leg ')
    .replace(/tekrar/gi, 'reps')
    .replace(/\bsn\b/gi, 'sec');
}

export function localizeProgramPlan(program: ProgramPlan, language: AppLanguage): ProgramPlan {
  if (language === 'tr') return program;

  const difficulty = DIFFICULTY_EN[program.difficultyLevel] ?? program.difficultyLevel;
  return {
    ...program,
    duration: `${program.weeks.length} Weeks`,
    sub: `${program.weeks.length} weeks · ${program.daysPerWeek} days · ${difficulty}`,
    difficultyLevel: difficulty as ProgramPlan['difficultyLevel'],
    goal: (GOAL_EN[program.goal] ?? program.goal) as ProgramPlan['goal'],
    weeks: program.weeks.map((week, weekIndex) => ({
      ...week,
      title: `Week ${weekIndex + 1}`,
      guidance: weekIndex === 0
        ? 'Use the first week to find clean technique and appropriate working loads.'
        : 'Progress with clean repetitions and small load increases while preserving form.',
      days: week.days.map((day, dayIndex) => ({
        ...day,
        title: `Day ${dayIndex + 1}`,
        difficulty: DIFFICULTY_EN[day.difficulty] ?? day.difficulty,
        notes: day.notes.replace('içinden normalize edildi', 'normalized from the CSV catalog'),
        exercises: day.exercises.map((exercise) => ({
          ...exercise,
          repLabel: repLabelEn(exercise.repLabel),
        })),
      })),
    })),
  };
}

export function localizeProgramPlans(programs: ProgramPlan[], language: AppLanguage): ProgramPlan[] {
  return programs.map((program) => localizeProgramPlan(program, language));
}
