import { afterEach, describe, expect, it, vi } from "vitest"

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

function productionEnv() {
  vi.stubEnv("NODE_ENV", "production")
  vi.stubEnv("STORAGE_PROVIDER", "s3")
  for (const name of ["STORAGE_BUCKET", "STORAGE_REGION", "STORAGE_ACCESS_KEY", "STORAGE_SECRET_KEY"]) vi.stubEnv(name, "test-only-placeholder")
  for (const name of ["DATABASE_URL", "REDIS_URL", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD", "SMTP_FROM"]) {
    vi.stubEnv(name, "test-only-placeholder")
  }
  vi.stubEnv("JWT_ACCESS_SECRET", "test-only-placeholder-with-at-least-32-characters")
  vi.stubEnv("WEB_URL", "https://web.example.com")
  vi.stubEnv("CORS_ORIGINS", "")
  vi.stubEnv("COOKIE_SAME_SITE", "none")
}

describe("Production configuration safety", () => {
  it("rejects staging on a development runtime before loading local env", async () => {
    vi.stubEnv("APP_ENV", "staging")
    vi.stubEnv("NODE_ENV", "development")
    await expect(import("../../apps/api/src/lib/config")).rejects.toThrow("Staging requires NODE_ENV=production")
  })

  it("rejects live Stripe credentials in staging", async () => {
    productionEnv()
    vi.stubEnv("APP_ENV", "staging")
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_live_fixture")
    await expect(import("../../apps/api/src/lib/config")).rejects.toThrow("Staging requires Stripe TEST credentials")
  })

  it("keeps production security defaults in staging with test credentials", async () => {
    productionEnv()
    vi.stubEnv("APP_ENV", "staging")
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_fixture")
    const config = await import("../../apps/api/src/lib/config")
    expect(config.isProduction).toBe(true)
    expect(config.allowedOrigins).toEqual(["https://web.example.com"])
    expect(config.cookieSameSite).toBe("none")
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
  })
})
