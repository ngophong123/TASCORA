# GitHub Portfolio Drafts & Owner Action Guide (Internal)

This file contains ready-to-review drafts for GitHub repository settings, profile presentation, licensing, and personal engineering commentary. **No GitHub repository settings, profile files, or `LICENSE` files have been modified automatically.**

---

## 1. GitHub Repository "About" Settings (Manual Update by Owner)

- **Suggested Description (<= 160 chars):**
  `Full-stack freelance marketplace (Next.js 16, Express, TypeScript, Prisma, PostgreSQL, Redis, Socket.IO, ClamAV) with append-only escrow ledger & encrypted KYC.`
- **Suggested Website Field:**
  Leave blank until a verified hosted staging URL exists (do **not** link an unverified or broken URL).
- **Suggested Topics (12 verified technologies/patterns present in repo):**
  `nextjs`, `typescript`, `expressjs`, `prisma`, `postgresql`, `redis`, `socketio`, `stripe`, `clamav`, `monorepo`, `pnpm`, `marketplace`

---

## 2. Licensing Recommendation (Manual Decision by Owner)

- Currently the repository has **no `LICENSE` file**.
- **Recommendation:** Add an **MIT License** via GitHub's "Add file -> Create new file -> `LICENSE`" template if you want employers and open-source reviewers to inspect and run the code freely.
- Do not add a license until you confirm ownership of all included assets and want MIT terms.

---

## 3. GitHub Profile README Snippet (Optional Draft)

```markdown
### Featured Project: [TASCORA](https://github.com/ngophong123/TASCORA)

Full-stack freelance services marketplace monorepo (**Next.js 16, Express, TypeScript, Prisma, PostgreSQL, Redis, Socket.IO, ClamAV**).

- Built an append-only escrow ledger with PostgreSQL advisory order locks, integer-cent accounting, and Stripe webhook SHA-256 deduplication.
- Implemented AES-256-GCM envelope encryption + key-separated HMAC-SHA256 blind indexes for seller KYC with key-rotation migration support.
- Hardened file upload isolation and a fail-closed TCP `zINSTREAM` ClamAV scanner verified against live PostgreSQL 15 & ClamAV containers in GitHub Actions.
```

---

## 4. Human Engineering Identity — Author Prompts for Your Own Voice

> **Important:** Employers quickly spot AI-generated personal reflections. The section below intentionally does **not** fabricate your personal feelings or first-person story. Instead, it gives you concise prompts paired with **verified factual anchors from this repository** so you can write these four short sections in your own words (either in `README.md`, a case study, or interview prep).

### A. Why I Built TASCORA

- **Prompt to answer in 2–4 sentences:** What motivated you to go beyond a CRUD marketplace clone and tackle financial ledgers, KYC encryption, and upload malware scanning?
- **Factual repo anchor:** Monorepo spans 20 backend modules (`apps/api/src/modules/`), 25 localized App Router pages (`apps/web/src/app/[locale]/`), and 4 test layers (`unit`, `api`, `security`, `database` + Playwright E2E).

### B. What I Learned

- **Prompt to answer in 3–4 bullets:** Which backend, database, security, or CI constraint surprised you most when turning design specs into passing automated tests?
- **Factual repo anchors you can reference:**
  - Moving from naive balance columns to append-only `FinancialEntry` deltas + `pg_advisory_xact_lock` (`apps/api/src/modules/financial/domain.ts`).
  - Separating KYC encryption keys from HMAC blind-index keys with strict startup entropy checks (`apps/api/src/lib/kyc-key.ts`, `kyc-crypto.ts`).
  - Making `ClamdMalwareScanner` fail closed on unreachable sockets, stalled blackhole servers, and malformed replies (`apps/api/src/modules/kyc/malware-scanner.ts`).

### C. Hardest Bugs I Encountered (Verified Repo Incidents)

- **Prompt to pick 1–2 and describe your debugging process in your own words:**
  1. **GitHub Actions CI KYC Key Entropy Failure (Phase 4A.6.1):** Disposable PostgreSQL CI tests failed at `apps/api/src/lib/kyc-key.ts` (`insufficient byte diversity`) until CI generated masked 32-byte cryptographically random ephemeral keys with `>= 12` distinct bytes instead of static placeholder hex.
  2. **Database Acceptance Stripe & Index Verification Failures (Phase 4A.6.2):** Disposable PostgreSQL suite failed with `Payments are not configured` when `STRIPE_SECRET_KEY` was omitted in CI, and needed aligned migration/index checks under real PostgreSQL 15.
  3. **Frontend Baseline Dead Route & Fake Payout Dialog (Phase 0):** `CommandPalette.tsx` pointed "Payments & Escrow" to a nonexistent `/dashboard/wallet` route, and an orphaned `WithdrawDialog.tsx` simulated a fake `setTimeout` withdrawal while backend external payouts were intentionally disabled.

### D. What I Would Improve Next

- **Prompt to answer in 2–3 bullets:** If you had two more weeks on this system, which architectural limitation would you tackle first and why?
- **Factual repo anchors (`docs/KNOWN_LIMITATIONS.md`):**
  - Provisioning live hosted staging (Render + Vercel + managed PG/Redis/S3 + ClamAV) and capturing authenticated Buyer/Seller Dashboard screenshots.
  - Replacing in-memory Socket.IO and `express-rate-limit` stores with Redis adapters for multi-replica scaling.
  - Extracting background cron/scan execution into a dedicated worker container instead of the placeholder in `docker-compose.yml`.
