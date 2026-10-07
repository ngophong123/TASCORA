import { prisma } from '../../lib/prisma';
import { HttpError } from '../../lib/errors';
import { OrderService } from '../order/order.service';
import { balances, basis, entry, financialTx, requestKey } from './domain';
import { cents, money } from './money';
import { requireFinancialAdmin } from './refund.service';

// No real payout implementation exists. Only a configured, independently
// validated adapter may supply authoritative external outcomes.
export interface PayoutProvider {
  available: boolean;
  submit(input: { reference: string; sellerId: string; amount: number; currency: string }): Promise<{ reference: string; providerId: string; amount: number; currency: string; status: 'PROCESSING' | 'PAID' | 'FAILED' }>;
}
export const unavailablePayoutProvider: PayoutProvider = { available: false, submit: async () => { throw new HttpError(503, 'Payout provider validation required'); } };
export class PayoutService {
  static async request(sellerUserId: string, orderId: string, key: string) {
    requestKey.parse(key);
    return financialTx(async tx => {
      const order = await OrderService.load(tx, orderId);
      if (order.seller.userId !== sellerUserId) throw new HttpError(404, 'Order not found');
      const priorKey = await tx.financialEntry.findUnique({ where: { eventKey: `payout-request:${orderId}:${key}` } });
      if (priorKey?.payoutId) return tx.payout.findUniqueOrThrow({ where: { id: priorKey.payoutId } });
      basis(order);
      if (order.status !== 'COMPLETED' || !order.escrow?.released || order.refunds.some(r => ['PENDING', 'PROCESSING'].includes(r.status)) || (order.dispute && ['OPEN', 'UNDER_REVIEW'].includes(order.dispute.status))) throw new HttpError(409, 'Only completed undisputed available earnings can be requested');
      const existing = await tx.payout.findUnique({ where: { escrowId: order.escrow.id } });
      if (existing && existing.status !== 'FAILED') throw new HttpError(409, 'Payout already reserved or paid');
      const balance = await balances(tx, orderId);
      if (balance.available <= 0 || balance.reserved || balance.paid) throw new HttpError(409, 'No available earnings');
      const payout = await tx.payout.upsert({ where: { escrowId: order.escrow.id }, create: { escrowId: order.escrow.id, sellerProfileId: order.sellerId, amount: money(balance.available), requestKey: key }, update: { status: 'PENDING', amount: money(balance.available), requestKey: key, stripePayoutId: null, failureReason: null, attempt: { increment: 1 } } });
      await entry(tx, orderId, 'PAYOUT_REQUESTED', `payout-request:${orderId}:${key}`, sellerUserId, { amount: balance.available, available: -balance.available, reserved: balance.available, payoutId: payout.id, notifyUserId: sellerUserId });
      return payout;
    }, orderId);
  }
  static async process(adminId: string, payoutId: string, provider = unavailablePayoutProvider) {
    await requireFinancialAdmin(adminId);
    if (!provider.available) throw new HttpError(503, 'Payout provider validation required');
    const reserved = await financialTx(async tx => {
      const found = await tx.payout.findUnique({ where: { id: payoutId }, include: { escrow: true } });
      if (!found) throw new HttpError(404, 'Payout not found');
      const order = await OrderService.load(tx, found.escrow.orderId);
      const payout = await tx.payout.findUniqueOrThrow({ where: { id: payoutId } });
      if (['COMPLETED', 'FAILED'].includes(payout.status)) return { order, payout, submit: false };
      if (order.status !== 'COMPLETED' || order.refunds.some(r => ['PENDING', 'PROCESSING'].includes(r.status))) throw new HttpError(409, 'Payout frozen');
      if (payout.status === 'PENDING') {
        await tx.payout.update({ where: { id: payoutId }, data: { status: 'PROCESSING' } });
        await entry(tx, order.id, 'PAYOUT_PROCESSING', `payout:${payoutId}:${payout.attempt}:processing`, adminId, { payoutId, notifyUserId: order.seller.userId });
      }
      return { order, payout, submit: true };
    });
    if (!reserved.submit) return reserved.payout;
    const reference = `payout:${payoutId}:attempt:${reserved.payout.attempt}`;
    // Ambiguous failure leaves PROCESSING/reserved. Adapter must deduplicate and
    // retrieve by this durable reference, never assume a timeout means failure.
    const result = await provider.submit({ reference, sellerId: reserved.payout.sellerProfileId, amount: cents(reserved.payout.amount), currency: 'usd' });
    if (result.reference !== reference || result.amount !== cents(reserved.payout.amount) || result.currency !== 'usd' || !result.providerId) throw new HttpError(409, 'Payout provider mismatch');
    return financialTx(async tx => {
      const order = await OrderService.load(tx, reserved.order.id);
      const payout = await tx.payout.findUniqueOrThrow({ where: { id: payoutId } });
      if (payout.attempt !== reserved.payout.attempt || ['COMPLETED', 'FAILED'].includes(payout.status)) return payout;
      if (payout.stripePayoutId && payout.stripePayoutId !== result.providerId) throw new HttpError(409, 'Payout provider reference changed');
      if (result.status !== 'PROCESSING') {
        const amount = cents(payout.amount);
        const balance = await balances(tx, order.id);
        if (balance.reserved !== amount) throw new HttpError(409, 'Payout accounting requires reconciliation');
        await entry(tx, order.id, result.status === 'PAID' ? 'PAYOUT_PAID' : 'PAYOUT_FAILED', `payout:${payoutId}:${payout.attempt}:result`, adminId, { amount, reserved: -amount, paid: result.status === 'PAID' ? amount : 0, available: result.status === 'FAILED' ? amount : 0, payoutId, providerId: result.providerId, notifyUserId: order.seller.userId });
      }
      return tx.payout.update({ where: { id: payoutId }, data: { status: result.status === 'PAID' ? 'COMPLETED' : result.status, stripePayoutId: result.providerId, failureReason: result.status === 'FAILED' ? 'Provider confirmed payout failure' : null } });
    }, reserved.order.id);
  }
  static async summary(sellerUserId: string) {
    const seller = await prisma.sellerProfile.findUnique({ where: { userId: sellerUserId }, select: { id: true } });
    if (!seller) throw new HttpError(403, 'Seller profile required');
    const sums = await prisma.financialEntry.aggregate({ where: { order: { sellerId: seller.id } }, _sum: { pendingDelta: true, availableDelta: true, reservedDelta: true, paidDelta: true } });
    const payouts = await prisma.payout.findMany({ where: { sellerProfileId: seller.id }, select: { id: true, amount: true, status: true, createdAt: true, failureReason: true, escrow: { select: { orderId: true } } }, orderBy: { createdAt: 'desc' }, take: 100 });
    const availableOrders = await prisma.order.findMany({ where: { sellerId: seller.id, status: 'COMPLETED', platformFeeBps: { lt: 10000 }, escrow: { released: true, OR: [{ payout: null }, { payout: { status: 'FAILED' } }] }, refunds: { none: { status: { in: ['PENDING', 'PROCESSING'] } } } }, select: { id: true, purchaseSnapshot: true }, take: 100 });
    return { currency: 'usd', pending: (sums._sum.pendingDelta || money(0)).toFixed(2), available: (sums._sum.availableDelta || money(0)).toFixed(2), requested: (sums._sum.reservedDelta || money(0)).toFixed(2), paid: (sums._sum.paidDelta || money(0)).toFixed(2), payouts, availableOrders, providerAvailable: false };
  }
}
