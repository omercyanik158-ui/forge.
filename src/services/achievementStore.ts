import type { AchievementDef, Meal, StreakData, UserProfile } from '@/types';
import { loadCustomWorkouts } from './customWorkoutStore';
import { dateKey, localDateKeyFromIso, weekStartKey } from './dateUtils';
import { loadMeals } from './mealStore';
import { ALL_PROGRAMS } from './programCatalog';
import { saveProfile } from './profileStore';
import { loadWorkoutLogs } from './workoutStore';
import { formatMessage } from './localization';

export type AchievementCategory = 'Başlangıç' | 'Beslenme' | 'Antrenman' | 'Programlar' | 'Disiplin';
type AchievementMetric = 'goal' | 'profile' | 'meals' | 'workouts' | 'customPlans' | 'programDays' | 'programsCompleted' | 'sets' | 'streak' | 'weeklyWorkouts' | 'balancedWeek';

export type AchievementDefinition = AchievementDef & {
  category: AchievementCategory;
  metric: AchievementMetric;
  target: number;
};

export type AchievementProgress = {
  current: number;
  target: number;
  pct: number;
};

export const ACHIEVEMENT_CATEGORIES: AchievementCategory[] = ['Başlangıç', 'Beslenme', 'Antrenman', 'Programlar', 'Disiplin'];

export const ACHIEVEMENT_DEFS: AchievementDefinition[] = [
  { id: 'goal_set', title: 'Rotanı Belirle', description: 'Kendine net bir hedef seçtin', icon: 'flag', category: 'Başlangıç', metric: 'goal', target: 1 },
  { id: 'profile_complete', title: 'Hazır Profil', description: 'Profil bilgilerini eksiksiz doldurdun', icon: 'person-circle', category: 'Başlangıç', metric: 'profile', target: 1 },
  { id: 'first_meal', title: 'İlk Öğün', description: 'İlk öğününü kaydettin', icon: 'restaurant', category: 'Beslenme', metric: 'meals', target: 1 },
  { id: 'meals_10', title: 'Beslenme Ritmi', description: '10 öğün kaydettin', icon: 'nutrition', category: 'Beslenme', metric: 'meals', target: 10 },
  { id: 'meals_50', title: 'Düzenli Takip', description: '50 öğün kaydettin', icon: 'leaf', category: 'Beslenme', metric: 'meals', target: 50 },
  { id: 'meals_100', title: 'Beslenme Ustası', description: '100 öğün kaydettin', icon: 'ribbon', category: 'Beslenme', metric: 'meals', target: 100 },
  { id: 'first_workout', title: 'İlk Antrenman', description: 'İlk antrenmanını tamamladın', icon: 'barbell', category: 'Antrenman', metric: 'workouts', target: 1 },
  { id: 'workouts_5', title: 'Isınma Turu', description: '5 antrenman tamamladın', icon: 'flame-outline', category: 'Antrenman', metric: 'workouts', target: 5 },
  { id: 'workouts_10', title: 'Çift Hane', description: '10 antrenman tamamladın', icon: 'fitness', category: 'Antrenman', metric: 'workouts', target: 10 },
  { id: 'workouts_25', title: 'İstikrarlı Sporcu', description: '25 antrenman tamamladın', icon: 'medal', category: 'Antrenman', metric: 'workouts', target: 25 },
  { id: 'workouts_50', title: 'Demir Disiplini', description: '50 antrenman tamamladın', icon: 'trophy', category: 'Antrenman', metric: 'workouts', target: 50 },
  { id: 'sets_25', title: 'Set Toplayıcı', description: '25 çalışma seti kaydettin', icon: 'layers', category: 'Antrenman', metric: 'sets', target: 25 },
  { id: 'sets_100', title: 'Yüz Set', description: '100 çalışma seti kaydettin', icon: 'albums', category: 'Antrenman', metric: 'sets', target: 100 },
  { id: 'sets_250', title: 'Hacim Ustası', description: '250 çalışma seti kaydettin', icon: 'podium', category: 'Antrenman', metric: 'sets', target: 250 },
  { id: 'first_custom_plan', title: 'Kendi Planın', description: 'İlk kişisel antrenmanını oluşturdun', icon: 'create', category: 'Programlar', metric: 'customPlans', target: 1 },
  { id: 'custom_plans_3', title: 'Plan Mimarı', description: '3 kişisel antrenman oluşturdun', icon: 'construct', category: 'Programlar', metric: 'customPlans', target: 3 },
  { id: 'first_program_day', title: 'Programa Başla', description: 'İlk hazır program gününü tamamladın', icon: 'play-circle', category: 'Programlar', metric: 'programDays', target: 1 },
  { id: 'program_complete', title: 'Program Tamamlandı', description: 'Bir hazır programın tüm haftalarını bitirdin', icon: 'checkmark-done-circle', category: 'Programlar', metric: 'programsCompleted', target: 1 },
  { id: 'streak_3', title: 'Üç Gün Serisi', description: '3 gün üst üste aktif kaldın', icon: 'flash', category: 'Disiplin', metric: 'streak', target: 3 },
  { id: 'streak_7', title: 'Haftalık Disiplin', description: '7 gün üst üste aktif kaldın', icon: 'flame', category: 'Disiplin', metric: 'streak', target: 7 },
  { id: 'streak_14', title: 'İki Hafta Net', description: '14 gün üst üste aktif kaldın', icon: 'calendar', category: 'Disiplin', metric: 'streak', target: 14 },
  { id: 'streak_30', title: 'Aylık Efsane', description: '30 gün üst üste aktif kaldın', icon: 'trophy', category: 'Disiplin', metric: 'streak', target: 30 },
  { id: 'weekly_workouts_3', title: 'Güçlü Hafta', description: 'Bir haftada 3 antrenman tamamladın', icon: 'calendar-number', category: 'Disiplin', metric: 'weeklyWorkouts', target: 3 },
  { id: 'balanced_week', title: 'Dengeli Hafta', description: 'Haftada en az 5 ana bölgeyi çalıştırdın', icon: 'body', category: 'Disiplin', metric: 'balancedWeek', target: 1 },
];

const ACHIEVEMENT_EN: Record<string, { title: string; description: string }> = {
  goal_set: { title: 'Set Your Course', description: 'You selected a clear goal' },
  profile_complete: { title: 'Ready Profile', description: 'You completed your profile information' },
  first_meal: { title: 'First Meal', description: 'You logged your first meal' },
  meals_10: { title: 'Nutrition Rhythm', description: 'You logged 10 meals' },
  meals_50: { title: 'Consistent Tracking', description: 'You logged 50 meals' },
  meals_100: { title: 'Nutrition Master', description: 'You logged 100 meals' },
  first_workout: { title: 'First Workout', description: 'You completed your first workout' },
  workouts_5: { title: 'Warm-up Lap', description: 'You completed 5 workouts' },
  workouts_10: { title: 'Double Digits', description: 'You completed 10 workouts' },
  workouts_25: { title: 'Consistent Athlete', description: 'You completed 25 workouts' },
  workouts_50: { title: 'Iron Discipline', description: 'You completed 50 workouts' },
  sets_25: { title: 'Set Collector', description: 'You logged 25 working sets' },
  sets_100: { title: 'One Hundred Sets', description: 'You logged 100 working sets' },
  sets_250: { title: 'Volume Master', description: 'You logged 250 working sets' },
  first_custom_plan: { title: 'Your Own Plan', description: 'You created your first custom workout' },
  custom_plans_3: { title: 'Plan Architect', description: 'You created 3 custom workouts' },
  first_program_day: { title: 'Start the Program', description: 'You completed your first program day' },
  program_complete: { title: 'Program Complete', description: 'You completed every day in a program' },
  streak_3: { title: 'Three-Day Streak', description: 'You stayed active for 3 days in a row' },
  streak_7: { title: 'Weekly Discipline', description: 'You stayed active for 7 days in a row' },
  streak_14: { title: 'Two Weeks Strong', description: 'You stayed active for 14 days in a row' },
  streak_30: { title: 'Monthly Legend', description: 'You stayed active for 30 days in a row' },
  weekly_workouts_3: { title: 'Strong Week', description: 'You completed 3 workouts in one week' },
  balanced_week: { title: 'Balanced Week', description: 'You trained at least 5 major regions in one week' },
};

export function getAchievementCopy(definition: AchievementDefinition): { title: string; description: string } {
  const english = ACHIEVEMENT_EN[definition.id];
  return {
    title: formatMessage({ tr: definition.title, en: english?.title ?? definition.title }),
    description: formatMessage({ tr: definition.description, en: english?.description ?? definition.description }),
  };
}

export function getAchievementCategoryLabel(category: AchievementCategory): string {
  const labels: Record<AchievementCategory, string> = {
    Başlangıç: 'Getting Started',
    Beslenme: 'Nutrition',
    Antrenman: 'Training',
    Programlar: 'Programs',
    Disiplin: 'Discipline',
  };
  return formatMessage({ tr: category, en: labels[category] });
}

export function getStreakCount(streak?: StreakData): number {
  if (!streak) return 0;
  const today = dateKey(new Date());
  const yesterday = dateKey(new Date(Date.now() - 86400000));
  return streak.lastDate === today || streak.lastDate === yesterday ? streak.count : 0;
}

export function updateStreak(profile: UserProfile): { streak: StreakData; changed: boolean } {
  const today = dateKey(new Date());
  const yesterday = dateKey(new Date(Date.now() - 86400000));
  const current = profile.streak;
  if (current?.lastDate === today) return { streak: current, changed: false };
  return { streak: { count: current?.lastDate === yesterday ? current.count + 1 : 1, lastDate: today }, changed: true };
}

async function metricValues(profile: UserProfile, providedMeals?: Meal[]): Promise<Record<AchievementMetric, number>> {
  const [meals, logs, customPlans] = await Promise.all([providedMeals ? Promise.resolve(providedMeals) : loadMeals(), loadWorkoutLogs(), loadCustomWorkouts()]);
  const weekStart = weekStartKey();
  const weeklyLogs = logs.filter((log) => localDateKeyFromIso(log.completedAt) >= weekStart);
  const weeklyMuscles = new Set(weeklyLogs.flatMap((log) => log.muscleGroups ?? []));
  const completedProgramDays = new Set(logs.filter((log) => log.source === 'program' && log.programDayId).map((log) => `${log.programId}:${log.programDayId}`));
  const programsCompleted = ALL_PROGRAMS.filter((program) => program.weeks.flatMap((week) => week.days).every((day) => completedProgramDays.has(`${program.id}:${day.id}`))).length;
  const profileComplete = profile.name.trim().length > 0 && profile.weightKg > 0 && profile.heightCm > 0 && profile.age > 0;

  return {
    goal: profile.goalType ? 1 : 0,
    profile: profileComplete ? 1 : 0,
    meals: meals.length,
    workouts: logs.length,
    customPlans: customPlans.length,
    programDays: new Set(
      logs
        .filter((log) => log.source === 'program' || log.source === 'ai_program')
        .map((log) => log.source === 'ai_program' ? `${log.aiProgramId}:${log.aiProgramDayId}` : `${log.programId}:${log.programDayId}`),
    ).size,
    programsCompleted,
    sets: logs.reduce((sum, log) => sum + (log.setEntries?.filter((set) => set.kind === 'working').length ?? 0), 0),
    streak: getStreakCount(profile.streak),
    weeklyWorkouts: weeklyLogs.length,
    balancedWeek: weeklyMuscles.size >= 5 ? 1 : 0,
  };
}

export async function loadAchievementProgress(profile: UserProfile, meals?: Meal[]): Promise<Record<string, AchievementProgress>> {
  const values = await metricValues(profile, meals);
  return Object.fromEntries(ACHIEVEMENT_DEFS.map((definition) => {
    const current = Math.min(values[definition.metric], definition.target);
    return [definition.id, { current, target: definition.target, pct: Math.round((current / definition.target) * 100) }];
  }));
}

export async function checkAchievements(profile: UserProfile, meals?: Meal[]): Promise<string[]> {
  const unlocked = new Set(profile.achievements ?? []);
  const progress = await loadAchievementProgress(profile, meals);
  return ACHIEVEMENT_DEFS.filter((definition) => progress[definition.id]?.current >= definition.target && !unlocked.has(definition.id)).map((definition) => definition.id);
}

export async function processEngagement(profile: UserProfile, meals?: Meal[]): Promise<UserProfile> {
  const { streak, changed } = updateStreak(profile);
  const updatedProfile = changed ? { ...profile, streak } : profile;
  const newlyUnlocked = await checkAchievements(updatedProfile, meals);
  if (newlyUnlocked.length > 0 || changed) {
    const finalProfile = { ...updatedProfile, achievements: [...new Set([...(updatedProfile.achievements ?? []), ...newlyUnlocked])] };
    await saveProfile(finalProfile);
    return finalProfile;
  }
  return updatedProfile;
}

export function getUnlockedSet(profile?: UserProfile | null): Set<string> {
  return new Set(profile?.achievements ?? []);
}

export async function refreshAchievements(profile: UserProfile, meals?: Meal[]): Promise<UserProfile> {
  const newlyUnlocked = await checkAchievements(profile, meals);
  if (newlyUnlocked.length === 0) return profile;
  const finalProfile = { ...profile, achievements: [...new Set([...(profile.achievements ?? []), ...newlyUnlocked])] };
  await saveProfile(finalProfile);
  return finalProfile;
}
