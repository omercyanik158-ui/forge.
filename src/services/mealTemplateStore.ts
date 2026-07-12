import type { Meal } from '@/types';
import { loadMeals } from './mealStore';
import { loadStoredValue, removeStoredValue, saveStoredValue } from './safeStorage';
import { STORAGE_KEYS } from './storageRegistry';
import { isStringArray } from './storageValidators';

export type MealTemplate = {
  id: string;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  portion: string;
  imageUrl?: string;
  source: 'saved' | 'history';
  createdAt?: string;
};

export function mealToTemplate(meal: Meal): MealTemplate {
  return {
    id: `${meal.name}-${meal.portion}`.toLocaleLowerCase('tr-TR'),
    name: meal.name,
    kcal: meal.kcal,
    protein: meal.protein,
    carbs: meal.carbs,
    fat: meal.fat,
    portion: meal.portion,
    imageUrl: meal.imageUrl,
    source: 'history',
  };
}

function isMealTemplate(value: unknown): value is MealTemplate {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<MealTemplate>;
  return (
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.kcal === 'number' &&
    typeof item.protein === 'number' &&
    typeof item.carbs === 'number' &&
    typeof item.fat === 'number' &&
    typeof item.portion === 'string'
  );
}

function isMealTemplateArray(value: unknown): value is MealTemplate[] {
  return Array.isArray(value) && value.every(isMealTemplate);
}

function templateSignature(template: MealTemplate): string {
  return `${template.name}|${template.portion}|${template.kcal}|${template.protein}|${template.carbs}|${template.fat}`.toLocaleLowerCase('tr-TR');
}

async function loadDismissedSignatures(): Promise<string[]> {
  return loadStoredValue<string[]>({ key: STORAGE_KEYS.dismissedMealTemplates, fallback: [], validate: isStringArray });
}

export async function loadSavedMealTemplates(): Promise<MealTemplate[]> {
  const stored = await loadStoredValue<MealTemplate[]>({
    key: STORAGE_KEYS.mealTemplates,
    fallback: [],
    validate: isMealTemplateArray,
  });

  return stored.map((template) => ({ ...template, source: 'saved' }));
}

export async function saveMealAsFavoriteTemplate(meal: Meal): Promise<MealTemplate> {
  const templates = await loadSavedMealTemplates();
  const fromMeal = mealToTemplate(meal);
  const signature = templateSignature(fromMeal);
  const dismissed = (await loadDismissedSignatures()).filter((item) => item !== signature);
  const existing = templates.find((template) => templateSignature(template) === signature);
  const template = existing ?? {
    ...fromMeal,
    id: `saved-${Date.now()}`,
    source: 'saved' as const,
    createdAt: new Date().toISOString(),
  };

  if (!existing) {
    await saveStoredValue(STORAGE_KEYS.mealTemplates, [template, ...templates]);
  }

  const favorites = new Set(await loadFavoriteMealTemplateIds());
  favorites.add(template.id);
  await Promise.all([
    saveStoredValue(STORAGE_KEYS.mealTemplateFavorites, [...favorites]),
    saveStoredValue(STORAGE_KEYS.dismissedMealTemplates, dismissed),
  ]);
  return template;
}

export async function deleteSavedMealTemplate(templateId: string): Promise<void> {
  const [templates, favoriteIds] = await Promise.all([loadSavedMealTemplates(), loadFavoriteMealTemplateIds()]);
  const removed = templates.find((template) => template.id === templateId);
  const dismissed = new Set(await loadDismissedSignatures());
  if (removed) dismissed.add(templateSignature(removed));
  await Promise.all([
    saveStoredValue(STORAGE_KEYS.mealTemplates, templates.filter((template) => template.id !== templateId)),
    saveStoredValue(STORAGE_KEYS.mealTemplateFavorites, favoriteIds.filter((id) => id !== templateId)),
    saveStoredValue(STORAGE_KEYS.dismissedMealTemplates, [...dismissed]),
  ]);
}

export async function loadMealTemplates(limit = 24): Promise<MealTemplate[]> {
  const [savedTemplates, meals, dismissedSignatures] = await Promise.all([loadSavedMealTemplates(), loadMeals(), loadDismissedSignatures()]);
  const dismissed = new Set(dismissedSignatures);
  const seen = new Set<string>();
  const templates: MealTemplate[] = [];

  for (const template of savedTemplates) {
    const signature = templateSignature(template);
    if (dismissed.has(signature)) continue;
    if (seen.has(signature)) continue;
    seen.add(signature);
    templates.push(template);
    if (templates.length >= limit) return templates;
  }

  for (const meal of meals) {
    const template = mealToTemplate(meal);
    const signature = templateSignature(template);
    if (seen.has(signature)) continue;
    seen.add(signature);
    templates.push(template);
    if (templates.length >= limit) break;
  }

  return templates;
}

export async function loadFavoriteMealTemplateIds(): Promise<string[]> {
  return loadStoredValue<string[]>({
    key: STORAGE_KEYS.mealTemplateFavorites,
    fallback: [],
    validate: isStringArray,
  });
}

export async function toggleFavoriteMealTemplate(templateId: string): Promise<string[]> {
  const current = new Set(await loadFavoriteMealTemplateIds());
  if (current.has(templateId)) {
    current.delete(templateId);
  } else {
    current.add(templateId);
  }
  const updated = [...current];
  await saveStoredValue(STORAGE_KEYS.mealTemplateFavorites, updated);
  return updated;
}

export async function clearFavoriteMealTemplateIds(): Promise<void> {
  await removeStoredValue(STORAGE_KEYS.mealTemplateFavorites);
}

export async function clearSavedMealTemplates(): Promise<void> {
  await Promise.all([removeStoredValue(STORAGE_KEYS.mealTemplates), removeStoredValue(STORAGE_KEYS.dismissedMealTemplates)]);
}
