-- Admin Financial Recovery Case Management: additive schema, immutability triggers,
-- and idempotent backfill for all existing disputes where recoveryRequired = true.
-- Preserves all historical records; FinancialEntry remains the sole financial ledger.

-- CreateTable
CREATE TABLE "financial_recovery_cases" (
    "id" TEXT NOT NULL,
    "disputeId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "sellerProfileId" TEXT NOT NULL,
    "assignedAdminId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "recoveryAmount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_recovery_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_recovery_events" (
    "id" TEXT NOT NULL,
    "recoveryCaseId" TEXT NOT NULL,
    "eventKey" TEXT,
    "actorId" TEXT,
    "type" TEXT NOT NULL,
    "previousStatus" TEXT,
    "nextStatus" TEXT,
    "assignedAdminId" TEXT,
    "note" TEXT,
    "evidenceRef" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "financial_recovery_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "financial_recovery_cases_disputeId_key" ON "financial_recovery_cases"("disputeId");

-- CreateIndex
CREATE UNIQUE INDEX "financial_recovery_cases_orderId_key" ON "financial_recovery_cases"("orderId");

-- CreateIndex
CREATE INDEX "financial_recovery_cases_status_lastActivityAt_idx" ON "financial_recovery_cases"("status", "lastActivityAt");

-- CreateIndex
CREATE INDEX "financial_recovery_cases_sellerProfileId_status_idx" ON "financial_recovery_cases"("sellerProfileId", "status");

-- CreateIndex
CREATE INDEX "financial_recovery_cases_assignedAdminId_status_idx" ON "financial_recovery_cases"("assignedAdminId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "financial_recovery_events_eventKey_key" ON "financial_recovery_events"("eventKey");

-- CreateIndex
CREATE INDEX "financial_recovery_events_recoveryCaseId_createdAt_idx" ON "financial_recovery_events"("recoveryCaseId", "createdAt");

-- AddForeignKey
ALTER TABLE "financial_recovery_cases" ADD CONSTRAINT "financial_recovery_cases_disputeId_fkey" FOREIGN KEY ("disputeId") REFERENCES "marketplace_disputes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_recovery_cases" ADD CONSTRAINT "financial_recovery_cases_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_recovery_cases" ADD CONSTRAINT "financial_recovery_cases_sellerProfileId_fkey" FOREIGN KEY ("sellerProfileId") REFERENCES "seller_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_recovery_cases" ADD CONSTRAINT "financial_recovery_cases_assignedAdminId_fkey" FOREIGN KEY ("assignedAdminId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_recovery_events" ADD CONSTRAINT "financial_recovery_events_recoveryCaseId_fkey" FOREIGN KEY ("recoveryCaseId") REFERENCES "financial_recovery_cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_recovery_events" ADD CONSTRAINT "financial_recovery_events_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Domain CHECK constraints (no fake terminal/release states permitted in investigation workflow)
ALTER TABLE "financial_recovery_cases"
  ADD CONSTRAINT "financial_recovery_cases_status_check"
  CHECK ("status" IN ('OPEN', 'INVESTIGATING', 'AWAITING_EVIDENCE', 'PENDING_VERIFICATION'));

ALTER TABLE "financial_recovery_cases"
  ADD CONSTRAINT "financial_recovery_cases_amount_check"
  CHECK ("recoveryAmount" > 0 AND "currency" = 'usd');

ALTER TABLE "financial_recovery_events"
  ADD CONSTRAINT "financial_recovery_events_type_check"
  CHECK ("type" IN ('CASE_OPENED', 'ASSIGNED', 'NOTE_ADDED', 'EVIDENCE_ATTACHED', 'EVIDENCE_REQUESTED', 'STATUS_CHANGED'));

-- Append-only immutability triggers on financial_recovery_events
CREATE FUNCTION tascora_financial_recovery_event_immutable() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Financial recovery history is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER financial_recovery_events_immutable
  BEFORE UPDATE OR DELETE ON "financial_recovery_events"
  FOR EACH ROW EXECUTE FUNCTION tascora_financial_recovery_event_immutable();

CREATE TRIGGER financial_recovery_events_no_truncate
  BEFORE TRUNCATE ON "financial_recovery_events"
  FOR EACH STATEMENT EXECUTE FUNCTION tascora_financial_recovery_event_immutable();

-- Idempotent backfill for all existing disputes where recoveryRequired = true
INSERT INTO "financial_recovery_cases" (
    "id",
    "disputeId",
    "orderId",
    "sellerProfileId",
    "status",
    "recoveryAmount",
    "currency",
    "lastActivityAt",
    "createdAt",
    "updatedAt"
)
SELECT
    'frc_' || d."id",
    d."id",
    d."orderId",
    o."sellerId",
    'OPEN',
    CASE WHEN COALESCE(fe_sum."amt", 0) > 0 THEN fe_sum."amt" ELSE o."amount" END,
    'usd',
    COALESCE(d."updatedAt", CURRENT_TIMESTAMP),
    COALESCE(d."createdAt", CURRENT_TIMESTAMP),
    CURRENT_TIMESTAMP
FROM "marketplace_disputes" d
JOIN "orders" o ON o."id" = d."orderId"
LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(fe."amount"), 0)::DECIMAL(10,2) AS "amt"
    FROM "financial_entries" fe
    WHERE fe."orderId" = d."orderId" AND fe."type" = 'CHARGEBACK_RECOVERY_REQUIRED'
) fe_sum ON true
WHERE d."recoveryRequired" = true
ON CONFLICT ("disputeId") DO NOTHING;

INSERT INTO "financial_recovery_events" (
    "id",
    "recoveryCaseId",
    "eventKey",
    "actorId",
    "type",
    "nextStatus",
    "note",
    "createdAt"
)
SELECT
    'fre_open_' || d."id",
    rc."id",
    'recovery-case:' || d."id" || ':opened',
    NULL,
    'CASE_OPENED',
    'OPEN',
    'Recovery case backfilled for existing recovery-required dispute',
    rc."createdAt"
FROM "financial_recovery_cases" rc
JOIN "marketplace_disputes" d ON d."id" = rc."disputeId"
WHERE d."recoveryRequired" = true
ON CONFLICT ("eventKey") DO NOTHING;
