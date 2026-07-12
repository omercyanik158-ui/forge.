import { addDays, dateKey, localDateKeyFromIso, weekStartKey } from './dateUtils';
import { formatDate, formatMessage } from './localization';
import { loadWorkoutLogs } from './workoutStore';

export type WorkoutPeriodSummary = {
  label: string;
  sessions: number;
  minutes: number;
  kcal: number;
  sets: number;
  volumeKg: number;
};

export type DailyWorkoutPoint = WorkoutPeriodSummary & {
  date: string;
};

export type WorkoutInsights = {
  weekly: WorkoutPeriodSummary;
  monthly: WorkoutPeriodSummary;
  last7Days: DailyWorkoutPoint[];
  topMuscleGroups: { name: string; count: number }[];
  recentSources: { exercise: number; program: number; custom: number };
};

function monthStartKey(fromDate: Date = new Date()): string {
  const copy = new Date(fromDate);
  copy.setDate(1);
  return dateKey(copy);
}

function shortDayLabel(key: string): string {
  return formatDate(`${key}T12:00:00`, { weekday: 'short' });
}

type WorkoutLogs = Awaited<ReturnType<typeof loadWorkoutLogs>>;

function summarize(label: string, logs: WorkoutLogs): WorkoutPeriodSummary {
  return logs.reduce(
    (acc, log) => ({
      label,
      sessions: acc.sessions + 1,
      minutes: acc.minutes + log.durationMin,
      kcal: acc.kcal + log.kcal,
      sets: acc.sets + (log.setEntries?.length ?? 0),
      volumeKg: acc.volumeKg + (log.setEntries?.reduce((sum, entry) => sum + entry.kg * entry.reps, 0) ?? 0),
    }),
    { label, sessions: 0, minutes: 0, kcal: 0, sets: 0, volumeKg: 0 },
  );
}

export async function loadWorkoutInsights(referenceDate: Date = new Date()): Promise<WorkoutInsights> {
  const logs = await loadWorkoutLogs();
  const weeklyStart = weekStartKey(referenceDate);
  const monthlyStart = monthStartKey(referenceDate);

  const referenceKey = dateKey(referenceDate);
  const weeklyLogs = logs.filter((log) => {
    const key = localDateKeyFromIso(log.completedAt);
    return key >= weeklyStart && key <= referenceKey;
  });
  const monthlyLogs = logs.filter((log) => {
    const key = localDateKeyFromIso(log.completedAt);
    return key >= monthlyStart && key <= referenceKey;
  });
  const last7Days = Array.from({ length: 7 }, (_, index) => {
    const key = addDays(weeklyStart, index);
    const dayLogs = logs.filter((log) => localDateKeyFromIso(log.completedAt) === key);
    return {
      date: key,
      ...summarize(shortDayLabel(key), dayLogs),
    };
  });

  const counts = new Map<string, number>();
  for (const log of monthlyLogs) {
    for (const group of log.muscleGroups ?? []) {
      counts.set(group, (counts.get(group) ?? 0) + 1);
    }
  }

  const topMuscleGroups = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, count]) => ({ name, count }));

  const recentSources = monthlyLogs.reduce(
    (acc, log) => ({
      exercise: acc.exercise + (log.source === 'exercise' ? 1 : 0),
      program: acc.program + (log.source === 'program' ? 1 : 0),
      custom: acc.custom + (log.source === 'custom' ? 1 : 0),
    }),
    { exercise: 0, program: 0, custom: 0 },
  );

  return {
    weekly: summarize(formatMessage({ tr: 'Bu Hafta', en: 'This Week' }), weeklyLogs),
    monthly: summarize(formatMessage({ tr: 'Bu Ay', en: 'This Month' }), monthlyLogs),
    last7Days,
    topMuscleGroups,
    recentSources,
  };
}
