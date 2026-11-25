import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { Prisma } from '@prisma/client';

const mocks = vi.hoisted(() => {
  const model = () => ({
    count: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    aggregate: vi.fn(),
  });
  return {
    sellerProfile: model(),
    service: model(),
    order: model(),
    refund: model(),
    marketplaceDispute: model(),
    financialEntry: model(),
  };
});

vi.mock('../../apps/api/src/lib/prisma', () => ({ prisma: mocks }));
vi.mock('../../apps/api/src/middlewares/requireAuth', () => ({
  requireAuth: (
    req: express.Request & { user?: { userId: string; role: string } },
    res: express.Response,
    next: express.NextFunction
  ) => {
    const actor = req.headers.authorization?.replace('Bearer ', '');
    if (!actor) return res.status(401).json({ success: false });
    req.user = { userId: actor, role: actor === 'admin' ? 'ADMIN' : actor === 'seller' ? 'SELLER' : 'BUYER' };
    next();
  },
}));

import analyticsRouter from '../../apps/api/src/modules/analytics/analytics.route';

const app = express();
app.use(express.json());
app.use('/api/v1/analytics', analyticsRouter);
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

describe('Phase 4E Analytics & KPI API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.sellerProfile.findUnique.mockResolvedValue({
      id: 'sp_1',
      userId: 'seller',
      ratingAverage: 4.8,
      status: 'APPROVED',
      level: 'LEVEL_1',
    });
    mocks.order.findMany.mockResolvedValue([
      { id: 'o1', status: 'COMPLETED', amount: new Prisma.Decimal('100.00'), createdAt: new Date('2026-10-01T00:00:00Z') },
      { id: 'o2', status: 'REFUNDED', amount: new Prisma.Decimal('50.00'), createdAt: new Date('2026-10-02T00:00:00Z') },
    ]);
    mocks.refund.findMany.mockResolvedValue([
      { orderId: 'o2', status: 'SUCCEEDED', amount: new Prisma.Decimal('50.00') },
    ]);
    mocks.marketplaceDispute.findMany.mockResolvedValue([]);
    mocks.financialEntry.aggregate.mockResolvedValue({
      _sum: {
        pendingDelta: new Prisma.Decimal('0.00'),
        availableDelta: new Prisma.Decimal('90.00'),
        reservedDelta: new Prisma.Decimal('0.00'),
        paidDelta: new Prisma.Decimal('0.00'),
        feeDelta: new Prisma.Decimal('10.00'),
      },
    });
    mocks.sellerProfile.count.mockResolvedValue(4);
    mocks.service.count.mockResolvedValue(12);
  });

  it('returns real ledger-backed seller dashboard KPIs with Demo Data label in non-production', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/seller/dashboard?from=2026-10-01T00:00:00Z&to=2026-10-31T23:59:59Z')
      .set('Authorization', 'Bearer seller');

    expect(res.status).toBe(200);
    expect(res.body.data.totalEarnings).toBe(90);
    expect(res.body.data.kpis.gmv).toBe('150.00');
    expect(res.body.data.kpis.netGmv).toBe('100.00');
    expect(res.body.data.kpis.platformRevenue).toBe('10.00');
    expect(res.body.data.kpis.sellerEarnings).toBe('90.00');
    expect(res.body.data.kpis.refundRate).toBe(0.5);
    expect(res.body.data.profileViews).toBeNull();
    expect(res.body.data.dataLabel).toBe('Demo Data');
  });

  it('rejects malformed or inverted date range query parameters with 400', async () => {
    const badDate = await request(app)
      .get('/api/v1/analytics/seller/dashboard?from=not-a-date')
      .set('Authorization', 'Bearer seller');
    expect(badDate.status).toBe(400);

    const inverted = await request(app)
      .get('/api/v1/analytics/seller/dashboard?from=2026-11-10T00:00:00Z&to=2026-10-01T00:00:00Z')
      .set('Authorization', 'Bearer seller');
    expect(inverted.status).toBe(400);
  });

  it('enforces ADMIN role on /api/v1/analytics/admin/kpis and returns platform KPIs to admins', async () => {
    expect((await request(app).get('/api/v1/analytics/admin/kpis')).status).toBe(401);
    expect(
      (await request(app).get('/api/v1/analytics/admin/kpis').set('Authorization', 'Bearer buyer')).status
    ).toBe(403);
    expect(
      (await request(app).get('/api/v1/analytics/admin/kpis').set('Authorization', 'Bearer seller')).status
    ).toBe(403);

    const adminRes = await request(app)
      .get('/api/v1/analytics/admin/kpis')
      .set('Authorization', 'Bearer admin');
    expect(adminRes.status).toBe(200);
    expect(adminRes.body.data.kpis.gmv).toBe('150.00');
    expect(adminRes.body.data.kpis.platformRevenue).toBe('10.00');
    expect(adminRes.body.data.kpis.sellerEarnings).toBe('90.00');
    expect(adminRes.body.data.marketplaceHealth).toEqual({
      approvedSellers: 4,
      publishedServices: 12,
    });
  });
});
