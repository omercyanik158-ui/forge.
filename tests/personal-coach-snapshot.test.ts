import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CoachPreferences, Meal, UserProfile, WorkoutLog } from '@/types';

const {
  loadWorkoutLogs,
  loadWorkoutInsights,
  loadNutritionSummary,
  loadMeals,
  loadWaterForWeight,
  loadWaterHistory,
  loadStrengthProgress,
} = vi.hoisted(() => ({
  loadWorkoutLogs: vi.fn<() => Promise<WorkoutLog[]>>(),
  loadWorkoutInsights: vi.fn(),
  loadNutritionSummary: vi.fn(),
  loadMeals: vi.fn<() => Promise<Meal[]>>(),
  loadWaterForWeight: vi.fn(),
  loadWaterHistory: vi.fn(),
  loadStrengthProgress: vi.fn(),
}));

vi.mock('@/services/workoutStore', () => ({ loadWorkoutLogs }));
vi.mock('@/services/workoutInsights', () => ({ loadWorkoutInsights }));
vi.mock('@/services/mealInsights', () => ({ loadNutritionSummary }));
vi.mock('@/services/mealStore', () => ({ loadMeals }));
vi.mock('@/services/waterStore', () => ({ loadWaterForWeight, loadWaterHistory }));
vi.mock('@/services/strengthProgress', () => ({ loadStrengthProgress }));

import { loadCoachSnapshot } from '@/services/personalCoach';

const profile: UserProfile = {
  name: 'Ayse',
  gender: 'female',
  age: 29,
  weightKg: 62,
  heightCm: 168,
  activityLevel: 'moderate',
  neckCm: 33,
  waistCm: 72,
  goalType: 'gain',
  createdAt: '2026-06-01T09:00:00.000Z',
};

const preferences: CoachPreferences = {
  homeCards: ['coach', 'weekly', 'analysis'],
  equipment: 'bodyweight',
  limitations: [],
  adaptiveReminders: true,
  updatedAt: '2026-07-01T09:00:00.000Z',
};

describe('loadCoachSnapshot', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-03T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('water düşükse içme aksiyonunu ve cycle bazlı öneriyi döner', async () => {
    loadWorkoutLogs.mockResolvedValue([
      {
        id: 'w1',
        title: 'Leg day',
        durationMin: 52,
        kcal: 410,
        difficulty: 'Orta',
        completedAt: '2026-07-02T08:00:00.000Z',
        source: 'program',
      },
    ]);
    loadWorkoutInsights.mockResolvedValue({
      weekly: { sessions: 2, minutes: 97, kcal: 700, sets: 18, volumeKg: 4300, label: 'Bu Hafta' },
    });
    loadNutritionSummary.mockResolvedValue({ activeDays: 4 });
    loadMeals.mockResolvedValue([
      {
        id: 'm1',
        name: 'Omelet',
        kcal: 420,
        protein: 24,
        carbs: 18,
        fat: 20,
        portion: '1 plate',
        createdAt: '2026-07-03T09:00:00.000Z',
        source: 'manual',
        mealType: 'breakfast',
      },
    ]);
    loadWaterForWeight.mockResolvedValue({ date: '2026-07-03', ml: 700, goalMl: 2200, updatedAt: '2026-07-03T10:00:00.000Z' });
    loadWaterHistory.mockResolvedValue([
      { date: '2026-06-27', ml: 2200, goalMl: 2200, updatedAt: '2026-06-27T12:00:00.000Z' },
      { date: '2026-06-28', ml: 1900, goalMl: 2200, updatedAt: '2026-06-28T12:00:00.000Z' },
      { date: '2026-06-29', ml: 1800, goalMl: 2200, updatedAt: '2026-06-29T12:00:00.000Z' },
      { date: '2026-06-30', ml: 2300, goalMl: 2200, updatedAt: '2026-06-30T12:00:00.000Z' },
      { date: '2026-07-01', ml: 2100, goalMl: 2200, updatedAt: '2026-07-01T12:00:00.000Z' },
      { date: '2026-07-02', ml: 1200, goalMl: 2200, updatedAt: '2026-07-02T12:00:00.000Z' },
      { date: '2026-07-03', ml: 700, goalMl: 2200, updatedAt: '2026-07-03T12:00:00.000Z' },
    ]);
    loadStrengthProgress.mockResolvedValue({
      exercises: [
        {
          exerciseId: 'squat',
          exerciseName: 'Squat',
          latestRecord: { kg: 40, reps: 8 },
        },
      ],
    });

    const snapshot = await loadCoachSnapshot(profile, preferences, {
      cycleDay: 3,
      currentCycleStartDate: '2026-07-01',
      nextPeriodStartDate: '2026-07-29',
      daysUntilNextPeriod: 26,
      fertileWindowStartDate: '2026-07-09',
      fertileWindowEndDate: '2026-07-15',
      ovulationDate: '2026-07-14',
      phase: 'follicular',
    });

    expect(snapshot.cycleIntensity).toBe('strong');
    expect(snapshot.nextAction).toBe('drink_water');
    expect(snapshot.habits).toEqual({ workout: 33, nutrition: 57, water: 71 });
    expect(snapshot.weekly).toMatchObject({ sessions: 2, minutes: 97, volumeKg: 4300, mealDays: 4, waterDays: 5 });
    expect(snapshot.strengthSuggestion).toEqual({ exerciseName: 'Squat', kg: 42.5, reps: 8 });
    expect(snapshot.recipes.map((item) => item.id)).toEqual(['protein-bowl', 'yogurt']);
  });

  it('öğün yoksa log_meal, yakın antrenman varsa recover önerir', async () => {
    loadWorkoutLogs.mockResolvedValue([
      {
        id: 'w2',
        title: 'Upper day',
        durationMin: 48,
        kcal: 360,
        difficulty: 'Orta',
        completedAt: '2026-07-03T07:30:00.000Z',
        source: 'custom',
      },
    ]);
    loadWorkoutInsights.mockResolvedValue({
      weekly: { sessions: 1, minutes: 48, kcal: 360, sets: 12, volumeKg: 2200, label: 'Bu Hafta' },
    });
    loadNutritionSummary.mockResolvedValue({ activeDays: 2 });
    loadMeals.mockResolvedValue([]);
    loadWaterForWeight.mockResolvedValue({ date: '2026-07-03', ml: 1800, goalMl: 2200, updatedAt: '2026-07-03T10:00:00.000Z' });
    loadWaterHistory.mockResolvedValue(Array.from({ length: 7 }, (_, index) => ({
      date: `2026-06-${27 + index}`.replace('2026-06-31', '2026-07-01').replace('2026-06-32', '2026-07-02').replace('2026-06-33', '2026-07-03'),
      ml: 2200,
      goalMl: 2200,
      updatedAt: '2026-07-03T12:00:00.000Z',
    })));
    loadStrengthProgress.mockResolvedValue({ exercises: [] });

    const logMealSnapshot = await loadCoachSnapshot(profile, { ...preferences, equipment: 'gym' });
    expect(logMealSnapshot.nextAction).toBe('log_meal');
    expect(logMealSnapshot.strengthSuggestion).toBeUndefined();
    expect(logMealSnapshot.recipes).toHaveLength(1);

    loadMeals.mockResolvedValue([
      {
        id: 'm2',
        name: 'Lunch',
        kcal: 560,
        protein: 34,
        carbs: 52,
        fat: 19,
        portion: '1 bowl',
        createdAt: '2026-07-03T13:00:00.000Z',
        source: 'manual',
        mealType: 'lunch',
      },
    ]);

    const recoverSnapshot = await loadCoachSnapshot(profile, { ...preferences, equipment: 'gym' });
    expect(recoverSnapshot.nextAction).toBe('recover');
    expect(recoverSnapshot.cycleIntensity).toBe('normal');
  });
});
