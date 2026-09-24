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

    // 4. Mock Data for views and conversion rate (as requested in Phase 19 MVP)
    // To make it look a bit realistic, we'll hash the sellerId to get a stable random number
    const hash = sellerId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const profileViews = 150 + (hash % 500); 
    const conversionRate = (1.5 + (hash % 10) * 0.3).toFixed(1); 

    return {
      totalEarnings,
      activeOrdersCount,
      completedOrdersCount,
      averageRating: seller.ratingAverage,
      profileViews, // Mocked
      conversionRate: Number(conversionRate) // Mocked %
    };
  }
}
