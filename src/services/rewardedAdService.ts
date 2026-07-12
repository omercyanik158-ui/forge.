import { Platform } from 'react-native';
import {
  getRewardedAdUnitId,
  hasNativeRewardedAdConfig,
  isAdMobEnabled,
  isAdMobTestMode,
  isDevelopmentMockAdsEnabled,
  type RewardedCreditType,
} from '@/config/rewardedAds';

export type RewardedAdOutcome = 'completed' | 'skipped' | 'failed' | 'unavailable' | 'unsupported';
export type RewardedAdProvider = 'mock' | 'native' | 'disabled' | 'unsupported';

export type RewardedAdStatus = {
  initialized: boolean;
  provider: RewardedAdProvider;
  supported: boolean;
  availableByType: Partial<Record<RewardedCreditType, boolean>>;
  lastOutcome?: RewardedAdOutcome;
  lastCreditType?: RewardedCreditType;
};

type NativeRewardedAd = {
  load: () => void;
  show: () => Promise<void> | void;
  addAdEventListener: (eventType: unknown, listener: (...args: unknown[]) => void) => () => void;
};

type NativeGoogleMobileAdsModule = {
  default?: unknown;
  mobileAds?: () => { initialize?: () => Promise<unknown> | unknown };
  RewardedAd?: {
    createForAdRequest: (adUnitId: string, options?: Record<string, unknown>) => NativeRewardedAd;
  };
  RewardedAdEventType?: Record<string, unknown>;
  AdEventType?: Record<string, unknown>;
};

let rewardedStatus: RewardedAdStatus = {
  initialized: false,
  provider: 'disabled',
  supported: false,
  availableByType: {},
};

let modulePromise: Promise<NativeGoogleMobileAdsModule | null> | null = null;
let mockOutcomeOverride: RewardedAdOutcome | null = null;
const nativeAds = new Map<RewardedCreditType, NativeRewardedAd>();

function isDevelopmentRuntime(): boolean {
  return typeof __DEV__ !== 'undefined' && __DEV__;
}

async function loadNativeAdModule(): Promise<NativeGoogleMobileAdsModule | null> {
  if (!modulePromise) {
    modulePromise = (async () => {
      try {
        const dynamicImport = new Function('moduleName', 'return import(moduleName);') as (moduleName: string) => Promise<NativeGoogleMobileAdsModule>;
        return await dynamicImport('react-native-google-mobile-ads');
      } catch {
        return null;
      }
    })();
  }

  return modulePromise;
}

function updateAvailability(type: RewardedCreditType, available: boolean): void {
  rewardedStatus = {
    ...rewardedStatus,
    availableByType: {
      ...rewardedStatus.availableByType,
      [type]: available,
    },
  };
}

function setLastOutcome(outcome: RewardedAdOutcome, type: RewardedCreditType): RewardedAdOutcome {
  rewardedStatus = {
    ...rewardedStatus,
    lastOutcome: outcome,
    lastCreditType: type,
  };
  return outcome;
}

function mockOutcome(): RewardedAdOutcome {
  return mockOutcomeOverride ?? 'completed';
}

function providerForCurrentRuntime(): RewardedAdProvider {
  if (isDevelopmentMockAdsEnabled()) return 'mock';
  if (!isAdMobEnabled()) return 'disabled';
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') return 'unsupported';
  return 'native';
}

export async function initializeRewardedAds(): Promise<void> {
  const provider = providerForCurrentRuntime();

  if (provider === 'mock') {
    rewardedStatus = {
      initialized: true,
      provider: 'mock',
      supported: true,
      availableByType: rewardedStatus.availableByType,
    };
    return;
  }

  if (provider === 'disabled' || provider === 'unsupported') {
    rewardedStatus = {
      initialized: true,
      provider,
      supported: false,
      availableByType: {},
    };
    return;
  }

  const nativeModule = await loadNativeAdModule();
  if (!nativeModule) {
    rewardedStatus = {
      initialized: true,
      provider: 'unsupported',
      supported: false,
      availableByType: {},
    };
    return;
  }

  try {
    const mobileAdsFactory = typeof nativeModule.mobileAds === 'function' ? nativeModule.mobileAds : null;
    await mobileAdsFactory?.()?.initialize?.();
  } catch {
    // Native SDK init failure should not crash the app.
  }

  rewardedStatus = {
    initialized: true,
    provider: 'native',
    supported: true,
    availableByType: rewardedStatus.availableByType,
  };
}

export function isRewardedAdSupported(): boolean {
  return rewardedStatus.supported;
}

export function getRewardedAdStatus(): RewardedAdStatus {
  return rewardedStatus;
}

export function isRewardedAdAvailable(type: RewardedCreditType): boolean {
  return rewardedStatus.availableByType[type] === true;
}

export async function loadRewardedAd(type: RewardedCreditType): Promise<boolean> {
  await initializeRewardedAds();

  if (rewardedStatus.provider === 'mock') {
    updateAvailability(type, true);
    return true;
  }

  if (rewardedStatus.provider !== 'native' || !hasNativeRewardedAdConfig(type)) {
    updateAvailability(type, false);
    return false;
  }

  const nativeModule = await loadNativeAdModule();
  const RewardedAd = nativeModule?.RewardedAd;
  const AdEventType = nativeModule?.AdEventType ?? {};
  const RewardedAdEventType = nativeModule?.RewardedAdEventType ?? {};
  if (!RewardedAd?.createForAdRequest) {
    updateAvailability(type, false);
    return false;
  }

  const adUnitId = getRewardedAdUnitId(type);
  if (!adUnitId) {
    updateAvailability(type, false);
    return false;
  }

  const ad = RewardedAd.createForAdRequest(adUnitId, {
    requestNonPersonalizedAdsOnly: true,
  });
  nativeAds.set(type, ad);

  return new Promise<boolean>((resolve) => {
    let settled = false;
    const cleanup = [
      ad.addAdEventListener(RewardedAdEventType.LOADED ?? AdEventType.LOADED ?? 'loaded', () => {
        if (settled) return;
        settled = true;
        updateAvailability(type, true);
        for (const unsubscribe of cleanup) unsubscribe();
        resolve(true);
      }),
      ad.addAdEventListener(AdEventType.ERROR ?? 'error', () => {
        if (settled) return;
        settled = true;
        updateAvailability(type, false);
        for (const unsubscribe of cleanup) unsubscribe();
        resolve(false);
      }),
    ];

    try {
      ad.load();
    } catch {
      updateAvailability(type, false);
      for (const unsubscribe of cleanup) unsubscribe();
      resolve(false);
    }
  });
}

export async function showRewardedAd(type: RewardedCreditType): Promise<RewardedAdOutcome> {
  await initializeRewardedAds();

  if (rewardedStatus.provider === 'mock') {
    const outcome = mockOutcome();
    await new Promise((resolve) => setTimeout(resolve, 400));
    updateAvailability(type, true);
    return setLastOutcome(outcome, type);
  }

  if (rewardedStatus.provider !== 'native') {
    return setLastOutcome(rewardedStatus.provider === 'unsupported' ? 'unsupported' : 'unavailable', type);
  }

  let ad = nativeAds.get(type);
  if (!ad || !isRewardedAdAvailable(type)) {
    const loaded = await loadRewardedAd(type);
    if (!loaded) return setLastOutcome('unavailable', type);
    ad = nativeAds.get(type);
  }

  const nativeModule = await loadNativeAdModule();
  const RewardedAdEventType = nativeModule?.RewardedAdEventType ?? {};
  const AdEventType = nativeModule?.AdEventType ?? {};
  if (!ad) return setLastOutcome('unavailable', type);

  return new Promise<RewardedAdOutcome>((resolve) => {
    let earnedReward = false;
    let settled = false;
    const finish = (outcome: RewardedAdOutcome) => {
      if (settled) return;
      settled = true;
      updateAvailability(type, false);
      for (const unsubscribe of cleanup) unsubscribe();
      void loadRewardedAd(type);
      resolve(setLastOutcome(outcome, type));
    };

    const cleanup = [
      ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD ?? 'earned_reward', () => {
        earnedReward = true;
      }),
      ad.addAdEventListener(AdEventType.CLOSED ?? 'closed', () => {
        finish(earnedReward ? 'completed' : 'skipped');
      }),
      ad.addAdEventListener(AdEventType.ERROR ?? 'error', () => {
        finish('failed');
      }),
    ];

    try {
      const result = ad.show();
      Promise.resolve(result).catch(() => finish('failed'));
    } catch {
      finish('failed');
    }
  });
}

export function __setRewardedAdMockOutcomeForTests(outcome: RewardedAdOutcome | null): void {
  mockOutcomeOverride = outcome;
}

export function __resetRewardedAdServiceForTests(): void {
  modulePromise = null;
  mockOutcomeOverride = null;
  nativeAds.clear();
  rewardedStatus = {
    initialized: false,
    provider: 'disabled',
    supported: false,
    availableByType: {},
  };
}

export function __isRunningRewardedAdMockModeForTests(): boolean {
  return isDevelopmentRuntime() && !isAdMobEnabled() && !isAdMobTestMode();
}
