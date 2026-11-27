-- PR #27 (F-09): Financial ledger immutability hardening, non-negative fee guard,
-- safe validation of legacy financial CHECK constraints, and hot-path payment/refund indexes.
-- Non-destructive additive migration preserving all existing financial and legacy wallet records.

-- 1. Statement-level BEFORE TRUNCATE immutability trigger on financial_entries,
-- matching admin_audit_logs_no_truncate and kyc_review_histories_no_truncate.
CREATE TRIGGER financial_entries_no_truncate
  BEFORE TRUNCATE ON "financial_entries"
  FOR EACH STATEMENT EXECUTE FUNCTION tascora_financial_entry_immutable();

-- 2. Extend financial_entries balance trigger to also prevent negative cumulative platform fees.
CREATE OR REPLACE FUNCTION tascora_financial_entry_balances() RETURNS trigger AS $$
DECLARE p numeric; a numeric; r numeric; d numeric; f numeric;
BEGIN
  PERFORM 1 FROM "orders" WHERE "id" = NEW."orderId" FOR UPDATE;
  SELECT COALESCE(SUM("pendingDelta"),0), COALESCE(SUM("availableDelta"),0), COALESCE(SUM("reservedDelta"),0), COALESCE(SUM("paidDelta"),0), COALESCE(SUM("feeDelta"),0)
    INTO p,a,r,d,f FROM "financial_entries" WHERE "orderId" = NEW."orderId";
  IF p + NEW."pendingDelta" < 0 OR a + NEW."availableDelta" < 0 OR r + NEW."reservedDelta" < 0 OR d + NEW."paidDelta" < 0 OR f + NEW."feeDelta" < 0 THEN
    RAISE EXCEPTION 'Financial balance cannot become negative';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Safely validate existing NOT VALID financial CHECK constraints when zero historical rows violate them.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM "orders"
    WHERE NOT ("amount" > 0 AND "currency" = 'usd' AND ("platformFeeBps" IS NULL OR "platformFeeBps" BETWEEN 0 AND 10000))
  ) THEN
    ALTER TABLE "orders" VALIDATE CONSTRAINT "orders_financial_amount_check";
  ELSE
    RAISE NOTICE 'Legacy non-conforming orders rows exist; skipping VALIDATE CONSTRAINT orders_financial_amount_check';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM "transactions"
    WHERE NOT ("amount" > 0 AND "refundedAmount" >= 0 AND "refundedAmount" <= "amount" AND "currency" = 'usd')
  ) THEN
    ALTER TABLE "transactions" VALIDATE CONSTRAINT "transactions_refund_bounds_check";
  ELSE
    RAISE NOTICE 'Legacy non-conforming transactions rows exist; skipping VALIDATE CONSTRAINT transactions_refund_bounds_check';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM "payouts"
    WHERE NOT ("amount" > 0 AND "attempt" >= 1)
  ) THEN
    ALTER TABLE "payouts" VALIDATE CONSTRAINT "payouts_positive_check";
  ELSE
    RAISE NOTICE 'Legacy non-conforming payouts rows exist; skipping VALIDATE CONSTRAINT payouts_positive_check';
  END IF;
END
$$;

-- 4. Additive hot-path indexes for order transactions, paginated reconciliation, and refunds.
CREATE INDEX "transactions_orderId_idx" ON "transactions"("orderId");
CREATE INDEX "transactions_createdAt_idx" ON "transactions"("createdAt");
CREATE INDEX "refunds_transactionId_idx" ON "refunds"("transactionId");
