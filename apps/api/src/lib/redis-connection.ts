import type { Redis, RedisOptions } from 'ioredis';
import { isIP } from 'node:net';

export function redisOptions(connectionUrl: string): RedisOptions {
  let url: URL;
  try {
    url = new URL(connectionUrl);
    decodeURIComponent(url.username);
    decodeURIComponent(url.password);
  } catch { throw new Error('Invalid REDIS_URL'); }
  // URL query options must not override TLS or timeout policy.
  if (!['redis:', 'rediss:'].includes(url.protocol) || !url.hostname || url.search || url.hash || connectionUrl.trim() !== connectionUrl) {
    throw new Error('Invalid REDIS_URL');
  }
  const hostname = url.hostname.replace(/^\[|\]$/g, '');
  return {
    lazyConnect: true,
    maxRetriesPerRequest: 2,
    connectTimeout: 10000,
    commandTimeout: 3000,
    enableReadyCheck: true,
    retryStrategy: attempts => Math.min(250 * attempts, 5000),
    ...(url.protocol === 'rediss:' ? { tls: { rejectUnauthorized: true, ...(!isIP(hostname) ? { servername: hostname } : {}) } } : {}),
  };
}

// Never serialize arbitrary errors: messages can contain URLs or credentials.
export function redisErrorCategory(error: Error & { code?: string }): string {
  const code = error.code || '';
  if (['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'EAI_AGAIN', 'EHOSTUNREACH', 'ENETUNREACH'].includes(code)) return code;
  if (/^(ERR_TLS_|ERR_SSL_|CERT_|DEPTH_|UNABLE_TO_|SELF_SIGNED)/.test(code)) return 'TLS';
  if (/^(WRONGPASS|NOAUTH|NOPERM)\b/.test(error.message)) return 'AUTH';
  if (/timeout/i.test(error.message)) return 'TIMEOUT';
  return 'UNKNOWN';
}

export function attachRedisDiagnostics(client: Redis, log: (record: object) => void = record => console.error(JSON.stringify(record)), now = Date.now) {
  let lastLog = -Infinity;
  let suppressed = 0;
  let attempts = 0;
  let recovering = false;
  client.on('reconnecting', () => { attempts += 1; });
  client.on('error', (error: Error & { code?: string }) => {
    recovering = true;
    if (now() - lastLog < 30000) { suppressed += 1; return; }
    log({ event: 'redis_unavailable', category: redisErrorCategory(error), status: client.status, retryAttempts: attempts, suppressed });
    lastLog = now(); suppressed = 0;
  });
  client.on('ready', () => {
    if (recovering) log({ event: 'redis_recovered', status: client.status, retryAttempts: attempts, suppressed });
    recovering = false; attempts = 0; suppressed = 0;
  });
}
