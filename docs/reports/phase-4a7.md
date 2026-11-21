# Phase 4A.7 Report: Staging Readiness & Safe Non-Production Operations

## 1. Objective

Harden TASCORA's staging configuration, operational guardrails, and deployment documentation so that a staging deployment can be provisioned safely without live payment keys, accidental production database seeding, duplicate scheduled job execution across replicas, or fail-open malware scanning.

## 2. Scope

- Audit environment variables across API, Web, Prisma, and seed/worker scripts against `.env.example`, `.env.staging.example`, `apps/api/src/lib/config.ts`, `apps/api/src/lib/kyc-key.ts`, `apps/api/src/lib/payment-provider.ts`, `apps/api/src/modules/upload/storage.ts`, and `apps/web/next.config.ts`.
- Enforce opt-in cron execution (`ENABLE_CRON=true`) in staging/production via `shouldEnableCron` in `apps/api/src/lib/cron-config.ts` and `apps/api/src/index.ts`.
- Implement non-production seed guardrails (`scripts/safe-seed-guard.ts`) that block `APP_ENV=production`, reject unlabelled `NODE_ENV=production`, require explicit confirmation, and enforce exact `host/database` allowlisting for non-local databases.
- Add unit tests (`tests/unit/safe-seed-and-cron-guard.spec.ts`) and staging security tests (`tests/security/staging-readiness.spec.ts`).
- Publish `docs/STAGING_RUNBOOK.md`, `docs/STAGING_READINESS_REPORT.md`, and `docs/internal/STAGING_MANUAL_STEPS.md`.
- Out of scope: provisioning cloud accounts, setting real staging secrets, executing hosted smoke tests, enabling live Stripe keys, or modifying Prisma schema / financial ledger invariants.

## 3. Git Branch & Worktree Isolation

- **Worktree:** `D:\duannuoiem\CV offline\TASCORA-worktrees\phase-4a7-staging-readiness`
- **Branch:** `chore/phase-4a7-staging-readiness`
- **Base branch / commit:** `chore/phase-0-baseline-audit` (`175ad0050f8c4e38058d138ebb4682369ce8b643`)
- **Protected main workspace:** `D:\duannuoiem\CV offline\TASCORA` (`feat/outcrowd-cinematic-redesign`) left completely untouched.

## 4. Files Changed

| File                                          | Action   | Purpose                                                                                                                                                                                                                                     |
| --------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/api/src/lib/cron-config.ts`             | Created  | Explicit single-owner cron opt-in policy (`shouldEnableCron`) for staging/production and strict boolean validation                                                                                                                          |
| `apps/api/src/index.ts`                       | Modified | Replaced implicit `ENABLE_CRON !== 'false'` check with `shouldEnableCron(process.env)`                                                                                                                                                      |
| `.env.staging.example`                        | Modified | Defaulted `ENABLE_CRON=false` (with single-owner guidance) and documented `LOG_LEVEL=info`                                                                                                                                                  |
| `scripts/safe-seed-guard.ts`                  | Created  | Reusable non-production seed guard (`assertSafeSeedTarget`) enforcing explicit opt-in, production refusal, and exact `host/database` allowlist                                                                                              |
| `tests/unit/safe-seed-and-cron-guard.spec.ts` | Created  | 5 unit tests covering `shouldEnableCron` and `assertSafeSeedTarget`                                                                                                                                                                         |
| `tests/security/staging-readiness.spec.ts`    | Created  | 4 security tests covering Stripe test-vs-live key validation in staging, mandatory S3/HTTPS/Redis/SMTP staging config, and ClamAV fail-closed `QUARANTINED` mode                                                                            |
| `docs/STAGING_RUNBOOK.md`                     | Created  | Complete 14-section operator runbook covering Render API, Vercel Web, PostgreSQL, Redis, S3, SMTP sandbox, Stripe Test/Disabled modes, KYC keys, ClamAV, CORS/cookies, health checks, migrations/rollback, cron ownership, and safe seeding |
| `docs/STAGING_READINESS_REPORT.md`            | Created  | Environment Variable Audit Matrix, verified gaps, test evidence, and explicit manual operator steps                                                                                                                                         |
| `docs/internal/STAGING_MANUAL_STEPS.md`       | Created  | Public-safe manual provisioning checklist for the user (zero secrets)                                                                                                                                                                       |
| `docs/reports/phase-4a7.md`                   | Created  | Phase 4A.7 completion and handoff report                                                                                                                                                                                                    |

## 5. Key Decisions & Trade-offs

- **Opt-in cron in staging/production (`ENABLE_CRON=true` required):** Previously `apps/api/src/index.ts` enabled cron whenever `ENABLE_CRON !== 'false'`. On multi-instance or web+worker deployments, that default risks duplicate order auto-completion and duplicate scan polling. Defaulting to disabled in staging/production forces operators to designate exactly one scheduler owner. Local development keeps opt-out convenience unless `APP_ENV` is `staging` or `production`.
- **Exact `host/database` allowlist for non-local seeds (no wildcards):** Instead of trying to guess whether a managed PostgreSQL hostname is staging or production via regex heuristics, `assertSafeSeedTarget` refuses any non-local database unless `SEED_DATABASE_ALLOWLIST` explicitly names the exact `host/database` target AND the caller passes `--confirm-non-production-seed` (or `TASCORA_CONFIRM_SEED=YES_SEED_NON_PRODUCTION`).
- **No modifications to `scripts/generate-seed-data.ts` execution against any DB:** The reusable guard module is cleanly implemented and unit-tested, while hosted database seeding remains a manual operator action per staging safety rules.

## 6. Verification & Commands Run

All commands executed inside `D:\duannuoiem\CV offline\TASCORA-worktrees\phase-4a7-staging-readiness`:

| Check                                  | Command                             | Result                                                                                   |
| -------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------- |
| Prisma schema validation               | `pnpm exec prisma validate`         | PASS (exit 0)                                                                            |
| Database test typecheck                | `pnpm run typecheck:tests:database` | PASS (exit 0)                                                                            |
| Monorepo + tests typecheck             | `pnpm typecheck`                    | PASS (exit 0)                                                                            |
| API ESLint                             | `pnpm lint:api`                     | PASS (exit 0)                                                                            |
| Web strict ESLint (`--max-warnings=0`) | `pnpm lint:strict`                  | PASS (exit 0)                                                                            |
| Unit tests                             | `pnpm test:unit`                    | PASS — 14 files, 104 passed (includes 5 new tests in `safe-seed-and-cron-guard.spec.ts`) |
| API integration tests                  | `pnpm test:api`                     | PASS — 11 files, 87 passed                                                               |
| Security audit tests                   | `pnpm test:security`                | PASS — 18 files, 142 passed (includes 4 new tests in `staging-readiness.spec.ts`)        |
| Production build (API + Web)           | `pnpm build`                        | PASS — API `tsc` + Web Next.js 16.3.5 (`46/46` routes)                                   |

## 7. Security & Financial Verification

- Verified `assertProviderConfigured()` rejects `sk_live_*`, `rk_live_*`, and malformed keys in `APP_ENV=staging` while permitting `sk_test_*` / `rk_test_*` when `PAYMENTS_PROVIDER=stripe`.
- Verified `PAYMENTS_PROVIDER=disabled` keeps checkout/payout endpoints fail-closed without blocking non-payment marketplace flows or `/health`.
- Verified `createDefaultMalwareScanner({ KYC_SCANNER_PROVIDER: 'disabled' })` fails closed to `scanStatus: 'QUARANTINED'` and `verdict: 'UNAVAILABLE'` (never promoting unscanned files to `VERIFIED_SAFE`).
- Verified zero secrets, live credentials, or PII were added to `.env.staging.example`, docs, or tests.

## 8. Database / Migration Impact

- No Prisma schema changes.
- No new migrations added.
- Runbook documents `pnpm db:migrate:deploy` and `pnpm db:migrate:status` exclusively (never `prisma migrate reset` or `prisma db push` on staging/production).

## 9. Remaining Known Limitations & Manual Operator Actions

- **Hosted staging is NOT YET HOSTED VERIFIED:** Cloud provisioning (Render API, Vercel Web, Neon/Supabase/Render PostgreSQL, Upstash Redis, S3/R2 bucket, SMTP sandbox, Stripe Test webhook, ClamAV service) requires user-owned credentials and accounts.
- Full checklist of manual steps is documented in `docs/internal/STAGING_MANUAL_STEPS.md` and `docs/STAGING_READINESS_REPORT.md`.
- Single-replica Socket.IO and in-memory `express-rate-limit` remain active constraints until distributed Redis adapters are implemented in a later milestone (Batch 2 / Phase 4D).

## 10. Risks & Rollback Plan

- **Risk:** Existing deployments that relied on implicit cron activation without setting `ENABLE_CRON=true` will now run with cron disabled until explicitly configured.
- **Mitigation:** Documented clearly in `.env.staging.example`, `docs/STAGING_RUNBOOK.md`, and `docs/STAGING_READINESS_REPORT.md`.
- **Rollback:** Revert the Phase 4A.7 code commit; no database schema or data migrations were altered.

## 11. Verification Level Summary

- Cron opt-in policy & safe seed guard: **IMPLEMENTED + TESTED** (local unit suite + strict lint/typecheck/build).
- Staging config validation & ClamAV fail-closed check: **IMPLEMENTED + TESTED** (local security suite).
- Hosted staging deployment & live smoke test: **NOT YET HOSTED VERIFIED** (blocked on manual cloud provisioning by repository owner).

## 12. Interview Explanation (Vietnamese)

- **Vấn đề:** Trước Phase 4A.7, cấu hình staging còn thiếu một số chốt chặn vận hành quan trọng: cron job mặc định bật nếu không đặt `ENABLE_CRON=false` (dễ chạy trùng khi có nhiều instance hoặc tách worker), chưa có cơ chế bảo vệ chống seed nhầm vào database production, và thiếu tài liệu vận hành chuẩn để triển khai staging an toàn.
- **Giải pháp:** Tôi tách chính sách bật cron thành hàm thuần `shouldEnableCron(env)` yêu cầu opt-in rõ ràng (`ENABLE_CRON=true`) trong staging/production, xây dựng module `assertSafeSeedTarget` chặn tuyệt đối production và yêu cầu vừa xác nhận tường minh vừa khớp chính xác `host/database` trong allowlist đối với database không phải local, bổ sung 9 test tự động kiểm chứng cấu hình staging/Stripe test key/ClamAV fail-closed, và hoàn thiện Staging Runbook cùng ma trận biến môi trường.
- **Bằng chứng & giới hạn trung thực:** Toàn bộ 333 test tự động ở local (104 unit, 87 API, 142 security) và build API + Web đều pass, nhưng trạng thái hiện tại mới dừng ở mức đã kiểm chứng trong code/test — staging thực tế trên cloud vẫn cần chủ sở hữu dự án cấp tài khoản và secret để chạy smoke test trực tiếp.

## 13. Next Steps

- Proceed to **Phase 5A (GitHub Portfolio Foundation)** on branch `docs/phase-5a-github-portfolio` stacked on `chore/phase-4a7-staging-readiness`.

## 14. Handoff Summary

- **Phase:** 4A.7 (Staging Readiness)
- **Status:** Complete locally; ready for stacked PR targeting `chore/phase-0-baseline-audit`
- **Branch:** `chore/phase-4a7-staging-readiness`
- **Worktree:** `D:\duannuoiem\CV offline\TASCORA-worktrees\phase-4a7-staging-readiness`
- **Automated Checks:** `prisma validate` PASS, `typecheck` PASS, `typecheck:tests:database` PASS, `lint:api` PASS, `lint:strict` PASS, `test:unit` 14/14 (104), `test:api` 11/11 (87), `test:security` 18/18 (142), `build` PASS.
