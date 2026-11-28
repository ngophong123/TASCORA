import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  userFindUnique: vi.fn(),
  orderFindUnique: vi.fn(),
  sendOrderUpdateEmail: vi.fn(),
  sendVerificationEmail: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  prismaDisconnect: vi.fn(async () => undefined),
  redisQuit: vi.fn(async () => "OK"),
  workerClose: vi.fn(async () => undefined),
  workerOn: vi.fn(),
  workerInstances: [] as Array<{ name: string; processor: unknown; opts: unknown }>,
  childInfo: vi.fn(),
  loggerInfo: vi.fn(),
  loggerError: vi.fn(),
  loggerChild: vi.fn(),
}))

class MockWorker {
  name: string
  close = mocks.workerClose
  on = mocks.workerOn
  constructor(name: string, processor: unknown, opts: unknown) {
    this.name = name
    mocks.workerInstances.push({ name, processor, opts })
  }
}

vi.mock("../../apps/api/src/lib/prisma", () => ({
  prisma: {
    user: { findUnique: mocks.userFindUnique },
    order: { findUnique: mocks.orderFindUnique },
    $disconnect: mocks.prismaDisconnect,
  },
}))

vi.mock("../../apps/api/src/lib/redis", () => ({
  redis: { quit: mocks.redisQuit },
}))

vi.mock("../../apps/api/src/modules/email/email.service", () => ({
  EmailService: {
    sendOrderUpdateEmail: mocks.sendOrderUpdateEmail,
    sendVerificationEmail: mocks.sendVerificationEmail,
    sendPasswordResetEmail: mocks.sendPasswordResetEmail,
  },
}))

vi.mock("../../apps/api/src/lib/logger", () => ({
  logger: {
    info: mocks.loggerInfo,
    error: mocks.loggerError,
    child: mocks.loggerChild,
  },
}))

import {
  UnrecoverableError,
  createWorkers,
  processEmailDeliveryJob,
} from "../../apps/api/src/workers/worker"
import { QUEUE_NAMES, type EmailDeliveryJobData } from "../../apps/api/src/workers/queues"

function validOrderJob(overrides: Partial<EmailDeliveryJobData> = {}) {
  return {
    id: "job_email_1",
    attemptsMade: 0,
    data: {
      template: "ORDER_UPDATE" as const,
      recipientUserId: "user_buyer_1",
      referenceId: "ord_12345",
      correlationId: "corr-12345",
      idempotencyKey: "email:order:ord_12345:PAID",
      enqueuedAt: "2026-11-28T09:00:00.000Z",
      ...overrides,
    },
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.workerInstances.length = 0
  mocks.loggerChild.mockReturnValue({ info: mocks.childInfo, error: mocks.loggerError })
  mocks.userFindUnique.mockResolvedValue({
    id: "user_buyer_1",
    email: "buyer.private@example.test",
    status: "ACTIVE",
  })
  mocks.orderFindUnique.mockResolvedValue({
    id: "ord_12345",
    status: "DELIVERED",
    buyerId: "user_buyer_1",
    seller: { userId: "user_seller_1" },
  })
  mocks.sendOrderUpdateEmail.mockResolvedValue({ messageId: "<msg-001@example.test>" })
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("Email delivery background worker", () => {
  it("validates payload, resolves recipient and order ownership, dispatches via EmailService, and logs no PII", async () => {
    const result = await processEmailDeliveryJob(validOrderJob())

    expect(mocks.userFindUnique).toHaveBeenCalledWith({
      where: { id: "user_buyer_1" },
      select: { id: true, email: true, status: true },
    })
    expect(mocks.orderFindUnique).toHaveBeenCalledWith({
      where: { id: "ord_12345" },
      select: {
        id: true,
        status: true,
        buyerId: true,
        seller: { select: { userId: true } },
      },
    })
    expect(mocks.sendOrderUpdateEmail).toHaveBeenCalledWith(
      "buyer.private@example.test",
      "ord_12345",
      "DELIVERED"
    )
    expect(result).toEqual({
      dispatched: true,
      template: "ORDER_UPDATE",
      referenceId: "ord_12345",
      messageId: "<msg-001@example.test>",
    })

    // Also allows seller participant of the referenced order
    mocks.userFindUnique.mockResolvedValueOnce({
      id: "user_seller_1",
      email: "seller.private@example.test",
      status: "ACTIVE",
    })
    const sellerResult = await processEmailDeliveryJob(
      validOrderJob({ recipientUserId: "user_seller_1" })
    )
    expect(sellerResult.dispatched).toBe(true)
    expect(mocks.sendOrderUpdateEmail).toHaveBeenLastCalledWith(
      "seller.private@example.test",
      "ord_12345",
      "DELIVERED"
    )

    // Ensure no email address or token appeared in any logger call
    const allLogs = JSON.stringify([
      ...mocks.loggerChild.mock.calls,
      ...mocks.childInfo.mock.calls,
      ...mocks.loggerInfo.mock.calls,
      ...mocks.loggerError.mock.calls,
    ])
    expect(allLogs).not.toContain("buyer.private@example.test")
    expect(allLogs).not.toContain("seller.private@example.test")
  })

  it("rejects malformed, incomplete, or unexpected payloads as UnrecoverableError without calling EmailService", async () => {
    const badPayloads = [
      null,
      {},
      { template: "ORDER_UPDATE", recipientUserId: "", referenceId: "ord_1" },
      { ...validOrderJob().data, enqueuedAt: "not-an-iso-date" },
      { ...validOrderJob().data, extraField: "mass-assignment" },
      { ...validOrderJob().data, template: "UNKNOWN_TEMPLATE" },
    ]

    for (const payload of badPayloads) {
      await expect(
        processEmailDeliveryJob({
          id: "job_bad",
          attemptsMade: 0,
          data: payload as EmailDeliveryJobData,
        })
      ).rejects.toBeInstanceOf(UnrecoverableError)
    }

    expect(mocks.sendOrderUpdateEmail).not.toHaveBeenCalled()
    expect(mocks.userFindUnique).not.toHaveBeenCalled()
  })

  it("rejects VERIFY_EMAIL and PASSWORD_RESET queued jobs without pretending dispatch or passing hashes as tokens", async () => {
    for (const template of ["VERIFY_EMAIL", "PASSWORD_RESET"] as const) {
      await expect(
        processEmailDeliveryJob(validOrderJob({ template, referenceId: "hashed_token_row_id" }))
      ).rejects.toBeInstanceOf(UnrecoverableError)
    }

    expect(mocks.sendVerificationEmail).not.toHaveBeenCalled()
    expect(mocks.sendPasswordResetEmail).not.toHaveBeenCalled()
    expect(mocks.sendOrderUpdateEmail).not.toHaveBeenCalled()
  })

  it("rejects missing recipient, inactive recipient, missing order, or unrelated order recipient as UnrecoverableError", async () => {
    mocks.userFindUnique.mockResolvedValueOnce(null)
    await expect(processEmailDeliveryJob(validOrderJob())).rejects.toBeInstanceOf(
      UnrecoverableError
    )

    mocks.userFindUnique.mockResolvedValueOnce({
      id: "user_buyer_1",
      email: "buyer.private@example.test",
      status: "SUSPENDED",
    })
    await expect(processEmailDeliveryJob(validOrderJob())).rejects.toBeInstanceOf(
      UnrecoverableError
    )

    mocks.orderFindUnique.mockResolvedValueOnce(null)
    await expect(processEmailDeliveryJob(validOrderJob())).rejects.toBeInstanceOf(
      UnrecoverableError
    )

    mocks.userFindUnique.mockResolvedValueOnce({
      id: "user_outsider",
      email: "outsider@example.test",
      status: "ACTIVE",
    })
    await expect(
      processEmailDeliveryJob(validOrderJob({ recipientUserId: "user_outsider" }))
    ).rejects.toBeInstanceOf(UnrecoverableError)

    expect(mocks.sendOrderUpdateEmail).not.toHaveBeenCalled()
  })

  it("propagates SMTP transport errors directly to BullMQ so retry and backoff operate", async () => {
    const smtpError = Object.assign(new Error("SMTP 421 temporary failure"), { code: "ETIMEDOUT" })
    mocks.sendOrderUpdateEmail.mockRejectedValueOnce(smtpError)

    const err = await processEmailDeliveryJob(validOrderJob()).catch((e: unknown) => e)
    expect(err).toBe(smtpError)
    expect(err).not.toBeInstanceOf(UnrecoverableError)
  })

  it("preserves worker registration, concurrency, safe failure logging, and graceful shutdown", async () => {
    const runtime = createWorkers({
      WorkerCtor: MockWorker as unknown as Parameters<typeof createWorkers>[0] extends
        { WorkerCtor?: infer W } | undefined
        ? NonNullable<W>
        : never,
    })
    expect(mocks.workerInstances.map((w) => w.name)).toEqual([
      QUEUE_NAMES.KYC_SCAN,
      QUEUE_NAMES.REPUTATION_UPDATE,
      QUEUE_NAMES.EMAIL_DELIVERY,
    ])
    expect(mocks.workerInstances[2]!.opts).toMatchObject({ concurrency: 4 })

    // Exercise the 'failed' listener and verify sensitive error message is never logged
    const failedCall = mocks.workerOn.mock.calls.find(([evt]) => evt === "failed")
    expect(failedCall).toBeDefined()
    const failedHandler = failedCall![1] as (
      job: { id: string; attemptsMade: number; data: EmailDeliveryJobData },
      err: Error & { code?: string }
    ) => void
    failedHandler(
      { id: "job_fail_1", attemptsMade: 2, data: validOrderJob().data },
      Object.assign(new Error("SMTP reject for buyer.private@example.test"), {
        code: "ECONNECTION",
      })
    )
    const errorLogOutput = JSON.stringify(mocks.loggerError.mock.calls)
    expect(errorLogOutput).toContain("job_fail_1")
    expect(errorLogOutput).toContain("ECONNECTION")
    expect(errorLogOutput).not.toContain("buyer.private@example.test")

    await runtime.shutdown()
    expect(mocks.workerClose).toHaveBeenCalledTimes(3)
    expect(mocks.prismaDisconnect).toHaveBeenCalledTimes(1)
    expect(mocks.redisQuit).toHaveBeenCalledTimes(1)
  })
})
