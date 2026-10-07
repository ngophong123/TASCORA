import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import express from 'express';
import request from 'supertest';

const state = vi.hoisted(() => ({
  financial: { order: 'PENDING', paymentId: null, refundId: null, payoutId: null, ledger: [] },
  transaction: vi.fn(() => { throw new Error('No financial transaction may start'); }),
  user: vi.fn(async ({ where }: { where: { id: string } }) => ({ role: where.id === 'admin' ? 'ADMIN' : 'BUYER', status: 'ACTIVE' })),
}));
vi.mock('../../apps/api/src/lib/prisma', () => ({ prisma: { $transaction: state.transaction, user: { findUnique: state.user } } }));
vi.mock('../../apps/api/src/lib/socket', () => ({ getIO: vi.fn() }));
vi.mock('../../apps/api/src/middlewares/requireAuth', () => ({ requireAuth: (req: express.Request & { user?: { userId: string; role: string } }, res: express.Response, next: express.NextFunction) => {
  const id = req.headers.authorization?.replace('Bearer ', '');
  if (!id) { res.status(401).json({ success: false }); return; }
  req.user = { userId: id, role: id === 'admin' ? 'ADMIN' : 'BUYER' }; next();
} }));
import payments from '../../apps/api/src/modules/payment/payment.route';
import financial from '../../apps/api/src/modules/financial/financial.route';
import { handleWebhook } from '../../apps/api/src/modules/payment/payment.controller';
import { PaymentService, stripe } from '../../apps/api/src/modules/payment/payment.service';
import { RefundService } from '../../apps/api/src/modules/financial/refund.service';
import { PayoutService } from '../../apps/api/src/modules/financial/payout.service';
import { DisputeService } from '../../apps/api/src/modules/financial/dispute.service';
import { healthRouter } from '../../apps/api/src/lib/health';

const id = 'c000000000000000000000001';
const app = express();
app.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);
app.use(express.json()); app.use('/payments', payments); app.use('/financial', financial);
app.use((err: Error & { status?: number; code?: string }, _req: express.Request, res: express.Response, _next: express.NextFunction) => { res.status(err.status || 500).json({ success: false, error: { code: err.code, message: err.message } }); });
beforeEach(() => { vi.clearAllMocks(); vi.stubEnv('PAYMENTS_PROVIDER', 'disabled'); });
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

it('rejects payment creation, cancellation and direct event processing before any financial transaction/provider call', async () => {
  const create = vi.spyOn(stripe.paymentIntents, 'create');
  const retrieve = vi.spyOn(stripe.paymentIntents, 'retrieve');
  const before = structuredClone(state.financial);
  const response = await request(app).post('/payments/create-intent').set('Authorization', 'Bearer buyer').send({ orderId: id });
  expect(response.status).toBe(503); expect(response.body.error.code).toBe('PAYMENT_PROVIDER_UNAVAILABLE');
  await expect(PaymentService.cancelPayment('buyer', id)).rejects.toMatchObject({ status: 503, code: 'PAYMENT_PROVIDER_UNAVAILABLE' });
  await expect(PaymentService.handleWebhookEvent({} as Parameters<typeof PaymentService.handleWebhookEvent>[0])).rejects.toMatchObject({ status: 503 });
  expect(create).not.toHaveBeenCalled(); expect(retrieve).not.toHaveBeenCalled(); expect(state.transaction).not.toHaveBeenCalled();
  expect(state.financial).toEqual(before);
});
it('refund requests/processing and payout requests/processing create no reservations or provider IDs', async () => {
  const refund = vi.spyOn(stripe.refunds, 'create');
  const before = structuredClone(state.financial);
  for (const operation of [
    () => RefundService.request('buyer', id, undefined, 'Refund request', 'disabled_refund_key'),
    () => RefundService.process('admin', id),
    () => RefundService.handleEvent({} as Parameters<typeof RefundService.handleEvent>[0]),
    () => PayoutService.request('seller', id, 'disabled_payout_key'),
    () => PayoutService.process('admin', id),
    () => DisputeService.resolve('admin', id, 'BUYER', 'Buyer refund resolution'),
  ]) await expect(operation()).rejects.toMatchObject({ status: 503, code: 'PAYMENT_PROVIDER_UNAVAILABLE' });
  expect(refund).not.toHaveBeenCalled(); expect(state.transaction).not.toHaveBeenCalled(); expect(state.financial).toEqual(before);
});
it('webhooks return unavailable for unsigned and locally signed events without mutating state', async () => {
  const before = structuredClone(state.financial);
  const body = '{"id":"fixture-event","type":"payment_intent.succeeded"}';
  const secret = 'fixture-only-signing-secret';
  vi.stubEnv('STRIPE_WEBHOOK_SECRET', secret);
  const constructor = stripe.constructor as unknown as { webhooks: { generateTestHeaderString: (options: { payload: string; secret: string }) => string } };
  for (const signature of ['', constructor.webhooks.generateTestHeaderString({ payload: body, secret })]) {
    const response = await request(app).post('/webhook').set('Content-Type', 'application/json').set('Stripe-Signature', signature).send(body);
    expect(response.status).toBe(503); expect(response.body.error.code).toBe('PAYMENT_PROVIDER_UNAVAILABLE');
  }
  expect(state.transaction).not.toHaveBeenCalled(); expect(state.financial).toEqual(before);
});
it('retains authentication/admin gates and blocks provider reconciliation without financial writes', async () => {
  expect((await request(app).post('/payments/create-intent').send({ orderId: id })).status).toBe(401);
  expect((await request(app).get(`/financial/admin/orders/${id}/reconciliation`).set('Authorization', 'Bearer buyer')).status).toBe(403);
  const response = await request(app).get(`/financial/admin/orders/${id}/reconciliation`).set('Authorization', 'Bearer admin');
  expect(response.status).toBe(503); expect(response.body.error.code).toBe('PAYMENT_PROVIDER_UNAVAILABLE');
  await expect(RefundService.process('buyer', id)).rejects.toMatchObject({ status: 403 });
  expect(state.transaction).not.toHaveBeenCalled();
});
it('public capability and healthy dependencies report disabled payments, with separate liveness', async () => {
  const database = vi.fn(async () => 1), redis = vi.fn(async () => 'PONG');
  const health = express(); health.use(healthRouter({ database, redis }));
  const response = await request(health).get('/health');
  expect(response.status).toBe(200);
  expect(response.body).toEqual({ status: 'ok', db: 'ok', redis: 'ok', payments: { provider: 'disabled', status: 'disabled', available: false, providerValidated: false, externalPayoutsAvailable: false } });
  expect(database).toHaveBeenCalledOnce(); expect(redis).toHaveBeenCalledOnce();
  expect((await request(app).get('/payments/capabilities')).body.data).toEqual(response.body.payments);
  database.mockRejectedValue(new Error('Private connection details'));
  const failed = await request(health).get('/health');
  expect(failed.status).toBe(503); expect(JSON.stringify(failed.body)).not.toContain('Private');
  expect((await request(health).get('/health/live')).status).toBe(200);
  database.mockResolvedValue(1); redis.mockRejectedValue(new Error('Private Redis details'));
  const redisFailure = await request(health).get('/health');
  expect(redisFailure.status).toBe(503); expect(JSON.stringify(redisFailure.body)).not.toContain('Private');
});
