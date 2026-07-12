import { loadStoredValue, removeStoredValue, saveStoredValue } from './safeStorage';
import { STORAGE_KEYS } from './storageRegistry';

export type AppLanguagePreference = 'auto' | 'tr' | 'en';
export type MeasurementPreference = 'auto' | 'metric' | 'imperial';

export type AppPreferences = {
  language: AppLanguagePreference;
  units: MeasurementPreference;
};

export const DEFAULT_APP_PREFERENCES: AppPreferences = {
  language: 'auto',
  units: 'auto',
};

function isAppPreferences(value: unknown): value is AppPreferences {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<AppPreferences>;
  const validLanguage = candidate.language === 'auto' || candidate.language === 'tr' || candidate.language === 'en';
  const validUnits = candidate.units === 'auto' || candidate.units === 'metric' || candidate.units === 'imperial';
  return validLanguage && validUnits;
}

export async function loadAppPreferences(): Promise<AppPreferences> {
  return loadStoredValue<AppPreferences>({
    key: STORAGE_KEYS.preferences,
    fallback: DEFAULT_APP_PREFERENCES,
    validate: isAppPreferences,
  });
}

export async function saveAppPreferences(preferences: AppPreferences): Promise<void> {
  await saveStoredValue(STORAGE_KEYS.preferences, preferences);
}

export async function updateAppPreferences(
  update: Partial<AppPreferences> | ((current: AppPreferences) => AppPreferences),
): Promise<AppPreferences> {
  const current = await loadAppPreferences();
  const next = typeof update === 'function' ? update(current) : { ...current, ...update };
  await saveAppPreferences(next);
  return next;
}

export async function clearAppPreferences(): Promise<void> {
  await removeStoredValue(STORAGE_KEYS.preferences);
}
