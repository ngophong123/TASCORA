# ADR 003: AES-256-GCM Envelope Encryption & Dedicated Key-Separated HMAC Blind Index for KYC

- **Status:** Accepted & CI Verified
- **Primary Files:** `apps/api/src/lib/kyc-crypto.ts`, `apps/api/src/lib/kyc-key.ts`, `apps/api/src/modules/kyc/kyc-hmac-migration.service.ts`, `apps/api/src/workers/kyc-hmac-migrate.ts`

## Context

Seller KYC submissions include sensitive identity fields (document number and date of birth). Storing plaintext in PostgreSQL is unacceptable, yet the platform still needs to detect duplicate identity documents across seller accounts and support zero-downtime cryptographic key rotation without reusing the encryption key for indexing.

## Decision

1. **Versioned AES-256-GCM Envelope:** Encrypt sensitive fields using 32-byte subkeys derived via HKDF-SHA256 scoped to key version (`tascora:kyc:pii:aes-256-gcm:v2:<keyId>`), storing `v2:<keyId>:<iv>:<tag>:<ciphertext>` while maintaining backward-compatible decryption for legacy `v1` envelopes.
2. **Key-Separated HMAC-SHA256 Blind Index:** Require a distinct `KYC_DOCUMENT_HMAC_KEY` (verified not to equal `KYC_ENCRYPTION_KEY`) with its own versioned keyring (`v2:<keyId>`) to hash normalized document numbers for duplicate detection.
3. **Startup Key Entropy Enforcement:** `kyc-key.ts` rejects short keys, low byte diversity (`< 12` distinct bytes), and encryption/HMAC key reuse before handling requests.
4. **Offline Key Rotation Migration:** Provide `kyc-hmac-migrate.ts` and `kyc-hmac-migration.service.ts` to backfill multi-version blind-index entries and safely disable legacy `v1` HMAC lookup (`KYC_DISABLE_LEGACY_HMAC=true`) once backfill completes.

## Consequences

- **Positive:** Plaintext document numbers never sit in PostgreSQL or audit logs (`sanitizeAuditMetadata` redacts sensitive keys), and both encryption and HMAC keys can rotate independently without breaking duplicate detection.
- **Trade-offs:** Operators must provision and protect two independent high-entropy keys in staging/production (`KYC_ENCRYPTION_KEY` and `KYC_DOCUMENT_HMAC_KEY`), and CI must generate masked ephemeral high-entropy keys for database tests.
