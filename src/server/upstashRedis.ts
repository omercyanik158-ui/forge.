import { Redis } from '@upstash/redis';
import { serverConfig } from './serverConfig';

let redisInstance: Redis | null | undefined;

export function isUpstashRedisConfigured(): boolean {
  return Boolean(serverConfig.upstashRedisRestUrl && serverConfig.upstashRedisRestToken);
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
