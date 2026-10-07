import { beforeEach, describe, expect, it, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

type User = { id: string; email: string; role: string; status: string; password: string };
type Session = { id: string; userId: string; refreshToken: string; revoked: boolean; expiresAt: Date; lastActivity: Date };
type Verification = { id: string; userId: string; email: string; token: string; expiresAt: Date };
type Token = { id: string; userId: string; tokenHash: string; revoked: boolean; expiresAt: Date };
const store = vi.hoisted(() => ({ users: new Map<string, User>(), sessions: new Map<string, Session>(), tokens: new Map<string, Token>(), verifications: new Map<string, Verification>() }));
vi.mock('../../apps/api/src/modules/email/email.service', () => ({ EmailService: { sendVerificationEmail: vi.fn() } }));
vi.mock('../../apps/api/src/lib/socket', () => ({ getIO: () => ({ in: () => ({ disconnectSockets: vi.fn() }) }) }));
vi.mock('../../apps/api/src/lib/prisma', () => {
  const client = {
    user: {
      findUnique: async ({ where }: { where: { id?: string; email?: string } }) => [...store.users.values()].find(u => u.id === where.id || u.email === where.email) || null,
      create: async ({ data }: { data: { email: string; password: string; role?: string; status?: string } }) => { const row = { id: 'registered', ...data, role: data.role || 'BUYER', status: data.status || 'PENDING_VERIFICATION' }; store.users.set(row.id, row); return row; },
      updateMany: async ({ where, data }: { where: { id: string; status: string; email: string }; data: { status: string } }) => { const row = store.users.get(where.id); if (!row || row.status !== where.status || row.email !== where.email) return { count: 0 }; row.status = data.status; return { count: 1 }; },
    },
    emailVerification: {
      create: async ({ data }: { data: Omit<Verification, 'id'> }) => { const row = { ...data, id: String(store.verifications.size + 1) }; store.verifications.set(row.id, row); return row; },
      findUnique: async ({ where }: { where: { token: string } }) => [...store.verifications.values()].find(v => v.token === where.token) || null,
      updateMany: async ({ where, data }: { where: { id: string; expiresAt: { gt: Date } }; data: { expiresAt: Date } }) => { const row = store.verifications.get(where.id); if (!row || row.expiresAt <= where.expiresAt.gt) return { count: 0 }; row.expiresAt = data.expiresAt; return { count: 1 }; },
    },
    userSession: {
      findUnique: async ({ where }: { where: { id: string } }) => store.sessions.get(where.id) || null,
      create: async ({ data }: { data: Omit<Session, 'revoked' | 'lastActivity'> }) => { const value = { ...data, revoked: false, lastActivity: new Date() }; store.sessions.set(value.id, value); return value; },
      updateMany: async ({ where, data }: { where: { id: string; refreshToken?: string; revoked?: boolean }; data: Partial<Session> }) => {
        const value = store.sessions.get(where.id);
        if (!value || (where.refreshToken !== undefined && value.refreshToken !== where.refreshToken) || (where.revoked !== undefined && value.revoked !== where.revoked)) return { count: 0 };
        Object.assign(value, data); return { count: 1 };
      },
    },
    refreshToken: {
      findUnique: async ({ where }: { where: { tokenHash: string } }) => [...store.tokens.values()].find(t => t.tokenHash === where.tokenHash) || null,
      create: async ({ data }: { data: Omit<Token, 'id' | 'revoked'> }) => { const value = { ...data, id: String(store.tokens.size + 1), revoked: false }; store.tokens.set(value.id, value); return value; },
      update: async ({ where, data }: { where: { id: string }; data: Partial<Token> }) => { const value = store.tokens.get(where.id)!; Object.assign(value, data); return value; },
      updateMany: async ({ where, data }: { where: { tokenHash: string | { in: string[] } }; data: Partial<Token> }) => {
        let count = 0;
        for (const value of store.tokens.values()) if (typeof where.tokenHash === 'string' ? value.tokenHash === where.tokenHash : where.tokenHash.in.includes(value.tokenHash)) { Object.assign(value, data); count++; }
        return { count };
      },
    },
  };
  return { prisma: { ...client, $transaction: async (callback: (tx: typeof client) => Promise<unknown>) => callback(client) } };
});
import authRoutes from '../../apps/api/src/modules/auth/auth.route';
import { EmailService } from '../../apps/api/src/modules/email/email.service';
import { AuthService } from '../../apps/api/src/modules/auth/auth.service';
import { authenticateAccess, hashToken } from '../../apps/api/src/modules/auth/token';
import { jwtAccessSecret } from '../../apps/api/src/lib/config';

const app = express();
app.use(express.json());
app.use('/api/v1/auth', authRoutes);
app.use((error: { status?: number; message: string }, _req: express.Request, res: express.Response, _next: express.NextFunction) => { res.status(error.status || 500).json({ error: error.message }); });
const action = (path: string) => request(app).post(`/api/v1/auth/${path}`).set('Origin', 'http://localhost:3200').set('X-CSRF-Protection', '1');
const cookie = (response: request.Response) => (response.headers['set-cookie'] as unknown as string[])[0]!.split(';')[0]!;

beforeEach(async () => {
  store.users.clear(); store.sessions.clear(); store.tokens.clear(); store.verifications.clear(); vi.clearAllMocks();
  store.users.set('user', { id: 'user', email: 'user@example.com', role: 'BUYER', status: 'ACTIVE', password: await bcrypt.hash('test-only-password', 4) });
});

describe('Real auth service with isolated in-memory persistence (no database)', () => {
  it('logs in, rotates refresh, logs out, and rejects refresh and access after logout', async () => {
    const login = await action('login').send({ email: 'user@example.com', password: 'test-only-password' });
    expect(login.status).toBe(200);
    expect(login.body.data.refreshToken).toBeUndefined();
    expect(login.body.data.user.password).toBeUndefined();
    expect(login.headers['set-cookie'][0]).toContain('HttpOnly');
    expect(login.headers['set-cookie'][0]).toContain('Path=/api/v1/auth');
    const refreshed = await action('refresh').set('Cookie', cookie(login));
    expect(refreshed.status).toBe(200);
    expect(cookie(refreshed)).not.toBe(cookie(login));
    const logout = await action('logout').set('Cookie', cookie(refreshed));
    expect(logout.status).toBe(200);
    expect(logout.headers['set-cookie'][0]).toContain('refreshToken=;');
    expect(logout.headers['set-cookie'][0]).toContain('Expires=Thu, 01 Jan 1970');
    expect(logout.headers['set-cookie'][0]).toContain('Path=/api/v1/auth');
    expect((await action('refresh').set('Cookie', cookie(refreshed))).status).toBe(401);
    await expect(authenticateAccess(refreshed.body.data.accessToken)).rejects.toThrow();
  });

  it('rejects reuse of a consumed token and revokes its rotated family', async () => {
    const login = await AuthService.login({ email: 'user@example.com', password: 'test-only-password' }, '', 'test');
    const refreshed = await AuthService.refresh(login.refreshToken);
    await expect(AuthService.refresh(login.refreshToken)).rejects.toThrow('reused');
    await expect(AuthService.refresh(refreshed.refreshToken)).rejects.toThrow();
    await expect(authenticateAccess(refreshed.accessToken)).rejects.toThrow();
  });

  it('rejects expired access tokens while allowing refresh with an unexpired session', async () => {
    const login = await AuthService.login({ email: 'user@example.com', password: 'test-only-password' }, '', 'test');
    const claims = jwt.decode(login.accessToken) as { userId: string; sessionId: string };
    const expired = jwt.sign({ userId: claims.userId, sessionId: claims.sessionId }, jwtAccessSecret, { expiresIn: -1 });
    await expect(authenticateAccess(expired)).rejects.toThrow();
    await expect(AuthService.refresh(login.refreshToken)).resolves.toHaveProperty('accessToken');
  });

  it('rejects invalid and expired refresh tokens without creating sessions', async () => {
    expect((await action('refresh').set('Cookie', 'refreshToken=invalid')).status).toBe(401);
    const login = await AuthService.login({ email: 'user@example.com', password: 'test-only-password' }, '', 'test');
    const record = [...store.tokens.values()].find(t => t.tokenHash === hashToken(login.refreshToken))!;
    record.expiresAt = new Date(0);
    await expect(AuthService.refresh(login.refreshToken)).rejects.toThrow();
  });

  it('preserves another device session when one logs out', async () => {
    const first = await AuthService.login({ email: 'user@example.com', password: 'test-only-password' }, '', 'one');
    const second = await AuthService.login({ email: 'user@example.com', password: 'test-only-password' }, '', 'two');
    await AuthService.logout(first.refreshToken);
    await expect(authenticateAccess(first.accessToken)).rejects.toThrow();
    await expect(AuthService.refresh(second.refreshToken)).resolves.toHaveProperty('accessToken');
  });

  it('rejects untrusted cookie actions, including malicious origins', async () => {
    expect((await request(app).post('/api/v1/auth/logout')).status).toBe(403);
    expect((await action('refresh').set('Origin', 'https://attacker.example')).status).toBe(403);
  });

  it('does not issue tokens to pending-verification or suspended users', async () => {
    store.users.get('user')!.status = 'PENDING_VERIFICATION';
    await expect(AuthService.login({ email: 'user@example.com', password: 'test-only-password' }, '', 'test')).rejects.toThrow();
  });
});

it('requires one-time email verification after registration before login', async () => {
  const registered = await AuthService.register({ email: 'new@example.com', password: 'test-only-password', role: 'seller' });
  expect(registered.status).toBe('PENDING_VERIFICATION');
  await expect(AuthService.login({ email: 'new@example.com', password: 'test-only-password' }, '', 'test')).rejects.toThrow();
  const raw = vi.mocked(EmailService.sendVerificationEmail).mock.calls[0]![1];
  expect([...store.verifications.values()][0]!.token).not.toBe(raw);
  await AuthService.verifyEmail(raw);
  await expect(AuthService.verifyEmail(raw)).rejects.toThrow('expired');
  await expect(AuthService.login({ email: 'new@example.com', password: 'test-only-password' }, '', 'test')).resolves.toHaveProperty('accessToken');
})

it('rejects expired verification links', async () => {
  await AuthService.register({ email: 'new@example.com', password: 'test-only-password' });
  const raw = vi.mocked(EmailService.sendVerificationEmail).mock.calls[0]![1];
  [...store.verifications.values()][0]!.expiresAt = new Date(0);
  await expect(AuthService.verifyEmail(raw)).rejects.toThrow();
  expect(store.users.get('registered')!.status).toBe('PENDING_VERIFICATION');
})

it('rejects concurrent refresh reuse and leaves the affected session revoked', async () => {
  const login = await AuthService.login({ email: 'user@example.com', password: 'test-only-password' }, '', 'test');
  const attempts = await Promise.allSettled([AuthService.refresh(login.refreshToken), AuthService.refresh(login.refreshToken)]);
  expect(attempts.filter(value => value.status === 'fulfilled').length).toBeLessThanOrEqual(1);
  expect([...store.sessions.values()][0]!.revoked).toBe(true);
})
