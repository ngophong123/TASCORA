import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { Prisma } from '@prisma/client';

const mocks = vi.hoisted(() => {
  const model = () => ({
    count: vi.fn(),
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
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
    orderRevision: model(),
    service: model(),
    servicePackage: model(),
    sellerProfile: model(),
    escrow: model(),
    financialEntry: model(),
    notification: model(),
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
    if (!actor || !['buyer', 'seller', 'admin', 'buyer2', 'seller2'].includes(actor)) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
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

const app = express();
app.use(express.json());
app.use('/api/v1/orders', ordersRouter);
app.use(
  (
    error: Error & { status?: number; code?: string },
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    res.status(error.status || 500).json({
      success: false,
      error: { code: error.code || 'ERROR', message: error.message },
    });
  }
);

const ORDER_ID = 'c000000000000000000000101';
const SERVICE_ID = 'c000000000000000000000102';
const PACKAGE_ID = 'c000000000000000000000103';
const SELLER_PROFILE_ID = 'c000000000000000000000104';

function makeOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: ORDER_ID,
    buyerId: 'buyer',
    sellerId: SELLER_PROFILE_ID,
    serviceId: SERVICE_ID,
    packageId: PACKAGE_ID,
    status: 'PAID',
    amount: new Prisma.Decimal('100.00'),
    currency: 'usd',
    platformFeeBps: 1000,
    purchaseSnapshot: {
      serviceId: SERVICE_ID,
      packageId: PACKAGE_ID,
      deliveryDays: 3,
      revisions: 2,
    },
    seller: { id: SELLER_PROFILE_ID, userId: 'seller', status: 'APPROVED' },
    escrow: { id: 'escrow-1', orderId: ORDER_ID, amount: new Prisma.Decimal('100.00'), released: false },
    refunds: [],
    dispute: null,
    deliveries: [],
    revisions: [],
    lastDeliveredAt: null,
    ...overrides,
  };
}

describe('Phase 4B Marketplace End-to-End API Journeys', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.lock.mockResolvedValue([{ '?column?': 1 }]);
    mocks.financialEntry.create.mockResolvedValue({ id: 'fe-1' });
    mocks.financialEntry.findMany.mockResolvedValue([]);
    mocks.notification.create.mockResolvedValue({ id: 'notif-1' });
    mocks.servicePackage.findUnique.mockResolvedValue({
      id: PACKAGE_ID,
      serviceId: SERVICE_ID,
      type: 'BASIC',
      title: 'Basic Tier',
      price: new Prisma.Decimal('100.00'),
      deliveryDays: 3,
      revisions: 2,
      service: {
        id: SERVICE_ID,
        title: 'Fullstack Web Build',
        sellerProfileId: SELLER_PROFILE_ID,
        status: 'PUBLISHED',
        seller: {
          id: SELLER_PROFILE_ID,
          userId: 'seller',
          status: 'APPROVED',
          firstName: 'Ada',
          lastName: 'Lovelace',
          user: { status: 'ACTIVE' },
        },
      },
    });
  });

  it('rejects unauthenticated requests to order routes', async () => {
    const res = await request(app).get('/api/v1/orders/my-purchases');
    expect(res.status).toBe(401);
  });

  it('enforces idempotent order creation and rejects conflicting checkoutKey reuse', async () => {
    const createdOrder = { id: ORDER_ID, serviceId: SERVICE_ID, packageId: PACKAGE_ID, status: 'PENDING', amount: new Prisma.Decimal('100.00') };
    mocks.order.findUnique.mockResolvedValueOnce(null);
    mocks.order.create.mockResolvedValueOnce(createdOrder);

    const first = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', 'Bearer buyer')
      .send({ serviceId: SERVICE_ID, packageId: PACKAGE_ID, idempotencyKey: 'checkout_key_alpha_1' });
    expect(first.status).toBe(201);
    expect(first.body.data.status).toBe('PENDING');

    // Replay with identical payload returns existing order without creating a duplicate
    mocks.order.findUnique.mockResolvedValueOnce(createdOrder);
    const replay = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', 'Bearer buyer')
      .send({ serviceId: SERVICE_ID, packageId: PACKAGE_ID, idempotencyKey: 'checkout_key_alpha_1' });
    expect(replay.status).toBe(201);
    expect(mocks.order.create).toHaveBeenCalledTimes(1);

    // Replay with different packageId returns 409 Conflict
    mocks.order.findUnique.mockResolvedValueOnce(createdOrder);
    const conflict = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', 'Bearer buyer')
      .send({
        serviceId: SERVICE_ID,
        packageId: 'c000000000000000000000999',
        idempotencyKey: 'checkout_key_alpha_1',
      });
    expect(conflict.status).toBe(409);
  });

  it('rejects orders for unpublished services or inactive sellers', async () => {
    mocks.servicePackage.findUnique.mockResolvedValueOnce({
      id: PACKAGE_ID,
      serviceId: SERVICE_ID,
      price: new Prisma.Decimal('100.00'),
      deliveryDays: 3,
      revisions: 1,
      service: {
        id: SERVICE_ID,
        title: 'Draft Service',
        sellerProfileId: SELLER_PROFILE_ID,
        status: 'DRAFT',
        seller: { id: SELLER_PROFILE_ID, userId: 'seller', status: 'APPROVED', user: { status: 'ACTIVE' } },
      },
    });
    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', 'Bearer buyer')
      .send({ serviceId: SERVICE_ID, packageId: PACKAGE_ID, idempotencyKey: 'checkout_unpub_key_1' });
    expect(res.status).toBe(409);
  });

  it('runs the full order lifecycle PAID -> IN_PROGRESS -> DELIVERED -> IN_REVISION -> DELIVERED -> COMPLETED', async () => {
    // 1. Seller starts funded order
    mocks.order.findUnique.mockResolvedValueOnce(makeOrder({ status: 'PAID' }));
    mocks.order.update.mockResolvedValueOnce(makeOrder({ status: 'IN_PROGRESS' }));
    const started = await request(app)
      .post(`/api/v1/orders/${ORDER_ID}/operations/start`)
      .set('Authorization', 'Bearer seller')
      .send({});
    expect(started.status).toBe(200);
    expect(started.body.data.status).toBe('IN_PROGRESS');

    // 2. Seller submits first delivery with idempotencyKey
    mocks.order.findUnique.mockResolvedValueOnce(makeOrder({ status: 'IN_PROGRESS' }));
    mocks.orderDelivery.findUnique.mockResolvedValueOnce(null);
    mocks.orderDelivery.create.mockResolvedValueOnce({
      id: 'del-1',
      orderId: ORDER_ID,
      message: 'Initial milestone delivery ready for review.',
      files: [],
      requestKey: 'delivery_key_0001',
      createdAt: new Date(),
    });
    mocks.order.update.mockResolvedValueOnce(makeOrder({ status: 'DELIVERED' }));
    const delivered = await request(app)
      .post(`/api/v1/orders/${ORDER_ID}/delivery`)
      .set('Authorization', 'Bearer seller')
      .send({
        message: 'Initial milestone delivery ready for review.',
        files: [],
        idempotencyKey: 'delivery_key_0001',
      });
    expect(delivered.status).toBe(200);
    expect(delivered.body.data.status).toBe('DELIVERED');

    // 3. Buyer requests revision
    mocks.order.findUnique.mockResolvedValueOnce(
      makeOrder({ status: 'DELIVERED', deliveries: [{ id: 'del-1' }] })
    );
    mocks.orderRevision.create.mockResolvedValueOnce({ id: 'rev-1' });
    mocks.order.update.mockResolvedValueOnce(makeOrder({ status: 'IN_REVISION' }));
    const revision = await request(app)
      .post(`/api/v1/orders/${ORDER_ID}/operations/revision`)
      .set('Authorization', 'Bearer buyer')
      .send({ message: 'Please refine the responsive mobile spacing.' });
    expect(revision.status).toBe(200);
    expect(revision.body.data.status).toBe('IN_REVISION');

    // 4. Seller re-delivers after revision
    mocks.order.findUnique.mockResolvedValueOnce(makeOrder({ status: 'IN_REVISION' }));
    mocks.orderDelivery.findUnique.mockResolvedValueOnce(null);
    mocks.orderDelivery.create.mockResolvedValueOnce({
      id: 'del-2',
      orderId: ORDER_ID,
      message: 'Updated responsive mobile spacing applied.',
      files: [],
      requestKey: 'delivery_key_0002',
      createdAt: new Date(),
    });
    mocks.order.update.mockResolvedValueOnce(makeOrder({ status: 'DELIVERED' }));
    const redelivered = await request(app)
      .post(`/api/v1/orders/${ORDER_ID}/delivery`)
      .set('Authorization', 'Bearer seller')
      .send({
        message: 'Updated responsive mobile spacing applied.',
        files: [],
        idempotencyKey: 'delivery_key_0002',
      });
    expect(redelivered.status).toBe(200);
    expect(redelivered.body.data.status).toBe('DELIVERED');

    // 5. Buyer accepts delivery -> releases escrow & completes order
    mocks.order.findUnique.mockResolvedValueOnce(makeOrder({ status: 'DELIVERED' }));
    mocks.financialEntry.aggregate.mockResolvedValueOnce({
      _sum: {
        pendingDelta: new Prisma.Decimal('90.00'),
        availableDelta: new Prisma.Decimal('0.00'),
        reservedDelta: new Prisma.Decimal('0.00'),
        paidDelta: new Prisma.Decimal('0.00'),
      },
    });
    mocks.escrow.update.mockResolvedValueOnce({ id: 'escrow-1', released: true });
    mocks.order.update.mockResolvedValueOnce(makeOrder({ status: 'COMPLETED' }));
    const accepted = await request(app)
      .post(`/api/v1/orders/${ORDER_ID}/operations/accept`)
      .set('Authorization', 'Bearer buyer')
      .send({});
    expect(accepted.status).toBe(200);
    expect(accepted.body.data.status).toBe('COMPLETED');
    expect(mocks.escrow.update).toHaveBeenCalledOnce();
  });

  it('blocks illegal state transitions and direct PAID/DELIVERED status spoofing', async () => {
    // Direct PAID spoofing via /status is always 403
    const spoofPaid = await request(app)
      .post(`/api/v1/orders/${ORDER_ID}/status`)
      .set('Authorization', 'Bearer buyer')
      .send({ status: 'PAID' });
    expect(spoofPaid.status).toBe(403);

    // Direct DELIVERED spoofing via /status is always 403
    const spoofDelivered = await request(app)
      .post(`/api/v1/orders/${ORDER_ID}/status`)
      .set('Authorization', 'Bearer seller')
      .send({ status: 'DELIVERED' });
    expect(spoofDelivered.status).toBe(403);

    // Seller cannot start an unpaid PENDING order without escrow
    mocks.order.findUnique.mockResolvedValueOnce(makeOrder({ status: 'PENDING', escrow: null }));
    const startUnpaid = await request(app)
      .post(`/api/v1/orders/${ORDER_ID}/operations/start`)
      .set('Authorization', 'Bearer seller')
      .send({});
    expect(startUnpaid.status).toBe(409);

    // Reusing delivery idempotencyKey with modified message fails with 409
    mocks.order.findUnique.mockResolvedValueOnce(makeOrder({ status: 'IN_PROGRESS' }));
    mocks.orderDelivery.findUnique.mockResolvedValueOnce({
      id: 'del-1',
      orderId: ORDER_ID,
      message: 'Original delivery note',
      files: [],
      requestKey: 'delivery_key_reuse',
    });
    const deliveryConflict = await request(app)
      .post(`/api/v1/orders/${ORDER_ID}/delivery`)
      .set('Authorization', 'Bearer seller')
      .send({
        message: 'Different delivery payload',
        files: [],
        idempotencyKey: 'delivery_key_reuse',
      });
    expect(deliveryConflict.status).toBe(409);
  });
});
