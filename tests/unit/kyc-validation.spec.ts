import crypto from "node:crypto"
import { Writable } from "node:stream"
import { afterEach, describe, expect, it, vi } from "vitest"
import enMessages from "../../apps/web/messages/en.json"
import viMessages from "../../apps/web/messages/vi.json"
import {
  decryptSensitiveField,
  encryptSensitiveField,
  getEncryptedFieldKeyVersion,
  hmacDocumentNumber,
  maskDateOfBirth,
  maskDocumentNumber,
  needsKeyRotation,
  reencryptSensitiveField,
  sanitizeAuditMetadata,
} from "../../apps/api/src/lib/kyc-crypto"
import { createAppLogger, logger } from "../../apps/api/src/lib/logger"
import { EmailService } from "../../apps/api/src/modules/email/email.service"
import {
  assertAdminCanTransition,
  assertSellerCanSubmit,
  assertSellerCanUpdate,
  isKycVerifiedStatus,
} from "../../apps/api/src/modules/kyc/kyc.state-machine"
import { evaluateSellerPayoutEligibility } from "../../apps/api/src/modules/kyc/payout-eligibility"

function collectLeafKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const next = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return collectLeafKeys(value as Record<string, unknown>, next)
    }
    return [next]
  })
}

describe("KYC cryptography, state machine, payout contract & EN/VI localization", () => {
  it("encrypts sensitive KYC values with random IVs, authenticates ciphertext, and masks display fields", () => {
    const cipherA = encryptSensitiveField("A12345678")
    const cipherB = encryptSensitiveField("A12345678")
    expect(cipherA).not.toBe(cipherB)
    expect(cipherA).not.toContain("A12345678")
    expect(decryptSensitiveField(cipherA)).toBe("A12345678")
    expect(decryptSensitiveField(cipherB)).toBe("A12345678")

    expect(hmacDocumentNumber("A12345678")).toBe(hmacDocumentNumber("A12345678"))
    expect(maskDocumentNumber("A12345678")).toBe("•••••5678")
    expect(maskDateOfBirth("1994-08-21")).toBe("1994-**-**")
  })

  it("redacts sensitive secrets and PII recursively from audit metadata", () => {
    const sanitized = sanitizeAuditMetadata({
      file: "front.png",
      documentNumber: "SENSITIVE123",
      dateOfBirth: "1990-01-01",
      nested: {
        token: "raw-reset-token",
        access_token: "jwt-secret",
        safeFlag: true,
      },
    })

    expect(sanitized).toEqual({
      file: "front.png",
      documentNumber: "[REDACTED]",
      dateOfBirth: "[REDACTED]",
      nested: {
        token: "[REDACTED]",
        access_token: "[REDACTED]",
        safeFlag: true,
      },
    })
  })

  it("enforces seller submission/update guards and admin transition state machine", () => {
    expect(() => assertSellerCanSubmit("NOT_SUBMITTED")).not.toThrow()
    expect(() => assertSellerCanSubmit("NEEDS_RESUBMISSION")).not.toThrow()
    expect(() => assertSellerCanSubmit("APPROVED")).toThrow()

    expect(() => assertSellerCanUpdate("PENDING")).not.toThrow()
    expect(() => assertSellerCanUpdate("NEEDS_RESUBMISSION")).not.toThrow()
    expect(() => assertSellerCanUpdate("UNDER_REVIEW")).toThrow()

    expect(() => assertAdminCanTransition("PENDING", "UNDER_REVIEW")).not.toThrow()
    expect(() => assertAdminCanTransition("UNDER_REVIEW", "APPROVED")).not.toThrow()
    expect(() => assertAdminCanTransition("APPROVED", "REJECTED")).toThrow()
    expect(() => assertAdminCanTransition("NOT_SUBMITTED", "APPROVED")).toThrow()

    expect(isKycVerifiedStatus("APPROVED")).toBe(true)
    expect(isKycVerifiedStatus("VERIFIED")).toBe(true)
    expect(isKycVerifiedStatus("PENDING")).toBe(false)
  })

  it("computes read-only seller payout eligibility while keeping financial payouts disabled", () => {
    const incomplete = evaluateSellerPayoutEligibility({
      sellerStatus: "PENDING_REVIEW",
      verificationStatus: "PENDING",
      accountStatus: "ACTIVE",
      hasStripeAccountId: false,
    })
    expect(incomplete.eligibleForLivePayouts).toBe(false)
    expect(incomplete.kycSatisfied).toBe(false)
    expect(incomplete.sellerProfileApproved).toBe(false)
    expect(incomplete.accountActive).toBe(true)
    expect(incomplete.providerPayoutsEnabled).toBe(false)
    expect(incomplete.blockingReasons).toEqual([
      "PAYOUT_PROVIDER_DISABLED",
      "KYC_NOT_APPROVED",
      "SELLER_PROFILE_NOT_APPROVED",
      "STRIPE_CONNECT_ACCOUNT_MISSING",
    ])

    const verified = evaluateSellerPayoutEligibility({
      sellerStatus: "APPROVED",
      verificationStatus: "APPROVED",
      accountStatus: "ACTIVE",
      hasStripeAccountId: true,
    })
    expect(verified.eligibleForLivePayouts).toBe(false)
    expect(verified.kycSatisfied).toBe(true)
    expect(verified.sellerProfileApproved).toBe(true)
    expect(verified.accountActive).toBe(true)
    expect(verified.providerPayoutsEnabled).toBe(false)
    expect(verified.blockingReasons).toEqual(["PAYOUT_PROVIDER_DISABLED"])
  })

  it("maintains 100% leaf-key parity across EN and VI message bundles", () => {
    const enLeaves = collectLeafKeys(enMessages as Record<string, unknown>)
    const viLeaves = collectLeafKeys(viMessages as Record<string, unknown>)
    expect(viLeaves).toEqual(enLeaves)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it("supports v2 key-ID encryption envelopes, legacy v1 compatibility, and zero-downtime key rotation", () => {
    const keyV1 = "0123456789abcdef1032547698badcfe0123456789abcdef1032547698badcfe"
    const keyK2 = "fedcba9876543210efcdab8967452301fedcba9876543210efcdab8967452301"

    vi.stubEnv("KYC_ENCRYPTION_KEY", keyV1)
    vi.stubEnv("KYC_ENCRYPTION_KEY_ID", "k1")

    // Simulate an existing Milestone 4A.5 legacy v1:iv:tag:cipher record encrypted under keyV1.
    const legacySubkey = Buffer.from(
      crypto.hkdfSync(
        "sha256",
        Buffer.from(keyV1, "hex"),
        Buffer.alloc(0),
        Buffer.from("tascora:kyc:pii:aes-256-gcm:v1", "utf8"),
        32
      )
    )
    const iv = crypto.randomBytes(12)
    const legacyCipher = crypto.createCipheriv("aes-256-gcm", legacySubkey, iv)
    const legacyEncrypted = Buffer.concat([
      legacyCipher.update("LEGACY-ID-99", "utf8"),
      legacyCipher.final(),
    ])
    const legacyEnvelope = `v1:${iv.toString("hex")}:${legacyCipher.getAuthTag().toString("hex")}:${legacyEncrypted.toString("hex")}`

    const k1Envelope = encryptSensitiveField("CURRENT-ID-42")
    expect(k1Envelope.startsWith("v2:k1:")).toBe(true)
    expect(getEncryptedFieldKeyVersion(k1Envelope)).toBe("k1")
    expect(needsKeyRotation(k1Envelope)).toBe(false)

    // Rotate active key to k2 while retaining k1 (and v1) in KYC_ENCRYPTION_PREVIOUS_KEYS.
    vi.stubEnv("KYC_ENCRYPTION_KEY", keyK2)
    vi.stubEnv("KYC_ENCRYPTION_KEY_ID", "k2")
    vi.stubEnv("KYC_ENCRYPTION_PREVIOUS_KEYS", `k1=${keyV1},v1=${keyV1}`)

    expect(decryptSensitiveField(legacyEnvelope)).toBe("LEGACY-ID-99")
    expect(decryptSensitiveField(k1Envelope)).toBe("CURRENT-ID-42")
    expect(needsKeyRotation(legacyEnvelope)).toBe(true)
    expect(needsKeyRotation(k1Envelope)).toBe(true)

    const rotated = reencryptSensitiveField(k1Envelope)
    expect(rotated).toBeTruthy()
    expect(rotated!.startsWith("v2:k2:")).toBe(true)
    expect(needsKeyRotation(rotated)).toBe(false)
    expect(decryptSensitiveField(rotated)).toBe("CURRENT-ID-42")

    // Tampered auth tag fails closed.
    const parts = rotated!.split(":")
    parts[3] = "00".repeat(16)
    expect(() => decryptSensitiveField(parts.join(":"))).toThrow()
  })

  it("redacts sensitive secrets/PII in Pino logs and calls EmailService logger.error with structured { err } order", async () => {
    const lines: string[] = []
    const stream = new Writable({
      write(chunk, _encoding, callback) {
        lines.push(chunk.toString())
        callback()
      },
    })
    const testLogger = createAppLogger(stream)
    testLogger.info(
      {
        password: "raw-password",
        token: "raw-reset-token",
        body: { documentNumber: "PASS123456", dateOfBirth: "1991-05-10" },
        req: { headers: { authorization: "Bearer top-secret", cookie: "refreshToken=abc" } },
        safeField: "visible",
      },
      "audit test"
    )

    const output = lines.join("")
    expect(output).not.toContain("raw-password")
    expect(output).not.toContain("raw-reset-token")
    expect(output).not.toContain("PASS123456")
    expect(output).not.toContain("1991-05-10")
    expect(output).not.toContain("Bearer top-secret")
    expect(output).not.toContain("refreshToken=abc")
    expect(output).toContain("[REDACTED]")
    expect(output).toContain("visible")

    const sendMail = vi.fn().mockRejectedValue(
      Object.assign(new Error("SMTP connection timed out for alice@tascora.dev"), {
        code: "ETIMEDOUT",
        responseCode: 421,
      })
    )
    const errorSpy = vi
      .spyOn(logger, "error")
      .mockImplementation((() => undefined) as unknown as typeof logger.error)
    ;(EmailService as unknown as { transporter?: unknown }).transporter = { sendMail }

    await expect(
      EmailService.sendPasswordResetEmail("alice@tascora.dev", "deadbeef".repeat(8))
    ).rejects.toThrow("SMTP connection timed out")
    ;(EmailService as unknown as { transporter?: unknown }).transporter = undefined
    expect(errorSpy).toHaveBeenCalledWith(
      { err: { name: "Error", code: "ETIMEDOUT", responseCode: 421 } },
      "Error sending email"
    )
    expect(JSON.stringify(errorSpy.mock.calls)).not.toContain("alice@tascora.dev")
    expect(JSON.stringify(errorSpy.mock.calls)).not.toContain("SMTP connection timed out")
  })
})
