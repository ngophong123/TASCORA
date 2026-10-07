import Stripe from 'stripe';
import { Prisma, TransactionStatus } from '@prisma/client';
import { z } from 'zod';
import crypto from 'node:crypto';
import { HttpError } from '../../lib/errors';
import { basis, entry, financialTx, lockOrder } from '../financial/domain';
import { cents, assertPaymentAmount } from '../financial/money';
import { assertPaymentsEnabled, paymentProvider } from '../../lib/payment-provider';

export const stripe = new Stripe((paymentProvider() === 'stripe' ? process.env.STRIPE_SECRET_KEY : undefined) || 'sk_test_unconfigured', { maxNetworkRetries: 2, timeout: 10000 });
export const amountInCents = cents;
export function assertProviderConfigured() {
  assertPaymentsEnabled();
  if (!/^(sk|rk)_(test|live)_/.test(process.env.STRIPE_SECRET_KEY || '')) throw new HttpError(503, 'Payments are not configured');
  if ((process.env.NODE_ENV === 'test' || process.env.APP_ENV === 'staging') && !/^(sk|rk)_test_/.test(process.env.STRIPE_SECRET_KEY || '')) throw new HttpError(503, 'Test/staging mode requires test Stripe credentials');
}
const paymentSchema = z.object({
  id: z.string().min(1).max(255), object: z.literal('payment_intent'), amount: z.number().int().positive().safe(),
  amount_received: z.number().int().nonnegative().safe(), currency: z.literal('usd'), status: z.string(),
  metadata: z.object({ orderId: z.string().min(1), buyerId: z.string().min(1), transactionId: z.string().optional() }),
});
export class PaymentService {
  static async createPaymentIntent(buyerId: string, orderId: string): Promise<{ clientSecret: string | null }> {
    assertProviderConfigured();
    const reserved = await financialTx(async tx => {
      await lockOrder(tx, orderId);
      const order = await tx.order.findUnique({ where: { id: orderId }, include: { transactions: { orderBy: { createdAt: 'desc' } } } });
      if (!order || order.buyerId !== buyerId) throw new HttpError(404, 'Order not found');
      if (order.status !== 'PENDING') throw new HttpError(409, 'Order is not awaiting payment');
      basis(order); const amount = cents(order.amount);
      // Stripe USD intents require 50 cents minimum and at most eight digits.
      assertPaymentAmount(amount);
      // Wall-clock ordering can tie or move backwards. A live durable attempt
      // must be reused regardless of newer canceled history.
      const active = order.transactions.filter(attempt => attempt.status !== 'CANCELLED');
      if (active.length > 1) throw new HttpError(409, 'Multiple payment attempts require reconciliation');
      if (active[0]) return { order, transaction: active[0] };
      const transaction = await tx.transaction.create({ data: { orderId, amount: order.amount, currency: order.currency, status: 'PENDING', attemptKey: `payment:${orderId}:${crypto.randomUUID()}` } });
      return { order, transaction };
    }, orderId);
    const { order, transaction } = reserved;
    if (!transaction.stripePaymentId && Date.now() - transaction.createdAt.getTime() > 23 * 3600000) throw new HttpError(409, 'Unbound old payment attempt requires provider reconciliation');
    const payment = transaction.stripePaymentId
      ? await stripe.paymentIntents.retrieve(transaction.stripePaymentId)
      : await stripe.paymentIntents.create({ amount: cents(order.amount), currency: order.currency, metadata: { orderId, buyerId, transactionId: transaction.id }, automatic_payment_methods: { enabled: true } }, { idempotencyKey: transaction.attemptKey! });
    if (payment.amount !== cents(order.amount) || payment.currency !== order.currency || payment.metadata.orderId !== orderId || payment.metadata.buyerId !== buyerId) throw new HttpError(409, 'Payment does not match order');
    await financialTx(async tx => {
      await lockOrder(tx, orderId);
      const current = await tx.transaction.findUniqueOrThrow({ where: { id: transaction.id } });
      if (current.stripePaymentId && current.stripePaymentId !== payment.id) throw new HttpError(409, 'Provider reference mismatch');
      await tx.transaction.update({ where: { id: current.id }, data: { stripePaymentId: payment.id, ...(payment.status === 'canceled' && !['SUCCEEDED', 'PARTIALLY_REFUNDED', 'REFUNDED'].includes(current.status) ? { status: 'CANCELLED' as const } : {}) } });
    }, orderId);
    if (payment.status === 'canceled') return this.createPaymentIntent(buyerId, orderId);
    if (payment.status === 'succeeded') throw new HttpError(409, 'Payment confirmation pending; refresh order');
    return { clientSecret: payment.client_secret };
  }

  static async handleWebhookEvent(event: Stripe.Event) {
    assertPaymentsEnabled();
    if (!event.id || !event.data?.object || !event.type) throw new HttpError(400, 'Malformed webhook event');
    if (['refund.created', 'refund.updated', 'refund.failed'].includes(event.type)) {
      const { RefundService } = await import('../financial/refund.service');
      await RefundService.handleEvent(event); return;
    }
    if (!['payment_intent.succeeded', 'payment_intent.payment_failed', 'payment_intent.canceled', 'payment_intent.processing'].includes(event.type)) return;
    const parsed = paymentSchema.safeParse(event.data.object);
    if (!parsed.success) throw new HttpError(400, 'Malformed payment event');
    const payment = parsed.data;
    const payloadHash = crypto.createHash('sha256').update(JSON.stringify(event.data.object)).digest('hex');
    await financialTx(async tx => {
      await lockOrder(tx, payment.metadata.orderId);
      const seen = await tx.providerEvent.findUnique({ where: { id: event.id } });
      if (seen) { if (seen.payloadHash !== payloadHash || seen.type !== event.type) throw new HttpError(400, 'Event ID payload mismatch'); return; }
      const transaction = await tx.transaction.findFirst({ where: { OR: [{ stripePaymentId: payment.id }, ...(payment.metadata.transactionId ? [{ id: payment.metadata.transactionId }] : [])] }, include: { order: { include: { seller: { select: { userId: true } }, escrow: true } } } });
      if (!transaction) throw new HttpError(409, 'Payment record not available');
      const order = transaction.order, expected = cents(order.amount);
      if (order.id !== payment.metadata.orderId || order.buyerId !== payment.metadata.buyerId || expected !== payment.amount || cents(transaction.amount) !== expected || transaction.currency !== payment.currency || (transaction.stripePaymentId && transaction.stripePaymentId !== payment.id)) throw new HttpError(400, 'Payment amount, currency, or ownership mismatch');
      const settled = ['SUCCEEDED', 'PARTIALLY_REFUNDED', 'REFUNDED'].includes(transaction.status);
      if (event.type === 'payment_intent.succeeded') {
        if (payment.status !== 'succeeded' || payment.amount_received !== expected) throw new HttpError(400, 'Payment is not fully settled');
        if (!settled) {
          basis(order);
          if (order.status !== 'PENDING' || order.escrow) throw new HttpError(409, 'Order cannot accept this payment; reconciliation required');
          const split = basis(order);
          await tx.transaction.update({ where: { id: transaction.id }, data: { status: 'SUCCEEDED', stripePaymentId: payment.id } });
          await tx.escrow.create({ data: { orderId: order.id, transactionId: transaction.id, amount: order.amount } });
          await entry(tx, order.id, 'PAYMENT_RECEIVED', `payment:${transaction.id}:received`, null, { amount: expected, pending: split.earning, fee: split.fee, transactionId: transaction.id, providerId: payment.id, notifyUserId: order.seller.userId });
          const snapshot = order.purchaseSnapshot as Prisma.JsonObject;
          const days = snapshot.deliveryDays;
          if (typeof days !== 'number' || !Number.isInteger(days) || days < 1) throw new HttpError(409, 'Invalid purchase snapshot');
          await tx.order.update({ where: { id: order.id }, data: { status: 'PAID', deliveryDate: new Date(Date.now() + days * 86400000), activities: { create: { type: 'PAYMENT_RECEIVED', description: 'Verified payment confirmed; earnings pending completion' } } } });
        }
      } else if (!settled && transaction.status !== 'CANCELLED') {
        if (event.type === 'payment_intent.canceled' && payment.status !== 'canceled') throw new HttpError(400, 'Invalid canceled payment event');
        if (event.type === 'payment_intent.processing' && payment.status !== 'processing') throw new HttpError(400, 'Invalid processing payment event');
        if (event.type === 'payment_intent.payment_failed' && !['requires_payment_method', 'requires_action'].includes(payment.status)) throw new HttpError(400, 'Invalid failed payment event');
        const status: TransactionStatus = event.type.endsWith('canceled') ? 'CANCELLED' : event.type.endsWith('processing') ? 'PROCESSING' : 'FAILED';
        await tx.transaction.update({ where: { id: transaction.id }, data: { status, stripePaymentId: payment.id } });
        await entry(tx, order.id, `PAYMENT_${status}`, `event:${event.id}`, null, { transactionId: transaction.id, providerId: payment.id, notifyUserId: order.buyerId });
      }
      await tx.providerEvent.create({ data: { id: event.id, type: event.type, objectId: payment.id, payloadHash } });
    }, payment.metadata.orderId);
  }
  static async cancelPayment(buyerId: string, orderId: string) {
    assertProviderConfigured();
    const payment = await financialTx(async tx => {
      await lockOrder(tx, orderId);
      const order = await tx.order.findUnique({ where: { id: orderId }, include: { transactions: { orderBy: { createdAt: 'desc' } } } });
      if (!order || order.buyerId !== buyerId) throw new HttpError(404, 'Order not found');
      if (order.status === 'CANCELLED') return null;
      if (order.status !== 'PENDING') throw new HttpError(409, 'Only unpaid payments can be cancelled');
      const active = order.transactions.filter(attempt => attempt.status !== 'CANCELLED');
      if (active.length > 1) throw new HttpError(409, 'Multiple payment attempts require reconciliation');
      const latest = active[0] || order.transactions[0]; if (!latest?.stripePaymentId) throw new HttpError(409, 'Payment attempt must be reconciled before cancellation');
      return latest;
    });
    if (!payment) return financialTx(async tx => {
      await lockOrder(tx, orderId);
      return tx.order.findUniqueOrThrow({ where: { id: orderId } });
    });
    const remote = await stripe.paymentIntents.retrieve(payment.stripePaymentId!);
    const canceled = remote.status === 'canceled' ? remote : await stripe.paymentIntents.cancel(payment.stripePaymentId!, {}, { idempotencyKey: `cancel:${payment.id}` });
    if (canceled.id !== payment.stripePaymentId || canceled.status !== 'canceled' || canceled.amount !== cents(payment.amount) || canceled.currency !== payment.currency || canceled.metadata.orderId !== orderId || canceled.metadata.buyerId !== buyerId) throw new HttpError(409, 'Provider did not confirm matching cancellation');
    return financialTx(async tx => {
      await lockOrder(tx, orderId);
      const order = await tx.order.findUniqueOrThrow({ where: { id: orderId } });
      if (order.status === 'CANCELLED') return order;
      if (order.status !== 'PENDING') throw new HttpError(409, 'Payment/order reconciliation required');
      const otherActive = await tx.transaction.count({ where: { orderId, id: { not: payment.id }, status: { not: 'CANCELLED' } } });
      if (otherActive) throw new HttpError(409, 'New payment attempt requires reconciliation before cancellation');
      await tx.transaction.update({ where: { id: payment.id }, data: { status: 'CANCELLED' } });
      await entry(tx, orderId, 'PAYMENT_CANCELLED', `payment:${payment.id}:cancelled`, buyerId, { transactionId: payment.id });
      return tx.order.update({ where: { id: orderId }, data: { status: 'CANCELLED', activities: { create: { type: 'STATUS_UPDATE', description: 'Provider-confirmed unpaid payment cancellation' } } } });
    }, orderId);
  }
}
