import { describe, expect, it, vi } from 'vitest';
import type { Store } from 'express-rate-limit';
import {
  acquireDistributedLock,
  releaseDistributedLock,
  withDistributedLock,
  type RedisLockClient,
} from '../../apps/api/src/lib/distributed-lock';
import { wrapStoreWithOutagePolicy } from '../../apps/api/src/lib/rate-limit-store';
import {
  buildIdempotentJobOptions,
  DEFAULT_JOB_OPTIONS,
  QUEUE_NAMES,
} from '../../apps/api/src/workers/queues';
import { resolveRequestCorrelationId } from '../../apps/api/src/middlewares/correlationId';

function createInMemoryRedisLock(): RedisLockClient {
  const store = new Map<string, string>();
  return {
    set: async (key, value, _px, _ttl, _nx) => {
      if (store.has(key)) return null;
      store.set(key, value);
      return 'OK';
    },
    eval: async (_script, _numKeys, key, token) => {
      if (store.get(key) === token) {
        store.delete(key);
        return 1;
      }
      return 0;
    },
  };
}

describe('Phase 4D Distributed Systems Primitives', () => {
  it('guarantees single-owner cron execution across concurrent instances via Redis lease lock', async () => {
    const fakeRedis = createInMemoryRedisLock();
    let executions = 0;

    const [instA, instB] = await Promise.all([
      withDistributedLock(fakeRedis, 'cron:hourly-financial', 30_000, async () => {
        executions += 1;
        await new Promise((r) => setTimeout(r, 25));
        return 'instance-a';
      }),
      withDistributedLock(fakeRedis, 'cron:hourly-financial', 30_000, async () => {
        executions += 1;
        return 'instance-b';
      }),
    ]);

    expect(executions).toBe(1);
    const executedCount = [instA, instB].filter((r) => r.executed).length;
    const skippedCount = [instA, instB].filter((r) => r.skipped).length;
    expect(executedCount).toBe(1);
    expect(skippedCount).toBe(1);

    // After release, a subsequent tick can acquire cleanly
    const nextTick = await withDistributedLock(fakeRedis, 'cron:hourly-financial', 30_000, async () => {
      executions += 1;
      return 'tick-2';
    });
    expect(nextTick.executed).toBe(true);
    expect(executions).toBe(2);
  });

  it('prevents a non-owner token from releasing another instance lock', async () => {
    const fakeRedis = createInMemoryRedisLock();
    const lock = await acquireDistributedLock(fakeRedis, 'cron:reputation', 60_000);
    expect(lock).not.toBeNull();

    const wrongRelease = await releaseDistributedLock(fakeRedis, {
      ...lock!,
      token: 'forged-owner-token',
    });
    expect(wrongRelease).toBe(false);

    const ownerRelease = await releaseDistributedLock(fakeRedis, lock!);
    expect(ownerRelease).toBe(true);
  });

  it('enforces explicit fail-open vs fail-closed outage policies for Redis rate-limit store', async () => {
    const failingStore: Store = {
      increment: vi.fn().mockRejectedValue(new Error('ECONNREFUSED')),
      decrement: vi.fn().mockResolvedValue(undefined),
      resetKey: vi.fn().mockResolvedValue(undefined),
    };

    const publicStore = wrapStoreWithOutagePolicy(failingStore, 'fail-open', 'public');
    const degraded = await publicStore.increment('127.0.0.1');
    expect(degraded.totalHits).toBe(1);

    const authStore = wrapStoreWithOutagePolicy(failingStore, 'fail-closed', 'auth');
    await expect(authStore.increment('127.0.0.1')).rejects.toThrow('ECONNREFUSED');
  });

  it('configures BullMQ queues with retry, exponential backoff, dead-letter retention, and deterministic jobId', () => {
    expect(Object.values(QUEUE_NAMES)).toEqual([
      'tascora-kyc-scan',
      'tascora-email-delivery',
      'tascora-reputation-update',
    ]);
    expect(DEFAULT_JOB_OPTIONS.attempts).toBe(3);
    expect(DEFAULT_JOB_OPTIONS.backoff).toEqual({ type: 'exponential', delay: 2000 });
    expect(DEFAULT_JOB_OPTIONS.removeOnFail).toEqual({ count: 200 });

    const jobOpts = buildIdempotentJobOptions('email:verify/user 123');
    expect(jobOpts.jobId).toBe('email:verify_user_123');
  });

  it('validates incoming correlation IDs and generates UUIDs for invalid or missing headers', () => {
    expect(resolveRequestCorrelationId('req_abc-123.xyz')).toBe('req_abc-123.xyz');
    const generatedFromInvalid = resolveRequestCorrelationId('bad header with spaces <script>');
    expect(generatedFromInvalid).toMatch(/^[0-9a-f-]{36}$/i);
    const generatedFromMissing = resolveRequestCorrelationId(undefined);
    expect(generatedFromMissing).toMatch(/^[0-9a-f-]{36}$/i);
  });
});
