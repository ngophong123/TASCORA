# Employer & Technical Reviewer 5-Minute Walkthrough Preview

This document simulates how a hiring manager or staff engineer inspects the TASCORA repository in 5 minutes and highlights both strengths and honest remaining gaps.

## 0:00 – 0:30 — First Glance (`README.md`)

- **What the reviewer sees:** Clear one-line description of what TASCORA is, live GitHub Actions badges for both `Quality & Testing Toolchain` and `Infrastructure Acceptance (PostgreSQL & ClamAV)`, and an immediate upfront portfolio disclaimer stating Stripe Test Mode only, sample/seed data, and zero real financial transactions.
- **Signal:** High credibility — zero buzzwords, zero fake live demo links, zero mockups/placeholders, and transparent verification status.

## 0:30 – 1:30 — Architecture & Engineering Depth (`PROBLEM -> SOLUTION -> EVIDENCE`)

- **What the reviewer checks:** Five `PROBLEM -> SOLUTION -> EVIDENCE` blocks and two Mermaid diagrams (System Architecture + Payment/Escrow/Ledger sequence).
- **Signal:** Clicking into `apps/api/src/modules/financial/domain.ts`, `apps/api/src/lib/kyc-crypto.ts`, `apps/api/src/modules/kyc/malware-scanner.ts`, and `tests/unit/docs-truthfulness.spec.ts` confirms every README claim maps directly to working, tested code.

## 1:30 – 3:00 — Verification & CI Rigor

- **What the reviewer checks:** `.github/workflows/quality.yml`, `.github/workflows/infrastructure-acceptance.yml`, `docs/IMPLEMENTATION_STATUS.md`, and `docs/TASCORA_FINAL_ENGINEERING_REVIEW.md`.
- **Signal:** Five distinct verification layers run in CI:
  - Strict zero-warning ESLint on web and TypeScript checks across apps and database tests.
  - Unit, API contract, and security/IDOR suites.
  - Playwright E2E + `@axe-core/playwright` + Lighthouse CI.
  - Real `postgres:15-alpine`, `redis:7-alpine`, and `clamav/clamav:stable` acceptance verifying migrations, financial concurrency locks, EICAR detection, and fail-closed scanner timeouts.

## 3:00 – 5:00 — Code Hygiene, Trade-offs & Honest Critique

- **What the reviewer inspects:** `docs/KNOWN_LIMITATIONS.md`, `docs/adr/`, `docs/STAGING_RUNBOOK.md`, and PR history (`#7`–`#20`).
- **Honest Critique (Remaining Gaps a Senior Reviewer Will Notice):**
  1. **No Live Hosted Staging URL Yet (`BLOCKED`):** Reviewers cannot interact with a live cloud deployment until the owner provisions Render/Vercel/managed PG/Redis/S3/Mailtrap/ClamAV using `docs/internal/STAGING_MANUAL_STEPS.md`.
  2. **Dependency Audit Remediation Pending:** `pnpm audit` advisories (including `next@16.3.5`) are documented honestly in Phase 4G and queued for a dedicated upgrade PR.
  3. **No Product UI Screenshots in `README.md`:** Intentionally omitted per repository policy rather than using mockups or unverified screenshots.
  4. **Monorepo Naming Drift (`taskora` vs `TASCORA`) & Stub Packages:** Minor workspace cleanup items documented transparently in `docs/KNOWN_LIMITATIONS.md`.
