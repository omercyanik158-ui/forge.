import type { Session, User } from '@supabase/supabase-js';
import type {
  ActivityLevel,
  CoachPreferences,
  CycleTracking,
  Meal,
  SubscriptionTier,
  UserProfile,
  WaterLog,
  WorkoutLog,
} from '@/types';
import type { AIHubAccessState } from '@/services/aiHubAccess';
import type { AppPreferences } from '@/services/appPreferencesStore';
import type { CustomWorkout } from '@/services/customWorkoutStore';
import type { MealTemplate } from '@/services/mealTemplateStore';
import type { NotificationPreferences } from '@/services/notificationStore';
import type { ProgramProgressMap } from '@/services/programProgressStore';
import type { UserProgram } from '@/services/userProgramsStore';
import type { RewardedCreditState } from '@/services/rewardedCreditStore';
import type { AIProgramPhysiqueSeed } from '@/types/aiProgram';
import type { AIProgramPlan } from '@/types/aiProgramPlan';
import type { SessionFeedback } from '@/types/aiProgramFeedback';
import type { CoachAdjustment } from '@/types/coachAdjustment';

export type AuthUser = Pick<User, 'id' | 'email' | 'app_metadata' | 'user_metadata'>;

export type SessionState = {
  session: Session | null;
  user: AuthUser | null;
  loading: boolean;
};

export type ActiveWorkoutSessionSnapshot = {
  sessionKey: string;
  sets: {
    key: string;
    exerciseId: string;
    order: number;
    kg: string;
    reps: string;
    done: boolean;
  }[];
  activeIndex: number;
  savedAt: string;
} | null;

export type CloudSnapshotV1 = {
  version: 1;
  profile: UserProfile | null;
  meals: Meal[];
  water: Record<string, WaterLog>;
  workouts: WorkoutLog[];
  programProgress: ProgramProgressMap;
  customWorkouts: CustomWorkout[];
  notifications: NotificationPreferences | null;
  exerciseFavorites: string[];
  programFavorites: string[];
  mealTemplates: MealTemplate[];
  mealTemplateFavorites: string[];
  dismissedMealTemplates: string[];
  waterPreferences: {
    goalMl: number;
    source: 'manual' | 'weight';
    weightKg?: number;
  } | null;
  activeWorkoutSession: ActiveWorkoutSessionSnapshot;
  preferences: AppPreferences | null;
  aiHubAccess: AIHubAccessState | null;
  rewardedCredits: RewardedCreditState | null;
  cycleTracking: CycleTracking | null;
  coachPreferences: CoachPreferences | null;
  aiProgramPhysiqueSeed: AIProgramPhysiqueSeed | null;
  aiProgramInstances: AIProgramPlan[];
  aiProgramFeedback: SessionFeedback[];
  coachAdjustments?: CoachAdjustment[];
  userPrograms: UserProgram[];
};

export type SyncMetadata = {
  version: 1;
  lastAttemptedAt?: string;
  lastSuccessfulAt?: string;
  lastSyncedUserId?: string;
  migrationSource?: 'local_seed' | 'remote_hydration' | 'merged';
};

export type SyncResult = {
  source: SyncMetadata['migrationSource'];
  syncedAt: string;
  snapshot: CloudSnapshotV1;
};

export type UserProfileRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  subscription_tier: SubscriptionTier;
  created_at: string;
  updated_at: string;
};

export type SubscriptionStateRow = {
  user_id: string;
  revenuecat_app_user_id: string | null;
  entitlement_active: boolean;
  entitlement_id: string | null;
  product_id: string | null;
  expires_at: string | null;
  updated_at: string;
};

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

export type SyncStatusSnapshot = {
  status: SyncStatus;
  lastSuccessfulAt?: string;
  lastAttemptedAt?: string;
  errorMessage?: string;
};

export type SubscriptionSummary = {
  tier: SubscriptionTier;
  appUserId: string;
  entitlementActive: boolean;
  entitlementId?: string;
  productId?: string;
  expiresAt?: string;
};

export type StoredGuestAccess = {
  allowed: boolean;
  updatedAt: string;
};

export type ProfileSeed = {
  name: string;
  age: number;
  gender: UserProfile['gender'];
  activityLevel: ActivityLevel;
};
