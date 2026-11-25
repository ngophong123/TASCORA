# Phase 4G Report — Lightweight Production Readiness

- **Branch:** `chore/phase-4g-production-readiness`
- **Base:** `origin/main` (`38abe5513772e1c806f7dd9f9eb20b5787899caf`)
- **Verification Status:** `TESTED` (automated scripts & security suite verified locally; `k6` live load execution & local Docker `pg_dump` restore honestly marked `NOT RUN LOCALLY` due to absent local `k6` binary / stopped Docker daemon)

---

## 1. Local-Only Load Testing Script (`tests/load/k6-tascora-local.js`)

- **Scenarios:**
  1. `catalog_and_detail_browse`: Marketplace catalog search (`/api/v1/services`), recommendations, and service detail (`/api/v1/services/:id`) (`ramping-vus` 1 -> 10 -> 25 -> 0).
  2. `auth_analytics_payment_boundaries`: Login boundary (`/api/v1/auth/login`), seller analytics (`/api/v1/analytics/seller/dashboard`), and payment intent boundary (`/api/v1/payments/create-intent`).
  3. `order_concurrency_idempotency`: 10 concurrent VUs sharing per-iteration idempotency keys against `POST /api/v1/orders`.
  4. `realtime_and_rate_limit`: `/health/live`, `/health` (PostgreSQL + Redis readiness), and Engine.IO v4 Socket.IO polling handshake (`/socket.io/?EIO=4&transport=polling`).
- **Metrics & Thresholds:** Configures `p(50)`, `p(95)`, `p(99)`, throughput (`http_reqs`), error rate (`http_req_failed`), rate-limit `429` tracking, and structured JSON `handleSummary` output.
- **Safety Guard:** Explicitly throws on startup if `LOAD_TEST_BASE_URL` does not start with `http://127.0.0.1` or `http://localhost` (never targets production, Stripe, Mailtrap, or third-party hosts).
- **Local Execution Status:** `NOT RUN LOCALLY` (`k6` CLI is not installed in the local dev environment — zero fabricated latency numbers).
- **Run Command (after starting local API & installing k6):**
  ```bash
  LOAD_TEST_BASE_URL="http://127.0.0.1:4000" k6 run tests/load/k6-tascora-local.js
  ```

---

## 2. Dependency Vulnerability Audit Triage (`pnpm audit --json`)

Executed against the repository lockfile (`1,256` total dependencies):

| Severity     | Count | Primary Affected Packages & Recommended Remediation                                                                                                                                                     |
| ------------ | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Critical** | `4`   | `next` (3 advisories on `16.3.5`, patched in `>=16.4.1` / `>=16.4.5`), `proxy-addr` (1 advisory via Express 4, patched in `>=2.0.8`)                                                                    |
| **High**     | `31`  | `next`, `sharp`, `zod`, `body-parser`, `undici`, `minimatch`, `glob`, `extract-zip`, `tmp`, `source-map-js`, `basic-ftp`, `@modelcontextprotocol/sdk`, `vite`, `systeminformation`, `brace-expansion`   |
| **Moderate** | `53`  | `next`, `nodemailer`, `undici`, `qs`, `vite`, `@vitest/mocker`, `hono`, `@hono/node-server`, `uuid`, `fast-uri`, `ip-address`, `brace-expansion`, `basic-ftp`, `glob`, `minimatch`, `systeminformation` |
| **Low**      | `7`   | `next`, `fast-uri`, `vite`, `tmp`, `hono`, `systeminformation`                                                                                                                                          |

### Triage Plan (Safe Upgrade Strategy)

- Dependency upgrades are intentionally NOT blindly force-bumped inside this audit PR to avoid destabilizing the verified Next.js 16 / Prisma 5 / Express 4 build without dedicated regression testing.
- **Priority 1 (Runtime Web/API):** Upgrade `next` (`16.3.5 -> >=16.4.5`), `proxy-addr` (`>=2.0.8` via pnpm override), `body-parser` (`>=1.20.9`), and `nodemailer` (`>=10.1.4`) in a dedicated dependency PR verified by `pnpm test:full` + Playwright E2E.
- **Priority 2 (Dev/CI Tooling):** Upgrade `vitest` / `@vitest/mocker` (`>=5.0.3`) and `vite` (`>=8.3.3`).

---

## 3. Repository Secret Scan (`scripts/scan-secrets.ts`)

- **Tooling Note:** `gitleaks` CLI is not installed locally; ran deterministic repository scanner (`npx tsx scripts/scan-secrets.ts`) across all tracked non-binary text files checking for Stripe live keys (`sk_live_*`/`rk_live_*`), AWS access keys (`AKIA*`), PEM private keys, GitHub PATs, Google API keys, and Slack tokens.
- **Result:** **`562` tracked files scanned — `0` secret findings (`PASS`).**
- Regression test `tests/security/idor-and-concurrency-readiness.spec.ts` validates both synthetic leak detection and zero leaks across the tracked repository.

---

## 4. Disposable Local Backup & Restore Script (`scripts/verify-local-backup-restore.ps1`)

- Launches an ephemeral local `postgres:15-alpine` container (`tascora_backup_src`), deploys all `6` Prisma migrations, seeds relational + financial ledger fixture rows (`users`, `seller_profiles`, `categories`, `services`, `service_packages`, `orders`, `transactions`, `escrows`, `financial_entries`), runs timed `pg_dump`, restores with timing into `tascora_backup_restored`, verifies matching `public` schema tables, `_prisma_migrations` count, zero invalid foreign keys, exact restored record counts (`2,1,1,2`), and ledger conservation (`SUM(pendingDelta + availableDelta + reservedDelta + paidDelta + feeDelta) == SUM(orders.amount)`), then tears down the container and temp dump file.
- **Local Execution Status:** `BLOCKED` (Docker Desktop Linux engine daemon is not running locally; start Docker Desktop to execute. Never targets hosted staging/production databases).
