import { describe, expect, it, beforeEach } from 'vitest';
import {
  getWearableAdapter,
  inferRecoveryQualityFromWearable,
  isWearableAvailable,
  readWearableRecoverySignal,
  registerWearableAdapter,
} from '@/services/aiProgramWearableAdapter';
import type { WearableAdapter } from '@/types/aiProgramWearable';

describe('wearable noop adapter', () => {
  it('reports unavailable when no native module is registered', () => {
    expect(isWearableAvailable()).toBe(false);
  });

  it('returns an unavailable recovery signal', async () => {
    const signal = await readWearableRecoverySignal();
    expect(signal.available).toBe(false);
    expect(signal.provider).toBe('none');
  });
});

describe('wearable adapter registration', () => {
  beforeEach(() => {
    registerWearableAdapter(null as unknown as WearableAdapter);
  });

  it('uses a registered adapter when available', () => {
    const mock: WearableAdapter = {
      isAvailable: () => true,
      getPermissionState: () => 'granted',
      requestPermission: async () => 'granted',
      readRecoverySignal: async () => ({
        available: true,
        provider: 'apple_health',
        sleepHoursLastNight: 7.5,
        restingHeartRate: 58,
        heartRateVariability: 55,
      }),
    };
    registerWearableAdapter(mock);
    expect(isWearableAvailable()).toBe(true);
    expect(getWearableAdapter().getPermissionState()).toBe('granted');
  });
});

describe('recovery quality inference from wearable', () => {
  it('returns null when no signal is available', () => {
    expect(inferRecoveryQualityFromWearable({ available: false, provider: 'none' })).toBeNull();
  });

  it('infers great recovery from strong sleep and low RHR', () => {
    const quality = inferRecoveryQualityFromWearable({
      available: true,
      provider: 'apple_health',
      sleepHoursLastNight: 8,
      restingHeartRate: 55,
      heartRateVariability: 60,
    });
    expect(quality).toBe('great');
  });

  it('infers poor recovery from short sleep and high RHR', () => {
    const quality = inferRecoveryQualityFromWearable({
      available: true,
      provider: 'apple_health',
      sleepHoursLastNight: 5,
      restingHeartRate: 78,
    });
    expect(quality).toBe('poor');
  });

  it('infers okay when signals are mixed', () => {
    const quality = inferRecoveryQualityFromWearable({
      available: true,
      provider: 'apple_health',
      sleepHoursLastNight: 7,
    });
    expect(quality).toBe('okay');
  });
});
