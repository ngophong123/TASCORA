# TASCORA — Final Readiness & Independent Audit Report

- **Audit Date:** 2026-11-21
- **Repository:** `ngophong123/TASCORA`
- **Verified Live `origin/main`:** `38abe5513772e1c806f7dd9f9eb20b5787899caf` (Batch 1 PRs `#7`–`#12` merged; CI Run `44848251916` = `success`)
- **Open Roadmap & Hardening PRs (Unmerged, Awaiting Owner Merge):** PRs `#13`–`#23` (Batch 2 Phases `4A.8`–`5B` + Final Hardening Workstreams `WS1`, `WS3/4`, `WS5`, `WS6`)
- **Overall Assessment:** **`Portfolio Ready with Known Limitations`** (Explicitly **NOT** `Production Ready` and **NOT** `HOSTED VERIFIED`)

---

## 1. Domain Classification Matrix

| Domain                                     | Status                            | Evidence & Notes                                                                                                                                                                                                                                                                               |
| ------------------------------------------ | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend (`apps/web`)**                  | **CI VERIFIED**                   | 25 localized App Router pages (`en`/`vi`), Next.js 16, strict zero-warning ESLint, Playwright E2E + axe + LHCI; WS6 (PR `#22`) fixes dead `/seller-guide` link, replaces `window.alert`, and adds `frontend-routes-integrity.spec.ts`.                                                         |
| **Backend (`apps/api`)**                   | **CI VERIFIED**                   | 21 domain modules, Express 4, Zod validation, HTTP-only cookie auth, explicit state machines; WS5 (PR `#21`) hardens `/notifications/test` RBAC, coupon bounds & approved-seller gate, and session IDOR status.                                                                                |
| **Database (`prisma/`)**                   | **CI VERIFIED**                   | PostgreSQL 15 schema + 6 ordered SQL migrations verified against real `postgres:15-alpine` in `infrastructure-acceptance.yml`.                                                                                                                                                                 |
| **Financial Systems**                      | **CI VERIFIED** (Test Mode Only)  | Integer-cent arithmetic, `pg_advisory_xact_lock`, append-only `FinancialEntry`, SHA-256 webhook dedupe, refunds/disputes, Stripe Connect test mode & read-only reconciliation (PR `#15`). Live real-money payouts **INTENTIONALLY DISABLED** (`503`).                                          |
| **Security & Dependencies**                | **CI VERIFIED**                   | AES-256-GCM KYC envelopes + HKDF + HMAC blind index, live ClamAV `zINSTREAM` fail-closed scanning, `0` secrets across `562` tracked files, IDOR suites, and WS1 dependency remediation (PR `#23`: `4 -> 0` Critical, `31 -> 5` High, `0` prod Critical).                                       |
| **Distributed Systems**                    | **CI VERIFIED** (PR `#18`)        | Socket.IO Redis adapter, Redis rate limiting (fail-open public / fail-closed auth), BullMQ queues + dedicated worker, Redis `SET NX PX` + Lua single-owner cron locks, correlation ID redacted logging. Multi-instance live staging soak **PLANNED**.                                          |
| **AI & FinOps**                            | **CI VERIFIED** (PR `#17`)        | Hybrid semantic search (deterministic zero-key fallback, `Recall@3 = 1.0000`, `89.41%` cache hit rate on 20-query eval), schema-validated brief assistant, non-destructive admin trust advisory, PII/KYC redaction guardrails. External LLM / `pgvector` **PLANNED**.                          |
| **Analytics & KPI**                        | **CI VERIFIED** (PR `#16`)        | Ledger-backed seller/admin KPIs strictly separating `GMV != Platform Revenue != Seller Earnings`, ISO date validation, non-production `Demo Data` tagging. `profileViews` telemetry **PLANNED** (`null`).                                                                                      |
| **Testing & CI/CD**                        | **CI VERIFIED**                   | 5 test layers (`unit`, `api`, `security`, `database` against live PG15/Redis7/ClamAV, Playwright E2E + LHCI) across `quality.yml` and `infrastructure-acceptance.yml`.                                                                                                                         |
| **Performance / Load Testing**             | **IMPLEMENTED / BLOCKED LOCALLY** | Localhost-guarded `tests/load/k6-tascora-local.js` (PR `#19`) covers auth, catalog, detail, order concurrency, payments, analytics, rate limit, and Socket.IO with `p50`/`p95`/`p99` summary; local execution **BLOCKED** (`k6` binary not installed locally).                                 |
| **Backup & Recovery**                      | **IMPLEMENTED / BLOCKED LOCALLY** | Disposable Docker PostgreSQL `scripts/verify-local-backup-restore.ps1` (PR `#19`) verifies timed `pg_dump`/restore, migrations, FKs, row counts, and ledger conservation; local execution **BLOCKED** (Docker Desktop daemon stopped locally).                                                 |
| **Hosted Staging Acceptance (Phase 4A.8)** | **BLOCKED**                       | Reusable harness `scripts/verify-staging-acceptance.ts` is **CI VERIFIED** (PR `#13`), but live cloud verification is **BLOCKED** pending owner Render/Vercel/Neon/Upstash/B2/Mailtrap/ClamAV provisioning.                                                                                    |
| **Documentation & GitHub Portfolio**       | **CI VERIFIED**                   | Automated `docs-truthfulness.spec.ts` gate, zero buzzwords, zero broken links, zero screenshots/placeholders in `README.md`, mandatory Demo Disclaimer, `TASCORA_FINAL_ENGINEERING_REVIEW.md`, and owner-prompted personal reflection templates in `docs/internal/GITHUB_PORTFOLIO_DRAFTS.md`. |

---

## 2. Nine Mandatory Readiness Answers

### 1. What can TASCORA actually do today?

TASCORA runs a complete full-stack freelance marketplace: localized EN/VI storefront & service discovery, user registration/email verification/session rotation/password reset, seller onboarding & encrypted KYC review with ClamAV scanning, draft-to-published gig management, server-priced order creation with idempotency keys, Stripe Test Mode payment intents & signed webhook settlement into escrow, seller delivery/buyer revision/acceptance lifecycle, real-time Socket.IO messaging with session revocation, refunds/internal disputes, append-only ledger accounting, ledger-backed seller/admin KPIs, hybrid semantic search + brief assistant + non-destructive trust advisories, and distributed Redis/BullMQ worker primitives (once PRs `#13`–`#23` are merged into `main`).

### 2. What has been genuinely tested?

- **Unit, API, Security/IDOR suites (Vitest + Supertest):** Financial cent math, order state machine, webhook replay/tampering, KYC encryption & HMAC migration, ClamAV scanner timeout/malformed reply handling, Socket.IO wire auth & session revocation, coupon/notification/session hardening, KPI accounting invariants, AI 20-query evaluation & PII guardrails, secret scan (`562` files, `0` leaks), frontend static route integrity, and doc-to-code truthfulness.
- **Database & Infrastructure Acceptance (GitHub Actions):** Real `postgres:15-alpine`, `redis:7-alpine`, and `clamav/clamav:stable` containers running all 6 Prisma migrations, concurrent advisory-lock financial tests (`36` database tests), and live EICAR + clean file `zINSTREAM` scans.
- **Browser & Build (GitHub Actions):** Playwright Chromium E2E, `@axe-core/playwright`, Lighthouse CI, zero-warning strict ESLint, TypeScript checks, and Next.js + Express production builds.

### 3. What has been verified on cloud infrastructure?

**Nothing is `HOSTED VERIFIED` yet.** Batch 1 and Batch 2 PRs are verified in GitHub Actions CI (`CI VERIFIED`), and Vercel builds previews on PRs, but full hosted staging (Render API + Vercel Web + Neon + Upstash + B2/R2 + Mailtrap + Stripe Test Webhook + ClamAV) remains **`BLOCKED`** until provisioned by the owner and verified via `scripts/verify-staging-acceptance.ts`.

### 4. Which security vulnerabilities still exist and why?

- **After WS1 (PR `#23`):** `0` Critical across the entire repo (`4 -> 0`), and `0` Critical in production dependencies.
- **Remaining in `--prod` runtime:** `1` High (`zod@3.22.x` in `apps/api`, patched in `>=4.6.6` — deferred because Zod v3->v4 is a breaking major rewrite across 21 modules; mitigated by bounded Express JSON parsers and explicit schema caps) and `1` Moderate transitive.
- **Remaining in dev/CI tooling only (`0` runtime impact):** `4` High (`tmp`, `extract-zip` x2, `basic-ftp`), `4` Moderate, `1` Low — all under `@lhci/cli` (Lighthouse CI) or `nodemon`/`typescript-eslint`.

### 5. What is the actual measured performance?

- **AI Hybrid Semantic Search (Measured locally on `N=20`, `k=3`):** `avg = 1.539 ms` (`p50 = 0.02 ms`, `p95 = 0.29 ms` per embedding with `89.41%` cache hit rate), `Recall@3 = 1.0000`, `Precision@3 = 0.4333`.
- **HTTP Load Testing (`k6`):** **Not yet measured** (`BLOCKED` locally because `k6` CLI is not installed; zero fabricated latency/RPS claims). Controlled script is ready in `tests/load/k6-tascora-local.js`.
- **Frontend Lighthouse CI:** Runs automatically and passes in `quality.yml` on every PR.

### 6. Have backup and restore been proven?

**Not yet executed locally (`BLOCKED`).** `scripts/verify-local-backup-restore.ps1` implements full timed `pg_dump`, disposable restore, schema/migration check, foreign-key validation, row counts, and financial ledger conservation (`SUM(deltas) == SUM(orders.amount)`), but local execution is blocked until Docker Desktop is started.

### 7. What actions require the repository owner?

1. **Merge open PRs `#13`–`#23` into `main` using Merge Commits** in the exact recommended order (note: merge `#13`–`#17`, `#19`, `#20`, `#21`, `#22` cleanly with zero conflicts; between `#18` [Phase 4D] and `#23` [WS1], both touch `apps/api/package.json` & `pnpm-lock.yaml` — merge `#18` first, then refresh `#23` lockfile cleanly or resolve `package.json` + run `pnpm install`!).
2. **Start Docker Desktop & install `k6`** to run `scripts/verify-local-backup-restore.ps1` and `tests/load/k6-tascora-local.js` locally and capture real latency & backup/restore timings.
3. **Provision Hosted Staging** per `docs/internal/STAGING_MANUAL_STEPS.md` and run `STAGING_API_URL=... STAGING_WEB_URL=... npx tsx scripts/verify-staging-acceptance.ts` to promote Phase 4A.8 from `BLOCKED` to `HOSTED VERIFIED`.
4. **Personalize Author Sections & Repo Settings:** Write your own authentic answers for `What I Learned`, `Hardest Bugs I Encountered`, and `What I Would Improve` using the verified factual prompts in `docs/internal/GITHUB_PORTFOLIO_DRAFTS.md`; optionally update GitHub About/Topics and decide on an MIT `LICENSE`.
5. **Plan Zod v4 Major Upgrade PR** once Batch 2 + WS1 are merged into `main`.

### 8. How will a recruiter or Senior Engineer perceive TASCORA?

Within 2–5 minutes, a Senior Engineer or Tech Lead sees clear architecture diagrams, real PostgreSQL advisory locks + append-only financial ledgers, real HKDF/AES-256-GCM KYC encryption, fail-closed ClamAV `zINSTREAM` scanning, clean distributed scaling primitives without over-engineering, automated doc-to-code truthfulness tests, green GitHub Actions CI across real Postgres/Redis/ClamAV containers, and disciplined honesty (`BLOCKED` / `INTENTIONALLY DISABLED` instead of inflated marketing claims).

### 9. What could still cost a candidate points in a tough interview?

1. **No live clickable hosted staging URL yet** (easy to resolve once Render + Vercel staging is provisioned).
2. **Unexecuted `k6` load test and local `pg_dump`/restore numbers** (scripts are ready, awaiting local `k6` + Docker Desktop execution).
3. **Remaining `zod` v3->v4 High advisory** (explain clearly why major v3->v4 was deferred and how bounded Express payload limits mitigate memory exhaustion).
4. **Monorepo naming drift (`taskora` vs `TASCORA`) and stub `packages/ui|types|config`** (already transparently disclosed in `docs/KNOWN_LIMITATIONS.md`).
5. **Unmerged open PRs** if a recruiter visits `main` before PRs `#13`–`#23` are merged!
