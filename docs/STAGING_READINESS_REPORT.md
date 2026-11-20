# TASCORA — Phase 4A.7 Staging Readiness Report

**Baseline:** `chore/phase-0-baseline-audit` (`175ad00`, stacked on `origin/main` `a6501f3`)
**Scope:** Preparation, configuration audit, Stripe safety guards, safe seed guard, and staging runbook. **No hosted deployment, hosted migration, or hosted seed was executed.**

---

## 1. Environment Variable Audit Matrix

Cross-checked across `.env.example`, `.env.staging.example`, `apps/api/src/lib/config.ts`, `apps/api/src/lib/cron-config.ts`, `apps/api/src/lib/origin-policy.ts`, `apps/api/src/lib/trust-proxy.ts`, `apps/api/src/modules/kyc/malware-scanner.ts`, `apps/api/src/modules/kyc/kyc.service.ts`, and `apps/web/next.config.ts`:

| Variable                                                                                       |          Required in Staging          | Used By                                                                   | Staging Value Format                                  |             Secret / Public              |
| :--------------------------------------------------------------------------------------------- | :-----------------------------------: | :------------------------------------------------------------------------ | :---------------------------------------------------- | :--------------------------------------: |
| `APP_ENV`                                                                                      |                **Yes**                | `apps/api/src/lib/config.ts`, `origin-policy.ts`, `payment.controller.ts` | `staging`                                             |                  Public                  |
| `NODE_ENV`                                                                                     |                **Yes**                | `apps/api`, `apps/web/next.config.ts`                                     | `production`                                          |                  Public                  |
| `PORT`                                                                                         |       Optional (default `4000`)       | `apps/api/src/index.ts`                                                   | Numeric port (Render injects)                         |                  Public                  |
| `DATABASE_URL`                                                                                 |                **Yes**                | `prisma/schema.prisma`, `apps/api`                                        | `postgresql://user:pass@host/db?sslmode=require`      |                **Secret**                |
| `REDIS_URL`                                                                                    |                **Yes**                | `apps/api/src/lib/redis.ts`, `redis-connection.ts`                        | `rediss://user:pass@host:port` (no query/fragment)    |                **Secret**                |
| `JWT_ACCESS_SECRET`                                                                            |                **Yes**                | `apps/api/src/lib/config.ts`, `auth/token.ts`                             | Random string `>= 32` chars                           |                **Secret**                |
| `KYC_ENCRYPTION_KEY`                                                                           |                **Yes**                | `apps/api/src/lib/kyc-key.ts`, `kyc-crypto.ts`                            | 64 lowercase hex chars (`>= 12` distinct bytes)       |                **Secret**                |
| `KYC_ENCRYPTION_KEY_ID`                                                                        |        Optional (default `k1`)        | `apps/api/src/lib/kyc-key.ts`                                             | `^[a-z0-9][a-z0-9_-]{0,15}$`                          |                  Public                  |
| `KYC_ENCRYPTION_PREVIOUS_KEYS`                                                                 |          Optional (rotation)          | `apps/api/src/lib/kyc-key.ts`                                             | `k0=<64-hex>` or JSON map                             |                **Secret**                |
| `KYC_DOCUMENT_HMAC_KEY`                                                                        |                **Yes**                | `apps/api/src/lib/kyc-key.ts`, `kyc-crypto.ts`                            | Distinct 64 hex chars (`!= KYC_ENCRYPTION_KEY`)       |                **Secret**                |
| `KYC_DOCUMENT_HMAC_KEY_ID`                                                                     |        Optional (default `h1`)        | `apps/api/src/lib/kyc-key.ts`                                             | `^[a-z0-9][a-z0-9_-]{0,15}$`                          |                  Public                  |
| `KYC_DOCUMENT_HMAC_PREVIOUS_KEYS`                                                              |          Optional (rotation)          | `apps/api/src/lib/kyc-key.ts`                                             | `h0=<64-hex>` or JSON map                             |                **Secret**                |
| `KYC_DISABLE_LEGACY_HMAC`                                                                      |      Optional (default `false`)       | `apps/api/src/lib/kyc-key.ts`, `index.ts`                                 | `false` (set `true` only after HMAC migration verify) |                  Public                  |
| `KYC_SCANNER_PROVIDER`                                                                         |        Optional (fail-closed)         | `apps/api/src/modules/kyc/malware-scanner.ts`                             | `clamd` or empty/unset (`QUARANTINED` fail-closed)    |                  Public                  |
| `CLAMD_HOST` / `CLAMD_PORT` / `CLAMD_TIMEOUT_MS` / `CLAMD_MAX_CONCURRENT`                      |         When `clamd` enabled          | `apps/api/src/modules/kyc/malware-scanner.ts`                             | Private host, `3310`, `10000`, `4`                    |                 Internal                 |
| `KYC_SCAN_INTERVAL_MS` / `KYC_SCAN_BATCH_SIZE` / `KYC_SCAN_MAX_ATTEMPTS` / `KYC_SCAN_LEASE_MS` |               Optional                | `kyc-scan.worker.ts`, `kyc.service.ts`                                    | Positive integers                                     |                  Public                  |
| `WEB_URL`                                                                                      |                **Yes**                | `apps/api/src/lib/config.ts`, `email.service.ts`                          | Exact HTTPS origin (no trailing `/`)                  |                  Public                  |
| `CORS_ORIGINS`                                                                                 |        Optional (recommended)         | `apps/api/src/lib/config.ts`                                              | Comma-separated exact HTTPS origins                   |                  Public                  |
| `VERCEL_PREVIEW_CORS_ENABLED`                                                                  |      Optional (default `false`)       | `apps/api/src/lib/origin-policy.ts`                                       | `false` or `true` (staging-only)                      |                  Public                  |
| `VERCEL_PREVIEW_TEAM_ID` / `PROJECT_ID` / `GITHUB_REPO_ID` / `GIT_REFS` / `API_TOKEN`          |       When Preview CORS enabled       | `apps/api/src/lib/origin-policy.ts`                                       | Exact IDs, branch list, Vercel API token              |         **Secret** (`API_TOKEN`)         |
| `COOKIE_SAME_SITE`                                                                             |       Optional (default `lax`)        | `apps/api/src/lib/config.ts`, `auth.controller.ts`                        | `none` (cross-site HTTPS) or `lax` (same-site)        |                  Public                  |
| `TRUST_PROXY`                                                                                  |           **Yes** on Render           | `apps/api/src/lib/trust-proxy.ts`                                         | `1` (exact hop count; never `true`)                   |                  Public                  |
| `ENABLE_CRON`                                                                                  | Optional (default `false` in staging) | `apps/api/src/lib/cron-config.ts`, `index.ts`                             | `false` initially; `true` on 1 owner only             |                  Public                  |
| `LOG_LEVEL`                                                                                    |       Optional (default `info`)       | `apps/api/src/lib/logger.ts`                                              | `info`                                                |                  Public                  |
| `STORAGE_PROVIDER`                                                                             |                **Yes**                | `apps/api/src/lib/config.ts`, `upload/storage.ts`                         | `s3`                                                  |                  Public                  |
| `STORAGE_BUCKET` / `STORAGE_REGION` / `STORAGE_ENDPOINT` / `STORAGE_FORCE_PATH_STYLE`          |                **Yes**                | `apps/api/src/lib/config.ts`, `upload/storage.ts`                         | Bucket, region, `https://...`, `true`/`false`         |            Public / Internal             |
| `STORAGE_ACCESS_KEY` / `STORAGE_SECRET_KEY`                                                    |                **Yes**                | `apps/api/src/lib/config.ts`, `upload/storage.ts`                         | S3/B2 scoped credentials                              |                **Secret**                |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` / `SMTP_USER` / `SMTP_PASSWORD` / `SMTP_FROM`        |                **Yes**                | `apps/api/src/lib/config.ts`, `email.service.ts`                          | Mailtrap sandbox credentials + sender email           | **Secret** (`SMTP_USER`/`SMTP_PASSWORD`) |
| `PAYMENTS_PROVIDER`                                                                            |      Optional (default `stripe`)      | `apps/api/src/lib/payment-provider.ts`                                    | `stripe` (test keys) or `disabled` (staging only)     |                  Public                  |
| `STRIPE_SECRET_KEY`                                                                            |    When `PAYMENTS_PROVIDER=stripe`    | `config.ts`, `payment.service.ts`                                         | `sk_test_...` or `rk_test_...` (live keys rejected)   |                **Secret**                |
| `STRIPE_WEBHOOK_SECRET`                                                                        |    When `PAYMENTS_PROVIDER=stripe`    | `config.ts`, `payment.controller.ts`                                      | `whsec_...`                                           |                **Secret**                |
| `NEXT_PUBLIC_API_URL`                                                                          |          **Yes** (Web build)          | `apps/web/next.config.ts`, `lib/api-url.ts`                               | Exact HTTPS API origin without `/api/v1`              |                  Public                  |
| `NEXT_PUBLIC_WEB_URL`                                                                          |          **Yes** (Web build)          | `apps/web/next.config.ts`, `lib/constants.ts`                             | Exact HTTPS Web origin                                |                  Public                  |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`                                                           |    When `PAYMENTS_PROVIDER=stripe`    | `apps/web/src/components/dashboard/orders/OrderPayment.tsx`               | `pk_test_...`                                         |                  Public                  |
| `PLATFORM_FEE_PERCENT` / `ORDER_AUTO_COMPLETE_HOURS`                                           |    Optional (defaults `10` / `72`)    | `apps/api/src/modules/financial/money.ts`                                 | Numeric strings                                       |                  Public                  |
| `SEED_DATABASE_ALLOWLIST` / `TASCORA_CONFIRM_SEED`                                             |       Optional (safe seed only)       | `scripts/safe-seed-guard.ts`                                              | Exact `host/db` entries (no wildcards) + confirmation |                 Internal                 |

---

## 2. Audit Findings & Hardening Applied

1. **Resolved `ENABLE_CRON` Staging Default Contradiction:**
   - Added `apps/api/src/lib/cron-config.ts` (`shouldEnableCron()`) wired into `apps/api/src/index.ts`.
   - Staging/production runtimes now fail-safely default to **`false` (opt-in)** so blank/omitted `ENABLE_CRON` cannot accidentally start duplicate schedulers, while local development preserves opt-out ergonomics.
   - Updated `.env.staging.example` with explicit `ENABLE_CRON=false` and `LOG_LEVEL=info`.
2. **Verified Stripe Test-Mode Safety Guards:**
   - Confirmed `apps/api/src/lib/config.ts:39` and `apps/api/src/modules/payment/payment.service.ts:15` reject `sk_live_*`, `rk_live_*`, and malformed keys in staging/test, and `payment.controller.ts:25` rejects `event.livemode === true`.
   - Added `tests/security/staging-readiness.spec.ts` covering test key acceptance (`sk_test_`, `rk_test_`), live/malformed key rejection, mandatory S3/HTTPS/Redis/SMTP validation, and ClamAV fail-closed `QUARANTINED` default.
3. **Implemented Fail-Closed Safe Seed Guard:**
   - Added `scripts/safe-seed-guard.ts` (`assertSafeSeedTarget()`) enforcing explicit non-production confirmation, blocking `APP_ENV=production`, blocking unlabelled `NODE_ENV=production`, and enforcing exact `host/database` allowlisting without wildcards.
   - Added `tests/unit/safe-seed-and-cron-guard.spec.ts` covering all rejection and allowlist cases.

---

## 3. VIỆC NGƯỜI DÙNG PHẢI THỰC HIỆN THỦ CÔNG

_(Detailed operator runbook also saved in `docs/internal/STAGING_MANUAL_STEPS.md`.)_

1. **Configure Render Staging API Environment (Secret Manager):**
   - Set `APP_ENV=staging`, `NODE_ENV=production`, `TRUST_PROXY=1`, `ENABLE_CRON=false`, `COOKIE_SAME_SITE=none`, `LOG_LEVEL=info`.
   - Supply private `DATABASE_URL` (Neon non-superuser role), `REDIS_URL` (`rediss://` without query string), `JWT_ACCESS_SECRET` (`>= 32` chars), distinct 64-hex `KYC_ENCRYPTION_KEY` & `KYC_DOCUMENT_HMAC_KEY`, Backblaze B2 S3 credentials (`STORAGE_PROVIDER=s3` + HTTPS `STORAGE_ENDPOINT`), Mailtrap SMTP sandbox credentials, and exact HTTPS `WEB_URL` / `CORS_ORIGINS`.
   - Choose either `PAYMENTS_PROVIDER=disabled` (no Stripe keys) **or** `PAYMENTS_PROVIDER=stripe` with Stripe **TEST** keys (`sk_test_...` + `whsec_...`).
2. **Configure Vercel Staging Frontend Environment (Preview & Production/Staging):**
   - Set `NEXT_PUBLIC_API_URL` (Render staging HTTPS origin without `/api/v1`) and `NEXT_PUBLIC_WEB_URL` (Vercel staging HTTPS origin).
   - Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...` only if Stripe Test Mode is enabled.
3. **Snapshot & Apply Staging Database Migrations Manually:**
   - Create a Neon backup snapshot/branch first.
   - Run `pnpm db:migrate:deploy` and `pnpm db:migrate:status` against the staging database (`DATABASE_URL` injected privately, never committed).
4. **Deploy & Provide Staging Base URL for Phase 4A.8:**
   - Trigger Render API and Vercel Web staging deploys manually.
   - Verify `GET /health/live` (`200`) and `GET /health` (`200` with `database: ok`, `redis: ok`).
   - Share the public staging Web & API URLs (never secrets) when ready to authorize Phase 4A.8 Hosted Staging Acceptance.
