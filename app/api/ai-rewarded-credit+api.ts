import { REWARDED_AD_TYPES } from '@/config/rewardedAds';
import { getServerRewardedSnapshot, grantRewardedCreditOnServer } from '@/server/aiMonetization';
import { verifyPremiumEntitlement } from '@/server/revenueCatVerification';

type RewardedCreditRequest = {
  creditType?: unknown;
  appUserId?: unknown;
  deviceId?: unknown;
  premium?: unknown;
  idempotencyKey?: unknown;
};

function errorResponse(status: number, code: string, error: string): Response {
  return Response.json({ code, error }, { status });
}

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json().catch(() => ({}))) as RewardedCreditRequest;
  const appUserId = typeof body.appUserId === 'string' ? body.appUserId : undefined;
  const deviceId = typeof body.deviceId === 'string' ? body.deviceId : undefined;
  const idempotencyKey = typeof body.idempotencyKey === 'string' ? body.idempotencyKey : undefined;
  const creditType = body.creditType === REWARDED_AD_TYPES.mealAnalysis || body.creditType === REWARDED_AD_TYPES.physiqueAnalysis
    ? body.creditType
    : undefined;

  if (!creditType || !idempotencyKey) {
    return errorResponse(400, 'INVALID_REWARDED_REQUEST', 'Rewarded credit request is incomplete.');
  }

  const verifiedPremium = body.premium === true && await verifyPremiumEntitlement(appUserId);
  const result = await grantRewardedCreditOnServer({
    appUserId,
    deviceId,
    creditType,
    verifiedPremium,
    idempotencyKey,
  });

  if (!result.granted) {
    if (result.reason === 'premium_excluded') {
      return errorResponse(403, 'PREMIUM_REWARDED_BLOCKED', 'Premium users cannot receive rewarded ad credits.');
    }
    if (result.reason === 'daily_cap_reached') {
      return Response.json({ granted: false, reason: result.reason, snapshot: result.snapshot }, { status: 429 });
    }
    return errorResponse(400, 'REWARDED_CREDIT_REJECTED', 'Rewarded credit could not be granted.');
  }

  return Response.json({
    granted: true,
    creditId: result.creditId,
    snapshot: result.snapshot,
  });
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const appUserId = url.searchParams.get('appUserId') || undefined;
  const snapshot = await getServerRewardedSnapshot(appUserId);
  return Response.json({ snapshot });
}
