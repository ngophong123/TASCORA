import cron from 'node-cron';
import { logger } from '../server';
import { updateSellerReputations } from './reputation.worker';
import { OrderService } from '../modules/order/order.service';
import { flushFinancialNotices } from '../modules/financial/domain';
export const initCronJobs = () => {
  logger.info('Initializing cron jobs (single owner required)');
  cron.schedule('0 * * * *', async () => {
    try { await OrderService.autoComplete(); await flushFinancialNotices(); }
    catch { logger.error('Financial completion/outbox job failed'); }
  });
  cron.schedule('0 0 * * *', async () => { await updateSellerReputations(); });
};
