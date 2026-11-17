-- Milestone 4A.5G (Workstream C / KYC-DUP-02):
-- Normalized active document fingerprint table enforcing cross-key HMAC uniqueness at PostgreSQL level.

CREATE TABLE "identity_document_fingerprints" (
    "id" TEXT NOT NULL,
    "identityVerificationId" TEXT NOT NULL,
    "sellerProfileId" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT '',
    "documentType" TEXT NOT NULL,
    "hmacVersion" TEXT NOT NULL,
    "documentNumberHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "identity_document_fingerprints_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "identity_document_fingerprints_identityVerificationId_hmacVersion_key" ON "identity_document_fingerprints"("identityVerificationId", "hmacVersion");
CREATE UNIQUE INDEX "identity_document_fingerprints_country_documentType_documentNumberHash_key" ON "identity_document_fingerprints"("country", "documentType", "documentNumberHash");
CREATE INDEX "identity_document_fingerprints_identityVerificationId_idx" ON "identity_document_fingerprints"("identityVerificationId");
CREATE INDEX "identity_document_fingerprints_hmacVersion_idx" ON "identity_document_fingerprints"("hmacVersion");

ALTER TABLE "identity_document_fingerprints" ADD CONSTRAINT "identity_document_fingerprints_identityVerificationId_fkey" FOREIGN KEY ("identityVerificationId") REFERENCES "identity_verifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Keep fingerprint rows consistent with parent active identity verification records even under raw SQL mutations.
CREATE FUNCTION tascora_identity_verification_sync_fingerprints() RETURNS trigger AS $$
DECLARE
  norm_country TEXT;
BEGIN
  IF NEW."status"::text = 'REJECTED' OR NEW."documentNumberHash" IS NULL THEN
    DELETE FROM "identity_document_fingerprints"
    WHERE "identityVerificationId" = NEW."id";
    RETURN NEW;
  END IF;

  norm_country := COALESCE(UPPER(BTRIM(NEW."country")), '');

  IF TG_OP = 'UPDATE' AND (
    COALESCE(UPPER(BTRIM(OLD."country")), '') IS DISTINCT FROM norm_country
    OR OLD."documentType" IS DISTINCT FROM NEW."documentType"
    OR OLD."sellerProfileId" IS DISTINCT FROM NEW."sellerProfileId"
  ) THEN
    UPDATE "identity_document_fingerprints"
    SET "country" = norm_country,
        "documentType" = NEW."documentType",
        "sellerProfileId" = NEW."sellerProfileId"
    WHERE "identityVerificationId" = NEW."id";
  END IF;

  INSERT INTO "identity_document_fingerprints" (
    "id",
    "identityVerificationId",
    "sellerProfileId",
    "country",
    "documentType",
    "hmacVersion",
    "documentNumberHash"
  )
  VALUES (
    'fp_' || md5(NEW."id" || ':' || NEW."documentNumberHmacVersion"),
    NEW."id",
    NEW."sellerProfileId",
    norm_country,
    NEW."documentType",
    NEW."documentNumberHmacVersion",
    NEW."documentNumberHash"
  )
  ON CONFLICT ("identityVerificationId", "hmacVersion") DO UPDATE
  SET "sellerProfileId" = EXCLUDED."sellerProfileId",
      "country" = EXCLUDED."country",
      "documentType" = EXCLUDED."documentType",
      "documentNumberHash" = EXCLUDED."documentNumberHash";

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER identity_verifications_sync_fingerprints
  AFTER INSERT OR UPDATE ON "identity_verifications"
  FOR EACH ROW EXECUTE FUNCTION tascora_identity_verification_sync_fingerprints();

CREATE FUNCTION tascora_identity_fingerprint_guard() RETURNS trigger AS $$
DECLARE
  parent_rec RECORD;
BEGIN
  SELECT "sellerProfileId", "status"::text AS "statusText", COALESCE(UPPER(BTRIM("country")), '') AS "normCountry", "documentType"
  INTO parent_rec
  FROM "identity_verifications"
  WHERE "id" = NEW."identityVerificationId";

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Parent identity verification not found for document fingerprint'
      USING ERRCODE = '23503';
  END IF;

  IF parent_rec."statusText" = 'REJECTED' THEN
    RAISE EXCEPTION 'Rejected identity verifications cannot hold active document fingerprints'
      USING ERRCODE = '23514';
  END IF;

  IF NEW."sellerProfileId" <> parent_rec."sellerProfileId"
     OR COALESCE(UPPER(BTRIM(NEW."country")), '') <> parent_rec."normCountry"
     OR NEW."documentType" <> parent_rec."documentType" THEN
    RAISE EXCEPTION 'Identity document fingerprint metadata mismatch with parent verification'
      USING ERRCODE = '23514';
  END IF;

  NEW."country" := parent_rec."normCountry";
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER identity_document_fingerprints_guard
  BEFORE INSERT OR UPDATE ON "identity_document_fingerprints"
  FOR EACH ROW EXECUTE FUNCTION tascora_identity_fingerprint_guard();

-- Backfill fingerprints for pre-existing non-REJECTED verifications on migration deploy.
INSERT INTO "identity_document_fingerprints" (
  "id",
  "identityVerificationId",
  "sellerProfileId",
  "country",
  "documentType",
  "hmacVersion",
  "documentNumberHash"
)
SELECT
  'fp_' || md5("id" || ':' || "documentNumberHmacVersion"),
  "id",
  "sellerProfileId",
  COALESCE(UPPER(BTRIM("country")), ''),
  "documentType",
  "documentNumberHmacVersion",
  "documentNumberHash"
FROM "identity_verifications"
WHERE "documentNumberHash" IS NOT NULL
  AND "status"::text <> 'REJECTED'
ON CONFLICT ("identityVerificationId", "hmacVersion") DO NOTHING;
