import { Platform } from 'react-native';

export const REWARDED_AD_DAILY_CAP = 3;

export const REWARDED_AD_TYPES = {
  mealAnalysis: 'meal_analysis',
  physiqueAnalysis: 'physique_analysis',
} as const;

export type RewardedCreditType = (typeof REWARDED_AD_TYPES)[keyof typeof REWARDED_AD_TYPES];

const GOOGLE_TEST_APP_IDS = {
  ios: 'ca-app-pub-3940256099942544~1458002511',
  android: 'ca-app-pub-3940256099942544~3347511713',
} as const;

const GOOGLE_TEST_REWARDED_IDS = {
  ios: 'ca-app-pub-3940256099942544/1712485313',
  android: 'ca-app-pub-3940256099942544/5224354917',
} as const;

function isDevelopmentRuntime(): boolean {
  return typeof __DEV__ !== 'undefined' && __DEV__;
}

export function isAdMobEnabled(): boolean {
  return process.env.EXPO_PUBLIC_ADMOB_ENABLED === 'true';
}

export function isAdMobTestMode(): boolean {
  return process.env.EXPO_PUBLIC_ADMOB_TEST_MODE === 'true';
}

export function shouldEnableNativeRewardedAds(): boolean {
  return isAdMobEnabled();
}

export function isDevelopmentMockAdsEnabled(): boolean {
  return isDevelopmentRuntime() && !isAdMobEnabled();
}

export function currentAdMobAppId(): string | null {
  if (Platform.OS === 'ios') return process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID || null;
  if (Platform.OS === 'android') return process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID || null;
  return null;
}

export function getRewardedAdUnitId(type: RewardedCreditType): string | null {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') return null;

  if (isAdMobTestMode()) {
    return Platform.OS === 'ios' ? GOOGLE_TEST_REWARDED_IDS.ios : GOOGLE_TEST_REWARDED_IDS.android;
  }

  if (type === REWARDED_AD_TYPES.mealAnalysis) {
    return Platform.OS === 'ios'
      ? process.env.EXPO_PUBLIC_ADMOB_IOS_REWARDED_MEAL_AD_UNIT_ID || null
      : process.env.EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_MEAL_AD_UNIT_ID || null;
  }

  return Platform.OS === 'ios'
    ? process.env.EXPO_PUBLIC_ADMOB_IOS_REWARDED_PHYSIQUE_AD_UNIT_ID || null
    : process.env.EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_PHYSIQUE_AD_UNIT_ID || null;
}

export function getTestAdMobAppId(): string | null {
  if (Platform.OS === 'ios') return GOOGLE_TEST_APP_IDS.ios;
  if (Platform.OS === 'android') return GOOGLE_TEST_APP_IDS.android;
  return null;
}

export function resolveConfiguredAdMobAppId(): string | null {
  if (!shouldEnableNativeRewardedAds()) return null;
  if (isAdMobTestMode()) return getTestAdMobAppId();
  return currentAdMobAppId();
}

export function hasNativeRewardedAdConfig(type: RewardedCreditType): boolean {
  const appId = resolveConfiguredAdMobAppId();
  const adUnitId = getRewardedAdUnitId(type);
  return !!appId && !!adUnitId;
}
