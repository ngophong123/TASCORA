import { afterEach, expect, it, vi } from 'vitest';
import { createRequire } from 'node:module';
import { EventEmitter } from 'node:events';
import tls from 'node:tls';
import express from 'express';
import request from 'supertest';
import { attachRedisDiagnostics, redisErrorCategory, redisOptions } from '../../apps/api/src/lib/redis-connection';
import { healthRouter } from '../../apps/api/src/lib/health';

const requireApi = createRequire(new URL('../../apps/api/package.json', import.meta.url));
const { Redis } = requireApi('ioredis');
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });

it('passes SNI and certificate verification to the actual ioredis TLS connector without network access', async () => {
  const connect = vi.spyOn(tls, 'connect').mockImplementation(() => { throw new Error('Mock transport'); });
  const url = 'rediss://default:fixture%40password@fixture.example:6379';
  const client = new Redis(url, redisOptions(url));
  client.on('error', () => {});
  expect(connect).not.toHaveBeenCalled(); // lazy singleton
  expect(client.options).toMatchObject({ host: 'fixture.example', port: 6379, username: 'default', password: 'fixture@password' });
  try {
    await expect(client.connect()).rejects.toThrow();
    expect(connect).toHaveBeenCalledWith(expect.objectContaining({ host: 'fixture.example', port: 6379, servername: 'fixture.example', rejectUnauthorized: true }));
  } finally { client.disconnect(); }
});

it('bounds retries and timeouts while continuing recovery after cold starts', () => {
  const options = redisOptions('rediss://default:fixture@fixture.example:6379');
  expect(options).toMatchObject({ connectTimeout: 10000, commandTimeout: 3000, maxRetriesPerRequest: 2, enableReadyCheck: true });
  const retry = options.retryStrategy!;
  expect(retry(1)).toBe(250); expect(retry(20)).toBe(5000); expect(retry(10000)).toBe(5000);
  expect(redisOptions('redis://localhost:6379').tls).toBeUndefined();
  expect(redisOptions('rediss://127.0.0.1:6379').tls).toEqual({ rejectUnauthorized: true });
});

it.each(['invalid-secret-url', 'https://fixture.example', ' rediss://fixture.example', 'rediss://fixture.example?tls=false', 'rediss://fixture.example#fragment', 'rediss://default:%XX@fixture.example'])('rejects invalid configuration without revealing it', url => {
  expect(() => redisOptions(url)).toThrow('Invalid REDIS_URL');
});

it('classifies safe errors and throttles repeated logs with recovery diagnostics', () => {
  const client = Object.assign(new EventEmitter(), { status: 'connecting' });
  const log = vi.fn(); let time = 0;
  attachRedisDiagnostics(client as Parameters<typeof attachRedisDiagnostics>[0], log, () => time);
  const error = Object.assign(new Error('rediss://secret:password@private.example'), { code: 'ECONNRESET' });
  client.emit('error', error); client.emit('reconnecting'); client.emit('error', error);
  expect(log).toHaveBeenCalledTimes(1);
  time = 30000; client.emit('error', error);
  expect(log.mock.calls[1][0]).toMatchObject({ category: 'ECONNRESET', retryAttempts: 1, suppressed: 1 });
  client.status = 'ready'; client.emit('ready');
  expect(log.mock.calls[2][0]).toMatchObject({ event: 'redis_recovered' });
  expect(JSON.stringify(log.mock.calls)).not.toMatch(/secret|password|private\.example|rediss/);
  expect(redisErrorCategory(Object.assign(new Error('hidden'), { code: 'ERR_TLS_CERT_ALTNAME_INVALID' }))).toBe('TLS');
  expect(redisErrorCategory(new Error('WRONGPASS hidden'))).toBe('AUTH');
  for (const code of ['ENOTFOUND', 'ETIMEDOUT', 'ECONNREFUSED']) expect(redisErrorCategory(Object.assign(new Error('hidden'), { code }))).toBe(code);
  expect(redisErrorCategory(Object.assign(new Error('hidden'), { code: 'secret' }))).toBe('UNKNOWN');
});

it('returns real readiness, bounds hanging checks, shares pending work and recovers', async () => {
  vi.stubEnv('PAYMENTS_PROVIDER', 'disabled');
  let resolveRedis!: (value: string) => void;
  const redis = vi.fn(() => new Promise<string>(resolve => { resolveRedis = resolve; }));
  const database = vi.fn(async () => 1);
  const app = express(); app.use(healthRouter({ database, redis }, 30));
  expect((await request(app).get('/health')).status).toBe(503);
  expect((await request(app).get('/health')).status).toBe(503);
  expect(redis).toHaveBeenCalledTimes(1); expect(database).toHaveBeenCalledTimes(1);
  expect((await request(app).get('/health/live')).status).toBe(200);
  resolveRedis('PONG'); await new Promise(resolve => setImmediate(resolve));
  redis.mockImplementation(async () => 'PONG');
  expect((await request(app).get('/health')).status).toBe(200);
  database.mockRejectedValue(new Error('private connection secret'));
  const failed = await request(app).get('/health');
  expect(failed.status).toBe(503); expect(JSON.stringify(failed.body)).not.toContain('secret');
});
