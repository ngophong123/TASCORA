import { afterEach, describe, expect, it, vi } from "vitest"
import {
  createDefaultMalwareScanner,
  isMalwareScannerConfigured,
} from "../../apps/api/src/modules/kyc/malware-scanner"

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

function stagingBaseEnv() {
  vi.stubEnv("APP_ENV", "staging")
  vi.stubEnv("NODE_ENV", "production")
  vi.stubEnv("TRUST_PROXY", "1")
  vi.stubEnv("COOKIE_SAME_SITE", "none")
  vi.stubEnv("WEB_URL", "https://staging.tascora.example.com")
  vi.stubEnv("CORS_ORIGINS", "https://staging.tascora.example.com")
  vi.stubEnv(
    "DATABASE_URL",
    "postgresql://u:p@ep-staging.example.com/tascora_staging?sslmode=require"
  )
  vi.stubEnv("REDIS_URL", "rediss://default:placeholder@redis.example.com:6379")
  vi.stubEnv("JWT_ACCESS_SECRET", "staging-test-only-access-secret-minimum-32-chars")
  vi.stubEnv(
    "KYC_ENCRYPTION_KEY",
    "a1b2c3d4e5f60718293a4b5c6d7e8f90102132435465768798a9bacbdcedfe0f"
  )
  vi.stubEnv(
    "KYC_DOCUMENT_HMAC_KEY",
    "1f2e3d4c5b6a798897a6b5c4d3e2f10099887766554433221100aabbccddeeff"
  )
  vi.stubEnv("STORAGE_PROVIDER", "s3")
  vi.stubEnv("STORAGE_BUCKET", "tascora-staging-private")
  vi.stubEnv("STORAGE_REGION", "ca-east-006")
  vi.stubEnv("STORAGE_ENDPOINT", "https://s3.ca-east-006.backblazeb2.com")
  vi.stubEnv("STORAGE_ACCESS_KEY", "staging-access-placeholder")
  vi.stubEnv("STORAGE_SECRET_KEY", "staging-secret-placeholder")
  vi.stubEnv("SMTP_HOST", "sandbox.smtp.mailtrap.io")
  vi.stubEnv("SMTP_PORT", "587")
  vi.stubEnv("SMTP_USER", "mailtrap-user")
  vi.stubEnv("SMTP_PASSWORD", "mailtrap-pass")
  vi.stubEnv("SMTP_FROM", "noreply@staging.tascora.example.com")
  vi.stubEnv("PAYMENTS_PROVIDER", "stripe")
  vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_stagingFixtureOnly123")
  vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_stagingFixtureOnly123")
}

describe("Phase 4A.7 staging readiness configuration & Stripe safety", () => {
  it("accepts valid Stripe TEST secret and restricted test keys in staging", async () => {
    for (const key of ["sk_test_stagingFixtureOnly123", "rk_test_stagingFixtureOnly123"]) {
      vi.resetModules()
      stagingBaseEnv()
      vi.stubEnv("STRIPE_SECRET_KEY", key)
      const config = await import("../../apps/api/src/lib/config")
      expect(config.isProduction).toBe(true)
      expect(config.trustProxy).toBe(1)
    }
  })

  it("rejects live Stripe keys (sk_live_, rk_live_) and malformed keys in staging", async () => {
    for (const badKey of [
      "sk_live_forbiddenInStaging",
      "rk_live_forbiddenInStaging",
      "pk_test_notASecretKey",
      "sk_test_bad_underscore",
      "invalid",
    ]) {
      vi.resetModules()
      stagingBaseEnv()
      vi.stubEnv("STRIPE_SECRET_KEY", badKey)
      await expect(import("../../apps/api/src/lib/config")).rejects.toThrow(
        /Stripe TEST credentials/
      )
    }
  })

  it("enforces mandatory staging storage, HTTPS endpoint, Redis, and SMTP settings", async () => {
    stagingBaseEnv()
    vi.stubEnv("STORAGE_PROVIDER", "local")
    await expect(import("../../apps/api/src/lib/config")).rejects.toThrow(
      "Production STORAGE_PROVIDER must be s3"
    )

    vi.resetModules()
    stagingBaseEnv()
    vi.stubEnv("STORAGE_ENDPOINT", "http://insecure.example.com")
    await expect(import("../../apps/api/src/lib/config")).rejects.toThrow(
      "Production STORAGE_ENDPOINT must use HTTPS"
    )

    for (const requiredKey of [
      "REDIS_URL",
      "SMTP_HOST",
      "SMTP_USER",
      "SMTP_PASSWORD",
      "SMTP_FROM",
    ]) {
      vi.resetModules()
      stagingBaseEnv()
      vi.stubEnv(requiredKey, "")
      await expect(import("../../apps/api/src/lib/config")).rejects.toThrow(requiredKey)
    }
  })

  it("keeps KYC malware scanning fail-closed (QUARANTINED) when ClamAV is not configured in staging", async () => {
    expect(isMalwareScannerConfigured({})).toBe(false)
    const scanner = createDefaultMalwareScanner({})
    const result = await scanner.scanBuffer(Buffer.from("sample"), "staging/test.png")
    expect(result.scanStatus).toBe("QUARANTINED")
    expect(result.verdict).toBe("UNAVAILABLE")
  })
})
