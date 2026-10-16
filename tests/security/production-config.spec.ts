import { afterEach, describe, expect, it, vi } from "vitest"

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
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
  vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_fixture")
  vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_fixture")
  vi.stubEnv("PAYMENTS_PROVIDER", "stripe")
}

describe("Production configuration safety", () => {
  it("wires verified Preview policy from real staging configuration without changing canonical trust", async () => {
    productionEnv()
    vi.stubEnv("APP_ENV", "staging")
    vi.stubEnv("VERCEL_PREVIEW_CORS_ENABLED", "true")
    for (const [name, value] of Object.entries({ VERCEL_PREVIEW_TEAM_ID: "team_fixture", VERCEL_PREVIEW_PROJECT_ID: "prj_fixture",
      VERCEL_PREVIEW_GITHUB_REPO_ID: "123", VERCEL_PREVIEW_GIT_REFS: "staging", VERCEL_PREVIEW_API_TOKEN: "test-only-preview-token" })) vi.stubEnv(name, value)
    const fetcher = vi.fn().mockImplementation(async () => Response.json({ ownerId: "team_fixture", projectId: "prj_fixture", url: "verified.vercel.app",
      target: null, readyState: "READY", gitSource: { type: "github", repoId: "123", ref: "staging" } }))
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
    await expect(import("../../apps/api/src/lib/config")).rejects.toThrow("Preview CORS requires explicit production-runtime staging")
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
  it("allows explicit staging disabled payments without Stripe secrets while preserving secure defaults", async () => {
    productionEnv()
    vi.stubEnv("APP_ENV", "staging")
    vi.stubEnv("PAYMENTS_PROVIDER", "disabled")
    vi.stubEnv("STRIPE_SECRET_KEY", "")
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "")
    const config = await import("../../apps/api/src/lib/config")
    expect(config.isProduction).toBe(true)
    expect(config.allowedOrigins).toEqual(["https://web.example.com"])
    expect(config.cookieSameSite).toBe("none")
  })
  it.each(["production", ""])('rejects disabled payments outside explicit staging (%s)', async appEnv => {
    productionEnv()
    vi.stubEnv("APP_ENV", appEnv)
    vi.stubEnv("PAYMENTS_PROVIDER", "disabled")
    await expect(import("../../apps/api/src/lib/config")).rejects.toThrow("Disabled payments are allowed only in explicit staging")
  })
  it("does not default staging to disabled when Stripe is missing", async () => {
    productionEnv()
    vi.stubEnv("APP_ENV", "staging")
    vi.stubEnv("PAYMENTS_PROVIDER", undefined)
    vi.stubEnv("STRIPE_SECRET_KEY", "")
    await expect(import("../../apps/api/src/lib/config")).rejects.toThrow("Staging requires Stripe TEST credentials")
  })
  it("still requires non-payment staging dependencies when payments are disabled", async () => {
    productionEnv()
    vi.stubEnv("APP_ENV", "staging")
    vi.stubEnv("PAYMENTS_PROVIDER", "disabled")
    vi.stubEnv("DATABASE_URL", "")
    await expect(import("../../apps/api/src/lib/config")).rejects.toThrow("DATABASE_URL")
  })
  it("rejects invalid provider names and malformed production Stripe configuration", async () => {
    productionEnv()
    vi.stubEnv("PAYMENTS_PROVIDER", "mock")
    await expect(import("../../apps/api/src/lib/config")).rejects.toThrow("PAYMENTS_PROVIDER")
    vi.resetModules()
    vi.stubEnv("PAYMENTS_PROVIDER", "stripe")
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "invalid")
    await expect(import("../../apps/api/src/lib/config")).rejects.toThrow("Invalid Stripe configuration")
  })
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
