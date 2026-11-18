-- Workstream A: persist scanner verdict metadata alongside quarantine status and INFECTED state.
ALTER TABLE "identity_verifications" ADD COLUMN "scanResult" TEXT;
ALTER TABLE "identity_verifications" ADD COLUMN "scannedAt" TIMESTAMP(3);
ALTER TABLE "identity_verifications" ADD COLUMN "scanEngineVersion" TEXT;

ALTER TABLE "identity_verifications" DROP CONSTRAINT "identity_verifications_scan_status_check";
ALTER TABLE "identity_verifications" ADD CONSTRAINT "identity_verifications_scan_status_check"
  CHECK ("scanStatus" IN ('PENDING_SCAN', 'QUARANTINED', 'VERIFIED_SAFE', 'SCAN_UNAVAILABLE', 'INFECTED'));

-- Workstream D: composite lookup index for active government document uniqueness across seller accounts.
CREATE INDEX "identity_verifications_country_documentType_documentNumberHash_idx" ON "identity_verifications"("country", "documentType", "documentNumberHash");

-- Workstream C: statement-level BEFORE TRUNCATE immutability triggers on append-only compliance/audit tables.
-- Note on PostgreSQL privilege boundary: triggers protect against TRUNCATE while enabled under standard execution,
-- whereas a privileged SUPERUSER or table owner could disable triggers via DDL or session_replication_role.
-- Production DATABASE_URL must therefore use a non-superuser role without TRUNCATE/DDL privileges on audit tables.
CREATE TRIGGER admin_audit_logs_no_truncate
  BEFORE TRUNCATE ON "admin_audit_logs"
  FOR EACH STATEMENT EXECUTE FUNCTION tascora_admin_audit_log_immutable();

CREATE TRIGGER kyc_review_histories_no_truncate
  BEFORE TRUNCATE ON "kyc_review_histories"
  FOR EACH STATEMENT EXECUTE FUNCTION tascora_kyc_review_history_immutable();

-- Workstream D: conditional active-document uniqueness across separate seller profiles (status <> 'REJECTED').
-- Serialized by transaction-scoped advisory lock so concurrent submissions under READ COMMITTED cannot race,
-- while permitting a rejected claimant's document number to be submitted if legitimately owned elsewhere.
CREATE FUNCTION tascora_identity_verification_unique_active_doc() RETURNS trigger AS $$
BEGIN
  IF NEW."documentNumberHash" IS NOT NULL AND NEW."status"::text <> 'REJECTED' THEN
    PERFORM pg_advisory_xact_lock(
      hashtext(
        'kyc_active_doc:' || COALESCE(UPPER(NEW."country"), '') || ':' || NEW."documentType" || ':' || NEW."documentNumberHash"
      )
    );
    IF EXISTS (
      SELECT 1
      FROM "identity_verifications" existing
      WHERE existing."id" <> NEW."id"
        AND existing."sellerProfileId" <> NEW."sellerProfileId"
        AND COALESCE(UPPER(existing."country"), '') = COALESCE(UPPER(NEW."country"), '')
        AND existing."documentType" = NEW."documentType"
        AND existing."documentNumberHash" = NEW."documentNumberHash"
        AND existing."status"::text <> 'REJECTED'
    ) THEN
      RAISE EXCEPTION 'Duplicate active identity document for country, documentType, and documentNumberHash'
        USING ERRCODE = '23505', CONSTRAINT = 'identity_verifications_active_document_unique';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER identity_verifications_unique_active_doc
  BEFORE INSERT OR UPDATE ON "identity_verifications"
  FOR EACH ROW EXECUTE FUNCTION tascora_identity_verification_unique_active_doc();

-- Workstream D (DB-04): validate legacy NOT VALID check constraint safely only if zero historical rows violate it.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "identity_verifications"
    WHERE "documentType" NOT IN ('PASSPORT', 'NATIONAL_ID', 'DRIVERS_LICENSE', 'RESIDENCE_PERMIT')
  ) THEN
    ALTER TABLE "identity_verifications" VALIDATE CONSTRAINT "identity_verifications_doc_type_check";
  ELSE
    RAISE NOTICE 'Legacy non-conforming identity_verifications.documentType rows exist; skipping VALIDATE CONSTRAINT';
  END IF;
END
$$;
