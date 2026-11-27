import Stripe from 'stripe';
import { Prisma, TransactionStatus } from '@prisma/client';
import { z } from 'zod';
import crypto from 'node:crypto';
import { HttpError } from '../../lib/errors';
import { basis, entry, financialTx, isDefiniteStripeRejection, lockOrder } from '../financial/domain';
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
function isLivePaymentAttempt(attempt: { status: TransactionStatus; stripePaymentId: string | null }): boolean {
  if (attempt.status === 'CANCELLED') return false;
  if (attempt.status === 'FAILED' && !attempt.stripePaymentId) return false;
  return true;
}

const MAX_RECOVERY_LIST_PAGES = 5;

async function findRemotePaymentIntentByTransactionId(
  transactionId: string,
  orderId: string,
  createdAt: Date
): Promise<{ found: Stripe.PaymentIntent | null; scanComplete: boolean }> {
  let startingAfter: string | undefined;
  const gte = Math.max(0, Math.floor(createdAt.getTime() / 1000) - 300);
  for (let page = 0; page < MAX_RECOVERY_LIST_PAGES; page++) {
    const list = await stripe.paymentIntents.list({
      limit: 100,
      created: { gte },
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });
    const matched = list.data.find(
      pi => pi.metadata?.transactionId === transactionId && pi.metadata?.orderId === orderId
    );
    if (matched) return { found: matched, scanComplete: true };
    if (!list.has_more || list.data.length === 0) return { found: null, scanComplete: true };
    startingAfter = list.data[list.data.length - 1]!.id;
  }
  return { found: null, scanComplete: false };
}

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
      // must be reused regardless of newer canceled or unbound failed history.
      const active = order.transactions.filter(isLivePaymentAttempt);
      if (active.length > 1) throw new HttpError(409, 'Multiple payment attempts require reconciliation');
      if (active[0]) return { order, transaction: active[0] };
      const transaction = await tx.transaction.create({ data: { orderId, amount: order.amount, currency: order.currency, status: 'PENDING', attemptKey: `payment:${orderId}:${crypto.randomUUID()}` } });
      return { order, transaction };
    }, orderId);
    const { order, transaction } = reserved;
    if (!transaction.stripePaymentId && Date.now() - transaction.createdAt.getTime() > 23 * 3600000) {
      let recovery: { found: Stripe.PaymentIntent | null; scanComplete: boolean };
      try {
        recovery = await findRemotePaymentIntentByTransactionId(transaction.id, orderId, transaction.createdAt);
      } catch {
        throw new HttpError(409, 'Unbound old payment attempt requires provider reconciliation');
      }
      if (recovery.found) {
        const recovered = recovery.found;
        if (recovered.amount !== cents(order.amount) || recovered.currency !== order.currency || recovered.metadata.orderId !== orderId || recovered.metadata.buyerId !== buyerId) {
          throw new HttpError(409, 'Payment does not match order');
        }
        await financialTx(async tx => {
          await lockOrder(tx, orderId);
          const current = await tx.transaction.findUniqueOrThrow({ where: { id: transaction.id } });
          if (current.stripePaymentId && current.stripePaymentId !== recovered.id) throw new HttpError(409, 'Provider reference mismatch');
          await tx.transaction.update({
            where: { id: current.id },
            data: {
              stripePaymentId: recovered.id,
              ...(recovered.status === 'canceled' && !['SUCCEEDED', 'PARTIALLY_REFUNDED', 'REFUNDED'].includes(current.status) ? { status: 'CANCELLED' as const } : {}),
            },
          });
        }, orderId);
        if (recovered.status === 'canceled') return this.createPaymentIntent(buyerId, orderId);
        if (recovered.status === 'succeeded') throw new HttpError(409, 'Payment confirmation pending; refresh order');
        return { clientSecret: recovered.client_secret };
      }
      if (!recovery.scanComplete) {
        throw new HttpError(409, 'Unbound old payment attempt requires provider reconciliation');
      }
      await financialTx(async tx => {
        await lockOrder(tx, orderId);
        const current = await tx.transaction.findUnique({ where: { id: transaction.id } });
        if (current && !current.stripePaymentId && current.status === 'PENDING') {
          await tx.transaction.update({ where: { id: current.id }, data: { status: 'FAILED' } });
          await entry(tx, orderId, 'PAYMENT_ATTEMPT_ABANDONED', `payment:${current.id}:abandoned`, buyerId, {
            transactionId: current.id,
            reason: 'Abandoned unbound payment attempt confirmed absent at provider',
          });
        }
      }, orderId);
      return this.createPaymentIntent(buyerId, orderId);
    }
    let payment: Stripe.PaymentIntent;
    if (transaction.stripePaymentId) {
      payment = await stripe.paymentIntents.retrieve(transaction.stripePaymentId);
    } else {
      try {
        payment = await stripe.paymentIntents.create(
          { amount: cents(order.amount), currency: order.currency, metadata: { orderId, buyerId, transactionId: transaction.id }, automatic_payment_methods: { enabled: true } },
          { idempotencyKey: transaction.attemptKey! }
        );
      } catch (error) {
        if (isDefiniteStripeRejection(error)) {
          await financialTx(async tx => {
            await lockOrder(tx, orderId);
            const current = await tx.transaction.findUnique({ where: { id: transaction.id } });
            if (current && !current.stripePaymentId && current.status === 'PENDING') {
              await tx.transaction.update({ where: { id: current.id }, data: { status: 'FAILED' } });
              await entry(tx, orderId, 'PAYMENT_INTENT_CREATION_FAILED', `payment:${current.id}:creation-failed`, buyerId, {
                transactionId: current.id,
                reason: error instanceof Error ? error.message.slice(0, 500) : 'Stripe rejected PaymentIntent creation',
              });
            }
          }, orderId);
        }
        throw error;
      }
    }
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
    if (['charge.dispute.created', 'charge.dispute.updated', 'charge.dispute.closed'].includes(event.type)) {
      const { DisputeService } = await import('../financial/dispute.service');
      await DisputeService.handleProviderDisputeEvent(event); return;
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
    const state = await financialTx(async tx => {
      await lockOrder(tx, orderId);
      const order = await tx.order.findUnique({ where: { id: orderId }, include: { seller: { select: { userId: true } }, transactions: { orderBy: { createdAt: 'desc' } } } });
      if (!order || order.buyerId !== buyerId) throw new HttpError(404, 'Order not found');
      if (order.status === 'CANCELLED') return { cancelledOrder: order, payment: null };
      if (order.status !== 'PENDING') throw new HttpError(409, 'Only unpaid payments can be cancelled');
      const active = order.transactions.filter(isLivePaymentAttempt);
      if (active.length > 1) throw new HttpError(409, 'Multiple payment attempts require reconciliation');
      if (active.length === 0) {
        const failedUnbound = order.transactions.filter(attempt => attempt.status === 'FAILED' && !attempt.stripePaymentId);
        if (failedUnbound.length > 0) {
          await tx.transaction.updateMany({ where: { orderId, status: 'FAILED', stripePaymentId: null }, data: { status: 'CANCELLED' } });
          await entry(tx, orderId, 'ORDER_CANCELLED', `order:${orderId}:cancelled`, buyerId, {
            transactionId: failedUnbound[0]!.id,
            reason: 'Buyer cancelled order after failed PaymentIntent creation',
            notifyUserId: order.seller.userId,
          });
          const cancelledOrder = await tx.order.update({ where: { id: orderId }, data: { status: 'CANCELLED', activities: { create: { type: 'STATUS_UPDATE', description: 'Buyer cancelled order after failed payment initialization' } } } });
          return { cancelledOrder, payment: null };
        }
        const latest = order.transactions[0];
        if (!latest?.stripePaymentId) throw new HttpError(409, 'Payment attempt must be reconciled before cancellation');
        return { cancelledOrder: null, payment: latest };
      }
      return { cancelledOrder: null, payment: active[0]! };
    }, orderId);
    if (state.cancelledOrder) return state.cancelledOrder;
    const payment = state.payment!;
    let stripePaymentId = payment.stripePaymentId;
    if (!stripePaymentId) {
      let recovery: { found: Stripe.PaymentIntent | null; scanComplete: boolean };
      try {
        recovery = await findRemotePaymentIntentByTransactionId(payment.id, orderId, payment.createdAt);
      } catch {
        throw new HttpError(409, 'Payment attempt must be reconciled before cancellation');
      }
      if (!recovery.found) {
        if (!recovery.scanComplete) throw new HttpError(409, 'Payment attempt must be reconciled before cancellation');
        return financialTx(async tx => {
          await lockOrder(tx, orderId);
          const order = await tx.order.findUniqueOrThrow({ where: { id: orderId }, include: { seller: { select: { userId: true } } } });
          if (order.status === 'CANCELLED') return order;
          if (order.status !== 'PENDING') throw new HttpError(409, 'Payment/order reconciliation required');
          const current = await tx.transaction.findUniqueOrThrow({ where: { id: payment.id } });
          if (current.stripePaymentId) throw new HttpError(409, 'Payment bound concurrently; retry cancellation');
          const otherActive = await tx.transaction.count({
            where: {
              orderId,
              id: { not: payment.id },
              OR: [
                { status: { notIn: ['CANCELLED', 'FAILED'] } },
                { status: 'FAILED', stripePaymentId: { not: null } },
              ],
            },
          });
          if (otherActive) throw new HttpError(409, 'New payment attempt requires reconciliation before cancellation');
          await tx.transaction.update({ where: { id: payment.id }, data: { status: 'CANCELLED' } });
          await entry(tx, orderId, 'PAYMENT_ABANDONED_CANCELLED', `payment:${payment.id}:abandoned-cancelled`, buyerId, {
            transactionId: payment.id,
            reason: 'Abandoned unbound payment attempt confirmed absent at provider and cancelled',
            notifyUserId: order.seller.userId,
          });
          return tx.order.update({ where: { id: orderId }, data: { status: 'CANCELLED', activities: { create: { type: 'STATUS_UPDATE', description: 'Cancelled order after verifying abandoned payment attempt did not exist at provider' } } } });
        }, orderId);
      }
      stripePaymentId = recovery.found.id;
    }
    const remote = await stripe.paymentIntents.retrieve(stripePaymentId);
    const canceled = remote.status === 'canceled' ? remote : await stripe.paymentIntents.cancel(stripePaymentId, {}, { idempotencyKey: `cancel:${payment.id}` });
    if (canceled.id !== stripePaymentId || canceled.status !== 'canceled' || canceled.amount !== cents(payment.amount) || canceled.currency !== payment.currency || canceled.metadata.orderId !== orderId || canceled.metadata.buyerId !== buyerId) throw new HttpError(409, 'Provider did not confirm matching cancellation');
    return financialTx(async tx => {
      await lockOrder(tx, orderId);
      const order = await tx.order.findUniqueOrThrow({ where: { id: orderId } });
      if (order.status === 'CANCELLED') return order;
      if (order.status !== 'PENDING') throw new HttpError(409, 'Payment/order reconciliation required');
      const otherActive = await tx.transaction.count({
        where: {
          orderId,
          id: { not: payment.id },
          OR: [
            { status: { notIn: ['CANCELLED', 'FAILED'] } },
            { status: 'FAILED', stripePaymentId: { not: null } },
          ],
        },
      });
      if (otherActive) throw new HttpError(409, 'New payment attempt requires reconciliation before cancellation');
      await tx.transaction.update({ where: { id: payment.id }, data: { status: 'CANCELLED', stripePaymentId } });
      await entry(tx, orderId, 'PAYMENT_CANCELLED', `payment:${payment.id}:cancelled`, buyerId, { transactionId: payment.id, providerId: stripePaymentId });
      return tx.order.update({ where: { id: orderId }, data: { status: 'CANCELLED', activities: { create: { type: 'STATUS_UPDATE', description: 'Provider-confirmed unpaid payment cancellation' } } } });
    }, orderId);
  }
}
