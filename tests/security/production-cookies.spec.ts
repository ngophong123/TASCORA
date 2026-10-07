import { expect, it, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
vi.mock('../../apps/api/src/lib/config', () => ({ isProduction: true, cookieSameSite: 'none', allowedOrigins: ['https://web.example.com'] }));
vi.mock('../../apps/api/src/modules/auth/auth.service', () => ({ AuthService: {
  login: async () => ({ refreshToken: 'test-only-cookie', expiresAt: new Date(Date.now() + 10000), accessToken: 'test-only-access', user: { id: 'user' } }),
  logout: async () => null,
} }));
vi.mock('../../apps/api/src/lib/socket', () => ({ getIO: vi.fn() }));
import { login, logout, protectCookieAction } from '../../apps/api/src/modules/auth/auth.controller';
it('sets and clears a Secure HttpOnly SameSite=None auth-path cookie in production', async () => {
  const app = express(); app.use(express.json()); app.post('/login', protectCookieAction, login); app.post('/logout', protectCookieAction, logout);
  const response = await request(app).post('/login').set('Origin', 'https://web.example.com').set('X-CSRF-Protection', '1').send({});
  expect(response.status).toBe(200);
  for (const flag of ['Secure', 'HttpOnly', 'SameSite=None', 'Path=/api/v1/auth']) expect(response.headers['set-cookie'][0]).toContain(flag);
  const cleared = await request(app).post('/logout').set('Origin', 'https://web.example.com').set('X-CSRF-Protection', '1');
  for (const flag of ['Secure', 'HttpOnly', 'SameSite=None', 'Path=/api/v1/auth', 'Expires=Thu, 01 Jan 1970']) expect(cleared.headers['set-cookie'][0]).toContain(flag);
});
