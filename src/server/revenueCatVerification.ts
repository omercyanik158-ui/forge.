import { PREMIUM_ENTITLEMENT_ID } from '@/config/premium';
import { serverConfig } from './serverConfig';

type RevenueCatSubscriberResponse = {
  subscriber?: {
    entitlements?: Record<string, { expires_date?: string | null }>;
  };
};

type CachedEntitlement = {
  premium: boolean;
  expiresAt: number;
};

const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, CachedEntitlement>();

export async function verifyPremiumEntitlement(appUserId: string | undefined): Promise<boolean> {
  const secret = serverConfig.revenueCatSecretApiKey;
  if (!secret || !appUserId || appUserId.length > 128) return false;

  const cached = cache.get(appUserId);
  if (cached && cached.expiresAt > Date.now()) return cached.premium;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4_000);

  try {
    const response = await fetch(
      `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}`,
      {
        headers: {
          Authorization: `Bearer ${secret}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      },
    );
    if (!response.ok) return false;

    const payload = (await response.json()) as RevenueCatSubscriberResponse;
    const entitlement = payload.subscriber?.entitlements?.[PREMIUM_ENTITLEMENT_ID];
    const expiresAt = entitlement?.expires_date ? Date.parse(entitlement.expires_date) : Number.POSITIVE_INFINITY;
    const premium = !!entitlement && (entitlement.expires_date == null || expiresAt > Date.now());

    if (cache.size >= 5_000) cache.clear();
    cache.set(appUserId, { premium, expiresAt: Date.now() + CACHE_TTL_MS });
    return premium;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}
