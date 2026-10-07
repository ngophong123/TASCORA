import { prisma } from '../../lib/prisma';
import { HttpError } from '../../lib/errors';
import { OrderService } from '../order/order.service';
import { basis, entry, financialTx, reasonSchema } from './domain';
import { cents } from './money';
import { RefundService, requireFinancialAdmin } from './refund.service';
import { assertPaymentsEnabled } from '../../lib/payment-provider';

export class DisputeService {
  static async open(buyerId: string, orderId: string, category: string, description: string) {
    reasonSchema.parse(description);
    return financialTx(async tx => {
      const order = await OrderService.load(tx, orderId);
      if (order.buyerId !== buyerId) throw new HttpError(404, 'Order not found');
      if (order.dispute) { if (order.dispute.category === category && order.dispute.description === description) return order.dispute; throw new HttpError(409, 'Order already has a dispute'); }
      basis(order);
      if (!order.escrow || order.escrow.released || !['PAID', 'IN_PROGRESS', 'IN_REVISION', 'DELIVERED'].includes(order.status)) throw new HttpError(409, 'Order is not eligible for a dispute');
      const dispute = await tx.marketplaceDispute.create({ data: { orderId, openedBy: buyerId, category, description } });
      await tx.order.update({ where: { id: orderId }, data: { status: 'DISPUTED', activities: { create: { type: 'DISPUTE_OPENED', description: 'Buyer opened an internal marketplace dispute' } } } });
      await entry(tx, orderId, 'DISPUTE_OPENED', `dispute:${dispute.id}:opened`, buyerId, { reason: description, notifyUserId: order.seller.userId });
      return dispute;
    }, orderId);
  }
  static async resolve(adminId: string, orderId: string, outcome: 'BUYER' | 'SELLER', reason: string) {
    await requireFinancialAdmin(adminId); reasonSchema.parse(reason);
    if (outcome === 'BUYER') assertPaymentsEnabled();
    return financialTx(async tx => {
      const order = await OrderService.load(tx, orderId);
      const dispute = order.dispute;
      if (!dispute) throw new HttpError(404, 'Dispute not found');
      if (dispute.resolvedBy) {
        if (dispute.resolutionReason !== reason || (outcome === 'SELLER' ? dispute.status !== 'RESOLVED_SELLER' : !['UNDER_REVIEW', 'RESOLVED_BUYER'].includes(dispute.status))) throw new HttpError(409, 'Dispute already has another resolution');
        return dispute;
      }
      if (!['OPEN', 'UNDER_REVIEW'].includes(dispute.status) || order.status !== 'DISPUTED') throw new HttpError(409, 'Dispute is not open');
      if (outcome === 'SELLER') {
        await OrderService.complete(tx, order, adminId, false, true);
      } else {
        const transaction = order.escrow && await tx.transaction.findUnique({ where: { id: order.escrow.transactionId } });
        if (!transaction) throw new HttpError(409, 'Verified payment required');
        const pending = order.refunds.filter(refund => ['PENDING', 'PROCESSING'].includes(refund.status)).reduce((sum, refund) => sum + cents(refund.amount), 0);
        const amount = cents(transaction.amount) - cents(transaction.refundedAmount, true) - pending;
        if (amount > 0) await RefundService.reserve(tx, adminId, orderId, amount, reason, `dispute_${dispute.id}`, true);
      }
      await entry(tx, orderId, `DISPUTE_RESOLVED_${outcome}`, `dispute:${dispute.id}:resolution`, adminId, { reason, notifyUserId: order.buyerId });
      return tx.marketplaceDispute.update({ where: { id: dispute.id }, data: { status: outcome === 'SELLER' ? 'RESOLVED_SELLER' : 'UNDER_REVIEW', resolvedBy: adminId, resolutionReason: reason, resolvedAt: outcome === 'SELLER' ? new Date() : null } });
    }, orderId);
  }
  static async evidence(adminId: string, orderId: string) {
    await requireFinancialAdmin(adminId);
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { deliveries: true, revisions: true, dispute: true, activities: true, refunds: true, financialEntries: { orderBy: { createdAt: 'asc' } }, transactions: { select: { id: true, stripePaymentId: true, amount: true, refundedAmount: true, currency: true, status: true } }, conversation: { select: { id: true, messages: { orderBy: { createdAt: 'desc' }, take: 100, select: { id: true, senderId: true, content: true, attachmentUrl: true, createdAt: true } } } } } });
    if (!order) throw new HttpError(404, 'Order not found');
    return order;
  }
}
