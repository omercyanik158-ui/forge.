import type { CoachPreferences } from '@/types';
import { loadStoredValue, removeStoredValue, saveStoredValue } from './safeStorage';
import { STORAGE_KEYS } from './storageRegistry';

const DEFAULTS: CoachPreferences = {
  homeCards: ['energy', 'coach', 'weekly', 'analysis'],
  equipment: 'gym',
  limitations: [],
  adaptiveReminders: false,
  updatedAt: new Date().toISOString(),
};

function isCoachPreferences(value: unknown): value is CoachPreferences {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<CoachPreferences>;
  return Array.isArray(item.homeCards) && Array.isArray(item.limitations)
    && ['gym', 'home', 'bodyweight'].includes(item.equipment ?? '')
    && typeof item.adaptiveReminders === 'boolean';
}

type AutoHomeCardContext = {
  hasMealsToday: boolean;
  weeklyMealCount: number;
  weeklyWorkoutCount: number;
  streakCount: number;
  hasAnalysis: boolean;
  canAccessAnalysis: boolean;
};

export function selectAutomaticHomeCards(context: AutoHomeCardContext): CoachPreferences['homeCards'] {
  const scored: { key: CoachPreferences['homeCards'][number]; priority: number }[] = [
    { key: 'coach', priority: 100 },
    { key: 'energy', priority: context.hasMealsToday ? 72 : 95 },
    {
      key: 'weekly',
      priority: context.weeklyWorkoutCount > 0 || context.weeklyMealCount > 0 || context.streakCount > 0 ? 86 : 58,
    },
    {
      key: 'analysis',
      priority: context.canAccessAnalysis
        ? (context.hasAnalysis ? 88 : 62)
        : (context.weeklyWorkoutCount > 0 ? 74 : 42),
    },
  ];

  return scored
    .sort((left, right) => right.priority - left.priority)
    .slice(0, 3)
    .map((item) => item.key);
}

export async function loadCoachPreferences(): Promise<CoachPreferences> {
  const stored = await loadStoredValue<CoachPreferences>({ key: STORAGE_KEYS.coachPreferences, fallback: DEFAULTS, validate: isCoachPreferences });
  return { ...DEFAULTS, ...stored };
}

export async function saveCoachPreferences(next: Partial<CoachPreferences>): Promise<CoachPreferences> {
  const current = await loadCoachPreferences();
  const value = { ...current, ...next, updatedAt: new Date().toISOString() };
  await saveStoredValue(STORAGE_KEYS.coachPreferences, value);
  return value;
}

export async function clearCoachPreferences(): Promise<void> {
  await removeStoredValue(STORAGE_KEYS.coachPreferences);
}
