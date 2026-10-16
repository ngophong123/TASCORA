import http from 'node:http';
import express from 'express';
import cors from '../../apps/api/node_modules/cors';
import request from 'supertest';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { io as connect, type Socket } from '../../apps/web/node_modules/socket.io-client';
import { createOriginPolicy, corsOriginCallback } from '../../apps/api/src/lib/origin-policy';

const state = vi.hoisted(() => ({ policy: async (_origin: string | undefined): Promise<boolean> => false, login: vi.fn(), revoked: false, active: true }));
vi.mock('../../apps/api/src/lib/config', () => ({ isProduction: true, cookieSameSite: 'none', jwtAccessSecret: 'test-only-preview-integration-signing-key', isAllowedOrigin: (origin: string | undefined) => state.policy(origin) }));
vi.mock('../../apps/api/src/modules/auth/auth.service', () => ({ AuthService: { login: state.login } }));
vi.mock('../../apps/api/src/lib/prisma', () => ({ prisma: {
  user: { findUnique: async () => ({ id: 'fixture-user', role: 'BUYER', status: state.active ? 'ACTIVE' : 'PENDING_VERIFICATION' }) },
  userSession: { findUnique: async () => ({ id: 'fixture-session', userId: 'fixture-user', revoked: state.revoked, expiresAt: new Date(Date.now() + 60_000) }) },
} }));
import { initSocket } from '../../apps/api/src/lib/socket';
import { login, protectCookieAction } from '../../apps/api/src/modules/auth/auth.controller';
import { signAccessToken, authenticateAccess } from '../../apps/api/src/modules/auth/token';

const previewOrigin = 'https://fresh-deployment.vercel.app';
const exact = ['https://staging.example.com', 'https://production.example.com'];
const preview = { teamId: 'team_fixture', projectId: 'prj_fixture', repoId: '123', refs: ['staging'], token: 'test-only-token' };
let server: ReturnType<typeof initSocket>, address: string;
const clients: Socket[] = [];
let app: ReturnType<typeof express>;
beforeEach(async () => {
  state.revoked = false; state.active = true;
  state.login.mockReset().mockResolvedValue({ refreshToken: 'test-only-refresh', accessToken: 'test-only-access', expiresAt: new Date(Date.now() + 60_000), user: { id: 'fixture-user' } });
  state.policy = createOriginPolicy(exact, { preview, fetch: async () => Response.json({ url: new URL(previewOrigin).hostname,
    ownerId: preview.teamId, projectId: preview.projectId, target: null, readyState: 'READY',
    gitSource: { type: 'github', repoId: 123, ref: 'staging' } }) });
  app = express();
  app.use((_req, res, next) => { res.vary('Origin'); next(); });
  app.use(cors({ origin: corsOriginCallback(origin => state.policy(origin)), credentials: true }));
  app.use(express.json());
  app.get('/catalog', (_req, res) => res.json({ services: [], total: 0 }));
  app.post('/login', protectCookieAction, login);
  app.patch('/cookie-action', protectCookieAction, async (req, res, next) => {
    try {
      const actor = await authenticateAccess(req.headers.authorization?.split(' ')[1] || '');
      res.json({ userId: actor.userId, cookie: req.headers.cookie, body: req.body });
    } catch { next({ status: 401 }); }
  });
  app.use((error: { status?: number; statusCode?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => res.status(error.statusCode || error.status || 500).json({ success: false }));
  const listener = http.createServer(app);
  server = initSocket(listener);
  await new Promise<void>(resolve => listener.listen(0, '127.0.0.1', resolve));
  const bound = listener.address(); if (!bound || typeof bound === 'string') throw new Error('No loopback address');
  address = `http://127.0.0.1:${bound.port}`;
});
afterEach(async () => { for (const client of clients.splice(0)) client.disconnect(); await new Promise<void>(resolve => server.close(() => resolve())); });

it.each([...exact, previewOrigin])('permits exact credentialed GET and preflight without wildcard ACAO: %s', async origin => {
  const response = await request(app).get('/catalog').set('Origin', origin);
  expect(response.status).toBe(200);
  expect(response.headers['access-control-allow-origin']).toBe(origin);
  expect(response.headers['access-control-allow-credentials']).toBe('true');
  expect(response.headers.vary).toContain('Origin');
  for (const method of ['POST', 'PATCH']) {
    const preflight = await request(app).options('/cookie-action').set('Origin', origin).set('Access-Control-Request-Method', method)
      .set('Access-Control-Request-Headers', 'authorization,content-type,x-csrf-protection');
    expect(preflight.status).toBe(204);
    expect(preflight.headers['access-control-allow-origin']).toBe(origin);
    expect(preflight.headers['access-control-allow-methods']).toContain(method);
    for (const header of ['authorization', 'content-type', 'x-csrf-protection']) expect(preflight.headers['access-control-allow-headers']).toContain(header);
  }
});
it('preserves production cookie flags and CSRF for verified Preview POST/PATCH', async () => {
  const response = await request(app).post('/login').set('Origin', previewOrigin).set('X-CSRF-Protection', '1').send({});
  expect(response.status).toBe(200);
  expect(response.headers['cache-control']).toBe('no-store');
  for (const flag of ['Secure', 'HttpOnly', 'SameSite=None', 'Path=/api/v1/auth']) expect(response.headers['set-cookie'][0]).toContain(flag);
  const updated = await request(app).patch('/cookie-action').set('Origin', previewOrigin).set('X-CSRF-Protection', '1')
    .set('Authorization', `Bearer ${signAccessToken({ id: 'fixture-user', role: 'BUYER' }, 'fixture-session')}`).set('Cookie', 'refreshToken=test-only-refresh').send({ action: 'fixture' });
  expect(updated.status).toBe(200);
  expect(updated.body).toEqual({ userId: 'fixture-user', cookie: 'refreshToken=test-only-refresh', body: { action: 'fixture' } });
});
it('rejects arbitrary origins, fake project hostnames, missing Origin and missing CSRF header before login', async () => {
  for (const origin of ['https://attacker.invalid', 'https://tascora-staging-impostor.vercel.app', undefined]) {
    const action = request(app).post('/login').set('X-CSRF-Protection', '1');
    if (origin) action.set('Origin', origin);
    expect((await action.send({})).status).toBe(403);
    if (origin) {
      const preflight = await request(app).options('/login').set('Origin', origin).set('Access-Control-Request-Method', 'POST');
      expect(preflight.headers['access-control-allow-origin']).toBeUndefined();
      expect(preflight.headers.vary).toContain('Origin');
    }
  }
  expect((await request(app).post('/login').set('Origin', previewOrigin).send({})).status).toBe(403);
  expect(state.login).not.toHaveBeenCalled();
});
it('preserves no-Origin SSR/native HTTP reads without emitting wildcard CORS', async () => {
  const response = await request(app).get('/catalog');
  expect(response.status).toBe(200);
  expect(response.headers['access-control-allow-origin']).toBeUndefined();
});
it('fails closed for unavailable verification but retains exact-origin access', async () => {
  state.policy = createOriginPolicy(exact, { preview, fetch: async () => { throw new Error('fixture offline'); } });
  expect((await request(app).get('/catalog').set('Origin', previewOrigin)).headers['access-control-allow-origin']).toBeUndefined();
  expect((await request(app).post('/login').set('Origin', previewOrigin).set('X-CSRF-Protection', '1').send({})).status).toBe(403);
  expect((await request(app).get('/catalog').set('Origin', exact[0]!)).headers['access-control-allow-origin']).toBe(exact[0]);
});
function socket(origin: string, token = signAccessToken({ id: 'fixture-user', role: 'BUYER' }, 'fixture-session'), transport: 'websocket' | 'polling' = 'websocket') {
  const client = connect(address, { auth: { token }, transports: [transport], forceNew: true, reconnection: false, extraHeaders: { Origin: origin } });
  clients.push(client);
  return new Promise<void>((resolve, reject) => { client.once('connect', resolve); client.once('connect_error', reject); });
}
it.each(['websocket', 'polling'] as const)('checks verified origins and authentication on real Socket.IO %s handshakes', async transport => {
  await socket(previewOrigin, undefined, transport);
  await socket(exact[0]!, undefined, transport);
  await expect(socket('https://tascora-staging-impostor.vercel.app', undefined, transport)).rejects.toThrow();
  await expect(socket(previewOrigin, 'invalid-token', transport)).rejects.toThrow('Authentication error');
  expect(server.sockets.sockets.size).toBe(2);
});
it('does not replace JWT/session authorization with an allowed Preview origin', async () => {
  const action = (token?: string) => {
    const pending = request(app).patch('/cookie-action').set('Origin', previewOrigin).set('X-CSRF-Protection', '1');
    if (token) pending.set('Authorization', `Bearer ${token}`);
    return pending.send({ action: 'fixture' });
  };
  const token = signAccessToken({ id: 'fixture-user', role: 'BUYER' }, 'fixture-session');
  expect((await action()).status).toBe(401);
  expect((await action('tampered.token')).status).toBe(401);
  state.revoked = true;
  expect((await action(token)).status).toBe(401);
  await expect(socket(previewOrigin, token)).rejects.toThrow('Authentication error');
  state.revoked = false; state.active = false;
  expect((await action(token)).status).toBe(401);
  await expect(socket(previewOrigin, token)).rejects.toThrow('Authentication error');
  expect(server.sockets.sockets.size).toBe(0);
});
