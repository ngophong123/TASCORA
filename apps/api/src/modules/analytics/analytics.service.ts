import { prisma } from '../../lib/prisma';

export class AnalyticsService {
  static async getSellerDashboardMetrics(userId: string) {
    const seller = await prisma.sellerProfile.findUnique({
      where: { userId }
    });

    if (!seller) {
      throw new Error('Seller profile not found');
    }

    const sellerId = seller.id;

    // 1. Total Earnings from COMPLETED orders
    const earningsResult = await prisma.order.aggregate({
      _sum: {
        amount: true
      },
      where: {
        sellerId,
        status: 'COMPLETED'
      }
    });
    
    // Convert Decimal to number for easy JSON serialization
    const totalEarnings = earningsResult._sum.amount ? Number(earningsResult._sum.amount) : 0;

    // 2. Active Orders Count (Pending, Paid, In Progress, In Revision)
    const activeOrdersCount = await prisma.order.count({
      where: {
        sellerId,
        status: {
          in: ['PENDING', 'PAID', 'IN_PROGRESS', 'IN_REVISION']
        }
      }
    });

    // 3. Completed Orders Count
    const completedOrdersCount = await prisma.order.count({
      where: {
        sellerId,
        status: 'COMPLETED'
      }
    });

    return {
      totalEarnings: null,
      completedOrderValue: totalEarnings,
      activeOrdersCount,
      completedOrdersCount,
      averageRating: seller.ratingAverage,
      profileViews: null,
      conversionRate: null,
      sellerStatus: seller.status,
      sellerLevel: seller.level
    };
  }
}
