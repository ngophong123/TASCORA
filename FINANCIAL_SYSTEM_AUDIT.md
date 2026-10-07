# TASCORA Financial System

## Hosted provider / staging phase — 2026-10-07

Current phase completed safe repository/static/local preparation; no genuine hosted or Stripe TEST provider validation performed. See HOSTED_PROVIDER_VALIDATION.md and STAGING_SETUP_REQUIRED.md. All 19 hosted/provider gates BLOCKER: no positively identified isolated hosted resources/credentials/endpoints; existing .env targets not used. Docker Engine unavailable. Baseline financial implementation and 32 DB tests on each of two disposable DBs preserved, not repeated.

Added APP_ENV=staging guard (requires production runtime security, no developer .env, TEST Stripe key), payment live-key rejection and signed-live-event rejection; Redis errors sanitized. Targeted six-file local run 38 PASS, final payment lifecycle 18 PASS after two added boundary tests (40 distinct final cases); backend typecheck/lint/build PASS. No schema/migration/frontend changes this phase. PowerShell wrapper execution-policy failure resolved using pnpm.cmd, without policy change. No application test failures; no full release/browser/DB rerun.

Hosted reconciliation remains diagnostic/incomplete; Connect adapter unavailable, charge.dispute.* unsupported, post-payout recovery and liability policy unresolved. Redis is health-only; sockets in-memory, one replica required. SMTP/private storage/HTTPS cookies/CORS/socket/scheduler/recovery remain blocked. No production validation, deployment/push, external requests, existing database connection, real money, purchase, secret disclosure or .env modification. .env metadata unchanged: 474 bytes / 2026-09-20 13:27:05 UTC.

HOSTED PROVIDER VALIDATION PARTIALLY PASSED (local preparation only; no hosted gate PASS).

NOT READY FOR FULL RELEASE VALIDATION.

TASCORA NOT READY FOR DEPLOYMENT.

Exact next step: operator configures proven isolated staging resources privately per STAGING_SETUP_REQUIRED.md and confirms completion; resume real hosted/TEST provider evidence with payouts disabled. No owned background test/build/container operation remains.

Latest backend-only follow-up (2026-10-07) is **complete and verified**: active intent selection no longer trusts wall-clock ordering, multiple live attempts require reconciliation before any provider call, and cancellation checks any other live attempt under the DB lock. Added tied/backwards-clock and multiple-live DB coverage; prior cancellation race now ties timestamps. Final affected 37 tests and backend typecheck/lint/build PASS. Latest disposable task `financial-21853033bfa34848ada518c505eccf4a`, loopback 49301, verified tmpfs PostgreSQL 15: **32 database tests PASS on EACH of two independent clean databases**, both unchanged migrations/deploy/generate/status/repeat/no-drift PASS; owned container/databases removed. This supersedes the earlier 30-test database snapshot for final backend certification. No schema/migration/frontend changes in this follow-up; final 15-pass browser/frontend evidence below remains valid. Financial launch classifications and the two readiness conclusions remain as stated below.

## Continuation — 2026-10-07 (completed local review and affected regression)

**FINANCIAL SYSTEM READY FOR HOSTED PROVIDER VALIDATION. TASCORA NOT READY FOR DEPLOYMENT.** These are separate gates: safe local implementation is ready for isolated provider tests; actual Stripe/Connect/payout and production recovery/hosting are not certified. The current final evidence and launch table below supersede intermediate/historical pending statements.

Resumed the last saved public-response/security review, not a new implementation. The historical checkpoint below is retained as evidence and its PAUSED status is superseded. No schema/migration edits were necessary. Existing architecture, snapshots, append-only ledger, provider-event deduplication, domain locks and authorization remain in place.

Completed review/fixes: cancellation retrieves already-canceled intents, validates provider identity/amount/currency/ownership, returns successful local retries, and refuses an older cancellation when a newer attempt exists under the order lock. Public cancellation now uses the same reduced order projection. Checkout and PaymentIntent creation share USD eligibility bounds (50–99,999,999 cents), avoiding unpayable orders. Financial transactions allow a bounded 15-second pool wait and retain the 15-second execution deadline. Migration preparation refuses existing SQL overwrite before creating scratch space. Disposable cleanup retries temporary Windows DLL locks; container creation errors are explicit.

Response contract/security, omitted buyer refund amount, admin REFUND_PROCESSING actor/deduplication, pending-refund buyer resolution, stale refund events, reconciliation truncation/authorization, candidate filtering and provider price bounds have new coverage. Database-backed locks/unique keys/immutable snapshots/nonnegative ledger guarantees and fee/refund/payout invariants remain enforced. UI copy now distinguishes payment/refund tracking from disabled external payouts, removes the misleading pending-order escrow label, and displays milestone cents correctly.

Confirmed current evidence: 142 unit/API/security tests PASS (51/47/44); final affected money/payment/marketplace suite 37 PASS. Backend typecheck/lint/build PASS. Explicit fresh tmpfs PostgreSQL task `financial-dafe0721bc084d2b9bf4d2647764b17e` on loopback 62244: 30 database tests PASS on EACH of two clean databases, both migrations/client generation/status/repeat deploy/no drift PASS, verified task-owned container/databases removed. Migration history unchanged. Earlier pool-acquisition failure, resource-contention test timeout and Windows temporary-DLL lock failure were not classified PASS; final sequential validation resolved them. Exact known failed-run scratch was removed; the older checkpoint's unknown preparation scratch remains unverified.

At the intermediate continuation stage, final frontend/browser evidence remained pending. An initial broad browser run had an ambiguous Next route-announcer alert selector, a header-link hydration navigation collision, and WebKit deadlines; selector fixes retained original assertions. That run was stopped to isolate resource contention and is not a clean regression PASS. Final evidence follows; no actual provider validation is claimed.

### Final evidence and disposition

- Final frontend typecheck and production build PASS (42 static pages plus dynamic routes). Whole frontend strict lint PASS before the last small fixes; changed-file strict lint and fresh type/build PASS after each final fix. Backend typecheck/lint/build PASS on final backend source. Final affected unit/API suite 37 PASS; broad unit/API/security 142 PASS (51 unit, 47 API, 44 security). Latest backend changes also have final real-DB regression proof.
- Final disposable database result remains 30 PASS on EACH of two clean databases; both unchanged migrations, generation/status/repeat deploy/no-drift PASS. Task-owned container/databases removed. No migration/model changes this continuation; prior additive schema/history preserved.
- Final production browser run: **15 PASS, exit 0, retries disabled**, five cases each on Chromium, WebKit and Mobile Chrome: payment/start/delivery/acceptance/earnings reservation + seller overview; revision/redelivery; dispute/admin buyer refund; ambiguous versus confirmed payout retry keys; hero search. `.last-run.json` records passed with no failed tests. Manually managed, verified final `next start` artifact was reused to avoid nested-pnpm Windows teardown; owned helper stopped afterward.
- Preceding affected 36-case run: **33 PASS / 3 FAIL**, retries disabled. All dashboard and language tests passed on all three browsers, including corrected mobile interactions and actual WebKit Escape behavior. Remaining failures were WebKit query loss and revision input racing the start-work refresh in WebKit/mobile; search controls now wait for hydration and financial tests assert confirmed IN_PROGRESS before filling. Those failed cases subsequently passed in the final 15-case run. Payout UI keeps a key for ambiguous failure and clears it after a confirmed response, permitting a fresh request after confirmed provider failure. Browser fixture subtracts rounded fee from gross, matching authoritative rounding.
- Broad 147-case attempt recorded 131 direct passes, six failures, two retry-passes and eight pre-existing viewport-specific skips in individual output, then Windows teardown stalled. Do not classify this as a clean aggregate release PASS. Failures: real WebKit language Escape defect (fixed with open-menu document listener/focus return); mobile tests targeting hidden desktop controls/unselected chat (corrected, assertions retained); WebKit overlapping checkout navigation/query timing (synchronization/hydration fixes). Corrected affected cases have later evidence above. The earlier interrupted two-worker run is also not a clean PASS. No test was deleted or assertions removed to obtain PASS.
- Historical Firefox page creation failure remains a tooling/runtime WARNING; not rerun or classified as an application failure. Windows nested-pnpm browser server teardown is a separate tooling WARNING. Full release matrix on final source remains a deployment verification prerequisite; do not claim the final 15-case scope is a new clean 147-case run.
- Final incidental UI fixes: Escape closes a clicked language menu in WebKit and restores trigger focus; search input/category/submit are disabled until hydration so the first typed query is retained. Existing selectors now select visible mobile controls/conversation cards; milestone cents and no false escrow label are asserted. No layout redesign or auth/validation weakening.

### Current financial launch gate

PASS below certifies the stated local/domain/DB scope, never real external money movement.

| Item                    | Gate    | Evidence / remaining limit                                                                                                                       |
| ----------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Money representation    | PASS    | Decimal storage, safe cents/BigInt, invalid precision and bounds tests; USD only                                                                 |
| Order state machine     | PASS    | Owned named operations, immutable basis, real-DB transition/race tests                                                                           |
| Payment state machine   | WARNING | Durable atomic local lifecycle PASS; actual Stripe retries/terminal recovery unvalidated                                                         |
| Order price integrity   | PASS    | Server package/snapshot/fee and centralized provider eligibility; tampering/self-purchase tests                                                  |
| Stripe webhook security | WARNING | Raw/signature/mode/mismatch guards and DB event deduplication PASS locally; hosted actual signatures/retries required                            |
| Idempotency             | PASS    | Checkout/intent/event/delivery/refund/acceptance/payout keys and cancellation replay tests; external provider contract still requires validation |
| Concurrency             | PASS    | Shared DB locks, unique keys, nonnegative ledger trigger; final two-clean DB race regression                                                     |
| Platform fee            | PASS    | Configurable 10% default, snapshotted bps, deterministic fee + earning = gross and partial refund rounding                                       |
| Seller earnings         | PASS    | Ledger pending/available/reserved/paid and actual DB movements; external balance not claimed                                                     |
| Delivery                | PASS    | Owned funded delivery and durable key/reference guards; hosted private storage still unvalidated                                                 |
| Revision                | PASS    | Snapshot limits/ownership, real-DB races and clean three-browser redelivery                                                                      |
| Acceptance              | PASS    | One locked earning release, duplicate/race tests and clean local browser lifecycle                                                               |
| Auto completion         | WARNING | Same locked service and pending-refund filtering PASS; 72-hour default retained; hosted single-owner scheduler/SLA required                      |
| Cancellation            | WARNING | Replay/new-attempt race/provider-match guards PASS locally; real Stripe cancellation recovery unvalidated                                        |
| Refund                  | WARNING | Bounds/rounding/audit/atomic reversal/races/recovery PASS with mocks/real DB; actual provider partial/full/out-of-band proof required            |
| Internal disputes       | PASS    | Owned opening, completion freeze and real DB races; not card chargeback adjudication                                                             |
| Admin resolution        | PASS    | Active DB admin, order-linked evidence, pending-refund reuse, recorded resolution and provider-awaiting buyer outcome                            |
| Payout accounting       | PASS    | Internal reservation/failure/retry/ambiguous/paid guards and UI key semantics; simulated provider outcomes only                                  |
| Real payout provider    | BLOCKER | REAL PAYOUT PROVIDER VALIDATION; unavailable adapter, no Connect/onboarding/ownership/transfer/payout proof                                      |
| Authorization           | PASS    | Actual session/DB actor, IDOR/role/tampering tests and reduced public mutation/refund/payout projections                                         |
| Financial audit trail   | PASS    | Immutable ledger/retention, provider IDs/hashes, admin processing actor and reconciliation check audit                                           |
| Reconciliation          | WARNING | Admin read-only diagnostics/truncation tests PASS; full operator recovery for legacy/unbound/out-of-band/post-payout outcomes incomplete         |
| Financial tests         | PASS    | Local 142/37, two-clean 30 each, final 12 financial + 3 search browser cases; broader release and real-provider scopes remain separate           |

### Provider and deployment blockers / exact next step

No genuine Stripe test-account charge, refund, Connect transfer or bank payout was validated. Genuine local proofs are PostgreSQL persistence/migrations/locks and SDK signature cryptography; provider outcomes used explicit mocks. Actual payout adapter/Connect account ownership/onboarding/restrictions and failure recovery remain BLOCKER. Legacy snapshots/fees/holds require audited reconciliation; never guess balances. Post-payout refunds require recovery, and external card chargebacks/processing-fee loss policy are not implemented. Diagnostics first-100/queue bounds and incomplete operator recovery remain limits, not fictional corrections.

Next: provision an explicitly isolated hosted test environment/new disposable database and Stripe TEST account via safe secret configuration, then validate Elements/redirect, durable intent creation/restarts, signed webhook duplicates/order, full/partial refunds and mismatch/recovery diagnostics. Keep external payouts disabled. Subsequently implement and genuinely validate the payout adapter/Connect and operational recovery prerequisites. SMTP/private S3/Redis/hosted cookies/proxies/realtime/load/operator bootstrap/Docker application image/scheduler/outbox and a clean final release matrix remain deployment prerequisites. No deploy/push, real DB or provider money movement occurred. `.env` remains 474 bytes / 2026-09-20 13:27:05 UTC by metadata.

Policy remains configurable 10% default fee and 72 hours from latest valid delivery. Decimal storage and integer/BigInt authoritative arithmetic retained. No real database, .env edit, production credentials, charge, refund, payout, deployment or push. Actual payout adapter/Connect is unavailable. Stripe test-account/provider retries/refunds, hosted scheduler/outbox reliability, legacy financial basis, out-of-band/unbound operator recovery, post-payout recovery and card chargebacks remain external/operational launch prerequisites. Reconciliation is read-only diagnostics with explicit first-100 truncation; it does not invent successful corrections.

## Checkpoint status — 2026-10-06

**PAUSED / INCOMPLETE.** The user intentionally interrupted implementation and requested checkpoint only. This audit was created during checkpoint because it did not exist at interruption. It describes saved work and confirmed snapshots, not final production certification. No new implementation/test/build/migration/Docker task ran during checkpoint. The owned frontend helper was stopped; already-finished backend output was collected. The complete financial file inventory, test chronology, remaining checks and exact resume instruction are in CONTINUE_TOMORROW.md.

**FINANCIAL SYSTEM NOT READY FOR HOSTED PROVIDER VALIDATION — final implementation review/regression unfinished. TASCORA NOT READY FOR DEPLOYMENT.** Overall deployment status did not change; DEPLOYMENT_AUDIT.md was therefore not edited during checkpoint. Older financial statements there are historical and superseded by this financial checkpoint where applicable.

## Architecture

Existing Express/Prisma/PostgreSQL/Stripe/Socket.IO/node-cron architecture retained. Existing Order, Transaction, legacy-named Escrow, Payout, Wallet, OrderDelivery, OrderRevision and OrderActivity were traced first. Previously: partial signed/server-priced payment confirmation existed; provider calls occurred inside transactions; event IDs were not stored; order snapshots, completion earnings, refunds/disputes/payout accounting were missing. Stripe Connect was not implemented; SellerProfile.stripeAccountId alone is not integration proof.

Saved domain modules: financial/money.ts, domain.ts, refund.service.ts, dispute.service.ts, payout.service.ts, financial.route.ts. Order/payment services and cron use the new domain. Four new persistent models: FinancialEntry, Refund, MarketplaceDispute, ProviderEvent. Existing models extended rather than replaced. Internal legacy `Escrow` name is retained for schema compatibility; its rows represent a local funding/earning hold, not evidence of regulated/legal escrow.

## Money Representation

Decimal USD at rest; validated safe integer cents at calculation/provider boundaries. No authoritative float multiplication. Fee division uses integer/BigInt deterministic half-up rounding. Invalid/zero/negative/excess-precision monetary inputs rejected; existing package precision safeguard preserved. `money.ts` bounds configuration and amounts. Stripe intent creation explicitly checks supported USD provider limits (50–99,999,999 cents). Review alignment between purchasable package limits and provider eligibility before final certification. Currency expansion is not implemented.

## Order State Machine

Retained PENDING (awaiting payment), PAID (funded), IN_PROGRESS, DELIVERED, IN_REVISION (revision requested), COMPLETED, CANCELLED, DISPUTED. Added REFUNDED. Shared validator and owned domain operations enforce allowed edges; external payment/refund confirmation use controlled provider paths. `/orders/:id/operations/{start,accept,revision,cancel}` are the new operations. Compatibility `/status` maps only supported domain actions, cannot mark PAID or bypass delivery. State machine review/final changed-flow checks remain unfinished.

## Payment State Machine

TransactionStatus now includes PENDING, PROCESSING, SUCCEEDED, FAILED, CANCELLED, PARTIALLY_REFUNDED, REFUNDED. Payment success is verified server/provider state, not frontend flags. Signed success validates exact amount_received/amount/currency/buyer/order/attempt. Settled/refunded states do not downgrade or re-credit on duplicate success/failure events. Failure/cancellation never fund an order. More out-of-order/terminal-event recovery review remains.

## Platform Fee

10% default; configurable `PLATFORM_FEE_PERCENT` parsed into integer basis points, snapshotted into Order.platformFeeBps and purchaseSnapshot. Fee+earning equals purchase gross. Partial refund reversal compares the split on previous remaining gross with new remaining gross, preventing cumulative rounding drift. Actual provider processing fees/chargeback losses/recovery responsibilities are not implemented as a fictional ledger outcome; operational policy review remains.

## Order Creation

Server loads publicly purchasable service, approved active seller and matching package/price. Self-purchase and invalid money rejected. Purchase snapshot retains service/package/seller identities/names, amount/currency/fee basis, revisions and delivery days. DB trigger prohibits changes to an existing snapshot/critical purchase fields. Same buyer+checkout key returns one order, mismatched payload reuse rejected; new keys permit repeat purchases. REST requires a valid idempotency key; trusted domain calls may omit one for an intentional new purchase. Deadline is set from payment confirmation plus snapshotted delivery days.

## Payment Flow

Reserve a durable Transaction/attempt key under an order lock, commit, call Stripe outside the DB transaction, then bind provider ID under the same lock. Repeated calls share the durable Stripe operation key; multiple idempotent network calls can occur. Unknown timeout does not mean provider failure. Unbound attempts older than 23 hours require operator reconciliation instead of risking provider key expiry duplication. Existing non-canceled intent is retrieved/reused; canceled attempt allows another attempt. Official Stripe.js 10.0.0 payment form added; only publishable key reaches browser. Frontend refreshes authoritative order state and never marks it funded.

## Webhook Flow

Existing raw-body parser/signature/mode verification retained. Supported payment_intent succeeded/payment_failed/canceled/processing and refund created/updated/failed events. ProviderEvent stores event ID/type/object/hash, not sensitive raw payment payload. Duplicate processing is effectively once locally through order locks, event uniqueness and ledger keys. Funding atomically updates transaction, local hold, ledger/fee basis, order/deadline/activity. Webhook-before-provider-ID-binding can find the durable attempt through transaction metadata. Unknown types safely ignored. Unknown/out-of-band refunds and external card disputes still require provider/operator work.

## Seller Earnings

FinancialEntry pendingDelta/availableDelta/reservedDelta/paidDelta/feeDelta derive balances. Payment receipt creates pending earning/fee reservation in one entry; completion moves pending to available once. Payout requests reserve eligible available earning; provider-confirmed paid moves reservation to paid; definitive failure restores availability. There is no separate unsafe authoritative seller counter and no use of legacy Wallet balance as seller settlement. `/financial/earnings`, LiveEarnings and SellerFinancialOverview saved; the latter and newest UI source changes need fresh final checks.

## Delivery

Owned seller, verified local funding and valid state required. Persists bounded message, owned existing upload references, request key, delivery timestamp and activity; sets DELIVERED/lastDeliveredAt. Unique order+request key rejects conflicting reuse and prevents duplicate delivery. New storage infrastructure was not created; private provider storage proof remains pending.

## Revision

Owned buyer requests from DELIVERED with reason; persisted revision references latest delivery and enforces purchase-time package revision count. State becomes IN_REVISION; seller can resume IN_PROGRESS or deliver revision. Concurrent accept/revision admits one valid outcome. UI retry/form-key behavior still needs final-source broad coverage.

## Acceptance

Owned buyer accepts DELIVERED; active dispute/refund blocks normal completion. Same completion service releases pending earning to available with one unique ledger event and marks local hold released/order completed/time/activity. Repeated acceptance does not duplicate release. No external payout is triggered. Administrator seller resolution uses controlled completion for DISPUTED.

## Auto Completion

Existing hourly node-cron calls the same completion service after configurable 72 hours from latest valid delivery. Locked re-read prevents competing dispute/revision/manual acceptance from releasing twice. Latest candidate filtering excludes pending refunds/legacy basis/already-released holds and is not yet finally regression-tested. Scans bounded to 100; one scheduler owner/API replica and hosted scheduling/outbox reliability remain validation prerequisites.

## Cancellation

Buyer unpaid cancellation only when no potentially live intent exists. Pending provider-backed cancellation calls Stripe outside transaction, verifies canceled result, then records local cancellation. After funding/before work, buyer requests a full remaining refund; an admin/provider-controlled workflow processes it. After work begins, unilateral simple cancellation/refund prohibited; internal dispute/admin workflow required. Provider cancellation replay/idempotency and old/unbound attempts need final review.

## Refund

Refund requests are durable, keyed per order and actor/reason/amount checked on replay. Confirmed+outstanding cumulative requests cannot exceed payment. Full/partial admin refund supported; buyer pre-work full amount can now be omitted and computed server-side. Administrator amount required. Provider calls outside transactions with stable refund ID key; PROCESSING remains on ambiguity/local DB failure. Provider confirmation reverses appropriate pending/available earning and fee share, updates cumulative refunded amount/status; full refund updates order. Paid or reserved payout requires explicit recovery and blocks ordinary refund. Latest REFUND_PROCESSING admin audit and optional amount behavior are saved but not finally tested.

## Internal Dispute

Minimal internal marketplace dispute: owned buyer/category/description/time/status, unique per order. PAID/active/revision/delivered eligibility; normal completion and payout release prevented while disputed. Does not implement bank/card chargeback adjudication.

## Admin Resolution

Actual active database ADMIN required; JWT/client role claims are not trusted. Admin evidence limited to the specified order and its linked conversation (bounded message history), deliveries, financial records and audit. Seller outcome completes/releases once; buyer outcome requests refund, retaining DISPUTED/UNDER_REVIEW until provider confirmation. Actor/reason/history recorded. Latest logic accounts for already-pending refunds rather than double-requesting them. Review concurrent refund/dispute resolution and response projection contracts before completion.

## Payout

Reuse existing per-order Payout/local hold relation; unique request/provider references and attempt tracking. Seller may reserve only owned completed undisputed unrefunded available earning. Concurrent request cannot overdraft/double debit. FAILED retry has a new request key/attempt; old request key returns the existing resource. Provider abstraction supports PROCESSING/PAID/FAILED for tests. Default adapter is unavailable and returns 503 before any real provider payout. Unknown timeout retains PROCESSING/reservation. Post-paid refund recovery remains a blocked explicit provider/admin workflow.

## Stripe / Provider Integration

Stripe SDK and existing signed webhook security retained. Stripe.js official dependency installed with scripts disabled. All provider activity executed in this phase used mocks/dummy test settings; no genuine Stripe test-account checkout/refund/Connect transfer/payout was performed. Connected-account ownership/onboarding/restrictions/provider payout adapter remain BLOCKER. Existing account-ID field is not Connect integration. No legally regulated escrow representation.

## Idempotency

Buyer+checkout key, order+delivery key, order+refund key, durable transaction attempt/provider key, ProviderEvent ID/hash, ledger event key, payout order/request/attempt/provider uniqueness and financial notification source key. Domain accept/start retries guarded by state. External timeout cannot be treated as guaranteed failure or exactly-once distributed execution. More cancellation/reconciliation/late-event tests still needed.

## Concurrency

PostgreSQL advisory order locks across domain operations; separate checkout/service locks; uniqueness/transactional re-read; immutable/nonnegative ledger row-lock trigger. Real disposable tests exercise checkout duplicates, duplicate webhooks, competing accept/revision/dispute/auto, refund races, payout duplicate reservation/results and failure recovery. Two clean 23-test runs passed at their snapshots; later domain changes require affected regression.

## Authorization

Existing auth/session/membership protections preserved. Named buyer/seller/admin domain actions; strict bounded financial request schemas/IDs/enums/key validation; self-purchase/price/status tampering safeguards. User order lists scoped to actor; admin order evidence never queries unrelated conversations. No financial mutation socket event. Latest public response reduction uses orderMutationView/financialRecordView; saved but still needs response-contract/security regression and final type/lint checks.

## Audit Trail

Append-oriented FinancialEntry with unique event key, order/payment/refund/payout/provider/actor/reason/time; immutable DB trigger and financial order retention. Existing OrderActivity retained. ProviderEvent durable deduplication; notification outbox financial correctness independent of delivery. Latest refund-processing administrator audit needs coverage. Logging avoids full provider data/JWTs/secrets. Ledger foreign-key retention/recovery behavior should be reviewed before final production approval.

## Reconciliation

Admin-only diagnostics saved: intent/local funding/status/amount/currency/ownership comparison; unbound old-attempt warnings; local/provider refund totals with explicit incomplete-first-100 flag; unavailable payout provider/processing warnings. Reads record an audit event; no automatic destructive correction. Latest diagnostics and reduced response projections have not been tested. Complete operator recovery for old unbound/out-of-band/mismatched provider outcomes remains unfinished.

## Automated Tests

Confirmed snapshots, not final current-source certification:

- 140 local tests / 20 files PASS: 49 unit, 47 API, 44 security. Targeted money/payment/marketplace run 35 PASS. New money unit file contributes 10 tests.
- Two independently clean PostgreSQL databases: BOTH migrations deploy/generate/status/repeat/no-drift PASS; 23 tests / two files PASS each (10 retained DB tests + 13 new financial tests). Task-owned tmpfs container/databases removed.
- Workspace/independent typechecks, strict frontend lint, backend lint/build PASS at applicable intermediate snapshots. Already-finished backend pipeline output collected during checkpoint; no check restarted.
- Intermediate frontend production build PASS with reserved HTTPS origins and process-only dummy test publishable key (42 static pages plus dynamic routes); later source requires new build.
- Three financial Chromium scenarios PASS on that intermediate build with test-only Stripe.js/stateful API fixtures. No financial WebKit/full Chromium/mobile regression yet. Previous Firefox tooling failure retained without new execution.
- Earlier mock/request-shape/DB-test/runner failures corrected before passing snapshots. The initial order-deletion test now verifies audit retention and still tests legacy SET NULL semantics. No test removed or force-clicked to get PASS.

Latest optional refund/admin audit/dispute handling/reconciliation/filtering/projection/seller-overview edits remain unverified by final affected suites. The new migration itself has not changed since two-clean PASS; don't repeat full migration validation merely for a new session.

## Known Limitations

Phase paused mid-final review; full report and final regressions incomplete. Legacy funded records without trusted snapshot/fee/ledger need audited migration/reconciliation, not invented balances. USD only; payment provider bounds and package bounds need final consistency review. Payout abstraction unconfigured; post-payout recovery/chargeback handling/provider fees not implemented. Hourly/bounded job/queue scans; new workflow copy primarily English. No new storage/paid scheduler/infrastructure. Initial Prisma scratch cleanup EBUSY left a cleanup verification item; never prune unrelated temp folders. `prepare-financial-prisma.mjs --migration` currently overwrites generated SQL: do not rerun blindly over appended constraints/triggers; add a guard before future regeneration.

## Provider Validation Still Required

Real isolated Stripe test mode: hosted Elements/redirect/intent creation, actual signed webhook retries, provider timeout/restart recovery, partial/full refunds/out-of-band diagnostics. STRIPE CONNECT PROVIDER VALIDATION = BLOCKER: implement/validate actual adapter/account ownership/onboarding/restrictions/transfer/payout/failure recovery. External card chargebacks documented as production/provider work, not internal dispute success. SMTP/private S3/Redis/hosted cookies/proxies/realtime/load/operator bootstrap/Docker application image/single-owner scheduler still unvalidated. No production database/provider may be used.

## Production Financial Launch Gate

All implementation classifications below remain provisional because final review/regression was interrupted. Passing test/migration evidence above is retained separately.

| Item                    | Current gate                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------ |
| Money representation    | WARNING — helpers/unit invariants passed; final financial review incomplete                      |
| Order state machine     | WARNING — saved, tested snapshot; final changed-flow checks pending                              |
| Payment state machine   | WARNING — saved; terminal/provider recovery review pending                                       |
| Order price integrity   | WARNING — snapshot/precision/DB protections tested; provider limit review pending                |
| Stripe webhook security | WARNING — signature/local guards tested; actual provider and final checks pending                |
| Idempotency             | WARNING — database races tested; cancellation/reconciliation edges pending                       |
| Concurrency             | WARNING — two clean tested snapshots; later domain regression pending                            |
| Platform fee            | WARNING — deterministic 10%/snapshot arithmetic tested; final review pending                     |
| Seller earnings         | WARNING — ledger implementation/tested snapshot; final UI/provider proof pending                 |
| Delivery                | WARNING — implementation and local browser snapshot; final regression pending                    |
| Revision                | WARNING — limits/ownership/race tests and browser snapshot; final regression pending             |
| Acceptance              | WARNING — shared/idempotent release tested; final changes pending                                |
| Auto completion         | WARNING — domain/cron saved; candidate change and hosted scheduler pending                       |
| Cancellation            | WARNING — controlled requests saved; provider replay/hosted proof pending                        |
| Refund                  | WARNING — full/partial/failure recovery tested; latest admin audit/amount/reconciliation pending |
| Internal disputes       | WARNING — saved/tested; final pending-refund resolution change pending                           |
| Admin resolution        | WARNING — actual DB role/audit saved; final tests pending                                        |
| Payout accounting       | WARNING — reservations/failure/retry simulated-provider DB tests; final review pending           |
| Real payout provider    | BLOCKER — adapter/Connect unconfigured/unvalidated                                               |
| Authorization           | WARNING — retained/DB tested; latest response contracts pending                                  |
| Financial audit trail   | WARNING — immutable ledger tested; latest processing audit pending                               |
| Reconciliation          | WARNING — diagnostics partial and untested; operator recovery incomplete                         |
| Financial tests         | WARNING — confirmed passing snapshots; full current-source regression unfinished                 |

Database migration validation: PASS for the unchanged new migration on two clean disposable databases, within tested scope. This does not mark unfinished financial functionality PASS.

### Exact next unfinished step

Review the last saved public response projection helpers and controller/route uses, then complete targeted response-contract/security regressions for those and the newest optional buyer refund amount, administrator processing audit, pending-refund dispute resolution and reconciliation diagnostics. Follow the handoff's sequence afterward; do not redo saved implementation or launch tests/builds/provider work until the user explicitly resumes.
