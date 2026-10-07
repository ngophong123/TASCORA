import { afterEach, expect, it, vi } from 'vitest';
import request from 'supertest';

// No dependency connection or provider call: only inspect the actual Express app.
vi.mock('../../apps/api/src/lib/prisma', () => ({ prisma: {} }));
vi.mock('../../apps/api/src/lib/redis', () => ({ redis: {} }));
vi.mock('../../apps/api/src/lib/socket', () => ({ initSocket: vi.fn(), getIO: vi.fn() }));
afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });

it('supplies numeric 1 to the actual Express app and recognizes forwarded HTTPS', async () => {
  vi.stubEnv('TRUST_PROXY', ' 1 ');
  const { app } = await import('../../apps/api/src/server');
  expect(app.get('trust proxy')).toBe(1);
  app.get('/__proxy-test', (req, res) => { res.json({ protocol: req.protocol, secure: req.secure, ip: req.ip }); });
  const response = await request(app).get('/__proxy-test').set('X-Forwarded-Proto', 'https').set('X-Forwarded-For', '198.51.100.10, 203.0.113.20');
  expect(response.status).toBe(200);
  expect(response.body).toEqual({ protocol: 'https', secure: true, ip: '203.0.113.20' });
});
it('defaults the actual Express app to no proxy trust and ignores forwarded protocol', async () => {
  vi.stubEnv('TRUST_PROXY', undefined);
  const { app } = await import('../../apps/api/src/server');
  expect(app.get('trust proxy')).toBe(false);
  app.get('/__proxy-test', (req, res) => { res.json({ protocol: req.protocol, secure: req.secure }); });
  const response = await request(app).get('/__proxy-test').set('X-Forwarded-Proto', 'https');
  expect(response.body).toEqual({ protocol: 'http', secure: false });
});
