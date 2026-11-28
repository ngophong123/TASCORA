import dotenv from "dotenv"
dotenv.config()

import { UnrecoverableError, Worker, type Job } from "bullmq"
export { UnrecoverableError }
import { z } from "zod"
import { logger } from "../lib/logger"
import { prisma } from "../lib/prisma"
import { redis } from "../lib/redis"
import { EmailService } from "../modules/email/email.service"
import { KycService } from "../modules/kyc/kyc.service"
import { updateSellerReputations } from "./reputation.worker"
import {
  QUEUE_NAMES,
  createBullMqConnectionOptions,
  type EmailDeliveryJobData,
  type KycScanJobData,
  type ReputationUpdateJobData,
} from "./queues"

export const emailDeliveryJobDataSchema = z
  .object({
    template: z.enum(["VERIFY_EMAIL", "PASSWORD_RESET", "ORDER_UPDATE"]),
    recipientUserId: z.string().trim().min(1).max(128),
    referenceId: z.string().trim().min(1).max(128),
    correlationId: z.string().trim().min(1).max(128),
    idempotencyKey: z.string().trim().min(1).max(256),
    enqueuedAt: z.string().datetime(),
  })
  .strict()

export async function processEmailDeliveryJob(
  job: Pick<Job<EmailDeliveryJobData>, "id" | "data" | "attemptsMade">
) {
  const parsed = emailDeliveryJobDataSchema.safeParse(job.data)
  if (!parsed.success) {
    throw new UnrecoverableError("Invalid email delivery job payload")
  }

  const payload = parsed.data
  const jobLogger = logger.child({
    queue: QUEUE_NAMES.EMAIL_DELIVERY,
    jobId: job.id,
    correlationId: payload.correlationId,
    template: payload.template,
    attempt: job.attemptsMade + 1,
  })

  // Verification and password-reset tokens are stored strictly as irreversible hashes
  // and must never be placed in BullMQ/Redis payloads.
  if (payload.template === "VERIFY_EMAIL" || payload.template === "PASSWORD_RESET") {
    throw new UnrecoverableError(
      `Template ${payload.template} requires direct synchronous dispatch and cannot be queued without a raw token`
    )
  }

  const recipient = await prisma.user.findUnique({
    where: { id: payload.recipientUserId },
    select: { id: true, email: true, status: true },
  })
  if (!recipient || !recipient.email || recipient.status !== "ACTIVE") {
    throw new UnrecoverableError("Email delivery recipient is unavailable")
  }

  const order = await prisma.order.findUnique({
    where: { id: payload.referenceId },
    select: {
      id: true,
      status: true,
      buyerId: true,
      seller: { select: { userId: true } },
    },
  })
  if (!order) {
    throw new UnrecoverableError("Referenced order not found for email delivery")
  }

  const isOrderParticipant = order.buyerId === recipient.id || order.seller.userId === recipient.id
  if (!isOrderParticipant) {
    throw new UnrecoverableError("Recipient is not associated with the referenced order")
  }

  const info = await EmailService.sendOrderUpdateEmail(recipient.email, order.id, order.status)

  // Non-sensitive metadata only: never log tokens, emails, or PII.
  jobLogger.info(
    { referenceId: order.id, messageId: info?.messageId ?? null },
    "Completed email delivery job"
  )
  return {
    dispatched: true,
    template: payload.template,
    referenceId: order.id,
    messageId: info?.messageId ?? null,
  }
}

export function createWorkers(options?: { WorkerCtor?: typeof Worker }) {
  const WorkerClass = options?.WorkerCtor ?? Worker
  const connection = createBullMqConnectionOptions()

  const kycWorker = new WorkerClass<KycScanJobData>(
    QUEUE_NAMES.KYC_SCAN,
    async (job: Job<KycScanJobData>) => {
      const jobLogger = logger.child({
        queue: QUEUE_NAMES.KYC_SCAN,
        jobId: job.id,
        correlationId: job.data.correlationId,
        attempt: job.attemptsMade + 1,
      })
      jobLogger.info("Processing KYC scan job")
      const result = await KycService.processPendingScanBatch({ limit: job.data.batchSize ?? 10 })
      jobLogger.info(
        { scanned: result.scanned, purgedUploads: result.purgedUploads },
        "Completed KYC scan job"
      )
      return result
    },
    { connection, concurrency: 2 }
  )

  const reputationWorker = new WorkerClass<ReputationUpdateJobData>(
    QUEUE_NAMES.REPUTATION_UPDATE,
    async (job: Job<ReputationUpdateJobData>) => {
      const jobLogger = logger.child({
        queue: QUEUE_NAMES.REPUTATION_UPDATE,
        jobId: job.id,
        correlationId: job.data.correlationId,
        attempt: job.attemptsMade + 1,
      })
      jobLogger.info("Processing seller reputation update job")
      await updateSellerReputations()
      jobLogger.info("Completed seller reputation update job")
      return { ok: true }
    },
    { connection, concurrency: 1 }
  )

  const emailWorker = new WorkerClass<EmailDeliveryJobData>(
    QUEUE_NAMES.EMAIL_DELIVERY,
    async (job: Job<EmailDeliveryJobData>) => processEmailDeliveryJob(job),
    { connection, concurrency: 4 }
  )

  const workers = [kycWorker, reputationWorker, emailWorker]
  for (const w of workers) {
    w.on("failed", (job, err) => {
      const data = job?.data as Partial<EmailDeliveryJobData> | undefined
      logger.error(
        {
          queue: w.name,
          jobId: job?.id,
          correlationId: typeof data?.correlationId === "string" ? data.correlationId : undefined,
          template: typeof data?.template === "string" ? data.template : undefined,
          attemptsMade: job?.attemptsMade,
          errorType: err.name,
          errorCode: (err as { code?: string }).code,
        },
        "Background worker job failed"
      )
    })
  }

  return {
    workers,
    shutdown: async () => {
      logger.info("Shutting down BullMQ workers gracefully")
      await Promise.all(workers.map((w) => w.close()))
      await prisma.$disconnect()
      await redis.quit().catch(() => {})
    },
  }
}

if (require.main === module) {
  const runtime = createWorkers()
  logger.info({ queues: Object.values(QUEUE_NAMES) }, "TASCORA background worker started")

  const handleSignal = (signal: string) => {
    logger.info({ signal }, "Received shutdown signal")
    runtime
      .shutdown()
      .then(() => process.exit(0))
      .catch(() => process.exit(1))
  }

  process.on("SIGTERM", () => handleSignal("SIGTERM"))
  process.on("SIGINT", () => handleSignal("SIGINT"))
}
