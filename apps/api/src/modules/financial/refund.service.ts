import type Stripe from 'stripe';
import crypto from 'node:crypto';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { HttpError } from '../../lib/errors';
import { stripe, assertProviderConfigured } from '../payment/payment.service';
import { OrderService } from '../order/order.service';
import { basis, balances, entry, financialTx, requestKey, reasonSchema, type Tx } from './domain';
import { cents, money, split } from './money';

const providerRefund = z.object({ id: z.string().min(1), object: z.literal('refund'), amount: z.number().int().positive().safe(), currency: z.literal('usd'), payment_intent: z.string().min(1), status: z.enum(['pending', 'requires_action', 'succeeded', 'failed', 'canceled']), metadata: z.object({ refundId: z.string().min(1), orderId: z.string().min(1) }) });
export async function requireFinancialAdmin(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true, status: true } });
  if (user?.role !== 'ADMIN' || user.status !== 'ACTIVE') throw new HttpError(403, 'Administrator access required');
}
export class RefundService {
  static async request(userId: string, orderId: string, amount: string | undefined, reason: string, key: string) {
    requestKey.parse(key); reasonSchema.parse(reason); const minor = amount === undefined ? null : cents(amount);
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true, status: true } });
    const admin = user?.role === 'ADMIN' && user.status === 'ACTIVE';
    if (admin && minor === null) throw new HttpError(400, 'Administrator refund amount is required');
    return financialTx(tx => this.reserve(tx, userId, orderId, minor, reason, key, admin), orderId);
  }
  static async reserve(tx: Tx, actor: string, orderId: string, minor: number | null, reason: string, key: string, admin: boolean) {
    const order = await OrderService.load(tx, orderId);
    if (!admin && order.buyerId !== actor) throw new HttpError(404, 'Order not found');
    const prior = await tx.refund.findUnique({ where: { orderId_requestKey: { orderId, requestKey: key } } });
    if (prior) { if ((minor !== null && cents(prior.amount) !== minor) || prior.actorId !== actor || prior.reason !== reason) throw new HttpError(409, 'Refund idempotency key reused'); return prior; }
    basis(order);
    if (!order.escrow || order.status === 'REFUNDED' || (!admin && order.status !== 'PAID')) throw new HttpError(409, 'Refund requires pre-work cancellation or administrator resolution');
    const transaction = await tx.transaction.findUniqueOrThrow({ where: { id: order.escrow.transactionId } });
    if (!['SUCCEEDED', 'PARTIALLY_REFUNDED'].includes(transaction.status)) throw new HttpError(409, 'Payment is not refundable');
    const balance = await balances(tx, orderId);
    if (balance.reserved || balance.paid) throw new HttpError(409, 'Payout reservation or paid earnings require explicit recovery workflow before refund');
    const requests = await tx.refund.aggregate({ where: { transactionId: transaction.id, status: { in: ['PENDING', 'PROCESSING'] } }, _sum: { amount: true } });
    const remaining = cents(transaction.amount) - cents(transaction.refundedAmount, true) - (requests._sum.amount ? cents(requests._sum.amount, true) : 0);
    if (minor === null) minor = remaining;
    if (minor <= 0 || minor > remaining || (!admin && minor !== remaining)) throw new HttpError(400, 'Refund exceeds remaining paid amount or full cancellation required');
    const refund = await tx.refund.create({ data: { orderId, transactionId: transaction.id, actorId: actor, amount: money(minor), reason, requestKey: key } });
    await entry(tx, orderId, 'REFUND_REQUESTED', `refund:${refund.id}:requested`, actor, { amount: minor, refundId: refund.id, transactionId: transaction.id, reason, notifyUserId: order.seller.userId });
    return refund;
  }
  static async process(adminId: string, refundId: string) {
    await requireFinancialAdmin(adminId); assertProviderConfigured();
    const reserved = await financialTx(async tx => {
      const found = await tx.refund.findUnique({ where: { id: refundId } });
      if (!found) throw new HttpError(404, 'Refund not found');
      const order = await OrderService.load(tx, found.orderId);
      const refund = await tx.refund.findUniqueOrThrow({ where: { id: refundId } });
      if (['SUCCEEDED', 'FAILED', 'CANCELLED'].includes(refund.status)) return { refund, transaction: null };
      const balance = await balances(tx, order.id);
      if (balance.paid || balance.reserved) throw new HttpError(409, 'Payout recovery required');
      const transaction = await tx.transaction.findUniqueOrThrow({ where: { id: refund.transactionId } });
      if (!transaction.stripePaymentId) throw new HttpError(409, 'Provider payment reference required');
      if (refund.status === 'PENDING') await entry(tx, order.id, 'REFUND_PROCESSING', `refund:${refundId}:processing`, adminId, { refundId, reason: refund.reason, notifyUserId: order.buyerId });
      await tx.refund.update({ where: { id: refundId }, data: { status: 'PROCESSING' } });
      return { refund, transaction };
    });
    if (!reserved.transaction) return reserved.refund;
    if (!reserved.refund.stripeRefundId && Date.now() - reserved.refund.createdAt.getTime() > 23 * 3600000) throw new HttpError(409, 'Old unbound refund requires provider reconciliation');
    // Timeouts/unknown provider outcomes leave PROCESSING and keep earnings frozen.
    const provider = reserved.refund.stripeRefundId ? await stripe.refunds.retrieve(reserved.refund.stripeRefundId) : await stripe.refunds.create({ payment_intent: reserved.transaction.stripePaymentId!, amount: cents(reserved.refund.amount), reason: 'requested_by_customer', metadata: { refundId, orderId: reserved.refund.orderId } }, { idempotencyKey: `refund:${refundId}` });
    return financialTx(tx => this.apply(tx, providerRefund.parse(provider)), reserved.refund.orderId);
  }
  static async apply(tx: Tx, provider: z.infer<typeof providerRefund>) {
    const order = await OrderService.load(tx, provider.metadata.orderId);
    const refund = await tx.refund.findUnique({ where: { id: provider.metadata.refundId } });
    if (!refund || refund.orderId !== order.id) throw new HttpError(409, 'Refund record not available');
    const transaction = await tx.transaction.findUniqueOrThrow({ where: { id: refund.transactionId } });
    if (provider.amount !== cents(refund.amount) || provider.payment_intent !== transaction.stripePaymentId || provider.currency !== transaction.currency || (refund.stripeRefundId && refund.stripeRefundId !== provider.id)) throw new HttpError(400, 'Refund provider mismatch');
    if (refund.status === 'SUCCEEDED') return refund; // No downgrade or duplicate movement.
    if (provider.status === 'succeeded') {
      basis(order);
      const refunded = cents(transaction.refundedAmount, true), total = refunded + provider.amount, gross = cents(transaction.amount);
      if (total > gross) throw new HttpError(409, 'Cumulative refund exceeds paid amount');
      const oldSplit = split(gross - refunded, order.platformFeeBps!), newSplit = split(gross - total, order.platformFeeBps!);
      const reversal = oldSplit.earning - newSplit.earning;
      const balance = await balances(tx, order.id);
      if (balance.reserved || balance.paid || (order.escrow?.released ? balance.available : balance.pending) < reversal) throw new HttpError(409, 'Provider refunded funds require payout recovery/reconciliation');
      await entry(tx, order.id, total === gross ? 'REFUND' : 'PARTIAL_REFUND', `refund:${refund.id}:succeeded`, refund.actorId, { amount: provider.amount, pending: order.escrow?.released ? 0 : -reversal, available: order.escrow?.released ? -reversal : 0, fee: newSplit.fee - oldSplit.fee, refundId: refund.id, transactionId: transaction.id, providerId: provider.id, reason: refund.reason, notifyUserId: order.buyerId });
      await tx.transaction.update({ where: { id: transaction.id }, data: { refundedAmount: money(total), status: total === gross ? 'REFUNDED' : 'PARTIALLY_REFUNDED' } });
      if (total === gross) {
        await tx.order.update({ where: { id: order.id }, data: { status: 'REFUNDED', activities: { create: { type: 'REFUND', description: 'Provider confirmed full refund' } } } });
        if (order.dispute && ['OPEN', 'UNDER_REVIEW'].includes(order.dispute.status)) await tx.marketplaceDispute.update({ where: { id: order.dispute.id }, data: { status: 'RESOLVED_BUYER', resolvedAt: new Date() } });
      }
    } else if (['FAILED', 'CANCELLED'].includes(refund.status)) return refund; // terminal provider failure cannot reopen on stale pending event
    const status = provider.status === 'succeeded' ? 'SUCCEEDED' : provider.status === 'failed' ? 'FAILED' : provider.status === 'canceled' ? 'CANCELLED' : 'PROCESSING';
    if (['FAILED', 'CANCELLED'].includes(status) && refund.status !== status) await entry(tx, order.id, `REFUND_${status}`, `refund:${refund.id}:${status}`, null, { refundId: refund.id, reason: 'Provider confirmed unsuccessful refund', notifyUserId: order.buyerId });
    return tx.refund.update({ where: { id: refund.id }, data: { status, stripeRefundId: provider.id } });
  }
  static async handleEvent(event: Stripe.Event) {
    const parsed = providerRefund.safeParse(event.data.object);
    if (!parsed.success) throw new HttpError(400, 'Malformed refund event');
    const hash = crypto.createHash('sha256').update(JSON.stringify(event.data.object)).digest('hex');
    return financialTx(async tx => {
      // apply acquires the same order lock as refunds, payouts and completion.
      const order = await OrderService.load(tx, parsed.data.metadata.orderId);
      const seen = await tx.providerEvent.findUnique({ where: { id: event.id } });
      if (seen) { if (seen.payloadHash !== hash || seen.type !== event.type) throw new HttpError(400, 'Event ID payload mismatch'); return; }
      await this.apply(tx, parsed.data);
      await tx.providerEvent.create({ data: { id: event.id, type: event.type, objectId: parsed.data.id, payloadHash: hash } });
      return order.id;
    }, parsed.data.metadata.orderId);
  }
}
