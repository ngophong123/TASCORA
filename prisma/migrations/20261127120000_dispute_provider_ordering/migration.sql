-- PR #27 follow-up: persist Stripe dispute provider event ordering metadata and explicit
-- chargeback financial recovery lock on marketplace_disputes (additive, non-destructive).

ALTER TABLE "marketplace_disputes"
  ADD COLUMN "providerDisputeId" TEXT,
  ADD COLUMN "providerStatus" TEXT,
  ADD COLUMN "lastProviderEventId" TEXT,
  ADD COLUMN "lastProviderEventType" TEXT,
  ADD COLUMN "lastProviderEventCreated" INTEGER,
  ADD COLUMN "recoveryRequired" BOOLEAN NOT NULL DEFAULT false;
