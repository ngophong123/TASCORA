import cron from 'node-cron';
import { prisma } from '../lib/prisma';
import { logger } from '../server';
import { updateSellerReputations } from './reputation.worker';

export const initCronJobs = () => {
  logger.info('Initializing cron jobs...');

  // Chạy mỗi 1 phút để test (Thực tế có thể để '0 * * * *' - mỗi 1 giờ)
  cron.schedule('* * * * *', async () => {
    logger.info('CRON: Scanning for delivered orders to auto-complete...');

    try {
      // Tìm các đơn hàng DELIVERED quá 3 ngày
      // Ở môi trường dev, ta có thể test bằng cách trừ đi 3 phút thay vì 3 ngày
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const overdueOrders = await prisma.order.findMany({
        where: {
          status: 'DELIVERED',
          updatedAt: {
            lt: threeDaysAgo,
          },
        },
      });

      if (overdueOrders.length === 0) {
        logger.info('CRON: No overdue delivered orders found.');
        return;
      }

      logger.info(`CRON: Found ${overdueOrders.length} orders to auto-complete.`);

      for (const order of overdueOrders) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        });

        // Tạo system activity
        await prisma.orderActivity.create({
          data: {
            orderId: order.id,
            type: 'STATUS_UPDATE',
            description: 'Order was automatically completed by system after 3 days of delivery.',
          },
        });

        // (Tuỳ chọn) Bắn thông báo hoặc Email ở đây
        logger.info(`CRON: Order ${order.id} auto-completed.`);
      }
    } catch (error) {
      logger.error('CRON Error:', error);
    }
  });

  // Chạy mỗi 1 phút để test (Thực tế nên để '0 0 * * *' chạy vào nửa đêm)
  cron.schedule('* * * * *', async () => {
    await updateSellerReputations();
  });

  logger.info('Cron jobs initialized successfully.');
};
