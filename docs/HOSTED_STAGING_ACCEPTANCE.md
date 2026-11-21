# TASCORA Hosted Staging Acceptance Ledger (Phase 4A.8)

- **Overall Hosted Status:** `BLOCKED` (awaiting owner-deployed Render API + Vercel Web staging URLs and cloud secrets)
- **Verification Standard:** Hosted acceptance items remain `BLOCKED` until executed against live HTTPS staging origins and backed by real HTTP/log evidence. No item in this file is marked `HOSTED VERIFIED` without live execution.

---

## 1. Prerequisites Blocking Live Execution

The automated agent cannot provision cloud accounts, create managed databases, or enter secret keys on Render, Vercel, Neon, Upstash, Backblaze B2, Mailtrap, or Stripe. Before running live acceptance:

1. Complete the operator checklist in [STAGING_MANUAL_STEPS.md](internal/STAGING_MANUAL_STEPS.md) and [STAGING_RUNBOOK.md](STAGING_RUNBOOK.md).
2. Confirm migrations are applied to the staging database (`pnpm db:migrate:deploy` -> `6` migrations applied).
3. Obtain the live HTTPS origins:
   - `STAGING_API_URL` (Render staging API origin, e.g. `https://<service>.onrender.com`)
   - `STAGING_WEB_URL` (Vercel staging web origin, e.g. `https://<project>.vercel.app`)

---

## 2. Automated Non-Destructive Smoke Harness

Once both staging origins are live, run the read-only acceptance harness from the repository root:

```bash
STAGING_API_URL="https://<your-render-staging-api>" \
STAGING_WEB_URL="https://<your-vercel-staging-web>" \
npx tsx scripts/verify-staging-acceptance.ts
```

The harness (`scripts/verify-staging-acceptance.ts`) enforces strict guardrails:

- Refuses missing targets (`BLOCKED`, exit code `2`).
- Refuses non-HTTPS remote URLs and disallowed production hostnames.
- Verifies `/health/live`, `/health` (database + redis probes and zero secret leakage), exact CORS allow/deny behavior with credentials, unauthenticated rejection (`401`/`403`) on `/api/v1/auth/me`, `/api/v1/admin/users`, and `/api/v1/uploads/kyc/*`, plus web reachability on `/en`.

---

## 3. Hosted Staging Acceptance Checklist

| Domain                | Verification Scope                                                                                                                                                                | Status    | Blocker / Notes                                                     |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------- |
| A. Health & Readiness | `GET /health/live` -> `200`; `GET /health` -> `200` (DB + Redis healthy); zero secrets in response                                                                                | `BLOCKED` | Requires live `STAGING_API_URL`                                     |
| B. Auth & Session     | Register, email verification (Mailtrap), login, cross-origin `HttpOnly` cookie, refresh rotation, logout & revocation                                                             | `BLOCKED` | Requires live `STAGING_API_URL` + `STAGING_WEB_URL` + Mailtrap SMTP |
| C. Upload & Malware   | Clean upload succeeds; invalid MIME/magic-bytes rejected; EICAR sample quarantined/rejected by live ClamAV; private upload blocks anonymous/cross-user access                     | `BLOCKED` | Requires live S3/B2 bucket + ClamAV service in staging              |
| D. KYC Security       | Encrypted KYC submission; admin approve/reject/needs-resubmission; non-admin denied; zero plaintext `documentNumber`/`dateOfBirth` in DB or logs                                  | `BLOCKED` | Requires live staging API + DB inspection                           |
| E. Payment & Webhook  | `PAYMENTS_PROVIDER=disabled` returns clean `503` OR `PAYMENTS_PROVIDER=stripe` (`sk_test_*`) verifies signature, rejects invalid signature & `livemode=true`, deduplicates replay | `BLOCKED` | Requires live staging API + Stripe test webhook secret              |
| F. Email              | Mailtrap sandbox delivery for verification / password reset; zero real recipient emails                                                                                           | `BLOCKED` | Requires staging Mailtrap credentials                               |
| G. Marketplace Smoke  | Public catalog loads on staging web; service detail loads; authenticated buyer/seller journey works without console/CORS/500 errors                                               | `BLOCKED` | Requires live `STAGING_WEB_URL` + `STAGING_API_URL`                 |
| H. Logs & Diagnostics | No passwords, JWTs, cookies, Stripe keys, or KYC PII in Render/Vercel logs                                                                                                        | `BLOCKED` | Requires post-smoke inspection of live Render/Vercel logs           |

---

## 4. What Is Already Verified Locally & in CI

- Staging environment validation (`APP_ENV=staging`, `PAYMENTS_PROVIDER`, `TRUST_PROXY`, `COOKIE_SAME_SITE`, `ENABLE_CRON`), CORS origin policy, KYC envelope encryption, fail-closed ClamAV scanning, and real PostgreSQL/Redis/ClamAV integration tests are `CI VERIFIED` in GitHub Actions (`quality.yml` and `infrastructure-acceptance.yml`).
- The staging acceptance harness (`scripts/verify-staging-acceptance.ts`) is unit-tested in `tests/unit/staging-acceptance-script.spec.ts`.
