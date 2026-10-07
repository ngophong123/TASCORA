-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'REFUNDED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TransactionStatus" ADD VALUE 'PROCESSING';
ALTER TYPE "TransactionStatus" ADD VALUE 'CANCELLED';
ALTER TYPE "TransactionStatus" ADD VALUE 'PARTIALLY_REFUNDED';

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "checkoutKey" TEXT,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'usd',
ADD COLUMN     "lastDeliveredAt" TIMESTAMP(3),
ADD COLUMN     "platformFeeBps" INTEGER,
ADD COLUMN     "purchaseSnapshot" JSONB;

-- AlterTable
ALTER TABLE "order_deliveries" ADD COLUMN     "requestKey" TEXT;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "attemptKey" TEXT,
ADD COLUMN     "refundedAmount" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "payouts" ADD COLUMN     "attempt" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "failureReason" TEXT,
ADD COLUMN     "requestKey" TEXT;

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "financialEntryId" TEXT,
ADD COLUMN     "sourceKey" TEXT;

-- CreateTable
CREATE TABLE "financial_entries" (
    "id" TEXT NOT NULL,
    "eventKey" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "transactionId" TEXT,
    "refundId" TEXT,
    "payoutId" TEXT,
    "actorId" TEXT,
    "type" TEXT NOT NULL,
    "reason" TEXT,
    "providerId" TEXT,
    "amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "pendingDelta" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "availableDelta" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "reservedDelta" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "paidDelta" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "feeDelta" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "notifyUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "financial_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refunds" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "requestKey" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "stripeRefundId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplace_disputes" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "openedBy" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resolvedBy" TEXT,
    "resolutionReason" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_events" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "objectId" TEXT NOT NULL,
    "payloadHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provider_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "financial_entries_eventKey_key" ON "financial_entries"("eventKey");

-- CreateIndex
CREATE INDEX "financial_entries_orderId_createdAt_idx" ON "financial_entries"("orderId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "refunds_stripeRefundId_key" ON "refunds"("stripeRefundId");

-- CreateIndex
CREATE INDEX "refunds_status_idx" ON "refunds"("status");

-- CreateIndex
CREATE UNIQUE INDEX "refunds_orderId_requestKey_key" ON "refunds"("orderId", "requestKey");

-- CreateIndex
CREATE UNIQUE INDEX "marketplace_disputes_orderId_key" ON "marketplace_disputes"("orderId");

-- CreateIndex
CREATE INDEX "marketplace_disputes_status_createdAt_idx" ON "marketplace_disputes"("status", "createdAt");

-- CreateIndex
CREATE INDEX "orders_status_lastDeliveredAt_idx" ON "orders"("status", "lastDeliveredAt");

-- CreateIndex
CREATE UNIQUE INDEX "orders_buyerId_checkoutKey_key" ON "orders"("buyerId", "checkoutKey");

-- CreateIndex
CREATE UNIQUE INDEX "order_deliveries_orderId_requestKey_key" ON "order_deliveries"("orderId", "requestKey");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_attemptKey_key" ON "transactions"("attemptKey");

-- CreateIndex
CREATE UNIQUE INDEX "payouts_stripePayoutId_key" ON "payouts"("stripePayoutId");

-- CreateIndex
CREATE UNIQUE INDEX "payouts_sellerProfileId_requestKey_key" ON "payouts"("sellerProfileId", "requestKey");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_sourceKey_key" ON "notifications"("sourceKey");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_financialEntryId_fkey" FOREIGN KEY ("financialEntryId") REFERENCES "financial_entries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_entries" ADD CONSTRAINT "financial_entries_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_entries" ADD CONSTRAINT "financial_entries_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_entries" ADD CONSTRAINT "financial_entries_refundId_fkey" FOREIGN KEY ("refundId") REFERENCES "refunds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_entries" ADD CONSTRAINT "financial_entries_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "payouts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_disputes" ADD CONSTRAINT "marketplace_disputes_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- Monetary and lifecycle invariants supplement Prisma's type constraints.
-- NOT VALID retains legacy rows for explicit review; new/updated rows checked.
ALTER TABLE "orders" ADD CONSTRAINT "orders_financial_amount_check" CHECK ("amount" > 0 AND "currency" = 'usd' AND ("platformFeeBps" IS NULL OR "platformFeeBps" BETWEEN 0 AND 10000)) NOT VALID;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_refund_bounds_check" CHECK ("amount" > 0 AND "refundedAmount" >= 0 AND "refundedAmount" <= "amount" AND "currency" = 'usd') NOT VALID;
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_positive_check" CHECK ("amount" > 0);
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_positive_check" CHECK ("amount" > 0 AND "attempt" >= 1) NOT VALID;
ALTER TABLE "marketplace_disputes" ADD CONSTRAINT "marketplace_disputes_status_check" CHECK ("status" IN ('OPEN', 'UNDER_REVIEW', 'RESOLVED_BUYER', 'RESOLVED_SELLER', 'CLOSED'));
ALTER TABLE "financial_entries" ADD CONSTRAINT "financial_entries_amount_check" CHECK ("amount" >= 0);
CREATE FUNCTION tascora_financial_entry_immutable() RETURNS trigger AS $$
BEGIN RAISE EXCEPTION 'Financial history is append-only'; END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER financial_entries_immutable BEFORE UPDATE OR DELETE ON "financial_entries" FOR EACH ROW EXECUTE FUNCTION tascora_financial_entry_immutable();

CREATE FUNCTION tascora_financial_entry_balances() RETURNS trigger AS $$
DECLARE p numeric; a numeric; r numeric; d numeric;
BEGIN
  -- DB row lock also guards inserts made outside the application domain.
  PERFORM 1 FROM "orders" WHERE "id" = NEW."orderId" FOR UPDATE;
  SELECT COALESCE(SUM("pendingDelta"),0), COALESCE(SUM("availableDelta"),0), COALESCE(SUM("reservedDelta"),0), COALESCE(SUM("paidDelta"),0)
    INTO p,a,r,d FROM "financial_entries" WHERE "orderId" = NEW."orderId";
  IF p + NEW."pendingDelta" < 0 OR a + NEW."availableDelta" < 0 OR r + NEW."reservedDelta" < 0 OR d + NEW."paidDelta" < 0 THEN
    RAISE EXCEPTION 'Financial balance cannot become negative';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER financial_entries_balances BEFORE INSERT ON "financial_entries" FOR EACH ROW EXECUTE FUNCTION tascora_financial_entry_balances();

CREATE FUNCTION tascora_order_snapshot_immutable() RETURNS trigger AS $$
BEGIN
  IF OLD."purchaseSnapshot" IS NOT NULL AND (NEW."amount" IS DISTINCT FROM OLD."amount" OR NEW."currency" IS DISTINCT FROM OLD."currency" OR NEW."platformFeeBps" IS DISTINCT FROM OLD."platformFeeBps" OR NEW."purchaseSnapshot" IS DISTINCT FROM OLD."purchaseSnapshot" OR NEW."buyerId" IS DISTINCT FROM OLD."buyerId" OR NEW."sellerId" IS DISTINCT FROM OLD."sellerId" OR NEW."serviceId" IS DISTINCT FROM OLD."serviceId" OR NEW."packageId" IS DISTINCT FROM OLD."packageId") THEN
    RAISE EXCEPTION 'Purchase financial snapshot is immutable';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER orders_snapshot_immutable BEFORE UPDATE ON "orders" FOR EACH ROW EXECUTE FUNCTION tascora_order_snapshot_immutable();
