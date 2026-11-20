# TASCORA Financial & Escrow Architecture

> **Boundary Notice:** TASCORA processes **no real money**. Stripe integration is restricted to **Test Mode** (`sk_test_*` / `rk_test_*`) or **Disabled Mode** (`PAYMENTS_PROVIDER=disabled`). **External seller payouts are intentionally disabled** (`unavailablePayoutProvider`) and return `503 Service Unavailable`.

---

## 1. Core Financial Invariants

All monetary flows in `apps/api/src/modules/financial/` and `apps/api/src/modules/payment/` enforce five invariants:

1. **Integer-Cent Arithmetic:** Monetary calculations convert decimal values to integer minor units (USD cents) in `apps/api/src/modules/financial/money.ts` (`cents`, `money`, `split`) to eliminate floating-point rounding drift.
2. **Immutable Order Financial Snapshot:** When an order is created, `amount`, `currency`, `platformFeeBps`, and `purchaseSnapshot` (including `deliveryDays`) are persisted on the `Order` row. Later edits to a service package price cannot alter an existing order's accounting basis (`basis(order)`).
3. **Per-Order Transactional Serialization:** Every financial mutation runs inside `financialTx` (`prisma.$transaction` with `15s` maxWait/timeout) and acquires a PostgreSQL transaction-scoped advisory lock (`SELECT 1 FROM pg_advisory_xact_lock(hashtext(orderId))`) via `lockOrder(tx, orderId)` so concurrent webhooks, refunds, disputes, and payout requests execute sequentially per order.
4. **Append-Only Ledger (`FinancialEntry`):** Balances (`pending`, `available`, `reserved`, `paid`) are never overwritten directly. Every movement appends a `FinancialEntry` with a unique `eventKey` and delta columns (`pendingDelta`, `availableDelta`, `reservedDelta`, `paidDelta`, `feeDelta`). Current order or seller balances are derived by summing deltas (`balances(tx, orderId)`).
5. **Durable Notification Outbox:** `FinancialEntry` rows carry an optional `notifyUserId`. After the money transaction commits, `flushFinancialNotices(orderId)` upserts `Notification` rows keyed by `sourceKey: financial:<entryId>` outside the transaction so a notification failure never rolls back settled ledger writes.

---

## 2. Order & Escrow State Machine

Defined explicitly in `apps/api/src/modules/financial/domain.ts`:

```mermaid
stateDiagram-v2
    [*] --> PENDING
    PENDING --> PAID: Verified payment_intent.succeeded webhook
    PENDING --> CANCELLED: Provider-confirmed unpaid cancellation
    PAID --> IN_PROGRESS: Seller starts work
    PAID --> REFUNDED: Pre-work full refund confirmed
    PAID --> DISPUTED: Buyer opens dispute
    IN_PROGRESS --> DELIVERED: Seller submits delivery
    IN_PROGRESS --> DISPUTED: Buyer opens dispute
    DELIVERED --> IN_REVISION: Buyer requests revision
    DELIVERED --> COMPLETED: Buyer accepts / auto-complete / admin resolves for seller
    DELIVERED --> DISPUTED: Buyer opens dispute
    IN_REVISION --> IN_PROGRESS: Seller resumes work
    IN_REVISION --> DELIVERED: Seller redelivers
    IN_REVISION --> DISPUTED: Buyer opens dispute
    DISPUTED --> COMPLETED: Admin resolves for SELLER
    DISPUTED --> REFUNDED: Admin resolves for BUYER + refund confirmed
    COMPLETED --> REFUNDED: Admin post-completion refund (if unreserved/unpaid)
    CANCELLED --> REFUNDED: Reconciliation refund
```

Any transition outside `transitions[from]` throws `409 Conflict` (`transition(from, to)`).

---

## 3. Payment & Webhook Deduplication Flow

1. **Create Intent (`PaymentService.createPaymentIntent`):**
   - Verifies `assertProviderConfigured()` (blocks live keys in `NODE_ENV=test` or `APP_ENV=staging`; blocks all calls when `PAYMENTS_PROVIDER=disabled`).
   - Locks the order, validates `order.status === 'PENDING'`, validates Stripe USD bounds (`>= 50` cents, `<= 8` digits), and reuses any live non-cancelled `Transaction` attempt or creates one with a durable `attemptKey: payment:<orderId>:<uuid>`.
   - Calls `stripe.paymentIntents.create(..., { idempotencyKey: transaction.attemptKey })` and verifies returned amount, currency, and metadata before binding `stripePaymentId`.
2. **Webhook Settlement (`PaymentService.handleWebhookEvent`):**
   - Raw request body signature verified in `payment.controller.ts` before invoking the service.
   - Computes SHA-256 `payloadHash` of `event.data.object`.
   - Inside `lockOrder`, checks `ProviderEvent` by `event.id`:
     - Exact duplicate (`same type` + `same payloadHash`): returns idempotently without re-applying movements.
     - Conflicting payload for the same `event.id`: rejects with `400 Event ID payload mismatch`.
   - On `payment_intent.succeeded`, verifies `payment.amount_received === expected`, creates `Escrow`, appends `PAYMENT_RECEIVED` (`pendingDelta: +split.earning`, `feeDelta: +split.fee`), updates `Order` to `PAID` with computed `deliveryDate`, and inserts `ProviderEvent`.

---

## 4. Refunds & Internal Disputes

- **Refunds (`apps/api/src/modules/financial/refund.service.ts`):**
  - Buyer self-service refunds are restricted to full pre-work cancellation (`order.status === 'PAID'`); administrators may specify partial or full amounts during resolution.
  - Requests require a `16–128` character `requestKey` deduplicated via composite unique `(orderId, requestKey)`.
  - Refunds are blocked (`409`) whenever seller earnings are already `reserved` or `paid` (preventing negative seller balances without an explicit recovery flow).
  - Provider calls use Stripe idempotency key `refund:<refundId>`. Provider timeouts leave the refund in `PROCESSING` (keeping earnings frozen) rather than assuming failure.
  - On `succeeded`, `RefundService.apply` computes proportional fee and earning reversals via `split(gross - refunded, feeBps) - split(gross - total, feeBps)`, appends `REFUND` or `PARTIAL_REFUND`, and closes open disputes on full refund.
- **Disputes (`apps/api/src/modules/financial/dispute.service.ts`):**
  - Buyers can open a dispute on `PAID`, `IN_PROGRESS`, `IN_REVISION`, or `DELIVERED` orders while escrow is unreleased, freezing the order in `DISPUTED`.
  - Admins inspect bundled evidence (`DisputeService.evidence`) and resolve either for `SELLER` (completing order & releasing escrow) or `BUYER` (reserving a full remaining refund and setting dispute to `UNDER_REVIEW` until provider refund settles).

---

## 5. Seller Payout Boundary (Intentionally Disabled)

- **Seller Request (`PayoutService.request`):** When `PAYMENTS_PROVIDER` is enabled and an order is `COMPLETED` with released escrow, zero active refunds/disputes, and positive `available` balance, a seller can reserve available earnings into a `PENDING` `Payout` (`availableDelta: -amount`, `reservedDelta: +amount`) using a unique `requestKey`.
- **External Disbursement (`PayoutService.process`):** Defaults to `unavailablePayoutProvider` (`available: false`), which fails closed with `503 Payout provider validation required`. Even with an injected test double in integration tests, `PayoutService.process` enforces strict reference/amount/currency matching and leaves ambiguous timeouts in `PROCESSING` / `reserved` until reconciled.

---

## 6. Verification Evidence

- Unit tests: `tests/unit/financial-money.spec.ts`, `tests/unit/order-lifecycle.spec.ts`, `tests/unit/wallet-ledger.spec.ts`
- API & security tests: `tests/api/payment-lifecycle.spec.ts`, `tests/api/payment-provider-disabled.spec.ts`, `tests/security/order-payment.spec.ts`
- Disposable PostgreSQL concurrency & migration tests (CI verified in `infrastructure-acceptance.yml`): `tests/database/financial-system.spec.ts`, `tests/database/disposable-postgres.spec.ts`
