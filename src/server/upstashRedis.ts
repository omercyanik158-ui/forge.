import { Redis } from '@upstash/redis';

let redisInstance: Redis | null | undefined;

export function isUpstashRedisConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

export function getUpstashRedis(): Redis | null {
  if (redisInstance !== undefined) return redisInstance;
  if (!isUpstashRedisConfigured()) {
    redisInstance = null;
    return redisInstance;
  }

  redisInstance = Redis.fromEnv({
    cache: 'no-store',
    keepAlive: true,
  });
  return redisInstance;
}
