# TASCORA Hosted Provider Validation

## Current phase: explicit payments-disabled hosted staging preparation

Date: 2026-10-07. This section supersedes earlier missing-resource/setup assumptions below; earlier evidence is retained as history.

| Category                | Current evidence                                                                                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| LOCAL VALIDATION        | Disabled-provider guards/configuration/UI implemented; regression results below                                                                       |
| RESOURCE PREPARED       | Operator reports dedicated Neon PostgreSQL, Layerbase Redis, private Backblaze B2 S3-compatible storage and Mailtrap Email Sandbox prepared privately |
| HOSTED VALIDATION       | NOT YET RUN; none of these resources accessed or validated in this task                                                                               |
| PROVIDER VALIDATION     | Stripe BLOCKER; no legitimate Stripe account/TEST keys/webhook secret available; no alternative/fake provider success                                 |
| FULL RELEASE VALIDATION | NOT READY; fresh full release matrix and genuine hosted/provider evidence remain                                                                      |
| PRODUCTION VALIDATION   | NOT TESTED; no production access/deployment authorized                                                                                                |

PostgreSQL resource prepared: YES. Redis resource prepared: YES. Private S3-compatible storage prepared: YES (dedicated tascora-staging bucket, operator-reported ca-east-006 region). SMTP sandbox prepared: YES. Stripe provider validation: BLOCKED. External payouts: DISABLED. Hosted deployment validation: NOT YET RUN. Resource existence is not validation.

Explicit configuration: APP_ENV=staging + NODE_ENV=production + PAYMENTS_PROVIDER=disabled. There is no automatic disabled default: omitted provider remains stripe. Only explicit staging may disable payments; APP_ENV=production or an unlabelled production runtime rejects disabled startup. Stripe mode retains mandatory key/webhook configuration and staging TEST-only checks. Storage, database, Redis, JWT, SMTP, exact HTTPS origins and Secure cookie requirements remain enforced. Credentials were not read, printed, tested or configured; existing .env was not read or modified.

Disabled mode returns HTTP 503 / PAYMENT_PROVIDER_UNAVAILABLE for intent creation/cancellation, payment/refund event processing, refund requests/processing, payout requests/processing, buyer refund resolution and provider reconciliation. Guards precede financial writes/provider calls; authentication/admin middleware remains in place. No simulated IDs, payment, refund, payout or funded order. Internal funded-order domain rules/ledger/default 10% fee/default 72 hours/locks/snapshots/bounds are retained. An ordinary order API may still create a server-priced PENDING record; that is not a payment and cannot become PAID through a user status mutation. The UI disables new checkout in unavailable mode.

GET /api/v1/payments/capabilities exposes only provider/status/availability and explicitly false provider-validation/external-payout capability. GET /health performs real DB/Redis probes and includes payments.status=disabled, provider=disabled, available=false. It can return 200 for healthy non-payment staging dependencies; database/Redis probe failure returns generic 503. GET /health/live is process liveness. Stripe status configured, when enabled, is configuration only, never a provider-health PASS. These endpoints do not certify release readiness.

Frontend fails closed while capability is loading/missing/disabled; browsing and non-payment controls remain usable. Checkout, payment form, refund/cancellation-provider actions, payout reservations and admin provider actions are gated, with professional unavailable copy. Stripe.js uses its pure loader and is not loaded in disabled mode. Backend stable unavailable errors map to the same public message.

Local current-source results: initial unit/API/security run 158 PASS (21 files); final affected four-file rerun 49 PASS after strengthened buyer-resolution/webhook/Redis-failure coverage. Backend typecheck/lint/build PASS; frontend typecheck/strict lint/production build PASS (42 static pages plus dynamic routes), with reserved test public origins and no publishable key. Affected production-artifact browser tests 15 PASS, retries 0, exit 0: 12 disabled-provider checkout/payment/refund/seller/admin controls plus 3 existing revision/redelivery cases across Chromium/WebKit/Mobile Chrome. Owned preview helper stopped. No application test failures. No schema/migration edits, DB validation rerun, hosted connection, real provider call, deployment or push. Existing Next middleware/Edge runtime deprecation warnings remain.

Render commands verified against root/workspace/API scripts; see STAGING_SETUP_REQUIRED.md. All existing hosted gate BLOCKER entries below remain unvalidated; resource preparation is not hosted PASS. Current Stripe blocker cannot be resolved by fake business/account information. Non-payment Render staging configuration may proceed privately after local checks; deployment and migration execution require a separate explicit operator action.

## Earlier hosted-preparation evidence (historical)

Date: 2026-10-07. Evidence categories: LOCAL VALIDATION; HOSTED STAGING VALIDATION; PROVIDER TEST-MODE VALIDATION; PRODUCTION VALIDATION. PASS applies only to the explicitly stated category and scope. Current hosted gates are BLOCKER (blocked), never inferred from local tests.

Previous baseline: FINANCIAL SYSTEM READY FOR HOSTED PROVIDER VALIDATION; TASCORA NOT READY FOR DEPLOYMENT. Retained: 10% fee, 72-hour default, authoritative prices/snapshots, safe arithmetic, DB locks/idempotency/authorization/immutable ledger, refund bounds and internal payout accounting; 142 local tests, 32 DB tests on EACH of two clean disposable databases, both type/lint/build checks and affected Chromium/WebKit/mobile proofs. Previous genuine Stripe/payout gaps remain.

## Environment Inventory

WARNING — architecture restored: Next.js frontend, Express/Socket.IO API, Prisma/PostgreSQL, ioredis, Stripe, S3-compatible private storage, Nodemailer, in-process node-cron. No positively identified hosted staging destination/account/resource is available. No external connections, deployments, purchases, emails or provider requests made. Existing dirty worktree and unknown debug.log preserved.
Process inventory: DATABASE_URL, REDIS_URL, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, JWT_ACCESS_SECRET, storage credentials, SMTP credentials, WEB_URL and public frontend variables MISSING. Existing .env: DATABASE_URL, REDIS_URL, JWT_ACCESS_SECRET and NEXT_PUBLIC_API_URL PRESENT; Stripe/storage/SMTP and staging origins MISSING. Presence does not establish isolation. Existing database/Redis/API provenance is ambiguous and was not used. .env unchanged: 474 bytes, 2026-09-20 13:27:05 UTC.
APP_ENV=staging now requires NODE_ENV=production, avoids local .env loading, and requires a test Stripe key. This guard does not prove database/account/bucket ownership; operator provenance is still mandatory.

## PostgreSQL

BLOCKER — hosted instance/provenance/credentials absent. No connection or write to any existing database. LOCAL PASS retained: 32 real DB tests on each of two independent clean disposable databases; migrate deploy, generate, migration status, repeat deploy/no drift and cleanup passed in prior phase. Not rerun.
Unchanged schema/migrations reviewed: Decimal monetary columns, foreign keys, uniqueness/indexes, immutable snapshot/ledger triggers, refund/amount constraints, order locks and bounded transactions. Legacy NOT VALID constraints require data review. Hosted pooling, TLS, lifecycle, locks, concurrency and transaction behavior remain NOT TESTED.

## Redis

BLOCKER — hosted isolation/authentication/TLS/reconnect/failure/startup/shutdown not exercised. Usage search finds only /health ping and shutdown disconnect. No application keys or key namespace; no cache, session, job, lock, rate-limit or Socket.IO adapter usage. Lazy connect, 5-second connection timeout, two request retries; readiness check disabled. Error logging now omits raw error objects. Existing local Redis evidence is not hosted proof. Current phase local Redis runtime NOT TESTED.

## Stripe Test Mode

BLOCKER — genuine TEST credentials/publishable key absent. No Stripe API calls. Local fixture tests PASS; these are not provider evidence. Staging rejects live keys at configuration load and payment-operation guard; signed live events rejected. Test secret format alone does not establish a designated test account.
Actual server price -> PaymentIntent -> official test method -> provider result -> signed webhook -> transaction/order/ledger/10% fee/seller pending/audit remains NOT TESTED. Persisted funded order enum is PAID (UI funding terminology), not a new FUNDED enum. Decline/failure/replay/navigation-loss scenarios require genuine provider tests.

## Stripe Webhooks

BLOCKER — genuine Stripe-signed delivery and hosted HTTPS endpoint unavailable; Stripe CLI not found. LOCAL PASS: fixture signed/raw-body verification, malformed/invalid signature, event processing and duplicate protections in payment lifecycle tests. Locally generated signatures do not count as provider signing. Route /api/v1/payments/webhook is POST, raw application/json before JSON parser, 256 KiB limit. Recognized financial events persisted/deduplicated inside financial transactions; unknown types acknowledged without financial mutation. Hosted retries/delays/out-of-order/notification deduplication require real delivery evidence.

## Refunds

BLOCKER — genuine TEST charge/refund unavailable. Full/partial, duplicate, overflow and seller accounting local baseline preserved. Provider refund IDs, remaining refundable bounds, ledger/history and stale provider refunds require actual test-mode roundtrip. Never refund existing unknown transactions.

## Stripe Connect / Payout

BLOCKER — external payout adapter unavailable; admin queue reports payoutProviderAvailable=false. No transfers, connected accounts or bank details used. Internal reservation/accounting baseline PASS is separate. Even existing Connect test credentials would require implementation and ownership/onboarding/restriction/recovery validation before provider simulation.
Post-payout refund: internal code refuses fictitious reversal when paid/reserved balance requires recovery. Externally paid funds are not automatically recovered. Recovery liability, processor fees and business policy unresolved.
PROVIDER CHARGEBACK POLICY = BLOCKER: charge.dispute.* events are not handled by current financial webhook dispatcher. Internal marketplace disputes are distinct; unknown provider dispute events are acknowledged, not accounted for.

## Storage

BLOCKER — private staging S3 bucket/credentials unavailable. LOCAL PASS: targeted upload-security tests. Avatars/service images share owner-bound upload references; chat/delivery access requires persisted participation. MIME magic/type match and 5 MiB limit; key validation/path confinement; local exclusive writes; private S3 put and 60-second presigned reads. Public raster references require eligible persisted profile/service. Private download URLs are bearer URLs until expiry. S3 public-image redirect, CORS, retrieval and persistence not exercised. No deletion API/retention/orphan cleanup policy defined. Local filesystem is not hosted storage.

## HTTPS

BLOCKER — no isolated HTTPS frontend/API/reverse proxy available. Certificate/proxy/upgrade behavior NOT TESTED. Production public origins enforce exact HTTPS; staging uses production runtime.

## Authentication Cookies

BLOCKER — hosted browser behavior NOT TESTED. LOCAL PASS: Secure, HttpOnly, SameSite=None, auth path, expiry/logout clearing tests. Cookie host-only (no Domain); path /api/v1/auth. Refresh rotation/session expiry/CSRF origin protections retained. HTTPS login/reload/API/refresh/logout/browser restart and browser third-party-cookie restrictions remain to exercise. Staging and production must have distinct API hosts; do not share cookie domains.

## CORS

BLOCKER — hosted origins absent. LOCAL PASS: exact HTTPS allowlist/config and cookie-action origin checks. No credentialed wildcard; localhost rejected in production configuration. Ordinary disallowed CORS requests receive no allow-origin header (browser blocks reading); middleware does not reject all requests at HTTP layer. Cookie mutations separately require trusted Origin/custom header; sockets gate Origin. Hosted allowed/unknown origins, credentialed/preflight behavior remain NOT TESTED.

## Socket.IO

BLOCKER — hosted proxy/browser/reconnect/transport/cross-origin isolation NOT TESTED. LOCAL PASS: wire/authorization tests on loopback with mocked persistence. Authenticated sessions, expiry and room membership guarded; browser REST recovery retained. In-memory adapter only: multiple replicas need shared fanout adapter and polling sticky sessions; use one staging replica until architecture changes. Duplicate socket sends have no client idempotency key; duplicate-delivery/reconnect proof remains open.

## Scheduled Jobs

BLOCKER — hosted execution unavailable. Hourly completion/outbox and daily reputation jobs run in API entrypoint; ENABLE_CRON=false disables. Exactly one cron owner required; compose worker is a placeholder. Manual acceptance/auto completion share domain completion and financial locking. Default 72 hours unchanged; latest delivery cutoff, DELIVERED status and refund/escrow guards reviewed. Prior real DB tests cover controlled timestamps, concurrent completion/revision/dispute and duplicate releases. Exact >=72h boundary matrix and hosted retries/execution remain NOT TESTED this phase. First-100 candidates and outbox bounds remain warnings.

## Frontend / Backend Connectivity

BLOCKER — staging public URLs/build configuration absent. Production frontend build requires explicit HTTPS NEXT_PUBLIC_API_URL/NEXT_PUBLIC_WEB_URL; no production localhost fallback. Public values baked at build time; use separate staging artifact and pk_test key. No staging frontend loaded; health/login/catalog/checkout/orders/dashboard/chat/notifications/uploads/financial UI hosted smoke NOT TESTED.

## Security

WARNING — local targeted security PASS only. Preserved previous 142 unit/API/security baseline and financial DB proof; no production security certification. Added APP_ENV staging guards and runtime live-key rejection. Secret inventory values never printed; no .env changes. Hosted IDOR/admin/isolation/financial tampering/webhook/upload/socket/CORS/cookie/secret leakage matrix BLOCKER pending staging.

## Failure Recovery

BLOCKER — genuine backend restart/DB reconnect/Redis reconnect/socket reconnect/provider retry/storage failure not exercised. Local webhook idempotency and security tests PASS; prior financial DB concurrency/reservation proofs retained. Financial outbox separates notices from money transactions. Effectively-once outcomes rely on unique records and locks; no exactly-once distributed guarantee. Graceful shutdown disconnects DB/Redis after HTTP close with 10-second forced exit; socket/cron in-flight draining needs runtime proof.
Health /health checks DB then Redis and returns generic failure; no independent liveness endpoint, no explicit overall deadline; storage/SMTP/Stripe are not probed. Treat /health as dependency readiness only, not full provider readiness.

## Provider Reconciliation

BLOCKER — actual Stripe mismatch/recovery unexercised. Admin diagnostic retrieves bound intents/refunds, validates price/ownership and flags pending funding/refund mismatch/truncated scans; appends RECONCILIATION_CHECK audit. Refund scan limit 100; queues bounded. It does not automatically repair all mismatches. Old unbound attempt/refund, out-of-band refund and externally paid recovery require explicit auditable operator process. Do not silently rewrite ledger.

## Test Results

LOCAL PASS — initial targeted six files: 38 tests, exit 0 (production config/cookies, payment lifecycle, upload security, socket wire/authorization). Payment lifecycle after live-key regression: 17 PASS; final rerun after signed-live-event regression: 18 PASS, exit 0. Combined distinct final cases: 40 PASS. Backend typecheck, lint and build PASS. Fixtures and local signatures are not genuine provider evidence.
NOT TESTED — hosted and provider tests. Docker probe BLOCKER: engine pipe absent; configuration access denied. No image builds/container startup attempted. PowerShell pnpm.ps1 invocation blocked by execution policy; switched to pnpm.cmd without machine policy changes. No application test failures. No expensive DB/browser/full release rerun.

## Unvalidated Items

BLOCKER — all hosted resources/provider flows, private bucket, HTTPS cookies/CORS/realtime/scheduler, sandbox email account verification, Docker images/runtime, recovery/load, provider chargebacks/payout/recovery policy and full release matrix.
SMTP: launch-critical registration verification uses email. Sandbox SMTP absent; no emails sent. Development Ethereal fallback is forbidden by production runtime. Financial notices use DB outbox; SMTP cannot certify financial state. Email delivery and failure recovery NOT TESTED.

## Production Differences

WARNING — PRODUCTION VALIDATION = NOT TESTED and not authorized. Staging uses APP_ENV=staging + NODE_ENV=production, distinct secrets/resources/hosts and Stripe TEST keys. Local mocks/HTTP/loopback cannot establish hosted security, provider behavior or live payout capabilities. No production deployment, account or database accessed. Existing compose is development with fixed DB/Redis ports/default credentials/persistent volumes; never run it as staging proof or against existing services.
Docker production file builds API only; no frontend production Dockerfile exists. CI uses reserved example origins and fixture tests; no hosted smoke/deploy/provider evidence. Do not treat green CI as provider certification.

## Hosted Validation Gate

| Component                 | Status  |
| ------------------------- | ------- |
| Hosted PostgreSQL         | BLOCKER |
| Hosted Redis              | BLOCKER |
| Stripe Test PaymentIntent | BLOCKER |
| Stripe Test Payment       | BLOCKER |
| Stripe Signed Webhook     | BLOCKER |
| Hosted HTTPS Webhook      | BLOCKER |
| Stripe Test Refund        | BLOCKER |
| Stripe Reconciliation     | BLOCKER |
| Stripe Connect Test       | BLOCKER |
| Real Payout Provider      | BLOCKER |
| Persistent Storage        | BLOCKER |
| HTTPS                     | BLOCKER |
| Secure Cookies            | BLOCKER |
| CORS                      | BLOCKER |
| Hosted Socket.IO          | BLOCKER |
| Hosted Scheduler          | BLOCKER |
| Docker Runtime            | BLOCKER |
| Failure Recovery          | BLOCKER |
| Hosted Security           | BLOCKER |

HOSTED PROVIDER VALIDATION PARTIALLY PASSED

NOT READY FOR FULL RELEASE VALIDATION

TASCORA NOT READY FOR DEPLOYMENT

Final backend build PASS (tsc, exit 0). Partial outcome refers to completed repository/static/local preparation only; no hosted/provider gate passed. Operator actions: STAGING_SETUP_REQUIRED.md. No task-created external records/resources exist to clean up.
