# TASCORA Known Limitations

Verified engineering, operational, dependency, and product boundaries for `main` (`d7e851d`, PRs #1–#28 merged, updated 2026-11-28).

## 1. Financial & Payment Boundaries

- **External Seller Payouts Are Intentionally Disabled by Default:** `PayoutService.process` (`apps/api/src/modules/financial/payout.service.ts`) defaults to `unavailablePayoutProvider` and fails closed with `503 Payout provider validation required`. Phase 4C (PR `#15`, merged `a3bf76e`) adds strictly test-mode Stripe Connect onboarding/eligibility and read-only reconciliation while keeping live real-money payouts unconditionally disabled.
- **No Real Money Processing (Stripe Test-Only / Disabled-Only):** Stripe integration is restricted strictly to Test Mode (`sk_test_*` / `rk_test_*`) or explicit Disabled Mode (`PAYMENTS_PROVIDER=disabled`, permitted in both `APP_ENV=staging` and `APP_ENV=production` with `NODE_ENV=production`). Live Stripe keys (`sk_live_*`, `rk_live_*`), live publishable keys (`pk_live_*`), and `event.livemode === true` (or missing/non-boolean `livemode`) webhooks are rejected unconditionally in every environment.
- **Admin Recovery Workflow Is Investigation-Only:** PR `#28` (`d7e851d`) adds `FinancialRecoveryCase` and append-only `FinancialRecoveryEvent` tracking for disputes with `recoveryRequired = true`, but intentionally omits `RESOLVED`/`SETTLED` transitions; clearing financial holds or posting compensating clawback entries remains unimplemented until a verified settlement mechanism exists.
- **Single Currency (`usd`):** Financial basis calculations (`apps/api/src/modules/financial/domain.ts`) enforce `order.currency === 'usd'` and reject multi-currency orders.
- **Coupon Concurrency Window:** WS5 API security hardening (PR `#21`, merged `cb14ee1`) tightened coupon validation and atomic usage increments during checkout, but preview validation still checks usage limits prior to order commit rather than holding a pre-checkout reservation lease; under concurrent redemptions of a low-cap coupon, a late caller can be rejected at checkout commit time.

## 2. Deployment, Operations & Scaling Constraints

- **Hosted Staging Not Yet Verified (`BLOCKED`):** Cloud infrastructure (Render API, Vercel Web, managed PostgreSQL, Redis, S3/R2, SMTP sandbox, Stripe Test webhook, ClamAV daemon) has not been provisioned or smoke-tested live. See [docs/internal/STAGING_MANUAL_STEPS.md](internal/STAGING_MANUAL_STEPS.md).
- **Socket.IO Redis Adapter & Multi-Instance Live Soak Pending:** `@socket.io/redis-adapter` is implemented in `apps/api/src/lib/socket.ts` and documented in `.env.example` and `.env.staging.example` behind `ENABLE_SOCKET_REDIS_ADAPTER=false` (conservative default keeps the in-memory adapter). Enabling `ENABLE_SOCKET_REDIS_ADAPTER=true` requires a reachable `REDIS_URL` shared across all API replicas, and multi-replica soak testing has not yet been executed on hosted cloud infrastructure.
- **Email Worker Scope:** `apps/api/src/workers/worker.ts` validates BullMQ `EMAIL_DELIVERY` payloads with Zod at runtime, verifies trusted user and order participant records, and dispatches `ORDER_UPDATE` emails via `EmailService` (propagating SMTP failures for BullMQ retry/backoff). `VERIFY_EMAIL` and `PASSWORD_RESET` remain direct synchronous `EmailService` calls in authentication flows and are rejected as `UnrecoverableError` if queued, because authentication tokens are stored only as irreversible hashes and are never placed into Redis/BullMQ payloads. Live hosted SMTP inbox delivery has not yet been verified.
- **Local Load Test & Local Backup Restore Not Executed Locally:** Phase 4G (PR `#19`, merged `3633d34` and CI-verified) provides a localhost-guarded `k6` script and a disposable Docker PostgreSQL `pg_dump`/restore script, neither of which has been run in environments where `k6` or Docker Desktop is unavailable.

## 3. Dependency Audit Status (2026-11-28, Post-PR #28)

PR `#23` (`3a57607`) upgraded Next.js to `16.4.6`, PR `#25` (`6411a82`) moved `eslint-config-next` to `devDependencies`, and PR `#26` (`6b3b5b7`) upgraded the API's direct Zod dependency in `apps/api/package.json` to `^4.6.7` (resolved `4.6.7` in `pnpm-lock.yaml`). Fresh audits executed on 2026-11-28 report:

- **Production Dependencies (`pnpm audit --prod`, exit code 0):** 0 vulnerabilities (0 Critical, 0 High, 0 Moderate, 0 Low).
- **Full Workspace (`pnpm audit`, exit code 1):** 11 advisories — 0 Critical, 5 High, 5 Moderate, 1 Low. All 11 advisories reside exclusively in dev-only transitive dependency chains:
  - `zod@3.25.76` (1 High, `GHSA-mrhx-c7xc-m3w5`): separate dev-only transitive resolution via `@lhci/cli` -> `lighthouse` -> `puppeteer-core` -> `chromium-bidi` and `eslint-config-next` -> `eslint-plugin-react-hooks` (distinct from `@taskora/api`'s direct `zod@4.6.7`).
  - `extract-zip` (2 High), `basic-ftp` (1 High, 2 Moderate), `tmp` (1 High, 1 Low), `ip-address` (1 Moderate), `uuid` (1 Moderate): transitive dev dependencies under `@lhci/cli`.
  - `minimatch` (1 Moderate): transitive dev dependency under `typescript-eslint`, `nodemon`, and `eslint-config-next`.
- Historical pre-upgrade audit snapshot (2026-11-26) remains archived in [docs/internal/audits/dependency-audit-2026-11-26.txt](internal/audits/dependency-audit-2026-11-26.txt).

## 4. Product, Analytics & AI Boundaries

- **Profile View Telemetry Uninstrumented:** Analytics endpoints return `profileViews: null` until view-event ingestion is implemented.
- **AI Search Uses Deterministic Zero-Key Fallback:** Phase 4F (PR `#17`, merged `056cab2`) uses concept-expanded hashed vector embeddings plus caching for reproducible CI without external LLM keys; `pgvector` and hosted embedding providers are deferred until catalog scale justifies them.
- **Product UI Screenshots Intentionally Omitted:** Public `README.md` omits product screenshots rather than including placeholders, mockups, or unverified images.
- **Legacy Unused Dashboard Components:** Several older static/mock dashboard components remain unused in active routes; active pages consume real API/fixture contracts.

## 5. Monorepo & Repository Hygiene

- **Product vs. Package Naming Mismatch:** The user-facing brand and repository name is **TASCORA**, while root `package.json` is named `taskora` and the API workspace package is `@taskora/api` (with frontend workspace `web`).
- **Stub Shared Packages:** `packages/ui`, `packages/types`, and `packages/config` contain minimal `package.json` files without shared runtime code yet (only `packages/tsconfig` and `packages/eslint-config` hold shared configurations).
- **No Repository `LICENSE` File Yet:** Licensing requires an explicit decision by the repository owner; no `LICENSE` file has been auto-created.
