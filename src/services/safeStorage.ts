import AsyncStorage from '@react-native-async-storage/async-storage';

type StorageEnvelope<T> = {
  version: 1;
  savedAt: string;
  value: T;
};

export type StorageMeta = {
  lastSavedAt?: string;
  lastRecoveredAt?: string;
};

type LoadOptions<T> = {
  key: string;
  fallback: T;
  validate?: (value: unknown) => value is T;
};

function backupKey(key: string): string {
  return `${key}:backup`;
}

function metaKey(key: string): string {
  return `${key}:meta`;
}

function toEnvelope<T>(value: T): StorageEnvelope<T> {
  return {
    version: 1,
    savedAt: new Date().toISOString(),
    value,
  };
}

function isEnvelope(value: unknown): value is StorageEnvelope<unknown> {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<StorageEnvelope<unknown>>;
  return candidate.version === 1 && typeof candidate.savedAt === 'string' && 'value' in candidate;
}

function validateValue<T>(value: unknown, validate?: (candidate: unknown) => candidate is T): value is T {
  return validate ? validate(value) : true;
}

function decodeStoredValue<T>(raw: string | null, validate?: (candidate: unknown) => candidate is T): { ok: true; value: T; savedAt?: string } | { ok: false } {
  if (!raw) return { ok: false };

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (isEnvelope(parsed) && validateValue(parsed.value, validate)) {
      return { ok: true, value: parsed.value, savedAt: parsed.savedAt };
    }

    if (validateValue(parsed, validate)) {
      return { ok: true, value: parsed };
    }
  } catch {
    return { ok: false };
  }

  return { ok: false };
}

async function loadMeta(key: string): Promise<StorageMeta> {
  try {
    const raw = await AsyncStorage.getItem(metaKey(key));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as StorageMeta;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

async function saveMeta(key: string, meta: StorageMeta): Promise<void> {
  await AsyncStorage.setItem(metaKey(key), JSON.stringify(meta));
}

export async function loadStoredValue<T>({ key, fallback, validate }: LoadOptions<T>): Promise<T> {
  const primary = decodeStoredValue(await AsyncStorage.getItem(key), validate);
  if (primary.ok) return primary.value;

  const backup = decodeStoredValue(await AsyncStorage.getItem(backupKey(key)), validate);
  if (backup.ok) {
    const envelope = toEnvelope(backup.value);
    await AsyncStorage.setItem(key, JSON.stringify(envelope));
    await AsyncStorage.setItem(backupKey(key), JSON.stringify(envelope));
    const meta = await loadMeta(key);
    await saveMeta(key, {
      ...meta,
      lastSavedAt: backup.savedAt ?? meta.lastSavedAt,
      lastRecoveredAt: new Date().toISOString(),
    });
    return backup.value;
  }

  return fallback;
}

export async function saveStoredValue<T>(key: string, value: T): Promise<void> {
  const envelope = toEnvelope(value);
  const serialized = JSON.stringify(envelope);
  const currentPrimary = await AsyncStorage.getItem(key);
  if (currentPrimary) {
    try {
      JSON.parse(currentPrimary);
      await AsyncStorage.setItem(backupKey(key), currentPrimary);
    } catch {
      await AsyncStorage.setItem(backupKey(key), serialized);
    }
  } else {
    await AsyncStorage.setItem(backupKey(key), serialized);
  }
  await AsyncStorage.setItem(key, serialized);
  const meta = await loadMeta(key);
  await saveMeta(key, {
    ...meta,
    lastSavedAt: envelope.savedAt,
  });
}

export async function removeStoredValue(key: string): Promise<void> {
  await AsyncStorage.multiRemove([key, backupKey(key), metaKey(key)]);
}

export async function loadStorageMeta(key: string): Promise<StorageMeta> {
  return loadMeta(key);
}

export async function inspectStoredValue<T>(options: LoadOptions<T>): Promise<{
  hasPrimary: boolean;
  hasBackup: boolean;
  isEmpty: boolean;
  isHealthy: boolean;
  meta: StorageMeta;
}> {
  const [rawPrimary, rawBackup, meta] = await Promise.all([
    AsyncStorage.getItem(options.key),
    AsyncStorage.getItem(backupKey(options.key)),
    loadMeta(options.key),
  ]);

  const primary = decodeStoredValue(rawPrimary, options.validate);
  const backup = decodeStoredValue(rawBackup, options.validate);

  return {
    hasPrimary: primary.ok,
    hasBackup: backup.ok,
    isEmpty: !rawPrimary && !rawBackup,
    isHealthy: primary.ok || backup.ok || (!rawPrimary && !rawBackup),
    meta,
  };
}
