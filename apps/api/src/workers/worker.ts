import dotenv from 'dotenv';
dotenv.config();

import { Worker, type Job } from 'bullmq';
import { logger } from '../lib/logger';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { KycService } from '../modules/kyc/kyc.service';
import { updateSellerReputations } from './reputation.worker';
import {
  QUEUE_NAMES,
  createBullMqConnectionOptions,
  type EmailDeliveryJobData,
  type KycScanJobData,
  type ReputationUpdateJobData,
} from './queues';

export function createWorkers() {
  const connection = createBullMqConnectionOptions();

  const kycWorker = new Worker<KycScanJobData>(
    QUEUE_NAMES.KYC_SCAN,
    async (job: Job<KycScanJobData>) => {
      const jobLogger = logger.child({
        queue: QUEUE_NAMES.KYC_SCAN,
        jobId: job.id,
        correlationId: job.data.correlationId,
        attempt: job.attemptsMade + 1,
      });
      jobLogger.info('Processing KYC scan job');
      const result = await KycService.processPendingScanBatch({ limit: job.data.batchSize ?? 10 });
      jobLogger.info({ scanned: result.scanned, purgedUploads: result.purgedUploads }, 'Completed KYC scan job');
      return result;
    },
    { connection, concurrency: 2 }
  );

  const reputationWorker = new Worker<ReputationUpdateJobData>(
    QUEUE_NAMES.REPUTATION_UPDATE,
    async (job: Job<ReputationUpdateJobData>) => {
      const jobLogger = logger.child({
        queue: QUEUE_NAMES.REPUTATION_UPDATE,
        jobId: job.id,
        correlationId: job.data.correlationId,
        attempt: job.attemptsMade + 1,
      });
      jobLogger.info('Processing seller reputation update job');
      await updateSellerReputations();
      jobLogger.info('Completed seller reputation update job');
      return { ok: true };
    },
    { connection, concurrency: 1 }
  );

  const emailWorker = new Worker<EmailDeliveryJobData>(
    QUEUE_NAMES.EMAIL_DELIVERY,
    async (job: Job<EmailDeliveryJobData>) => {
      const jobLogger = logger.child({
        queue: QUEUE_NAMES.EMAIL_DELIVERY,
        jobId: job.id,
        correlationId: job.data.correlationId,
        template: job.data.template,
        attempt: job.attemptsMade + 1,
      });
      // Non-sensitive metadata only: never log tokens, emails, or PII.
      jobLogger.info({ referenceId: job.data.referenceId }, 'Dispatched email delivery job');
      return { dispatched: true, template: job.data.template, referenceId: job.data.referenceId };
    },
    { connection, concurrency: 4 }
  );

  const workers = [kycWorker, reputationWorker, emailWorker];
  for (const w of workers) {
    w.on('failed', (job, err) => {
      logger.error(
        {
          queue: w.name,
          jobId: job?.id,
          correlationId: job?.data?.correlationId,
          attemptsMade: job?.attemptsMade,
          errorType: err.name,
        },
        'Background worker job failed'
      );
    });
  }

  return {
    workers,
    shutdown: async () => {
      logger.info('Shutting down BullMQ workers gracefully');
      await Promise.all(workers.map((w) => w.close()));
      await prisma.$disconnect();
      await redis.quit().catch(() => {});
    },
  };
}

if (require.main === module) {
  const runtime = createWorkers();
  logger.info({ queues: Object.values(QUEUE_NAMES) }, 'TASCORA background worker started');

  const handleSignal = (signal: string) => {
    logger.info({ signal }, 'Received shutdown signal');
    runtime
      .shutdown()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  };

  process.on('SIGTERM', () => handleSignal('SIGTERM'));
  process.on('SIGINT', () => handleSignal('SIGINT'));
}
