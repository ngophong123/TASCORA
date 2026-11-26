# TASCORA — Final Master Engineering Review

- **Review Date:** `2026-11-26`
- **Repository:** `ngophong123/TASCORA`
- **Verified `main` Baseline:** `9477e67f583c010ede30ad6ea937f7a53e94b6c6` (PRs `#7`–`#23` merged into `main`, `0` open PRs at baseline)
- **CI Evidence at Baseline:** `Quality & Testing Toolchain` Run `45601267339` (`completed / success` on `main` @ `9477e67`); `Infrastructure Acceptance (PostgreSQL & ClamAV)` Run `45600525400` (`completed / success` on PR `#23` @ `5cd9dee`)
- **Portfolio Verdict:** **`Portfolio Ready with Known Limitations`** (Explicitly **NOT** claiming hosted staging or live deployment readiness)

---

## 1. Executive Summary

TASCORA is a full-stack freelance services marketplace monorepo (`Next.js 16.4.6`, `React 19`, `Tailwind CSS v4`, `next-intl` frontend; `Express 4`, `TypeScript`, `Prisma 5`, `PostgreSQL 15`, `Redis 7`, `Socket.IO`, `BullMQ`, `ClamAV` backend).

All Batch 1 (`#7`–`#12`) and Batch 2 / Hardening (`#13`–`#23`) pull requests are merged into `main`. Across the merged codebase, verification covers five core engineering areas:

1. **Financial Accounting & Concurrency:** Integer-cent arithmetic, per-order PostgreSQL advisory locks (`pg_advisory_xact_lock`), immutable order snapshots, append-only `FinancialEntry` ledger, SHA-256 webhook deduplication, Stripe Connect test-mode workflows, and read-only ledger reconciliation.
2. **Data Protection & Upload Security:** AES-256-GCM envelope encryption with HKDF-SHA256 subkeys and versioned HMAC-SHA256 blind indexes for Seller KYC, strict upload purpose isolation, WS5 API security hardening, and fail-closed live ClamAV `zINSTREAM` malware scanning.
3. **Distributed Systems Primitives:** Modular Monolith preserved while adding `@socket.io/redis-adapter`, Redis-backed rate limiting with explicit fail-open vs fail-closed outage policies, BullMQ queues with a dedicated worker entrypoint, Redis `SET NX PX` + Lua single-owner cron locking, and correlated redacted JSON logging.
4. **Product Analytics & AI FinOps:** Ledger-derived KPIs enforcing `GMV != Platform Revenue != Seller Earnings`, hybrid semantic search with deterministic zero-key fallback, PII/KYC redaction guardrails, non-destructive admin Trust & Safety advisories, and a repeatable 20-query evaluation benchmark.
5. **Verification Discipline:** Unit, API contract, security/IDOR, Playwright E2E + axe, Lighthouse CI, and real containerized PostgreSQL 15 + Redis 7 + ClamAV CI suites — paired with explicit separation of `IMPLEMENTED`, `TESTED`, `CI VERIFIED`, `HOSTED VERIFIED`, and `BLOCKED`.

---

## 2. Feature Maturity Matrix

| Domain / Feature                                                                                                                      | Implemented       | Tested              | CI Verified                                                                      | Hosted Verified | Remaining Gap                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------------------- | -------------------------------------------------------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------- |
| **Authentication & Sessions** (bcrypt-12, email verify, HTTP-only cookies, refresh rotation, atomic password reset)                   | Yes               | Yes                 | Yes (`quality.yml` Run `45601267339`)                                            | No (`BLOCKED`)  | Live SMTP sandbox & hosted cookie round-trip pending staging deploy                                         |
| **Marketplace Catalog, Search & EN/VI Frontend** (25 App Router pages, Next.js `16.4.6`, `@base-ui/react`, WS6 route integrity)       | Yes               | Yes                 | Yes (PR `#22` Runs `44857718550`/`44857718563`, `main` `45601267339`)            | No (`BLOCKED`)  | Live Vercel + Render SSR verification pending owner deploy                                                  |
| **Orders & Lifecycle State Machine** (snapshots, delivery, revision, auto-complete, IDOR isolation)                                   | Yes               | Yes                 | Yes (PR `#14`, `infrastructure-acceptance.yml`)                                  | No (`BLOCKED`)  | Hosted smoke check pending Phase 4A.8 unblock                                                               |
| **Payments, Escrow & Append-Only Ledger** (Stripe Test intents, signed webhooks, refunds, disputes)                                   | Yes               | Yes                 | Yes (incl. real Postgres 15 concurrency tests)                                   | No (`BLOCKED`)  | Live Stripe test webhook delivery to hosted staging URL pending                                             |
| **Stripe Connect Test Mode & Reconciliation** (Phase 4C: KYC gating, Connect accounts, read-only reconciliation)                      | Yes               | Yes                 | Yes (PR `#15`, merged `a3bf76e`)                                                 | No              | External seller payouts intentionally disabled (`503` fail-closed)                                          |
| **API Security & Coupon Hardening** (WS5: coupon concurrency & validation hardening)                                                  | Yes               | Yes                 | Yes (PR `#21` Runs `44857537006`/`44857537091`, merged `cb14ee1`)                | No              | Pre-commit coupon preview window documented in [KNOWN_LIMITATIONS.md](KNOWN_LIMITATIONS.md)                 |
| **Seller KYC Encryption & HMAC Blind Index** (AES-256-GCM + HKDF + key rotation CLI)                                                  | Yes               | Yes                 | Yes (`infrastructure-acceptance.yml`)                                            | No (`BLOCKED`)  | Cloud secret manager provisioning pending                                                                   |
| **Upload Isolation & Live ClamAV Scanning** (`zINSTREAM`, EICAR rejection, fail-closed timeout)                                       | Yes               | Yes                 | Yes (real `clamav/clamav:stable` in CI)                                          | No (`BLOCKED`)  | Hosted B2/R2 + hosted `clamd` smoke check pending                                                           |
| **Distributed Systems** (Phase 4D: Socket.IO Redis adapter, Redis rate limiting, BullMQ worker, cron lease lock, correlation logging) | Yes               | Yes                 | Yes (PR `#18` Runs `44852850687`/`44852850654`, merged `9a6293b`)                | No (`BLOCKED`)  | Multi-instance live hosted soak test not yet run                                                            |
| **Product Analytics & KPI** (Phase 4E: `GMV != Platform Revenue != Seller Earnings`, seller/admin endpoints, safe demo seed)          | Yes               | Yes                 | Yes (PR `#16`, merged `fdfa547`)                                                 | No              | `profileViews` telemetry instrumentation not yet implemented (`null`)                                       |
| **AI Hybrid Semantic Search & FinOps** (Phase 4F: 20-query eval, brief assistant, non-destructive trust advisory, PII guardrails)     | Yes               | Yes                 | Yes (PR `#17`, merged `056cab2`)                                                 | No              | External LLM/embedding provider & `pgvector` deferred until catalog >10k                                    |
| **Readiness Tooling & Dependency Remediation** (Phase 4G k6/secret scan/backup scripts + WS1 Next.js `16.4.6` upgrade)                | Yes               | Yes                 | Yes (PR `#19` `44856737799`/`44856737808`, PR `#23` `45600525280`/`45600525400`) | No              | Local k6/Docker restore not run locally; `2026-11-26` audit: `11` total / `2` `--prod` advisories remaining |
| **Hosted Staging Deployment** (Phase 4A.8: Render API + Vercel Web + Neon + Upstash + B2 + Mailtrap)                                  | Harness + Runbook | Harness Unit Tested | Yes (PR `#13`, merged `a0e498d`)                                                 | **BLOCKED**     | Requires owner cloud account & secret provisioning                                                          |

---

## 3. Technical Debt Register (`2026-11-26`)

- **Dependency / Security Debt:** PR `#23` upgraded Next.js to `16.4.6` and resolved prior `proxy-addr` and `nodemailer` findings. Fresh `2026-11-26` audits ([dependency-audit-2026-11-26.txt](internal/audits/dependency-audit-2026-11-26.txt)) report `11` full-workspace advisories (`0` Critical, `5` High, `5` Moderate, `1` Low; exit code `1`) and `2` `--prod` advisories (`0` Critical, `1` High `zod@3.25.76` requiring a breaking v3-to-v4 migration, and `1` Moderate `minimatch@10.2.6` surfaced under `--prod` via `packages/eslint-config` declaring `eslint-config-next` in `dependencies`). The remaining `9` advisories are dev-only transitive dependencies via `@lhci/cli`, `nodemon`, and `typescript-eslint`.
- **Architecture / Monorepo Debt:** Root package (`taskora`) vs brand (`TASCORA`) naming drift; `packages/ui`, `packages/types`, and `packages/config` remain stubs; no repository `LICENSE` file yet.
- **Performance & Backup Verification Debt:** `tests/load/k6-tascora-local.js` and `scripts/verify-local-backup-restore.ps1` are checked into `main` but require local `k6` and Docker Desktop binaries to execute outside CI.
- **Database & AI Debt:** `pgvector` and external embedding providers remain deferred until catalog scale justifies raw SQL migration complexity.
- **Frontend & Analytics Debt:** `profileViews` analytics instrumentation returns `null`; legacy unused dashboard components remain tracked in [KNOWN_LIMITATIONS.md](KNOWN_LIMITATIONS.md).
- **Operations Debt:** Hosted staging (Render + Vercel + managed PG/Redis/S3/Mailtrap/ClamAV) and multi-instance hosted soak testing remain `BLOCKED` pending owner cloud provisioning.

---

## 4. Technical Interview Reference (Core Design Decisions)

1. **Modular Monolith vs. Microservices:** Single-database ACID transactions across Orders, Escrow, `FinancialEntry`, and Disputes (`apps/api/src/modules/financial/domain.ts`, [ADR-001](adr/001-modular-monolith-pnpm-workspaces.md)), with BullMQ background processing isolated in a dedicated worker entrypoint (`apps/api/src/workers/worker.ts`).
2. **Checkout & Delivery Idempotency:** Composite unique idempotency keys (`buyerId_checkoutKey`, `orderId_requestKey`) inside transaction advisory locks; identical payloads return idempotently while altered payloads return `409 Conflict` (`apps/api/src/modules/order/order.service.ts`).
3. **Financial Concurrency:** Transaction-scoped PostgreSQL advisory locks (`pg_advisory_xact_lock(hashtext(orderId))`) via `lockOrder()` prevent races between webhooks, refunds, and order completion, verified under concurrent `Promise.all` tests in `tests/database/financial-system.spec.ts`.
4. **Append-Only Ledger & Conservation:** Appending integer-cent `FinancialEntry` rows eliminates lost updates and enables deterministic balance conservation (`pending + available + reserved + paid + fees + refunded == gross`) checked by `reconciliation.service.ts`.
5. **Stripe Safety Boundaries:** Raw body verification before `express.json()`, SHA-256 `payloadHash` deduplication in `ProviderEvent`, explicit rejection of live Stripe keys/`livemode=true`, and fail-closed `unavailablePayoutProvider` (`503`) for external payouts.
6. **KYC PII & Malware Isolation:** AES-256-GCM envelope encryption with HKDF-SHA256 per-version subkeys, separate HMAC-SHA256 blind index for duplicate checks (`apps/api/src/lib/kyc-crypto.ts`), upload purpose isolation, and fail-closed chunked TCP `zINSTREAM` ClamAV scanning (`apps/api/src/modules/kyc/malware-scanner.ts`).
7. **Authentication & WebSocket Revocation:** HTTP-only refresh cookies with DB session tracking, atomic single-use `PasswordResetToken` consumption revoking active sessions, and immediate Socket.IO `session_<id>` disconnect on revocation (`apps/api/src/lib/socket.ts`).
8. **Horizontal Scaling Primitives:** `@socket.io/redis-adapter`, `rate-limit-redis` with fail-open (public reads) vs fail-closed (auth mutations) outage policies, BullMQ queues, and Redis `SET NX PX` + Lua-verified cron locks (`apps/api/src/lib/distributed-lock.ts`).
9. **Marketplace KPI Separation & AI FinOps:** Ledger-derived GMV vs Platform Revenue vs Seller Earnings (`docs/KPI_DEFINITIONS.md`), PII/KYC redaction guardrails (`ai-finops.ts`), deterministic zero-key hybrid search fallback, and repeatable 20-query Recall@3/MRR evaluation (`docs/AI_EVALUATION.md`).
10. **Documentation-to-Code CI Gate:** `tests/unit/docs-truthfulness.spec.ts` asserts exact env var names (`PAYMENTS_PROVIDER`), real health routes (`/health`, `/health/live`), actual module directory count (`21`), `@base-ui/react`, zero broken relative links, and zero prohibited buzzwords.

---

## 5. Verification Verdict & Outstanding Blockers

- **Current Verdict:** **`Portfolio Ready with Known Limitations`** — core backend, frontend, financial ledger, KYC encryption, malware scanning, distributed scaling primitives, analytics, and AI FinOps modules are merged on `main` (`9477e67`) and backed by automated CI runs.
- **Explicitly Unverified / Blocked:**
  1. Hosted staging deployment and live cloud smoke verification (`BLOCKED` on owner infrastructure provisioning).
  2. Multi-instance hosted Redis/Socket.IO/BullMQ soak test (`BLOCKED` on hosted staging).
  3. Real-money payment processing and external seller payouts (intentionally disabled by design).
  4. Breaking Zod v4 major upgrade (`zod@3.25.76` High advisory) and `@taskora/eslint-config` `devDependencies` cleanup (`minimatch@10.2.6`).
