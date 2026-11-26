# TASCORA Known Limitations

Verified engineering, operational, dependency, and product boundaries for `main` (`9477e67`, reviewed 2026-11-26).

## 1. Financial & Payment Boundaries

- **External Seller Payouts Are Intentionally Disabled by Default:** `PayoutService.process` (`apps/api/src/modules/financial/payout.service.ts`) defaults to `unavailablePayoutProvider` and fails closed with `503 Payout provider validation required`. Phase 4C (PR `#15`, merged `a3bf76e`) adds strictly test-mode Stripe Connect onboarding/eligibility and read-only reconciliation while keeping live real-money payouts unconditionally disabled.
- **No Real Money Processing:** Stripe integration is restricted to Test Mode (`sk_test_*` / `rk_test_*`) or Disabled Mode (`PAYMENTS_PROVIDER=disabled`). Live Stripe keys and `livemode=true` webhooks are actively rejected.
- **Single Currency (`usd`):** Financial basis calculations (`apps/api/src/modules/financial/domain.ts`) enforce `order.currency === 'usd'` and reject multi-currency orders.
- **Coupon Concurrency Window:** WS5 API security hardening (PR `#21`, merged `cb14ee1`) tightened coupon validation and atomic usage increments during checkout, but preview validation still checks usage limits prior to order commit rather than holding a pre-checkout reservation lease; under concurrent redemptions of a low-cap coupon, a late caller can be rejected at checkout commit time.

## 2. Deployment, Operations & Scaling Constraints

- **Hosted Staging Not Yet Verified (`BLOCKED`):** Cloud infrastructure (Render API, Vercel Web, managed PostgreSQL, Redis, S3/R2, SMTP sandbox, Stripe Test webhook, ClamAV daemon) has not been provisioned or smoke-tested live. See [docs/internal/STAGING_MANUAL_STEPS.md](internal/STAGING_MANUAL_STEPS.md).
- **Multi-Instance Live Soak Pending:** Phase 4D (PR `#18`, merged `9a6293b` and CI-verified) adds `@socket.io/redis-adapter`, `rate-limit-redis`, BullMQ queues/worker, and Redis distributed cron locks, but multi-replica soak testing has not yet been executed on hosted cloud infrastructure.
- **Local Load Test & Local Backup Restore Not Executed Locally:** Phase 4G (PR `#19`, merged `3633d34` and CI-verified) provides a localhost-guarded `k6` script and a disposable Docker PostgreSQL `pg_dump`/restore script, neither of which has been run in environments where `k6` or Docker Desktop is unavailable.

## 3. Dependency Audit Status (2026-11-26, Post-PR #23)

PR #23 (`3a57607`) upgraded Next.js from 16.3.5 to 16.4.6 and resolved prior lockfile advisories (including `proxy-addr` and `nodemailer`). A workspace audit run on 2026-11-26 (archived in [docs/internal/audits/dependency-audit-2026-11-26.txt](internal/audits/dependency-audit-2026-11-26.txt)) reports:

- **Full Workspace (`pnpm audit`, exit code 1):** 11 total advisories — 0 Critical, 5 High, 5 Moderate, 1 Low.
- **Production Dependencies (`pnpm audit --prod`, exit code 1):** 2 total advisories — 0 Critical, 1 High, 1 Moderate, 0 Low.
- **Findings Reported by `--prod` (2):**
  - `zod@3.25.76` (High, patched `>=4.6.6`): direct runtime dependency in `apps/api` (also transitive in `apps/web` and `packages/eslint-config`). Remediation requires a breaking Zod v3-to-v4 migration across validation schemas.
  - `minimatch@10.2.6` (Moderate, patched `>=11.0.1`): reported by `--prod` only because `packages/eslint-config` declares `eslint-config-next` under `dependencies` instead of `devDependencies`, not because it is an application runtime dependency.
- **Additional Dev & Tooling Findings (9 in full workspace):** `extract-zip@2.0.1` (2 High, no upstream patch available), `basic-ftp@5.3.1` (1 High, 2 Moderate), `tmp@0.0.33` / `0.1.0` (1 High, 1 Low), `ip-address@10.7.2` (1 Moderate), and `uuid@8.3.2` (1 Moderate) — all transitive dev-only dependencies via `@lhci/cli` (Lighthouse CI), along with `minimatch@10.2.6` via `nodemon` and `typescript-eslint`.

## 4. Product, Analytics & AI Boundaries

- **Profile View Telemetry Uninstrumented:** Analytics endpoints return `profileViews: null` until view-event ingestion is implemented.
- **AI Search Uses Deterministic Zero-Key Fallback:** Phase 4F (PR `#17`, merged `056cab2`) uses concept-expanded hashed vector embeddings plus caching for reproducible CI without external LLM keys; `pgvector` and hosted embedding providers are deferred until catalog scale justifies them.
- **Product UI Screenshots Intentionally Omitted:** Public `README.md` omits product screenshots rather than including placeholders, mockups, or unverified images.
- **Legacy Unused Dashboard Components:** Several older static/mock dashboard components remain unused in active routes; active pages consume real API/fixture contracts.

## 5. Monorepo & Repository Hygiene

- **Product vs. Package Naming Mismatch:** The user-facing brand and repository name is **TASCORA**, while root `package.json` is named `taskora` and the API workspace package is `@taskora/api` (with frontend workspace `web`).
- **Stub Shared Packages:** `packages/ui`, `packages/types`, and `packages/config` contain minimal `package.json` files without shared runtime code yet (only `packages/tsconfig` and `packages/eslint-config` hold shared configurations).
- **No Repository `LICENSE` File Yet:** Licensing requires an explicit decision by the repository owner; no `LICENSE` file has been auto-created.
