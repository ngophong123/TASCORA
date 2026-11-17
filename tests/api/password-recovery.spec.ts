import { beforeEach, describe, expect, it, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import bcrypt from 'bcryptjs';

type User = { id: string; email: string; role: string; status: string; password: string };
type Session = { id: string; userId: string; refreshToken: string | null; revoked: boolean; expiresAt: Date; lastActivity: Date };
type RefreshTokenRow = { id: string; userId: string; tokenHash: string; revoked: boolean; expiresAt: Date };
type ResetTokenRow = {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  used: boolean;
  usedAt: Date | null;
  requestedIp: string | null;
  consumedIp: string | null;
  userAgent: string | null;
};

const store = vi.hoisted(() => ({
  users: new Map<string, User>(),
  sessions: new Map<string, Session>(),
  refreshTokens: new Map<string, RefreshTokenRow>(),
  resetTokens: new Map<string, ResetTokenRow>(),
  disconnectSockets: vi.fn(),
  roomFn: vi.fn(),
}));

vi.mock('../../apps/api/src/modules/email/email.service', () => ({
  EmailService: {
    sendVerificationEmail: vi.fn(),
    sendPasswordResetEmail: vi.fn().mockResolvedValue({ messageId: 'msg-reset-1' }),
  },
}));

vi.mock('../../apps/api/src/lib/socket', () => ({
  getIO: () => ({
    in: (room: string) => {
      store.roomFn(room);
      return { disconnectSockets: store.disconnectSockets };
    },
  }),
}));

vi.mock('../../apps/api/src/lib/prisma', () => {
  const client = {
    user: {
      findUnique: async ({ where }: { where: { id?: string; email?: string } }) =>
        [...store.users.values()].find(u => u.id === where.id || u.email === where.email) || null,
      updateMany: async ({
        where,
        data,
      }: {
        where: { id: string; status?: string };
        data: Partial<User>;
      }) => {
        const user = store.users.get(where.id);
        if (!user || (where.status !== undefined && user.status !== where.status)) return { count: 0 };
        Object.assign(user, data);
        return { count: 1 };
      },
    },
    passwordResetToken: {
      findUnique: async ({ where }: { where: { token: string } }) => {
        const row = [...store.resetTokens.values()].find(r => r.token === where.token);
        if (!row) return null;
        const user = store.users.get(row.userId)!;
        return { ...row, user: { id: user.id, status: user.status } };
      },
      create: async ({ data }: { data: Omit<ResetTokenRow, 'id' | 'createdAt' | 'usedAt' | 'consumedIp'> }) => {
        const row: ResetTokenRow = {
          ...data,
          id: `prt_${store.resetTokens.size + 1}`,
          createdAt: new Date(),
          usedAt: null,
          consumedIp: null,
        };
        store.resetTokens.set(row.id, row);
        return row;
      },
      updateMany: async ({
        where,
        data,
      }: {
        where: { id?: string; userId?: string; used?: boolean; expiresAt?: { gt: Date } };
        data: Partial<ResetTokenRow>;
      }) => {
        let count = 0;
        for (const row of store.resetTokens.values()) {
          if (where.id !== undefined && row.id !== where.id) continue;
          if (where.userId !== undefined && row.userId !== where.userId) continue;
          if (where.used !== undefined && row.used !== where.used) continue;
          if (where.expiresAt?.gt && row.expiresAt <= where.expiresAt.gt) continue;
          Object.assign(row, data);
          count += 1;
        }
        return { count };
      },
    },
    userSession: {
      findUnique: async ({ where }: { where: { id: string } }) => store.sessions.get(where.id) || null,
      findMany: async ({ where }: { where: { userId: string; revoked?: boolean } }) =>
        [...store.sessions.values()].filter(
          s => s.userId === where.userId && (where.revoked === undefined || s.revoked === where.revoked)
        ),
      create: async ({ data }: { data: Omit<Session, 'revoked' | 'lastActivity'> }) => {
        const value: Session = { ...data, revoked: false, lastActivity: new Date() };
        store.sessions.set(value.id, value);
        return value;
      },
      updateMany: async ({
        where,
        data,
      }: {
        where: { id?: string; userId?: string; refreshToken?: string; revoked?: boolean };
        data: Partial<Session>;
      }) => {
        let count = 0;
        for (const value of store.sessions.values()) {
          if (where.id !== undefined && value.id !== where.id) continue;
          if (where.userId !== undefined && value.userId !== where.userId) continue;
          if (where.refreshToken !== undefined && value.refreshToken !== where.refreshToken) continue;
          if (where.revoked !== undefined && value.revoked !== where.revoked) continue;
          Object.assign(value, data);
          count += 1;
        }
        return { count };
      },
    },
    refreshToken: {
      findUnique: async ({ where }: { where: { tokenHash: string } }) =>
        [...store.refreshTokens.values()].find(t => t.tokenHash === where.tokenHash) || null,
      create: async ({ data }: { data: Omit<RefreshTokenRow, 'id' | 'revoked'> }) => {
        const value: RefreshTokenRow = { ...data, id: `rt_${store.refreshTokens.size + 1}`, revoked: false };
        store.refreshTokens.set(value.id, value);
        return value;
      },
      update: async ({ where, data }: { where: { id: string }; data: Partial<RefreshTokenRow> }) => {
        const value = store.refreshTokens.get(where.id)!;
        Object.assign(value, data);
        return value;
      },
      updateMany: async ({
        where,
        data,
      }: {
        where: { userId?: string; revoked?: boolean; tokenHash?: string | { in: string[] } };
        data: Partial<RefreshTokenRow>;
      }) => {
        let count = 0;
        for (const value of store.refreshTokens.values()) {
          if (where.userId !== undefined && value.userId !== where.userId) continue;
          if (where.revoked !== undefined && value.revoked !== where.revoked) continue;
          if (where.tokenHash !== undefined) {
            const match =
              typeof where.tokenHash === 'string'
                ? value.tokenHash === where.tokenHash
                : where.tokenHash.in.includes(value.tokenHash);
            if (!match) continue;
          }
          Object.assign(value, data);
          count += 1;
        }
        return { count };
      },
    },
  };
  return { prisma: { ...client, $transaction: async <T>(fn: (tx: typeof client) => Promise<T>) => fn(client) } };
});

import { createAuthRouter } from '../../apps/api/src/modules/auth/auth.route';
import { createPasswordResetRateLimiters } from '../../apps/api/src/modules/auth/auth.rate-limit';
import { GENERIC_FORGOT_PASSWORD_MESSAGE, PasswordResetService } from '../../apps/api/src/modules/auth/password-reset.service';
import { EmailService } from '../../apps/api/src/modules/email/email.service';
import { AuthService } from '../../apps/api/src/modules/auth/auth.service';
import { authenticateAccess, hashToken } from '../../apps/api/src/modules/auth/token';

function buildApp(limits?: Parameters<typeof createPasswordResetRateLimiters>[0]) {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/auth', createAuthRouter(createPasswordResetRateLimiters(limits)));
  app.use((error: { status?: number; message?: string }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(error.status || 500).json({ success: false, error: { message: error.message || 'Internal error' } });
  });
  return app;
}

describe('Password recovery workflow & security controls', () => {
  beforeEach(async () => {
    store.users.clear();
    store.sessions.clear();
    store.refreshTokens.clear();
    store.resetTokens.clear();
    store.disconnectSockets.mockClear();
    store.roomFn.mockClear();
    vi.clearAllMocks();

    store.users.set('usr-active', {
      id: 'usr-active',
      email: 'alice@tascora.dev',
      role: 'SELLER',
      status: 'ACTIVE',
      password: await bcrypt.hash('OldPassword123!', 4),
    });
    store.users.set('usr-pending', {
      id: 'usr-pending',
      email: 'pending@tascora.dev',
      role: 'BUYER',
      status: 'PENDING_VERIFICATION',
      password: await bcrypt.hash('OldPassword123!', 4),
    });
    store.users.set('usr-suspended', {
      id: 'usr-suspended',
      email: 'suspended@tascora.dev',
      role: 'BUYER',
      status: 'SUSPENDED',
      password: await bcrypt.hash('OldPassword123!', 4),
    });
  });

  it('returns identical generic responses without enumeration, hashes stored tokens, and never logs raw tokens', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const app = buildApp();

    const activeRes = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: '  ALICE@tascora.dev ' });
    const missingRes = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'missing@tascora.dev' });
    const pendingRes = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'pending@tascora.dev' });
    const suspendedRes = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'suspended@tascora.dev' });

    for (const res of [activeRes, missingRes, pendingRes, suspendedRes]) {
      expect(res.status).toBe(200);
      expect(res.headers['cache-control']).toBe('no-store');
      expect(res.body).toEqual({ success: true, message: GENERIC_FORGOT_PASSWORD_MESSAGE });
    }

    expect(EmailService.sendPasswordResetEmail).toHaveBeenCalledTimes(1);
    const [recipient, rawToken] = vi.mocked(EmailService.sendPasswordResetEmail).mock.calls[0]!;
    expect(recipient).toBe('alice@tascora.dev');
    expect(rawToken).toMatch(/^[0-9a-f]{64}$/);

    const saved = [...store.resetTokens.values()];
    expect(saved).toHaveLength(1);
    expect(saved[0]!.token).not.toBe(rawToken);
    expect(saved[0]!.token).toBe(hashToken(rawToken));
    expect(saved[0]!.expiresAt.getTime()).toBeGreaterThan(Date.now() + 25 * 60 * 1000);

    expect(JSON.stringify(logSpy.mock.calls)).not.toContain(rawToken);
    expect(JSON.stringify(errSpy.mock.calls)).not.toContain(rawToken);
    logSpy.mockRestore();
    errSpy.mockRestore();
  });

  it('invalidates prior unused reset tokens when issuing a new request', async () => {
    const app = buildApp();
    await request(app).post('/api/v1/auth/forgot-password').send({ email: 'alice@tascora.dev' });
    const firstToken = vi.mocked(EmailService.sendPasswordResetEmail).mock.calls[0]![1];

    await request(app).post('/api/v1/auth/forgot-password').send({ email: 'alice@tascora.dev' });
    const secondToken = vi.mocked(EmailService.sendPasswordResetEmail).mock.calls[1]![1];

    expect(firstToken).not.toBe(secondToken);
    const firstReset = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: firstToken, password: 'NewStrongPassword1!' });
    expect(firstReset.status).toBe(400);

    const secondReset = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: secondToken, password: 'NewStrongPassword1!' });
    expect(secondReset.status).toBe(200);
  });

  it('enforces IP and account-based rate limits uniformly without acting as an oracle', async () => {
    const app = buildApp({ forgotIpLimit: 100, forgotAccountLimit: 2 });

    for (let i = 0; i < 2; i++) {
      expect((await request(app).post('/api/v1/auth/forgot-password').send({ email: 'ghost@tascora.dev' })).status).toBe(200);
    }
    const rateLimitedGhost = await request(app).post('/api/v1/auth/forgot-password').send({ email: 'ghost@tascora.dev' });
    expect(rateLimitedGhost.status).toBe(429);

    const appIp = buildApp({ forgotIpLimit: 2, forgotAccountLimit: 100 });
    expect((await request(appIp).post('/api/v1/auth/forgot-password').send({ email: 'a@tascora.dev' })).status).toBe(200);
    expect((await request(appIp).post('/api/v1/auth/forgot-password').send({ email: 'b@tascora.dev' })).status).toBe(200);
    expect((await request(appIp).post('/api/v1/auth/forgot-password').send({ email: 'c@tascora.dev' })).status).toBe(429);
  });

  it('validates policy, resets with bcrypt cost-12, revokes active sessions, and blocks token reuse', async () => {
    const app = buildApp();
    const session = await AuthService.login({ email: 'alice@tascora.dev', password: 'OldPassword123!' }, '127.0.0.1', 'test');
    await expect(authenticateAccess(session.accessToken)).resolves.toMatchObject({ userId: 'usr-active' });

    await request(app).post('/api/v1/auth/forgot-password').send({ email: 'alice@tascora.dev' });
    const rawToken = vi.mocked(EmailService.sendPasswordResetEmail).mock.calls[0]![1];

    expect((await request(app).post('/api/v1/auth/reset-password').send({ token: rawToken, password: 'short' })).status).toBe(400);
    expect((await request(app).post('/api/v1/auth/reset-password').send({ token: rawToken, password: 'onlyletters' })).status).toBe(400);
    expect((await request(app).post('/api/v1/auth/reset-password').send({ token: rawToken, password: '1234567890' })).status).toBe(400);
    expect((await request(app).post('/api/v1/auth/reset-password').send({ token: 'bad', password: 'ValidPassword1!' })).status).toBe(400);
    expect((await request(app).post('/api/v1/auth/reset-password').send({ token: rawToken, password: 'ValidPassword1!', role: 'ADMIN' })).status).toBe(400);

    const reset = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: rawToken, password: 'BrandNewPassword1!' });
    expect(reset.status).toBe(200);
    expect(reset.headers['cache-control']).toBe('no-store');

    const updatedUser = store.users.get('usr-active')!;
    expect(updatedUser.password.startsWith('$2a$12$') || updatedUser.password.startsWith('$2b$12$')).toBe(true);
    expect(await bcrypt.compare('BrandNewPassword1!', updatedUser.password)).toBe(true);

    // Existing session & refresh token revoked and socket room disconnected.
    await expect(authenticateAccess(session.accessToken)).rejects.toThrow();
    await expect(AuthService.refresh(session.refreshToken)).rejects.toThrow();
    expect(store.disconnectSockets).toHaveBeenCalledWith(true);

    // Token replay is rejected.
    expect(
      (await request(app).post('/api/v1/auth/reset-password').send({ token: rawToken, password: 'AnotherPassword2!' })).status
    ).toBe(400);

    // Old password rejected, new password accepted.
    await expect(AuthService.login({ email: 'alice@tascora.dev', password: 'OldPassword123!' }, '127.0.0.1', 'test')).rejects.toThrow();
    await expect(AuthService.login({ email: 'alice@tascora.dev', password: 'BrandNewPassword1!' }, '127.0.0.1', 'test')).resolves.toHaveProperty('accessToken');
  }, 15000);

  it('rejects expired reset tokens without changing password or revoking sessions', async () => {
    const app = buildApp();
    const session = await AuthService.login({ email: 'alice@tascora.dev', password: 'OldPassword123!' }, '127.0.0.1', 'test');
    await request(app).post('/api/v1/auth/forgot-password').send({ email: 'alice@tascora.dev' });
    const rawToken = vi.mocked(EmailService.sendPasswordResetEmail).mock.calls[0]![1];

    [...store.resetTokens.values()][0]!.expiresAt = new Date(Date.now() - 1000);

    const res = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: rawToken, password: 'BrandNewPassword1!' });
    expect(res.status).toBe(400);
    await expect(authenticateAccess(session.accessToken)).resolves.toMatchObject({ userId: 'usr-active' });
    await expect(AuthService.login({ email: 'alice@tascora.dev', password: 'OldPassword123!' }, '127.0.0.1', 'test')).resolves.toHaveProperty('accessToken');
  });

  it('rate-limits repeated malformed /forgot-password requests BEFORE schema validation (IP limiter first)', async () => {
    const appIp = buildApp({ forgotIpLimit: 2, forgotAccountLimit: 100 });
    expect((await request(appIp).post('/api/v1/auth/forgot-password').send({ email: 'not-an-email' })).status).toBe(400);
    expect((await request(appIp).post('/api/v1/auth/forgot-password').send({ unexpected: true })).status).toBe(400);
    const blocked = await request(appIp).post('/api/v1/auth/forgot-password').send({ email: 'not-an-email' });
    expect(blocked.status).toBe(429);
  });

  it('enforces matching password complexity on POST /api/v1/auth/register', async () => {
    const app = buildApp();
    const weak = await request(app).post('/api/v1/auth/register').send({
      email: 'newuser@tascora.dev',
      password: 'onlyletterslongenough',
    });
    expect(weak.status).toBe(400);
  });

  it('guarantees single-use atomic consumption under concurrent reset attempts', async () => {
    const app = buildApp();
    await request(app).post('/api/v1/auth/forgot-password').send({ email: 'alice@tascora.dev' });
    const rawToken = vi.mocked(EmailService.sendPasswordResetEmail).mock.calls[0]![1];

    const results = await Promise.allSettled(
      Array.from({ length: 5 }, (_, idx) => PasswordResetService.resetPassword(rawToken, `ConcurrentPass${idx}!`))
    );
    const fulfilled = results.filter(r => r.status === 'fulfilled');
    const rejected = results.filter(r => r.status === 'rejected');
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(4);
  }, 15000);
});
