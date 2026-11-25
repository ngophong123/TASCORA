# TASCORA Product Analytics & KPI Definitions (Phase 4E)

> **Data Honesty Policy:** All metrics are derived strictly from PostgreSQL (`Order`, `Refund`, `MarketplaceDispute`, `FinancialEntry`, `SellerProfile`, `Service`). Non-production environments explicitly tag API payloads with `dataLabel: "Demo Data"`. Metrics without real telemetry instrumentation (`profileViews`) return `null` instead of fabricated placeholders.

---

## 1. Accounting Distinction: GMV vs Platform Revenue vs Seller Earnings

TASCORA strictly separates three distinct financial concepts using integer-cent calculations in `apps/api/src/modules/analytics/kpi-calculator.ts`:

$$\text{GMV} \neq \text{Platform Revenue} \neq \text{Seller Earnings}$$

- **GMV** measures total gross buyer order volume across funded orders.
- **Platform Revenue** measures only TASCORA's retained platform commission (`SUM(FinancialEntry.feeDelta)`), automatically net of proportional refund fee reversals.
- **Seller Earnings** measures only the seller's net share across the append-only ledger (`SUM(pendingDelta + availableDelta + reservedDelta + paidDelta)`).

For a single `$100.00` funded order with a `10%` (`1000` bps) platform fee and zero refunds:

- `GMV` = `$100.00`
- `Net GMV` = `$100.00`
- `Platform Revenue` = `$10.00`
- `Seller Earnings` = `$90.00`

---

## 2. Canonical KPI Catalog

| KPI                       | Formula                                                                                                                              | Data Source                             | Edge-Case Policy                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **GMV**                   | $\sum \text{Order.amount}$ where `status` $\in$ `{PAID, IN_PROGRESS, IN_REVISION, DELIVERED, COMPLETED, DISPUTED, REFUNDED}`         | `Order`                                 | Excludes unpaid `PENDING` and `CANCELLED` orders; returns `"0.00"` when empty                                       |
| **Refunded Volume**       | $\sum \text{Refund.amount}$ where `status = 'SUCCEEDED'`                                                                             | `Refund`                                | Excludes `PENDING`/`PROCESSING`/`FAILED` refunds; returns `"0.00"` when empty                                       |
| **Net GMV**               | $\max(0, \text{GMV} - \text{Refunded Volume})$                                                                                       | `Order`, `Refund`                       | Clamped at `0` cents (`"0.00"`)                                                                                     |
| **Platform Revenue**      | $\sum \text{FinancialEntry.feeDelta}$                                                                                                | `FinancialEntry`                        | Reflects proportional fee reversals on partial/full refunds                                                         |
| **Seller Earnings**       | $\sum (\text{pendingDelta} + \text{availableDelta} + \text{reservedDelta} + \text{paidDelta})$                                       | `FinancialEntry`                        | Matches exact append-only ledger totals (`pending`, `available`, `reserved`, `paid` sub-buckets exposed separately) |
| **Refund Rate**           | $\frac{\text{Distinct Refunded Orders}}{\text{Funded Orders}}$                                                                       | `Order`, `Refund`                       | Returns `0` when `Funded Orders = 0`; rounded to 4 decimal places                                                   |
| **Dispute Rate**          | $\frac{\text{Distinct Disputed Orders}}{\text{Funded Orders}}$                                                                       | `Order`, `MarketplaceDispute`           | Returns `0` when `Funded Orders = 0`; rounded to 4 decimal places                                                   |
| **Order Completion Rate** | $\frac{\text{Completed Orders}}{\text{Funded Orders}}$                                                                               | `Order`                                 | Returns `0` when `Funded Orders = 0`; rounded to 4 decimal places                                                   |
| **Conversion Rate**       | $\frac{\text{Funded Orders}}{\text{Profile Views}}$ when views tracked; otherwise $\frac{\text{Funded Orders}}{\text{Total Orders}}$ | `Order`                                 | Returns `null` when total orders is `0` and views are `null`                                                        |
| **Profile Views**         | Not instrumented yet                                                                                                                 | N/A                                     | Explicitly returns `null` (never fabricated)                                                                        |
| **Order Volume**          | Breakdown counts: `total`, `funded`, `active`, `completed`, `cancelled`, `disputed`, `refunded`                                      | `Order`, `Refund`, `MarketplaceDispute` | Always non-negative integers                                                                                        |

---

## 3. API Endpoints & Authorization

- `GET /api/v1/analytics/seller/dashboard?from=<ISO>&to=<ISO>` — Authenticated seller scoped strictly to their own `SellerProfile` orders & ledger entries.
- `GET /api/v1/analytics/admin/kpis?from=<ISO>&to=<ISO>` — Strictly `ADMIN`-only platform-wide KPI aggregation (`403` for `BUYER`/`SELLER`, `401` for unauthenticated callers).
- Both endpoints reject malformed ISO timestamps or inverted ranges (`from > to`) with `400 Bad Request`.

---

## 4. Safe Demo Dataset Verification

`scripts/seed-kpi-demo.ts` exports `DEMO_KPI_DATASET` and guards CLI execution with `assertSafeSeedTarget` (`scripts/safe-seed-guard.ts`), refusing `APP_ENV=production` or non-allowlisted remote databases.
