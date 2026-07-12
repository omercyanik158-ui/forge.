import { beforeEach, describe, expect, it, vi } from 'vitest';
import { STORAGE_KEYS } from '@/services/storageRegistry';
import type { CloudSnapshotV1 } from '@/types/auth';

const storage = new Map<string, string>();

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(async (key: string) => storage.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => {
      storage.set(key, value);
    }),
    multiRemove: vi.fn(async (keys: string[]) => {
      keys.forEach((key) => storage.delete(key));
    }),
  },
}));

type MockRemoteState = {
  snapshot: CloudSnapshotV1 | null;
  profileRow: Record<string, unknown> | null;
};

function createSnapshot(overrides: Partial<CloudSnapshotV1> = {}): CloudSnapshotV1 {
  return {
    version: 1,
    profile: null,
    meals: [],
    water: {},
    workouts: [],
    programProgress: {},
    customWorkouts: [],
    notifications: null,
    exerciseFavorites: [],
    programFavorites: [],
    mealTemplates: [],
    mealTemplateFavorites: [],
    dismissedMealTemplates: [],
    waterPreferences: null,
    activeWorkoutSession: null,
    preferences: null,
    aiHubAccess: null,
    rewardedCredits: null,
    cycleTracking: null,
    coachPreferences: null,
    aiProgramPhysiqueSeed: null,
    aiProgramInstances: [],
    aiProgramFeedback: [],
    userPrograms: [],
    ...overrides,
  };
}

function createMockSupabase(remoteState: MockRemoteState) {
  return {
    from(table: string) {
      if (table === 'user_snapshots') {
        return {
          select() {
            return this;
          },
          eq() {
            return this;
          },
          async maybeSingle() {
            if (!remoteState.snapshot) {
              return { data: null, error: null };
            }
            return {
              data: {
                user_id: 'user-1',
                payload: remoteState.snapshot,
                version: 1,
                last_synced_at: '2026-07-13T00:00:00.000Z',
                created_at: '2026-07-13T00:00:00.000Z',
                updated_at: '2026-07-13T00:00:00.000Z',
              },
              error: null,
            };
          },
          async upsert(payload: Record<string, unknown>) {
            remoteState.snapshot = payload.payload as CloudSnapshotV1;
            return { error: null };
          },
        };
      }

      if (table === 'user_profiles') {
        return {
          upsert(payload: Record<string, unknown>) {
            remoteState.profileRow = payload;
            return {
              select() {
                return {
                  async single() {
                    return { data: payload, error: null };
                  },
                };
              },
            };
          },
        };
      }

      throw new Error(`Unexpected table access: ${table}`);
    },
  };
}

async function loadCloudSyncWith(remoteState: MockRemoteState) {
  vi.resetModules();
  vi.doMock('@/services/supabase', () => ({
    supabase: createMockSupabase(remoteState),
  }));
  return import('@/services/cloudSync');
}

describe('cloud sync', () => {
  beforeEach(() => {
    storage.clear();
    vi.restoreAllMocks();
  });

  it('uploads local snapshot when remote is empty', async () => {
    const localSnapshot = createSnapshot({
      profile: {
        name: 'Omer',
        gender: 'male',
        age: 28,
        weightKg: 80,
        heightCm: 180,
        activityLevel: 'moderate',
        neckCm: 40,
        waistCm: 84,
        achievements: ['first-login'],
        createdAt: '2026-07-13T10:00:00.000Z',
      },
      meals: [{ id: 'meal-1', createdAt: '2026-07-13T10:05:00.000Z' } as never],
      preferences: { language: 'tr', units: 'metric' } as never,
    });

    storage.set(
      STORAGE_KEYS.profile,
      JSON.stringify({ version: 1, savedAt: '2026-07-13T10:00:00.000Z', value: localSnapshot.profile }),
    );
    storage.set(
      STORAGE_KEYS.meals,
      JSON.stringify({ version: 1, savedAt: '2026-07-13T10:05:00.000Z', value: localSnapshot.meals }),
    );
    storage.set(
      STORAGE_KEYS.preferences,
      JSON.stringify({ version: 1, savedAt: '2026-07-13T10:06:00.000Z', value: localSnapshot.preferences }),
    );

    const remoteState: MockRemoteState = {
      snapshot: null,
      profileRow: null,
    };

    const { syncUserData } = await loadCloudSyncWith(remoteState);
    const result = await syncUserData('user-1');

    expect(result.source).toBe('local_seed');
    expect(remoteState.snapshot?.profile?.name).toBe('Omer');
    expect(remoteState.snapshot?.meals).toHaveLength(1);
    expect(remoteState.profileRow?.subscription_tier).toBe('free');
  });

  it('hydrates local storage from remote when local is empty', async () => {
    const remoteSnapshot = createSnapshot({
      profile: {
        name: 'Remote User',
        gender: 'female',
        age: 31,
        weightKg: 63,
        heightCm: 168,
        activityLevel: 'light',
        neckCm: 33,
        waistCm: 71,
        createdAt: '2026-07-12T08:00:00.000Z',
      },
      workouts: [{ id: 'workout-1', completedAt: '2026-07-12T09:00:00.000Z' } as never],
    });

    const remoteState: MockRemoteState = {
      snapshot: remoteSnapshot,
      profileRow: null,
    };

    const { syncUserData } = await loadCloudSyncWith(remoteState);
    const result = await syncUserData('user-1');

    expect(result.source).toBe('remote_hydration');

    const savedProfileRaw = storage.get(STORAGE_KEYS.profile);
    const savedWorkoutsRaw = storage.get(STORAGE_KEYS.workouts);
    expect(savedProfileRaw).toContain('Remote User');
    expect(savedWorkoutsRaw).toContain('workout-1');
  });

  it('merges local and remote snapshots deterministically', async () => {
    storage.set(
      STORAGE_KEYS.exerciseFavorites,
      JSON.stringify({
        version: 1,
        savedAt: '2026-07-13T11:00:00.000Z',
        value: ['bench-press', 'pull-up'],
      }),
    );
    storage.set(
      STORAGE_KEYS.userPrograms,
      JSON.stringify({
        version: 1,
        savedAt: '2026-07-13T11:01:00.000Z',
        value: [
          {
            id: 'program-1',
            source: 'library',
            startedAt: '2026-07-13T11:01:00.000Z',
          },
        ],
      }),
    );

    const remoteState: MockRemoteState = {
      snapshot: createSnapshot({
        exerciseFavorites: ['pull-up', 'dip'],
        userPrograms: [
          {
            id: 'program-1',
            source: 'library',
            startedAt: '2026-07-13T10:00:00.000Z',
          } as never,
          {
            id: 'program-2',
            source: 'library',
            startedAt: '2026-07-13T10:30:00.000Z',
          } as never,
        ],
      }),
      profileRow: null,
    };

    const { syncUserData } = await loadCloudSyncWith(remoteState);
    const result = await syncUserData('user-1');

    expect(result.source).toBe('merged');
    expect(result.snapshot.exerciseFavorites).toEqual(['pull-up', 'dip', 'bench-press']);
    expect(result.snapshot.userPrograms).toHaveLength(2);
    expect(result.snapshot.userPrograms.find((item) => item.id === 'program-1')?.startedAt).toBe('2026-07-13T11:01:00.000Z');
  });
});
