# TASCORA — Project Current State (Phase 0 Baseline)

- **Audit Date:** 2026-11-20
- **Repository:** `https://github.com/ngophong123/TASCORA`
- **Verified Baseline (`origin/main`):** `a6501f380a00f38cf5e1d4e9b05720eb5e8a90d2` (`fix(ci): complete Phase 4A.6 database acceptance (#6)`)
- **Architecture:** Modular Monolith (`pnpm` Workspaces)
- **Target Mode:** Portfolio / Demo / Stripe Test Mode only (no live production payouts)

---

## 1. Git & CI Baseline

### Recent Merged Pull Requests

|    PR     | Merge Commit / Date                  | Summary                                                                                    |
| :-------: | :----------------------------------- | :----------------------------------------------------------------------------------------- |
|   `#6`    | `a6501f3` (`2026-11-18`)             | Phase 4A.6 KYC vault, upload/delivery isolation, PostgreSQL 15 & live ClamAV CI acceptance |
|   `#5`    | `8dca916` (`2026-11-17`)             | Align financial database test fixtures with Stripe SDK v22                                 |
|   `#4`    | `03da722` (`2026-10-16`)             | Premium UI/UX Redesign & Performance Optimization                                          |
|   `#3`    | `5549d3e` (`2026-10-08`)             | Layerbase Redis TLS SNI connection & readiness health probes                               |
| `#1`–`#2` | `6f93f8d` / `5fc6121` (`2026-10-07`) | Seed data, payments-disabled staging mode, trust-proxy parser                              |

### Active GitHub Actions Workflows & Latest Results

| Workflow                                            | File                                              | Latest Verified Run                                     | Jobs                                                                                                                                         | Result           |
| :-------------------------------------------------- | :------------------------------------------------ | :------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------- | :--------------- |
| **Quality & Testing Toolchain**                     | `.github/workflows/quality.yml`                   | Run `44245858381` (`main` @ `a6501f3`)                  | Lint & Typecheck, Playwright E2E Tests, Lighthouse CI Audits                                                                                 | **PASS** (`3/3`) |
| **Infrastructure Acceptance (PostgreSQL & ClamAV)** | `.github/workflows/infrastructure-acceptance.yml` | Run `44239671402` (PR #6 `dad5a83`) & Run `44227759914` | Real PostgreSQL 15 Migrations (`6/6`), `36/36` DB integration tests (`0` skipped), live `ClamAV 1.5.4` EICAR/clean/mixed/fail-closed/timeout | **PASS**         |

---

## 2. Monorepo & Architecture Inventory

### Workspace Packages (`8` manifests)

| Path                                  | Package Name             | Deps / DevDeps | Status                                                               |
| :------------------------------------ | :----------------------- | :------------: | :------------------------------------------------------------------- |
| `package.json`                        | `taskora`                |   `1` / `19`   | Active monorepo root scripts & shared test/Prisma toolchain          |
| `apps/api/package.json`               | `@taskora/api`           |  `17` / `16`   | Active Express + Prisma + Redis + Socket.IO + Stripe backend         |
| `apps/web/package.json`               | `web`                    |  `16` / `10`   | Active Next.js 16 (App Router) + React 19 + Tailwind CSS v4 frontend |
| `packages/eslint-config/package.json` | `@taskora/eslint-config` |   `4` / `0`    | Active shared ESLint config (`index.js`)                             |
| `packages/tsconfig/package.json`      | `@taskora/tsconfig`      |   `0` / `0`    | Active shared TS configs (`base.json`, `nextjs.json`, `node.json`)   |
| `packages/ui/package.json`            | `@taskora/ui`            |   `0` / `0`    | **Empty shell** (points to `./src/index.ts`, no `src/`, `0` imports) |
| `packages/types/package.json`         | `@taskora/types`         |   `0` / `0`    | **Empty shell** (points to `./src/index.ts`, no `src/`, `0` imports) |
| `packages/config/package.json`        | `@taskora/config`        |   `0` / `0`    | **Empty shell** (points to `./src/index.ts`, no `src/`, `0` imports) |

### Backend Modules (`apps/api/src/`)

- **21 domain module directories** under `apps/api/src/modules/`:
  `admin`, `analytics`, `audit`, `auth`, `coupon`, `email`, `favorite`, `financial`, `kyc`, `marketplace`, `message`, `notification`, `onboarding`, `order`, `payment`, `profile`, `review`, `service`, `session`, `upload`, `wallet`.
- **19 top-level `/api/v1/*` route mounts** in `apps/api/src/server.ts` plus raw-body `/api/v1/payments/webhook`, `/health`, and `/health/live`. `kyc` routes are mounted under `onboarding.route.ts` and `admin.route.ts`; `audit` is an internal compliance service.
- **4 worker modules** under `apps/api/src/workers/`: `cron.ts`, `reputation.worker.ts`, `kyc-scan.worker.ts`, `kyc-hmac-migrate.ts`.
- **14 shared libraries** under `apps/api/src/lib/`: `config`, `errors`, `health`, `kyc-crypto`, `kyc-key`, `logger`, `origin-policy`, `payment-provider`, `prisma`, `public-profile`, `redis`, `redis-connection`, `socket`, `trust-proxy`.

### Frontend Routes (`apps/web/src/app/[locale]/` — `25` pages)

- **Public & Auth (`12`):** `/`, `/explore`, `/services`, `/services/[id]`, `/categories`, `/categories/[slug]`, `/freelancers/[id]`, `/login`, `/register`, `/verify-email`, `/forgot-password`, `/reset-password`.
- **Buyer / Seller / Admin Workspaces (`13`):** `/dashboard`, `/dashboard/orders`, `/dashboard/gigs`, `/dashboard/gigs/new`, `/dashboard/gigs/[id]/edit`, `/dashboard/messages`, `/dashboard/notifications`, `/dashboard/earnings`, `/dashboard/payments`, `/dashboard/saved`, `/dashboard/settings`, `/dashboard/admin`, `/seller/dashboard`.

### Database Schema (`prisma/`)

- **Models:** `42`
- **Enums:** `12` (`UserRole`, `AccountStatus`, `SellerStatus`, `VerificationStatus`, `ServiceStatus`, `PackageType`, `OrderStatus`, `TransactionStatus`, `PayoutStatus`, `NotificationType`, `SellerLevel`, `WalletTransactionType`)
- **Migrations:** `6` (`20261005000000_initial`, `20261006000000_financial_system`, `20261114000000_identity_kyc_audit`, `20261115000000_kyc_quarantine_truncate_integrity`, `20261115120000_kyc_worker_uploads_hmac`, `20261116000000_kyc_cross_key_fingerprints`)

### Test Suites

- `tests/unit/` — `13` files (including Phase 0 dashboard baseline regressions)
- `tests/api/` — `11` files
- `tests/database/` — `2` files (`36` real PostgreSQL tests: `financial-system.spec.ts` `22` + `disposable-postgres.spec.ts` `14`)
- `tests/security/` — `17` files
- `tests/e2e/` — `15` Playwright specs
- `tests/premium/` — `21` UI/performance/a11y specs

---

## 3. Feature Verification Matrix

| Capability                                                                                                                               | Verification Level      | Notes                                                                                                                         |
| :--------------------------------------------------------------------------------------------------------------------------------------- | :---------------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| Auth (registration, email verification, refresh token rotation, session revocation, password recovery)                                   | **CI VERIFIED**         | Unit, API, Security, real Postgres, and E2E specs pass in CI                                                                  |
| Marketplace (catalog, categories, services CRUD, seller/freelancer profiles, deterministic recommendations, favorites, coupons, reviews) | **CI VERIFIED**         | API, Security, E2E, and Premium specs pass in CI                                                                              |
| Orders, Delivery, Revision, Messaging (Socket.IO), Notifications                                                                         | **CI VERIFIED**         | Real Postgres concurrency tests + Socket.IO wire/authorization tests pass in CI                                               |
| Payments (Stripe Test Mode + Staging `PAYMENTS_PROVIDER=disabled`), Escrow, Ledger, Refunds, Disputes, Reconciliation                    | **CI VERIFIED**         | `22/22` real PostgreSQL financial tests + API/security specs pass in CI                                                       |
| KYC Vault (AES-256-GCM `v2:<keyId>`, HKDF, separate HMAC blind-index, key rotation, cross-key DB fingerprints, append-only audit logs)   | **CI VERIFIED**         | Security suites + `14/14` real PostgreSQL migration/trigger tests pass in CI                                                  |
| Upload Security & Live ClamAV Quarantine (`UploadObject` registry, delivery/chat/profile isolation, fail-closed `clamd`)                 | **CI VERIFIED**         | Live `clamav/clamav:stable` CI acceptance passes EICAR/clean/mixed/unreachable/timeout/disabled                               |
| Redis TLS SNI, `/health` & `/health/live`, Trust Proxy, CORS + Verified Vercel Preview Origins                                           | **CI VERIFIED**         | Unit, API, and Security specs pass in CI                                                                                      |
| **External Seller Payouts / Stripe Connect**                                                                                             | **DISABLED**            | Intentionally disabled (`externalPayoutsAvailable: false`, `payoutProviderAvailable: false`, `eligibleForLivePayouts: false`) |
| **Hosted Staging Verification (Render + Vercel + Neon + Layerbase + B2 + Mailtrap)**                                                     | **NOT HOSTED VERIFIED** | Scheduled for Phase 4A.7 preparation and subsequent operator-authorized hosted smoke                                          |

---

## 4. Disabled, Placeholder, or Partial Areas

1. **Stripe Connect & External Payouts:** Disabled by design (`payment-provider.ts`, `financial.route.ts`, `payout-eligibility.ts`). Payout requests are recorded in the ledger without executing live external transfers.
2. **Docker Background Worker:** `docker-compose.yml` defines `worker` as a placeholder (`echo 'Worker placeholder' && tail -f /dev/null`); cron and KYC scan workers currently run in-process inside `apps/api/src/index.ts`.
3. **Socket.IO Adapter:** Uses default in-memory adapter (`@socket.io/redis-adapter` is not installed); requires single API replica until Redis adapter is added.
4. **Rate Limiting Store:** `express-rate-limit` uses process-local memory across `server.ts`, `auth.rate-limit.ts`, and `upload.route.ts`.
5. **Analytics & Billing Details:** `AnalyticsService.getSellerDashboardMetrics()` returns `null` for `totalEarnings`, `profileViews`, and `conversionRate`; buyer stored payment methods and downloadable invoices are explicitly unavailable.

---

## 5. Legacy & Historical Documentation Classification

| Document                                                                                                                                                           | Status                           | Scope / Notes                                                                                                              |
| :----------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| `docs/PROJECT_CURRENT_STATE.md`                                                                                                                                    | **ACTIVE (Source of Truth)**     | Canonical baseline as of `origin/main` `a6501f3` + Phase 0                                                                 |
| `docs/reports/phase-0.md`                                                                                                                                          | **ACTIVE**                       | Phase 0 baseline audit, fixes, evidence, and interview guide                                                               |
| `README.md`                                                                                                                                                        | **OUTDATED**                     | Still reflects an initial prompt specification (`# TASKORA`); scheduled for portfolio rewrite in final documentation phase |
| `CONTINUE_TOMORROW.md`                                                                                                                                             | **HISTORICAL / SUPERSEDED**      | Snapshot from `2026-10-07` (`feat/seed-data`); banner added                                                                |
| `DEPLOYMENT_AUDIT.md`                                                                                                                                              | **HISTORICAL / SUPERSEDED**      | Snapshot from `2026-10-07`; predates PR #4/#5/#6; banner added                                                             |
| `STAGING_SETUP_REQUIRED.md`                                                                                                                                        | **HISTORICAL / SUPERSEDED**      | Snapshot from `2026-10-07`; to be replaced by `docs/STAGING_RUNBOOK.md` in Phase 4A.7; banner added                        |
| `HOSTED_PROVIDER_VALIDATION.md`                                                                                                                                    | **HISTORICAL / SUPERSEDED**      | Snapshot from `2026-10-07`; banner added                                                                                   |
| `FINANCIAL_SYSTEM_AUDIT.md`                                                                                                                                        | **HISTORICAL / SUPERSEDED**      | Snapshot from `2026-10-07`; predates Stripe v22 & Postgres 15 CI acceptance; banner added                                  |
| `MARKETPLACE_INTEGRATION_AUDIT.md`                                                                                                                                 | **HISTORICAL / SUPERSEDED**      | Snapshot from `2026-10-07`; banner added                                                                                   |
| `REDIS_RENDER_DIAGNOSTICS.md`                                                                                                                                      | **HISTORICAL (VALID REFERENCE)** | Documents PR #3 Layerbase Redis TLS SNI fix (`2026-10-08`)                                                                 |
| `SEED_NOTES.md`, `SERVICE_IMAGE_AUDIT.md`                                                                                                                          | **HISTORICAL**                   | Pre-PR #6 local seed/image references                                                                                      |
| `docs/PREMIUM_*`, `docs/TASCORA_CINEMATIC_*`, `docs/QA_EVIDENCE.md`, `docs/PRE_MERGE_RELEASE_AUDIT.md`, `docs/CI_PLAYWRIGHT_*`, `docs/CORS_PERMANENT_FIX_AUDIT.md` | **HISTORICAL (PR #4)**           | PR #4 UI/UX redesign, motion, and performance audit artifacts                                                              |

---

## 6. Technical Debt & Phase 0 Audit Findings

1. **Resolved in Phase 0:**
   - Fixed broken `CommandPalette` route (`/dashboard/gigs/create` → `/dashboard/gigs/new`), migrated `CommandPalette` to locale-aware `useRouter` from `@/i18n/routing`, removed stale hardcoded `"48+"` catalog copy, and added unit regression tests.
   - Verified zero references and removed orphaned `WithdrawDialog.tsx` fake payout simulator (`setTimeout`, fake PayPal/bank destination).
   - Clarified unavailable time-series/profile-view analytics notice on `/dashboard`.
   - Marked superseded October 2026 root handoff documents and established `docs/PROJECT_CURRENT_STATE.md`.
2. **Remaining Technical Debt (Tracked for Subsequent Phases):**
   - **`ENABLE_CRON` Opt-Out Default:** `apps/api/src/index.ts` starts cron & KYC scan workers whenever `ENABLE_CRON !== 'false'`, conflicting with staging docs recommending disabled-by-default single-owner control → address in **Phase 4A.7**.
   - **Naming Inconsistency:** `TASCORA` brand vs `taskora` / `@taskora/*` package names & `apps/web` (`web`) → report-only in Phase 0; evaluate deliberately before any breaking rename.
   - **Empty Workspace Packages:** `packages/ui`, `packages/types`, `packages/config` have no `src/` and zero imports → populate shared types or prune in a dedicated cleanup PR.
   - **Orphaned Legacy Dashboard Components & Static Data:** `ClientPaymentMethods.tsx`, `BalanceCards.tsx`, `RevenueBarChart.tsx`, `TransactionsTable.tsx`, `ProfileStrengthCard.tsx`, `RecommendedSpecialists.tsx`, `RevenueAreaChart.tsx`, and unused mock arrays in `apps/web/src/data/dashboard/*` → audit and clean in **Phase FE.1**.
   - **Single-Replica Runtime Limits:** In-memory Socket.IO adapter, in-memory `express-rate-limit`, placeholder Docker `worker` → distributed systems phase.
   - **CI Runtime Notices:** GitHub Actions Node.js 20 deprecation on `@v4` actions and `ubuntu-latest` → Ubuntu 26 notice (non-blocking).
   - **Hosted Staging Verification:** Still unverified end-to-end → **Phase 4A.7** (preparation) followed by operator-authorized staging smoke.

---

## 7. Recommended Next Phase

- **Next Phase:** **Phase 4A.7 — Staging Readiness** (environment audit matrix, Stripe Test Mode guard verification, safe allowlisted seed design, single-owner `ENABLE_CRON` design, `docs/STAGING_RUNBOOK.md`, and manual deployment checklist — preparation only, no live deploy).
