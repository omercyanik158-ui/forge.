import { clearAIHubAccessState } from './aiHubAccess';
import { clearAppPreferences } from './appPreferencesStore';
import { clearCycleTracking } from './cycleTracking';
import { clearCoachPreferences } from './coachPreferences';
import { clearCustomWorkouts } from './customWorkoutStore';
import { clearFavoriteExerciseIds } from './exerciseFavorites';
import { clearMeals } from './mealStore';
import { clearFavoriteMealTemplateIds, clearSavedMealTemplates } from './mealTemplateStore';
import { clearNotificationPreferences } from './notificationStore';
import { clearProfile } from './profileStore';
import { clearProgramProgress } from './programProgressStore';
import { clearAIHubLogs } from './storageService';
import { clearThemeMode } from './themeStore';
import { clearWater } from './waterStore';
import { clearWorkoutLogs } from './workoutStore';
import { clearWorkoutSessionDraft } from './workoutSessionDraftStore';

export async function clearAllAppData(): Promise<void> {
  const results = await Promise.allSettled([
    clearProfile(),
    clearMeals(),
    clearWater(),
    clearWorkoutLogs(),
    clearCustomWorkouts(),
    clearFavoriteExerciseIds(),
    clearFavoriteMealTemplateIds(),
    clearSavedMealTemplates(),
    clearProgramProgress(),
    clearNotificationPreferences(),
    clearThemeMode(),
    clearWorkoutSessionDraft(),
    clearAppPreferences(),
    clearAIHubAccessState(),
    clearAIHubLogs(),
    clearCycleTracking(),
    clearCoachPreferences(),
  ]);

  if (results.some((result) => result.status === 'rejected')) {
    throw new Error('APP_RESET_FAILED');
  }
}
