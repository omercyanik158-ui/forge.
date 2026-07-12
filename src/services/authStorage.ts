import { loadStoredValue, removeStoredValue, saveStoredValue } from './safeStorage';
import type { StoredGuestAccess, SyncMetadata } from '@/types/auth';

const GUEST_ACCESS_KEY = '@forge/auth-guest-access';
const SYNC_METADATA_KEY = '@forge/sync-metadata';

function isGuestAccess(value: unknown): value is StoredGuestAccess {
  return !!value
    && typeof value === 'object'
    && typeof (value as StoredGuestAccess).allowed === 'boolean'
    && typeof (value as StoredGuestAccess).updatedAt === 'string';
}

function isSyncMetadata(value: unknown): value is SyncMetadata {
  return !!value
    && typeof value === 'object'
    && (value as SyncMetadata).version === 1;
}

export async function loadGuestAccess(): Promise<boolean> {
  const stored = await loadStoredValue<StoredGuestAccess | null>({
    key: GUEST_ACCESS_KEY,
    fallback: null,
    validate: (value): value is StoredGuestAccess | null => value === null || isGuestAccess(value),
  });
  return stored?.allowed === true;
}

export async function saveGuestAccess(allowed: boolean): Promise<void> {
  await saveStoredValue(GUEST_ACCESS_KEY, {
    allowed,
    updatedAt: new Date().toISOString(),
  } satisfies StoredGuestAccess);
}

export async function clearGuestAccess(): Promise<void> {
  await removeStoredValue(GUEST_ACCESS_KEY);
}

export async function loadSyncMetadata(): Promise<SyncMetadata> {
  return loadStoredValue<SyncMetadata>({
    key: SYNC_METADATA_KEY,
    fallback: { version: 1 },
    validate: isSyncMetadata,
  });
}

export async function saveSyncMetadata(metadata: SyncMetadata): Promise<void> {
  await saveStoredValue(SYNC_METADATA_KEY, metadata);
}
