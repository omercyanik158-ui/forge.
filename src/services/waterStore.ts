import type { WaterLog } from '@/types';
import { dateKey } from './dateUtils';
import { loadStoredValue, removeStoredValue, saveStoredValue } from './safeStorage';
import { STORAGE_KEYS } from './storageRegistry';

const DEFAULT_GOAL_ML = 3500;
const MIN_GOAL_ML = 500;
const MAX_GOAL_ML = 10000;

type WaterPreferences = {
  goalMl: number;
  source: 'manual' | 'weight';
  weightKg?: number;
};

function isWaterLog(value: unknown): value is WaterLog {
  return !!value && typeof value === 'object' && typeof (value as WaterLog).date === 'string' && typeof (value as WaterLog).updatedAt === 'string';
}

function isWaterMap(value: unknown): value is Record<string, WaterLog> {
  return !!value && typeof value === 'object' && !Array.isArray(value) && Object.values(value).every(isWaterLog);
}

async function loadWaterMap(): Promise<Record<string, WaterLog>> {
  return loadStoredValue<Record<string, WaterLog>>({
    key: STORAGE_KEYS.water,
    fallback: {},
    validate: isWaterMap,
  });
}

async function saveWaterMap(map: Record<string, WaterLog>): Promise<void> {
  await saveStoredValue(STORAGE_KEYS.water, map);
}

function isWaterPreferences(value: unknown): value is WaterPreferences {
  return !!value && typeof value === 'object' && typeof (value as WaterPreferences).goalMl === 'number';
}

async function loadWaterPreferences(fallbackGoalMl = DEFAULT_GOAL_ML, weightKg?: number): Promise<WaterPreferences> {
  const stored = await loadStoredValue<WaterPreferences>({
    key: STORAGE_KEYS.waterPreferences,
    fallback: { goalMl: fallbackGoalMl, source: 'weight', weightKg },
    validate: isWaterPreferences,
  });
  return { ...stored, source: stored.source === 'weight' ? 'weight' : 'manual' };
}

export function calculateDailyWaterGoalMl(weightKg?: number | null): number {
  if (!weightKg || !Number.isFinite(weightKg) || weightKg <= 0) return DEFAULT_GOAL_ML;
  return Math.min(MAX_GOAL_ML, Math.max(1500, Math.round((weightKg * 33) / 50) * 50));
}

export async function loadWaterForWeight(weightKg?: number | null, date = dateKey()): Promise<WaterLog> {
  const recommendedGoal = calculateDailyWaterGoalMl(weightKg);
  const [map, preferences] = await Promise.all([loadWaterMap(), loadWaterPreferences(recommendedGoal, weightKg ?? undefined)]);
  const usesWeightGoal = preferences.source === 'weight';
  const goalMl = usesWeightGoal ? recommendedGoal : preferences.goalMl;
  const existing = map[date];
  const isToday = date === dateKey();

  if (usesWeightGoal && (preferences.goalMl !== goalMl || preferences.weightKg !== (weightKg ?? undefined))) {
    await saveStoredValue(STORAGE_KEYS.waterPreferences, { goalMl, source: 'weight', weightKg: weightKg ?? undefined } satisfies WaterPreferences);
  }

  if (existing) {
    if (usesWeightGoal && isToday && existing.goalMl !== goalMl) {
      const updated = { ...existing, goalMl, updatedAt: new Date().toISOString() };
      map[date] = updated;
      await saveWaterMap(map);
      return updated;
    }
    return existing;
  }

  return { date, ml: 0, goalMl, updatedAt: new Date().toISOString() };
}

export async function loadWater(date = dateKey()): Promise<WaterLog> {
  const [map, preferences] = await Promise.all([loadWaterMap(), loadWaterPreferences()]);
  return (
    map[date] ?? {
      date,
      ml: 0,
      goalMl: preferences.goalMl,
      updatedAt: new Date().toISOString(),
    }
  );
}

export async function addWater(amountMl: number, date = dateKey()): Promise<WaterLog> {
  const [map, preferences] = await Promise.all([loadWaterMap(), loadWaterPreferences()]);
  const current =
    map[date] ?? {
      date,
      ml: 0,
      goalMl: preferences.goalMl,
      updatedAt: new Date().toISOString(),
    };

  const next: WaterLog = {
    ...current,
    ml: Math.max(0, current.ml + amountMl),
    updatedAt: new Date().toISOString(),
  };

  map[date] = next;
  await saveWaterMap(map);
  return next;
}

export async function resetWater(date = dateKey()): Promise<WaterLog> {
  const [map, current] = await Promise.all([loadWaterMap(), loadWater(date)]);
  const next: WaterLog = { ...current, ml: 0, updatedAt: new Date().toISOString() };
  map[date] = next;
  await saveWaterMap(map);
  return next;
}

export async function setWaterGoal(goalMl: number, date = dateKey()): Promise<WaterLog> {
  const normalizedGoal = Math.min(MAX_GOAL_ML, Math.max(MIN_GOAL_ML, Math.round(goalMl / 50) * 50));
  const [map, current] = await Promise.all([loadWaterMap(), loadWater(date)]);
  const next: WaterLog = { ...current, goalMl: normalizedGoal, updatedAt: new Date().toISOString() };
  map[date] = next;
  await Promise.all([
    saveWaterMap(map),
    saveStoredValue(STORAGE_KEYS.waterPreferences, { goalMl: normalizedGoal, source: 'manual' } satisfies WaterPreferences),
  ]);
  return next;
}

export async function applyWeightBasedWaterGoal(weightKg?: number | null, date = dateKey()): Promise<WaterLog> {
  const goalMl = calculateDailyWaterGoalMl(weightKg);
  const [map, current] = await Promise.all([loadWaterMap(), loadWater(date)]);
  const next: WaterLog = { ...current, goalMl, updatedAt: new Date().toISOString() };
  map[date] = next;
  await Promise.all([
    saveWaterMap(map),
    saveStoredValue(STORAGE_KEYS.waterPreferences, { goalMl, source: 'weight', weightKg: weightKg ?? undefined } satisfies WaterPreferences),
  ]);
  return next;
}

export async function loadWaterHistory(days = 7, endDate = new Date()): Promise<WaterLog[]> {
  const [map, preferences] = await Promise.all([loadWaterMap(), loadWaterPreferences()]);
  const result: WaterLog[] = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(endDate);
    date.setDate(endDate.getDate() - offset);
    const key = dateKey(date);
    result.push(map[key] ?? { date: key, ml: 0, goalMl: preferences.goalMl, updatedAt: new Date().toISOString() });
  }
  return result;
}

export async function clearWater(): Promise<void> {
  await Promise.all([removeStoredValue(STORAGE_KEYS.water), removeStoredValue(STORAGE_KEYS.waterPreferences)]);
}
