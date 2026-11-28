# ADR 005: Decoupled Append-Only Admin Financial Recovery Case Management

- **Status:** Accepted & Implemented
- **Primary Files:** `apps/api/src/modules/financial/recovery-case.service.ts`, `apps/api/src/modules/financial/dispute.service.ts`, `apps/api/src/modules/financial/financial.route.ts`, `prisma/migrations/20261127150000_financial_recovery_cases/migration.sql`, `apps/web/src/components/dashboard/payments/FinancialRecoverySection.tsx`

## Context

When a Stripe provider dispute (`charge.dispute.*`) arrives after a seller's earnings are already `reserved` or `paid`, TASCORA marks `MarketplaceDispute.recoveryRequired = true` and blocks further seller payouts. Prior to this decision, administrators had no operational queue, assignment mechanism, or structured investigation log to inspect those holds—only raw database rows.

At the same time, allowing an admin UI action to clear `recoveryRequired` or post manual ledger adjustments without a verified settlement/clawback rail would create an unsafe backdoor capable of bypassing payout holds or corrupting the append-only `FinancialEntry` ledger.

## Decision

1. **Separate Investigation Workflow from Accounting Ledger:** Model admin recovery review in two dedicated tables—`FinancialRecoveryCase` (1:1 unique per `MarketplaceDispute`) and `FinancialRecoveryEvent` (append-only chronological timeline)—strictly decoupled from `FinancialEntry`, `Escrow`, `Payout`, and `Refund`.
2. **Investigation-Only State Machine (No Fake Settlement):** Restrict case statuses via both application logic and PostgreSQL `CHECK` constraints to `OPEN`, `INVESTIGATING`, `AWAITING_EVIDENCE`, and `PENDING_VERIFICATION`. Omit `RESOLVED`/`SETTLED` states until an independently verified settlement mechanism exists.
3. **Immutable Audit Trail at Both App and Database Layers:** Enforce append-only semantics on `FinancialRecoveryEvent` via PostgreSQL `BEFORE UPDATE OR DELETE` and `BEFORE TRUNCATE` triggers, Prisma immutability middleware (`IMMUTABLE_MODELS`), and per-action `AdminAuditLog` records.
4. **Automatic Creation & Idempotent Backfill:** Automatically create a `FinancialRecoveryCase` inside `DisputeService.handleProviderDisputeEvent` whenever `recoveryRequired` becomes `true`, and idempotently backfill pre-existing recovery disputes in the additive migration (`ON CONFLICT DO NOTHING`).
5. **Preserve Existing PostgreSQL Enum Boundary:** Use constrained `TEXT`/`String` columns with PostgreSQL `CHECK` constraints for recovery status and event types rather than adding new database enum types, keeping schema evolution additive and compatible with migration verification checks.

## Consequences

- **Positive:** Administrators gain a complete operational queue, ledger/order context, assignment workflow, evidence/note tracking, and immutable audit history while financial holds (`MarketplaceDispute.recoveryRequired = true`), ledger balances, and disabled external payouts (`503`) remain provably untouchable by investigation actions.
- **Trade-offs:** Clearing a recovery hold remains impossible through the admin UI until a future ADR defines and verifies a real financial settlement, clawback, or offsetting ledger reconciliation mechanism.
