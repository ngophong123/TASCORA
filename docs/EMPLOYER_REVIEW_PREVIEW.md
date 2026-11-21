# Employer & Technical Reviewer 5-Minute Walkthrough Preview

This document simulates how a hiring manager or staff engineer inspects the TASCORA repository in 5 minutes and highlights both strengths and honest remaining gaps.

## 0:00 – 0:30 — First Glance (`README.md`)

- **What the reviewer sees:** Clear one-line description of what TASCORA is, live GitHub Actions badges for both `Quality & Testing Toolchain` and `Infrastructure Acceptance (PostgreSQL & ClamAV)`, and an immediate upfront disclaimer explaining that payments are Test/Disabled mode only and external payouts are intentionally disabled.
- **Signal:** High credibility — no buzzwords ("Production-ready", "Enterprise-grade"), no fake live links, and clear separation between implemented/CI-verified work vs. unprovisioned cloud staging.

## 0:30 – 1:30 — Architecture & Engineering Depth (`PROBLEM -> SOLUTION -> EVIDENCE`)

- **What the reviewer checks:** The four `PROBLEM -> SOLUTION -> EVIDENCE` blocks and two Mermaid diagrams (System Architecture + Payment/Escrow/Ledger sequence).
- **Signal:** Clicking into `apps/api/src/modules/financial/domain.ts`, `apps/api/src/lib/kyc-crypto.ts`, and `apps/api/src/modules/kyc/malware-scanner.ts` confirms the README claims match real implementation details (`pg_advisory_xact_lock`, append-only `FinancialEntry`, HKDF-SHA256 + AES-256-GCM envelopes, TCP `zINSTREAM` chunked ClamAV client).

## 1:30 – 3:00 — Verification & CI Rigor

- **What the reviewer checks:** `.github/workflows/quality.yml`, `.github/workflows/infrastructure-acceptance.yml`, and `docs/IMPLEMENTATION_STATUS.md`.
- **Signal:** Tests go beyond trivial mocks:
  - Strict zero-warning ESLint on web, TypeScript strict checks across apps and database tests.
  - Unit, API contract, and security audit suites (including preview origin abort timeout, Socket.IO session revocation, upload chat isolation, and KYC HMAC migration).
  - Real `postgres:15-alpine`, `redis:7-alpine`, and `clamav/clamav:stable` CI acceptance verifying Prisma migrations, financial concurrency locks, EICAR detection, and fail-closed scanner timeouts.

## 3:00 – 5:00 — Code Hygiene, Trade-offs & Honest Critique

- **What the reviewer inspects:** `docs/KNOWN_LIMITATIONS.md`, `docs/adr/`, `docs/STAGING_RUNBOOK.md`, and recent PR/commit discipline.
- **Honest Critique (Remaining Gaps a Senior Reviewer Will Notice):**
  1. **No Live Public Staging URL Yet:** Reviewers cannot click a live hosted app yet until the owner provisions Render/Vercel/managed PostgreSQL/Redis/S3 using `docs/internal/STAGING_MANUAL_STEPS.md`.
  2. **No Product UI Screenshots Included Yet:** Public `README.md` intentionally omits UI screenshots rather than using placeholders or unverified captures; verified product visuals can be added later after hosted staging acceptance.
  3. **Single-Replica Real-Time & Rate Limit State:** Socket.IO and `express-rate-limit` use in-memory state; horizontal scaling requires Redis adapters (tracked for a later milestone).
  4. **Monorepo Naming Drift (`taskora` vs `TASCORA`) & Stub Packages:** Minor workspace cleanup items documented transparently in `docs/KNOWN_LIMITATIONS.md`.
