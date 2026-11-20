import { describe, expect, it } from "vitest"
import { shouldEnableCron } from "../../apps/api/src/lib/cron-config"
import {
  assertSafeSeedTarget,
  SAFE_SEED_CONFIRMATION_FLAG,
  SAFE_SEED_CONFIRMATION_VALUE,
} from "../../scripts/safe-seed-guard"

describe("Phase 4A.7 single-owner cron configuration", () => {
  it("disables cron by default in staging and production runtimes unless explicitly opted in", () => {
    expect(shouldEnableCron({ NODE_ENV: "production", APP_ENV: "staging" })).toBe(false)
    expect(shouldEnableCron({ NODE_ENV: "production", APP_ENV: "staging", ENABLE_CRON: "" })).toBe(
      false
    )
    expect(
      shouldEnableCron({ NODE_ENV: "production", APP_ENV: "staging", ENABLE_CRON: "false" })
    ).toBe(false)
    expect(
      shouldEnableCron({ NODE_ENV: "production", APP_ENV: "staging", ENABLE_CRON: "true" })
    ).toBe(true)
    expect(shouldEnableCron({ NODE_ENV: "production", APP_ENV: "production" })).toBe(false)
  })

  it("retains opt-out behavior in local development and rejects malformed values", () => {
    expect(shouldEnableCron({ NODE_ENV: "development" })).toBe(true)
    expect(shouldEnableCron({ NODE_ENV: "development", ENABLE_CRON: "false" })).toBe(false)
    expect(() =>
      shouldEnableCron({ NODE_ENV: "production", APP_ENV: "staging", ENABLE_CRON: "yes" })
    ).toThrow('ENABLE_CRON must be "true" or "false"')
  })
})

describe("Phase 4A.7 safe seed guard", () => {
  it("allows local database seeding only with explicit confirmation", () => {
    const baseEnv = {
      NODE_ENV: "development",
      DATABASE_URL: "postgresql://taskora:password@127.0.0.1:5432/taskoradb?schema=public",
    }
    expect(() => assertSafeSeedTarget(baseEnv, [])).toThrow("explicit confirmation required")
    expect(assertSafeSeedTarget(baseEnv, [SAFE_SEED_CONFIRMATION_FLAG])).toEqual({
      environment: "local",
      host: "127.0.0.1",
      database: "taskoradb",
    })
    expect(
      assertSafeSeedTarget({ ...baseEnv, TASCORA_CONFIRM_SEED: SAFE_SEED_CONFIRMATION_VALUE }, [])
    ).toEqual({
      environment: "local",
      host: "127.0.0.1",
      database: "taskoradb",
    })
  })

  it("strictly rejects APP_ENV=production or unlabelled NODE_ENV=production", () => {
    expect(() =>
      assertSafeSeedTarget(
        {
          NODE_ENV: "production",
          APP_ENV: "production",
          DATABASE_URL: "postgresql://u:p@127.0.0.1:5432/prod_db",
          TASCORA_CONFIRM_SEED: SAFE_SEED_CONFIRMATION_VALUE,
          SEED_DATABASE_ALLOWLIST: "127.0.0.1/prod_db",
        },
        [SAFE_SEED_CONFIRMATION_FLAG]
      )
    ).toThrow("APP_ENV=production is strictly forbidden")

    expect(() =>
      assertSafeSeedTarget(
        {
          NODE_ENV: "production",
          DATABASE_URL: "postgresql://u:p@127.0.0.1:5432/some_db",
          TASCORA_CONFIRM_SEED: SAFE_SEED_CONFIRMATION_VALUE,
        },
        []
      )
    ).toThrow("NODE_ENV=production requires explicit APP_ENV=staging")
  })

  it("enforces exact host/database allowlist for non-local and staging targets without wildcards", () => {
    const stagingUrl = "postgresql://u:p@ep-staging.neon.tech/tascora_staging?sslmode=require"
    expect(() =>
      assertSafeSeedTarget(
        {
          NODE_ENV: "production",
          APP_ENV: "staging",
          DATABASE_URL: stagingUrl,
          TASCORA_CONFIRM_SEED: SAFE_SEED_CONFIRMATION_VALUE,
        },
        []
      )
    ).toThrow("is not in SEED_DATABASE_ALLOWLIST")

    expect(() =>
      assertSafeSeedTarget(
        {
          NODE_ENV: "production",
          APP_ENV: "staging",
          DATABASE_URL: stagingUrl,
          TASCORA_CONFIRM_SEED: SAFE_SEED_CONFIRMATION_VALUE,
          SEED_DATABASE_ALLOWLIST: "*.neon.tech/tascora_staging",
        },
        []
      )
    ).toThrow("must not contain wildcards")

    expect(
      assertSafeSeedTarget(
        {
          NODE_ENV: "production",
          APP_ENV: "staging",
          DATABASE_URL: stagingUrl,
          TASCORA_CONFIRM_SEED: SAFE_SEED_CONFIRMATION_VALUE,
          SEED_DATABASE_ALLOWLIST: "ep-staging.neon.tech/tascora_staging",
        },
        []
      )
    ).toEqual({
      environment: "staging",
      host: "ep-staging.neon.tech",
      database: "tascora_staging",
    })
  })
})
