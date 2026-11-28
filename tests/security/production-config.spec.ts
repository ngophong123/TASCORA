import { afterEach, describe, expect, it, vi } from "vitest"

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.resetModules()
})

function productionEnv() {
  vi.stubEnv("NODE_ENV", "production")
  vi.stubEnv("STORAGE_PROVIDER", "s3")
  for (const name of [
    "STORAGE_BUCKET",
    "STORAGE_REGION",
    "STORAGE_ACCESS_KEY",
    "STORAGE_SECRET_KEY",
  ])
    vi.stubEnv(name, "test-only-placeholder")
  for (const name of [
    "DATABASE_URL",
    "REDIS_URL",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "SMTP_HOST",
    "SMTP_USER",
    "SMTP_PASSWORD",
    "SMTP_FROM",
  ]) {
    vi.stubEnv(name, "test-only-placeholder")
  }
  vi.stubEnv("JWT_ACCESS_SECRET", "test-only-placeholder-with-at-least-32-characters")
  vi.stubEnv(
    "KYC_ENCRYPTION_KEY",
    "a1b2c3d4e5f60718293a4b5c6d7e8f90102132435465768798a9bacbdcedfe0f"
  )
  vi.stubEnv(
    "KYC_DOCUMENT_HMAC_KEY",
    "1f2e3d4c5b6a798897a6b5c4d3e2f10099887766554433221100aabbccddeeff"
  )
  vi.stubEnv("WEB_URL", "https://web.example.com")
  vi.stubEnv("CORS_ORIGINS", "")
  vi.stubEnv("COOKIE_SAME_SITE", "none")
  vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_fixture")
  vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_fixture")
  vi.stubEnv("PAYMENTS_PROVIDER", "stripe")
}

describe("Production configuration safety", () => {
  it("wires verified Preview policy from real staging configuration without changing canonical trust", async () => {
    productionEnv()
    vi.stubEnv("APP_ENV", "staging")
    vi.stubEnv("VERCEL_PREVIEW_CORS_ENABLED", "true")
    for (const [name, value] of Object.entries({
      VERCEL_PREVIEW_TEAM_ID: "team_fixture",
      VERCEL_PREVIEW_PROJECT_ID: "prj_fixture",
      VERCEL_PREVIEW_GITHUB_REPO_ID: "123",
      VERCEL_PREVIEW_GIT_REFS: "staging",
      VERCEL_PREVIEW_API_TOKEN: "test-only-preview-token",
    }))
      vi.stubEnv(name, value)
    const fetcher = vi.fn().mockImplementation(async () =>
      Response.json({
        ownerId: "team_fixture",
        projectId: "prj_fixture",
        url: "verified.vercel.app",
        target: null,
        readyState: "READY",
        gitSource: { type: "github", repoId: "123", ref: "staging" },
      })
    )
    vi.stubGlobal("fetch", fetcher)
    const config = await import("../../apps/api/src/lib/config")
    expect(await config.isAllowedOrigin("https://verified.vercel.app")).toBe(true)
    expect(await config.isAllowedOrigin("https://web.example.com")).toBe(true)
    expect(await config.isAllowedOrigin("https://impostor.vercel.app")).toBe(false)
    expect(config.allowedOrigins).toEqual(["https://web.example.com"])
    expect(fetcher).toHaveBeenCalledTimes(2)
  })
  it("refuses Preview verification in real production configuration", async () => {
    productionEnv()
    vi.stubEnv("APP_ENV", "production")
    vi.stubEnv("VERCEL_PREVIEW_CORS_ENABLED", "true")
    await expect(import("../../apps/api/src/lib/config")).rejects.toThrow(
      "Preview CORS requires explicit production-runtime staging"
    )
  })
  it("keeps real production configuration exact-only with Preview disabled", async () => {
    productionEnv()
    vi.stubEnv("APP_ENV", "production")
    vi.stubEnv("VERCEL_PREVIEW_CORS_ENABLED", "false")
    const fetcher = vi.fn()
    vi.stubGlobal("fetch", fetcher)
    const config = await import("../../apps/api/src/lib/config")
    expect(await config.isAllowedOrigin("https://web.example.com")).toBe(true)
    expect(await config.isAllowedOrigin("https://verified.vercel.app")).toBe(false)
    expect(fetcher).not.toHaveBeenCalled()
  })
  it("rejects wildcard CORS origins even with HTTPS", async () => {
    productionEnv()
    vi.stubEnv("CORS_ORIGINS", "https://*.vercel.app")
    await expect(import("../../apps/api/src/lib/config")).rejects.toThrow("exact HTTPS origins")
  })
  it("rejects invalid TRUST_PROXY during configuration validation", async () => {
    productionEnv()
    vi.stubEnv("TRUST_PROXY", "1.0")
    await expect(import("../../apps/api/src/lib/config")).rejects.toThrow("TRUST_PROXY must be")
  })
  it("allows explicit staging and production disabled payments without Stripe secrets while preserving secure defaults", async () => {
    for (const appEnv of ["staging", "production"]) {
      vi.resetModules()
      productionEnv()
      vi.stubEnv("APP_ENV", appEnv)
      vi.stubEnv("PAYMENTS_PROVIDER", "disabled")
      vi.stubEnv("STRIPE_SECRET_KEY", "")
      vi.stubEnv("STRIPE_WEBHOOK_SECRET", "")
      const config = await import("../../apps/api/src/lib/config")
      expect(config.isProduction).toBe(true)
      expect(config.allowedOrigins).toEqual(["https://web.example.com"])
      expect(config.cookieSameSite).toBe("none")
    }
  })
  it("rejects disabled payments when APP_ENV is neither staging nor production", async () => {
    productionEnv()
    vi.stubEnv("APP_ENV", "")
    vi.stubEnv("PAYMENTS_PROVIDER", "disabled")
    await expect(import("../../apps/api/src/lib/config")).rejects.toThrow(
      "Disabled payments require explicit APP_ENV=staging or APP_ENV=production"
    )
  })
  it("does not default staging to disabled when Stripe is missing", async () => {
    productionEnv()
    vi.stubEnv("APP_ENV", "staging")
    vi.stubEnv("PAYMENTS_PROVIDER", undefined)
    vi.stubEnv("STRIPE_SECRET_KEY", "")
    await expect(import("../../apps/api/src/lib/config")).rejects.toThrow("Stripe TEST credentials")
  })
  it("still requires non-payment production dependencies when payments are disabled in staging or production", async () => {
    for (const appEnv of ["staging", "production"]) {
      for (const requiredKey of [
        "DATABASE_URL",
        "REDIS_URL",
        "KYC_ENCRYPTION_KEY",
        "KYC_DOCUMENT_HMAC_KEY",
        "STORAGE_BUCKET",
        "SMTP_HOST",
        "JWT_ACCESS_SECRET",
      ]) {
        vi.resetModules()
        productionEnv()
        vi.stubEnv("APP_ENV", appEnv)
        vi.stubEnv("PAYMENTS_PROVIDER", "disabled")
        vi.stubEnv("STRIPE_SECRET_KEY", "")
        vi.stubEnv("STRIPE_WEBHOOK_SECRET", "")
        vi.stubEnv(requiredKey, "")
        await expect(import("../../apps/api/src/lib/config")).rejects.toThrow(requiredKey)
      }
    }
  })
  it("rejects invalid provider names and malformed production Stripe configuration", async () => {
    productionEnv()
    vi.stubEnv("PAYMENTS_PROVIDER", "mock")
    await expect(import("../../apps/api/src/lib/config")).rejects.toThrow("PAYMENTS_PROVIDER")
    vi.resetModules()
    vi.stubEnv("PAYMENTS_PROVIDER", "stripe")
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "invalid")
    await expect(import("../../apps/api/src/lib/config")).rejects.toThrow(
      "Invalid Stripe configuration"
    )
  })
  it("rejects staging on a development runtime before loading local env", async () => {
    vi.stubEnv("APP_ENV", "staging")
    vi.stubEnv("NODE_ENV", "development")
    await expect(import("../../apps/api/src/lib/config")).rejects.toThrow(
      "Staging requires NODE_ENV=production"
    )
  })

  it("rejects live Stripe credentials (sk_live_, rk_live_) in every environment without leaking keys", async () => {
    const matrix: Array<{ appEnv: string; nodeEnv: string }> = [
      { appEnv: "development", nodeEnv: "development" },
      { appEnv: "test", nodeEnv: "test" },
      { appEnv: "staging", nodeEnv: "production" },
      { appEnv: "production", nodeEnv: "production" },
    ]
    for (const { appEnv, nodeEnv } of matrix) {
      for (const liveKey of ["sk_live_secretFixture999", "rk_live_secretFixture999"]) {
        vi.resetModules()
        if (nodeEnv === "production") productionEnv()
        vi.stubEnv("APP_ENV", appEnv)
        vi.stubEnv("NODE_ENV", nodeEnv)
        vi.stubEnv("PAYMENTS_PROVIDER", "stripe")
        vi.stubEnv("STRIPE_SECRET_KEY", liveKey)
        try {
          await import("../../apps/api/src/lib/config")
          throw new Error("Expected config import to reject live Stripe key")
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)
          expect(message).toContain("Live Stripe credentials are forbidden")
          expect(message).not.toContain(liveKey)
        }
      }
    }
  })

  it("accepts Stripe TEST credentials in both staging and production", async () => {
    for (const appEnv of ["staging", "production"]) {
      for (const testKey of ["sk_test_fixture123", "rk_test_fixture123"]) {
        vi.resetModules()
        productionEnv()
        vi.stubEnv("APP_ENV", appEnv)
        vi.stubEnv("STRIPE_SECRET_KEY", testKey)
        const config = await import("../../apps/api/src/lib/config")
        expect(config.isProduction).toBe(true)
        expect(config.allowedOrigins).toEqual(["https://web.example.com"])
        expect(config.cookieSameSite).toBe("none")
      }
    }
  })
  it("fails closed when the access secret is missing", async () => {
    productionEnv()
    vi.stubEnv("JWT_ACCESS_SECRET", "")
    await expect(import("../../apps/api/src/lib/config")).rejects.toThrow("JWT_ACCESS_SECRET")
  })

  it("does not allow localhost in production CORS", async () => {
    productionEnv()
    vi.stubEnv("CORS_ORIGINS", "http://localhost:3200")
    await expect(import("../../apps/api/src/lib/config")).rejects.toThrow("exact HTTPS origins")
  })

  it("accepts explicit HTTPS origins and cross-site secure cookie configuration", async () => {
    productionEnv()
    const config = await import("../../apps/api/src/lib/config")
    expect(config.allowedOrigins).toEqual(["https://web.example.com"])
    expect(config.cookieSameSite).toBe("none")
    expect(config.isProduction).toBe(true)
    expect(config.kycEncryptionKeyId).toBe("k1")
  })

  it("fails closed in production when KYC_ENCRYPTION_KEY is missing or weak", async () => {
    productionEnv()
    vi.stubEnv("KYC_ENCRYPTION_KEY", "")
    await expect(import("../../apps/api/src/lib/config")).rejects.toThrow("KYC_ENCRYPTION_KEY")

    for (const weakKey of [
      "too-short",
      "0000000000000000000000000000000000000000000000000000000000000000",
      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "password-placeholder-with-at-least-32-characters",
    ]) {
      vi.resetModules()
      productionEnv()
      vi.stubEnv("KYC_ENCRYPTION_KEY", weakKey)
      await expect(import("../../apps/api/src/lib/config")).rejects.toThrow("KYC_ENCRYPTION_KEY")
    }
  })

  it("validates KYC key rotation metadata and rejects colliding or orphan previous keys", async () => {
    productionEnv()
    vi.stubEnv("KYC_ENCRYPTION_KEY_ID", "k2")
    vi.stubEnv(
      "KYC_ENCRYPTION_PREVIOUS_KEYS",
      "k1=9f8e7d6c5b4a39281706f5e4d3c2b1a00f1e2d3c4b5a69788796a5b4c3d2e1f0"
    )
    const config = await import("../../apps/api/src/lib/config")
    expect(config.kycEncryptionKeyId).toBe("k2")

    vi.resetModules()
    productionEnv()
    vi.stubEnv("KYC_ENCRYPTION_KEY_ID", "k1")
    vi.stubEnv(
      "KYC_ENCRYPTION_PREVIOUS_KEYS",
      "k1=9f8e7d6c5b4a39281706f5e4d3c2b1a00f1e2d3c4b5a69788796a5b4c3d2e1f0"
    )
    await expect(import("../../apps/api/src/lib/config")).rejects.toThrow("conflicts with active")
  })

  it("fails closed when KYC_DOCUMENT_HMAC_KEY is missing, weak, or reuses KYC_ENCRYPTION_KEY", async () => {
    productionEnv()
    vi.stubEnv("KYC_DOCUMENT_HMAC_KEY", "")
    await expect(import("../../apps/api/src/lib/config")).rejects.toThrow("KYC_DOCUMENT_HMAC_KEY")

    vi.resetModules()
    productionEnv()
    vi.stubEnv("KYC_DOCUMENT_HMAC_KEY", "too-weak")
    await expect(import("../../apps/api/src/lib/config")).rejects.toThrow("KYC_DOCUMENT_HMAC_KEY")

    vi.resetModules()
    productionEnv()
    vi.stubEnv(
      "KYC_DOCUMENT_HMAC_KEY",
      "a1b2c3d4e5f60718293a4b5c6d7e8f90102132435465768798a9bacbdcedfe0f"
    )
    await expect(import("../../apps/api/src/lib/config")).rejects.toThrow(
      "cryptographically separate"
    )

    vi.resetModules()
    productionEnv()
    vi.stubEnv("KYC_DOCUMENT_HMAC_KEY_ID", "h2")
    vi.stubEnv(
      "KYC_DOCUMENT_HMAC_PREVIOUS_KEYS",
      "h1=0f1e2d3c4b5a69788796a5b4c3d2e1f09f8e7d6c5b4a39281706f5e4d3c2b1a0"
    )
    const config = await import("../../apps/api/src/lib/config")
    expect(config.kycDocumentHmacKeyId).toBe("h2")
  })
})
