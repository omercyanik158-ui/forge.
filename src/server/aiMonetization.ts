import { REWARDED_AD_DAILY_CAP, REWARDED_AD_TYPES, type RewardedCreditType } from '@/config/rewardedAds';
import { getUpstashRedis } from './upstashRedis';

export type MonetizationAnalysisType = 'food' | 'physique';
export type MonetizationTier = 'free' | 'premium';
export type RewardedCreditStatus = 'active' | 'consumed' | 'expired';
export type RewardedCreditSource = 'rewarded_ad';

type RewardedCreditRecord = {
  id: string;
  userId: string;
  deviceId: string;
  creditType: RewardedCreditType;
  source: RewardedCreditSource;
  status: RewardedCreditStatus;
  grantedAt: string;
  consumedAt: string;
  idempotencyKey: string;
};

export type RewardedCreditGrantResponse = {
  granted: boolean;
  reason?: 'daily_cap_reached' | 'premium_excluded' | 'invalid_user';
  creditId?: string;
  snapshot: ServerRewardedSnapshot;
};

export type ServerRewardedSnapshot = {
  availableCredits: Record<RewardedCreditType, number>;
  dailyRewardCount: number;
  remainingDailyRewardCount: number;
};

export type AiQuotaAuthorization = {
  allowed: boolean;
  source: 'premium' | 'free_quota' | 'rewarded_credit' | 'blocked';
  blockedReason?: 'hourly_limit_reached' | 'daily_limit_reached' | 'type_limit_reached' | 'daily_cap_reached' | 'premium_type_limit_reached';
  showRewardedAdOption: boolean;
  requestId: string;
  creditId?: string;
  creditRecordKey?: string;
  finalized?: boolean;
};

export type AiQuotaFinalizeResult = {
  status: 'ok' | 'released' | 'duplicate' | 'missing';
  source?: 'premium' | 'free_quota' | 'rewarded_credit';
};

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;
const REQUEST_TTL_MS = 7 * DAY_MS;
const IDEMPOTENCY_TTL_MS = 7 * DAY_MS;

const LIMITS = {
  free: {
    mealPerWindow: 1,
    physiquePerWindow: 1,
    hourly: 5,
    daily: 10,
  },
  premium: {
    mealPerWindow: 5,
    physiquePerWindow: 3,
    hourly: 20,
    daily: 50,
  },
} as const;

const memory = {
  requests: new Map<string, string>(),
  credits: new Map<string, RewardedCreditRecord>(),
  activeCredits: new Map<string, string[]>(),
  dailyRewards: new Map<string, { creditId: string; grantedAtMs: number }[]>(),
  usageAll: new Map<string, { requestId: string; atMs: number }[]>(),
  usageType: new Map<string, { requestId: string; atMs: number }[]>(),
  grantIdempotency: new Map<string, string>(),
};

function createUserKey(userId: string): string {
  return `forge:monetization:${userId}`;
}

function getAnalysisCreditType(type: MonetizationAnalysisType): RewardedCreditType {
  return type === 'food' ? REWARDED_AD_TYPES.mealAnalysis : REWARDED_AD_TYPES.physiqueAnalysis;
}

function getTypeWindowMs(type: MonetizationAnalysisType): number {
  return type === 'food' ? DAY_MS : WEEK_MS;
}

function getTypeLimit(type: MonetizationAnalysisType, tier: MonetizationTier): number {
  return type === 'food' ? LIMITS[tier].mealPerWindow : LIMITS[tier].physiquePerWindow;
}

function buildQuotaKeys(userId: string, type: MonetizationAnalysisType, requestId: string) {
  const base = createUserKey(userId);
  const creditType = getAnalysisCreditType(type);
  return {
    requestKey: `${base}:requests:${requestId}`,
    usageAllKey: `${base}:usage:all`,
    usageTypeKey: `${base}:usage:${type}`,
    activeCreditsKey: `${base}:credits:${creditType}:active`,
    dailyRewardsKey: `${base}:rewarded:daily`,
  };
}

function buildGrantKeys(userId: string, creditType: RewardedCreditType, idempotencyKey: string, creditId: string) {
  const base = createUserKey(userId);
  return {
    activeCreditsKey: `${base}:credits:${creditType}:active`,
    dailyRewardsKey: `${base}:rewarded:daily`,
    idempotencyKey: `${base}:rewarded:idempotency:${idempotencyKey}`,
    creditRecordKey: `${base}:credit-record:${creditId}`,
  };
}

function nowIso(nowMs: number): string {
  return new Date(nowMs).toISOString();
}

function safeUserId(userId: string | undefined): string | null {
  if (!userId || userId.length > 128) return null;
  return userId;
}

function pruneUsage(entries: { requestId: string; atMs: number }[], windowMs: number, nowMs: number) {
  return entries.filter((item) => item.atMs >= nowMs - windowMs);
}

function pruneDailyRewards(entries: { creditId: string; grantedAtMs: number }[], nowMs: number) {
  return entries.filter((item) => item.grantedAtMs >= nowMs - DAY_MS);
}

function cloneSnapshot(availableCredits: Record<RewardedCreditType, number>, dailyRewardCount: number): ServerRewardedSnapshot {
  return {
    availableCredits,
    dailyRewardCount,
    remainingDailyRewardCount: Math.max(0, REWARDED_AD_DAILY_CAP - dailyRewardCount),
  };
}

function memorySnapshot(userId: string, nowMs: number): ServerRewardedSnapshot {
  const base = createUserKey(userId);
  const mealKey = `${base}:credits:${REWARDED_AD_TYPES.mealAnalysis}:active`;
  const physiqueKey = `${base}:credits:${REWARDED_AD_TYPES.physiqueAnalysis}:active`;
  const dailyKey = `${base}:rewarded:daily`;
  const daily = pruneDailyRewards(memory.dailyRewards.get(dailyKey) ?? [], nowMs);
  memory.dailyRewards.set(dailyKey, daily);
  return cloneSnapshot({
    [REWARDED_AD_TYPES.mealAnalysis]: (memory.activeCredits.get(mealKey) ?? []).length,
    [REWARDED_AD_TYPES.physiqueAnalysis]: (memory.activeCredits.get(physiqueKey) ?? []).length,
  }, daily.length);
}

async function getRedisRewardedSnapshot(userId: string, nowMs: number): Promise<ServerRewardedSnapshot> {
  const redis = getUpstashRedis();
  if (!redis) return memorySnapshot(userId, nowMs);

  const base = createUserKey(userId);
  const mealKey = `${base}:credits:${REWARDED_AD_TYPES.mealAnalysis}:active`;
  const physiqueKey = `${base}:credits:${REWARDED_AD_TYPES.physiqueAnalysis}:active`;
  const dailyKey = `${base}:rewarded:daily`;
  await redis.zremrangebyscore(dailyKey, 0, nowMs - DAY_MS);
  const [mealCount, physiqueCount, dailyCount] = await Promise.all([
    redis.zcard(mealKey),
    redis.zcard(physiqueKey),
    redis.zcount(dailyKey, nowMs - DAY_MS, nowMs),
  ]);

  return cloneSnapshot({
    [REWARDED_AD_TYPES.mealAnalysis]: Number(mealCount ?? 0),
    [REWARDED_AD_TYPES.physiqueAnalysis]: Number(physiqueCount ?? 0),
  }, Number(dailyCount ?? 0));
}

const authorizeQuotaScript = `
local requestRaw = redis.call('GET', KEYS[1])
if requestRaw then
  return { 'existing', requestRaw }
end

local nowMs = tonumber(ARGV[1])
local hourWindowStart = nowMs - tonumber(ARGV[2])
local dayWindowStart = nowMs - tonumber(ARGV[3])
local typeWindowStart = nowMs - tonumber(ARGV[4])
local hourlyLimit = tonumber(ARGV[5])
local dailyLimit = tonumber(ARGV[6])
local typeLimit = tonumber(ARGV[7])
local isPremium = ARGV[8] == '1'
local requestId = ARGV[9]
local dailyRewardCap = tonumber(ARGV[10])
local ttlMs = tonumber(ARGV[11])
local activeCreditType = ARGV[12]

redis.call('ZREMRANGEBYSCORE', KEYS[2], 0, dayWindowStart)
redis.call('ZREMRANGEBYSCORE', KEYS[3], 0, typeWindowStart)
redis.call('ZREMRANGEBYSCORE', KEYS[5], 0, dayWindowStart)

local hourlyCount = tonumber(redis.call('ZCOUNT', KEYS[2], hourWindowStart, nowMs)) or 0
local dailyCount = tonumber(redis.call('ZCOUNT', KEYS[2], dayWindowStart, nowMs)) or 0
local typeCount = tonumber(redis.call('ZCOUNT', KEYS[3], typeWindowStart, nowMs)) or 0
local rewardedDailyCount = tonumber(redis.call('ZCOUNT', KEYS[5], dayWindowStart, nowMs)) or 0

local payload = {
  requestId = requestId,
  creditType = activeCreditType,
  finalized = false,
}

if hourlyCount >= hourlyLimit then
  payload.allowed = false
  payload.source = 'blocked'
  payload.blockedReason = 'hourly_limit_reached'
  payload.showRewardedAdOption = false
elseif dailyCount >= dailyLimit then
  payload.allowed = false
  payload.source = 'blocked'
  payload.blockedReason = 'daily_limit_reached'
  payload.showRewardedAdOption = false
elseif typeCount < typeLimit then
  payload.allowed = true
  payload.source = isPremium and 'premium' or 'free_quota'
  payload.showRewardedAdOption = false
elseif isPremium then
  payload.allowed = false
  payload.source = 'blocked'
  payload.blockedReason = 'premium_type_limit_reached'
  payload.showRewardedAdOption = false
else
  local activeCredits = redis.call('ZRANGE', KEYS[4], 0, 0)
  if activeCredits and #activeCredits > 0 then
    local creditId = activeCredits[1]
    redis.call('ZREM', KEYS[4], creditId)
    payload.allowed = true
    payload.source = 'rewarded_credit'
    payload.creditId = creditId
    payload.creditRecordKey = KEYS[6] .. creditId
    payload.showRewardedAdOption = false
  else
    payload.allowed = false
    payload.source = 'blocked'
    payload.blockedReason = rewardedDailyCount >= dailyRewardCap and 'daily_cap_reached' or 'type_limit_reached'
    payload.showRewardedAdOption = rewardedDailyCount < dailyRewardCap
  end
end

local encoded = cjson.encode(payload)
redis.call('SET', KEYS[1], encoded, 'PX', ttlMs)
return { 'created', encoded }
`;

const finalizeQuotaScript = `
local payloadRaw = redis.call('GET', KEYS[1])
if not payloadRaw then
  return { 'missing', '' }
end

local payload = cjson.decode(payloadRaw)
if payload.finalized == true then
  return { 'duplicate', payload.source or '' }
end

local success = ARGV[1] == '1'
local nowIso = ARGV[2]
local nowMs = tonumber(ARGV[3])
local ttlMs = tonumber(ARGV[4])

if success then
  if payload.source == 'rewarded_credit' and payload.creditRecordKey then
    redis.call('HSET', payload.creditRecordKey, 'status', 'consumed', 'consumedAt', nowIso)
  end
  redis.call('ZADD', KEYS[2], nowMs, payload.requestId)
  redis.call('ZADD', KEYS[3], nowMs, payload.requestId)
  payload.finalized = true
  payload.success = true
  redis.call('SET', KEYS[1], cjson.encode(payload), 'PX', ttlMs)
  return { 'ok', payload.source or '' }
end

if payload.source == 'rewarded_credit' and payload.creditId then
  redis.call('ZADD', KEYS[4], nowMs, payload.creditId)
  if payload.creditRecordKey then
    redis.call('HSET', payload.creditRecordKey, 'status', 'active', 'consumedAt', '')
  end
end

redis.call('DEL', KEYS[1])
return { 'released', payload.source or '' }
`;

const grantRewardedCreditScript = `
local existingCreditId = redis.call('GET', KEYS[1])
if existingCreditId then
  return { 'existing', existingCreditId }
end

local nowMs = tonumber(ARGV[1])
local grantedAt = ARGV[2]
local creditId = ARGV[3]
local cap = tonumber(ARGV[4])
local ttlMs = tonumber(ARGV[5])
local creditType = ARGV[6]
local userId = ARGV[7]
local deviceId = ARGV[8]
local idempotencyKey = ARGV[9]

redis.call('ZREMRANGEBYSCORE', KEYS[2], 0, nowMs - 86400000)
local dailyCount = tonumber(redis.call('ZCOUNT', KEYS[2], nowMs - 86400000, nowMs)) or 0
if dailyCount >= cap then
  return { 'blocked', tostring(dailyCount) }
end

redis.call('HSET', KEYS[4],
  'id', creditId,
  'userId', userId,
  'deviceId', deviceId,
  'creditType', creditType,
  'source', 'rewarded_ad',
  'status', 'active',
  'grantedAt', grantedAt,
  'consumedAt', '',
  'idempotencyKey', idempotencyKey
)
redis.call('ZADD', KEYS[3], nowMs, creditId)
redis.call('ZADD', KEYS[2], nowMs, creditId)
redis.call('SET', KEYS[1], creditId, 'PX', ttlMs)
return { 'granted', creditId }
`;

async function authorizeWithMemory(params: {
  userId: string;
  type: MonetizationAnalysisType;
  tier: MonetizationTier;
  requestId: string;
  nowMs: number;
}): Promise<AiQuotaAuthorization> {
  const { userId, type, tier, requestId, nowMs } = params;
  const keys = buildQuotaKeys(userId, type, requestId);
  const existing = memory.requests.get(keys.requestKey);
  if (existing) return JSON.parse(existing) as AiQuotaAuthorization;

  const usageAll = pruneUsage(memory.usageAll.get(keys.usageAllKey) ?? [], DAY_MS, nowMs);
  const usageType = pruneUsage(memory.usageType.get(keys.usageTypeKey) ?? [], getTypeWindowMs(type), nowMs);
  const dailyRewards = pruneDailyRewards(memory.dailyRewards.get(keys.dailyRewardsKey) ?? [], nowMs);
  memory.usageAll.set(keys.usageAllKey, usageAll);
  memory.usageType.set(keys.usageTypeKey, usageType);
  memory.dailyRewards.set(keys.dailyRewardsKey, dailyRewards);

  const hourlyCount = usageAll.filter((item) => item.atMs >= nowMs - HOUR_MS).length;
  const dailyCount = usageAll.length;
  const typeCount = usageType.length;
  const activeCredits = memory.activeCredits.get(keys.activeCreditsKey) ?? [];

  let payload: AiQuotaAuthorization;
  if (hourlyCount >= LIMITS[tier].hourly) {
    payload = { allowed: false, source: 'blocked', blockedReason: 'hourly_limit_reached', showRewardedAdOption: false, requestId };
  } else if (dailyCount >= LIMITS[tier].daily) {
    payload = { allowed: false, source: 'blocked', blockedReason: 'daily_limit_reached', showRewardedAdOption: false, requestId };
  } else if (typeCount < getTypeLimit(type, tier)) {
    payload = { allowed: true, source: tier === 'premium' ? 'premium' : 'free_quota', showRewardedAdOption: false, requestId };
  } else if (tier === 'premium') {
    payload = { allowed: false, source: 'blocked', blockedReason: 'premium_type_limit_reached', showRewardedAdOption: false, requestId };
  } else if (activeCredits.length > 0) {
    const creditId = activeCredits.shift() as string;
    memory.activeCredits.set(keys.activeCreditsKey, activeCredits);
    payload = {
      allowed: true,
      source: 'rewarded_credit',
      showRewardedAdOption: false,
      requestId,
      creditId,
      creditRecordKey: `${createUserKey(userId)}:credit-record:${creditId}`,
    };
  } else {
    payload = {
      allowed: false,
      source: 'blocked',
      blockedReason: dailyRewards.length >= REWARDED_AD_DAILY_CAP ? 'daily_cap_reached' : 'type_limit_reached',
      showRewardedAdOption: dailyRewards.length < REWARDED_AD_DAILY_CAP,
      requestId,
    };
  }

  memory.requests.set(keys.requestKey, JSON.stringify(payload));
  return payload;
}

async function finalizeWithMemory(params: {
  userId: string;
  type: MonetizationAnalysisType;
  requestId: string;
  success: boolean;
  nowMs: number;
}): Promise<AiQuotaFinalizeResult> {
  const keys = buildQuotaKeys(params.userId, params.type, params.requestId);
  const payloadRaw = memory.requests.get(keys.requestKey);
  if (!payloadRaw) return { status: 'missing' };
  const payload = JSON.parse(payloadRaw) as AiQuotaAuthorization & { finalized?: boolean };
  if (payload.finalized) return { status: 'duplicate', source: payload.source as AiQuotaFinalizeResult['source'] };

  if (params.success) {
    const all = memory.usageAll.get(keys.usageAllKey) ?? [];
    const type = memory.usageType.get(keys.usageTypeKey) ?? [];
    all.push({ requestId: params.requestId, atMs: params.nowMs });
    type.push({ requestId: params.requestId, atMs: params.nowMs });
    memory.usageAll.set(keys.usageAllKey, all);
    memory.usageType.set(keys.usageTypeKey, type);
    if (payload.source === 'rewarded_credit' && payload.creditRecordKey) {
      const record = memory.credits.get(payload.creditRecordKey);
      if (record) {
        record.status = 'consumed';
        record.consumedAt = nowIso(params.nowMs);
        memory.credits.set(payload.creditRecordKey, record);
      }
    }
    payload.finalized = true;
    memory.requests.set(keys.requestKey, JSON.stringify(payload));
    return { status: 'ok', source: payload.source as AiQuotaFinalizeResult['source'] };
  }

  if (payload.source === 'rewarded_credit' && payload.creditId) {
    const activeCredits = memory.activeCredits.get(keys.activeCreditsKey) ?? [];
    activeCredits.unshift(payload.creditId);
    memory.activeCredits.set(keys.activeCreditsKey, activeCredits);
    if (payload.creditRecordKey) {
      const record = memory.credits.get(payload.creditRecordKey);
      if (record) {
        record.status = 'active';
        record.consumedAt = '';
        memory.credits.set(payload.creditRecordKey, record);
      }
    }
  }
  memory.requests.delete(keys.requestKey);
  return { status: 'released', source: payload.source as AiQuotaFinalizeResult['source'] };
}

export async function grantRewardedCreditOnServer(params: {
  appUserId: string | undefined;
  deviceId: string | undefined;
  creditType: RewardedCreditType;
  verifiedPremium: boolean;
  idempotencyKey: string;
  now?: Date;
}): Promise<RewardedCreditGrantResponse> {
  const userId = safeUserId(params.appUserId);
  if (!userId || !params.deviceId) {
    return { granted: false, reason: 'invalid_user', snapshot: cloneSnapshot({
      [REWARDED_AD_TYPES.mealAnalysis]: 0,
      [REWARDED_AD_TYPES.physiqueAnalysis]: 0,
    }, 0) };
  }
  if (params.verifiedPremium) {
    return { granted: false, reason: 'premium_excluded', snapshot: await getRedisRewardedSnapshot(userId, (params.now ?? new Date()).getTime()) };
  }

  const now = params.now ?? new Date();
  const nowMs = now.getTime();
  const creditId = `${params.creditType}:${nowMs}:${params.idempotencyKey}`;
  const keys = buildGrantKeys(userId, params.creditType, params.idempotencyKey, creditId);
  const redis = getUpstashRedis();

  if (!redis) {
    const snapshotBefore = memorySnapshot(userId, nowMs);
    if (snapshotBefore.dailyRewardCount >= REWARDED_AD_DAILY_CAP) {
      return { granted: false, reason: 'daily_cap_reached', snapshot: snapshotBefore };
    }
    const record: RewardedCreditRecord = {
      id: creditId,
      userId,
      deviceId: params.deviceId,
      creditType: params.creditType,
      source: 'rewarded_ad',
      status: 'active',
      grantedAt: now.toISOString(),
      consumedAt: '',
      idempotencyKey: params.idempotencyKey,
    };
    memory.credits.set(keys.creditRecordKey, record);
    memory.grantIdempotency.set(keys.idempotencyKey, creditId);
    const activeCredits = memory.activeCredits.get(keys.activeCreditsKey) ?? [];
    activeCredits.push(creditId);
    memory.activeCredits.set(keys.activeCreditsKey, activeCredits);
    const dailyRewards = pruneDailyRewards(memory.dailyRewards.get(keys.dailyRewardsKey) ?? [], nowMs);
    dailyRewards.push({ creditId, grantedAtMs: nowMs });
    memory.dailyRewards.set(keys.dailyRewardsKey, dailyRewards);
    return {
      granted: true,
      creditId,
      snapshot: memorySnapshot(userId, nowMs),
    };
  }

  const grantScript = redis.createScript<[string, string]>(grantRewardedCreditScript);
  const result = await grantScript.eval(
    [keys.idempotencyKey, keys.dailyRewardsKey, keys.activeCreditsKey, keys.creditRecordKey],
    [
      String(nowMs),
      now.toISOString(),
      creditId,
      String(REWARDED_AD_DAILY_CAP),
      String(IDEMPOTENCY_TTL_MS),
      params.creditType,
      userId,
      params.deviceId,
      params.idempotencyKey,
    ],
  );

  const status = result?.[0];
  const snapshot = await getRedisRewardedSnapshot(userId, nowMs);
  if (status === 'blocked') return { granted: false, reason: 'daily_cap_reached', snapshot };
  return {
    granted: true,
    creditId: result?.[1] || creditId,
    snapshot,
  };
}

export async function authorizeAiQuota(params: {
  appUserId: string | undefined;
  analysisType: MonetizationAnalysisType;
  verifiedPremium: boolean;
  requestId: string;
  now?: Date;
}): Promise<AiQuotaAuthorization> {
  const userId = safeUserId(params.appUserId);
  const now = params.now ?? new Date();
  if (!userId) {
    return {
      allowed: false,
      source: 'blocked',
      blockedReason: 'daily_limit_reached',
      showRewardedAdOption: false,
      requestId: params.requestId,
    };
  }

  const tier: MonetizationTier = params.verifiedPremium ? 'premium' : 'free';
  const keys = buildQuotaKeys(userId, params.analysisType, params.requestId);
  const nowMs = now.getTime();
  const redis = getUpstashRedis();
  if (!redis) {
    return authorizeWithMemory({
      userId,
      type: params.analysisType,
      tier,
      requestId: params.requestId,
      nowMs,
    });
  }

  const authorizeScript = redis.createScript<[string, string]>(authorizeQuotaScript);
  const result = await authorizeScript.eval(
    [keys.requestKey, keys.usageAllKey, keys.usageTypeKey, keys.activeCreditsKey, keys.dailyRewardsKey, `${createUserKey(userId)}:credit-record:`],
    [
      String(nowMs),
      String(HOUR_MS),
      String(DAY_MS),
      String(getTypeWindowMs(params.analysisType)),
      String(LIMITS[tier].hourly),
      String(LIMITS[tier].daily),
      String(getTypeLimit(params.analysisType, tier)),
      params.verifiedPremium ? '1' : '0',
      params.requestId,
      String(REWARDED_AD_DAILY_CAP),
      String(REQUEST_TTL_MS),
      getAnalysisCreditType(params.analysisType),
    ],
  );

  const payload = JSON.parse(result?.[1] || '{}') as AiQuotaAuthorization;
  return payload;
}

export async function finalizeAiQuota(params: {
  appUserId: string | undefined;
  analysisType: MonetizationAnalysisType;
  requestId: string;
  success: boolean;
  now?: Date;
}): Promise<AiQuotaFinalizeResult> {
  const userId = safeUserId(params.appUserId);
  if (!userId) return { status: 'missing' };
  const now = params.now ?? new Date();
  const nowMs = now.getTime();
  const keys = buildQuotaKeys(userId, params.analysisType, params.requestId);
  const redis = getUpstashRedis();
  if (!redis) {
    return finalizeWithMemory({
      userId,
      type: params.analysisType,
      requestId: params.requestId,
      success: params.success,
      nowMs,
    });
  }

  const finalizeScript = redis.createScript<[string, string]>(finalizeQuotaScript);
  const result = await finalizeScript.eval(
    [keys.requestKey, keys.usageAllKey, keys.usageTypeKey, keys.activeCreditsKey],
    [params.success ? '1' : '0', nowIso(nowMs), String(nowMs), String(REQUEST_TTL_MS)],
  );
  return {
    status: (result?.[0] as AiQuotaFinalizeResult['status']) || 'missing',
    source: result?.[1] as AiQuotaFinalizeResult['source'],
  };
}

export async function getServerRewardedSnapshot(appUserId: string | undefined, now = new Date()): Promise<ServerRewardedSnapshot> {
  const userId = safeUserId(appUserId);
  if (!userId) {
    return cloneSnapshot({
      [REWARDED_AD_TYPES.mealAnalysis]: 0,
      [REWARDED_AD_TYPES.physiqueAnalysis]: 0,
    }, 0);
  }
  return getRedisRewardedSnapshot(userId, now.getTime());
}

export function clearAiMonetizationMemoryState(): void {
  memory.requests.clear();
  memory.credits.clear();
  memory.activeCredits.clear();
  memory.dailyRewards.clear();
  memory.usageAll.clear();
  memory.usageType.clear();
  memory.grantIdempotency.clear();
}
