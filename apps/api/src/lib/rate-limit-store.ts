import { RedisStore, type RedisReply } from 'rate-limit-redis';
import type { Options as RateLimitOptions, Store } from 'express-rate-limit';
import { redis } from './redis';
import { logger } from './logger';

export type RateLimitOutagePolicy = 'fail-open' | 'fail-closed';

export interface DistributedRateLimitConfig {
  prefix: string;
  windowMs: number;
  limit: number;
  outagePolicy: RateLimitOutagePolicy;
  useRedis?: boolean;
}

/**
 * Wraps a Redis-backed rate-limit store with an explicit outage policy:
 * - 'fail-open': public read endpoints degrade gracefully if Redis is momentarily unavailable.
 * - 'fail-closed': sensitive auth endpoints reject requests (503/error) rather than dropping brute-force protection.
 */
export function wrapStoreWithOutagePolicy(
  store: Store,
  outagePolicy: RateLimitOutagePolicy,
  prefix: string
): Store {
  return {
    localKeys: false,
    prefix,
    init: (options: RateLimitOptions) => store.init?.(options),
    increment: async (key: string) => {
      try {
        return await store.increment(key);
      } catch (error) {
        logger.warn(
          { event: 'rate_limit_store_error', prefix, outagePolicy },
          'Redis rate-limit store error'
        );
        if (outagePolicy === 'fail-open') {
          return {
            totalHits: 1,
            resetTime: new Date(Date.now() + 60_000),
          };
        }
        throw error;
      }
    },
    decrement: async (key: string) => {
      try {
        await store.decrement(key);
      } catch {
        // Non-fatal on decrement
      }
    },
    resetKey: async (key: string) => {
      try {
        await store.resetKey(key);
      } catch {
        // Non-fatal on reset
      }
    },
  };
}

export function createDistributedRateLimitStore(
  config: DistributedRateLimitConfig
): Store | undefined {
  const shouldUseRedis =
    config.useRedis ??
    (process.env.NODE_ENV !== 'test' &&
      process.env.REDIS_RATE_LIMIT_ENABLED !== 'false' &&
      Boolean(process.env.REDIS_URL));

  if (!shouldUseRedis) {
    return undefined;
  }

  const redisStore = new RedisStore({
    prefix: `tascora:rl:${config.prefix}:`,
    sendCommand: (...args: string[]) =>
      redis.call(...(args as [string, ...string[]])) as Promise<RedisReply>,
  });

  return wrapStoreWithOutagePolicy(redisStore, config.outagePolicy, config.prefix);
}
