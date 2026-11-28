# Staging Manual Operator Steps (Public-Safe Checklist)

> **Security Reminder:** Never commit secrets, passwords, database URLs, or API keys to this repository. Supply all credentials strictly through Render and Vercel secret managers.

## 1. Render API Service (`@taskora/api`)

- Root directory: repository root
- Build command: `pnpm install --frozen-lockfile --prod=false && pnpm db:generate && pnpm --filter @taskora/api build`
- Start command: `pnpm --filter @taskora/api start`
- Runtime baseline: Node.js `22`, `pnpm@12.4.1`, API direct Zod `^4.6.7` (resolved `4.6.7` in `pnpm-lock.yaml`)
- Instance count: `1` (keep conservative `ENABLE_SOCKET_REDIS_ADAPTER=false` default until multi-instance Redis adapter, rate limiting, cron locks, and workers are verified on hosted infrastructure)
- Health check path: `/health`
- Required environment variables: see `docs/STAGING_READINESS_REPORT.md` Section 1 (`APP_ENV=staging`, `NODE_ENV=production`, `TRUST_PROXY=1`, `ENABLE_CRON=false`, `ENABLE_SOCKET_REDIS_ADAPTER=false`, `COOKIE_SAME_SITE=none`, `STORAGE_PROVIDER=s3`, Neon `DATABASE_URL`, TLS `REDIS_URL`, `JWT_ACCESS_SECRET`, separate 64-hex `KYC_ENCRYPTION_KEY` & `KYC_DOCUMENT_HMAC_KEY`, Backblaze B2 S3 vars, Mailtrap SMTP vars, exact HTTPS `WEB_URL` / `CORS_ORIGINS`, and either `PAYMENTS_PROVIDER=disabled` or `PAYMENTS_PROVIDER=stripe` with Stripe TEST credentials `sk_test_*`/`rk_test_*` + `whsec_*`). Live Stripe keys (`sk_live_*`/`rk_live_*`) and `livemode=true` webhooks are rejected in every environment; explicit `PAYMENTS_PROVIDER=disabled` is also permitted when `APP_ENV=production` + `NODE_ENV=production` (without Stripe keys, while retaining all other mandatory infrastructure checks).

## 2. Vercel Web Project (`web`)

- Framework: Next.js `16.4.6` (`apps/web/package.json`)
- Root directory: `apps/web`
- Build-time env vars (Preview & Staging environments):
  - `NEXT_PUBLIC_API_URL` (exact Render staging HTTPS origin, no `/api/v1`)
  - `NEXT_PUBLIC_WEB_URL` (exact Vercel staging HTTPS origin)
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (`pk_test_*`, only if `PAYMENTS_PROVIDER=stripe`; leave unset when `PAYMENTS_PROVIDER=disabled`)

## 3. Database Migration (Manual Pre-Smoke Step)

1. Take a Neon branch/snapshot backup of the staging database.
2. Run against staging `DATABASE_URL`:
   ```bash
   pnpm db:migrate:status
   pnpm db:migrate:deploy
   pnpm db:migrate:status
   ```
3. Confirm `9` migrations applied (`prisma/migrations/`) and `Database schema is up to date!`.

## 4. Handoff for Phase 4A.8

Once Render API and Vercel Web are live:

- Confirm `GET <API_ORIGIN>/health/live` returns `200`.
- Confirm `GET <API_ORIGIN>/health` returns `200` with healthy DB and Redis probes.
- Provide `<WEB_ORIGIN>` and `<API_ORIGIN>` to start Phase 4A.8 Hosted Staging Acceptance.
