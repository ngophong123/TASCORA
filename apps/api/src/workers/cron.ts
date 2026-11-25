import cron, { type ScheduledTask } from 'node-cron';
import { logger } from '../server';
import { redis } from '../lib/redis';
import { withDistributedLock, type RedisLockClient } from '../lib/distributed-lock';
import { updateSellerReputations } from './reputation.worker';
import { OrderService } from '../modules/order/order.service';
import { flushFinancialNotices } from '../modules/financial/domain';
import { startKycScanWorker, stopKycScanWorker } from './kyc-scan.worker';

const scheduledTasks: ScheduledTask[] = [];

export const initCronJobs = () => {
  logger.info('Initializing cron jobs with Redis distributed single-owner lease locks');
  const lockClient = redis as unknown as RedisLockClient;
  scheduledTasks.push(
    cron.schedule('0 * * * *', async () => {
      try {
        const outcome = await withDistributedLock(
          lockClient,
          'cron:hourly-financial',
          50 * 60 * 1000,
          async () => {
            await OrderService.autoComplete();
            await flushFinancialNotices();
          }
        );
        if (outcome.skipped) {
          logger.debug({ job: 'cron:hourly-financial' }, 'Skipped cron tick; lock held by another replica');
        }
      } catch {
        logger.error('Financial completion/outbox job failed');
      }
    }),
    cron.schedule('0 0 * * *', async () => {
      try {
        const outcome = await withDistributedLock(
          lockClient,
          'cron:daily-reputation',
          2 * 60 * 60 * 1000,
          async () => {
            await updateSellerReputations();
          }
        );
        if (outcome.skipped) {
          logger.debug({ job: 'cron:daily-reputation' }, 'Skipped cron tick; lock held by another replica');
        }
      } catch {
        logger.error('Daily reputation job failed');
      }
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
