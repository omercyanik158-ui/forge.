export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type Meal = {
  id: string;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  portion: string;
  createdAt: string;
  source: 'api' | 'manual';
  mealType: MealType;
  imageUrl?: string;
};

export type FoodResult = {
  name: string;
  brand?: string;
  kcalPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  imageUrl?: string;
};

export type Program = {
  id: string;
  title: string;
  sub: string;
  color: string;
  tier: 'free' | 'premium';
  duration: string;
  focus: string;
  summary: string;
  difficultyLevel: 'Başlangıç' | 'Orta' | 'Zor';
  daysPerWeek: 3 | 4 | 5;
  trainingStyle: 'Full Body' | 'Upper/Lower' | 'Powerlifting' | 'Powerbuilding' | 'Split' | 'Pilates' | 'Yoga' | 'Home Fitness';
  goal: 'Genel Form' | 'Kas Gelişimi' | 'Güç' | 'Güç + Kas';
  equipment: string;
  searchTerms: string[];
  price?: string;
};

export type Exercise = {
  title: string;
  duration: string;
  difficulty: string;
  color: string;
  diffColor: string;
};

export type ExerciseMuscleGroup = 'Göğüs' | 'Sırt' | 'Omuz' | 'Bacak' | 'Kol' | 'Karın';

export type ExerciseFilter = 'Tümü' | 'Favoriler' | ExerciseMuscleGroup;

export type ExerciseLibraryItem = {
  id: string;
  name: string;
  displayName: string;
  muscleGroup: ExerciseMuscleGroup;
  targetMuscles: string[];
  secondaryMuscles: string[];
  equipment: string;
  difficulty: string;
  imageUrls: string[];
  defaultSets: number;
  defaultReps: number;
};

export type WarmupItem = {
  title: string;
  exerciseId?: string;
  durationSec?: number;
  repsLabel?: string;
  note?: string;
};

export type WorkoutLog = {
  id: string;
  title: string;
  durationMin: number;
  kcal: number;
  difficulty: string;
  completedAt: string;
  source?: 'exercise' | 'program' | 'custom' | 'ai_program';
  exerciseId?: string;
  exerciseIds?: string[];
  muscleGroups?: string[];
  programId?: string;
  programDayId?: string;
  customWorkoutId?: string;
  aiProgramId?: string;
  aiProgramDayId?: string;
  setEntries?: WorkoutSetLogEntry[];
  plannedRestSeconds?: number;
};

export type WorkoutSetLogEntry = {
  order: number;
  kind: 'warmup' | 'working';
  exerciseId?: string;
  kg: number;
  reps: number;
  completedAt: string;
};

export type Gender = 'male' | 'female';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export type GoalType = 'gain' | 'loss' | 'maintain';

export type SubscriptionTier = 'free' | 'premium';

export type StreakData = {
  count: number;
  lastDate: string;
};

export type WaterLog = {
  date: string;
  ml: number;
  goalMl: number;
  updatedAt: string;
};

export type CycleTracking = {
  lastPeriodStartDate: string | null;
  cycleLengthDays: number;
  periodLengthDays: number;
  updatedAt: string;
};

export type CoachPreferences = {
  homeCards: ('energy' | 'weekly' | 'coach' | 'analysis')[];
  equipment: 'gym' | 'home' | 'bodyweight';
  limitations: ('knee' | 'back' | 'shoulder')[];
  adaptiveReminders: boolean;
  updatedAt: string;
};

export type AchievementDef = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

export type UserProfile = {
  name: string;
  gender: Gender;
  age: number;
  weightKg: number;
  heightCm: number;
  activityLevel: ActivityLevel;
  neckCm: number;
  waistCm: number;
  hipCm?: number;
  bodyFatPct?: number;
  goalType?: GoalType;
  targetWeightKg?: number;
  startWeightKg?: number;
  subscription?: SubscriptionTier;
  streak?: StreakData;
  achievements?: string[];
  createdAt: string;
};
