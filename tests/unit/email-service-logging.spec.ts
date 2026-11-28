import fs from "node:fs"
import path from "node:path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { logger } from "../../apps/api/src/lib/logger"
import { EmailService } from "../../apps/api/src/modules/email/email.service"

function setMockTransporter(sendMail: ReturnType<typeof vi.fn>) {
  ;(EmailService as unknown as { transporter?: unknown }).transporter = { sendMail }
}

function clearMockTransporter() {
  ;(EmailService as unknown as { transporter?: unknown }).transporter = undefined
}

function walkTsFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walkTsFiles(full, acc)
    } else if (entry.isFile() && entry.name.endsWith(".ts")) {
      acc.push(full)
    }
  }
  return acc
}

describe("EmailService safe logging and token isolation", () => {
  let infoSpy: ReturnType<typeof vi.spyOn>
  let errorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    clearMockTransporter()
    infoSpy = vi
      .spyOn(logger, "info")
      .mockImplementation((() => undefined) as unknown as typeof logger.info)
    errorSpy = vi
      .spyOn(logger, "error")
      .mockImplementation((() => undefined) as unknown as typeof logger.error)
  })

  afterEach(() => {
    clearMockTransporter()
    vi.restoreAllMocks()
  })

  it("never logs Ethereal preview URLs, recipient emails, or raw tokens on successful dispatch", async () => {
    const rawVerifyToken = "raw-verify-token-9876543210abcdef"
    const rawResetToken = "raw-reset-token-fedcba0123456789"
    const sendMail = vi.fn().mockResolvedValue({
      messageId: "<safe-msg-1@example.test>",
      envelope: { from: "noreply@example.com", to: ["alice.secret@example.test"] },
      response: "250 Accepted https://ethereal.email/message/secret-preview-link",
    })
    setMockTransporter(sendMail)

    await EmailService.sendVerificationEmail("alice.secret@example.test", rawVerifyToken)
    await EmailService.sendPasswordResetEmail("bob.secret@example.test", rawResetToken)
    await EmailService.sendOrderUpdateEmail("carol.secret@example.test", "ord_999", "DELIVERED")

    expect(sendMail).toHaveBeenCalledTimes(3)
    const logged = JSON.stringify([...infoSpy.mock.calls, ...errorSpy.mock.calls])
    expect(logged).toContain("<safe-msg-1@example.test>")
    expect(logged).not.toContain("Preview URL")
    expect(logged).not.toContain("ethereal.email")
    expect(logged).not.toContain("alice.secret@example.test")
    expect(logged).not.toContain("bob.secret@example.test")
    expect(logged).not.toContain("carol.secret@example.test")
    expect(logged).not.toContain(rawVerifyToken)
    expect(logged).not.toContain(rawResetToken)
  })

  it("logs only allowlisted error metadata on verification email failure and propagates original error", async () => {
    const rawToken = "verify-secret-token-aabbccdd1122"
    const smtpError = Object.assign(
      new Error(
        `550 5.1.1 Mailbox unavailable for victim.verify@example.test using smtp-pass-secret and ${rawToken}`
      ),
      {
        code: "EENVELOPE",
        responseCode: 550,
        response: "550 5.1.1 <victim.verify@example.test> User unknown",
      }
    )
    setMockTransporter(vi.fn().mockRejectedValue(smtpError))

    const caught = await EmailService.sendVerificationEmail(
      "victim.verify@example.test",
      rawToken
    ).catch((e: unknown) => e)

    expect(caught).toBe(smtpError)
    expect(errorSpy).toHaveBeenCalledWith(
      { err: { name: "Error", code: "EENVELOPE", responseCode: 550 } },
      "Error sending email"
    )
    const logged = JSON.stringify([...infoSpy.mock.calls, ...errorSpy.mock.calls])
    expect(logged).not.toContain("victim.verify@example.test")
    expect(logged).not.toContain(rawToken)
    expect(logged).not.toContain("smtp-pass-secret")
    expect(logged).not.toContain("Mailbox unavailable")
    expect(logged).not.toContain("User unknown")
  })

  it("logs only allowlisted error metadata on password-reset email failure and propagates original error", async () => {
    const rawToken = "reset-secret-token-ffeeddcc9988"
    const smtpError = Object.assign(
      new Error(
        `AUTH PLAIN failed for reset.user@example.test with credential super-smtp-secret token=${rawToken}`
      ),
      {
        code: "EAUTH",
        responseCode: 535,
        response: "535 5.7.8 Authentication credentials invalid",
      }
    )
    setMockTransporter(vi.fn().mockRejectedValue(smtpError))

    const caught = await EmailService.sendPasswordResetEmail(
      "reset.user@example.test",
      rawToken
    ).catch((e: unknown) => e)

    expect(caught).toBe(smtpError)
    expect(errorSpy).toHaveBeenCalledWith(
      { err: { name: "Error", code: "EAUTH", responseCode: 535 } },
      "Error sending email"
    )
    const logged = JSON.stringify([...infoSpy.mock.calls, ...errorSpy.mock.calls])
    expect(logged).not.toContain("reset.user@example.test")
    expect(logged).not.toContain(rawToken)
    expect(logged).not.toContain("super-smtp-secret")
    expect(logged).not.toContain("AUTH PLAIN")
    expect(logged).not.toContain("Authentication credentials invalid")
  })

  it("logs only allowlisted error metadata on order-update email failure and propagates original error", async () => {
    const smtpError = Object.assign(
      new Error("421 4.7.0 Temporary failure delivering to buyer.order@example.test"),
      {
        code: "ETIMEDOUT",
        responseCode: 421,
      }
    )
    setMockTransporter(vi.fn().mockRejectedValue(smtpError))

    const caught = await EmailService.sendOrderUpdateEmail(
      "buyer.order@example.test",
      "ord_777",
      "PAID"
    ).catch((e: unknown) => e)

    expect(caught).toBe(smtpError)
    expect(errorSpy).toHaveBeenCalledWith(
      { err: { name: "Error", code: "ETIMEDOUT", responseCode: 421 } },
      "Error sending email"
    )
    const logged = JSON.stringify([...infoSpy.mock.calls, ...errorSpy.mock.calls])
    expect(logged).not.toContain("buyer.order@example.test")
    expect(logged).not.toContain("Temporary failure")
  })

  it("ensures no API producer enqueues VERIFY_EMAIL or PASSWORD_RESET jobs into Redis/BullMQ", () => {
    const apiSrcDir = path.join(process.cwd(), "apps/api/src")
    const files = walkTsFiles(apiSrcDir)
    for (const file of files) {
      const content = fs.readFileSync(file, "utf8")
      expect(
        content,
        `Unexpected emailDeliveryQueue.add with auth template in ${path.relative(process.cwd(), file)}`
      ).not.toMatch(/emailDeliveryQueue\.add[\s\S]{0,300}(VERIFY_EMAIL|PASSWORD_RESET)/)
    }
    const emailServiceSrc = fs.readFileSync(
      path.join(apiSrcDir, "modules/email/email.service.ts"),
      "utf8"
    )
    expect(emailServiceSrc).not.toContain("getTestMessageUrl")
    expect(emailServiceSrc).not.toContain("Preview URL")
  })
})
