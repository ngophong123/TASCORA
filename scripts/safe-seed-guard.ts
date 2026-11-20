export const SAFE_SEED_CONFIRMATION_VALUE = "YES_SEED_NON_PRODUCTION"
export const SAFE_SEED_CONFIRMATION_FLAG = "--confirm-non-production-seed"

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"])

export interface SafeSeedTarget {
  environment: "local" | "staging"
  host: string
  database: string
}

/**
 * Fail-closed guard preventing accidental database seeding against production
 * or unverified remote databases.
 */
export function assertSafeSeedTarget(
  env: NodeJS.ProcessEnv = process.env,
  argv: string[] = process.argv.slice(2)
): SafeSeedTarget {
  const appEnv = env.APP_ENV?.trim().toLowerCase()
  const nodeEnv = env.NODE_ENV?.trim().toLowerCase()

  if (appEnv === "production") {
    throw new Error("Safe seed refused: APP_ENV=production is strictly forbidden")
  }

  if (nodeEnv === "production" && appEnv !== "staging") {
    throw new Error(
      "Safe seed refused: NODE_ENV=production requires explicit APP_ENV=staging with an allowlisted database"
    )
  }

  const confirmed =
    env.TASCORA_CONFIRM_SEED?.trim() === SAFE_SEED_CONFIRMATION_VALUE ||
    argv.includes(SAFE_SEED_CONFIRMATION_FLAG)
  if (!confirmed) {
    throw new Error(
      `Safe seed refused: explicit confirmation required (${SAFE_SEED_CONFIRMATION_FLAG} or TASCORA_CONFIRM_SEED=${SAFE_SEED_CONFIRMATION_VALUE})`
    )
  }

  const rawUrl = env.DATABASE_URL?.trim()
  if (!rawUrl) {
    throw new Error("Safe seed refused: DATABASE_URL is required")
  }

  let parsed: URL
  try {
    parsed = new URL(rawUrl)
  } catch {
    throw new Error("Safe seed refused: DATABASE_URL is not a valid URL")
  }

  if (parsed.protocol !== "postgresql:" && parsed.protocol !== "postgres:") {
    throw new Error("Safe seed refused: DATABASE_URL must use postgresql:// or postgres://")
  }

  const host = parsed.hostname.toLowerCase()
  const database = parsed.pathname.replace(/^\/+/, "")
  if (!host || !database) {
    throw new Error("Safe seed refused: DATABASE_URL must include both hostname and database name")
  }

  const isLocalHost = LOCAL_HOSTS.has(host)
  if (isLocalHost && appEnv !== "staging") {
    return { environment: "local", host, database }
  }

  const rawAllowlist = env.SEED_DATABASE_ALLOWLIST?.trim() || ""
  const allowlist = rawAllowlist
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)

  if (allowlist.some((entry) => entry.includes("*"))) {
    throw new Error("Safe seed refused: SEED_DATABASE_ALLOWLIST must not contain wildcards")
  }

  const targetKey = `${host}/${database.toLowerCase()}`
  if (!allowlist.includes(targetKey)) {
    throw new Error(
      `Safe seed refused: database target "${targetKey}" is not in SEED_DATABASE_ALLOWLIST`
    )
  }

  return {
    environment: appEnv === "staging" ? "staging" : "local",
    host,
    database,
  }
}
