# Continue TASCORA Safely

## Current handoff — payments-disabled staging preparation (2026-10-07)

Supersedes earlier missing-resource/required-Stripe-for-staging assumptions; all previous local financial/DB/browser evidence retained. Branch feat/seed-data. Operator reports Neon PostgreSQL, Layerbase Redis, private Backblaze B2 and Mailtrap sandbox resources PREPARED. No hosted resource accessed/validated in this task. Stripe remains BLOCKED because legitimate account/TEST keys are unavailable; no fake account/credential/provider success. External payouts remain DISABLED.

Implemented explicit APP_ENV=staging + NODE_ENV=production + PAYMENTS_PROVIDER=disabled. Disabled startup is rejected outside explicit staging; omitted provider defaults stripe, and staging stripe still requires TEST keys/signing secret. Non-payment production runtime checks (S3/JWT/SMTP/DB/Redis/exact HTTPS/cookies) retained; production Stripe format validation strengthened. No schema/migration change.

Provider-dependent creation/cancellation/refund/event/reconciliation/payout and buyer refund-resolution paths fail closed with 503 / PAYMENT_PROVIDER_UNAVAILABLE before writes/provider calls. Public capabilities and /health expose disabled payments without secrets; /health performs DB/Redis probes, /health/live is separate process liveness. Disabled configuration does not claim provider health or release readiness. UI capability loading/unavailable state gates checkout/payment/refund/payout/admin actions; Stripe script uses pure loader and does not load when disabled. Existing funded-order accounting/domain/security protections retained; plain order creation remains only PENDING and cannot fake funding.

Executed: initial full unit/API/security regression 158 PASS / 21 files; final affected 49 PASS / 4 files after final buyer-resolution/signed-disabled-webhook/Redis-failure strengthening. Both frontend/backend typecheck/lint/production builds PASS; frontend 42 static pages plus dynamic routes. Build used reserved test HTTPS public origins with no publishable key, no hosted secrets. Production artifact browser checks: 9 PASS disabled checkout/pending payment/refund scenarios + 6 PASS seller/admin disabled controls and existing revision/redelivery regression across Chromium/WebKit/Mobile Chrome; retries 0, exit 0. Total 15 PASS. No application/test failures. Existing Next middleware/Edge deprecation warnings retained. Firefox known runtime issue not rerun. No expensive DB rerun/full release matrix.

Files: API new lib/payment-provider.ts and lib/health.ts; config.ts, server.ts, payment service/controller/route, refund/payout/dispute services. Frontend new usePaymentCapability hook; service checkout page, OrderPayment/OrderActions, FinancialAdminPanel, LiveEarnings, marketplace error mapping. Tests: new API provider-disabled and browser payments-disabled specs, production-config tests, live-fixtures capabilities. Templates and HOSTED_PROVIDER_VALIDATION/STAGING_SETUP_REQUIRED plus four handoff/audits updated. Unknown debug.log has tooling/runtime modifications and is preserved; it is not a deliberate source change for this task.

Render root/workspace/API commands verified: repository root; build pnpm install --frozen-lockfile --prod=false && pnpm db:generate && pnpm --filter @taskora/api build; start pnpm --filter @taskora/api start. API uses PORT/0.0.0.0. Configure pinned pnpm/Node, exact staging HTTPS origins, Secure cookies and only verified TRUST_PROXY topology; one replica, ENABLE_CRON=false initially. Hosted TLS/cookies/CORS/socket/storage/mail/scheduler/recovery and migration state still require separately authorized genuine validation. Render-hosted install/build/start NOT RUN.

Existing .env was neither read nor modified; no hosted credentials inspected, database accessed/mutated, migration/seed/reset, deployment, purchase, push or real payment/refund/payout. Task-owned preview helper stopped after tests; no owned task operation remains running.

Exact next step: operator privately configures/reviews Render staging environment and frontend build origins per STAGING_SETUP_REQUIRED.md, without deploying or sending secrets. Confirm completion, then separately authorize staging deployment/hosted validation and a staging-only migration plan. Do not ask for Stripe keys as an unblock requirement for non-payment staging.

FINANCIAL SYSTEM: LOCAL IMPLEMENTATION PRESERVED; DISABLED-PROVIDER MODE LOCALLY VALIDATED.
HOSTED RESOURCE PREPARATION: PREPARED (OPERATOR-REPORTED), NOT HOSTED VALIDATED.
STRIPE PROVIDER VALIDATION: BLOCKED.
RENDER STAGING CONFIGURATION: READY TO CONFIGURE; NOT DEPLOYED.
FULL RELEASE VALIDATION: NOT READY.
TASCORA DEPLOYMENT READINESS: NOT READY FOR PRODUCTION.

## Hosted provider / staging phase — 2026-10-07

Current phase completed safe repository/static/local preparation; no genuine hosted or Stripe TEST provider validation performed. See HOSTED_PROVIDER_VALIDATION.md and STAGING_SETUP_REQUIRED.md. All 19 hosted/provider gates BLOCKER: no positively identified isolated hosted resources/credentials/endpoints; existing .env targets not used. Docker Engine unavailable. Baseline financial implementation and 32 DB tests on each of two disposable DBs preserved, not repeated.

Added APP_ENV=staging guard (requires production runtime security, no developer .env, TEST Stripe key), payment live-key rejection and signed-live-event rejection; Redis errors sanitized. Targeted six-file local run 38 PASS, final payment lifecycle 18 PASS after two added boundary tests (40 distinct final cases); backend typecheck/lint/build PASS. No schema/migration/frontend changes this phase. PowerShell wrapper execution-policy failure resolved using pnpm.cmd, without policy change. No application test failures; no full release/browser/DB rerun.

Hosted reconciliation remains diagnostic/incomplete; Connect adapter unavailable, charge.dispute.* unsupported, post-payout recovery and liability policy unresolved. Redis is health-only; sockets in-memory, one replica required. SMTP/private storage/HTTPS cookies/CORS/socket/scheduler/recovery remain blocked. No production validation, deployment/push, external requests, existing database connection, real money, purchase, secret disclosure or .env modification. .env metadata unchanged: 474 bytes / 2026-09-20 13:27:05 UTC.

HOSTED PROVIDER VALIDATION PARTIALLY PASSED (local preparation only; no hosted gate PASS).

NOT READY FOR FULL RELEASE VALIDATION.

TASCORA NOT READY FOR DEPLOYMENT.

Exact next step: operator configures proven isolated staging resources privately per STAGING_SETUP_REQUIRED.md and confirms completion; resume real hosted/TEST provider evidence with payouts disabled. No owned background test/build/container operation remains.

### Latest follow-up verified — 2026-10-07 (final backend source)

Final clock-ordering review added one more backend guard after the local completion evidence below: create/cancel selects the only non-CANCELLED attempt regardless of timestamp ordering, refuses multiple live attempts for reconciliation before provider calls, and cancellation's locked final check counts any other live attempt rather than selecting latest by time. Added two real-DB tests for tied/backwards timestamps and multiple live records; existing cancellation race now uses identical timestamps. Latest affected 37 tests and final backend type/lint/build PASS. Latest disposable task `financial-21853033bfa34848ada518c505eccf4a`, loopback 49301, tmpfs PostgreSQL 15: **32 database tests PASS EACH on two independent clean databases**, both unchanged migrations/deploy/generate/status/repeat/no-drift PASS; verified owned container/databases removed. Supersedes earlier 30-test DB snapshot. No schema/migration/frontend changes; final 15-pass browser/frontend proof retained. No owned operation remains running. Hosted provider validation remains exact next unfinished external step; financial hosted-validation readiness and NOT READY deployment conclusion below remain current. Tests added this continuation now total two unit cases, nine DB cases and one browser scenario, plus strengthened existing cases.

## FINANCIAL LOCAL COMPLETION — 2026-10-07 (authoritative current handoff)

**FINANCIAL SYSTEM READY FOR HOSTED PROVIDER VALIDATION. TASCORA NOT READY FOR DEPLOYMENT.** No owned test/build/preview or disposable DB operation remains pending. Intermediate active and historical pause sections below are retained as history and superseded. Do not restart or redo financial implementation, marketplace/security work or passing DB/unit/API checks without relevant new source changes.

Resumed exactly the last saved orderMutationView/financialRecordView response-contract/security review. Finished latest optional buyer refund/admin processing audit/pending-refund dispute/reconciliation/candidate-filter tests. Closed cancellation replay/new-attempt race, public cancellation projection, centralized USD checkout/intent eligibility and bounded transaction acquisition. Migration preparation refuses existing SQL overwrite; Docker creation/scratch cleanup handling improved. Saved UI fixes: milestone cents/no misleading pending escrow label, desktop/mobile payment copy, confirmed-versus-ambiguous payout retry key handling, WebKit Escape/focus and hydration-safe search. Test selectors use actual mobile cards/menu/conversations; checkout/start-work synchronize on confirmed route/state; seller overview covered. Existing financial architecture/policy preserved: Decimal/safe integer cents/BigInt, default 10% fee, default latest-delivery +72-hour completion, snapshot/ledger/provider keys/order locks/actual DB actors/outbox.

Final confirmed evidence:

- 142 unit/API/security PASS: 51 unit, 47 API, 44 security; final affected suite 37 PASS. Backend final typecheck/lint/build PASS. Frontend typecheck/strict lint/final build PASS, with final changed-file lint/new type/build after the last small fixes (42 static pages plus dynamic routes).
- New labeled tmpfs PostgreSQL task `financial-dafe0721bc084d2b9bf4d2647764b17e`, loopback 62244: 30 real DB tests PASS on EACH of two clean databases; both unchanged migrations/deploy/generate/status/repeat/no drift PASS; verified owned container/databases removed. No schema/migration changes this continuation. Earlier pool/resource timeout and temporary DLL lock failures retained in audit; sequential final validation passed. Known failed-run scratch e29rf9 removed after exact path verification. Older unknown preparation scratch not certified removed.
- Final actual production artifact browser run exec 97245: 15 PASS, exit 0, retries disabled; four financial scenarios + hero search on each Chromium/WebKit/Mobile Chrome. `.last-run.json` passed/failedTests empty. Direct task-owned `next start` helper exec 61636 stopped after tests. Reuse of that verified production helper avoided Windows nested-pnpm teardown stalls.
- Preceding 36-case run: 33 PASS / 3 FAIL; dashboard/language corrected cases passed in all three browsers. Remaining revision refresh/input races and WebKit search query loss addressed, passed final 15. Broad 147-case attempt had individual 131 passes/six failures/two retry-passes/eight existing viewport skips, with Windows teardown stall; NOT a clean aggregate release PASS. All found failures have later affected proof, but complete fresh release matrix remains a deployment prerequisite. Firefox not rerun; previous standalone page-creation issue remains tooling/runtime warning, separate from fixed real WebKit Escape failure.

This continuation changed no models/migration SQL and added no endpoints. Existing `/orders` checkout and `/payments/create-intent` now share price eligibility; `/financial/orders/:id/cancel-payment` is projected/replay/race guarded. Current-session changed backend files: financial/money.ts, domain.ts, financial.route.ts; order/order.service.ts; payment/payment.service.ts. Helpers: prepare-financial-prisma.mjs, validate-financial-disposable.ps1, validate-disposable-postgres.mjs. Frontend: LiveEarnings.tsx, OrderDetailDrawer.tsx, DashboardSidebar.tsx, MobileDashboardNav.tsx, LanguageSwitcher.tsx, SearchBar.tsx. Tests: financial-money.spec.ts, financial-system.spec.ts, financial-lifecycle.spec.ts, live-marketplace.spec.ts, auth-flows.spec.ts, dashboard-flows.spec.ts, language-switch.spec.ts, live-fixtures.ts. Four audit/handoff files updated; prior file inventory remains below. Do not attribute the whole dirty worktree to this continuation or stage everything.

**Exact next unfinished financial step:** isolated hosted provider validation. Use a NEW explicitly disposable/isolated hosted test database and genuine Stripe TEST account credentials via safe secret configuration. Validate actual Elements/redirect, durable intent create/restart/timeout, raw signed webhook duplicates/out-of-order, full/partial refunds and mismatch/unbound/out-of-band recovery. Keep real payouts disabled. **REAL PAYOUT PROVIDER VALIDATION remains BLOCKER**: actual adapter/Connect ownership/onboarding/restrictions/transfer/payout/failure recovery is not implemented/validated. Existing account-ID field is not integration proof. No actual provider charge/refund/transfer/payout was performed here; mocks are not genuine provider validation.

Remaining deployment prerequisites: audited legacy snapshots/fees/ledger reconciliation (no guessed backfill); explicit post-payout recovery/chargeback/processor-fee policy; full operator recovery for old/unbound/out-of-band records; bounded queue/first-100 reconciliation limits; hosted single-owner scheduler/outbox/private S3/SMTP/Redis/cookies/proxies/realtime/load/operator bootstrap/Docker application image; clean final release matrix (manage a verified production helper separately on this Windows runtime if nested-pnpm teardown recurs). Complete financial launch PASS/WARNING/BLOCKER table is in FINANCIAL_SYSTEM_AUDIT.md.

No deployment/push/reset/clean/discard, real DB access, production Stripe credentials, real charge/refund/payout, infrastructure purchase or .env modification. .env metadata remains 474 bytes / 2026-09-20 13:27:05 UTC. Preserved unknown debug.log, broad prior changes, migration history and useful audit evidence. Docker Engine may remain running; all task-owned disposable validation containers were removed. Never prune arbitrary temporary directories or stop unrelated processes.

## FINANCIAL CONTINUATION — 2026-10-07 (current; final browser verification active)

The user explicitly resumed the financial task. Historical PAUSED sections below are preserved and superseded. Resumed exactly at the saved public projection/security review. Cancellation replay/new-attempt race guards and public projection completed; USD provider limits centralized across checkout/intent; bounded transaction acquisition added. Migration helper now refuses existing SQL overwrite; disposable runner errors/Windows cleanup improved. No schema or migration changes. Frontend pending-order escrow/copy and milestone cents corrected; seller overview assertion added; alert/header selector and checkout navigation synchronization corrected without removing assertions. Latest additional change clears a payout UI key only after a confirmed response, retaining it for ambiguous failures; new browser case covers same-key ambiguity versus new-key confirmed-failure retry. Fixture earnings subtract rounded fee from gross.

Confirmed: 142 unit/API/security PASS (51/47/44), final affected suite 37 PASS; latest backend type/lint/build PASS. New disposable PostgreSQL task `financial-dafe0721bc084d2b9bf4d2647764b17e`, loopback 62244, tmpfs postgres:15-alpine: both clean databases, both migrations/deploy/generate/status/repeat/no-drift PASS, 30 tests PASS EACH, verified container/databases removed. Earlier pool timeout and later simultaneous-work timeout/Windows DLL-lock failure recorded; final sequential DB validation passed. Exact failed-run scratch e29rf9 verified/removed; do not prune unknown historical scratch.

Frontend typecheck/strict lint/production build PASS after drawer/sidebar fixes (42 static pages); latest payout-key change requires a new build and affected lint/type checks. Broad production browser run exec 47858 is active (one worker, Chromium/WebKit/Mobile Chrome, test-only Stripe/API fixtures). Chromium 48 PASS/one existing mobile-only skip. WebKit registration selector now passes; financial happy path initially had overlapping-navigation frame interruption then passed retry; synchronization fix saved and needs clean affected rerun. Do not claim aggregate/final latest-source browser PASS until collected.

Exact next operation if interrupted: collect the owned browser run result; finish remaining safe browser checks/fix genuine failures. After its server exits, rebuild final frontend for the payout-key edit (process-only `https://api.tascora.test`, `https://tascora.test`, `pk_test_fixture_only`, unusable DB URL), run affected financial browser cases across Chromium/WebKit/mobile on that build. Reuse only confirmed fresh build. Finalize financial gates/all four audits/report. Do not redo final passing financial DB regression unless domain/schema changes again. Do not use real DB/credentials/providers. Provider/Connect/legacy/recovery/hosted blockers remain; deployment remains NOT READY. .env metadata unchanged (474 bytes, 2026-09-20 13:27:05 UTC). Existing dirty worktree and unknown debug.log preserved.

## FINANCIAL SYSTEM SAFE STOP — 2026-10-06 (authoritative current checkpoint)

The user intentionally interrupted the Financial System phase and requested CHECKPOINT ONLY. Implementation is PAUSED. Checkpoint work consists only of repository/source/audit/process inspection, collecting already-finished command output, stopping the owned frontend server, and documentation writes. No new test, build, migration, Docker task, installation or financial implementation was started during checkpoint. Preserve every saved change and the broad pre-existing dirty worktree; do not reset/revert/stage everything. `DEPLOYMENT_AUDIT.md` is unchanged because overall deployment status remains NOT READY. The new `FINANCIAL_SYSTEM_AUDIT.md` and this section supersede older financial claims below.

### 1. Completed implementation saved this financial session

- Traced existing Order/Transaction/Escrow/Payout/Wallet, Stripe/webhook, delivery/review/admin/chat/notification code, migrations and tests. Preserved self-purchase, price precision, JWT/session/role, public projection and upload ownership safeguards.
- Added centralized Decimal/safe-integer-cent money helpers; deterministic half-up fee calculation with integer/BigInt arithmetic. Default 10% fee and 72-hour completion window are configurable, with bounded/validated configuration. USD is the supported currency; Stripe intent limits are explicitly checked. `.env.example` adds empty `PLATFORM_FEE_PERCENT`, `ORDER_AUTO_COMPLETE_HOURS`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`; `.env` untouched.
- Orders snapshot service/package/seller identity/names, purchase amount/currency, fee basis, revisions and delivery days. Same buyer+checkout key returns one order; different keys permit intentional repeat purchases. Mismatched key reuse rejected. Named domain operations replace arbitrary state assignment; old `/status` is a constrained compatibility adapter and cannot mark paid or bypass delivery.
- Added append-only financial ledger/audit and durable provider-event IDs/hashes. Seller pending/available/reserved/paid amounts derive from ledger deltas. Financial notices use a ledger-backed outbox and unique notification source keys outside money transactions.
- Payment/refund provider calls now occur outside database transactions. Durable payment attempt identity, provider IDs/metadata, Stripe idempotency keys and a conservative 23-hour unbound-attempt guard support safe retries. Signed/raw-body webhook protections retained; payment events validate amount/currency/ownership/full settlement and never downgrade funded/refunded outcomes. Webhook-before-local-provider-ID binding can recover by trusted transaction metadata.
- Owned seller start/delivery, revision limits, buyer acceptance, internal disputes, administrator resolution, full/partial refunds and internal payout reservation/result accounting are implemented locally. Completion/manual/cron share one service. Provider-confirmed refunds adjust the applicable pending/available earning and fee shares; paid/reserved payouts require recovery instead of fictional refund accounting. Default payout adapter is explicitly unavailable; no real transfer/payout implementation or fake success.
- Frontend API wiring saved: stable checkout retry key, official Stripe.js payment form, named order actions, delivery/revision/refund/dispute controls, live earnings/payout requests, buyer billing states, admin evidence/refund/dispute/reconciliation panel, purchase-snapshot titles and per-order form reset. Seller financial overview component was added near the end and has not received a fresh build/browser run.
- Official `@stripe/stripe-js` 10.0.0 installed (one package, `--ignore-scripts`; lockfile supply-chain check passed). Browser provider replacement exists only in explicit test fixtures. No real Stripe account, charge, refund, payout or production credential was used.

### 2. Partially completed / not certified

The phase is not complete. Final source/security review, complete financial audit, final-source checks and broad regression remain unfinished. The latest changes after the 140-test/two-clean-DB snapshots include optional buyer refund amount determined by the server, explicit administrator REFUND_PROCESSING audit, dispute resolution accounting for already-pending refunds, auto-completion candidate filtering, refund/payout reconciliation diagnostics, seller overview, and reduced public mutation/refund/payout response projections. These changes are saved; do not claim their final regression PASS.

### 3. Exact interrupted operation

The last completed edit added `orderMutationView` / `financialRecordView` in `apps/api/src/modules/financial/domain.ts` and applied them to order controller/route mutation responses and user refund/payout request responses. The same last orchestration call collected the already-running financial Chromium result: 3 PASS. Interruption occurred after those saved edits/results, before the final response-contract/security review, follow-up tests, authoritative current frontend build, broad Chromium/WebKit regression and financial documentation. No financial final report or FINANCIAL_SYSTEM_AUDIT.md existed at interruption. Checkpoint creates the latter as an explicitly incomplete audit.

An earlier backend typecheck → lint → production-build pipeline (exec 17290) had finished successfully; its result was collected during checkpoint, not rerun. It predates the last response projection edits. The task-owned `next start` helper (exec 88972) was stopped during checkpoint; subsequent process read listed no Node processes. Docker Engine was started earlier in the implementation phase for authorized disposable validation and is not stopped by checkpoint. No disposable container remains according to the completed guarded runner cleanup. One initial Prisma preparation scratch cleanup reported EBUSY; cleanup of that exact earlier temporary directory was not independently verified, so do not prune arbitrary temp folders.

### 4–5. Exact financial file inventory (not the whole dirty repository)

Created before interruption:

- `apps/api/src/modules/financial/money.ts`, `domain.ts`, `refund.service.ts`, `dispute.service.ts`, `payout.service.ts`, `financial.route.ts`.
- `apps/web/src/components/dashboard/orders/OrderPayment.tsx`.
- `apps/web/src/components/dashboard/payments/LiveEarnings.tsx`, `FinancialAdminPanel.tsx`, `SellerFinancialOverview.tsx`.
- `scripts/prepare-financial-prisma.mjs`, `scripts/validate-financial-disposable.ps1`.
- `prisma/migrations/20261006000000_financial_system/migration.sql`.
- `tests/unit/financial-money.spec.ts`, `tests/database/financial-system.spec.ts`, `tests/e2e/marketplace/financial-lifecycle.spec.ts`.

Modified during financial implementation:

- `prisma/schema.prisma`; `.env.example`; `apps/web/package.json`; `pnpm-lock.yaml`.
- `apps/api/src/modules/order/order.service.ts`, `order.schema.ts`, `order.controller.ts`, `order.route.ts`.
- `apps/api/src/modules/payment/payment.service.ts`, `payment.route.ts`; `apps/api/src/server.ts`; `apps/api/src/workers/cron.ts`.
- `apps/web/src/app/[locale]/services/[id]/page.tsx`; `dashboard/earnings/page.tsx`, `dashboard/payments/page.tsx`, `dashboard/admin/page.tsx`; `seller/dashboard/page.tsx`.
- `apps/web/src/lib/marketplace.ts`, `dashboard-adapters.ts`; `components/dashboard/orders/OrderActions.tsx`, `OrderDetailDrawer.tsx`.
- `tests/api/payment-lifecycle.spec.ts`, `marketplace-integration.spec.ts`; `tests/database/disposable-postgres.spec.ts`; `tests/e2e/support/live-fixtures.ts`; `tests/e2e/marketplace/live-marketplace.spec.ts`.

Checkpoint-only documentation: this handoff, new `FINANCIAL_SYSTEM_AUDIT.md`, and a financial pause note in `MARKETPLACE_INTEGRATION_AUDIT.md`. No DEPLOYMENT_AUDIT.md change. Git also includes prior unrelated design/assets/audit/security work, untracked initial migrations and unknown `debug.log`; preserve them and do not attribute/stage them wholesale.

### 6. Prisma/migration changes

- Retained existing state names; added OrderStatus.REFUNDED and TransactionStatus.PROCESSING/CANCELLED/PARTIALLY_REFUNDED. Existing payout states retained.
- Added models FinancialEntry, Refund, MarketplaceDispute, ProviderEvent. Extended existing Order, Transaction, Payout, OrderDelivery and Notification with snapshot/currency/fee/idempotency/refund/outbox fields and appropriate relations/unique indexes.
- New additive migration `20261006000000_financial_system`, after untouched `20261005000000_initial`. CHECK constraints bound money/refunds/fees/dispute statuses. Triggers prevent ledger update/delete, negative per-order ledger buckets, and changes to existing purchase snapshots. Some checks are NOT VALID to avoid pretending legacy rows were reviewed; new/updated rows are checked. Legacy financial basis requires reconciliation.
- Generated Prisma client without repository dotenv discovery. Both migrations validated on two newly created clean disposable DBs: deploy/generate/status/repeat deploy/no drift and 23 DB tests PASS each. Last passing run: task label `financial-2d1daa0600d549b89939d2018951e36b`, loopback 64976, tmpfs PostgreSQL 15; databases `tascora_migration_test_second` and `tascora_migration_test_repeat`. Runner removed its verified container and all test databases. No existing DB connected/migrated/reset.
- Schema/migration have not changed since this two-clean validation PASS; retain that migration evidence. Later domain edits still need affected financial DB regression on an explicitly disposable target. Do not automatically redo full migration validation unless schema/migration changes again. IMPORTANT: the preparation helper's `--migration` mode currently writes the generated SQL file; do not rerun it blindly because it would overwrite manually appended constraints/triggers. Add a refusal/guard before any future regeneration, or use client-only mode.

### 7–13. Domain features and protections actually saved

- Order mapping: PENDING=awaiting payment; PAID=funded; IN_PROGRESS, DELIVERED, IN_REVISION, COMPLETED, CANCELLED, DISPUTED retained; REFUNDED added. Shared transition validator, actor checks, verified funding and dispute/refund guards. Paid state is never set from client status. Delivery endpoint persists owned references/message/time and request key. Revision requires reason and purchase-time package limit. Acceptance is idempotent and releases pending earnings once.
- Payment mapping: PENDING/PROCESSING/SUCCEEDED/FAILED/CANCELLED/PARTIALLY_REFUNDED/REFUNDED. Durable attempts/provider IDs; verified provider events and persisted event IDs/hashes; atomic funding/hold/ledger/order/activity updates. No external provider call inside the money transaction. Failed/cancelled payment does not fund; success replay cannot re-credit or downgrade refunded state.
- Fee: 10% default, integer basis points snapshotted per order, deterministic half-up rounding; earning+fee equals gross. Partial refund reversals compare original versus remaining gross split, avoiding cumulative rounding drift. Existing package excess-precision safeguard preserved.
- Earnings: ledger-derived pending/available/payout-reserved/paid; completion moves pending→available. Internal payout request reserves only an owned eligible completed earning. Definitive simulated provider failure restores availability; ambiguous timeout retains processing/reservation; paid payout blocks refund pending explicit recovery.
- Auto completion: existing hourly cron calls same domain completion after configured 72 hours from last valid delivery; disputes/refunds/legacy basis prevent normal release. Hosted scheduler reliability remains unvalidated.
- Cancellation: unpaid order may cancel if no potentially live payment attempt; provider-backed pending cancellation verifies canceled intent. Funded pre-work cancellation creates a controlled full refund request; after work begins, buyer must use dispute/admin workflow. Replay behavior of provider cancellation still needs final review.
- Refund: positive/precision/bounds validation, cumulative outstanding+confirmed refund guard, durable request/provider key, PROCESSING recovery, provider-confirmed full/partial reversal, refunded state. Buyer omitted amount is now server-computed; administrator amount remains required. Latest administrator processing audit/refund/dispute changes require tests.
- Internal disputes: owned buyer opens eligible funded order; normal/automatic completion blocked; admin reads only order-linked evidence, resolves seller via completion or buyer via pending refund. Resolution actor/reason recorded. Existing pending refunds now accounted for in buyer resolution, not duplicated.
- Concurrency/idempotency: buyer checkout composite unique key and PostgreSQL advisory lock; shared order lock across payment/start/delivery/revision/acceptance/refund/dispute/payout/cron; delivery/refund/provider/payout/ledger uniqueness; database row-lock/nonnegative-bucket trigger; no process-local money lock. Legitimate new-key repeat purchases allowed.
- Notification reliability: ledger-backed retryable outbox, unique source key, financial commit independent of notification failure. Socket authorization/session/membership fixes retained; no financial status-mutation socket event added. Hosted notification/realtime delivery remains unvalidated.

### 14–15. Tests added/executed and exact evidence

- New money unit file: 10 cases covering invalid precision/amounts, safe cents, deterministic fee invariants, cumulative partial refund rounding and legal/illegal state edges.
- New real-DB financial file: 13 tests, including actual REST/JWT/database-actor IDOR/tampering/admin guards, snapshots/same-key checkout, duplicate funding, intent-timeout/webhook-before-binding recovery, ownership/revision limits, acceptance/revision/dispute/auto races, refund races/bounds, admin resolutions, payout reservation/failure/retry/paid-refund block, immutable history/overdrafts/notification failure, provider-success/local-DB-refund failure recovery, available-earning partial refund plus duplicate events, ambiguous payout timeout recovery.
- Existing payment API tests adapted to durable attempts/event records; all original security/mismatch/signature/self-purchase cases retained. Existing DB tests now inspect all migrations/enums/FKs and protect audit-linked orders while retaining legacy SET NULL coverage. Concurrent split-phase provider calls are checked for one shared provider operation key/one local transaction rather than pretending one network invocation.
- New financial browser file: 3 scenarios for mocked Stripe form→server-funded order→seller work/delivery→buyer acceptance→earnings/payout reservation; revision/redelivery; dispute/admin buyer resolution/refund confirmation. Stateful fixture is test-only, not provider/DB proof.
- Confirmed broad local run (exec 42239): **140 PASS / 20 files = 49 unit + 47 API + 44 security**, at its snapshot. Targeted money/payment/marketplace run: **35 PASS**.
- Confirmed clean DB final run (exec 94600): **23 PASS / 2 files on EACH of two clean databases**, with both migration deploys/client generations/status/repeat/no-drift PASS and cleanup completed.
- Confirmed workspace and independent frontend/backend typechecks PASS at intermediate snapshots. Backend lint/build pipeline 17290 PASS (already-finished output collected during checkpoint). Strict frontend lint 73760 PASS. Production frontend build 51166 PASS, 42 static pages plus dynamic routes, process-only reserved HTTPS origins and `pk_test_fixture_only`; it predates seller overview/latest frontend edits. Current .next is NOT the final-source certified artifact.
- Financial production Chromium (exec 81824): **3 PASS**, on that intermediate production artifact with explicitly mocked Stripe.js/stateful APIs. No financial WebKit/full Chromium/mobile run completed. Firefox not rerun; previous standalone page-creation tooling failure remains historical warning.
- Earlier failures: initial financial broad run 9 failures caused by old mock/request shapes; later broad 140 PASS. Initial DB run 19/20 passed: financial audit correctly blocked deleting a new audit-linked order; the test was updated to assert retention and exercise SET NULL using a legacy test row, followed by 23/23 twice. Initial disposable runner tmpfs truthiness/readiness defects corrected; failed targets removed safely. Preparation helper initially required sandbox escalation and later reported scratch EBUSY. No unresolved final test failure was observed because final affected regression has not yet run; do not infer final PASS.

### 16–19. Remaining work, blockers, exact resume

**EXACT next unfinished implementation step:** review the last saved `orderMutationView`/`financialRecordView` and their controller/route uses, then finish targeted response-contract/security tests for those projections and the latest optional-buyer-refund/admin-processing/dispute/reconciliation changes. Start with `apps/api/src/modules/financial/domain.ts`, `financial.route.ts`, `refund.service.ts`, `dispute.service.ts`, and the order controller/routes. The latest API reduction is saved; do not redo it or assume it compiled/passed final tests.

Then, only on explicit resume:

1. Inspect checkpoint/status/diff and outstanding task helpers; preserve changes. Review provider-cancellation replay, unbound attempt/reconciliation behavior, late/out-of-order refund events, UI revision/refund/payout allowed-action states and data exposure. Add any missing meaningful failure/authorization/response tests; don't merely adapt mocks to achieve PASS.
2. Run affected unit/API/security and backend type/lint/build with process-only unusable DB URL/test JWT/provider settings. Review new reconciliation diagnostics (refund scan limited to 100, payout provider deliberately unavailable) and add mocked-provider tests. Do not use real credentials.
3. Run affected financial DB tests on a newly created explicit disposable target because later domain code changed; existing two-clean migration PASS remains valid for unchanged schema/migrations. If schema/migration changes, repeat the full two-clean validation as required. Never reuse an existing DB or regenerate/overwrite migration constraints blindly.
4. Produce a fresh final frontend production build (process-only reserved HTTPS origins/test publishable key), typecheck/both lints/both builds and relevant broad regression. Run financial+existing Chromium and WebKit suites, plus relevant mobile; fixture mocks do not certify Stripe. Do not reuse current .next as final without rebuilding. Preserve previous tests.
5. Finish all financial audit sections/launch gates and update deployment/marketplace handoffs with final results. No final readiness claim at this checkpoint.

Remaining financial implementation/review limitations: payout provider adapter is an unavailable abstraction, not real Stripe Connect; legacy snapshots/fees/holds/earnings need auditable reconciliation, not guessed backfill; post-payout recovery is blocked; external card chargebacks are not implemented; full operator reconciliation/recovery (especially old unbound/out-of-band provider records) remains incomplete; request/cancellation/terminal-event edge coverage and final API/UI regression are unfinished. USD only, hourly/bounded completion/outbox scans, queues limited to 100, no regulated escrow claim, no payout/bank/invoice/Connect onboarding UI or real transfer. Provider fees/chargeback losses/recovery/retention need final operational review.

Provider/hosted blockers: real isolated Stripe test-mode form/intents/signatures/webhook retries/refunds; Stripe Connect/payout adapter and ownership/onboarding/restriction proof; private S3/SMTP/Redis; hosted cookies/proxies/WebSocket/reconnect/load; reliable single-owner scheduler/outbox and operator bootstrap; Docker app image runtime. No provider money movement genuinely validated in this phase; only mocks/real disposable persistence/local protocol checks. **FINANCIAL SYSTEM NOT READY FOR HOSTED PROVIDER VALIDATION (phase/final regression unfinished). TASCORA NOT READY FOR DEPLOYMENT.**

Safety: no deploy/push/reset/clean/staging/commit, .env edit, real DB operation, real charge/refund/payout or paid infrastructure. `.env` metadata unchanged: 474 bytes / 2026-09-20 13:27:05 UTC; contents not printed. Stop after saving this checkpoint; resume only when user requests.

## CURRENT RESUME — 2026-10-06 (read before historical checkpoint)

The user explicitly resumed production readiness. Read all three handoff/audit files, Git status/diff and current saved source. The previous session had saved the real marketplace catalog/account/onboarding/admin/service/order/review/chat/socket/upload integrations listed below. Its latest typecheck/both lints/API build were PASS; API 45/security 43/unit 39 were earlier snapshots. The interrupted operation was final source review, authoritative frontend production build and final production browser/mobile regression. No interrupted check was assumed to pass.

Completed this resume:

- Reviewed/preserved the saved integrations and prior security fixes; no existing DB or provider credentials used. Schema/migrations unchanged, disposable PostgreSQL PASS retained without repetition.
- Bounded access/socket expiry to absolute session expiry and added an actual idle-socket wire regression.
- Upload endpoint returns the server-issued owner-bound reference; browser no longer constructs it using a second account request. Added ownership response and avatar/chat persistence coverage.
- Public service/seller details and service images now require active seller accounts; public details consistently require eligible published content/packages.
- Bounded HTTP chat acknowledgements to fetched message IDs (100/request), recomputing unread counts under the chat lock; later arrivals remain unread. Added outsider/oversize/read-race coverage.
- Fixed real dashboard topbar mobile overflow; compact controls retain accessible labels and language choice through drawer. Native workspace scrolling overrides Lenis/global smooth behavior. Mobile geometry assertions added.
- Removed remaining sample email, fake escrow/profile-strength/encryption/verification/settlement claims in desktop/mobile shell and chat; unsupported milestone settlement disabled. Category preview uses the real name; order list/detail amount formatting retains cents.
- Scoped purchase login selector and adapted order/conversation browser interactions for mobile. Added upload persistence and cent display scenarios. Added test-results-*/ ignore pattern for separate regression artifacts; temporary diagnostic spec removed.

Confirmed evidence: 47 API + 44 security + 39 unit = **130 PASS**; backend typecheck/lint/build PASS; workspace typecheck and strict frontend lint PASS at the applicable snapshots. Fresh frontend production build PASS (42 static pages plus dynamic routes), using process-only reserved public HTTPS origins. Google Fonts network failure and Windows generated-chunk permission failure were resolved by clearing only verified `.next` build output and rebuilding outside sandbox. No source reset.

Browser evidence: full Chromium 44 PASS / one existing mobile-only skip before final copy/amount cleanup; final affected desktop marketplace/dashboard 14 PASS, final mobile marketplace 10 PASS and final WebKit marketplace 10 PASS. Preceding mobile marketplace/responsive 12 PASS. WebKit intermediate navigation timeout passed in final serialized run. Firefox nine failures before navigation, with `_page` page-creation error also reproduced independently on `about:blank` with recording disabled; Firefox coverage is not certified. No failed tests were removed or force-clicked.

Production Launch Gate: Database PASS retained; local Dashboard/Backend PASS; Marketplace/Onboarding/Reviews/Orders/Chat/Uploads/Authentication/Authorization/Frontend/Tests/Security WARNING within documented real-provider/Firefox/scale/race limits; Payments BLOCKER; Docker WARNING. Local implementation/regression phase completed. Overall NOT READY FOR DEPLOYMENT.

Remaining prerequisites: isolated genuine full-user database/API integration; private SMTP/S3/Stripe test-mode configuration; hosted cookie/proxy/Redis/WebSocket/reconnect/load validation; secure operator/admin bootstrap; Docker image runtime validation. Financial release/dispute/fee/refund/payout/chargeback/reconciliation policy remains a product BLOCKER. No settlement implementation was invented. Known limitations: whole-catalog filtering, bounded admin/public-review queues, no historical content snapshots, localStorage access token and cross-tab refresh races, one API replica, MIME sniffing rather than malware/decoder proof, polling-based HTTP read-receipt recovery, English new workflow copy.

Exact next recommended step after local regression: provide a separately isolated integration/test environment and run genuine registration/verification/onboarding/admin-publication/purchase/review/chat/upload flows, including hosted browser/socket/storage behavior, without touching existing databases. In parallel, obtain explicit financial policy decisions. Repair Firefox automation in a compatible environment; do not weaken tests. Do not repeat disposable migration validation unless schema/migrations change.

**NOT READY FOR DEPLOYMENT.** No deployment/push/.env edit, real DB migration/reset, real charge or infrastructure purchase. `.env` metadata remains 474 bytes / 2026-09-20 13:27:05 UTC. All saved/unrelated dirty worktree changes and unknown `debug.log` preserved. No stage/commit/reset operation.

Historical paused checkpoints below are retained as provenance and superseded by this section and the latest deployment launch gate.

Resume file inventory (not the whole dirty worktree): `.gitignore`; `apps/api/src/modules/auth/token.ts`, `marketplace/marketplace.route.ts`, `service/service.service.ts`, `upload/upload.route.ts`; `apps/web/src/lib/marketplace.ts`, `app/[locale]/dashboard/messages/page.tsx`, `components/layout/SmoothScrollProvider.tsx`, `components/dashboard/shell/{DashboardTopbar,DashboardSidebar,MobileDashboardNav}.tsx`, `components/dashboard/gigs/GigWizard.tsx`, `components/dashboard/orders/{OrdersTable,OrderDetailDrawer}.tsx`; `tests/api/{marketplace-integration,upload-security}.spec.ts`, `tests/security/socket-wire.spec.ts`, `tests/e2e/support/live-fixtures.ts`, `tests/e2e/marketplace/live-marketplace.spec.ts`; all three audit files. Diagnostic-only video config change was reverted; temporary geometry spec removed. Task-owned production server stopped; final process read listed no Node processes. Scoped changed-file whitespace check PASS; broad worktree still has prior trailing whitespace, documented as a warning.

## SAFE STOP CHECKPOINT - 2026-10-06

User intentionally ended this session. Implementation is PAUSED. No implementation, new tests or builds were started during checkpoint; only status/diff/process reads, collection of already-finished check output and documentation writes. Preserve every completed code change and the unrelated pre-existing dirty worktree. Do not stage/reset/revert everything.

### Completed this marketplace session

- Read previous audit/handoff, inspected status/diff, traced frontend/API/database models, and created MARKETPLACE_INTEGRATION_AUDIT.md with initial feature classifications, static/demo disposition and limitations.
- Connected services/explore/category listings and taxonomy/counts to real APIs; filtering/sorting operates on fetched real records. Service details and public freelancer profiles use actual records with loading/error/not-found/empty states. Removed default/sample seller, ratings, reviews, FAQ, add-ons and record substitution on failure.
- Favorites read/add/remove and saved services now use authenticated endpoints. Specialist bookmarks, online/pro toggles and unsupported preferences are explicitly unavailable rather than pretending success.
- Dashboard context loads the authenticated account, purchases/sales, real order counts/activity and notifications. Removed seeded notifications/orders and localStorage order mutations. Topbar identity uses account data; role selection remains a view choice, not an authorization bypass.
- Buyer/seller profile forms persist through APIs and use returned data. Rejected seller drafts can resubmit. Seller submission uses guarded state/updatedAt comparison; draft updates cannot overwrite already-submitted state. Added upload ownership and monetary bounds/precision validation. Cross-tab identity changes clear/reload account data and private cached views.
- Existing service wizard starts blank, uses real category IDs, creates a draft and atomically saves packages/images/FAQ/requirements/tags. Saved partial drafts retain their ID for retry. Added owned editing route; edits return to DRAFT, package IDs/features are preserved and unsupported removal is rejected. Pause/review requests use the API, with shared service locks for editing/publication/purchasing.
- Added role-protected admin review queue/UI and category creation. Seller approval is deliberate and never asserts KYC/identity verification. Publication requires an approved active seller and valid package; no simulated publish timer.
- Purchase confirmation creates a server-priced PENDING order, shows authoritative returned amount/status, and links to actual purchases/sales. Self-purchase, unavailable sellers and nonpositive prices are rejected. Repeat purchases remain separate orders; no invented purchase deduplication rule or payment activation.
- Connected order actions/delivery messages/files and completed-order buyer reviews/seller replies. Buyer/seller transitions remain server guarded; acceptance never claims money release. Reviews derive service/seller from the owned completed order, prohibit self/duplicate reviews, serialize aggregates and recompute actual ratings. Seller replies use guarded writes.
- Created authorized/deduplicated seller/order conversations. Chat send/history/read state is persisted; removed generated partner replies and fake messages/download success. REST recovery/polling remains authoritative.
- Installed socket.io-client 4.8.3 matching the existing server (four packages; install used --ignore-scripts and supply-chain verification passed). Added browser socket authentication, room joins, event-triggered history refresh, recovery/reconnect and polling fallback. Existing JWT/origin/packet/session/membership safeguards remain. Revoked refresh families and admin-inactivated users disconnect idle socket rooms; wire-level security tests added.
- Upload UI connects profile/avatar, service cover, chat and delivery files. Owned upload references are stored in existing fields; public image reads require a referenced public profile/published service raster image, private downloads require owner or persisted participants. External image allowlists are preserved; only verified API-mediated image routes bypass Next optimization. Neutral placeholders replace invented photos.
- Financial pages show unavailable states; removed fake balances, withdrawals, bank transfers, invoices and escrow activation claims. Unsupported security/preferences/newsletter controls do not fabricate success. Marketing/demo content remains explicitly illustrative.
- Fixed a real signed-in mobile Navbar overflow by applying the existing mobile breakpoint; actions remain available through the mobile drawer. Reused existing visual components/styles; no redesign, schema change or financial business-rule implementation.

### Confirmed checks - distinguish snapshots from final regression

- Latest completed pipeline (exec session 30782, collected during checkpoint): workspace/frontend/backend typecheck PASS; frontend strict lint PASS; backend lint PASS; backend production build PASS. Earlier failures (missing brace, accidental adapter field placement, hook dependency warning) were corrected before this passing pipeline.
- API suite: latest confirmed 45 PASS (five files), including seven marketplace route/service cases and additional upload-sharing/public-image cases. Last small service/order hardening edits came afterward; final affected API rerun is still required.
- Security suite: latest confirmed 43 PASS (nine files), including image-policy tests and four actual loopback Socket.IO handshake/room/actor/revocation tests using real JWT crypto with mocked user/session persistence. Final affected rerun after the last edits remains required.
- Unit suite: 39 PASS. No final broad suite was completed.
- Frontend production builds passed at intermediate snapshots, latest confirmed build had 42 static pages plus dynamic routes. Subsequent browser Socket.IO/dependency, image-policy, identity-cache, footer and other source changes require a fresh production build. Existing .next output is NOT the final current-source artifact.
- Production Chromium run on an intermediate build executed 42 tests. Many existing tests and new order/review/chat/draft/finance cases passed individually, but the run FAILED and did not yield a clean final aggregate. Failures included ambiguous selectors, reading async counts too early, favorite icon selection and the real signed-in mobile overflow. Fixes are saved; final rerun NOT done. One login/register navigation flake passed on retry. Tests were not deleted to obtain PASS; the nonexistent add-on test was rewritten to check that unsupported add-ons cannot alter server pricing.
- Eight new marketplace browser scenarios now exist, including onboarding reload/admin approval and owned editing/admin publication. Those last two scenarios have NOT run yet. Fixtures are explicit test-only APIs under tests/e2e/support, not production fallbacks; fixture import/mocking defects were corrected.
- Native browser websocket/provider/load proof is NOT certified by tests that deliberately abort Socket.IO in the browser fixture. Wire tests validate the server locally with mocked persistence.
- Disposable PostgreSQL migration validation remains the prior PASS (two clean DBs, 10/10 each); not repeated this session because schema/migrations are unchanged.

### Interrupted / unfinished work

- Final source review, authoritative current frontend production build and final Chromium/mobile E2E/regression were interrupted. Do NOT infer these are PASS from intermediate artifacts/results.
- The native socket client and wire guards are saved. Some contemplated follow-ups were NOT implemented: tighter socket timer bound to absolute session expiry, bounded visible-message read acknowledgements/HTTP read-receipt broadcast, richer upload response binding to avoid a cross-tab actor race, and further public-data consistency/pagination polish. Review current code before deciding which is necessary; do not assume these ideas were applied.
- MARKETPLACE_INTEGRATION_AUDIT.md contains the source trace but some current-classification wording predates native socket integration/final checks; finalize it alongside the audit after validation.
- Windows Playwright cleanup hung after failed runs; only owned exec sessions were interrupted. One scoped Stop-Process attempt failed with a PowerShell NullReferenceException. At checkpoint, no Node/Python processes were listed; no test/build was restarted. If a future port is busy, identify the owner and stop only a confirmed task-owned helper, not arbitrary processes.
- Newly observed untracked debug.log is preserved (origin/content not established; do not blindly stage or print it). Existing broad Git status includes many changes from prior sessions/user design work, not all authored here.

### Exact next step on explicit resume

1. Read this checkpoint, DEPLOYMENT_AUDIT.md and MARKETPLACE_INTEGRATION_AUDIT.md; inspect current status/diff/processes. Do not redo the completed implementation or database migration validation.
2. Review the last saved marketplace/service/order/socket/upload changes, then run only the affected API and security suites first. Inject an unused process-only DATABASE_URL (loopback port 1/test-only database) and a test-only JWT_ACCESS_SECRET; never use existing DB/provider credentials. Retain existing tests and fix genuine failures.
3. Run a NEW current-source frontend production build with process-only public HTTPS origins (the reserved test origins https://api.tascora.test and https://tascora.test were used for browser fixtures). Never modify .env. Do not set PLAYWRIGHT_SKIP_BUILD=1 until this fresh build passes.
4. Run production Chromium E2E, including tests/e2e/marketplace/live-marketplace.spec.ts and the existing suites. PLAYWRIGHT_SKIP_BUILD=1 permits reuse only of that confirmed current-source artifact. Add/run appropriate mobile coverage; adapt new row selectors to mobile cards where needed, without weakening assertions. No final mobile/Firefox/WebKit result exists for this phase.
5. Finish the feature audit/source review and relevant regression; update all marketplace launch gates with real evidence. Existing local typecheck/both lints/backend build PASS need reruns only after relevant subsequent edits. No financial behavior or provider proof may be invented.

### Remaining launch blockers / limits

Marketplace integration BLOCKER pending phase completion/final regression. Onboarding/Dashboard/Reviews/Orders/Chat/Uploads WARNING pending final changed-flow and genuine service/provider/browser proof. Database migration PASS retained. Payments BLOCKER (real test-account checkout/settlement plus undefined release/refund/payout/reconciliation policy). SMTP, private S3 roundtrip/policy, Stripe test mode, hosted cookie/proxy/WebSocket/load behavior and operator/bootstrap configuration remain prerequisites. Catalog scans all pages for client filtering; large-catalog scale/server sorting and bounded admin queues need follow-up. Historical order descriptions reference current service/package metadata rather than immutable content snapshots.

Overall: NOT READY FOR DEPLOYMENT. User stopped work; resume only when requested. No deployment, push, .env changes, real DB operations, real charges or infrastructure purchases in this session.

### Files touched in this session (not the whole dirty worktree)

Backend:

- apps/api/src/server.ts
- apps/api/src/lib/socket.ts
- apps/api/src/lib/public-profile.ts
- apps/api/src/modules/marketplace/marketplace.route.ts (new)
- apps/api/src/modules/admin/admin.controller.ts
- apps/api/src/modules/admin/admin.route.ts
- apps/api/src/modules/analytics/analytics.service.ts
- apps/api/src/modules/auth/auth.service.ts
- apps/api/src/modules/favorite/favorite.service.ts
- apps/api/src/modules/message/message.service.ts
- apps/api/src/modules/onboarding/onboarding.schema.ts
- apps/api/src/modules/onboarding/onboarding.service.ts
- apps/api/src/modules/order/order.route.ts
- apps/api/src/modules/order/order.service.ts
- apps/api/src/modules/profile/profile.schema.ts
- apps/api/src/modules/profile/profile.service.ts
- apps/api/src/modules/review/review.service.ts
- apps/api/src/modules/service/service.service.ts
- apps/api/src/modules/upload/upload.route.ts
- apps/api/src/modules/upload/references.ts (new)

Frontend/data/tools:

- apps/web/package.json; pnpm-lock.yaml; playwright.config.ts
- apps/web/src/context/DashboardContext.tsx
- apps/web/src/lib/marketplace.ts (new); apps/web/src/lib/dashboard-adapters.ts (new)
- apps/web/src/hooks/useApiResource.ts (new); apps/web/src/hooks/useConversationSocket.ts (new); apps/web/src/hooks/useServiceFilters.ts
- apps/web/src/components/feedback/ApiState.tsx (new)
- apps/web/src/components/ui/UploadImage.tsx (new); AvatarImage.tsx; ServiceCardImage.tsx; GigCard.tsx
- apps/web/src/components/dashboard/AccountOnboardingPanel.tsx
- apps/web/src/components/dashboard/gigs/GigWizard.tsx; GigsList.tsx
- apps/web/src/components/dashboard/orders/OrderActions.tsx (new); OrderDetailDrawer.tsx; OrdersTable.tsx
- apps/web/src/components/dashboard/overview/StatCard.tsx
- apps/web/src/components/dashboard/shell/DashboardTopbar.tsx
- apps/web/src/components/layout/Navbar.tsx; Footer.tsx
- apps/web/src/components/sections/FeaturedFreelancers.tsx
- apps/web/src/components/services/ServiceFilterSidebar.tsx
- apps/web/src/data/dashboard/orders.ts (type additions; original fixtures retained)
- apps/web/src/app/[locale]/page.tsx; categories/page.tsx; explore/page.tsx; freelancers/[id]/page.tsx; services/page.tsx; services/[id]/page.tsx; seller/dashboard/page.tsx
- apps/web/src/app/[locale]/dashboard/layout.tsx; page.tsx; orders/page.tsx; messages/page.tsx; gigs/page.tsx; saved/page.tsx; settings/page.tsx; payments/page.tsx; earnings/page.tsx
- apps/web/src/app/[locale]/dashboard/admin/page.tsx (new); notifications/page.tsx (new); gigs/[id]/edit/page.tsx (new)

Tests/docs:

- tests/api/marketplace-integration.spec.ts (new); tests/api/upload-security.spec.ts
- tests/security/marketplace-image-policy.spec.ts (new); socket-wire.spec.ts (new); message-persistence.spec.ts; socket-authorization.spec.ts
- tests/e2e/support/live-fixtures.ts (new); tests/e2e/marketplace/live-marketplace.spec.ts (new)
- Existing E2E specs switched to the explicit API fixture: auth/auth-flows.spec.ts; auth/production-account.spec.ts; dashboard/dashboard-flows.spec.ts; marketplace/gig-detail-and-order.spec.ts; marketplace/nav-and-interactions.spec.ts; marketplace/navigation.spec.ts; marketplace/search-and-filter.spec.ts; system/accessibility.spec.ts; system/language-switch.spec.ts; system/responsive.spec.ts
- tests/e2e/pages/ServicesPage.ts (await actual loaded data)
- MARKETPLACE_INTEGRATION_AUDIT.md (new); DEPLOYMENT_AUDIT.md; CONTINUE_TOMORROW.md

No schema/migration/.env/Compose changes in this marketplace phase. Earlier implementation/database/design inventories below are historical and preserved.

Checkpoint updated: 2026-10-06 after completing the database-only validation phase. This file is a handoff, not permission to run deployment/infrastructure actions. Earlier notes below are historical where superseded by this section.

## Latest Completed Phase — Disposable PostgreSQL PASS

- Docker Engine 29.1.2 accessible outside sandbox with approved escalation; cached PostgreSQL 15 Alpine image. No repository Compose services started.
- Created only `tascora-pg-validation-20261006-0538`, task-labeled, tmpfs data, `127.0.0.1:53221`, temporary test credentials. Never read/reused existing DATABASE_URL or `.env` contents.
- Existing initial migration completed from zero on two independent clean databases (`tascora_migration_test_second`, `tascora_migration_test_repeat`): validate → initial status → migrate deploy → generate → up-to-date status → repeat deploy/no-op → drift exit 0 → real DB suite **10/10 PASS each**.
- Generated clients/schema staging used OS temporary folders; Prisma CLI did not load repository env files. Database Vitest config disables env-file loading; test-mode API configuration skips dotenv. Real Prisma persistence; external Stripe/email/socket notifications mocked/blocked.
- Validated all tables/enums/indexes/FKs, selected uniqueness/orphan/cascade/restrict/SET NULL cases, cents/overflow/rounding, order/payment/escrow links, concurrent favorites/payment/webhooks/order transitions/chat counters/wallet debits, rollback and auth rotation/replay.
- Initial two test assertion failures (index quote formatting and overflow error classification) corrected without application/schema edits; subsequent two complete clean runs passed. Runner now reuses installed dependencies and generates a fresh isolated client.
- Existing behavior: duplicate purchase requests create independent orders; no idempotency contract exists. Direct money writes round excess precision; API guards remain necessary. Known missing CHECK constraints/nullable conversations/cross-record invariants and untested review/onboarding/cron/read-versus-send races are not certified by this suite.
- Verified exact container ID/label/tmpfs/port, removed only that container ID, confirmed no such object and zero running containers. All three created test databases and temporary generated client/schema directories removed. No prune/Compose down/existing database operation.
- `.env` metadata unchanged (474 bytes; 2026-09-20 13:27:05 UTC), contents not read. Schema/migration/Compose hashes matched pre-final-run/post-cleanup. No deploy/push/real charges or application/schema/migration/Compose edits.
- Added reusable guarded runner `scripts/validate-disposable-postgres.mjs`, `vitest.database.config.mts`, `tests/database/disposable-postgres.spec.ts`. No test target remains running. Further execution requires a newly created explicitly disposable target.

Database launch gate: PASS for disposable migration and covered database tests. Overall **NOT READY FOR DEPLOYMENT**: live marketplace/operator/upload flows, financial decisions/implementation, provider/hosted-browser validation and uncovered races remain unfinished. This turn was authorized ONLY for disposable DB validation, now complete. Next broader task, when requested: live marketplace/operator integration; do not repeat completed migration validation without relevant changes.

## Latest Completed Resume — Read First

- Read handoff/audit and inspected current status/diff. Preserved existing changes.
- The preceding resume confirmed workspace typecheck, API 36/security 19 and API build after the advisory-lock SQL change; backend lint's result was interrupted. Resumed backend lint PASS.
- Verified both announced purchase safeguards had NOT been saved. Now saved: order creation rejects the seller's own service (HTTP 403); package price Decimal validation allows at most two decimal places, positive finite values and DECIMAL(10,2) bounds.
- Fixed chat participant seller projections to omit private fields. REST/socket message and counter writes are transactional; send/read only touch the appropriate participant counter, and sends broadcast after successful persistence.
- Added tests: purchase/precision cases, five REST chat projection/persistence cases and two Socket.IO counter cases.
- Final checks: backend lint PASS; backend typecheck PASS; API build PASS; API 36 PASS; security 37 PASS; unit 39 PASS. Only indentation cleanup afterward. No frontend edits; previous frontend lint/build/production Chromium 35 PASS/one skipped retained, not rerun.
- Docker read-only availability check still fails (daemon pipe missing, client config access denied). PostgreSQL tools absent from PATH; no explicitly disposable target supplied. No DB/provider/real charge requests, no deployment/push/env/schema/migration changes.

## Prior Next Step (Completed by Latest Phase Above)

The disposable PostgreSQL prerequisite has now been satisfied and its resources removed. Never substitute existing DATABASE_URL or run the frontend seed for future repeats. See the latest phase above for real-database results and coverage limits.

Continue independent live frontend/operator/upload integration while that prerequisite is unavailable: checkout/orders/chat/favorites/gigs are still previews; seller review operator workflow and entity sharing are incomplete. Financial release/refunds/payouts require explicit release/dispute/fee/refund/Connect/reconciliation policy; document decisions before implementing, never invent funds movement. See audit's decision list.

Do not restart completed backend checks or expensive frontend suites without a relevant subsequent change. Future backend changes require affected lint/typecheck/tests/build; frontend changes require the applicable Next.js guide and affected lint/typecheck/build/E2E. Provider test credentials and hosted browser/Redis/Docker evidence remain prerequisites, not completed validations.

Current launch gate: Database PASS for disposable migration/covered DB tests; Payments BLOCKER; Frontend BLOCKER; Backend local checks PASS; Authentication/Authorization/Uploads/Realtime/Tests/Docker/Security WARNING pending remaining services/races/browser proof. NOT READY FOR DEPLOYMENT.

## Current Project State

Next.js 16.3.5 frontend (`apps/web`), Express API (`apps/api`), PostgreSQL/Prisma 5.22, pnpm 12.4.1/Node 22, Socket.IO, Redis health dependency, Stripe, SMTP, private S3/local upload adapters. Git worktree is dirty/uncommitted with production preparation plus extensive pre-existing UI/assets/fixtures. Do not reset/revert/stage everything or overwrite others' changes. No deployment/push/commit was made.

Root `.env` is local/ignored and byte-for-byte unchanged. Schema and initial migration remain unchanged/unapplied. No real/local database was queried/reset/migrated. Docker Engine was unavailable; no Docker start/image build/publication. No paid infrastructure or real charge.

## Completed Phases / Work

- Phase 1 static review completed: valid datamodel; identical initial schema-only SQL; 34 tables, 12 enums, 48 FKs, zero destructive statements. Real DB validation paused.
- Phase 2 implementation: session-bound HS256 JWTs; opaque SHA-256 refresh lookup, atomic rotation, family reuse rejection, absolute expiry, multi-device logout/revocation, cookie clearing/CSRF; pending-account email verification/resend; browser refresh/logout integration.
- Phase 3 core confirmation hardening: server-priced/idempotent intents, existing-intent reuse/canceled retry, raw signed webhooks, amount/currency/ownership/settlement checks, duplicate/late failure protection, webhook-only PAID, order actor checks and transaction locks; Decimal/guarded wallet updates and cron state guards.
- Phase 4 backend preparation: private authenticated uploads, 5 MiB signature/MIME limits, per-user limiter, safe generated keys, local dev persistence and S3 signed download capability. No provider configured/contacted.
- Phase 5 partial integration: real buyer profile and seller draft/save/submit, verification page, corrected live seller metrics; broader sample areas explicitly marked previews.
- Phase 6 lint tooling/types fixed without broad rule suppression; independent/type-aware backend lint passed.
- Phase 7 Docker availability checked only; Engine unavailable, not app failure.
- Phases 8/9 confirmed regression/security checks completed before last SQL projection edit; final repeat interrupted.
- Phase 10 audit rewrite interrupted halfway, completed by this checkpoint with pending items accurately recorded.

## Important Decisions Already Made

- Preserve PostgreSQL/provider/schema/migration history; use migrate deploy only on a confirmed disposable target first. Root seed rewrites frontend fixtures, not DB: never use it as production/disposable DB seed.
- Refresh token hashes/session linkage use existing models; old token formats require fresh login, no signing-secret rotation/data rewrite.
- Verification remains required; never auto-activate or auto-approve sellers to make login work.
- Cookies HttpOnly, Secure in production, auth path, configurable SameSite; trusted Origin/X-CSRF-Protection required for login/refresh/logout. Access remains localStorage; one-tab refresh deduplication, cross-tab caveat documented.
- Use one persistent API replica; no distributed Socket.IO/limiter/job strategy yet.
- Private S3 is selected; local uploads forbidden in production. S3 GET returns JSON signed download URL/lifetime; local GET returns attachment bytes. UI/entity sharing not implemented.
- Never let frontend mark PAID; no invented refunds/payout behavior. Unfinished checkout/order/chat/dashboard areas remain previews rather than fabricated live features.
- Latest lock query edit: `SELECT 1 FROM pg_advisory_xact_lock(hashtext(...))` in payment service, order service and cron. Needs real PostgreSQL proof; avoids projecting PostgreSQL void to Prisma.

## Confirmed Commands / Results

Before latest SQL projection edit:

- pnpm install/client generate completed; Prisma validate PASS and schema-only SQL matches unchanged migration.
- Workspace typecheck, strict frontend lint, independent backend lint PASS.
- Unit: 39 passed; API: 36 passed; security: 19 passed.
- Web/API production builds PASS; web 38 static pages plus dynamic routes.
- CI-mode production Chromium: 35 passed, one skipped; two added mocked verification/profile/refresh browser tests included.
- Compiled API startup in isolated dummy process, cron off: startup/401/CORS checks PASS; no DB/service requests.
- Worktree credential scan: 336 text files, zero recognized patterns/exact nontrivial local credential matches; empty example assignments/no missing consumed names.
- Docker Engine unavailable; image never tested.

## Historical Interrupted Checks / Still Unrun Services

The last orchestration call intended to append audit documentation and rerun typecheck/backend lint/API/security/backend build after changing SQL projection. It was intentionally aborted; those results are not recorded and must not be treated as PASS. Audit existed only through Environment Variables at checkpoint inspection. No active Node/Python processes were found; no tests/builds were started by checkpoint.

Never run yet: actual disposable migration deploy/status/drift/from-zero tests, genuine DB-backed auth/payment/constraint/concurrency integration, SMTP delivery, real S3 roundtrip, Stripe test-account roundtrip, Docker image build/start/health/non-root/secret/size checks. No production migration authorized.

Resolved failures: dependencies/mock resolution, type/unused/floating-promise lint and test mock shapes. Initial misresolved Stripe mock sent a rejected dummy-key request; no real key/charge. Corrected tests directly spy on provider methods and block outbound HTTPS/fetch. Initial dev E2E flake was followed by passing production suites; no tests removed.

## Historical Commands Required at 2026-10-05 Checkpoint (Now Completed)

First inspect current Git state/audit/source; do not start with another full suite.

Affected backend final rechecks:

```text
pnpm typecheck
pnpm lint:api
pnpm test:api
pnpm test:security
pnpm --filter @taskora/api build
```

Frontend lint/build/production E2E and unit checks have confirmed results; repeat when further changes or failures warrant it. Full regression before eventual release must include both lints, both builds, typecheck, unit/API/security and production E2E. Public HTTPS API/canonical origins must be supplied to production frontend build commands in the command process, never by replacing real `.env` values.

Phase 1 needs running separate disposable PostgreSQL. Docker Engine was stopped and PostgreSQL tools absent on checked paths. If user has not made a disposable instance available, stop that phase and explain prerequisites; never substitute existing local DB. Once explicitly disposable target exists, create uniquely named isolated DB, inject its URL only into validation process, run migration status/deploy/generate/status, repeat deploy/no-drift, genuine fixtures/constraints/concurrency tests, repeat on second clean DB. Do not run frontend seed. See audit for exact safe CLI steps.

## Historical Launch Gate (Superseded Above)

Database BLOCKER; frontend/live marketplace BLOCKER; payment release/refund/reconciliation BLOCKER. Auth/authorization/uploads/realtime/security WARNING pending real services/data/browser proof. Backend/tests WARNING because last SQL edit recheck unconfirmed. Docker WARNING/pending, not an app failure. Overall: NOT READY FOR DEPLOYMENT.

## Historical Safe Resume Instructions (Use Latest Section First)

1. Read this file, DEPLOYMENT_AUDIT.md, applicable AGENTS.md; inspect status/diff and preserve existing changes.
2. Check three latest SQL lock projections and any leftover task process/session state. Run only affected backend rechecks above after user resumes work.
3. Resume highest-priority disposable PostgreSQL phase only when explicitly isolated target is available. No existing database access/reset/destructive changes.
4. Continue provider tests with mocks; do not use real charges/keys or create infrastructure. Actual test-account/provider configuration needs user-supplied private settings and appropriate authorization.
5. Finish or document live checkout/orders/chat/favorites/gigs/approval/upload sharing and financial release/refund gaps; do not invent marketplace behavior.
6. Validate Docker only if Engine already available; never start it without authorization. Do not publish images.
7. Update audit with real evidence; never mark database/cloud/Docker PASS from mock tests. Keep launch NOT READY until blockers actually resolved.
8. Do not deploy, push, force push, rotate secrets, overwrite `.env`, buy infrastructure, reset/migrate existing data or remove tests. Ask before destructive/external infrastructure actions.

## Files Changed During Production Follow-up

Exact inventory compared with start-of-follow-up file hashes. Earlier audit changes and pre-existing user edits also remain in Git status and are not all authored in this follow-up. 305 initially pending files were verified preserved. Checkpoint adds this file and updates the audit only.

- `.dockerignore`
- `.env.example`
- `.github/workflows/quality.yml`
- `.gitignore`
- `DEPLOYMENT_AUDIT.md`
- `apps/api/eslint.config.mjs`
- `apps/api/package.json`
- `apps/api/src/lib/config.ts`
- `apps/api/src/lib/errors.ts`
- `apps/api/src/lib/public-profile.ts`
- `apps/api/src/lib/socket.ts`
- `apps/api/src/middlewares/requireAuth.ts`
- `apps/api/src/modules/analytics/analytics.service.ts`
- `apps/api/src/modules/auth/auth.controller.ts`
- `apps/api/src/modules/auth/auth.route.ts`
- `apps/api/src/modules/auth/auth.schema.ts`
- `apps/api/src/modules/auth/auth.service.ts`
- `apps/api/src/modules/auth/token.ts`
- `apps/api/src/modules/coupon/coupon.controller.ts`
- `apps/api/src/modules/email/email.route.ts`
- `apps/api/src/modules/email/email.service.ts`
- `apps/api/src/modules/favorite/favorite.controller.ts`
- `apps/api/src/modules/favorite/favorite.service.ts`
- `apps/api/src/modules/message/message.route.ts`
- `apps/api/src/modules/notification/notification.service.ts`
- `apps/api/src/modules/onboarding/onboarding.schema.ts`
- `apps/api/src/modules/onboarding/onboarding.service.ts`
- `apps/api/src/modules/order/order.service.ts`
- `apps/api/src/modules/payment/payment.controller.ts`
- `apps/api/src/modules/payment/payment.route.ts`
- `apps/api/src/modules/payment/payment.service.ts`
- `apps/api/src/modules/profile/profile.service.ts`
- `apps/api/src/modules/review/review.service.ts`
- `apps/api/src/modules/service/recommendation.service.ts`
- `apps/api/src/modules/service/service.service.ts`
- `apps/api/src/modules/session/session.service.ts`
- `apps/api/src/modules/upload/storage.ts`
- `apps/api/src/modules/upload/upload.route.ts`
- `apps/api/src/modules/wallet/wallet.service.ts`
- `apps/api/src/server.ts`
- `apps/api/src/workers/cron.ts`
- `apps/web/src/app/[locale]/dashboard/layout.tsx`
- `apps/web/src/app/[locale]/dashboard/page.tsx`
- `apps/web/src/app/[locale]/login/page.tsx`
- `apps/web/src/app/[locale]/register/page.tsx`
- `apps/web/src/app/[locale]/seller/dashboard/page.tsx`
- `apps/web/src/app/[locale]/verify-email/page.tsx`
- `apps/web/src/components/dashboard/AccountOnboardingPanel.tsx`
- `apps/web/src/components/dashboard/shell/DashboardTopbar.tsx`
- `apps/web/src/components/layout/Navbar.tsx`
- `apps/web/src/lib/auth-client.ts`
- `package.json`
- `pnpm-lock.yaml`
- `tests/api/auth-lifecycle.spec.ts`
- `tests/api/payment-lifecycle.spec.ts`
- `tests/api/upload-security.spec.ts`
- `tests/e2e/auth/production-account.spec.ts`
- `tests/security/order-payment.spec.ts`
- `tests/security/production-config.spec.ts`
- `tests/security/production-cookies.spec.ts`
- `tests/security/socket-authorization.spec.ts`
- `tests/unit/wallet-ledger.spec.ts`
