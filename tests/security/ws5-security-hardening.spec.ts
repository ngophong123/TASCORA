import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import express from 'express';

const mocks = vi.hoisted(() => {
  const model = () => ({
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  });
  return {
    notification: model(),
    sellerProfile: model(),
    coupon: model(),
    service: model(),
    userSession: model(),
  };
});

vi.mock('../../apps/api/src/lib/prisma', () => ({ prisma: mocks }));
vi.mock('../../apps/api/src/lib/socket', () => ({
  getIO: () => ({
    to: () => ({ emit: vi.fn() }),
    in: () => ({ disconnectSockets: vi.fn() }),
  }),
}));
vi.mock('../../apps/api/src/middlewares/requireAuth', () => ({
  requireAuth: (
    req: express.Request & { user?: { userId: string; role: string } },
    res: express.Response,
    next: express.NextFunction
  ) => {
    const actor = req.headers.authorization?.replace('Bearer ', '');
    if (!actor) return res.status(401).json({ success: false });
    req.user = {
      userId: actor,
      role: actor === 'admin' ? 'ADMIN' : actor.startsWith('seller') ? 'SELLER' : 'BUYER',
    };
    next();
  },
}));

import notificationRouter from '../../apps/api/src/modules/notification/notification.route';
import couponRouter from '../../apps/api/src/modules/coupon/coupon.route';
import sessionRouter from '../../apps/api/src/modules/session/session.route';

const app = express();
app.use(express.json());
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/coupons', couponRouter);
app.use('/api/v1/sessions', sessionRouter);
app.use(
  (
    err: Error & { status?: number },
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    res.status(err.status || 500).json({ success: false, error: err.message });
  }
);

describe('Workstream 5 Security & Authorization Hardening Regressions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('blocks non-admin BUYER and SELLER users from POST /api/v1/notifications/test', async () => {
    expect(
      (await request(app).post('/api/v1/notifications/test').set('Authorization', 'Bearer buyer')).status
    ).toBe(403);
    expect(
      (await request(app).post('/api/v1/notifications/test').set('Authorization', 'Bearer seller')).status
    ).toBe(403);

    mocks.notification.create.mockResolvedValueOnce({ id: 'n_1', title: 'Test Notification' });
    const adminRes = await request(app)
      .post('/api/v1/notifications/test')
      .set('Authorization', 'Bearer admin');
    expect(adminRes.status).toBe(201);
  });

  it('validates coupon discount bounds, code format, maxUses, future expiry, and approved seller status', async () => {
    // Out-of-range discounts and invalid codes rejected by Zod with 400
    expect(
      (
        await request(app)
          .post('/api/v1/coupons')
          .set('Authorization', 'Bearer seller')
          .send({ code: 'BAD100', discountPercent: 120, maxUses: 10 })
      ).status
    ).toBe(400);
    expect(
      (
        await request(app)
          .post('/api/v1/coupons')
          .set('Authorization', 'Bearer seller')
          .send({ code: 'NEG', discountPercent: -5, maxUses: 10 })
      ).status
    ).toBe(400);
    expect(
      (
        await request(app)
          .post('/api/v1/coupons')
          .set('Authorization', 'Bearer seller')
          .send({ code: 'X', discountPercent: 10, maxUses: 0 })
      ).status
    ).toBe(400);

    // Unapproved seller blocked with 403
    mocks.sellerProfile.findUnique.mockResolvedValueOnce({ id: 'sp_draft', status: 'PENDING_REVIEW' });
    expect(
      (
        await request(app)
          .post('/api/v1/coupons')
          .set('Authorization', 'Bearer seller')
          .send({ code: 'SAVE20', discountPercent: 20, maxUses: 25 })
      ).status
    ).toBe(403);

    // Past expiresAt rejected with 400
    mocks.sellerProfile.findUnique.mockResolvedValueOnce({ id: 'sp_ok', status: 'APPROVED' });
    expect(
      (
        await request(app)
          .post('/api/v1/coupons')
          .set('Authorization', 'Bearer seller')
          .send({
            code: 'OLD20',
            discountPercent: 20,
            maxUses: 25,
            expiresAt: '2020-01-01T00:00:00.000Z',
          })
      ).status
    ).toBe(400);

    // Valid approved seller coupon succeeds with 201
    mocks.sellerProfile.findUnique.mockResolvedValueOnce({ id: 'sp_ok', status: 'APPROVED' });
    mocks.coupon.create.mockResolvedValueOnce({ id: 'cp_1', code: 'LAUNCH15', discountPercent: 15 });
    const ok = await request(app)
      .post('/api/v1/coupons')
      .set('Authorization', 'Bearer seller')
      .send({ code: 'launch15', discountPercent: 15, maxUses: 50 });
    expect(ok.status).toBe(201);
    expect(mocks.coupon.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ code: 'LAUNCH15', discountPercent: 15, maxUses: 50 }),
      })
    );
  });

  it('returns clean 404 (never 500) on cross-user session revocation IDOR attempts', async () => {
    mocks.userSession.findUnique.mockResolvedValueOnce({
      id: 'sess_victim',
      userId: 'victim_user',
      revoked: false,
    });

    const res = await request(app)
      .delete('/api/v1/sessions/sess_victim')
      .set('Authorization', 'Bearer attacker');
    expect(res.status).toBe(404);
    expect(mocks.userSession.update).not.toHaveBeenCalled();
  });
});
