import { logServerError } from './serverLogger';
import { serverConfig } from './serverConfig';

type BucketEntry = {
  timestamps: number[];
  expiresAt: number;
};

const buckets = new Map<string, BucketEntry>();
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
const MAX_ENTRIES = 10_000;
let lastCleanup = Date.now();

function pruneExpired(entry: BucketEntry, now: number, windowMs: number): void {
  const cutoff = now - windowMs;
  while (entry.timestamps.length > 0 && entry.timestamps[0] < cutoff) {
    entry.timestamps.shift();
  }
}

function maybeCleanup(now: number): void {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, entry] of buckets) {
    if (entry.expiresAt <= now) buckets.delete(key);
  }

  if (buckets.size <= MAX_ENTRIES) return;
  const overflow = buckets.size - MAX_ENTRIES;
  const oldest = [...buckets.entries()]
    .sort((left, right) => left[1].expiresAt - right[1].expiresAt)
    .slice(0, overflow);
  for (const [key] of oldest) buckets.delete(key);
}

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

const UPSTASH_URL = serverConfig.upstashRedisRestUrl;
const UPSTASH_TOKEN = serverConfig.upstashRedisRestToken;

function isUpstashConfigured(): boolean {
  return Boolean(UPSTASH_URL && UPSTASH_TOKEN);
}

type PipelineStep = [string, ...unknown[]];

async function upstashPipeline(steps: PipelineStep[]): Promise<unknown[]> {
  const res = await fetch(`${UPSTASH_URL}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(steps),
  });

  if (!res.ok) {
    throw new Error(`Upstash pipeline failed: ${res.status}`);
  }

  const data = (await res.json()) as { result?: unknown }[];
  return data.map((entry) => entry.result);
}

async function checkWithUpstash(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const windowSeconds = Math.max(1, Math.round(windowMs / 1000));
  const [countResult] = await upstashPipeline([
    ['INCR', key],
    ['EXPIRE', key, windowSeconds],
  ]);
  const count = typeof countResult === 'number' ? countResult : 0;

  if (count > limit) {
    return { allowed: false, remaining: 0, retryAfterSeconds: windowSeconds };
  }

  return { allowed: true, remaining: Math.max(0, limit - count), retryAfterSeconds: 0 };
}

function checkWithMemory(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  maybeCleanup(now);
  const entry = buckets.get(key) ?? { timestamps: [], expiresAt: now + windowMs };
  pruneExpired(entry, now, windowMs);
  entry.expiresAt = (entry.timestamps.at(-1) ?? now) + windowMs;

  if (entry.timestamps.length >= limit) {
    const oldest = entry.timestamps[0] ?? now;
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    buckets.set(key, entry);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  entry.timestamps.push(now);
  entry.expiresAt = now + windowMs;
  buckets.set(key, entry);
  return { allowed: true, remaining: Math.max(0, limit - entry.timestamps.length), retryAfterSeconds: 0 };
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  if (isUpstashConfigured()) {
    try {
      return await checkWithUpstash(key, limit, windowMs);
    } catch (error) {
      logServerError('Upstash rate limit failed, falling back to memory', error, {
        key,
        limit,
        windowMs,
      });
    }
  }

  return checkWithMemory(key, limit, windowMs);
}

export function clearRateLimitState(): void {
  buckets.clear();
}
