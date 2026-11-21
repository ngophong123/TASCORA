# TASCORA System Architecture

## 1. Architectural Style

TASCORA is structured as a **pnpm monorepo modular monolith** separating a Next.js frontend application (`apps/web`) from an Express/TypeScript backend application (`apps/api`) backed by a shared Prisma schema (`prisma/schema.prisma`).

This structure was chosen to preserve transactional integrity across orders, escrow, financial ledger entries, disputes, and KYC reviews without introducing distributed transaction overhead across premature microservices.

---

## 2. Monorepo Layout

```text
TASCORA/
├── apps/
│   ├── api/                 # Express 4 REST API, Socket.IO server, and workers
│   │   └── src/
│   │       ├── index.ts     # Process entrypoint (HTTP listen, graceful shutdown, opt-in cron)
│   │       ├── server.ts    # Express app assembly, raw Stripe webhook mount, middlewares, routes
│   │       ├── lib/         # Config, Prisma, Redis, Socket.IO, KYC crypto/keys, health, origin policy
│   │       ├── middlewares/ # JWT cookie auth (requireAuth), Zod request validation (validate)
│   │       ├── modules/     # 21 domain modules (route -> controller -> service -> Prisma)
│   │       └── workers/     # cron.ts, kyc-scan.worker.ts, kyc-hmac-migrate.ts, reputation.worker.ts
│   └── web/                 # Next.js 16 App Router frontend (en/vi localization via next-intl)
├── prisma/                  # PostgreSQL schema and ordered SQL migrations
├── packages/                # Shared tsconfig & eslint-config (ui/types/config are stubs)
├── scripts/                 # Seed utilities and safe non-production seed guard
├── tests/                   # unit/, api/, security/, database/, and e2e/ suites
├── docker/                  # Development and production Dockerfiles
└── docs/                    # Architecture, staging runbook, ADRs, and phase reports
```

---

## 3. Request & Security Boundary Layers (`apps/api/src/server.ts`)

Incoming HTTP requests traverse middleware in strict order:

1. **`helmet()`** — Baseline HTTP security headers.
2. **Stripe Raw Body Webhook (`/api/v1/payments/webhook`)** — Mounted **before** `express.json()` with a `256kb` raw JSON body parser so Stripe HMAC signatures verify against exact wire bytes.
3. **Trust Proxy (`apps/api/src/lib/trust-proxy.ts`)** — Explicit proxy hop configuration to avoid spoofed `X-Forwarded-For` client IPs.
4. **Origin & CORS Policy (`apps/api/src/lib/origin-policy.ts`)** — `Vary: Origin`, strict allowlist checks, credentialed cookie support, and optional Vercel preview origin verification with a 2-second abort timeout.
5. **JSON & URL-Encoded Body Parsers** — Standard API payload parsing.
6. **Health & Readiness Probes (`/health/live`, `/health`)** — Mounted **before** rate limiting so platform probes do not consume IP rate-limit buckets. `/health/live` confirms process liveness; `/health` verifies live PostgreSQL (`SELECT 1`) and Redis (`PING`) within a 4-second deadline and reports payment capability.
7. **Rate Limiting (`express-rate-limit`)** — Global IP limit (`100` req / `15m`) plus stricter `/api/v1/auth` limit (`30` req / `15m`). Currently in-memory (single-replica scope).
8. **Domain Routers (`/api/v1/*`)** — Authentication (`requireAuth`), Zod validation (`validate`), thin controllers, and transactional domain services.
9. **Centralized Error Handler** — Logs structured error metadata via Pino without leaking secrets or stack traces in production (`5xx` masked to generic message when `NODE_ENV=production`).

---

## 4. Backend Domain Modules (`apps/api/src/modules/`)

| Module                                                                 | Responsibility                                                                                                                                                                                             |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `auth` & `session`                                                     | Registration, bcrypt cost-12 password hashing, email verification, single-use password reset tokens, HTTP-only JWT cookie sessions, active session revocation                                              |
| `profile` & `onboarding`                                               | Public specialist profiles, buyer/seller onboarding state, account profile updates                                                                                                                         |
| `service` & `marketplace`                                              | Service catalog CRUD, tiered packages, deterministic recommendation scoring, category browsing                                                                                                             |
| `order`                                                                | Order creation with immutable purchase snapshots (`purchaseSnapshot`, `platformFeeBps`), explicit state machine transitions, deliveries, revisions, auto-completion                                        |
| `payment` & `financial`                                                | Stripe PaymentIntent creation, signed webhook handling, `ProviderEvent` deduplication, append-only `FinancialEntry` ledger, refunds, internal disputes, seller payout requests (external payouts disabled) |
| `wallet`                                                               | Seller earnings summary backed by ledger aggregations                                                                                                                                                      |
| `kyc`                                                                  | Seller identity verification workflow, AES-256-GCM PII encryption, versioned HMAC-SHA256 blind index, ClamAV malware scanning, admin approval/rejection                                                    |
| `upload`                                                               | Presigned/managed S3-compatible uploads, strict purpose isolation (`KYC` vs general media), reference validation                                                                                           |
| `message` & `notification`                                             | Persistent buyer-seller conversations, real-time Socket.IO events with session/membership verification, durable financial notification outbox                                                              |
| `review`, `favorite`, `coupon`, `analytics`, `email`, `admin`, `audit` | Post-order reviews, saved services, backend coupon validation, event logging, transactional email delivery, admin moderation & sanitized audit logs                                                        |

---

## 5. Background Jobs & Workers (`apps/api/src/workers/`)

- **`cron.ts`:** Runs scheduled maintenance tasks (order auto-completion, reputation updates, KYC scan batch processing). Controlled by `shouldEnableCron(process.env)` (`apps/api/src/lib/cron-config.ts`): **opt-in only (`ENABLE_CRON=true`) in staging/production** to enforce single-owner execution.
- **`kyc-scan.worker.ts`:** Processes quarantined KYC evidence buffers against `ClamdMalwareScanner` (or fail-closed `UnavailableMalwareScanner`), never promoting files to `VERIFIED_SAFE` unless every slot returns an explicit `stream: OK` verdict.
- **`kyc-hmac-migrate.ts`:** Offline CLI migration tool for rotating/backfilling KYC document HMAC blind indexes across key versions.
- **`reputation.worker.ts`:** Recomputes seller rating/completion reputation metrics.
- **Note on Docker Compose Worker:** `docker-compose.yml` currently defines the `worker` container as a placeholder (`tail -f /dev/null`); dedicated worker separation is tracked as a known limitation.

---

## 6. External Infrastructure Boundaries

| Dependency           | Usage                                                                | Failure Behavior                                                                                                                  |
| -------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **PostgreSQL 15**    | Primary transactional datastore, advisory locks, ledger, migrations  | `/health` returns `503`; API transactions fail closed                                                                             |
| **Redis 7**          | Health probe & caching primitives                                    | `/health` returns `503` when unreachable                                                                                          |
| **S3 / R2 Storage**  | Public service/avatar media & private KYC evidence objects           | Required in staging/production config validation; private KYC objects are isolated by prefix & purpose                            |
| **ClamAV (`clamd`)** | TCP `zINSTREAM` malware scanning for KYC uploads                     | Fail-closed: unconfigured keeps `QUARANTINED`, unreachable/timeout/indeterminate marks `SCAN_FAILED`                              |
| **Stripe**           | PaymentIntents & webhooks (`PAYMENTS_PROVIDER=stripe` or `disabled`) | Live keys blocked in staging/test; `disabled` mode keeps checkout/payouts fail-closed (`503`) without breaking non-payment routes |
| **SMTP**             | Verification & password reset emails                                 | Sandbox SMTP required in staging; no real production mail sent during tests                                                       |
