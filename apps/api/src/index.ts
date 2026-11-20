import './lib/config';
import { server, logger } from './server';
import { initCronJobs, stopCronJobs } from './workers/cron';
import { prisma } from './lib/prisma';
import { redis } from './lib/redis';
import { shouldEnableCron } from './lib/cron-config';
import { KycHmacMigrationService } from './modules/kyc/kyc-hmac-migration.service';

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  await KycHmacMigrationService.assertLegacyHmacRetirementAllowed();
  if (shouldEnableCron(process.env)) initCronJobs();
  server.listen(Number(PORT), '0.0.0.0', () => {
    logger.info(`Server is running on port ${PORT}`);
  });
}

void bootstrap().catch(err => {
  logger.error({ err: err instanceof Error ? err.message : 'STARTUP_FAILED' }, 'API startup aborted');
  process.exit(1);
});

for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.once(signal, () => {
    server.close(async () => {
      await stopCronJobs().catch(() => undefined);
      await prisma.$disconnect();
      redis.disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(0), 10000).unref();
  });
}
