# TASCORA Codebase Overview

Technical overview of the TASCORA repository architecture, CI verification evidence, and operational boundaries on `main` (`d7e851d`, updated 2026-11-28).

## 1. Repository Overview

- **Stack:** Full-stack freelance services marketplace monorepo built with `pnpm` workspaces (`apps/web` frontend on Next.js 16.4.6 + React 19.2.8 + Tailwind CSS v4 + `next-intl`; `apps/api` backend on Express 4 + TypeScript + Zod `^4.6.7` / `4.6.7` + Prisma 5 with 9 PostgreSQL migrations + PostgreSQL 15 + Redis 7 + Socket.IO + BullMQ + ClamAV).
- **Branch state:** PRs #7–#28 are merged into `main`. Historical handoff notes and point-in-time audits are stored under `docs/internal/`.
- **Operating mode & deployment status:** Payments run strictly in Stripe Test Mode (`sk_test_*` / `rk_test_*`) or explicit Disabled Mode (`PAYMENTS_PROVIDER=disabled`, permitted in both staging and production), live Stripe keys and `livemode=true` webhooks are rejected in every environment, external seller payouts fail closed (`503 unavailablePayoutProvider`), and no hosted staging or live cloud deployment has been provisioned or verified.

## 2. Architecture & Critical Source Files

Start with [README.md](../README.md) and [docs/ARCHITECTURE.md](ARCHITECTURE.md), then inspect the implementation directly:

- **Backend Modular Monolith (21 domain modules):** `apps/api/src/modules/` — core order state machine and advisory locking in `apps/api/src/modules/financial/domain.ts`, order checkout idempotency in `apps/api/src/modules/order/order.service.ts`, and admin financial recovery case management in `apps/api/src/modules/financial/recovery-case.service.ts` (PR `#28`).
- **Frontend App Router (25 localized `en`/`vi` pages):** `apps/web/src/app/[locale]/`, UI primitives using `@base-ui/react`, documented in [docs/FRONTEND_ARCHITECTURE.md](FRONTEND_ARCHITECTURE.md) and [apps/web/README.md](../apps/web/README.md).
- **Distributed Scaling Primitives & Email Worker:** `apps/api/src/lib/socket.ts` (`@socket.io/redis-adapter`, `ENABLE_SOCKET_REDIS_ADAPTER=false` default), `apps/api/src/lib/distributed-lock.ts`, `apps/api/src/lib/rate-limit-store.ts`, `apps/api/src/workers/queues.ts`, and `apps/api/src/workers/worker.ts` (Zod-validated `ORDER_UPDATE` SMTP delivery via `EmailService`; auth-token templates remain synchronous).
- **Analytics & AI Search (PRs #16–#17):** `apps/api/src/modules/analytics/kpi-calculator.ts`, `apps/api/src/modules/service/semantic-search.service.ts`, and `apps/api/src/lib/ai-finops.ts`.
- **Architecture Decision Records:** [docs/adr/README.md](adr/README.md) (`ADR-001` through `ADR-005`).

## 3. Financial Integrity & Security

- **Append-Only Ledger, Advisory Locks & Admin Recovery:** Integer-cent `FinancialEntry` accounting serialized with `pg_advisory_xact_lock`, SHA-256 Stripe webhook deduplication (`ProviderEvent`), provider-timestamp dispute ordering (PR `#27`), read-only reconciliation (`apps/api/src/modules/financial/reconciliation.service.ts`), and decoupled investigation-only recovery case management (`FinancialRecoveryCase` + append-only `FinancialRecoveryEvent`, [docs/FINANCIAL_ARCHITECTURE.md](FINANCIAL_ARCHITECTURE.md)).
- **Stripe Test-Only & Disabled-Only Guardrails:** `apps/api/src/lib/config.ts`, `apps/api/src/lib/payment-provider.ts`, `apps/api/src/modules/payment/payment.controller.ts`, and `apps/api/src/modules/financial/stripe-connect.service.ts` reject `sk_live_*`/`rk_live_*` keys and `livemode=true` (or invalid-mode) events in every environment; `apps/api/src/modules/financial/payout.service.ts` fails closed with `503 unavailablePayoutProvider`.
- **Seller KYC Encryption & Upload Isolation:** AES-256-GCM envelope encryption with HKDF-SHA256 subkeys and versioned HMAC-SHA256 blind indexes (`apps/api/src/lib/kyc-crypto.ts`, `apps/api/src/lib/kyc-key.ts`), strict upload purpose isolation (`apps/api/src/modules/upload/references.ts`), and fail-closed TCP `zINSTREAM` ClamAV scanning (`apps/api/src/modules/kyc/malware-scanner.ts`).
- **Session, Origin & Validation Hardening:** Strict origin allowlist (`apps/api/src/lib/origin-policy.ts`), immediate Socket.IO disconnect on session revocation (`apps/api/src/lib/socket.ts`), WS5 API security hardening (PR `#21`), and API Zod v4 (`4.6.7`, PR `#26`).

## 4. Testing & CI Evidence

Inspect [.github/workflows/quality.yml](../.github/workflows/quality.yml), [.github/workflows/infrastructure-acceptance.yml](../.github/workflows/infrastructure-acceptance.yml), and [docs/IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md):

- **Main-Branch Quality CI (`quality.yml`):** Shown as the live badge in `README.md`. Runs `Lint & Typecheck` (including zero-warning web ESLint and `tests/unit/docs-truthfulness.spec.ts`), `Playwright E2E Tests` (`@axe-core/playwright`), and `Lighthouse CI Audits`. Verified green through PR `#28` (`d7e851d`, Run `46007495814`).
- **PR & Manual Infrastructure Acceptance (`infrastructure-acceptance.yml`):** Runs on pull requests to `main` and manual `workflow_dispatch` against real `postgres:15-alpine`, `redis:7-alpine`, and `clamav/clamav:stable` service containers to validate all 9 Prisma migrations, financial concurrency locks, recovery case triggers/aggregations, EICAR malware rejection, and fail-closed timeouts. Verified green on PR `#28` (Run `46007495839`). Because it does not trigger on `push` to `main`, its badge is not displayed in `README.md`.

## 5. Known Limitations

Full boundaries are documented in [docs/KNOWN_LIMITATIONS.md](KNOWN_LIMITATIONS.md):

1. **No Hosted Staging URL Yet (`BLOCKED`):** Cloud provisioning (Render, Vercel, managed PostgreSQL/Redis/S3/Mailtrap/ClamAV) and multi-instance hosted soak testing remain unexecuted; manual steps are in [docs/internal/STAGING_MANUAL_STEPS.md](internal/STAGING_MANUAL_STEPS.md).
2. **Dependency Advisories (2026-11-28):** After PR `#23` (Next.js `16.4.6`), PR `#25` (`eslint-config-next` moved to `devDependencies`), and PR `#26` (API direct Zod `^4.6.7`, resolved `4.6.7`), `pnpm audit --prod` reports 0 vulnerabilities (exit code 0). Full `pnpm audit` reports 11 dev-only transitive advisories (0 Critical, 5 High, 5 Moderate, 1 Low; exit code 1) via `@lhci/cli`, `eslint-config-next`, `typescript-eslint`, and `nodemon` (including transitive dev-only `zod@3.25.76`).
3. **Intentionally Disabled External Payouts & Test-Only Stripe:** Live money movement is not enabled.
4. **Repository Hygiene Items:** Brand (`TASCORA`) vs package (`taskora` / `@taskora/api` / `web`) naming drift, stub shared packages (`packages/ui`, `packages/types`, `packages/config`), uninstrumented `profileViews: null`, no UI screenshots in `README.md`, and no `LICENSE` file yet.

## 6. Local Verification

With Node.js >=20 and `pnpm@12.4.1`, the workspace can be verified locally without external cloud accounts:

```bash
# Install exact locked workspace dependencies
pnpm install --frozen-lockfile

# Run typecheck, strict lint, and unit tests (including docs-truthfulness gate)
pnpm test:quick

# Run individual automated suites
pnpm test:unit
pnpm test:api
pnpm test:security
pnpm exec vitest run tests/unit/docs-truthfulness.spec.ts

# Inspect current dependency advisories directly
pnpm audit
pnpm audit --prod
```

With Docker running locally, PostgreSQL 15, Redis 7, and ClamAV can be started via `docker compose up -d postgres redis clamav` to execute database migrations (`pnpm db:migrate:deploy`) and run the API (`:4000`) and Web app (`:3200`) together via `pnpm dev`.
