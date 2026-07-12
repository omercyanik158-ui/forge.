import { loadStoredValue, removeStoredValue, saveStoredValue } from './safeStorage';
import { STORAGE_KEYS } from './storageRegistry';
import { isStringArray } from './storageValidators';

export async function loadFavoriteExerciseIds(): Promise<string[]> {
  return loadStoredValue<string[]>({
    key: STORAGE_KEYS.exerciseFavorites,
    fallback: [],
    validate: isStringArray,
  });
}

export async function saveFavoriteExerciseIds(ids: string[]): Promise<string[]> {
  const uniqueIds = Array.from(new Set(ids));
  await saveStoredValue(STORAGE_KEYS.exerciseFavorites, uniqueIds);
  return uniqueIds;
}

export async function toggleFavoriteExercise(id: string): Promise<string[]> {
  const ids = await loadFavoriteExerciseIds();
  const nextIds = ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
  return saveFavoriteExerciseIds(nextIds);
}

export async function clearFavoriteExerciseIds(): Promise<void> {
  await removeStoredValue(STORAGE_KEYS.exerciseFavorites);
}
