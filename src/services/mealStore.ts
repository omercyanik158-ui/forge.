import type { Meal } from '@/types';
import { isSameDateKey } from './dateUtils';
import { loadStoredValue, removeStoredValue, saveStoredValue } from './safeStorage';
import { STORAGE_KEYS } from './storageRegistry';

function isMeal(value: unknown): value is Meal {
  return !!value && typeof value === 'object' && typeof (value as Meal).id === 'string' && typeof (value as Meal).createdAt === 'string';
}

function isMealArray(value: unknown): value is Meal[] {
  return Array.isArray(value) && value.every(isMeal);
}

export async function loadMeals(): Promise<Meal[]> {
  return loadStoredValue<Meal[]>({
    key: STORAGE_KEYS.meals,
    fallback: [],
    validate: isMealArray,
  });
}

export async function loadMealsForDate(date: string): Promise<Meal[]> {
  const meals = await loadMeals();
  return meals.filter((meal) => isSameDateKey(meal.createdAt, date));
}

export async function saveMeal(meal: Meal): Promise<Meal[]> {
  const meals = await loadMeals();
  const updated = [meal, ...meals];
  await saveStoredValue(STORAGE_KEYS.meals, updated);
  return updated;
}

export async function deleteMeal(id: string): Promise<Meal[]> {
  const meals = await loadMeals();
  const updated = meals.filter((meal) => meal.id !== id);
  await saveStoredValue(STORAGE_KEYS.meals, updated);
  return updated;
}

export async function clearMeals(): Promise<void> {
  await removeStoredValue(STORAGE_KEYS.meals);
}
