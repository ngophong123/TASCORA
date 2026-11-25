# TASCORA Known Limitations

This document lists verified engineering, operational, and product limitations of the current codebase so reviewers and maintainers have an accurate picture of system boundaries.

## 1. Financial & Payment Boundaries

- **External Seller Payouts Are Intentionally Disabled by Default:** `PayoutService.process` (`apps/api/src/modules/financial/payout.service.ts`) defaults to `unavailablePayoutProvider` and fails closed with `503 Payout provider validation required`. Phase 4C (PR `#15`) adds strictly test-mode Stripe Connect onboarding/eligibility and read-only reconciliation while keeping live real-money payouts unconditionally disabled.
- **No Real Money Processing:** Stripe integration is restricted to Test Mode (`sk_test_*` / `rk_test_*`) or Disabled Mode (`PAYMENTS_PROVIDER=disabled`). Live Stripe keys and `livemode=true` webhooks are actively rejected.
- **Single Currency (`usd`):** Financial basis calculations (`apps/api/src/modules/financial/domain.ts`) enforce `order.currency === 'usd'` and reject multi-currency orders.

## 2. Deployment, Operations & Scaling Constraints

- **Hosted Staging Not Yet Verified (`BLOCKED`):** Cloud infrastructure (Render API, Vercel Web, managed PostgreSQL, Redis, S3/R2, SMTP sandbox, Stripe Test webhook, ClamAV daemon) has not been provisioned or smoke-tested live. See [docs/internal/STAGING_MANUAL_STEPS.md](internal/STAGING_MANUAL_STEPS.md).
- **Multi-Instance Live Soak Pending:** Phase 4D (PR `#18`) adds `@socket.io/redis-adapter`, `rate-limit-redis`, BullMQ queues/worker, and Redis distributed cron locks, but multi-replica staging soak testing has not been executed on hosted infrastructure yet.
- **Local Load Test & Local Backup Restore Not Executed Locally:** Phase 4G (PR `#19`) provides a localhost-guarded `k6` script and a disposable Docker PostgreSQL `pg_dump`/restore script, but neither was executed in the dev workstation because `k6` is not installed and Docker Desktop daemon was not running.
- **Dependency Audit Upgrades Tracked Separately:** `pnpm audit` reports advisories across `next@16.3.5`, `proxy-addr`, `nodemailer`, and transitive dev tooling; remediation is tracked for a dedicated dependency upgrade PR with full E2E verification.

## 3. Product, Analytics & AI Boundaries

- **Profile View Telemetry Uninstrumented:** Analytics endpoints explicitly return `profileViews: null` rather than fabricated numbers until real view-event ingestion is added.
- **AI Search Uses Deterministic Zero-Key Fallback:** Phase 4F (PR `#17`) uses concept-expanded hashed vector embeddings + caching for reproducible CI without external LLM keys; `pgvector` and hosted embedding providers are deferred until catalog scale justifies them.
- **Product UI Screenshots Intentionally Omitted:** Public `README.md` intentionally omits product screenshots (no placeholders, mockups, or unverified images are included).
- **Legacy Orphaned Dashboard Components:** Several static/mock dashboard components remain unused in active routes; active pages consume real API/fixture contracts.

## 4. Monorepo & Repository Hygiene

- **Product vs. Package Naming Mismatch:** The user-facing brand and repository name is **TASCORA**, while root `package.json` is named `taskora` and the API workspace package is `@taskora/api` (with frontend workspace `web`).
- **Stub Shared Packages:** `packages/ui`, `packages/types`, and `packages/config` contain minimal `package.json` files without shared runtime code yet (only `packages/tsconfig` and `packages/eslint-config` hold shared configurations).
- **No Repository `LICENSE` File Yet:** Licensing requires an explicit decision by the repository owner (MIT is recommended in internal portfolio drafts, but no `LICENSE` file has been auto-created).
