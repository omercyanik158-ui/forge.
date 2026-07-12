import Constants from 'expo-constants';
import { fetch } from 'expo/fetch';
import type { RewardedCreditType } from '@/config/rewardedAds';

type RewardedCreditApiResponse = {
  granted?: boolean;
  reason?: string;
  snapshot?: {
    availableCredits?: Partial<Record<RewardedCreditType, number>>;
    dailyRewardCount?: number;
    remainingDailyRewardCount?: number;
  };
  error?: string;
  code?: string;
};

function normalizeHttpOrigin(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim().replace(/\/$/, '');
  if (!trimmed) return null;
  if (/^https?:\/\//.test(trimmed)) return trimmed;
  if (/^exps?:\/\//.test(trimmed)) {
    return trimmed.replace(/^exp:\/\//, 'http://').replace(/^exps:\/\//, 'https://');
  }
  return `http://${trimmed}`;
}

function developmentOrigin(): string | null {
  const candidates = [
    Constants.expoConfig?.hostUri,
    Constants.expoGoConfig?.debuggerHost,
    Constants.experienceUrl,
    Constants.linkingUri,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeHttpOrigin(candidate);
    if (normalized) {
      return normalized.replace(/\/--(?:\/.*)?$/, '').replace(/\/$/, '');
    }
  }

  return null;
}

function rewardedCreditEndpoint(): string {
  const baseUrl = process.env.EXPO_PUBLIC_AI_API_URL?.replace(/\/$/, '');
  if (baseUrl) return `${baseUrl}/api/ai-rewarded-credit`;
  if (process.env.EXPO_OS === 'web') return '/api/ai-rewarded-credit';

  const origin = developmentOrigin();
  if (origin) return `${origin}/api/ai-rewarded-credit`;

  throw new Error('REWARDED_CREDIT_API_NOT_CONFIGURED');
}

export async function claimRewardedCredit(params: {
  creditType: RewardedCreditType;
  appUserId: string;
  deviceId: string;
  premium: boolean;
  idempotencyKey: string;
}): Promise<{ granted: boolean; reason?: string; snapshot?: RewardedCreditApiResponse['snapshot'] }> {
  const response = await fetch(rewardedCreditEndpoint(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  const payload = (await response.json().catch(() => ({}))) as RewardedCreditApiResponse;
  if (!response.ok) {
    return {
      granted: false,
      reason: payload.reason || payload.code || payload.error || 'rewarded_credit_failed',
      snapshot: payload.snapshot,
    };
  }

  return {
    granted: payload.granted === true,
    reason: payload.reason,
    snapshot: payload.snapshot,
  };
}

export async function fetchRewardedCreditSnapshot(appUserId: string): Promise<RewardedCreditApiResponse['snapshot'] | null> {
  const endpoint = rewardedCreditEndpoint();
  const response = await fetch(`${endpoint}?appUserId=${encodeURIComponent(appUserId)}`);
  if (!response.ok) return null;
  const payload = (await response.json().catch(() => ({}))) as RewardedCreditApiResponse;
  return payload.snapshot ?? null;
}
