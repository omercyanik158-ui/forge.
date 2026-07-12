import { notifyFavoritesRailChange } from './favoritesRailEvents';
import { loadStoredValue, saveStoredValue } from './safeStorage';
import { STORAGE_KEYS } from './storageRegistry';
import { isStringArray } from './storageValidators';

export async function loadFavoriteProgramIds(): Promise<string[]> {
  return loadStoredValue<string[]>({
    key: STORAGE_KEYS.programFavorites,
    fallback: [],
    validate: isStringArray,
  });
}

export async function saveFavoriteProgramIds(ids: string[]): Promise<string[]> {
  const uniqueIds = Array.from(new Set(ids));
  await saveStoredValue(STORAGE_KEYS.programFavorites, uniqueIds);
  notifyFavoritesRailChange();
  return uniqueIds;
}

export async function toggleFavoriteProgram(id: string): Promise<string[]> {
  const ids = await loadFavoriteProgramIds();
  const nextIds = ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
  return saveFavoriteProgramIds(nextIds);
}
