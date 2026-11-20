# ADR 002: Append-Only Financial Ledger, Advisory Order Locks & Webhook Deduplication

- **Status:** Accepted & CI Verified
- **Primary Files:** `apps/api/src/modules/financial/domain.ts`, `apps/api/src/modules/financial/money.ts`, `apps/api/src/modules/payment/payment.service.ts`, `apps/api/src/modules/financial/refund.service.ts`

## Context

Marketplace payments involve asynchronous Stripe webhooks, retried client requests, pre-work cancellations, partial/full refunds, and admin dispute resolutions. Mutating a single `walletBalance` column in place makes race conditions, double-credits, and audit drift difficult to detect or recover from.

## Decision

1. **Integer-Cent Accounting:** Perform all split and balance arithmetic in integer USD cents (`money.ts`) rather than IEEE-754 floats.
2. **Per-Order PostgreSQL Advisory Locks:** Acquire `pg_advisory_xact_lock(hashtext(orderId))` inside every `financialTx` transaction so concurrent webhooks, refunds, disputes, and payout requests serialize per order.
3. **Append-Only `FinancialEntry` Ledger:** Record every state change as a delta row (`pendingDelta`, `availableDelta`, `reservedDelta`, `paidDelta`, `feeDelta`) protected by a unique `eventKey`. Derive balances strictly by aggregation.
4. **Webhook Payload Deduplication (`ProviderEvent`):** Store Stripe `event.id`, `type`, and SHA-256 `payloadHash`. Replays with identical hashes succeed idempotently; mismatched payloads for an existing `event.id` fail with `400`.
5. **Outbox Notifications Outside Money Transactions:** Flush `Notification` rows via `flushFinancialNotices` after the financial transaction commits so notification errors never roll back settled ledger rows.

## Consequences

- **Positive:** Concurrency races, duplicate webhooks, and mid-flight timeouts are deterministic and verifiable against disposable PostgreSQL (`tests/database/financial-system.spec.ts`).
- **Trade-offs:** Balance reads aggregate `FinancialEntry` rows (indexed by `orderId`) instead of reading a single mutable scalar; external seller payouts remain disabled (`unavailablePayoutProvider`) until a dedicated external disbursement adapter is audited.
