# TASCORA

[![Quality & Testing Toolchain](https://github.com/ngophong123/TASCORA/actions/workflows/quality.yml/badge.svg?branch=main)](https://github.com/ngophong123/TASCORA/actions/workflows/quality.yml)

**A full-stack freelance services marketplace monorepo built with Next.js 16, Express, TypeScript, Prisma, PostgreSQL, Redis, Socket.IO, BullMQ, and ClamAV.**

TASCORA implements service discovery, tiered package ordering, an append-only escrow ledger with Stripe test-mode payment and Connect lifecycle hooks, real-time buyer-seller messaging, envelope-encrypted seller KYC workflows, fail-closed malware scanning, Redis-backed distributed scaling primitives, ledger-backed KPI analytics, and hybrid semantic search with AI FinOps telemetry — verified across unit, API, security, Playwright E2E, Lighthouse CI, disposable PostgreSQL 15, Redis 7, and live ClamAV CI suites.

> **Scope & Payment Mode:** This repository is a demonstration application using sample/seed data and is not configured for real financial transactions. No hosted staging or live deployment has been verified. Payments run strictly in Stripe Test Mode (`sk_test_*` / `rk_test_*`) or Disabled Mode (`PAYMENTS_PROVIDER=disabled`, explicitly allowed in both `APP_ENV=staging` and `APP_ENV=production`). Live Stripe keys and `livemode=true` webhooks are rejected in every environment, and external seller payouts remain disabled (`unavailablePayoutProvider`, `503`).

---

## Tech Stack

| Layer                     | Technologies Used in Repository                                                                                                                                                                                                                      |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend (`apps/web`)** | Next.js 16.4.6 (App Router, Turbopack), React 19.2.8, TypeScript, Tailwind CSS v4, `next-intl` (`en`/`vi`), `@base-ui/react`, Framer Motion, Lucide Icons, Socket.IO Client, `@stripe/stripe-js`                                                     |
| **Backend (`apps/api`)**  | Node.js 22 (CI) / >=20, Express 4 (21 domain modules), TypeScript, Zod (`^4.6.7`, resolved `4.6.7`), Pino structured logging, Helmet, CORS, `express-rate-limit` (`rate-limit-redis`), Socket.IO (`@socket.io/redis-adapter`), BullMQ (`6.7.9`), JWT |
| **Data & Infra**          | Prisma 5 ORM (9 PostgreSQL migrations), PostgreSQL 15, Redis 7 (`ioredis`), S3-compatible object storage (`@aws-sdk/client-s3`), ClamAV (`clamd` TCP `zINSTREAM`), Stripe SDK (Test / Disabled modes)                                                |
| **Testing & Quality**     | Vitest (unit, API contract, security/IDOR, disposable PostgreSQL integration), Supertest, Playwright + `@axe-core/playwright`, Lighthouse CI, ESLint (strict zero-warning on web), Prettier, Husky + `lint-staged`                                   |

---

## Engineering Highlights

### 1. Append-Only Financial Ledger, Idempotency, Advisory Locks & Admin Recovery

Financial state transitions serialize per order via PostgreSQL transaction-scoped advisory locks (`pg_advisory_xact_lock`), enforce explicit order state-machine transitions, deduplicate Stripe webhook payloads via SHA-256 hash checks in `ProviderEvent` with provider-timestamp dispute ordering, record integer-cent movements in append-only `FinancialEntry` rows with unique `eventKey` constraints, and flush user notifications through a durable outbox outside the money transaction. Post-PR #28 adds an investigation-only Admin Financial Recovery workflow (`FinancialRecoveryCase` and append-only `FinancialRecoveryEvent` with PostgreSQL immutability triggers and database-side overview aggregations) that never clears financial holds or mutates ledger balances.

- **Key files:** [apps/api/src/modules/financial/domain.ts](apps/api/src/modules/financial/domain.ts), [apps/api/src/modules/payment/payment.service.ts](apps/api/src/modules/payment/payment.service.ts), [apps/api/src/modules/financial/refund.service.ts](apps/api/src/modules/financial/refund.service.ts), [apps/api/src/modules/financial/recovery-case.service.ts](apps/api/src/modules/financial/recovery-case.service.ts), [apps/api/src/modules/financial/reconciliation.service.ts](apps/api/src/modules/financial/reconciliation.service.ts), [tests/database/financial-system.spec.ts](tests/database/financial-system.spec.ts), [docs/FINANCIAL_ARCHITECTURE.md](docs/FINANCIAL_ARCHITECTURE.md).

### 2. Envelope-Encrypted Seller KYC PII & Versioned HMAC Blind Index

Sensitive seller KYC fields are encrypted with AES-256-GCM using HKDF-SHA256 subkeys derived per key version (`v2:<keyId>:<iv>:<tag>:<ciphertext>`). Duplicate document detection uses a dedicated, key-separated HMAC-SHA256 blind index (`KYC_DOCUMENT_HMAC_KEY`) supporting active and rotated key lookups plus an offline backfill worker, and startup validation rejects weak entropy or key reuse.

- **Key files:** [apps/api/src/lib/kyc-crypto.ts](apps/api/src/lib/kyc-crypto.ts), [apps/api/src/lib/kyc-key.ts](apps/api/src/lib/kyc-key.ts), [apps/api/src/modules/kyc/kyc-hmac-migration.service.ts](apps/api/src/modules/kyc/kyc-hmac-migration.service.ts), [tests/security/kyc-security.spec.ts](tests/security/kyc-security.spec.ts), [tests/security/kyc-hmac-migration.spec.ts](tests/security/kyc-hmac-migration.spec.ts).

### 3. Fail-Closed Upload Isolation & Live ClamAV `zINSTREAM` Scanning

Uploads track explicit ownership and purpose separation to prevent KYC, orphaned, replaced, infected, or unregistered objects from being referenced in non-KYC endpoints. `ClamdMalwareScanner` streams 64 KiB chunks over TCP `zINSTREAM` with backpressure handling, bounded concurrency, connect/idle/overall deadlines, and strict reply parsing. Unconfigured or unreachable scanners fail closed to `QUARANTINED` or `SCAN_FAILED` rather than `VERIFIED_SAFE`.

- **Key files:** [apps/api/src/modules/kyc/malware-scanner.ts](apps/api/src/modules/kyc/malware-scanner.ts), [apps/api/src/modules/upload/references.ts](apps/api/src/modules/upload/references.ts), [tests/security/clamd-scanner-hardening.spec.ts](tests/security/clamd-scanner-hardening.spec.ts), [tests/security/upload-chat-isolation.spec.ts](tests/security/upload-chat-isolation.spec.ts), [.github/workflows/infrastructure-acceptance.yml](.github/workflows/infrastructure-acceptance.yml).

### 4. Verified Origin Policy, Distributed Scaling Primitives, Email Worker & WebSocket Guardrails

CORS and Socket.IO handshakes enforce strict origin allowlists (with optional verified Vercel preview lookups using 2-second abort timeouts), derive sender identity solely from verified JWT sessions, and disconnect sockets immediately on session revocation. Redis-backed primitives include optional `@socket.io/redis-adapter` (configured via `ENABLE_SOCKET_REDIS_ADAPTER=false` by default in `.env.example` and `.env.staging.example`), `rate-limit-redis` with explicit fail-open/fail-closed outage policies, BullMQ queues with a dedicated worker entrypoint (`apps/api/src/workers/worker.ts`) performing strict Zod-validated `ORDER_UPDATE` SMTP delivery via `EmailService` (propagating transport failures for retry and rejecting raw-token auth templates as unrecoverable), and Redis `SET NX PX` + Lua cron locks.

- **Key files:** [apps/api/src/lib/origin-policy.ts](apps/api/src/lib/origin-policy.ts), [apps/api/src/lib/socket.ts](apps/api/src/lib/socket.ts), [apps/api/src/lib/distributed-lock.ts](apps/api/src/lib/distributed-lock.ts), [apps/api/src/lib/rate-limit-store.ts](apps/api/src/lib/rate-limit-store.ts), [apps/api/src/workers/queues.ts](apps/api/src/workers/queues.ts), [tests/security/socket-wire.spec.ts](tests/security/socket-wire.spec.ts).

### 5. Automated Documentation Truthfulness Checks

`tests/unit/docs-truthfulness.spec.ts` runs in CI to validate that repository documentation matches the codebase: exact environment variable names (`PAYMENTS_PROVIDER`), active health probe routes (`/health` and `/health/live`), backend module directory count (`21 domain modules`), installed UI primitives (`@base-ui/react`), valid relative Markdown links, and prohibited terminology rules across public docs.

- **Key files:** [tests/unit/docs-truthfulness.spec.ts](tests/unit/docs-truthfulness.spec.ts), [docs/TASCORA_FINAL_ENGINEERING_REVIEW.md](docs/TASCORA_FINAL_ENGINEERING_REVIEW.md).

---

## System Architecture

```mermaid
flowchart LR
    Browser["Browser (Next.js 16 Client)"] -->|HTTPS / REST + Cookies| Web["apps/web (Next.js App Router, next-intl)"]
    Browser -->|REST /api/v1/* + Socket.IO| API["apps/api (Express 4 Modular Monolith)"]
    Web -->|SSR Catalog Fetch| API

    API -->|Prisma ORM| PG[("PostgreSQL 15\nOrders, Ledger, KYC, Users")]
    API -->|ioredis| Redis[("Redis 7\nCache, Locks, Queues & Health")]
    API -->|S3 SDK| S3[("S3 / R2 Object Storage\nPublic Media & Private KYC")]
    API -->|TCP zINSTREAM :3310| ClamAV["ClamAV (clamd)\nFail-Closed Malware Scanner"]
    API -->|Test / Disabled Mode| Stripe["Stripe API & Signed Webhooks"]
    API -->|Opt-In Single Owner| Workers["Scheduled & Queue Workers\ncron.ts / BullMQ worker"]
```

---

## Payment, Escrow & Ledger Lifecycle

```mermaid
sequenceDiagram
    actor Buyer
    participant API as apps/api (PaymentService)
    participant PG as PostgreSQL (Advisory Lock + Ledger)
    participant Stripe as Stripe (Test Mode)

    Buyer->>API: POST /api/v1/payments/create-intent (orderId)
    API->>PG: pg_advisory_xact_lock(orderId) + reserve Transaction (attemptKey)
    API->>Stripe: paymentIntents.create(idempotencyKey = attemptKey)
    Stripe-->>API: client_secret + payment_intent id
    API->>PG: bind stripePaymentId
    API-->>Buyer: clientSecret

    Stripe->>API: POST /api/v1/payments/webhook (raw body signature)
    API->>PG: lockOrder + dedupe ProviderEvent (eventId + payloadHash)
    API->>PG: create Escrow + append FinancialEntry (PAYMENT_RECEIVED) + Order -> PAID
    API->>PG: flushFinancialNotices (durable outbox outside money tx)

    Note over API,PG: On Order Completion -> Escrow released (pending -> available).<br/>Seller Payouts: requestable in ledger, external execution intentionally disabled (503 unavailablePayoutProvider).
```

---

## Local Setup

### Prerequisites

- Node.js `>= 20.0.0` (CI runs Node.js `22`)
- `pnpm` (`packageManager: pnpm@12.4.1`)
- Docker (for PostgreSQL 15, Redis 7, and optional ClamAV)

### Quick Start

```bash
# 1. Install dependencies
pnpm install --frozen-lockfile

# 2. Start PostgreSQL, Redis, and ClamAV infrastructure
docker compose up -d postgres redis clamav

# 3. Copy environment template and fill local dev values
cp .env.example .env

# 4. Generate Prisma client and deploy schema migrations
pnpm db:generate
pnpm db:migrate:deploy

# 5. Run development servers (Web on :3200, API on :4000)
pnpm dev
```

See [apps/web/README.md](apps/web/README.md) for frontend-specific commands and workspace notes.

### Verification Commands & CI Coverage

```bash
# Typecheck + strict lint + unit tests
pnpm test:quick

# Individual suites
pnpm test:unit
pnpm test:api
pnpm test:security
pnpm run typecheck:tests:database

# Build API and Web workspaces
NEXT_PUBLIC_API_URL=https://api.example.com NEXT_PUBLIC_WEB_URL=https://web.example.com pnpm build
```

- **Main-branch Quality CI ([.github/workflows/quality.yml](.github/workflows/quality.yml)):** Runs on pushes to `main` and pull requests (`Lint & Typecheck`, `Playwright E2E Tests`, `Lighthouse CI Audits`). Verified green through PR `#28` (`d7e851d`).
- **Infrastructure Acceptance CI ([.github/workflows/infrastructure-acceptance.yml](.github/workflows/infrastructure-acceptance.yml)):** Runs on pull requests to `main` and manual `workflow_dispatch` against disposable `postgres:15-alpine`, `redis:7-alpine`, and live `clamav/clamav:stable` containers covering all 9 Prisma migrations, financial concurrency/recovery tests, and live ClamAV scanning (verified green on PR `#28`, plus PRs `#18`, `#19`, `#21`, `#22`, `#23`, `#26`, and `#27`). Because this workflow does not trigger on `push` to `main`, its badge is omitted from this README so badges reflect live `main` workflow state accurately.

---

## Documentation Index

- [System Architecture](docs/ARCHITECTURE.md)
- [Frontend Architecture](docs/FRONTEND_ARCHITECTURE.md) & [Web App README](apps/web/README.md)
- [Financial & Escrow Architecture](docs/FINANCIAL_ARCHITECTURE.md)
- [Implementation & Verification Status Matrix](docs/IMPLEMENTATION_STATUS.md)
- [Known Limitations](docs/KNOWN_LIMITATIONS.md)
- [Staging Runbook](docs/STAGING_RUNBOOK.md) & [Staging Readiness Report](docs/STAGING_READINESS_REPORT.md)
- [Architecture Decision Records (ADRs)](docs/adr/)
- [Codebase Overview](docs/EMPLOYER_REVIEW_PREVIEW.md)
- [Engineering Review](docs/TASCORA_FINAL_ENGINEERING_REVIEW.md)
- [Historical Dependency Audit Archive (2026-11-26)](docs/internal/audits/dependency-audit-2026-11-26.txt)

---

## Known Limitations (Summary)

- **Dependency Audit (2026-11-28, post-PR #28):** After PR `#25` moved `eslint-config-next` to `devDependencies` and PR `#26` upgraded the API's direct Zod dependency to `^4.6.7` (resolved `4.6.7` in `pnpm-lock.yaml`), `pnpm audit --prod` reports 0 vulnerabilities (exit code 0). The full workspace audit (`pnpm audit`, exit code 1) still reports 11 advisories (0 Critical, 5 High, 5 Moderate, 1 Low), all inside dev-only transitive dependency chains (`@lhci/cli`, `eslint-config-next`, `typescript-eslint`, and `nodemon`, including transitive dev-only `zod@3.25.76`).
- **Monorepo Naming & Stub Packages:** Root package is named `taskora` (API `@taskora/api`, Web `web`) while the product brand is `TASCORA`; `packages/ui`, `packages/types`, and `packages/config` remain stubs, and no `LICENSE` file has been added yet.

See [docs/KNOWN_LIMITATIONS.md](docs/KNOWN_LIMITATIONS.md) for the complete list, including payment/payout boundaries, hosted staging blockers, and product/AI scope limits.

---

## Roadmap Delivery Summary (Merged into `main`)

- **Batch 1 (Merged, PRs `#7`–`#12`):** Phase 0 baseline audit, staging readiness guardrails, repository documentation foundation, frontend audit and remediation, and automated docs-truthfulness regression suite.
- **Batch 2 & Hardening (Merged into `main` through `d7e851d`, PRs `#13`–`#28`):** Hosted staging acceptance harness (`#13`), marketplace E2E workflow map and IDOR suite (`#14`), Stripe Connect test mode and read-only reconciliation (`#15`), ledger-backed KPI analytics (`#16`), hybrid semantic search and AI FinOps evaluation (`#17`), Redis distributed scaling primitives (`#18`), readiness tooling and secret scanning (`#19`), master engineering review (`#20`), API security hardening (`#21`), frontend route integrity (`#22`), Next.js `16.4.6` dependency remediation (`#23`), documentation sync (`#24`), repository hygiene and ESLint devDependency cleanup (`#25`), API Zod v4 upgrade to `^4.6.7` (`#26`), financial integrity & chargeback/dispute ordering hardening (`#27`), and Admin Financial Recovery case management (`#28`).
