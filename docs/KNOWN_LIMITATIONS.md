# TASCORA Known Limitations

This document lists verified engineering, operational, and product limitations of the current codebase so reviewers and maintainers have an accurate picture of system boundaries.

## 1. Financial & Payment Boundaries

- **External Seller Payouts Are Disabled:** `PayoutService.process` (`apps/api/src/modules/financial/payout.service.ts`) defaults to `unavailablePayoutProvider` and fails closed with `503 Payout provider validation required`. Sellers can request a ledger reservation when payments are enabled, but no external bank transfer or Stripe Connect disbursement is implemented.
- **No Real Money Processing:** Stripe integration is restricted to Test Mode (`sk_test_*` / `rk_test_*`) or Disabled Mode (`PAYMENTS_PROVIDER=disabled`). Live Stripe keys are actively rejected in `NODE_ENV=test` and `APP_ENV=staging`.
- **Single Currency (`usd`):** Financial basis calculations (`apps/api/src/modules/financial/domain.ts`) enforce `order.currency === 'usd'` and reject multi-currency orders.

## 2. Deployment & Scaling Constraints

- **Hosted Staging Not Yet Verified:** Cloud infrastructure (Render API, Vercel Web, managed PostgreSQL, Redis, S3/R2, SMTP sandbox, Stripe Test webhook, ClamAV daemon) has not been provisioned or smoke-tested live. See [docs/internal/STAGING_MANUAL_STEPS.md](internal/STAGING_MANUAL_STEPS.md).
- **Single-Replica Socket.IO:** `apps/api/src/lib/socket.ts` uses the default in-memory Socket.IO adapter. Running multiple API replicas behind a load balancer will split real-time room broadcasts until a Redis Socket.IO adapter is configured.
- **In-Memory Rate Limiting:** `express-rate-limit` in `apps/api/src/server.ts` uses the default in-memory store. Multi-instance deployments require a shared Redis rate-limit store to enforce consistent per-IP quotas across replicas.
- **Docker Compose Worker Placeholder:** The `worker` service in `docker-compose.yml` currently runs `echo 'Worker placeholder' && tail -f /dev/null`. Scheduled jobs run in-process inside `apps/api/src/index.ts` only when `ENABLE_CRON=true` is explicitly set on a single designated owner instance.

## 3. Frontend & Product Gaps

- **Missing Gig Analytics Metrics:** `apps/web/src/app/[locale]/dashboard/gigs/page.tsx` initializes `revenue`, `impressions`, `clicks`, and `conversionRate` to `0` because backend gig-level impression/click analytics aggregation is not implemented.
- **Legacy Orphaned Dashboard Components:** Several static/mock dashboard components (including `ClientPaymentMethods.tsx`, `BalanceCards.tsx`, `RevenueBarChart.tsx`, `TransactionsTable.tsx`, `ProfileStrengthCard.tsx`, `RecommendedSpecialists.tsx`, `RevenueAreaChart.tsx`) remain in the repository with zero active route callers; full triage is scheduled in Phase FE.1 / FE.2.
- **Authenticated Dashboard Screenshots Pending:** Repository visual assets currently include verified Marketplace Home, Service Detail, and Mobile Catalog screenshots. Authenticated Buyer/Seller Dashboard screenshots will be captured once staging or local seeded E2E capture is completed.

## 4. Monorepo & Repository Hygiene

- **Product vs. Package Naming Mismatch:** The user-facing brand and repository name is **TASCORA**, while root `package.json` is named `taskora` and the API workspace package is `@taskora/api` (with frontend workspace `web`). Package renaming is intentionally deferred to avoid breaking workspace filters and CI scripts.
- **Stub Shared Packages:** `packages/ui`, `packages/types`, and `packages/config` contain minimal `package.json` files without shared runtime code yet (only `packages/tsconfig` and `packages/eslint-config` hold shared configurations).
- **No Repository `LICENSE` File Yet:** Licensing requires an explicit decision by the repository owner (MIT is recommended in internal portfolio drafts, but no `LICENSE` file has been auto-created).
