import cron, { type ScheduledTask } from 'node-cron';
import { logger } from '../server';
import { updateSellerReputations } from './reputation.worker';
import { OrderService } from '../modules/order/order.service';
import { flushFinancialNotices } from '../modules/financial/domain';
import { startKycScanWorker, stopKycScanWorker } from './kyc-scan.worker';

const scheduledTasks: ScheduledTask[] = [];

export const initCronJobs = () => {
  logger.info('Initializing cron jobs (single owner required)');
  scheduledTasks.push(
    cron.schedule('0 * * * *', async () => {
      try {
        await OrderService.autoComplete();
        await flushFinancialNotices();
      } catch {
        logger.error('Financial completion/outbox job failed');
      }
    }),
    cron.schedule('0 0 * * *', async () => {
      await updateSellerReputations();
    })
  );
  startKycScanWorker();
};

export const stopCronJobs = async (): Promise<void> => {
  for (const task of scheduledTasks.splice(0)) {
    await task.stop();
  }
  await stopKycScanWorker();
};
