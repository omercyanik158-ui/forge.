import { describe, expect, it } from 'vitest';
import {
  bmr,
  calorieGoal,
  goalProgress,
  macroGoals,
  macroGoalsFromCalories,
  mealTotals,
  navyBodyFat,
  tdee,
} from '@/services/calculations';
import type { Meal, UserProfile } from '@/types';

const profile: UserProfile = {
  name: 'Test',
  gender: 'male',
  age: 30,
  weightKg: 80,
  heightCm: 180,
  activityLevel: 'moderate',
  neckCm: 40,
  waistCm: 90,
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('bazal metabolizma ve enerji', () => {
  it('bmr cinsiyete göre ±5/−161 ofset uygular', () => {
    const male = bmr(profile);
    const female = bmr({ ...profile, gender: 'female' });
    expect(male).toBe(10 * 80 + 6.25 * 180 - 5 * 30 + 5);
    expect(female).toBe(10 * 80 + 6.25 * 180 - 5 * 30 - 161);
  });

  it('tdee aktivite çarpanını uygular', () => {
    expect(tdee({ ...profile, activityLevel: 'sedentary' })).toBeCloseTo(bmr(profile) * 1.2, 5);
    expect(tdee({ ...profile, activityLevel: 'active' })).toBeCloseTo(bmr(profile) * 1.725, 5);
  });
});

describe('kalori hedefi clamp', () => {
  it('ağırlık kaybı minimumun altına düşerse kadında 1200 tabanına çeker', () => {
    const petite = {
      gender: 'female' as const,
      age: 70,
      weightKg: 45,
      heightCm: 150,
      activityLevel: 'sedentary' as const,
      goalType: 'loss' as const,
    };
    expect(calorieGoal(petite)).toBe(1200);
  });

  it('çok yüksek TDEE 5000 üst sınırına çeker', () => {
    const large = {
      gender: 'male' as const,
      age: 18,
      weightKg: 150,
      heightCm: 200,
      activityLevel: 'very_active' as const,
      goalType: 'maintain' as const,
    };
    expect(calorieGoal(large)).toBe(5000);
  });
});

describe('makro hedefleri', () => {
  it('maintain protein çarpanı 1.6, diğer hedeflerde 1.8 olur', () => {
    expect(macroGoals({ ...profile, goalType: 'maintain' }).proteinG).toBe(80 * 1.6);
    expect(macroGoals({ ...profile, goalType: 'loss' }).proteinG).toBe(80 * 1.8);
    expect(macroGoals({ ...profile, goalType: 'gain' }).proteinG).toBe(80 * 1.8);
  });

  it('yağ hedefi kilonun 0.8 katıdır', () => {
    expect(macroGoals({ ...profile, goalType: 'maintain' }).fatG).toBe(80 * 0.8);
  });

  it('macroGoalsFromCalories 30/40/30 dağılımı verir', () => {
    const result = macroGoalsFromCalories(2000);
    expect(result.proteinG).toBe(Math.round((0.3 * 2000) / 4));
    expect(result.carbsG).toBe(Math.round((0.4 * 2000) / 4));
    expect(result.fatG).toBe(Math.round((0.3 * 2000) / 9));
  });
});

describe('hedef ilerlemesi', () => {
  it('maintain veya hedef kil yoksa null döner', () => {
    expect(goalProgress({ weightKg: 90, startWeightKg: 100, targetWeightKg: 80, goalType: 'maintain' })).toBeNull();
    expect(goalProgress({ weightKg: 90, startWeightKg: 100, goalType: 'loss' })).toBeNull();
  });

  it('kayıp hedefinde yarım yolda yüzde ve kalan hesaplar', () => {
    expect(goalProgress({ weightKg: 90, startWeightKg: 100, targetWeightKg: 80, goalType: 'loss' })).toEqual({
      pct: 50,
      remainingKg: 10,
    });
  });

  it('hedefe ulaşınca yüzde 100 olur', () => {
    expect(goalProgress({ weightKg: 80, startWeightKg: 100, targetWeightKg: 80, goalType: 'loss' })).toEqual({
      pct: 100,
      remainingKg: 0,
    });
  });

  it('kas kazanımı yönüne göre ilerlemeyi sayar', () => {
    expect(goalProgress({ weightKg: 75, startWeightKg: 70, targetWeightKg: 80, goalType: 'gain' })).toEqual({
      pct: 50,
      remainingKg: 5,
    });
  });

  it('başlangıç hedefe eşitse tamamlandı sayılır', () => {
    expect(goalProgress({ weightKg: 70, startWeightKg: 70, targetWeightKg: 70, goalType: 'loss' })).toEqual({
      pct: 100,
      remainingKg: 0,
    });
  });
});

describe('öğün toplamları', () => {
  it('boş listede tüm değerler sıfırdır', () => {
    expect(mealTotals([])).toEqual({ kcal: 0, protein: 0, carbs: 0, fat: 0 });
  });

  it('çoklu öğünü toplar', () => {
    const meals: Meal[] = [
      { id: 'a', name: 'A', kcal: 300, protein: 20, carbs: 40, fat: 10, portion: '1 porsiyon', createdAt: '2026-06-01', source: 'manual', mealType: 'snack' },
      { id: 'b', name: 'B', kcal: 500, protein: 30, carbs: 60, fat: 15, portion: '1 porsiyon', createdAt: '2026-06-01', source: 'manual', mealType: 'dinner' },
    ];
    expect(mealTotals(meals)).toEqual({ kcal: 800, protein: 50, carbs: 100, fat: 25 });
  });
});

describe('yağ oranı tahmini', () => {
  it('kadın yolunda hipCm gerekir', () => {
    expect(navyBodyFat({ gender: 'female', heightCm: 165, neckCm: 35, waistCm: 75 })).toBeNull();
  });

  it('kadın geçerli ölçümlerde 2–60 aralığında değer üretir', () => {
    const pct = navyBodyFat({ gender: 'female', heightCm: 165, neckCm: 35, waistCm: 75, hipCm: 100 });
    expect(pct).not.toBeNull();
    expect(pct as number).toBeGreaterThanOrEqual(2);
    expect(pct as number).toBeLessThanOrEqual(60);
  });
});
