import type { ActivityLevel, Meal, UserProfile } from '@/types';

const ACTIVITY_FACTOR: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const DEFAULT_DAILY_CALORIE_GOAL = 2500;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function navyBodyFat(p: Pick<UserProfile, 'gender' | 'heightCm' | 'neckCm' | 'waistCm' | 'hipCm'>): number | null {
  const { gender, heightCm, neckCm, waistCm, hipCm } = p;
  if (heightCm <= 0 || neckCm <= 0 || waistCm <= 0) return null;

  if (gender === 'male') {
    const diff = waistCm - neckCm;
    if (diff <= 0) return null;
    const pct = 495 / (1.0324 - 0.19077 * Math.log10(diff) + 0.15456 * Math.log10(heightCm)) - 450;
    if (!Number.isFinite(pct)) return null;
    return clamp(Math.round(pct * 10) / 10, 2, 60);
  }

  if (hipCm == null || hipCm <= 0) return null;
  const diff = waistCm + hipCm - neckCm;
  if (diff <= 0) return null;
  const pct = 495 / (1.29579 - 0.35004 * Math.log10(diff) + 0.221 * Math.log10(heightCm)) - 450;
  if (!Number.isFinite(pct)) return null;
  return clamp(Math.round(pct * 10) / 10, 2, 60);
}

export function bmr(p: Pick<UserProfile, 'gender' | 'weightKg' | 'heightCm' | 'age'>): number {
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age;
  return p.gender === 'male' ? base + 5 : base - 161;
}

export function tdee(p: Pick<UserProfile, 'gender' | 'weightKg' | 'heightCm' | 'age' | 'activityLevel'>): number {
  return bmr(p) * ACTIVITY_FACTOR[p.activityLevel];
}

export function calorieGoal(
  p: Pick<UserProfile, 'gender' | 'weightKg' | 'heightCm' | 'age' | 'activityLevel' | 'goalType'>,
): number {
  const base = tdee(p);
  const minimumGoal = p.gender === 'male' ? 1500 : 1200;
  const goalAdjusted = p.goalType === 'loss' ? base - 500 : p.goalType === 'gain' ? base + 500 : base;
  return Math.round(clamp(goalAdjusted, minimumGoal, 5000));
}

export function macroGoals(
  p: Pick<UserProfile, 'gender' | 'weightKg' | 'heightCm' | 'age' | 'activityLevel' | 'goalType'>,
): { proteinG: number; carbsG: number; fatG: number } {
  const calories = calorieGoal(p);
  const proteinG = Math.round(p.weightKg * (p.goalType === 'maintain' ? 1.6 : 1.8));
  const fatG = Math.round(p.weightKg * 0.8);
  const remainingCalories = Math.max(0, calories - proteinG * 4 - fatG * 9);
  return { proteinG, carbsG: Math.round(remainingCalories / 4), fatG };
}

export function macroGoalsFromCalories(goal: number): { proteinG: number; carbsG: number; fatG: number } {
  return {
    proteinG: Math.round((0.3 * goal) / 4),
    carbsG: Math.round((0.4 * goal) / 4),
    fatG: Math.round((0.3 * goal) / 9),
  };
}

export function goalProgress(
  p: Pick<UserProfile, 'weightKg' | 'startWeightKg' | 'targetWeightKg' | 'goalType'>,
): { pct: number; remainingKg: number } | null {
  if (!p.goalType || p.goalType === 'maintain' || p.targetWeightKg == null) return null;

  const start = p.startWeightKg ?? p.weightKg;
  const target = p.targetWeightKg;
  const total = Math.abs(target - start);
  if (total === 0) return { pct: 100, remainingKg: 0 };

  const moved = p.goalType === 'loss' ? start - p.weightKg : p.weightKg - start;
  const pct = Math.round((Math.max(0, moved) / total) * 100);
  return {
    pct: Math.min(Math.max(pct, 0), 100),
    remainingKg: Math.max(Math.abs(target - p.weightKg), 0),
  };
}

export function mealTotals(meals: Meal[]): { kcal: number; protein: number; carbs: number; fat: number } {
  return meals.reduce(
    (acc, m) => ({
      kcal: acc.kcal + m.kcal,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
}
