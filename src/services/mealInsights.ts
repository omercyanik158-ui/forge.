import { mealTotals } from '@/services/calculations';
import { addDays, dateKey, formatDateLabel, localDateKeyFromIso, weekStartKey } from '@/services/dateUtils';
import { formatDate, formatMessage } from '@/services/localization';
import { loadMeals } from '@/services/mealStore';

type MacroTotals = {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type PeriodSummary = MacroTotals & {
  label: string;
  mealCount: number;
};

export type DailyNutritionPoint = PeriodSummary & {
  date: string;
};

export type NutritionSummary = {
  daily: PeriodSummary;
  weekly: PeriodSummary;
  monthly: PeriodSummary;
  last7Days: DailyNutritionPoint[];
  // Daily average across the current week. Uses a 7-day base so the pace
  // stays comparable even before a full week of logging exists.
  weeklyDailyAverage: number;
  // Average over the days that actually have at least one logged meal.
  activeDayAverage: number;
  activeDays: number;
  weeklyDaysElapsed: number;
  monthlyDaysElapsed: number;
};

function monthStartKey(fromDate: Date = new Date()): string {
  const copy = new Date(fromDate);
  copy.setDate(1);
  return dateKey(copy);
}

function shortDayLabel(key: string): string {
  return formatDate(`${key}T12:00:00`, { weekday: 'short' });
}

export async function loadNutritionSummary(referenceDate: Date = new Date()): Promise<NutritionSummary> {
  const meals = await loadMeals();
  const todayKey = dateKey(referenceDate);
  const weeklyStart = weekStartKey(referenceDate);
  const monthlyStart = monthStartKey(referenceDate);

  const dailyMeals = meals.filter((meal) => localDateKeyFromIso(meal.createdAt) === todayKey);
  const weeklyMeals = meals.filter((meal) => {
    const key = localDateKeyFromIso(meal.createdAt);
    return key >= weeklyStart && key <= todayKey;
  });
  const monthlyMeals = meals.filter((meal) => {
    const key = localDateKeyFromIso(meal.createdAt);
    return key >= monthlyStart && key <= todayKey;
  });
  const last7Days = Array.from({ length: 7 }, (_, index) => {
    const key = addDays(weeklyStart, index);
    const dayMeals = meals.filter((meal) => localDateKeyFromIso(meal.createdAt) === key);
    return {
      date: key,
      label: shortDayLabel(key),
      mealCount: dayMeals.length,
      ...mealTotals(dayMeals),
    };
  });

  const weeklyTotals = mealTotals(weeklyMeals);
  const activeDays = last7Days.filter((point) => point.mealCount > 0).length;
  const activeDayAverage = activeDays > 0 ? weeklyTotals.kcal / activeDays : 0;

  return {
    daily: { label: formatDateLabel(todayKey), mealCount: dailyMeals.length, ...mealTotals(dailyMeals) },
    weekly: {
      label: todayKey === dateKey() ? formatMessage({ tr: 'Bu Hafta', en: 'This Week' }) : formatMessage({ tr: 'Seçili Hafta', en: 'Selected Week' }),
      mealCount: weeklyMeals.length,
      ...weeklyTotals,
    },
    monthly: {
      label: todayKey === dateKey() ? formatMessage({ tr: 'Bu Ay', en: 'This Month' }) : formatDate(referenceDate, { month: 'long' }),
      mealCount: monthlyMeals.length,
      ...mealTotals(monthlyMeals),
    },
    last7Days,
    weeklyDailyAverage: Math.round(weeklyTotals.kcal / 7),
    activeDayAverage: Math.round(activeDayAverage),
    activeDays,
    weeklyDaysElapsed: Math.max(1, Math.min(7, Math.floor((new Date(`${todayKey}T12:00:00`).getTime() - new Date(`${weeklyStart}T12:00:00`).getTime()) / 86400000) + 1)),
    monthlyDaysElapsed: referenceDate.getDate(),
  };
}
