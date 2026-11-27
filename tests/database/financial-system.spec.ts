import { beforeAll, afterAll, beforeEach, expect, it, vi } from 'vitest';
import https from 'node:https';
import { Prisma } from '@prisma/client';
import type Stripe from 'stripe';
import { prisma } from '../../apps/api/src/lib/prisma';
import { PaymentService, stripe } from '../../apps/api/src/modules/payment/payment.service';
import { OrderService } from '../../apps/api/src/modules/order/order.service';
import { RefundService } from '../../apps/api/src/modules/financial/refund.service';
import { DisputeService } from '../../apps/api/src/modules/financial/dispute.service';
import { PayoutService, type PayoutProvider } from '../../apps/api/src/modules/financial/payout.service';
import { balances, flushFinancialNotices } from '../../apps/api/src/modules/financial/domain';
import express from 'express';
import request from 'supertest';
import financialRoutes from '../../apps/api/src/modules/financial/financial.route';
import orderRoutes from '../../apps/api/src/modules/order/order.route';
import paymentRoutes from '../../apps/api/src/modules/payment/payment.route';
import { handleWebhook } from '../../apps/api/src/modules/payment/payment.controller';
import { signAccessToken } from '../../apps/api/src/modules/auth/token';
let buyer: string, seller: string, admin: string, outsider: string, sellerId: string, serviceId: string, packageId: string;
beforeAll(async () => {
  const url = new URL(process.env.DATABASE_URL || '');
  if (process.env.DATABASE_URL !== process.env.TASCORA_DISPOSABLE_DATABASE_URL || url.hostname !== '127.0.0.1' || url.username !== 'tascora_test' || url.port === '5432' || !/^\/tascora_migration_test(?:_second|_repeat)?$/.test(url.pathname)) throw new Error('Refusing non-disposable target');
  vi.spyOn(https, 'request').mockImplementation(() => { throw new Error('External provider requests forbidden'); });
  vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('External provider requests forbidden'));
  buyer = (await prisma.user.create({ data: { email: 'finance-buyer@test.invalid', password: 'unused', status: 'ACTIVE' } })).id;
  admin = (await prisma.user.create({ data: { email: 'finance-admin@test.invalid', password: 'unused', role: 'ADMIN', status: 'ACTIVE' } })).id;
  outsider = (await prisma.user.create({ data: { email: 'finance-outsider@test.invalid', password: 'unused', status: 'ACTIVE' } })).id;
  const account = await prisma.user.create({ data: { email: 'finance-seller@test.invalid', password: 'unused', status: 'ACTIVE', role: 'SELLER', sellerProfile: { create: { status: 'APPROVED', verificationStatus: 'APPROVED', stripeAccountId: 'acct_test_finance_seller', skills: [], languages: [] } } }, include: { sellerProfile: true } }); seller = account.id; sellerId = account.sellerProfile!.id;
  const category = await prisma.category.create({ data: { name: 'Financial validation', slug: 'financial-validation' } });
  const service = await prisma.service.create({ data: { sellerProfileId: sellerId, categoryId: category.id, title: 'Trusted financial service', description: 'Disposable financial fixture', status: 'PUBLISHED', packages: { create: { type: 'BASIC', title: 'Trusted package', description: 'Fixture', price: '100.00', deliveryDays: 2, revisions: 1, features: [] } } }, include: { packages: true } }); serviceId = service.id; packageId = service.packages[0]!.id;
});
afterAll(async () => { vi.restoreAllMocks(); await prisma.$disconnect(); });
beforeEach(() => { vi.spyOn(stripe.paymentIntents, 'create').mockRejectedValue(new Error('Explicit provider mock required')); vi.spyOn(stripe.paymentIntents, 'retrieve').mockRejectedValue(new Error('Explicit provider mock required')); vi.spyOn(stripe.refunds, 'create').mockRejectedValue(new Error('Explicit provider mock required')); vi.spyOn(stripe.refunds, 'retrieve').mockRejectedValue(new Error('Explicit provider mock required')); });
const TEST_STRIPE_TIMESTAMP = 1_700_000_000;

function toStripeResponse<T>(payload: T): Stripe.Response<T> {
  return {
    ...payload,
    lastResponse: {
      headers: {},
      requestId: 'req_test_financial',
      statusCode: 200,
    },
  };
}

type PaymentIntentFixtureOverrides = Partial<
  Omit<Stripe.PaymentIntent, 'id' | 'object' | 'amount' | 'currency' | 'status' | 'metadata'>
> & {
  id: string;
  amount: number;
  status: Stripe.PaymentIntent.Status;
  metadata: Stripe.Metadata;
  currency?: string;
};

function buildPaymentIntent(overrides: PaymentIntentFixtureOverrides): Stripe.PaymentIntent {
  const {
    id,
    amount,
    status,
    metadata,
    currency = 'usd',
    amount_received = status === 'succeeded' ? amount : 0,
    ...rest
  } = overrides;

  return {
    id,
    object: 'payment_intent',
    allowed_payment_method_types: null,
    amount,
    amount_capturable: 0,
    amount_received,
    application: null,
    application_fee_amount: null,
    automatic_payment_methods: null,
    canceled_at: null,
    cancellation_reason: null,
    capture_method: 'automatic',
    client_secret: null,
    confirmation_method: 'automatic',
    created: TEST_STRIPE_TIMESTAMP,
    currency,
    customer: null,
    customer_account: null,
    description: null,
    excluded_payment_method_types: null,
    last_payment_error: null,
    latest_charge: null,
    livemode: false,
    managed_payments: null,
    metadata,
    next_action: null,
    on_behalf_of: null,
    payment_method: null,
    payment_method_configuration_details: null,
    payment_method_options: null,
    payment_method_types: ['card'],
    processing: null,
    receipt_email: null,
    review: null,
    setup_future_usage: null,
    shipping: null,
    source: null,
    statement_descriptor: null,
    statement_descriptor_suffix: null,
    status,
    transfer_group: null,
    ...rest,
  };
}

function buildPaymentIntentResponse(
  overrides: PaymentIntentFixtureOverrides
): Stripe.Response<Stripe.PaymentIntent> {
  return toStripeResponse(buildPaymentIntent(overrides));
}

type RefundFixtureInput = {
  id: string;
  orderId: string;
  amount: Prisma.Decimal;
};

function buildRefund(
  refund: RefundFixtureInput,
  status: 'pending' | 'requires_action' | 'succeeded' | 'failed' | 'canceled' = 'succeeded',
  reason: Stripe.Refund.Reason | null = null
): Stripe.Refund {
  return {
    id: `re_${refund.id}`,
    object: 'refund',
    amount: refund.amount.mul(100).toNumber(),
    balance_transaction: null,
    charge: null,
    created: TEST_STRIPE_TIMESTAMP,
    currency: 'usd',
    customer: null,
    customer_account: null,
    metadata: { refundId: refund.id, orderId: refund.orderId },
    payment_intent: `pi_${refund.orderId}`,
    payment_method: null,
    reason,
    receipt_number: null,
    source_transfer_reversal: null,
    status,
    transfer_reversal: null,
  };
}

function buildRefundResponse(
  refund: RefundFixtureInput,
  status: 'pending' | 'requires_action' | 'succeeded' | 'failed' | 'canceled' = 'succeeded',
  reason: Stripe.Refund.Reason | null = null
): Stripe.Response<Stripe.Refund> {
  return toStripeResponse(buildRefund(refund, status, reason));
}

type BuildStripeEventBase<TType extends Stripe.Event.Type, TDataObject> = {
  id: string;
  type: TType;
  dataObject: TDataObject;
  created?: number;
  livemode?: boolean;
};

function buildStripeEvent(
  params: BuildStripeEventBase<'payment_intent.succeeded', Stripe.PaymentIntent>
): Stripe.PaymentIntentSucceededEvent;
function buildStripeEvent(
  params: BuildStripeEventBase<'payment_intent.payment_failed', Stripe.PaymentIntent>
): Stripe.PaymentIntentPaymentFailedEvent;
function buildStripeEvent(
  params: BuildStripeEventBase<'payment_intent.canceled', Stripe.PaymentIntent>
): Stripe.PaymentIntentCanceledEvent;
function buildStripeEvent(
  params: BuildStripeEventBase<'payment_intent.processing', Stripe.PaymentIntent>
): Stripe.PaymentIntentProcessingEvent;
function buildStripeEvent(
  params: BuildStripeEventBase<'refund.created', Stripe.Refund>
): Stripe.RefundCreatedEvent;
function buildStripeEvent(
  params: BuildStripeEventBase<'refund.updated', Stripe.Refund>
): Stripe.RefundUpdatedEvent;
function buildStripeEvent(
  params: BuildStripeEventBase<'refund.failed', Stripe.Refund>
): Stripe.RefundFailedEvent;
function buildStripeEvent(
  params:
    | BuildStripeEventBase<
        | 'payment_intent.succeeded'
        | 'payment_intent.payment_failed'
        | 'payment_intent.canceled'
        | 'payment_intent.processing',
        Stripe.PaymentIntent
      >
    | BuildStripeEventBase<'refund.created' | 'refund.updated' | 'refund.failed', Stripe.Refund>
): Stripe.Event {
  const base = {
    id: params.id,
    object: 'event' as const,
    api_version: null,
    created: params.created ?? TEST_STRIPE_TIMESTAMP,
    livemode: params.livemode ?? false,
    pending_webhooks: 0,
    request: { id: null, idempotency_key: null },
  };

  switch (params.type) {
    case 'payment_intent.succeeded':
    case 'payment_intent.payment_failed':
    case 'payment_intent.canceled':
    case 'payment_intent.processing':
      return { ...base, type: params.type, data: { object: params.dataObject } };
    case 'refund.created':
    case 'refund.updated':
    case 'refund.failed':
      return { ...base, type: params.type, data: { object: params.dataObject } };
  }
}

const order = (key?: string) => OrderService.createOrder(buyer, serviceId, packageId, key);
async function fund(id: string) {
  const saved = await prisma.order.findUniqueOrThrow({ where: { id } });
  const transaction = await prisma.transaction.create({ data: { orderId: id, stripePaymentId: `pi_${id}`, amount: saved.amount } });
  const amount = saved.amount.mul(100).toNumber();
  const event = buildStripeEvent({
    id: `evt_${id}`,
    type: 'payment_intent.succeeded',
    dataObject: buildPaymentIntent({
      id: `pi_${id}`,
      amount,
      amount_received: amount,
      status: 'succeeded',
      metadata: { orderId: id, buyerId: buyer, transactionId: transaction.id },
    }),
  });
  await PaymentService.handleWebhookEvent(event); return event;
}
async function delivered() { const created = await order(); await fund(created.id); await OrderService.operate(seller, created.id, 'start'); await OrderService.deliver(seller, created.id, 'Complete financial test delivery', [], `delivery_${created.id}`); return created; }
const balance = (id: string) => prisma.$transaction(tx => balances(tx, id));
const mockRefund = buildRefundResponse;
const provider = (status: 'PAID' | 'FAILED' | 'PROCESSING'): PayoutProvider => ({ available: true, submit: async input => ({ ...input, providerId: `po_${input.reference}`, status }) });
const app = express(); app.post('/payments/webhook', express.raw({ type: 'application/json' }), handleWebhook); app.use(express.json()); app.use('/orders', orderRoutes); app.use('/payments', paymentRoutes); app.use('/financial', financialRoutes);
app.use((error: Error & { status?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => res.status(error.status || 500).json({ success: false, error: error.message }));
async function token(actor: string, claimedRole = 'ADMIN') { const session = await prisma.userSession.create({ data: { userId: actor, expiresAt: new Date(Date.now() + 3600000) } }); return signAccessToken({ id: actor, role: claimedRole }, session.id); }

it('financial REST routes enforce actual database actors, body validation, tamper resistance and IDOR', async () => {
  const buyerToken = await token(buyer), sellerToken = await token(seller), adminToken = await token(admin), outsiderToken = await token(outsider);
  const body = { serviceId, packageId, idempotencyKey: 'api_checkout_financial_1', amount: 1, sellerId: outsider, status: 'PAID', platformFeeBps: 0 };
  expect((await request(app).post('/orders').send(body)).status).toBe(401);
  const purchase = await request(app).post('/orders').set('Authorization', `Bearer ${buyerToken}`).send(body);
  expect(purchase.status).toBe(201); expect(purchase.body.data.amount).toBe('100'); expect(purchase.body.data.platformFeeBps).toBe(1000); expect(purchase.body.data.status).toBe('PENDING');
  const id = purchase.body.data.id;
  expect((await request(app).post('/orders').set('Authorization', `Bearer ${buyerToken}`).send({ ...body, idempotencyKey: 'bad' })).status).toBe(400);
  expect((await request(app).post(`/orders/${id}/status`).set('Authorization', `Bearer ${buyerToken}`).send({ status: 'PAID' })).status).toBe(403);
  expect((await request(app).post('/payments/create-intent').set('Authorization', `Bearer ${outsiderToken}`).send({ orderId: id })).status).toBe(404);
  expect((await request(app).post('/payments/create-intent').set('Authorization', `Bearer ${buyerToken}`).send({ orderId: id, amount: 1 })).status).toBe(400);
  expect((await request(app).get('/financial/admin/queue').set('Authorization', `Bearer ${buyerToken}`)).status).toBe(403); // JWT claimed ADMIN is ignored
  expect((await request(app).get('/financial/admin/queue').set('Authorization', `Bearer ${adminToken}`)).status).toBe(200);
  await fund(id);
  expect((await request(app).post(`/orders/${id}/operations/start`).set('Authorization', `Bearer ${buyerToken}`).send({})).status).toBe(403);
  const started = await request(app).post(`/orders/${id}/operations/start`).set('Authorization', `Bearer ${sellerToken}`).send({});
  expect(started.status).toBe(200);
  expect(Object.keys(started.body.data).sort()).toEqual(['amount', 'completedAt', 'currency', 'id', 'status']);
  expect((await request(app).post(`/orders/${id}/delivery`).set('Authorization', `Bearer ${outsiderToken}`).send({ message: 'Spoofed delivery', files: [], idempotencyKey: 'spoofed_api_delivery' })).status).toBe(404);
  expect((await request(app).post(`/orders/${id}/delivery`).set('Authorization', `Bearer ${sellerToken}`).send({ message: 'Delivery complete', files: [], idempotencyKey: 'actual_api_delivery' })).status).toBe(200);
  expect((await request(app).post(`/orders/${id}/operations/accept`).set('Authorization', `Bearer ${buyerToken}`).send({})).status).toBe(200);
  expect((await request(app).post(`/financial/orders/${id}/payouts`).set('Authorization', `Bearer ${buyerToken}`).send({ idempotencyKey: 'payout_spoof_api' })).status).toBe(404);
  expect((await request(app).post(`/financial/orders/${id}/payouts`).set('Authorization', `Bearer ${sellerToken}`).send({ idempotencyKey: 'actual_payout_api', amount: 100000 })).status).toBe(400);
  const payout = await request(app).post(`/financial/orders/${id}/payouts`).set('Authorization', `Bearer ${sellerToken}`).send({ idempotencyKey: 'actual_payout_api' }); expect(payout.status).toBe(201);
  expect(Object.keys(payout.body.data).sort()).toEqual(['amount', 'createdAt', 'id', 'status']);
  expect((await request(app).post(`/financial/admin/payouts/${payout.body.data.id}/process`).set('Authorization', `Bearer ${buyerToken}`).send({ status: 'COMPLETED' })).status).toBe(403);
  expect((await request(app).post(`/financial/admin/payouts/${payout.body.data.id}/process`).set('Authorization', `Bearer ${adminToken}`).send({})).status).toBe(503);
  const list = await request(app).get('/orders/my-purchases').set('Authorization', `Bearer ${outsiderToken}`); expect(list.body.data).toEqual([]);
  const evidence = await request(app).get(`/financial/admin/orders/${id}`).set('Authorization', `Bearer ${adminToken}`); expect(evidence.status).toBe(200); expect(JSON.stringify(evidence.body)).not.toContain('password');
  expect((await request(app).get(`/financial/admin/orders/${id}`).set('Authorization', `Bearer ${outsiderToken}`)).status).toBe(403);
});

it('serializes same-key checkout and permits deliberate new-key purchases; snapshots immutable terms', async () => {
  const orders = await Promise.all(Array.from({ length: 8 }, () => order('identical_checkout_financial')));
  expect(new Set(orders.map(o => o.id)).size).toBe(1);
  expect((await order('deliberate_new_purchase_financial')).id).not.toBe(orders[0]!.id);
  await expect(OrderService.createOrder(buyer, serviceId, 'different-package', 'identical_checkout_financial')).rejects.toThrow('different purchase');
  expect(await prisma.financialEntry.count({ where: { orderId: orders[0]!.id, type: 'ORDER_CREATED' } })).toBe(1);
  await prisma.servicePackage.update({ where: { id: packageId }, data: { price: '120.00', title: 'New package title' } });
  expect((await prisma.order.findUniqueOrThrow({ where: { id: orders[0]!.id } })).amount.toFixed(2)).toBe('100.00');
  expect((orders[0]!.purchaseSnapshot as Prisma.JsonObject).packageTitle).toBe('Trusted package');
  await expect(prisma.order.update({ where: { id: orders[0]!.id }, data: { amount: 1 } })).rejects.toThrow('immutable');
  await prisma.servicePackage.update({ where: { id: packageId }, data: { price: '100.00', title: 'Trusted package' } });
});
it('duplicate success events with same or different IDs cannot credit twice; failed payments do not fund', async () => {
  const created = await order(); const event = await fund(created.id);
  await Promise.all(Array.from({ length: 10 }, (_, n) => PaymentService.handleWebhookEvent({ ...event, id: n % 2 ? event.id : `duplicate_${n}_${created.id}` })));
  expect(await balance(created.id)).toEqual({ pending: 9000, available: 0, reserved: 0, paid: 0 });
  expect(await prisma.financialEntry.count({ where: { orderId: created.id, type: 'PAYMENT_RECEIVED' } })).toBe(1);
  const failed = await order(); await prisma.transaction.create({ data: { orderId: failed.id, stripePaymentId: `pi_${failed.id}`, amount: 100 } });
  await PaymentService.handleWebhookEvent(
    buildStripeEvent({
      id: `evt_failed_${failed.id}`,
      type: 'payment_intent.payment_failed',
      dataObject: buildPaymentIntent({
        id: `pi_${failed.id}`,
        amount: 10000,
        amount_received: 0,
        status: 'requires_payment_method',
        metadata: { orderId: failed.id, buyerId: buyer },
      }),
    })
  );
  expect((await prisma.order.findUniqueOrThrow({ where: { id: failed.id } })).status).toBe('PENDING'); expect((await balance(failed.id)).pending).toBe(0);
});
it('recovers provider intent creation timeout and webhook-before-binding using durable attempt identity', async () => {
  const created = await order();
  vi.spyOn(stripe.paymentIntents, 'create').mockRejectedValueOnce(new Error('Timeout after provider creation'));
  await expect(PaymentService.createPaymentIntent(buyer, created.id)).rejects.toThrow('Timeout');
  const attempt = await prisma.transaction.findFirstOrThrow({ where: { orderId: created.id } });
  expect(attempt.stripePaymentId).toBeNull();
  const remote = buildPaymentIntent({
    id: `pi_recovery_${created.id}`,
    amount: 10000,
    amount_received: 10000,
    status: 'succeeded',
    metadata: { orderId: created.id, buyerId: buyer, transactionId: attempt.id },
  });
  await PaymentService.handleWebhookEvent(
    buildStripeEvent({
      id: `evt_recovery_${created.id}`,
      type: 'payment_intent.succeeded',
      dataObject: remote,
    })
  );
  expect((await prisma.transaction.findUniqueOrThrow({ where: { id: attempt.id } })).stripePaymentId).toBe(remote.id);
  expect((await balance(created.id)).pending).toBe(9000);
  await expect(PaymentService.createPaymentIntent(buyer, created.id)).rejects.toThrow('not awaiting');
});
it('enforces buyer/seller/admin ownership and funded-only work/delivery/revision limits', async () => {
  const created = await order();
  await expect(OrderService.operate(seller, created.id, 'start')).rejects.toThrow();
  await expect(OrderService.operate(outsider, created.id, 'cancel')).rejects.toThrow('not found');
  await expect(OrderService.createOrder(seller, serviceId, packageId)).rejects.toThrow('own services');
  await fund(created.id);
  await expect(OrderService.operate(buyer, created.id, 'start')).rejects.toThrow('Only the seller');
  await OrderService.operate(seller, created.id, 'start');
  await expect(OrderService.deliver(buyer, created.id, 'Spoof delivery', [], 'spoof_delivery_finance')).rejects.toThrow('not found');
  await OrderService.deliver(seller, created.id, 'Valid first delivery', [], 'valid_delivery_finance_1');
  await OrderService.operate(buyer, created.id, 'revision', 'Please change the output');
  await OrderService.operate(seller, created.id, 'start');
  await OrderService.deliver(seller, created.id, 'Valid second delivery', [], 'valid_delivery_finance_2');
  await expect(OrderService.operate(buyer, created.id, 'revision', 'More changes')).rejects.toThrow('revision limit');
  await expect(DisputeService.resolve(buyer, created.id, 'SELLER', 'Fake admin')).rejects.toThrow('Administrator');
  await expect(PayoutService.request(outsider, created.id, 'cross_seller_payout')).rejects.toThrow('not found');
});
it('serializes acceptance, revision, dispute and auto-completion with no duplicate earning release', async () => {
  for (const competing of ['revision', 'dispute', 'auto', 'accept'] as const) {
    const created = await delivered();
    await prisma.order.update({ where: { id: created.id }, data: { lastDeliveredAt: new Date(Date.now() - 73 * 3600000) } });
    const other = competing === 'dispute' ? DisputeService.open(buyer, created.id, 'QUALITY', 'Review this delivery') : competing === 'auto' ? OrderService.autoComplete() : OrderService.operate(buyer, created.id, competing, 'Please revise delivery');
    await Promise.allSettled([OrderService.operate(buyer, created.id, 'accept'), other]);
    const saved = await prisma.order.findUniqueOrThrow({ where: { id: created.id } }), account = await balance(created.id);
    expect(account.pending + account.available).toBe(9000); expect(account.paid + account.reserved).toBe(0);
    expect(await prisma.financialEntry.count({ where: { orderId: created.id, type: 'SELLER_EARNING_AVAILABLE' } })).toBe(saved.status === 'COMPLETED' ? 1 : 0);
    if (saved.status === 'DISPUTED') expect(account.available).toBe(0);
  }
});
it('full and partial refund races preserve bounds, fees and pending/available balances', async () => {
  const created = await order(); await fund(created.id);
  const attempts = await Promise.allSettled([RefundService.request(admin, created.id, '60.00', 'Partial resolution one', 'refund_race_finance_1'), RefundService.request(admin, created.id, '60.00', 'Partial resolution two', 'refund_race_finance_2')]);
  expect(attempts.filter(r => r.status === 'fulfilled')).toHaveLength(1);
  const won = attempts.find(r => r.status === 'fulfilled')!; if (won.status !== 'fulfilled') throw new Error('No refund won');
  await expect(OrderService.operate(seller, created.id, 'start')).rejects.toThrow('refund');
  vi.spyOn(stripe.refunds, 'create').mockResolvedValue(mockRefund(won.value));
  await Promise.all([RefundService.process(admin, won.value.id), RefundService.process(admin, won.value.id)]);
  expect(await balance(created.id)).toEqual({ pending: 3600, available: 0, reserved: 0, paid: 0 });
  const rest = await RefundService.request(buyer, created.id, '40.00', 'Cancel before starting', 'refund_rest_financial');
  vi.spyOn(stripe.refunds, 'create').mockResolvedValue(mockRefund(rest)); await RefundService.process(admin, rest.id);
  expect((await prisma.order.findUniqueOrThrow({ where: { id: created.id } })).status).toBe('REFUNDED');
  expect(await balance(created.id)).toEqual({ pending: 0, available: 0, reserved: 0, paid: 0 });
  expect((await prisma.financialEntry.aggregate({ where: { orderId: created.id }, _sum: { feeDelta: true } }))._sum.feeDelta!.toFixed(2)).toBe('0.00');
  await expect(RefundService.request(admin, created.id, '0.001', 'Bad precision', 'bad_precision_finance')).rejects.toThrow('precision');
  await expect(RefundService.request(admin, created.id, '1.00', 'Too much refund', 'too_much_finance')).rejects.toThrow();
});
it('resolves disputes with admin audit; buyer refund awaits provider and seller resolution releases once', async () => {
  const buyerOrder = await delivered(); await DisputeService.open(buyer, buyerOrder.id, 'DELIVERY', 'Delivery is incomplete');
  await expect(OrderService.operate(buyer, buyerOrder.id, 'accept')).rejects.toThrow('Dispute');
  await DisputeService.resolve(admin, buyerOrder.id, 'BUYER', 'Buyer evidence confirmed');
  expect((await prisma.order.findUniqueOrThrow({ where: { id: buyerOrder.id } })).status).toBe('DISPUTED');
  const refund = await prisma.refund.findFirstOrThrow({ where: { orderId: buyerOrder.id } });
  vi.spyOn(stripe.refunds, 'create').mockResolvedValue(mockRefund(refund)); await RefundService.process(admin, refund.id);
  expect((await prisma.marketplaceDispute.findUniqueOrThrow({ where: { orderId: buyerOrder.id } })).status).toBe('RESOLVED_BUYER');
  const sellerOrder = await delivered(); await DisputeService.open(buyer, sellerOrder.id, 'QUALITY', 'Quality review request');
  await Promise.all([DisputeService.resolve(admin, sellerOrder.id, 'SELLER', 'Seller evidence confirmed'), DisputeService.resolve(admin, sellerOrder.id, 'SELLER', 'Seller evidence confirmed')]);
  expect((await balance(sellerOrder.id)).available).toBe(9000);
  expect(await prisma.financialEntry.count({ where: { orderId: sellerOrder.id, type: 'DISPUTE_RESOLVED_SELLER', actorId: admin } })).toBe(1);
});
it('concurrent payouts reserve once; failed provider restores availability and paid earnings block refunds', async () => {
  const created = await delivered(); await OrderService.operate(buyer, created.id, 'accept');
  const requested = await Promise.all(Array.from({ length: 5 }, () => PayoutService.request(seller, created.id, 'payout_identical_financial')));
  expect(new Set(requested.map(p => p.id)).size).toBe(1); expect((await balance(created.id)).reserved).toBe(9000);
  await expect(PayoutService.request(seller, created.id, 'payout_duplicate_newkey')).rejects.toThrow('already');
  await expect(RefundService.request(admin, created.id, '100.00', 'Refund after reservation', 'payout_refund_conflict')).rejects.toThrow('recovery');
  await expect(PayoutService.process(admin, requested[0]!.id)).rejects.toThrow('provider validation');
  await PayoutService.process(admin, requested[0]!.id, provider('FAILED')); expect((await balance(created.id)).available).toBe(9000);
  const retried = await PayoutService.request(seller, created.id, 'payout_retry_newkey_financial');
  await Promise.all([PayoutService.process(admin, retried.id, provider('PAID')), PayoutService.process(admin, retried.id, provider('PAID'))]);
  expect(await balance(created.id)).toEqual({ pending: 0, available: 0, reserved: 0, paid: 9000 });
  expect(await prisma.financialEntry.count({ where: { orderId: created.id, type: 'PAYOUT_PAID' } })).toBe(1);
  await expect(RefundService.request(admin, created.id, '1.00', 'Recovery required', 'post_payout_finance')).rejects.toThrow('recovery');
});
it('immutable ledger/DB bounds reject rewriting and overdrafts; notification failure cannot corrupt funding', async () => {
  const created = await order();
  const failedNotice = vi.spyOn(prisma.notification, 'upsert').mockRejectedValueOnce(new Error('Notification offline'));
  await fund(created.id); expect((await balance(created.id)).pending).toBe(9000); failedNotice.mockRestore();
  await flushFinancialNotices(created.id); await flushFinancialNotices(created.id);
  const financial = await prisma.financialEntry.findFirstOrThrow({ where: { orderId: created.id, type: 'PAYMENT_RECEIVED' } });
  expect(await prisma.notification.count({ where: { financialEntryId: financial.id } })).toBe(1);
  await expect(prisma.financialEntry.update({ where: { id: financial.id }, data: { amount: 1 } })).rejects.toThrow('append-only');
  await expect(prisma.financialEntry.delete({ where: { id: financial.id } })).rejects.toThrow('append-only');
  await expect(prisma.financialEntry.create({ data: { orderId: created.id, type: 'ADJUSTMENT', eventKey: `bad_${created.id}`, pendingDelta: -1000 } })).rejects.toThrow('negative');
  await expect(prisma.transaction.updateMany({ where: { orderId: created.id }, data: { refundedAmount: 101 } })).rejects.toThrow('transactions_refund_bounds_check');
});

it('refund provider success followed by local DB failure safely retries without duplicate reversal', async () => {
  const created = await order(); await fund(created.id);
  const refund = await RefundService.request(buyer, created.id, '100.00', 'Cancel before work starts', 'refund_db_failure_financial');
  let failure: ReturnType<typeof vi.spyOn> | undefined;
  const create = vi.spyOn(stripe.refunds, 'create').mockImplementation(async () => {
    failure = vi.spyOn(prisma, '$transaction').mockRejectedValueOnce(new Error('DB unavailable after provider refund'));
    return mockRefund(refund);
  });
  await expect(RefundService.process(admin, refund.id)).rejects.toThrow('DB unavailable'); failure?.mockRestore();
  expect((await prisma.refund.findUniqueOrThrow({ where: { id: refund.id } })).status).toBe('PROCESSING');
  expect((await balance(created.id)).pending).toBe(9000);
  create.mockResolvedValue(mockRefund(refund)); await RefundService.process(admin, refund.id);
  expect(new Set(create.mock.calls.map(call => call[1]!.idempotencyKey)).size).toBe(1);
  expect((await balance(created.id)).pending).toBe(0);
  expect(await prisma.financialEntry.count({ where: { refundId: refund.id, type: 'REFUND' } })).toBe(1);
});
it('partial refunds from available earnings retain exact net balance and duplicate webhooks cannot restore refunded money', async () => {
  const created = await delivered(); await OrderService.operate(buyer, created.id, 'accept');
  const refund = await RefundService.request(admin, created.id, '25.01', 'Controlled partial resolution', 'available_refund_financial');
  vi.spyOn(stripe.refunds, 'create').mockResolvedValue(mockRefund(refund)); await RefundService.process(admin, refund.id);
  expect((await balance(created.id)).available).toBe(6749); // retained 74.99, fee 7.50
  const duplicateSuccess = buildStripeEvent({
    id: `evt_late_${created.id}`,
    type: 'payment_intent.succeeded',
    dataObject: buildPaymentIntent({
      id: `pi_${created.id}`,
      amount: 10000,
      amount_received: 10000,
      status: 'succeeded',
      metadata: { orderId: created.id, buyerId: buyer },
    }),
  });
  const refundEvent = buildStripeEvent({
    id: `evt_refund_${created.id}`,
    type: 'refund.updated',
    dataObject: buildRefund(refund),
  });
  await Promise.all([PaymentService.handleWebhookEvent(duplicateSuccess), PaymentService.handleWebhookEvent(refundEvent), PaymentService.handleWebhookEvent(refundEvent)]);
  expect((await balance(created.id)).available).toBe(6749);
  expect((await prisma.transaction.findFirstOrThrow({ where: { orderId: created.id } })).refundedAmount.toFixed(2)).toBe('25.01');
});
it('ambiguous payout timeouts retain reservations for reconciliation and never manufacture failure or success', async () => {
  const created = await delivered(); await OrderService.operate(buyer, created.id, 'accept');
  const payout = await PayoutService.request(seller, created.id, 'payout_timeout_financial');
  await expect(PayoutService.process(admin, payout.id, { available: true, submit: async () => { throw new Error('Provider timeout after submission'); } })).rejects.toThrow('timeout');
  expect((await prisma.payout.findUniqueOrThrow({ where: { id: payout.id } })).status).toBe('PROCESSING');
  expect(await balance(created.id)).toEqual({ pending: 0, available: 0, reserved: 9000, paid: 0 });
  await PayoutService.process(admin, payout.id, provider('PAID'));
  expect((await balance(created.id)).paid).toBe(9000);
});

it('cancellation retries and concurrent requests commit once and return only public order fields', async () => {
  const created = await order();
  await prisma.transaction.create({ data: { orderId: created.id, stripePaymentId: `pi_${created.id}`, amount: created.amount } });
  const remote = buildPaymentIntentResponse({
    id: `pi_${created.id}`,
    status: 'canceled',
    amount: 10000,
    metadata: { orderId: created.id, buyerId: buyer },
  });
  vi.spyOn(stripe.paymentIntents, 'retrieve').mockResolvedValue(remote);
  const cancel = vi.spyOn(stripe.paymentIntents, 'cancel').mockRejectedValue(new Error('Already canceled provider must not be canceled again'));
  const auth = await token(buyer);
  const responses = await Promise.all(Array.from({ length: 4 }, () => request(app).post(`/financial/orders/${created.id}/cancel-payment`).set('Authorization', `Bearer ${auth}`).send({})));
  for (const response of responses) {
    expect(response.status).toBe(200);
    expect(Object.keys(response.body.data).sort()).toEqual(['amount', 'completedAt', 'currency', 'id', 'status']);
    expect(response.body.data.status).toBe('CANCELLED');
  }
  expect(cancel).not.toHaveBeenCalled();
  expect(await prisma.financialEntry.count({ where: { orderId: created.id, eventKey: `payment:${(await prisma.transaction.findFirstOrThrow({ where: { orderId: created.id } })).id}:cancelled` } })).toBe(1);
});

it('an older provider cancellation cannot cancel a newer live payment attempt', async () => {
  const created = await order();
  const first = await prisma.transaction.create({ data: { orderId: created.id, stripePaymentId: `pi_${created.id}`, amount: created.amount } });
  vi.spyOn(stripe.paymentIntents, 'retrieve').mockImplementation(async () => {
    await prisma.transaction.update({ where: { id: first.id }, data: { status: 'CANCELLED' } });
    await prisma.transaction.create({ data: { orderId: created.id, stripePaymentId: `pi_new_${created.id}`, amount: created.amount, createdAt: first.createdAt } });
    return buildPaymentIntentResponse({
      id: `pi_${created.id}`,
      status: 'canceled',
      amount: 10000,
      metadata: { orderId: created.id, buyerId: buyer },
    });
  });
  await expect(PaymentService.cancelPayment(buyer, created.id)).rejects.toThrow('New payment attempt');
  expect((await prisma.order.findUniqueOrThrow({ where: { id: created.id } })).status).toBe('PENDING');
});

it('server-computed buyer refund projects public fields and admin processing records one audit entry', async () => {
  const created = await order(); await fund(created.id);
  const auth = await token(buyer);
  const response = await request(app).post(`/financial/orders/${created.id}/refunds`).set('Authorization', `Bearer ${auth}`).send({ reason: 'Cancel before work starts', idempotencyKey: `refund_${created.id}` });
  expect(response.status).toBe(201);
  expect(Object.keys(response.body.data).sort()).toEqual(['amount', 'createdAt', 'id', 'reason', 'status']);
  expect(response.body.data.amount).toBe('100');
  const refund = await prisma.refund.findUniqueOrThrow({ where: { id: response.body.data.id } });
  vi.spyOn(stripe.refunds, 'create').mockResolvedValue(mockRefund(refund, 'pending'));
  await RefundService.process(admin, refund.id);
  vi.spyOn(stripe.refunds, 'retrieve').mockResolvedValue(mockRefund(refund));
  await RefundService.process(admin, refund.id);
  const audit = await prisma.financialEntry.findMany({ where: { refundId: refund.id, type: 'REFUND_PROCESSING' } });
  expect(audit).toHaveLength(1); expect(audit[0]!.actorId).toBe(admin);
  expect(await balance(created.id)).toEqual({ pending: 0, available: 0, reserved: 0, paid: 0 });
});

it('buyer dispute resolution reuses outstanding refunds and late terminal events cannot restore funds', async () => {
  const created = await order(); await fund(created.id);
  const refund = await RefundService.request(buyer, created.id, undefined, 'Cancellation pending', `pending_${created.id}`);
  await DisputeService.open(buyer, created.id, 'OTHER', 'Please resolve pending cancellation');
  await DisputeService.resolve(admin, created.id, 'BUYER', 'Buyer receives full remaining payment');
  expect(await prisma.refund.count({ where: { orderId: created.id } })).toBe(1);
  vi.spyOn(stripe.refunds, 'create').mockResolvedValue(mockRefund(refund)); await RefundService.process(admin, refund.id);
  await RefundService.handleEvent(
    buildStripeEvent({
      id: `late_${refund.id}`,
      type: 'refund.updated',
      dataObject: buildRefund(refund, 'pending'),
    })
  );
  expect((await prisma.refund.findUniqueOrThrow({ where: { id: refund.id } })).status).toBe('SUCCEEDED');
  expect((await prisma.marketplaceDispute.findUniqueOrThrow({ where: { orderId: created.id } })).status).toBe('RESOLVED_BUYER');
});

it('reconciliation reports truncated provider refund scans without correcting balances and restricts access', async () => {
  const created = await order(); await fund(created.id);
  vi.spyOn(stripe.paymentIntents, 'retrieve').mockResolvedValue(
    buildPaymentIntentResponse({
      id: `pi_${created.id}`,
      status: 'succeeded',
      amount: 10000,
      metadata: { orderId: created.id, buyerId: buyer },
    })
  );
  vi.spyOn(stripe.refunds, 'list').mockResolvedValue({ data: [], has_more: true } as unknown as Stripe.Response<Stripe.ApiList<Stripe.Refund>>);
  expect((await request(app).get(`/financial/admin/orders/${created.id}/reconciliation`).set('Authorization', `Bearer ${await token(buyer)}`)).status).toBe(403);
  const response = await request(app).get(`/financial/admin/orders/${created.id}/reconciliation`).set('Authorization', `Bearer ${await token(admin)}`);
  expect(response.status).toBe(200);
  expect(response.body.data.payments[0]).toMatchObject({ matches: true, refundScanIncomplete: true, refundMismatch: true, requiresFundingReconciliation: false });
  expect(await balance(created.id)).toEqual({ pending: 9000, available: 0, reserved: 0, paid: 0 });
  expect(await prisma.financialEntry.count({ where: { orderId: created.id, type: 'RECONCILIATION_CHECK', actorId: admin } })).toBe(1);
});

it('rejects checkout amounts outside USD provider limits before creating an order', async () => {
  const before = await prisma.order.count({ where: { buyerId: buyer } });
  try {
    for (const price of ['0.49', '1000000.00']) {
      await prisma.servicePackage.update({ where: { id: packageId }, data: { price } });
      await expect(order()).rejects.toThrow('supported payment limits');
    }
    expect(await prisma.order.count({ where: { buyerId: buyer } })).toBe(before);
  } finally { await prisma.servicePackage.update({ where: { id: packageId }, data: { price: '100.00' } }); }
});

it('auto-completion candidate filtering leaves pending refunds frozen past the review deadline', async () => {
  const created = await delivered();
  await prisma.order.update({ where: { id: created.id }, data: { lastDeliveredAt: new Date(Date.now() - 73 * 3600000) } });
  await RefundService.request(admin, created.id, '25.00', 'Review partial refund first', `auto_refund_${created.id}`);
  await OrderService.autoComplete();
  expect((await prisma.order.findUniqueOrThrow({ where: { id: created.id } })).status).toBe('DELIVERED');
  expect(await balance(created.id)).toEqual({ pending: 9000, available: 0, reserved: 0, paid: 0 });
});

it('reuses the only live intent across tied or backwards timestamps instead of creating a second intent', async () => {
  for (const offset of [0, -1000]) {
    const created = await order(), timestamp = new Date();
    await prisma.transaction.create({ data: { orderId: created.id, amount: created.amount, stripePaymentId: `pi_old_${created.id}`, status: 'CANCELLED', createdAt: timestamp } });
    const active = await prisma.transaction.create({ data: { orderId: created.id, amount: created.amount, stripePaymentId: `pi_active_${created.id}`, createdAt: new Date(timestamp.getTime() + offset) } });
    const create = vi.spyOn(stripe.paymentIntents, 'create').mockClear();
    if (!active.stripePaymentId) {
      throw new Error('Expected active transaction to persist stripePaymentId before retrieval');
    }
    vi.spyOn(stripe.paymentIntents, 'retrieve').mockResolvedValue(
      buildPaymentIntentResponse({
        id: active.stripePaymentId,
        amount: 10000,
        status: 'requires_payment_method',
        client_secret: 'same-live-intent-secret',
        metadata: { orderId: created.id, buyerId: buyer, transactionId: active.id },
      })
    );
    const results = await Promise.all(Array.from({ length: 8 }, () => PaymentService.createPaymentIntent(buyer, created.id)));
    expect(results.every(result => result.clientSecret === 'same-live-intent-secret')).toBe(true);
    expect(create).not.toHaveBeenCalled();
    expect(await prisma.transaction.count({ where: { orderId: created.id } })).toBe(2);
  }
});

it('multiple live attempts require reconciliation before intent creation or cancellation contacts the provider', async () => {
  const created = await order();
  await prisma.transaction.createMany({ data: [1, 2].map(n => ({ orderId: created.id, amount: created.amount, stripePaymentId: `pi_multiple_${n}_${created.id}` })) });
  const create = vi.spyOn(stripe.paymentIntents, 'create').mockClear(), retrieve = vi.spyOn(stripe.paymentIntents, 'retrieve').mockClear();
  await expect(PaymentService.createPaymentIntent(buyer, created.id)).rejects.toThrow('Multiple payment attempts');
  await expect(PaymentService.cancelPayment(buyer, created.id)).rejects.toThrow('Multiple payment attempts');
  expect(create).not.toHaveBeenCalled(); expect(retrieve).not.toHaveBeenCalled();
  expect((await prisma.order.findUniqueOrThrow({ where: { id: created.id } })).status).toBe('PENDING');
});

it('PR #27: enforces financial_entries BEFORE TRUNCATE, non-negative feeDelta, and validated CHECK constraints on PostgreSQL', async () => {
  const created = await order();
  await fund(created.id);
  await expect(prisma.$executeRawUnsafe(`TRUNCATE TABLE "financial_entries" CASCADE`)).rejects.toThrow(/append-only/i);
  const triggers = await prisma.$queryRaw<{ tgname: string }[]>`
    SELECT t.tgname FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid
    WHERE NOT t.tgisinternal AND c.relname = 'financial_entries'
  `;
  expect(triggers.map(t => t.tgname)).toEqual(
    expect.arrayContaining(['financial_entries_immutable', 'financial_entries_no_truncate', 'financial_entries_balances'])
  );
  await expect(
    prisma.financialEntry.create({
      data: { orderId: created.id, type: 'BAD_FEE', eventKey: `bad_fee_${created.id}`, feeDelta: -20 },
    })
  ).rejects.toThrow(/negative/i);
  const checks = await prisma.$queryRaw<{ conname: string; convalidated: boolean }[]>`
    SELECT conname, convalidated FROM pg_constraint
    WHERE conname IN ('orders_financial_amount_check', 'transactions_refund_bounds_check', 'payouts_positive_check')
  `;
  expect(checks).toHaveLength(3);
  expect(checks.every(c => c.convalidated)).toBe(true);
});

it('PR #27: handles Stripe chargeback created/updated/closed, failed PI cancel/retry, dispute refund retry, and payout eligibility guards on PostgreSQL', async () => {
  // 1. Chargeback created -> updated -> closed (lost) on real Postgres.
  const cbOrder = await delivered();
  await OrderService.operate(buyer, cbOrder.id, 'accept');
  await PaymentService.handleWebhookEvent({
    id: `evt_pg_cb_created_${cbOrder.id}`,
    object: 'event',
    type: 'charge.dispute.created',
    livemode: false,
    data: { object: { id: `dp_pg_${cbOrder.id}`, object: 'dispute', amount: 10000, currency: 'usd', payment_intent: `pi_${cbOrder.id}`, reason: 'fraudulent', status: 'needs_response' } },
  } as unknown as Stripe.Event);
  expect((await prisma.order.findUniqueOrThrow({ where: { id: cbOrder.id } })).status).toBe('DISPUTED');
  await expect(PayoutService.request(seller, cbOrder.id, `payout_cb_blocked_${cbOrder.id}`)).rejects.toThrow('undisputed');
  await PaymentService.handleWebhookEvent({
    id: `evt_pg_cb_lost_${cbOrder.id}`,
    object: 'event',
    type: 'charge.dispute.closed',
    livemode: false,
    data: { object: { id: `dp_pg_${cbOrder.id}`, object: 'dispute', amount: 10000, currency: 'usd', payment_intent: `pi_${cbOrder.id}`, reason: 'fraudulent', status: 'lost' } },
  } as unknown as Stripe.Event);
  expect((await prisma.order.findUniqueOrThrow({ where: { id: cbOrder.id } })).status).toBe('REFUNDED');
  expect((await balance(cbOrder.id)).available).toBe(0);

  // 2. Definite Stripe PI creation failure unlocks clean cancellation.
  const failedPiOrder = await order();
  vi.spyOn(stripe.paymentIntents, 'create').mockRejectedValueOnce(
    Object.assign(new Error('Invalid Stripe request'), { statusCode: 400, type: 'StripeInvalidRequestError' })
  );
  await expect(PaymentService.createPaymentIntent(buyer, failedPiOrder.id)).rejects.toThrow('Invalid Stripe request');
  const cancelled = await PaymentService.cancelPayment(buyer, failedPiOrder.id);
  expect(cancelled.status).toBe('CANCELLED');

  // 3. Dispute resolution unlocks retry after Stripe refund failure.
  const disputeOrder = await delivered();
  await DisputeService.open(buyer, disputeOrder.id, 'QUALITY', 'Retry refund verification');
  await DisputeService.resolve(admin, disputeOrder.id, 'BUYER', 'Initial buyer refund');
  const firstRefund = await prisma.refund.findFirstOrThrow({ where: { orderId: disputeOrder.id } });
  vi.spyOn(stripe.refunds, 'create').mockResolvedValueOnce(mockRefund(firstRefund, 'failed'));
  await RefundService.process(admin, firstRefund.id);
  await DisputeService.resolve(admin, disputeOrder.id, 'BUYER', 'Retry buyer refund');
  const refunds = await prisma.refund.findMany({ where: { orderId: disputeOrder.id }, orderBy: { createdAt: 'asc' } });
  expect(refunds).toHaveLength(2);
  vi.spyOn(stripe.refunds, 'create').mockResolvedValueOnce(mockRefund(refunds[1]!, 'succeeded'));
  await RefundService.process(admin, refunds[1]!.id);
  expect((await prisma.order.findUniqueOrThrow({ where: { id: disputeOrder.id } })).status).toBe('REFUNDED');

  // 4. Payout eligibility guard blocks unverified seller even on COMPLETED order.
  const payoutOrder = await delivered();
  await OrderService.operate(buyer, payoutOrder.id, 'accept');
  await prisma.sellerProfile.update({ where: { id: sellerId }, data: { verificationStatus: 'PENDING' } });
  try {
    await expect(PayoutService.request(seller, payoutOrder.id, `payout_kyc_pending_${payoutOrder.id}`)).rejects.toThrow('KYC_NOT_APPROVED');
  } finally {
    await prisma.sellerProfile.update({ where: { id: sellerId }, data: { verificationStatus: 'APPROVED' } });
  }
});

it('PR #27 follow-up: prevents out-of-order stale dispute reopening and enforces partial chargeback & recovery-required semantics on PostgreSQL', async () => {
  // 1. Stale updated event arriving after closed (won) cannot reopen terminal dispute or order.
  const wonOrder = await delivered();
  await OrderService.operate(buyer, wonOrder.id, 'accept');
  await PaymentService.handleWebhookEvent({
    id: `evt_pg_won_${wonOrder.id}`,
    object: 'event',
    type: 'charge.dispute.closed',
    created: 1_700_100_200,
    livemode: false,
    data: { object: { id: `dp_pg_won_${wonOrder.id}`, object: 'dispute', amount: 10000, currency: 'usd', payment_intent: `pi_${wonOrder.id}`, reason: 'fraudulent', status: 'won' } },
  } as unknown as Stripe.Event);
  await PaymentService.handleWebhookEvent({
    id: `evt_pg_stale_${wonOrder.id}`,
    object: 'event',
    type: 'charge.dispute.updated',
    created: 1_700_100_100,
    livemode: false,
    data: { object: { id: `dp_pg_won_${wonOrder.id}`, object: 'dispute', amount: 10000, currency: 'usd', payment_intent: `pi_${wonOrder.id}`, reason: 'fraudulent', status: 'under_review' } },
  } as unknown as Stripe.Event);
  expect((await prisma.order.findUniqueOrThrow({ where: { id: wonOrder.id } })).status).toBe('COMPLETED');
  expect((await prisma.marketplaceDispute.findUniqueOrThrow({ where: { orderId: wonOrder.id } })).status).toBe('RESOLVED_SELLER');

  // 2. Partial chargeback loss marks Transaction PARTIALLY_REFUNDED but keeps Order DISPUTED (not REFUNDED).
  const partialOrder = await delivered();
  await OrderService.operate(buyer, partialOrder.id, 'accept');
  await PaymentService.handleWebhookEvent({
    id: `evt_pg_partial_${partialOrder.id}`,
    object: 'event',
    type: 'charge.dispute.closed',
    created: 1_700_100_300,
    livemode: false,
    data: { object: { id: `dp_pg_partial_${partialOrder.id}`, object: 'dispute', amount: 4000, currency: 'usd', payment_intent: `pi_${partialOrder.id}`, reason: 'general', status: 'lost' } },
  } as unknown as Stripe.Event);
  expect((await prisma.order.findUniqueOrThrow({ where: { id: partialOrder.id } })).status).toBe('DISPUTED');
  const partialTx = await prisma.transaction.findFirstOrThrow({ where: { orderId: partialOrder.id } });
  expect(partialTx.status).toBe('PARTIALLY_REFUNDED');
  expect(partialTx.refundedAmount.toFixed(2)).toBe('40.00');
  expect((await balance(partialOrder.id)).available).toBe(5400);

  // 3. Chargeback loss on reserved funds flags recoveryRequired and blocks payout processing & other seller payouts.
  const reservedOrder = await delivered();
  await OrderService.operate(buyer, reservedOrder.id, 'accept');
  const reservedPayout = await PayoutService.request(seller, reservedOrder.id, `payout_pg_res_${reservedOrder.id}`);
  await PaymentService.handleWebhookEvent({
    id: `evt_pg_res_lost_${reservedOrder.id}`,
    object: 'event',
    type: 'charge.dispute.closed',
    created: 1_700_100_400,
    livemode: false,
    data: { object: { id: `dp_pg_res_${reservedOrder.id}`, object: 'dispute', amount: 10000, currency: 'usd', payment_intent: `pi_${reservedOrder.id}`, reason: 'fraudulent', status: 'lost' } },
  } as unknown as Stripe.Event);
  const resDispute = await prisma.marketplaceDispute.findUniqueOrThrow({ where: { orderId: reservedOrder.id } });
  expect(resDispute.recoveryRequired).toBe(true);
  expect(resDispute.status).toBe('UNDER_REVIEW');
  expect((await prisma.order.findUniqueOrThrow({ where: { id: reservedOrder.id } })).status).toBe('DISPUTED');
  await expect(PayoutService.process(admin, reservedPayout.id, provider('PAID'))).rejects.toThrow(/recovery/i);
  const siblingCompleted = await delivered();
  await OrderService.operate(buyer, siblingCompleted.id, 'accept');
  await expect(PayoutService.request(seller, siblingCompleted.id, `payout_pg_sib_${siblingCompleted.id}`)).rejects.toThrow(/recovery/i);
  // Clean up recovery flag on test fixture seller so test database remains clean for any subsequent assertions.
  await prisma.marketplaceDispute.update({ where: { id: resDispute.id }, data: { recoveryRequired: false } });
});
