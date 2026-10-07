# TASCORA Staging Setup Required

## Current operator setup: non-payment Render staging

This section supersedes earlier resource-creation/Stripe-unblocking steps below. PostgreSQL resource prepared: YES (Neon). Redis resource prepared: YES (Layerbase). Private S3-compatible storage prepared: YES (Backblaze B2). SMTP sandbox prepared: YES (Mailtrap Email Sandbox). These are operator-reported RESOURCE PREPARED facts, not HOSTED VALIDATION results. Hosted deployment validation: NOT YET RUN. Stripe provider validation: BLOCKED. External payouts: DISABLED. No resource connection or credential inspection performed in this task.

### Render settings verified against this monorepo

- Root directory: repository root (leave the optional subdirectory field empty).
- Branch: feat/seed-data. Local changes must first be reviewed and deliberately made available to Render by the operator; no push performed here.
- Build: `pnpm install --frozen-lockfile --prod=false && pnpm db:generate && pnpm --filter @taskora/api build`.
- Start: `pnpm --filter @taskora/api start`.
- Use the pinned pnpm 12.4.1 and Node 22 runtime. Root db:generate runs Prisma client generation; API build runs TypeScript into apps/api/dist; start runs node dist/index.js from the API workspace. These commands do not run migrations or seeds. The exact hosted install/build/start sequence has NOT run on Render.
- Health check: /health for genuine PostgreSQL/Redis dependency readiness. /health/live is available separately for process liveness. Disabled payments are reported unavailable, never healthy.
- Keep one API instance; Socket.IO uses an in-memory adapter and rate limits are process-local. Set ENABLE_CRON=false for initial staging smoke; enable on exactly one owner only when isolated scheduler validation is separately authorized. In-process jobs require an awake API and do not establish scheduler SLA.
- Disable automatic deployment and do not click deployment/create actions as part of this configuration-only task. Do not purchase compute or other services.

The API binds Number(PORT) on 0.0.0.0, matching [Render port binding](https://render.com/docs/web-services#port-binding). Render terminates HTTPS before forwarding HTTP; Secure cookies remain determined by NODE_ENV=production. The existing Socket.IO server shares that HTTP listener; [Render supports WebSockets](https://render.com/docs/websocket), but upgrade/fallback/reconnect/cross-origin behavior is not yet exercised. Exact CORS origins are required. Configure TRUST_PROXY=1 for the planned single-hop Render staging ingress: the centralized parser supplies numeric 1 to Express. Supported settings are trimmed true/false or non-negative safe integer hop counts (0 trusts no hops); missing/blank is false. Subnet strings and ambiguous values are rejected. Do not substitute unrestricted true for Render's one-hop setting. Verify the actual ingress path and forwarding-header handling during hosted smoke; a hop count requires consistent trusted proxy paths. See [Express proxy guidance](https://expressjs.com/en/guide/behind-proxies/).

### Configure privately in the staging API secret manager

WHAT: intentional disabled payment provider, existing isolated dependencies and exact HTTPS frontend origin.
WHY: run genuine non-payment marketplace validation while Stripe is legitimately unavailable.
WHERE: Render staging API runtime environment; public frontend settings separately at frontend build time.
VARIABLES:

- APP_ENV: staging; NODE_ENV: production; PAYMENTS_PROVIDER: disabled.
- DATABASE_URL; REDIS_URL; JWT_ACCESS_SECRET: dedicated staging secrets only.
- STORAGE_PROVIDER: s3; STORAGE_BUCKET; STORAGE_REGION; STORAGE_ENDPOINT; STORAGE_ACCESS_KEY; STORAGE_SECRET_KEY; STORAGE_FORCE_PATH_STYLE only if required by the S3-compatible provider. Use the operator's private bucket/restricted credentials and HTTPS endpoint; do not make the bucket public.
- SMTP_HOST; SMTP_PORT; SMTP_SECURE; SMTP_USER; SMTP_PASSWORD; SMTP_FROM: Mailtrap Email Sandbox only, designated sandbox recipients.
- WEB_URL; CORS_ORIGINS: exact staging frontend HTTPS origins. COOKIE_SAME_SITE: lax for same-site HTTPS, none for separate sites; browser third-party-cookie restrictions still need testing. Cookies stay Secure/HttpOnly/host-only/auth-path scoped.
- TRUST_PROXY: 1 for the planned Render staging reverse proxy; ENABLE_CRON: false initially; PORT supplied by Render.
- Leave STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY unset in disabled mode. No fake keys, accounts, unsigned webhooks or substituted success. If legitimate Stripe TEST access becomes available later, opt into stripe mode and configure legitimate TEST keys/signing secret; this remains blocked now.
- PLATFORM_FEE_PERCENT and ORDER_AUTO_COMPLETE_HOURS are optional validated overrides; omit to preserve default 10% and 72 hours.

Frontend build: NEXT_PUBLIC_API_URL and NEXT_PUBLIC_WEB_URL must be explicit staging HTTPS origins. No publishable key in disabled mode. Browser capability comes from the API; no frontend fake-payment flag. Rebuild when public origins change. Do not embed server secrets.

VERIFY: confirm staging-only project/database/instance/bucket/mailbox identity and secret-manager configuration without sharing values. A later authorized hosted smoke must verify /health/live, genuine /health DB/Redis checks with payments disabled, capabilities, login/refresh/logout/CORS/socket, catalog/profile/favorites/chat/uploads and sandbox verification email. Disabled financial endpoints must return 503 and no financial state changes.

WHAT CODEX SHOULD RUN AFTERWARD: only after separate explicit hosted staging/deployment authorization, recheck non-secret destination provenance, review staging-only migration status/plan before any database write, run Render build/start and non-payment hosted smoke plus fail-closed endpoint checks. Do not reset/drop/truncate/seed the Neon database. This task does not authorize database access or deployment. No Stripe validation can be claimed; no external payouts can be enabled.

Exact next manual step: privately configure/review these Render environment/build/start settings and frontend origins, without deploying or disclosing credentials; confirm configuration completion. Then separately authorize isolated hosted deployment/validation and the database migration plan.

## Earlier phase setup instructions (historical; current instructions above take precedence)

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
