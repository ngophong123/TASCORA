# Staging Manual Operator Steps (Public-Safe Checklist)

> **Security Reminder:** Never commit secrets, passwords, database URLs, or API keys to this repository. Supply all credentials strictly through Render and Vercel secret managers.

## 1. Render API Service (`@taskora/api`)

- Root directory: repository root
- Build command: `pnpm install --frozen-lockfile --prod=false && pnpm db:generate && pnpm --filter @taskora/api build`
- Start command: `pnpm --filter @taskora/api start`
- Instance count: `1` (required while Socket.IO and rate-limiting use in-memory stores)
- Health check path: `/health`
- Required environment variables: see `docs/STAGING_READINESS_REPORT.md` Section 1 (`APP_ENV=staging`, `NODE_ENV=production`, `TRUST_PROXY=1`, `ENABLE_CRON=false`, `COOKIE_SAME_SITE=none`, `STORAGE_PROVIDER=s3`, Neon `DATABASE_URL`, TLS `REDIS_URL`, `JWT_ACCESS_SECRET`, separate 64-hex `KYC_ENCRYPTION_KEY` & `KYC_DOCUMENT_HMAC_KEY`, Backblaze B2 S3 vars, Mailtrap SMTP vars, exact HTTPS `WEB_URL` / `CORS_ORIGINS`, and either `PAYMENTS_PROVIDER=disabled` or `PAYMENTS_PROVIDER=stripe` with `sk_test_*` + `whsec_*`).

## 2. Vercel Web Project (`web`)

- Root directory: `apps/web`
- Build-time env vars (Preview & Staging environments):
  - `NEXT_PUBLIC_API_URL` (exact Render staging HTTPS origin, no `/api/v1`)
  - `NEXT_PUBLIC_WEB_URL` (exact Vercel staging HTTPS origin)
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (`pk_test_*`, only if `PAYMENTS_PROVIDER=stripe`)

## 3. Database Migration (Manual Pre-Smoke Step)

1. Take a Neon branch/snapshot backup of the staging database.
2. Run against staging `DATABASE_URL`:
   ```bash
   pnpm db:migrate:status
   pnpm db:migrate:deploy
   pnpm db:migrate:status
   ```
3. Confirm `6` migrations applied and `Database schema is up to date!`.

## 4. Handoff for Phase 4A.8

Once Render API and Vercel Web are live:

- Confirm `GET <API_ORIGIN>/health/live` returns `200`.
- Confirm `GET <API_ORIGIN>/health` returns `200` with healthy DB and Redis probes.
- Provide `<WEB_ORIGIN>` and `<API_ORIGIN>` to start Phase 4A.8 Hosted Staging Acceptance.
