import './lib/config';
import { server, logger } from './server';
import { initCronJobs } from './workers/cron';
import { prisma } from './lib/prisma';
import { redis } from './lib/redis';

const PORT = process.env.PORT || 4000;

if (process.env.ENABLE_CRON !== 'false') initCronJobs();

server.listen(Number(PORT), '0.0.0.0', () => {
  logger.info(`Server is running on port ${PORT}`);
});

for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.once(signal, () => {
    server.close(async () => {
      await prisma.$disconnect();
      redis.disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(0), 10000).unref();
  });
}
