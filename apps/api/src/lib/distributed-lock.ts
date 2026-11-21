import crypto from 'node:crypto';

export interface RedisLockClient {
  set(
    key: string,
    value: string,
    pxMode: 'PX',
    ttlMs: number,
    nxMode: 'NX'
  ): Promise<string | null>;
  eval(script: string, numKeys: number, key: string, token: string): Promise<unknown>;
}

const RELEASE_LOCK_LUA = `
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
else
  return 0
end
`;

export interface DistributedLockHandle {
  key: string;
  token: string;
  ttlMs: number;
}

/**
 * Acquires a single-owner Redis lease lock using atomic SET NX PX.
 * Returns a handle containing a unique owner token if acquired, or null if held by another instance.
 */
export async function acquireDistributedLock(
  client: RedisLockClient,
  lockName: string,
  ttlMs: number
): Promise<DistributedLockHandle | null> {
  if (!Number.isInteger(ttlMs) || ttlMs < 1000) {
    throw new Error('Distributed lock ttlMs must be an integer >= 1000ms');
  }
  const key = `tascora:lock:${lockName}`;
  const token = crypto.randomUUID();
  const result = await client.set(key, token, 'PX', ttlMs, 'NX');
  if (result !== 'OK') {
    return null;
  }
  return { key, token, ttlMs };
}

/**
 * Releases a distributed lock only if the stored value still matches the owner token.
 */
export async function releaseDistributedLock(
  client: RedisLockClient,
  handle: DistributedLockHandle
): Promise<boolean> {
  const released = await client.eval(RELEASE_LOCK_LUA, 1, handle.key, handle.token);
  return Number(released) === 1;
}

/**
 * Executes `fn` exclusively under a Redis distributed lease lock.
 * If another API/worker instance holds the lock, returns `{ executed: false, skipped: true }`.
 */
export async function withDistributedLock<T>(
  client: RedisLockClient,
  lockName: string,
  ttlMs: number,
  fn: () => Promise<T>
): Promise<{ executed: true; skipped: false; result: T } | { executed: false; skipped: true }> {
  const handle = await acquireDistributedLock(client, lockName, ttlMs);
  if (!handle) {
    return { executed: false, skipped: true };
  }
  try {
    const result = await fn();
    return { executed: true, skipped: false, result };
  } finally {
    try {
      await releaseDistributedLock(client, handle);
    } catch {
      // Lease TTL guarantees bounded expiry even if release network call fails.
    }
  }
}
