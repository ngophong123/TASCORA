# TASCORA Batch 1 Executive Brief (Completion Gate)

This brief summarizes everything completed across **Batch 1 (`Phase 0 -> Phase 4A.7 -> Phase 5A -> Phase FE.1 -> Phase FE.2`)**, what remains manual/blocked, what to review before merging, and concrete engineering exercises to deepen your ownership of the codebase before Batch 2.

---

## 1. Batch 1 Executive Summary

- **Phase 0 (Baseline Audit & Remediation — PR #7):** Audited `origin/main`, created `docs/PROJECT_CURRENT_STATE.md` and `docs/reports/phase-0.md`, marked legacy handoff docs honestly, fixed `CommandPalette.tsx` dead `/dashboard/gigs/create` route -> `/dashboard/gigs/new` (plus locale-aware `@/i18n/routing`), removed fake `WithdrawDialog.tsx` (`setTimeout` simulated withdrawal), and clarified the dashboard analytics notice. **Verified green across all 5 GitHub Actions checks on `main`.**
- **Phase 4A.7 (Staging Readiness — PR #8):** Enforced opt-in single-owner cron (`shouldEnableCron` in `apps/api/src/lib/cron-config.ts`), added non-production database seed guard (`scripts/safe-seed-guard.ts` blocking production and requiring explicit confirmation + exact `host/database` allowlist), added 9 unit/security tests (`safe-seed-and-cron-guard.spec.ts`, `staging-readiness.spec.ts`), and published `docs/STAGING_RUNBOOK.md`, `docs/STAGING_READINESS_REPORT.md`, and `docs/internal/STAGING_MANUAL_STEPS.md`.
- **Phase 5A (GitHub Portfolio Foundation — PR #9):** Replaced the legacy 2,753-line prompt `README.md` with an honest employer-facing overview (real CI badges, 3 visually verified clean screenshots in `docs/assets/portfolio/`, Demo & Payment Safety Disclaimer, 4 `PROBLEM -> SOLUTION -> EVIDENCE` highlights, 2 Mermaid diagrams), plus `docs/ARCHITECTURE.md`, `docs/FINANCIAL_ARCHITECTURE.md`, `docs/IMPLEMENTATION_STATUS.md`, `docs/KNOWN_LIMITATIONS.md`, 4 ADRs (`docs/adr/001..004`), `docs/EMPLOYER_REVIEW_PREVIEW.md`, and `docs/internal/GITHUB_PORTFOLIO_DRAFTS.md`.
- **Phase FE.1 (Frontend Audit — PR #10):** Executed a strictly **read-only** audit of all 25 App Router routes, 712/712 `en`/`vi` i18n keys, component/data caller graphs, auth cookie behavior, and HTML/WCAG semantics, producing `docs/FRONTEND_AUDIT.md` (0 P0, 9 P1, 5 P2, 3 P3).
- **Phase FE.2 (Frontend Remediation & Integration — PR #11):** Fixed all 9 P1 items (`FE-101`–`FE-109`), 3 P2 items (`FE-201`–`FE-203`), and 2 P3 items (`FE-301`–`FE-302`), deleted 10 zero-caller mock dashboard files (`-2,153` lines including fake `ClientPaymentMethods.tsx`), added 6 regression tests (`tests/unit/frontend-remediation.spec.ts`), published `docs/FRONTEND_ARCHITECTURE.md`, and passed all **339** unit/API/security tests + `lint:strict` + `typecheck` + `pnpm build` (`46/46` Next.js 16 routes).

---

## 2. Master Roadmap & Prompt Inventory (`TASCORA_MASTER_DEVELOPMENT_PROMPTS.md`)

> Note: No standalone root `AGENT_RULES.md` exists in the repository. Engineering governance lives in `PROMPT 00` of `TASCORA_MASTER_DEVELOPMENT_PROMPTS.md` (plus Next.js 16 guidance in `apps/web/AGENTS.md`).

| Prompt      | Phase / Section                                  | Batch      | Status                            | Primary Deliverable / PR                                          |
| ----------- | ------------------------------------------------ | ---------- | --------------------------------- | ----------------------------------------------------------------- |
| `PROMPT 00` | Master Engineering Instructions                  | All        | Active & Enforced                 | Applied across PRs `#7`–`#11`                                     |
| `PROMPT 01` | Phase 0 – Project Baseline & Engineering Audit   | Batch 1    | **COMPLETE**                      | PR [#7](https://github.com/ngophong123/TASCORA/pull/7) (CI green) |
| `PROMPT 02` | Phase 4A.7 – Staging Readiness                   | Batch 1    | **COMPLETE**                      | PR [#8](https://github.com/ngophong123/TASCORA/pull/8)            |
| `PROMPT 03` | Phase FE.1 – Frontend Audit                      | Batch 1    | **COMPLETE**                      | PR [#10](https://github.com/ngophong123/TASCORA/pull/10)          |
| `PROMPT 04` | Phase FE.2 – Frontend Remediation                | Batch 1    | **COMPLETE**                      | PR [#11](https://github.com/ngophong123/TASCORA/pull/11)          |
| `PROMPT 05` | Phase 5A – GitHub Portfolio Foundation           | Batch 1    | **COMPLETE**                      | PR [#9](https://github.com/ngophong123/TASCORA/pull/9)            |
| `PROMPT 06` | Phase 4A.8 – Hosted Staging Acceptance           | Batch 2    | Not started                       | Blocked on manual cloud staging setup                             |
| `PROMPT 07` | Phase 4B – Marketplace End-to-End                | Batch 2    | Not started                       | —                                                                 |
| `PROMPT 08` | Phase 4C – Stripe Connect & Payout Test Mode     | Batch 2    | Not started                       | —                                                                 |
| `PROMPT 09` | Phase 4D – Distributed Systems                   | Batch 2    | Not started                       | —                                                                 |
| `PROMPT 10` | Phase 4E – Analytics & KPI                       | Batch 2    | Not started                       | —                                                                 |
| `PROMPT 11` | Phase 4F – AI & FinOps Demo                      | Batch 2    | Not started                       | —                                                                 |
| `PROMPT 12` | Phase 4G – Lightweight Production Readiness      | Batch 2    | Not started                       | —                                                                 |
| `PROMPT 13` | Phase 5B – Portfolio Finalization (Post-Staging) | Batch 2    | Not started                       | —                                                                 |
| `PROMPT 14` | Final Git Audit                                  | Final Gate | Partial (Batch 1 hygiene applied) | Full audit at project completion                                  |
| `PROMPT 15` | Master Project Completion Review                 | Final Gate | Not started                       | —                                                                 |

---

## 3. Stacked PR Merge Order & Merge-Commit Instructions

Repository `ngophong123/TASCORA` has `allow_merge_commit=True` verified. **Use "Create a merge commit" (do NOT squash-merge or rebase-merge)** so downstream stacked PR diffs remain clean without unnecessary conflicts:

1. **PR #7** (`chore/phase-0-baseline-audit` -> `main`) — [View PR #7](https://github.com/ngophong123/TASCORA/pull/7)
2. **PR #8** (`chore/phase-4a7-staging-readiness` -> retarget to `main` after #7 merges, wait for CI green, merge) — [View PR #8](https://github.com/ngophong123/TASCORA/pull/8)
3. **PR #9** (`docs/phase-5a-github-portfolio` -> retarget to `main` after #8 merges, wait for CI green, merge) — [View PR #9](https://github.com/ngophong123/TASCORA/pull/9)
4. **PR #10** (`chore/phase-fe1-frontend-audit` -> retarget to `main` after #9 merges, wait for CI green, merge) — [View PR #10](https://github.com/ngophong123/TASCORA/pull/10)
5. **PR #11** (`feat/phase-fe2-frontend-remediation` -> retarget to `main` after #10 merges, wait for CI green, merge) — [View PR #11](https://github.com/ngophong123/TASCORA/pull/11)

---

## 4. CI & Local Verification Status per PR

> **Important Workflow Note:** Both `.github/workflows/quality.yml` and `.github/workflows/infrastructure-acceptance.yml` trigger on `pull_request: branches: [main]`. Therefore, PR #7 (targeting `main`) executed the full GitHub Actions suite immediately, while stacked PRs `#8`–`#11` (targeting non-`main` base branches) will trigger full GitHub Actions automatically as each one is retargeted to `main` in the merge sequence above.

| PR                   | Local Verification                                                                                                                                                  | GitHub Actions (`main` trigger)                                                                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **#7 (Phase 0)**     | `prisma validate`, `typecheck`, `lint:api`, `lint:strict`, 99 unit, 87 api, 138 security, `pnpm build` — **ALL PASS**                                               | **ALL 5 CHECKS PASS:** `Lint & Typecheck`, `Playwright E2E Tests`, `Lighthouse CI Audits`, `Real PostgreSQL Migrations & Live ClamAV Acceptance`, `Vercel Preview Comments` |
| **#8 (Phase 4A.7)**  | `prisma validate`, `typecheck`, `typecheck:tests:database`, `lint:api`, `lint:strict`, 104 unit, 87 api, 142 security, `pnpm build` — **ALL PASS**                  | `Vercel Preview Comments=success`; full Actions run upon retarget to `main`                                                                                                 |
| **#9 (Phase 5A)**    | Relative link check (0 broken), buzzword check (0 hits), `pnpm test:quick` (104 unit + strict lint/typecheck) — **ALL PASS**                                        | `Vercel Preview Comments=success`; full Actions run upon retarget to `main`                                                                                                 |
| **#10 (Phase FE.1)** | Strictly 2 docs changed (0 source edits), Prettier + `git diff --check` — **ALL PASS**                                                                              | `Vercel Preview Comments=success`; full Actions run upon retarget to `main`                                                                                                 |
| **#11 (Phase FE.2)** | `prisma validate`, `typecheck`, `typecheck:tests:database`, `lint:api`, `lint:strict`, 110 unit, 87 api, 142 security, `pnpm build` (`46/46` routes) — **ALL PASS** | Full Actions run upon retarget to `main`                                                                                                                                    |

---

## 5. Manual User Actions Required

1. **Review & Merge PRs `#7`–`#11`** in strict order using merge commits.
2. **Provision Hosted Staging Infrastructure** (step-by-step checklist in `docs/internal/STAGING_MANUAL_STEPS.md`):
   - Managed PostgreSQL 15 + Redis 7 + S3/R2 bucket (with private KYC prefix)
   - Render API service (`APP_ENV=staging`, `NODE_ENV=production`, `ENABLE_CRON=false` initially then `true` on 1 owner after smoke test, high-entropy `KYC_ENCRYPTION_KEY` & distinct `KYC_DOCUMENT_HMAC_KEY`, `PAYMENTS_PROVIDER=stripe` with `sk_test_*` or `disabled`, SMTP sandbox)
   - Vercel Web project pointing `NEXT_PUBLIC_API_URL` to the staging API
   - Optional ClamAV daemon (`CLAMD_HOST` / `CLAMD_PORT`) if testing live KYC scan promotion
3. **Update GitHub Repository Metadata & License Decision** (drafts in `docs/internal/GITHUB_PORTFOLIO_DRAFTS.md`):
   - Set repository About description & 12 verified Topics (leave Website blank until staging is live)
   - Decide whether to add an MIT `LICENSE` file
   - Optionally add the TASCORA snippet to your GitHub Profile README
4. **Author Your Personal Engineering Reflections** (prompts in `docs/internal/GITHUB_PORTFOLIO_DRAFTS.md` Section 4 — never fabricated by AI).

---

## 6. BLOCKED / Not Yet Hosted Verified Items

- **Hosted Staging Smoke Test (`Phase 4A.8`):** `BLOCKED` until cloud accounts, databases, and staging secrets are manually provisioned by the repository owner.
- **Authenticated Buyer/Seller Dashboard Screenshots:** Pending live staging or local seeded database capture.
- **Deferred Frontend Items:** `FE-204` (full `en`/`vi` translation of 11 dashboard page bodies), `FE-205` (10 orphaned legacy landing sections), `FE-303` (zeroed unused gig analytics metrics).

---

## 7. Key Risks to Review Before Merging

1. **Cron Opt-In Change (PR #8 — `apps/api/src/lib/cron-config.ts`):** Staging/production instances no longer auto-start scheduled jobs unless `ENABLE_CRON=true` is set explicitly on the designated single owner instance.
2. **Post-Login Locale Redirect (PR #11 — `apps/web/src/lib/auth-redirect.ts`):** Full-page redirects after login now prefix `/${locale}` (e.g., `/vi/dashboard`, `/vi/seller/dashboard`); verify your expected redirect query param behavior when testing `/en/login` and `/vi/login`.
3. **Deleted Dead Mock Files (PR #11 — `FE-104`):** 10 orphaned dashboard mock files (`-2,153` lines) were removed after verifying 0 callers across `apps/web` and `tests/`. Confirm none of them are needed by your separate uncommitted main workspace (`feat/outcrowd-cinematic-redesign`) before merging or rebasing that workspace later.

---

## 8. Five Key Code Areas to Read Closely

1. **Financial Ledger & Concurrency Locking:** `apps/api/src/modules/financial/domain.ts`, `payment.service.ts`, and `refund.service.ts` — understand how `pg_advisory_xact_lock`, append-only `FinancialEntry` deltas, `ProviderEvent` SHA-256 deduplication, and the durable notification outbox work together.
2. **KYC Cryptography & Key Rotation:** `apps/api/src/lib/kyc-crypto.ts` and `apps/api/src/lib/kyc-key.ts` — trace HKDF-SHA256 subkey derivation, AES-256-GCM `v2:<keyId>` envelopes, and key-separated HMAC blind indexes.
3. **Fail-Closed Malware Scanning:** `apps/api/src/modules/kyc/malware-scanner.ts` — inspect 64 KiB `zINSTREAM` chunking, backpressure handling, concurrency semaphore, and fail-closed `QUARANTINED` / `SCAN_FAILED` guarantees.
4. **Staging Operational Guardrails (PR #8):** `apps/api/src/lib/cron-config.ts` and `scripts/safe-seed-guard.ts` — verify the exact environment matrix and non-production seed allowlist logic.
5. **Frontend Auth, Deep Links & Session Refresh (PR #11):** `apps/web/src/lib/auth-client.ts`, `apps/web/src/lib/auth-redirect.ts`, and `apps/web/src/app/[locale]/dashboard/orders/page.tsx` — see how concurrent `401` cookie refresh deduplication, safe locale redirects, and `?orderId=` deep links operate.

---

## 9. Hands-On Coding Tasks to Deepen Ownership (Recommended Before Batch 2)

1. **Wire `assertSafeSeedTarget` Directly into `scripts/generate-seed-data.ts`:** Import `assertSafeSeedTarget(process.env, process.argv.slice(2))` at the top of `scripts/generate-seed-data.ts` and add a CLI integration test verifying the seed script exits non-zero on `APP_ENV=production` without connecting to Prisma.
2. **Localize One Dashboard Page End-to-End (`FE-204`):** Pick `apps/web/src/app/[locale]/dashboard/orders/page.tsx`, extract its English labels into `apps/web/messages/en.json` and `vi.json`, wire `useTranslations("dashboardOrders")`, and add a unit parity test.
3. **Add a Real Playwright E2E Test for `?orderId=` Deep Link & `/vi/login` Locale Preservation:** Extend `tests/e2e/` to assert that logging in from `/vi/login` lands on `/vi/dashboard` (not `/en/dashboard`) and clicking an order link from Messages opens the matching order drawer.
4. **Add Explicit `type="button"` to `ExploreClient.tsx` & `dashboard/messages/page.tsx` (`FE-203`):** Finish cleaning the remaining non-submit `<button>` elements outside forms and add a lightweight ESLint or Vitest regression rule to prevent regressions.

---

## 10. Personal GitHub Portfolio Sections to Author Yourself & Batch 2 Entry Criteria

- **Author in Your Own Voice:** Complete the 4 short personal sections (`Why I Built TASCORA`, `What I Learned`, `Hardest Bugs I Encountered`, `What I Would Improve Next`) using the factual prompts in `docs/internal/GITHUB_PORTFOLIO_DRAFTS.md` Section 4.
- **Batch 2 Entry Criteria:** Only start Batch 2 (`Phase 4A.8` Hosted Staging Acceptance, `4B`–`4G`, `5B`) after:
  1. PRs `#7`–`#11` are reviewed and merged into `main` via merge commits with green GitHub Actions.
  2. Hosted staging services & secrets are provisioned manually per `docs/internal/STAGING_MANUAL_STEPS.md`.
  3. You explicitly authorize Batch 2 execution.
