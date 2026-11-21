import { Queue, type ConnectionOptions, type JobsOptions } from 'bullmq';
import { redisUrl } from '../lib/config';
import { redisOptions } from '../lib/redis-connection';

export const QUEUE_NAMES = {
  KYC_SCAN: 'tascora-kyc-scan',
  EMAIL_DELIVERY: 'tascora-email-delivery',
  REPUTATION_UPDATE: 'tascora-reputation-update',
} as const;

export interface CorrelatedJobPayload {
  correlationId: string;
  idempotencyKey: string;
  enqueuedAt: string;
}

export interface KycScanJobData extends CorrelatedJobPayload {
  batchSize?: number;
}

export interface EmailDeliveryJobData extends CorrelatedJobPayload {
  template: 'VERIFY_EMAIL' | 'PASSWORD_RESET' | 'ORDER_UPDATE';
  recipientUserId: string;
  referenceId: string;
}

export interface ReputationUpdateJobData extends CorrelatedJobPayload {
  trigger: 'scheduled' | 'manual';
}

export const DEFAULT_JOB_OPTIONS: JobsOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000,
  },
  removeOnComplete: { count: 100 },
  // Preserve failed jobs as a durable dead-letter inspection queue.
  removeOnFail: { count: 200 },
};

export function createBullMqConnectionOptions(url = redisUrl): ConnectionOptions {
  const opts = redisOptions(url);
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 6379,
    ...(parsed.username ? { username: decodeURIComponent(parsed.username) } : {}),
    ...(parsed.password ? { password: decodeURIComponent(parsed.password) } : {}),
    ...(opts.tls ? { tls: opts.tls } : {}),
    connectTimeout: opts.connectTimeout,
    // BullMQ workers require maxRetriesPerRequest: null for blocking commands.
    maxRetriesPerRequest: null,
  };
}

export function buildIdempotentJobOptions(
  idempotencyKey: string,
  overrides: Partial<JobsOptions> = {}
): JobsOptions {
  const sanitizedId = idempotencyKey.replace(/[^A-Za-z0-9._:-]/g, '_').slice(0, 128);
  return {
    ...DEFAULT_JOB_OPTIONS,
    ...overrides,
    jobId: sanitizedId,
  };
}

export function createMarketplaceQueues(url = redisUrl) {
  const connection = createBullMqConnectionOptions(url);
  const kycScanQueue = new Queue<KycScanJobData>(QUEUE_NAMES.KYC_SCAN, {
    connection,
    defaultJobOptions: DEFAULT_JOB_OPTIONS,
  });
  const emailDeliveryQueue = new Queue<EmailDeliveryJobData>(QUEUE_NAMES.EMAIL_DELIVERY, {
    connection,
    defaultJobOptions: DEFAULT_JOB_OPTIONS,
  });
  const reputationQueue = new Queue<ReputationUpdateJobData>(QUEUE_NAMES.REPUTATION_UPDATE, {
    connection,
    defaultJobOptions: DEFAULT_JOB_OPTIONS,
  });

  return {
    kycScanQueue,
    emailDeliveryQueue,
    reputationQueue,
    closeAll: async () => {
      await Promise.all([
        kycScanQueue.close(),
        emailDeliveryQueue.close(),
        reputationQueue.close(),
      ]);
    },
  };
}
