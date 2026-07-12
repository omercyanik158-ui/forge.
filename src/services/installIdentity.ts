import { loadStoredValue, saveStoredValue } from './safeStorage';

const INSTALL_ID_KEY = '@forge/install-identity';

function createInstallIdentity(): string {
  return `forge-install-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function isInstallIdentity(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith('forge-install-') && value.length >= 24;
}

export async function getInstallIdentity(): Promise<string> {
  const existing = await loadStoredValue<string | null>({
    key: INSTALL_ID_KEY,
    fallback: null,
    validate: (value): value is string | null => value === null || isInstallIdentity(value),
  });

  if (existing) return existing;

  const created = createInstallIdentity();
  await saveStoredValue(INSTALL_ID_KEY, created);
  return created;
}
