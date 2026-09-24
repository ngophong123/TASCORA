import { prisma } from '../../lib/prisma';
import { OrderStatus } from '@prisma/client';

export class OrderService {
  static async createOrder(buyerId: string, serviceId: string, packageId: string) {
    const servicePkg = await prisma.servicePackage.findUnique({
      where: { id: packageId },
      include: { service: true },
    });

    if (!servicePkg || servicePkg.serviceId !== serviceId) {
      throw new Error('Invalid service or package');
    }

    if (servicePkg.service.status !== 'PUBLISHED') {
      throw new Error('Service is not published');
    }

    // In a real app, calculate deliveryDate here based on pkg.deliveryDays
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + servicePkg.deliveryDays);

    return prisma.order.create({
      data: {
        buyerId,
        sellerId: servicePkg.service.sellerProfileId,
        serviceId,
        packageId,
        amount: servicePkg.price,
        status: OrderStatus.PENDING,
        deliveryDate,
        activities: {
          create: {
            type: 'CREATED',
            description: 'Order created',
          },
        },
      },
    });
  }

  static async getMyPurchases(buyerId: string) {
    return prisma.order.findMany({
      where: { buyerId },
      include: {
        seller: true,
        service: true,
        package: true,
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
        buyer: true,
        service: true,
        package: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async updateOrderStatus(userId: string, orderId: string, status: OrderStatus, message?: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { seller: true },
    });

    if (!order) throw new Error('Order not found');

    // Basic permission check (either buyer or seller depending on status)
    const isBuyer = order.buyerId === userId;
    const isSeller = order.seller.userId === userId;

    if (!isBuyer && !isSeller) {
      throw new Error('Unauthorized');
    }

    // Very basic state machine enforcement
    const validTransitions: Record<string, string[]> = {
      PENDING: ['PAID', 'CANCELLED'],
      PAID: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['DELIVERED', 'DISPUTED'],
      DELIVERED: ['COMPLETED', 'IN_REVISION', 'DISPUTED'],
      IN_REVISION: ['DELIVERED', 'DISPUTED'],
    };

    if (!validTransitions[order.status]?.includes(status)) {
      throw new Error(`Invalid status transition from ${order.status} to ${status}`);
    }

    return prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        activities: {
          create: {
            type: 'STATUS_UPDATE',
            description: `Order status changed to ${status}${message ? ': ' + message : ''}`,
          },
        },
      },
    });
  }
}
