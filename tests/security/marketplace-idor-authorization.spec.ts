import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { Prisma } from '@prisma/client';

const mocks = vi.hoisted(() => {
  const model = () => ({
    count: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    upsert: vi.fn(),
    deleteMany: vi.fn(),
    aggregate: vi.fn(),
  });
  return {
    order: model(),
    orderDelivery: model(),
    service: model(),
    servicePackage: model(),
    sellerProfile: model(),
    escrow: model(),
    financialEntry: model(),
    notification: model(),
    adminAuditLog: model(),
    user: model(),
    uploadObject: model(),
    lock: vi.fn(),
  };
});

vi.mock('../../apps/api/src/lib/prisma', () => ({
  prisma: {
    ...mocks,
    $queryRaw: mocks.lock,
    $transaction: async (fn: (tx: typeof mocks & { $queryRaw: typeof mocks.lock }) => Promise<unknown>) =>
      fn({ ...mocks, $queryRaw: mocks.lock }),
  },
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

vi.mock('../../apps/api/src/lib/socket', () => ({
  getIO: () => ({ to: () => ({ emit: vi.fn() }) }),
}));

import ordersRouter from '../../apps/api/src/modules/order/order.route';
import adminRouter from '../../apps/api/src/modules/admin/admin.route';

const app = express();
app.use(express.json());
app.use('/api/v1/orders', ordersRouter);
app.use('/api/v1/admin', adminRouter);
app.use(
  (
    error: Error & { status?: number },
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
);

const ORDER_ID = 'c000000000000000000000201';
const SERVICE_ID = 'c000000000000000000000202';
const PACKAGE_ID = 'c000000000000000000000203';
const SELLER_PROFILE_ID = 'c000000000000000000000204';

function baseOrder(status = 'DELIVERED') {
  return {
    id: ORDER_ID,
    buyerId: 'buyer1',
    sellerId: SELLER_PROFILE_ID,
    serviceId: SERVICE_ID,
    packageId: PACKAGE_ID,
    status,
    amount: new Prisma.Decimal('150.00'),
    currency: 'usd',
    platformFeeBps: 1000,
    purchaseSnapshot: { deliveryDays: 3, revisions: 1 },
    seller: { id: SELLER_PROFILE_ID, userId: 'seller1', status: 'APPROVED' },
    escrow: { id: 'escrow-201', orderId: ORDER_ID, amount: new Prisma.Decimal('150.00'), released: false },
    refunds: [],
    dispute: null,
    deliveries: [],
    revisions: [],
  };
}

describe('Phase 4B Marketplace IDOR & Role Authorization Guards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.lock.mockResolvedValue([{ '?column?': 1 }]);
  });

  it('prevents a seller from purchasing their own service', async () => {
    mocks.servicePackage.findUnique.mockResolvedValueOnce({
      id: PACKAGE_ID,
      serviceId: SERVICE_ID,
      price: new Prisma.Decimal('150.00'),
      deliveryDays: 3,
      revisions: 1,
      service: {
        id: SERVICE_ID,
        title: 'Own Gig',
        sellerProfileId: SELLER_PROFILE_ID,
        status: 'PUBLISHED',
        seller: { id: SELLER_PROFILE_ID, userId: 'seller1', status: 'APPROVED', user: { status: 'ACTIVE' } },
      },
    });

    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', 'Bearer seller1')
      .send({ serviceId: SERVICE_ID, packageId: PACKAGE_ID, idempotencyKey: 'self_purchase_key_1' });
    expect(res.status).toBe(403);
  });

  it('blocks cross-buyer IDOR on accept, revision, and cancel operations', async () => {
    mocks.order.findUnique.mockResolvedValue(baseOrder('DELIVERED'));

    const acceptOther = await request(app)
      .post(`/api/v1/orders/${ORDER_ID}/operations/accept`)
      .set('Authorization', 'Bearer buyer2')
      .send({});
    expect([403, 404]).toContain(acceptOther.status);

    const revisionOther = await request(app)
      .post(`/api/v1/orders/${ORDER_ID}/operations/revision`)
      .set('Authorization', 'Bearer buyer2')
      .send({ message: 'Unauthorized revision attempt' });
    expect([403, 404]).toContain(revisionOther.status);

    mocks.order.findUnique.mockResolvedValue(baseOrder('PENDING'));
    const cancelOther = await request(app)
      .post(`/api/v1/orders/${ORDER_ID}/operations/cancel`)
      .set('Authorization', 'Bearer buyer2')
      .send({});
    expect([403, 404]).toContain(cancelOther.status);
  });

  it('blocks cross-seller IDOR and role confusion across start, deliver, and accept', async () => {
    mocks.order.findUnique.mockResolvedValue(baseOrder('PAID'));

    // Another seller cannot start seller1's order
    const otherSellerStart = await request(app)
      .post(`/api/v1/orders/${ORDER_ID}/operations/start`)
      .set('Authorization', 'Bearer seller2')
      .send({});
    expect([403, 404]).toContain(otherSellerStart.status);

    // Buyer cannot start order
    const buyerStart = await request(app)
      .post(`/api/v1/orders/${ORDER_ID}/operations/start`)
      .set('Authorization', 'Bearer buyer1')
      .send({});
    expect([403, 404]).toContain(buyerStart.status);

    // Another seller cannot submit delivery
    mocks.order.findUnique.mockResolvedValue(baseOrder('IN_PROGRESS'));
    const otherSellerDeliver = await request(app)
      .post(`/api/v1/orders/${ORDER_ID}/delivery`)
      .set('Authorization', 'Bearer seller2')
      .send({ message: 'Spoofed delivery', files: [], idempotencyKey: 'idor_delivery_key_1' });
    expect(otherSellerDeliver.status).toBe(404);

    // Seller cannot self-accept their own delivered order
    mocks.order.findUnique.mockResolvedValue(baseOrder('DELIVERED'));
    const sellerAccept = await request(app)
      .post(`/api/v1/orders/${ORDER_ID}/operations/accept`)
      .set('Authorization', 'Bearer seller1')
      .send({});
    expect([403, 404]).toContain(sellerAccept.status);
  });

  it('rejects cross-owner upload references in order delivery attachments', async () => {
    mocks.order.findUnique.mockResolvedValueOnce(baseOrder('IN_PROGRESS'));
    mocks.uploadObject.findFirst.mockResolvedValueOnce({
      reference: 'upload:buyer1/11111111-1111-1111-1111-111111111111.pdf',
      ownerId: 'buyer1',
      purpose: 'DELIVERY',
      lifecycleStatus: 'ACTIVE',
      scanStatus: 'CLEAN',
    });

    const res = await request(app)
      .post(`/api/v1/orders/${ORDER_ID}/delivery`)
      .set('Authorization', 'Bearer seller1')
      .send({
        message: 'Attempting cross-user file attach',
        files: ['http://localhost:4000/api/v1/uploads/buyer1/11111111-1111-1111-1111-111111111111.pdf'],
        idempotencyKey: 'cross_upload_key_1',
      });
    expect([400, 403]).toContain(res.status);
  });

  it('blocks non-admin BUYER and SELLER accounts from admin moderation routes', async () => {
    for (const actor of ['buyer1', 'seller1']) {
      expect(
        (await request(app).get('/api/v1/admin/review-queue').set('Authorization', `Bearer ${actor}`)).status
      ).toBe(403);
      expect(
        (
          await request(app)
            .put(`/api/v1/admin/services/${SERVICE_ID}/approve`)
            .set('Authorization', `Bearer ${actor}`)
        ).status
      ).toBe(403);
      expect(
        (
          await request(app)
            .put(`/api/v1/admin/sellers/${SELLER_PROFILE_ID}/review`)
            .set('Authorization', `Bearer ${actor}`)
            .send({ status: 'APPROVED' })
        ).status
      ).toBe(403);
    }
  });
});
