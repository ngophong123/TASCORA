-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.

ALTER TYPE "VerificationStatus" ADD VALUE 'UNDER_REVIEW';
ALTER TYPE "VerificationStatus" ADD VALUE 'NEEDS_RESUBMISSION';
ALTER TYPE "VerificationStatus" ADD VALUE 'APPROVED';

-- AlterTable
ALTER TABLE "password_reset_tokens" ADD COLUMN     "consumedIp" TEXT,
ADD COLUMN     "requestedIp" TEXT,
ADD COLUMN     "usedAt" TIMESTAMP(3),
ADD COLUMN     "userAgent" TEXT;

-- AlterTable
ALTER TABLE "identity_verifications" ADD COLUMN     "country" TEXT,
ADD COLUMN     "dateOfBirthEncrypted" TEXT,
ADD COLUMN     "decisionReason" TEXT,
ADD COLUMN     "documentBackUrl" TEXT,
ADD COLUMN     "documentNumberEncrypted" TEXT,
ADD COLUMN     "documentNumberHash" TEXT,
ADD COLUMN     "documentNumberLast4" TEXT,
ADD COLUMN     "legalName" TEXT,
ADD COLUMN     "resubmissionRequestedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedById" TEXT,
ADD COLUMN     "scanStatus" TEXT NOT NULL DEFAULT 'QUARANTINED',
ADD COLUMN     "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "kyc_review_histories" (
    "id" TEXT NOT NULL,
    "identityVerificationId" TEXT NOT NULL,
    "sellerProfileId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorRole" "UserRole" NOT NULL,
    "decision" TEXT NOT NULL,
    "previousState" "VerificationStatus" NOT NULL,
    "newState" "VerificationStatus" NOT NULL,
    "reason" TEXT,
    "comments" TEXT,
    "correlationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kyc_review_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_audit_logs" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetEntity" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "correlationId" TEXT NOT NULL,
    "previousState" TEXT,
    "newState" TEXT,
    "reason" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "kyc_review_histories_identityVerificationId_createdAt_idx" ON "kyc_review_histories"("identityVerificationId", "createdAt");

-- CreateIndex
CREATE INDEX "kyc_review_histories_sellerProfileId_createdAt_idx" ON "kyc_review_histories"("sellerProfileId", "createdAt");

-- CreateIndex
CREATE INDEX "kyc_review_histories_actorId_createdAt_idx" ON "kyc_review_histories"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "admin_audit_logs_adminId_createdAt_idx" ON "admin_audit_logs"("adminId", "createdAt");

-- CreateIndex
CREATE INDEX "admin_audit_logs_targetEntity_targetId_createdAt_idx" ON "admin_audit_logs"("targetEntity", "targetId", "createdAt");

-- CreateIndex
CREATE INDEX "admin_audit_logs_action_createdAt_idx" ON "admin_audit_logs"("action", "createdAt");

-- CreateIndex
CREATE INDEX "admin_audit_logs_correlationId_idx" ON "admin_audit_logs"("correlationId");

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_used_expiresAt_idx" ON "password_reset_tokens"("userId", "used", "expiresAt");

-- CreateIndex
CREATE INDEX "identity_verifications_status_submittedAt_idx" ON "identity_verifications"("status", "submittedAt");

-- CreateIndex
CREATE INDEX "identity_verifications_documentNumberHash_idx" ON "identity_verifications"("documentNumberHash");

-- AddForeignKey
ALTER TABLE "identity_verifications" ADD CONSTRAINT "identity_verifications_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyc_review_histories" ADD CONSTRAINT "kyc_review_histories_identityVerificationId_fkey" FOREIGN KEY ("identityVerificationId") REFERENCES "identity_verifications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyc_review_histories" ADD CONSTRAINT "kyc_review_histories_sellerProfileId_fkey" FOREIGN KEY ("sellerProfileId") REFERENCES "seller_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyc_review_histories" ADD CONSTRAINT "kyc_review_histories_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Domain constraints and append-only audit immutability triggers.
ALTER TABLE "identity_verifications" ADD CONSTRAINT "identity_verifications_doc_type_check" CHECK ("documentType" IN ('PASSPORT', 'NATIONAL_ID', 'DRIVERS_LICENSE', 'RESIDENCE_PERMIT')) NOT VALID;
ALTER TABLE "identity_verifications" ADD CONSTRAINT "identity_verifications_scan_status_check" CHECK ("scanStatus" IN ('PENDING_SCAN', 'QUARANTINED', 'VERIFIED_SAFE', 'SCAN_UNAVAILABLE'));
ALTER TABLE "identity_verifications" ADD CONSTRAINT "identity_verifications_version_check" CHECK ("version" >= 1);
ALTER TABLE "kyc_review_histories" ADD CONSTRAINT "kyc_review_histories_decision_check" CHECK ("decision" IN ('SUBMITTED', 'RESUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'NEEDS_RESUBMISSION'));

CREATE FUNCTION tascora_admin_audit_log_immutable() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Admin audit log is append-only and immutable';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER admin_audit_logs_immutable
  BEFORE UPDATE OR DELETE ON "admin_audit_logs"
  FOR EACH ROW EXECUTE FUNCTION tascora_admin_audit_log_immutable();

CREATE FUNCTION tascora_kyc_review_history_immutable() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'KYC review history is append-only and immutable';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER kyc_review_histories_immutable
  BEFORE UPDATE OR DELETE ON "kyc_review_histories"
  FOR EACH ROW EXECUTE FUNCTION tascora_kyc_review_history_immutable();
