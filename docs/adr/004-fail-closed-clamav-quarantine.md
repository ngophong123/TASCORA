# ADR 004: Fail-Closed Upload Isolation & Live ClamAV `zINSTREAM` Malware Scanning

- **Status:** Accepted & CI Verified
- **Primary Files:** `apps/api/src/modules/kyc/malware-scanner.ts`, `apps/api/src/modules/upload/references.ts`, `apps/api/src/modules/upload/storage.ts`, `.github/workflows/infrastructure-acceptance.yml`

## Context

Marketplace uploads serve two incompatible trust zones: public/shared media (avatars, service covers, chat attachments, order deliveries) and private seller KYC identity documents. If KYC uploads can be referenced in chat or profiles, private documents leak; if an unavailable or timing-out antivirus scanner fails open, malicious payloads could reach admin reviewers.

## Decision

1. **Strict Purpose & Ownership Isolation:** Every uploaded object is registered with its owner and purpose. Non-KYC routes (chat, deliveries, profiles, onboarding, services) explicitly reject KYC-purpose, replaced, orphaned, infected, or unregistered object keys (`tests/security/upload-chat-isolation.spec.ts`).
2. **Hardened `ClamdMalwareScanner` Client:** Stream files over TCP using ClamAV `zINSTREAM` in 64 KiB chunks with backpressure handling, pre-scan and in-stream byte caps, bounded concurrency semaphore, connect/idle/overall deadlines, and strict reply parsing (`stream: OK` vs `FOUND` vs error/malformed).
3. **Fail-Closed Default (`UnavailableMalwareScanner`):** When `KYC_SCANNER_PROVIDER !== 'clamd'` or `CLAMD_HOST` is unset, uploads remain `QUARANTINED` (`verdict: UNAVAILABLE`). Any unreachable daemon, timeout, or indeterminate reply resolves to `SCAN_FAILED` — never `VERIFIED_SAFE`.
4. **Live Daemon CI Acceptance:** Run a real `clamav/clamav:stable` service container in GitHub Actions to verify EICAR detection, clean PNG promotion, mixed-batch rejection, unreachable port fail-closed behavior, blackhole timeout fail-closed behavior, and disabled-scanner quarantine.

## Consequences

- **Positive:** Admin KYC review is gated behind genuine malware verdicts, and scanner outages degrade safely into quarantine rather than silent bypass.
- **Trade-offs:** Deploying live malware scanning in staging/production requires hosting a memory-provisioned `clamd` instance (~1–2 GB RAM for signature databases); otherwise KYC submissions intentionally remain quarantined.
