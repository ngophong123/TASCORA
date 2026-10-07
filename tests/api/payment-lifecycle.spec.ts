import https from 'node:https';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Prisma } from '@prisma/client';
import type Stripe from 'stripe';
import request from 'supertest';
import express from 'express';

const state = vi.hoisted(() => ({
  order: { currency: 'usd', platformFeeBps: 1000, purchaseSnapshot: { deliveryDays: 1 }, seller: { userId: 'seller' }, escrow: null, id: 'order', buyerId: 'buyer', status: 'PENDING', amount: '10.25', transactions: [] as { id: string; stripePaymentId: string }[] },
  events: new Map<string, Record<string, unknown>>(), ledger: vi.fn(),
  transaction: { attemptKey: 'payment:order:attempt-fixture', createdAt: new Date(), id: 'transaction', orderId: 'order', stripePaymentId: 'pi_mock', amount: '10.25', currency: 'usd', status: 'PENDING' },
  escrow: vi.fn(), updateOrder: vi.fn(), createIntent: vi.fn(), retrieveIntent: vi.fn(), upsert: vi.fn(),
}));
vi.mock('../../apps/api/src/lib/prisma', () => {
  const transaction = () => ({ ...state.transaction, amount: new Prisma.Decimal(state.transaction.amount) });
  const client = {
    $queryRaw: vi.fn(),
    providerEvent: { findUnique: async ({ where }: { where: { id: string } }) => state.events.get(where.id), create: async ({ data }: { data: Record<string, unknown> & { id: string } }) => { state.events.set(data.id, data); return data; } },
    financialEntry: { create: state.ledger, findMany: async () => [] },
    order: {
      findUnique: async () => ({ ...state.order, transactions: state.order.transactions.map(record => ({ ...record, status: state.transaction.status })), amount: new Prisma.Decimal(state.order.amount) }),
      update: state.updateOrder.mockImplementation(async () => { state.order.status = 'PAID'; }),
    },
    transaction: {
      create: async () => { state.transaction.status = 'PENDING'; return { ...transaction(), stripePaymentId: null }; },
      findUniqueOrThrow: async () => transaction(),
      findFirst: async () => ({ ...transaction(), order: { ...state.order, amount: new Prisma.Decimal(state.order.amount) } }),
      findUnique: async () => ({ ...state.transaction, amount: new Prisma.Decimal(state.transaction.amount), order: { ...state.order, amount: new Prisma.Decimal(state.order.amount) } }),
      update: async ({ data }: { data: { status?: string } }) => { if (data.status) state.transaction.status = data.status; },
      upsert: state.upsert,
    },
    escrow: { create: state.escrow },
  };
  return { prisma: { $transaction: async (fn: (tx: typeof client) => Promise<unknown>) => fn(client) } };
});
import { PaymentService } from '../../apps/api/src/modules/payment/payment.service';
import { handleWebhook } from '../../apps/api/src/modules/payment/payment.controller';
import { stripe } from '../../apps/api/src/modules/payment/payment.service';

function event(type = 'payment_intent.succeeded', fields: Record<string, unknown> = {}): Stripe.Event {
  return { id: `evt_${type}_${JSON.stringify(fields)}`, object: 'event', type, livemode: false, data: { object: {
    id: 'pi_mock', object: 'payment_intent', amount: 1025, amount_received: 1025, currency: 'usd', status: 'succeeded', metadata: { orderId: 'order', buyerId: 'buyer' }, ...fields,
  } } } as Stripe.Event;
}
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });
beforeEach(() => {
  vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_mock');
  vi.spyOn(https, 'request').mockImplementation(() => { throw new Error('Outbound HTTPS is forbidden in payment tests'); });
  vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Outbound fetch is forbidden in payment tests'));
  vi.spyOn(stripe.paymentIntents, 'create').mockImplementation(state.createIntent);
  vi.spyOn(stripe.paymentIntents, 'retrieve').mockImplementation(state.retrieveIntent);
  state.order.status = 'PENDING'; state.order.transactions = []; state.transaction.status = 'PENDING';
  state.events.clear(); state.ledger.mockClear(); state.escrow.mockClear(); state.updateOrder.mockClear(); state.upsert.mockClear();
  state.createIntent.mockReset().mockResolvedValue({ id: 'pi_mock', amount: 1025, currency: 'usd', metadata: { orderId: 'order', buyerId: 'buyer' }, status: 'requires_payment_method', client_secret: 'test-only-client-secret' });
  state.retrieveIntent.mockReset();
});

describe('Stripe lifecycle: mocked provider and isolated persistence', () => {
  it('rejects live credentials in staging before provider or financial writes', async () => {
    vi.stubEnv('APP_ENV', 'staging');
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_live_fixture');
    await expect(PaymentService.createPaymentIntent('buyer', 'order')).rejects.toThrow('requires test Stripe credentials');
    expect(state.createIntent).not.toHaveBeenCalled();
    expect(state.ledger).not.toHaveBeenCalled();
  });
  it('creates server-priced payments with a stable idempotency key', async () => {
    await PaymentService.createPaymentIntent('buyer', 'order');
    expect(state.createIntent).toHaveBeenCalledWith(expect.objectContaining({ amount: 1025, currency: 'usd', metadata: { orderId: 'order', buyerId: 'buyer', transactionId: 'transaction' } }), { idempotencyKey: 'payment:order:attempt-fixture' });
  });
  it('creates a new idempotent attempt only after the previous payment is canceled', async () => {
    state.order.transactions = [{ ...state.transaction }];
    state.retrieveIntent.mockResolvedValue({ id: 'pi_mock', amount: 1025, currency: 'usd', metadata: { orderId: 'order', buyerId: 'buyer' }, status: 'canceled' });
    await PaymentService.createPaymentIntent('buyer', 'order');
    expect(state.createIntent.mock.calls[0]![1]).toEqual({ idempotencyKey: 'payment:order:attempt-fixture' });
  });
  it('rejects malformed payment event data without updating state', async () => {
    await expect(PaymentService.handleWebhookEvent(event('payment_intent.succeeded', { amount: 'invalid' }))).rejects.toThrow('Malformed');
    expect(state.updateOrder).not.toHaveBeenCalled();
  });
  it('rejects another buyer without contacting Stripe', async () => {
    await expect(PaymentService.createPaymentIntent('attacker', 'order')).rejects.toThrow('Order not found');
    expect(state.createIntent).not.toHaveBeenCalled();
  });
  it('reuses an existing non-canceled payment instead of creating a second charge', async () => {
    state.order.transactions = [{ id: 'transaction', stripePaymentId: 'pi_mock' }];
    state.retrieveIntent.mockResolvedValue({ id: 'pi_mock', amount: 1025, currency: 'usd', metadata: { orderId: 'order', buyerId: 'buyer' }, status: 'requires_payment_method', client_secret: 'existing' });
    expect(await PaymentService.createPaymentIntent('buyer', 'order')).toEqual({ clientSecret: 'existing' });
    expect(state.createIntent).not.toHaveBeenCalled();
  });
  it('handles duplicate success and replayed failure without double escrow or state downgrade', async () => {
    await PaymentService.handleWebhookEvent(event());
    await PaymentService.handleWebhookEvent(event());
    await PaymentService.handleWebhookEvent(event('payment_intent.payment_failed', { status: 'requires_payment_method', amount_received: 0 }));
    expect(state.transaction.status).toBe('SUCCEEDED'); expect(state.order.status).toBe('PAID');
    expect(state.escrow).toHaveBeenCalledTimes(1); expect(state.updateOrder).toHaveBeenCalledTimes(1);
  });
  it.each([
    { amount: 1024 }, { amount_received: 1024 }, { currency: 'eur' },
    { metadata: { orderId: 'other', buyerId: 'buyer' } }, { metadata: { orderId: 'order', buyerId: 'attacker' } }, { status: 'processing' },
  ])('rejects mismatched settlement or ownership: %j', async fields => {
    await expect(PaymentService.handleWebhookEvent(event('payment_intent.succeeded', fields))).rejects.toThrow();
    expect(state.escrow).not.toHaveBeenCalled(); expect(state.updateOrder).not.toHaveBeenCalled();
  });
  it.each(['payment_intent.payment_failed', 'payment_intent.canceled'])('handles %s without marking the order paid', async type => {
    await PaymentService.handleWebhookEvent(event(type, { status: type.endsWith('canceled') ? 'canceled' : 'requires_payment_method', amount_received: 0 }));
    expect(state.transaction.status).toBe(type.endsWith('canceled') ? 'CANCELLED' : 'FAILED'); expect(state.order.status).toBe('PENDING');
  });
  it('does not apply a successful charge to a canceled order', async () => {
    state.order.status = 'CANCELLED';
    await expect(PaymentService.handleWebhookEvent(event())).rejects.toThrow('reconciliation');
    expect(state.escrow).not.toHaveBeenCalled();
  });
  it('rejects unsigned and malformed webhooks and accepts signed mock payloads', async () => {
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'test-only-webhook-signing-secret');
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_mock');
    const app = express(); app.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);
    expect((await request(app).post('/webhook').set('Content-Type', 'application/json').send('{}')).status).toBe(400);
    const body = JSON.stringify(event());
    const signature = stripe.constructor as unknown as { webhooks: { generateTestHeaderString: (options: { payload: string; secret: string }) => string } };
    const header = signature.webhooks.generateTestHeaderString({ payload: body, secret: 'test-only-webhook-signing-secret' });
    const response = await request(app).post('/webhook').set('Content-Type', 'application/json').set('Stripe-Signature', header).send(body);
    expect(response.status).toBe(200);
    expect((await request(app).post('/webhook').set('Content-Type', 'application/json').set('Stripe-Signature', 'invalid').send('{broken')).status).toBe(400);
    vi.unstubAllEnvs();
  });
  it('rejects a correctly signed live event in staging even with a misconfigured live key', async () => {
    vi.stubEnv('APP_ENV', 'staging');
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_live_fixture');
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'test-only-webhook-signing-secret');
    const body = JSON.stringify({ ...event(), livemode: true });
    const header = StripeHeader(body);
    const app = express(); app.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);
    expect((await request(app).post('/webhook').set('Content-Type', 'application/json').set('Stripe-Signature', header).send(body)).status).toBe(400);
    expect(state.ledger).not.toHaveBeenCalled();
    expect(state.updateOrder).not.toHaveBeenCalled();
  });
});

function StripeHeader(payload: string): string {
  const constructor = stripe.constructor as unknown as { webhooks: { generateTestHeaderString: (options: { payload: string; secret: string }) => string } };
  return constructor.webhooks.generateTestHeaderString({ payload, secret: 'test-only-webhook-signing-secret' });
}
