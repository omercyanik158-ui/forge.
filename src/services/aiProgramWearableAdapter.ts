import type {
  WearableAdapter,
  WearablePermissionState,
  WearableRecoverySignal,
} from '@/types/aiProgramWearable';

/**
 * Faz 12 — Wearable Adapter Registry
 *
 * Native health modülü (expo-health / react-native-health) eklenene kadar
 * no-op adapter döner. Gerçek modül eklendiğinde registerWearableAdapter ile
 * kaydedilir; tüm kod bu soyutlama üzerinden çalışır. Constitution: izin
 * olmadan veri okunmaz.
 */

let activeAdapter: WearableAdapter | null = null;

const noopAdapter: WearableAdapter = {
  isAvailable: () => false,
  getPermissionState: () => 'not_determined',
  requestPermission: async () => 'denied' as WearablePermissionState,
  readRecoverySignal: async () => ({
    available: false,
    provider: 'none',
  } as WearableRecoverySignal),
};

export function registerWearableAdapter(adapter: WearableAdapter): void {
  activeAdapter = adapter;
}

export function getWearableAdapter(): WearableAdapter {
  return activeAdapter ?? noopAdapter;
}

export function isWearableAvailable(): boolean {
  return getWearableAdapter().isAvailable();
}

export async function readWearableRecoverySignal(): Promise<WearableRecoverySignal> {
  const adapter = getWearableAdapter();
  if (!adapter.isAvailable()) {
    return { available: false, provider: 'none' };
  }
  const permission = adapter.getPermissionState();
  if (permission !== 'granted') {
    return { available: false, provider: adapter.isAvailable() ? 'apple_health' : 'none' };
  }
  return adapter.readRecoverySignal();
}

/**
 * Wearable toparlanma sinyalini Faz 5/10'un anlayacağı bir kaliteye çevirir.
 * Constitution: belirsizlikte güvenli tarafa (düşük toparlanma) kayar.
 */
export function inferRecoveryQualityFromWearable(signal: WearableRecoverySignal): 'poor' | 'okay' | 'great' | null {
  if (!signal.available) return null;
  let score = 0;
  let counted = 0;
  if (typeof signal.sleepHoursLastNight === 'number') {
    counted += 1;
    if (signal.sleepHoursLastNight >= 7.5) score += 1;
    else if (signal.sleepHoursLastNight < 6) score -= 1;
  }
  if (typeof signal.restingHeartRate === 'number') {
    counted += 1;
    // düşük dinlenme nabzı genellikle iyi toparlanmaya işaret eder (bireysel baseline gerekir)
    if (signal.restingHeartRate <= 60) score += 1;
    else if (signal.restingHeartRate >= 75) score -= 1;
  }
  if (typeof signal.heartRateVariability === 'number') {
    counted += 1;
    if (signal.heartRateVariability >= 50) score += 1;
    else if (signal.heartRateVariability < 30) score -= 1;
  }
  if (counted === 0) return null;
  if (score >= 1) return 'great';
  if (score <= -1) return 'poor';
  return 'okay';
}
