import { publicSellerSelect } from '../../lib/public-profile';
import { HttpError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { OrderStatus, Prisma } from '@prisma/client';
import { basis, balances, entry, financialTx, lockOrder, transition, requestKey, reasonSchema, type Tx } from '../financial/domain';
import { cents, money, platformFeeBps, currency, autoCompleteHours, assertPaymentAmount } from '../financial/money';
import { assertOwnedUpload } from '../upload/references';

export class OrderService {
  static async createOrder(buyerId: string, serviceId: string, packageId: string, checkoutKey?: string) {
    if (checkoutKey) requestKey.parse(checkoutKey);
    return financialTx(async tx => {
      if (checkoutKey) {
        await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtext(${`checkout:${buyerId}:${checkoutKey}`}))`;
        const existing = await tx.order.findUnique({ where: { buyerId_checkoutKey: { buyerId, checkoutKey } } });
        if (existing) {
          if (existing.serviceId !== serviceId || existing.packageId !== packageId) throw new HttpError(409, 'Idempotency key reused with different purchase');
          return existing;
        }
      }
      await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtext(${`service:${serviceId}`}))`;
      const pkg = await tx.servicePackage.findUnique({ where: { id: packageId }, include: { service: { include: { seller: { select: { id: true, userId: true, status: true, firstName: true, lastName: true, user: { select: { status: true } } } } } } } });
      if (!pkg || pkg.serviceId !== serviceId) throw new HttpError(404, 'Invalid service or package');
      if (pkg.service.status !== 'PUBLISHED' || pkg.service.seller.status !== 'APPROVED') throw new HttpError(409, 'Service is not published');
      if (pkg.service.seller.userId === buyerId) throw new HttpError(403, 'Sellers cannot purchase their own services');
      if (pkg.service.seller.user.status !== 'ACTIVE') throw new HttpError(409, 'Seller is not available');
      const amount = cents(pkg.price);
      assertPaymentAmount(amount);
      const snapshot = { serviceId, serviceTitle: pkg.service.title, packageId, packageTitle: pkg.title, packageType: pkg.type, sellerId: pkg.service.sellerProfileId, sellerUserId: pkg.service.seller.userId, sellerName: [pkg.service.seller.firstName, pkg.service.seller.lastName].filter(Boolean).join(' '), amount: money(amount).toFixed(2), currency, feeBps: platformFeeBps, revisions: pkg.revisions, deliveryDays: pkg.deliveryDays };
      const order = await tx.order.create({ data: { buyerId, sellerId: pkg.service.sellerProfileId, serviceId, packageId, amount: pkg.price, currency, platformFeeBps, purchaseSnapshot: snapshot, checkoutKey, status: 'PENDING', activities: { create: { type: 'CREATED', description: 'Order created awaiting payment' } } } });
      await entry(tx, order.id, 'ORDER_CREATED', `order:${order.id}:created`, buyerId, { notifyUserId: pkg.service.seller.userId });
      return order;
    });
  }

  static async getMyPurchases(buyerId: string) {
    return prisma.order.findMany({
      where: { buyerId },
      include: {
        seller: { select: publicSellerSelect },
        service: true,
        package: true,
        review: true,
        activities: true,
        deliveries: true,
        revisions: true,
        refunds: { select: { id: true, amount: true, status: true, reason: true, createdAt: true } },
        dispute: { select: { id: true, category: true, description: true, status: true, resolutionReason: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getMySales(userId: string) {
    const seller = await prisma.sellerProfile.findUnique({ where: { userId } });
    if (!seller) throw new Error('Seller profile not found');

    return prisma.order.findMany({
      where: { sellerId: seller.id },
      include: {
        buyer: { select: { id: true, email: true, buyerProfile: true } },
        service: true,
        package: true,
        review: true,
        activities: true,
        deliveries: true,
        revisions: true,
        refunds: { select: { id: true, amount: true, status: true, reason: true, createdAt: true } },
        dispute: { select: { id: true, category: true, description: true, status: true, resolutionReason: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }


  static async load(tx: Tx, orderId: string) {
    await lockOrder(tx, orderId);
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { seller: { select: { userId: true } }, escrow: true, dispute: true, deliveries: { orderBy: { createdAt: 'desc' } }, revisions: true, refunds: true } });
    if (!order) throw new HttpError(404, 'Order not found');
    return order;
  }
  static async complete(tx: Tx, order: Awaited<ReturnType<typeof OrderService.load>>, actor: string | null, automatic = false, adminResolution = false) {
    if (order.status === 'COMPLETED') return order;
    if (order.dispute && ['OPEN', 'UNDER_REVIEW'].includes(order.dispute.status) && !adminResolution) throw new HttpError(409, 'Dispute blocks completion');
    if (order.status !== 'DELIVERED' && !(adminResolution && order.status === 'DISPUTED')) throw new HttpError(409, 'Invalid order status transition');
    if (order.refunds.some(r => ['PENDING', 'PROCESSING'].includes(r.status))) throw new HttpError(409, 'Refund processing blocks completion');
    basis(order);
    if (!order.escrow || order.escrow.released) throw new HttpError(409, 'Verified funding is required');
    const balance = await balances(tx, order.id);
    if (balance.reserved || balance.paid || balance.available) throw new HttpError(409, 'Financial reconciliation required');
    await tx.escrow.update({ where: { id: order.escrow.id }, data: { released: true, releasedAt: new Date() } });
    await entry(tx, order.id, 'SELLER_EARNING_AVAILABLE', `order:${order.id}:available`, actor, { pending: -balance.pending, available: balance.pending, reason: automatic ? 'Automatic completion' : 'Delivery accepted', notifyUserId: order.seller.userId });
    return tx.order.update({ where: { id: order.id }, data: { status: 'COMPLETED', completedAt: new Date(), activities: { create: { type: 'STATUS_UPDATE', description: automatic ? 'Order automatically completed after delivery review window' : 'Delivery accepted; seller earnings eligible for payout' } } } });
  }
  static async operate(userId: string, orderId: string, operation: 'start' | 'accept' | 'revision' | 'cancel', message?: string) {
    return financialTx(async tx => {
      const order = await this.load(tx, orderId);
      const buyer = order.buyerId === userId, seller = order.seller.userId === userId;
      if (!buyer && !seller) throw new HttpError(404, 'Order not found');
      if (operation === 'start') {
        if (!seller) throw new HttpError(403, 'Only the seller may start work');
        if (order.status === 'IN_PROGRESS') return order;
        basis(order);
        if (!order.escrow || order.escrow.released || order.refunds.some(r => ['PENDING', 'PROCESSING'].includes(r.status))) throw new HttpError(409, 'Verified funding without a refund request required');
        transition(order.status, 'IN_PROGRESS');
        await entry(tx, orderId, 'ORDER_STARTED', `order:${orderId}:started:${order.revisions.length}`, userId, { notifyUserId: order.buyerId });
        return tx.order.update({ where: { id: orderId }, data: { status: 'IN_PROGRESS', activities: { create: { type: 'STATUS_UPDATE', description: 'Seller started work' } } } });
      }
      if (!buyer) throw new HttpError(403, 'Only the buyer may accept or request revision/cancellation');
      if (operation === 'accept') return this.complete(tx, order, userId);
      if (operation === 'revision') {
        const reason = reasonSchema.parse(message);
        if (order.status === 'IN_REVISION' && order.revisions.some(r => r.message === reason)) return order;
        transition(order.status, 'IN_REVISION');
        basis(order);
        const snapshot = order.purchaseSnapshot as Prisma.JsonObject;
        const limit = snapshot.revisions;
        if (typeof limit !== 'number' || order.revisions.length >= limit) throw new HttpError(409, 'Package revision limit reached');
        const delivery = order.deliveries[0];
        if (!delivery) throw new HttpError(409, 'Delivery required');
        await tx.orderRevision.create({ data: { orderId, orderDeliveryId: delivery.id, message: reason } });
        await entry(tx, orderId, 'REVISION_REQUESTED', `delivery:${delivery.id}:revision`, userId, { reason, notifyUserId: order.seller.userId });
        return tx.order.update({ where: { id: orderId }, data: { status: 'IN_REVISION', activities: { create: { type: 'STATUS_UPDATE', description: 'Buyer requested revision' } } } });
      }
      if (order.status === 'CANCELLED') return order;
      if (order.status !== 'PENDING') throw new HttpError(409, 'Paid cancellation requires a refund request or dispute');
      // Once an intent is reserved/created, cancellation must be reconciled with
      // provider cancellation first. Never race an in-flight charge locally.
      const attempts = await tx.transaction.count({ where: { orderId, status: { notIn: ['CANCELLED'] } } });
      if (attempts) throw new HttpError(409, 'Cancel the pending payment through provider reconciliation first');
      await entry(tx, orderId, 'ORDER_CANCELLED', `order:${orderId}:cancelled`, userId, { notifyUserId: order.seller.userId });
      return tx.order.update({ where: { id: orderId }, data: { status: 'CANCELLED', activities: { create: { type: 'STATUS_UPDATE', description: 'Buyer cancelled unpaid order' } } } });
    }, orderId);
  }
  static async deliver(userId: string, orderId: string, message: string, files: string[], key: string) {
    requestKey.parse(key); reasonSchema.parse(message);
    for (const file of files) { if (!file.startsWith(`upload:${userId}/`)) throw new HttpError(403, 'Delivery files must belong to you'); assertOwnedUpload(file, userId); }
    return financialTx(async tx => {
      const order = await this.load(tx, orderId);
      if (order.seller.userId !== userId) throw new HttpError(404, 'Order not found');
      const prior = await tx.orderDelivery.findUnique({ where: { orderId_requestKey: { orderId, requestKey: key } } });
      if (prior) { if (prior.message !== message || JSON.stringify(prior.files) !== JSON.stringify(files)) throw new HttpError(409, 'Idempotency key reused with another delivery'); return order; }
      basis(order);
      if (!order.escrow || order.escrow.released) throw new HttpError(409, 'Verified funding required');
      transition(order.status, 'DELIVERED');
      const delivery = await tx.orderDelivery.create({ data: { orderId, message, files, requestKey: key } });
      await entry(tx, orderId, 'DELIVERY_SUBMITTED', `delivery:${delivery.id}`, userId, { notifyUserId: order.buyerId });
      return tx.order.update({ where: { id: orderId }, data: { status: 'DELIVERED', lastDeliveredAt: delivery.createdAt, activities: { create: { type: 'STATUS_UPDATE', description: 'Seller submitted delivery' } } } });
    }, orderId);
  }
  // Compatibility adapter: no arbitrary status assignment or delivery bypass.
  static async updateOrderStatus(userId: string, orderId: string, status: OrderStatus, message?: string) {
    if (status === 'PAID') throw new HttpError(403, 'Payment confirmation requires a verified payment webhook');
    const operations = { IN_PROGRESS: 'start', COMPLETED: 'accept', IN_REVISION: 'revision', CANCELLED: 'cancel' } as const;
    if (status === 'DELIVERED') throw new HttpError(403, 'Only the seller may submit a delivery through the delivery operation');
    const op = operations[status as keyof typeof operations];
    if (!op) throw new HttpError(403, 'Use the authorized domain operation');
    return this.operate(userId, orderId, op, message);
  }
  static async autoComplete(now = new Date()) {
    const cutoff = new Date(now.getTime() - autoCompleteHours * 3600000);
    const candidates = await prisma.order.findMany({ where: { status: 'DELIVERED', lastDeliveredAt: { lte: cutoff }, platformFeeBps: { not: null }, escrow: { released: false }, refunds: { none: { status: { in: ['PENDING', 'PROCESSING'] } } } }, select: { id: true }, take: 100, orderBy: { lastDeliveredAt: 'asc' } });
    for (const candidate of candidates) {
      try { await financialTx(async tx => { const order = await this.load(tx, candidate.id); if (order.status === 'DELIVERED' && order.lastDeliveredAt && order.lastDeliveredAt <= cutoff) await this.complete(tx, order, null, true); }, candidate.id); }
      catch { /* One blocked legacy/refund/dispute order cannot stop the batch. */ }
    }
  }
}
