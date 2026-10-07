# TASCORA Staging Setup Required

Do not paste secrets into chat. Configure an isolated staging secret manager/process environment; leave the existing .env untouched. No production destination, database, Redis, bucket, Stripe account objects, cookie host or webhook endpoint may be reused. Do not purchase infrastructure automatically. Confirm setup completion and provide only non-secret resource/provenance information.

## Common runtime and provenance

WHAT: existing no-purchase isolated resources and a record of ownership, account/project, intended test purpose and destination. Database name alone is insufficient.
WHY: all hosted gates currently BLOCKER; ambiguous existing targets cannot be used.
WHERE: dedicated staging API runtime and separate frontend build environment.
VARIABLES: APP_ENV=staging; NODE_ENV=production; PORT; WEB_URL; CORS_ORIGINS; JWT_ACCESS_SECRET; COOKIE_SAME_SITE; TRUST_PROXY; ENABLE_CRON. Use exact HTTPS origins, distinct API host, strong staging-only secret; trust only verified proxy ranges. Use one API replica and one cron owner.
VERIFY: operator confirms staging project/account ownership and absence of production resource reuse. No secret values in proof.
AFTER: Codex rechecks environment presence/format without printing values, verifies resource provenance before network calls, then executes only isolated validation.

## PostgreSQL

WHAT: fresh dedicated hosted staging PostgreSQL, restricted staging user and TLS connection; explicitly disposable test dataset/database.
WHY: hosted schema/transaction/concurrency/lifecycle evidence missing.
WHERE: API secret manager.
VARIABLES: DATABASE_URL.
VERIFY: operator records host/project ownership, fresh database identity, access scope, TLS and permission for isolated test records. Never authorize reset of an existing database.
AFTER: Codex runs pnpm.cmd db:generate, db:migrate:status and db:migrate:deploy ONLY after isolation proof; checks constraints/indexes/relations/precision and runs staging-specific uniquely tagged financial cases. Existing disposable test runner is for task-created local DBs; do not point it or database cleanup helpers at a hosted URL. No migrate reset/truncate. Preserve test record IDs for scoped cleanup.

## Redis

WHAT: dedicated authenticated staging native Redis endpoint with TLS where applicable.
WHY: hosted health/reconnect/failure/shutdown evidence missing.
WHERE: API secret manager.
VARIABLES: REDIS_URL.
VERIFY: dedicated instance ownership, rediss TLS/auth and no production reuse.
AFTER: Codex pings safely, tests bounded failures/reconnect/start/shutdown; no unknown-key deletion. Current app creates no Redis keys and has no Redis socket adapter.

## Stripe TEST and HTTPS webhook

WHAT: designated isolated Stripe test/sandbox account keys and TEST webhook signing secret. Test publishable and secret keys must belong to the same account. Existing test dashboard objects only; no live mode.
WHY: actual PaymentIntent/payment/refund/signature/retry/reconciliation unvalidated.
WHERE: API secret manager and separate frontend build variables; provider TEST endpoint settings.
VARIABLES: STRIPE_SECRET_KEY; STRIPE_WEBHOOK_SECRET; NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.
VERIFY: provider dashboard confirms test/sandbox account, keys and endpoint mode; endpoint targets staging API /api/v1/payments/webhook under HTTPS. Configure payment_intent.succeeded, payment_intent.payment_failed, payment_intent.processing, payment_intent.canceled, refund.created, refund.updated, refund.failed. Secret prefix alone does not prove endpoint/account isolation.
AFTER: Codex verifies test mode then creates tagged TASCORA staging purchases, exercises successful/declined/failed test payments using official Stripe test mechanisms, checks server cents/USD/metadata/IDs/order PAID/ledger/fee/pending/audit; replays provider requests/deliveries and verifies no double accounting/required notices. Test full/partial refunds on phase-created TEST payments, delayed webhooks/navigation loss and reconciliation diagnostics. Preserve provider request/event IDs without secrets/card data. Local CLI forwarding, if later available, remains local provider proof.
PAYOUT: leave external payouts disabled. No Connect setup variable unlocks the absent adapter. Requires a separate implemented/validated test Connect integration and defined recovery/chargeback liability policy. Do not create live accounts or use bank details.

## Private persistent storage

WHAT: dedicated private staging S3-compatible bucket and scoped put/get credentials; HTTPS endpoint if non-default provider.
WHY: upload/retrieval/ownership/persistence and public raster redirects unvalidated.
WHERE: API secret manager and bucket policy/CORS settings.
VARIABLES: STORAGE_PROVIDER=s3; STORAGE_BUCKET; STORAGE_REGION; STORAGE_ACCESS_KEY; STORAGE_SECRET_KEY; optional STORAGE_ENDPOINT and STORAGE_FORCE_PATH_STYLE.
VERIFY: project/bucket isolation, private access, TLS, least-privilege credentials; no public bucket.
AFTER: Codex uploads tagged avatar/service/chat/delivery fixtures, persists references, verifies public eligibility/private owner/participant access and expired URLs, restarts API and confirms persistence. Delete only positively identified phase-created objects after approval of scoped identity; retention/orphan policy remains to define.

## HTTPS frontend/API/realtime/scheduler

WHAT: existing isolated HTTPS hosts/proxy with WebSocket support and single API instance initially.
WHY: hosted authentication/CORS/realtime/connectivity/scheduler/security gates missing.
WHERE: frontend build settings, API runtime and hosting proxy/scheduler configuration.
VARIABLES: NEXT_PUBLIC_API_URL; NEXT_PUBLIC_WEB_URL; WEB_URL; CORS_ORIGINS; COOKIE_SAME_SITE; TRUST_PROXY; ENABLE_CRON.
VERIFY: staging artifact contains staging API origin and test publishable key; no localhost/production fallback; distinct cookie host; exact credentialed CORS; proxy supports upgrades/fallback. Use NODE_ENV=production for frontend build and API.
AFTER: Codex exercises HTTPS login/reload/refresh/logout/restart, allowed/unknown origins/preflight, browsing/detail/checkout/orders/dashboard/chat/notifications/uploads; authenticated/expired/unauthenticated socket connections, reconnect/room isolation/unread/duplicates. Run controlled <72h/>=72h/disputed/revision/already-completed/concurrent scheduler cases only on tagged isolated records; preserve default 72 hours. Test recoverable restarts/failures and compare provider/local audit records.

## Sandbox SMTP

WHAT: staging sandbox mailbox/provider restricted to designated test addresses.
WHY: registration verification is launch-critical.
WHERE: API secret manager/provider recipient allowlist.
VARIABLES: SMTP_HOST; SMTP_PORT; SMTP_SECURE; SMTP_USER; SMTP_PASSWORD; SMTP_FROM.
VERIFY: sandbox delivery/recipient restriction before sending; no unwanted real emails.
AFTER: Codex validates registration/verification and sandbox failure without financial corruption; never logs verification tokens or preview secrets.

## Docker and unresolved policy

WHAT: working Docker Engine available to the current session; no machine-wide install required by this phase.
WHY: engine unavailable; image/startup/network/shutdown gates untested. Existing Dockerfile.prod builds API only; frontend production image still needed.
WHERE: operator-managed local engine.
VARIABLES: no additional application variables beyond above.
VERIFY: docker version reports server reachable.
AFTER: Codex builds/executes uniquely named task-owned isolated images/containers with process-only configuration, no existing compose volumes, tests DB/Redis/health/shutdown and removes only certain task-owned artifacts. No prune.

Operator must also define provider chargeback handling, external post-payout recovery/processor-fee liability and auditable stale/unbound/out-of-band recovery. No automatic ledger rewrites. Once setup is complete, confirm configuration completion; Codex resumes genuine hosted/provider validation before full release validation.
