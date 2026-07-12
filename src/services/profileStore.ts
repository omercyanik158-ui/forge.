import type { UserProfile } from '@/types';
import { loadStoredValue, removeStoredValue, saveStoredValue } from './safeStorage';
import { STORAGE_KEYS } from './storageRegistry';

function isProfile(value: unknown): value is UserProfile {
  return !!value && typeof value === 'object' && typeof (value as UserProfile).name === 'string' && typeof (value as UserProfile).createdAt === 'string';
}

export async function loadProfile(): Promise<UserProfile | null> {
  return loadStoredValue<UserProfile | null>({
    key: STORAGE_KEYS.profile,
    fallback: null,
    validate: (value): value is UserProfile | null => value === null || isProfile(value),
  });
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  const now = new Date().toISOString();
  await saveStoredValue(STORAGE_KEYS.profile, {
    ...profile,
    updatedAt: now,
    createdAt: profile.createdAt || now,
  });
}

export async function isOnboarded(): Promise<boolean> {
  return (await loadProfile()) !== null;
}

export async function clearProfile(): Promise<void> {
  await removeStoredValue(STORAGE_KEYS.profile);
}
