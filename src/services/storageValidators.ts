/**
 * Shared storage type guards.
 *
 * Persisted record validation was duplicated across multiple stores
 * (dataHealth, programFavoriteStore, exerciseFavorites, mealTemplateStore),
 * which caused drift bugs (e.g. a missing `programFavorites` validator in
 * dataHealth). Centralising these keeps every store and the health inspector
 * on the exact same shape checks.
 */

export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
