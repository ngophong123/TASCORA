-- Milestone 4A.5E: Additive schema migration for:
-- - Workstream A: KYC malware scanning worker lease, retry scheduling & attempt tracking
-- - Workstream B: Server-side UploadObject registry & KYC/GENERAL object lifecycle tracking
-- - Workstream D: IdentityVerification documentNumberHmacVersion tracking for HMAC key separation migration

-- 1. Extend IdentityVerification with scan worker tracking & HMAC version metadata
ALTER TABLE "identity_verifications" ADD COLUMN "documentNumberHmacVersion" TEXT NOT NULL DEFAULT 'v1';
ALTER TABLE "identity_verifications" ADD COLUMN "scanAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "identity_verifications" ADD COLUMN "lastScanAttemptAt" TIMESTAMP(3);
ALTER TABLE "identity_verifications" ADD COLUMN "nextScanRetryAt" TIMESTAMP(3);
ALTER TABLE "identity_verifications" ADD COLUMN "scanLeaseExpiresAt" TIMESTAMP(3);
ALTER TABLE "identity_verifications" ADD COLUMN "scanClaimId" TEXT;

ALTER TABLE "identity_verifications" DROP CONSTRAINT "identity_verifications_scan_status_check";
ALTER TABLE "identity_verifications" ADD CONSTRAINT "identity_verifications_scan_status_check"
  CHECK ("scanStatus" IN ('PENDING_SCAN', 'QUARANTINED', 'SCANNING', 'VERIFIED_SAFE', 'SCAN_FAILED', 'SCAN_UNAVAILABLE', 'INFECTED'));

CREATE INDEX "identity_verifications_scanStatus_nextScanRetryAt_idx" ON "identity_verifications"("scanStatus", "nextScanRetryAt");
CREATE INDEX "identity_verifications_documentNumberHmacVersion_idx" ON "identity_verifications"("documentNumberHmacVersion");

-- 2. Create UploadObject registry for server-side classification & quarantine lifecycle
CREATE TABLE "upload_objects" (
    "id" TEXT NOT NULL,
    "objectKey" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "byteSize" INTEGER NOT NULL,
    "purpose" TEXT NOT NULL DEFAULT 'GENERAL',
    "lifecycleStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
    "scanStatus" TEXT NOT NULL DEFAULT 'NOT_REQUIRED',
    "scanResult" TEXT,
    "scannedAt" TIMESTAMP(3),
    "scanEngineVersion" TEXT,
    "kycVerificationId" TEXT,
    "kycSlot" TEXT,
    "replacedAt" TIMESTAMP(3),
    "retentionUntil" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "upload_objects_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "upload_objects_purpose_check" CHECK ("purpose" IN ('GENERAL', 'KYC')),
    CONSTRAINT "upload_objects_lifecycle_check" CHECK ("lifecycleStatus" IN ('ACTIVE', 'REPLACED', 'ORPHANED', 'DELETED')),
    CONSTRAINT "upload_objects_scan_status_check" CHECK ("scanStatus" IN ('NOT_REQUIRED', 'PENDING_SCAN', 'QUARANTINED', 'SCANNING', 'VERIFIED_SAFE', 'SCAN_FAILED', 'SCAN_UNAVAILABLE', 'INFECTED')),
    CONSTRAINT "upload_objects_kyc_slot_check" CHECK ("kycSlot" IS NULL OR "kycSlot" IN ('documentFront', 'documentBack', 'selfie'))
);

CREATE UNIQUE INDEX "upload_objects_objectKey_key" ON "upload_objects"("objectKey");
CREATE UNIQUE INDEX "upload_objects_reference_key" ON "upload_objects"("reference");
CREATE INDEX "upload_objects_ownerId_purpose_lifecycleStatus_idx" ON "upload_objects"("ownerId", "purpose", "lifecycleStatus");
CREATE INDEX "upload_objects_kycVerificationId_lifecycleStatus_idx" ON "upload_objects"("kycVerificationId", "lifecycleStatus");
CREATE INDEX "upload_objects_lifecycleStatus_retentionUntil_idx" ON "upload_objects"("lifecycleStatus", "retentionUntil");

ALTER TABLE "upload_objects" ADD CONSTRAINT "upload_objects_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "upload_objects" ADD CONSTRAINT "upload_objects_kycVerificationId_fkey" FOREIGN KEY ("kycVerificationId") REFERENCES "identity_verifications"("id") ON DELETE SET NULL ON UPDATE CASCADE;
