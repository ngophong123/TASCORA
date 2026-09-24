import { prisma } from '../lib/prisma';
import { logger } from '../server';

export const updateSellerReputations = async () => {
  logger.info('REPUTATION WORKER: Checking for seller level upgrades...');

  try {
    const sellers = await prisma.sellerProfile.findMany({
      where: { status: 'APPROVED' },
      include: {
        orders: {
          where: { status: 'COMPLETED' },
        },
      },
    });

    for (const seller of sellers) {
      const completedOrders = seller.orders.length;
      const earnings = seller.orders.reduce((acc, order) => acc + Number(order.amount), 0);
      const rating = seller.ratingAverage;
      
      let newLevel = seller.level;

      // Rules for upgrading
      if (completedOrders >= 100 && earnings >= 5000 && rating >= 4.8) {
        newLevel = 'TOP_RATED';
      } else if (completedOrders >= 50 && earnings >= 2000 && rating >= 4.5) {
        newLevel = 'LEVEL_2';
      } else if (completedOrders >= 10 && earnings >= 400 && rating >= 4.0) {
        newLevel = 'LEVEL_1';
      }

      // Rules for downgrading (simple version)
      if (seller.level === 'TOP_RATED' && rating < 4.6) {
        newLevel = 'LEVEL_2';
      }
      if (seller.level === 'LEVEL_2' && rating < 4.2) {
        newLevel = 'LEVEL_1';
      }

      if (newLevel !== seller.level) {
        await prisma.sellerProfile.update({
          where: { id: seller.id },
          data: { level: newLevel },
        });
        logger.info(`REPUTATION WORKER: Seller ${seller.id} updated from ${seller.level} to ${newLevel}`);
      }
    }
  } catch (error) {
    logger.error('REPUTATION WORKER Error:', error);
  }
};
