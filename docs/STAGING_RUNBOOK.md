# TASCORA — Staging Deployment Runbook (Phase 4A.7)

> **Scope:** Staging preparation and deployment procedures only. Do **not** deploy to production, do **not** use Stripe LIVE keys (`sk_live_`/`rk_live_`), and do **not** run `prisma migrate reset` or unguarded seeds against hosted databases.

---

## 1. Render API (`@taskora/api`)

Verified directly against root `package.json` and `apps/api/package.json`:

- **Root Directory:** repository root (leave empty)
- **Runtime:** Node.js `22` + `pnpm@12.4.1` (pinned in `package.json` `"packageManager"`)
- **Build Command:**
  ```bash
  pnpm install --frozen-lockfile --prod=false && pnpm db:generate && pnpm --filter @taskora/api build
  ```
- **Start Command:**
  ```bash
  pnpm --filter @taskora/api start
  ```
- **Bind Address:** `0.0.0.0:${PORT}` (`apps/api/src/index.ts`)
- **Replica Count:** Start at **`1` replica** in staging. Socket.IO defaults to the in-memory adapter (`ENABLE_SOCKET_REDIS_ADAPTER=false`). Setting `ENABLE_SOCKET_REDIS_ADAPTER=true` enables `@socket.io/redis-adapter` Pub/Sub across replicas sharing a reachable `REDIS_URL`, but keep `replicas = 1` until every distributed dependency (Redis adapter, rate limiting, cron locks, and background workers) has been verified on hosted infrastructure. Enabling the adapter alone does not prove complete multi-instance readiness.
- **Proxy Topology:** Set `TRUST_PROXY=1` for single-hop Render ingress (`apps/api/src/lib/trust-proxy.ts`). Never set `TRUST_PROXY=true`.
- **Health Check Path:** `/health` (checks real PostgreSQL `SELECT 1` + Redis `PING` within a 4s deadline; `/health/live` is liveness-only).

---

## 2. Vercel Web (`web`)

Verified directly against root `package.json`, `apps/web/package.json`, and `apps/web/next.config.ts`:

- **Framework Preset:** Next.js (`16.4.6`, verified in `apps/web/package.json` and `pnpm-lock.yaml`)
- **Root Directory:** `apps/web`
- **Build Command:** `pnpm --filter web build` (or `next build` inside `apps/web`)
- **Mandatory Build-Time Public Env Vars (`apps/web/next.config.ts` fail-fast on `NODE_ENV=production`):**
  - `NEXT_PUBLIC_API_URL`: exact HTTPS API origin without `/api/v1` and without trailing slash (e.g., `https://api-staging.example.com`)
  - `NEXT_PUBLIC_WEB_URL`: exact HTTPS frontend origin without trailing slash (e.g., `https://staging.example.com`)
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: `pk_test_...` only when `PAYMENTS_PROVIDER=stripe` (leave unset when `PAYMENTS_PROVIDER=disabled`)

---

## 3. PostgreSQL (Managed Staging — e.g., Neon)

- Provision a dedicated non-production database with a **non-superuser** application role (required so `BEFORE TRUNCATE` immutability triggers on `admin_audit_logs` and `kyc_review_histories` cannot be bypassed by superuser DDL).
- Supply TLS connection string via `DATABASE_URL` (`postgresql://...?sslmode=require`).

---

## 4. Redis (Managed TLS — e.g., Layerbase / Upstash)

- Use native `rediss://` protocol in `REDIS_URL` with **no query parameters or URL fragments** (`apps/api/src/lib/redis.ts` rejects query/fragment overrides).
- `apps/api/src/lib/redis-connection.ts` automatically sets TLS SNI `servername` from the DNS hostname and keeps `rejectUnauthorized: true`.
- **Socket.IO Redis Adapter (`ENABLE_SOCKET_REDIS_ADAPTER`):** Defaults to `false` (retains the in-memory adapter in `apps/api/src/lib/socket.ts`). Set `ENABLE_SOCKET_REDIS_ADAPTER=true` only when multiple API replicas share the same reachable `REDIS_URL`; keep `false` for conservative single-replica staging deployments. Enabling this flag alone does not prove complete multi-instance readiness.

---

## 5. Private S3-Compatible Storage (e.g., Backblaze B2)

- Staging enforces `STORAGE_PROVIDER=s3` and HTTPS `STORAGE_ENDPOINT` (`apps/api/src/lib/config.ts`).
- Configure private bucket (block public ACLs/reads): `STORAGE_BUCKET`, `STORAGE_REGION`, `STORAGE_ENDPOINT`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`, `STORAGE_FORCE_PATH_STYLE=true` (if path-style endpoint is used).
- KYC evidence objects stay private and are served only via short-lived authenticated endpoints / presigned URLs after ClamAV `VERIFIED_SAFE` checks.

---

## 6. SMTP Sandbox (e.g., Mailtrap Email Sandbox)

- Configure `SMTP_HOST`, `SMTP_PORT` (`587`), `SMTP_SECURE` (`false` for STARTTLS 587), `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`.
- Never configure production transactional delivery to real customer addresses on staging.

---

## 7. Stripe Test Mode & Disabled Mode

TASCORA supports two explicit payment modes across both staging and production (`apps/api/src/lib/config.ts` & `apps/api/src/lib/payment-provider.ts`):

1. **Stripe Test Mode (`PAYMENTS_PROVIDER=stripe` or omitted):**
   - Requires `STRIPE_SECRET_KEY` matching `/^(sk|rk)_test_[A-Za-z0-9]+$/` and `STRIPE_WEBHOOK_SECRET` matching `/^whsec_[A-Za-z0-9]+$/`.
   - Live credentials (`sk_live_*`, `rk_live_*`) are strictly rejected in **every** environment (`development`, `test`, `staging`, and `production`).
   - Live webhook events (`event.livemode === true`) and events with missing or non-boolean `livemode` are strictly rejected unconditionally after signature verification (`apps/api/src/modules/payment/payment.controller.ts`).
2. **Disabled Payment Mode (`PAYMENTS_PROVIDER=disabled` with `NODE_ENV=production` and explicit `APP_ENV=staging` or `APP_ENV=production`):**
   - Requires no Stripe keys; payment intent creation, cancellation, refunds, webhooks, and payouts fail closed with `HTTP 503` / `PAYMENT_PROVIDER_UNAVAILABLE`, and the UI hides checkout/Stripe.js cleanly.
   - All other mandatory infrastructure requirements (PostgreSQL, Redis, S3 storage, KYC encryption & HMAC keys, SMTP, exact HTTPS origins, strong `JWT_ACCESS_SECRET`) remain enforced.

- **External Seller Payouts:** Disabled in all environments (`externalPayoutsAvailable: false`, `HTTP 503`).

---

## 8. KYC Encryption & Blind-Index HMAC Keys

- Provision two **cryptographically independent** 256-bit (64 lowercase hex chars, `>= 12` distinct bytes) secrets in the Render secret manager:
  - `KYC_ENCRYPTION_KEY` (active key ID default `k1`)
  - `KYC_DOCUMENT_HMAC_KEY` (active key ID default `h1`, must never equal `KYC_ENCRYPTION_KEY`)
- Generate locally without logging:
  ```bash
  node -e 'console.log(require("node:crypto").randomBytes(32).toString("hex"))'
  ```
- Optional rotation variables: `KYC_ENCRYPTION_KEY_ID`, `KYC_ENCRYPTION_PREVIOUS_KEYS`, `KYC_DOCUMENT_HMAC_KEY_ID`, `KYC_DOCUMENT_HMAC_PREVIOUS_KEYS`, `KYC_DISABLE_LEGACY_HMAC=false`.

---

## 9. ClamAV (`clamd`)

- Optional sidecar/private service on TCP `3310` (`KYC_SCANNER_PROVIDER=clamd`, `CLAMD_HOST`, `CLAMD_PORT=3310`, `CLAMD_TIMEOUT_MS=10000`, `CLAMD_MAX_CONCURRENT=4`).
- **Fail-closed guarantee:** When `KYC_SCANNER_PROVIDER` is unset or `clamd` is unreachable/times out, KYC uploads remain `QUARANTINED` / `SCAN_FAILED` and are never promoted to `VERIFIED_SAFE`.

---

## 10. CORS & Cookies

- `WEB_URL`: exact HTTPS canonical staging frontend origin.
- `CORS_ORIGINS`: comma-separated exact HTTPS origins (no wildcards, no `localhost`).
- `COOKIE_SAME_SITE`: `none` for cross-site Vercel Web ↔ Render API HTTPS setups (`Secure` + `HttpOnly` enforced by `NODE_ENV=production`); `lax` only for same-site subdomains.
- Optional Vercel Preview CORS (`VERCEL_PREVIEW_CORS_ENABLED=true`): allowed **only** when `APP_ENV=staging` + `NODE_ENV=production`, requiring `VERCEL_PREVIEW_TEAM_ID`, `VERCEL_PREVIEW_PROJECT_ID`, `VERCEL_PREVIEW_GITHUB_REPO_ID`, `VERCEL_PREVIEW_GIT_REFS`, and `VERCEL_PREVIEW_API_TOKEN` (API-side only; never `NEXT_PUBLIC_*`).

---

## 11. Health Checks & Logging

- `GET /health/live`: process liveness (`200`).
- `GET /health`: real PostgreSQL + Redis probes (4s deadline) + payment capability status (`200` when DB/Redis healthy, `503` on failure). Mounted before API rate limiting (`apps/api/src/server.ts:63`).
- Structured JSON logging via Pino (`apps/api/src/lib/logger.ts`, controlled by `LOG_LEVEL=info`); secrets, tokens, and KYC PII fields are redacted/excluded.

---

## 12. Database Migration, Backup & Rollback Checklist

**Mandatory rule:** Use **only** `pnpm db:migrate:deploy` (`prisma migrate deploy`). Never run `prisma migrate reset` or `prisma db push` on staging.

### Pre-Migration & Backup Checklist

1. Confirm target `DATABASE_URL` points to the staging database only.
2. Create a point-in-time snapshot/branch backup in Neon before applying migrations.
3. Inspect pending migrations:
   ```bash
   pnpm db:migrate:status
   ```
4. Apply migrations in maintenance/pre-start step:
   ```bash
   pnpm db:migrate:deploy
   pnpm db:migrate:status
   ```
5. Verify `Database schema is up to date!` and verify `9` migrations applied cleanly (`prisma/migrations/`).

### Rollback / Forward-Recovery Plan

- Prisma migrations in TASCORA are additive/forward-only (including triggers and constraints).
- **Application rollback:** Redeploy previous Render API release image/commit if compatible with additive schema changes.
- **Schema rollback:** Never edit applied migration files. Either restore the pre-migration Neon snapshot/branch (for staging recovery) or author a new forward corrective migration tested against disposable PostgreSQL (`vitest.database.config.mts`) before re-running `pnpm db:migrate:deploy`.

---

## 13. Cron & Background Worker Single-Owner Policy

- **Owner:** Exactly **one** `@taskora/api` replica when explicitly opted in via `ENABLE_CRON=true` (`apps/api/src/lib/cron-config.ts`).
- **Default in Staging (`APP_ENV=staging` / `NODE_ENV=production`):** **Disabled (`ENABLE_CRON=false`)**. Omitting `ENABLE_CRON` also disables cron fail-safely (`shouldEnableCron()` returns `false`).
- **Schedules when enabled (`apps/api/src/workers/cron.ts`):**
  - Hourly (`0 * * * *`): `OrderService.autoComplete()` + `flushFinancialNotices()`
  - Daily (`0 0 * * *`): `updateSellerReputations()`
  - Interval worker (`KYC_SCAN_INTERVAL_MS`): `startKycScanWorker()` (uses lease claiming `scanLeaseExpiresAt` + `scanClaimId`)
- **Duplicate prevention:** Keep `replicas = 1` and `ENABLE_CRON=false` during initial staging deployment; only set `ENABLE_CRON=true` on a single designated owner instance after smoke testing.
- **Verification:** Confirm startup logs emit `Initializing cron jobs (single owner required)` only on the designated owner and do **not** emit it when `ENABLE_CRON=false`.

---

## 14. Safe Non-Production Database Seeding

- Any future DB seed execution MUST invoke `assertSafeSeedTarget()` (`scripts/safe-seed-guard.ts`), which:
  - Strictly blocks `APP_ENV=production` and unlabelled `NODE_ENV=production`.
  - Requires exact `host/database` membership in `SEED_DATABASE_ALLOWLIST` (no wildcards) for non-local databases.
  - Requires explicit `--confirm-non-production-seed` or `TASCORA_CONFIRM_SEED=YES_SEED_NON_PRODUCTION`.
- Do **not** run `pnpm seed` (`scripts/generate-seed-data.ts`) against hosted staging databases (`generate-seed-data.ts` writes static TypeScript fixture files for local/E2E development).
