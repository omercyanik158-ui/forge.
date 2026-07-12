import type { CoachPreferences, UserProfile } from '@/types';
import type { CycleTrackingSummary } from './cycleTracking';
import { calorieGoal, macroGoals, mealTotals } from './calculations';
import { dateKey, localDateKeyFromIso, weekStartKey } from './dateUtils';
import { loadMeals } from './mealStore';
import { loadNutritionSummary } from './mealInsights';
import { loadStrengthProgress } from './strengthProgress';
import { loadWaterForWeight, loadWaterHistory } from './waterStore';
import { loadWorkoutInsights } from './workoutInsights';
import { loadWorkoutLogs } from './workoutStore';

export type CycleIntensity = 'normal' | 'lighter' | 'strong';

export function computeCycleIntensity(cycle?: CycleTrackingSummary | null): CycleIntensity {
  if (!cycle) return 'normal';
  if (cycle.phase === 'period' || cycle.phase === 'luteal') return 'lighter';
  if (cycle.phase === 'follicular' || cycle.phase === 'fertile' || cycle.phase === 'ovulation') return 'strong';
  return 'normal';
}

export type CycleAdjustable = { sets: number; rir: number; restSeconds?: number };

export function applyCycleIntensity<T extends CycleAdjustable>(exercise: T, intensity: CycleIntensity): T {
  if (intensity === 'lighter') {
    const restSeconds = typeof exercise.restSeconds === 'number'
      ? Math.round(exercise.restSeconds * 1.2)
      : exercise.restSeconds;
    return { ...exercise, sets: Math.max(2, exercise.sets - 1), rir: Math.min(4, exercise.rir + 1), restSeconds };
  }
  if (intensity === 'strong') {
    return { ...exercise, rir: Math.max(1, exercise.rir - 1) };
  }
  return exercise;
}

export type CoachSnapshot = {
  score: number;
  habits: { workout: number; nutrition: number; water: number };
  weekly: { sessions: number; minutes: number; volumeKg: number; mealDays: number; waterDays: number };
  nextAction: 'train' | 'recover' | 'log_meal' | 'drink_water';
  strengthSuggestion?: { exerciseName: string; kg: number; reps: number };
  cycle?: CycleTrackingSummary | null;
  cycleIntensity: CycleIntensity;
  recipes: { id: string; titleKey: string; detailKey: string; kcal: number; protein: number }[];
};

export async function loadCoachSnapshot(profile: UserProfile, preferences: CoachPreferences, cycle?: CycleTrackingSummary | null): Promise<CoachSnapshot> {
  const [workouts, workoutInsights, nutrition, meals, water, waterHistory, strength] = await Promise.all([
    loadWorkoutLogs(), loadWorkoutInsights(), loadNutritionSummary(), loadMeals(),
    loadWaterForWeight(profile.weightKg), loadWaterHistory(7), loadStrengthProgress(),
  ]);
  const today = dateKey();
  const weekStart = weekStartKey();
  const workoutDays = new Set(workouts.filter((log) => localDateKeyFromIso(log.completedAt) >= weekStart).map((log) => localDateKeyFromIso(log.completedAt))).size;
  const mealDays = nutrition.activeDays;
  const waterDays = waterHistory.filter((item) => item.ml >= item.goalMl * 0.8).length;
  const habits = {
    workout: Math.min(100, Math.round((workoutDays / 3) * 100)),
    nutrition: Math.min(100, Math.round((mealDays / 7) * 100)),
    water: Math.min(100, Math.round((waterDays / 7) * 100)),
  };
  const todayMeals = meals.filter((meal) => localDateKeyFromIso(meal.createdAt) === today);
  const totals = mealTotals(todayMeals);
  const remaining = Math.max(0, calorieGoal(profile) - totals.kcal);
  const proteinRemaining = Math.max(0, macroGoals(profile).proteinG - totals.protein);
  const latestWorkout = workouts[0]?.completedAt ? localDateKeyFromIso(workouts[0].completedAt) : null;
  const daysSinceWorkout = latestWorkout ? Math.max(0, Math.round((new Date(`${today}T12:00:00`).getTime() - new Date(`${latestWorkout}T12:00:00`).getTime()) / 86400000)) : 7;
  const latestStrength = strength.exercises.find((item) => item.latestRecord.kg > 0);
  const increase = latestStrength && latestStrength.latestRecord.reps >= 8 ? (latestStrength.latestRecord.kg >= 40 ? 2.5 : 1) : 0;
  const recipes = proteinRemaining > 35
    ? [{ id: 'protein-bowl', titleKey: 'coach.recipe_protein_bowl', detailKey: 'coach.recipe_protein_bowl_detail', kcal: Math.min(remaining || 480, 480), protein: 42 }]
    : [{ id: 'balanced-wrap', titleKey: 'coach.recipe_balanced_wrap', detailKey: 'coach.recipe_balanced_wrap_detail', kcal: Math.min(remaining || 390, 390), protein: 28 }];
  if (preferences.equipment === 'bodyweight') recipes.push({ id: 'yogurt', titleKey: 'coach.recipe_yogurt', detailKey: 'coach.recipe_yogurt_detail', kcal: 260, protein: 24 });

  return {
    score: Math.round(habits.workout * 0.4 + habits.nutrition * 0.3 + habits.water * 0.3),
    habits,
    weekly: { sessions: workoutInsights.weekly.sessions, minutes: workoutInsights.weekly.minutes, volumeKg: workoutInsights.weekly.volumeKg, mealDays, waterDays },
    nextAction: water.ml < water.goalMl * 0.5 ? 'drink_water' : todayMeals.length === 0 ? 'log_meal' : daysSinceWorkout >= 2 ? 'train' : 'recover',
    strengthSuggestion: latestStrength ? { exerciseName: latestStrength.exerciseName, kg: Math.round((latestStrength.latestRecord.kg + increase) * 2) / 2, reps: latestStrength.latestRecord.reps } : undefined,
    cycle,
    cycleIntensity: computeCycleIntensity(cycle),
    recipes,
  };
}
