# TASCORA Marketplace End-to-End Test Plan (Phase 4B)

This test plan defines the verification matrix for Buyer, Seller, Admin, and Guest marketplace workflows across API, Security/IDOR, and Playwright E2E layers.

---

## 1. Happy Path Journeys

| ID    | Journey                                                                                                               | Layer          | Suite File                                           | Expected Verification                                                                                         |
| ----- | --------------------------------------------------------------------------------------------------------------------- | -------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| HP-01 | Guest browses storefront, filters catalog, opens gig detail, switches locale (`en` <-> `vi`)                          | Playwright E2E | `tests/e2e/marketplace/workflow-journeys.spec.ts`    | Pages render HTTP 200 with zero uncaught console/page errors                                                  |
| HP-02 | Buyer creates server-priced order with `idempotencyKey`                                                               | API            | `tests/api/marketplace-e2e-journeys.spec.ts`         | Order created as `PENDING`, ignores client `amount`/`status` tampering, replays return identical order        |
| HP-03 | Full funded order progression (`PAID` -> `IN_PROGRESS` -> `DELIVERED` -> `IN_REVISION` -> `DELIVERED` -> `COMPLETED`) | API            | `tests/api/marketplace-e2e-journeys.spec.ts`         | Each actor performs only their permitted step; escrow releases and ledger records `ESCROW_RELEASED` on accept |
| HP-04 | Seller creates draft service, updates packages, Admin approves, Buyer orders & reviews                                | API            | `tests/api/marketplace-integration.spec.ts`          | Full draft -> publish -> purchase -> review rating aggregation cycle passes                                   |
| HP-05 | Buyer/Seller conversation creation, message persistence, and read receipt tracking                                    | API            | `tests/api/marketplace-integration.spec.ts`          | Messages & notifications persist; unread counters reconcile cleanly                                           |
| HP-06 | Checkout drawer & package tier switching on gig detail page                                                           | Playwright E2E | `tests/e2e/marketplace/gig-detail-and-order.spec.ts` | Tier price updates (`BASIC`/`STANDARD`/`PREMIUM`), order confirmed                                            |

---

## 2. Failure & Edge-Case Scenarios

| ID    | Scenario                                                                                                                             | Expected Behavior                                   | Suite File                                                                                       |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| FL-01 | Unauthenticated request to orders, services mutations, messages, favorites, admin                                                    | HTTP `401`                                          | `tests/api/marketplace-e2e-journeys.spec.ts`                                                     |
| FL-02 | Invalid CUID, malformed payload, extra strict fields                                                                                 | HTTP `400` validation failure                       | `tests/api/marketplace-e2e-journeys.spec.ts`                                                     |
| FL-03 | Purchasing unpublished service or inactive seller's package                                                                          | HTTP `409`                                          | `tests/api/marketplace-e2e-journeys.spec.ts`                                                     |
| FL-04 | Reusing `idempotencyKey` with different `serviceId`/`packageId` or different delivery payload                                        | HTTP `409` conflict                                 | `tests/api/marketplace-e2e-journeys.spec.ts`                                                     |
| FL-05 | Invalid state transition (`PENDING` -> `IN_PROGRESS`, `PAID` -> `COMPLETED`, direct `status: 'PAID'` or `'DELIVERED'` via `/status`) | HTTP `403` / `409`                                  | `tests/api/marketplace-e2e-journeys.spec.ts`                                                     |
| FL-06 | Payments disabled (`PAYMENTS_PROVIDER=disabled`)                                                                                     | Clean HTTP `503` without affecting browsing/catalog | `tests/api/payment-provider-disabled.spec.ts`, `tests/e2e/marketplace/payments-disabled.spec.ts` |
| FL-07 | Non-matching catalog search query in browser                                                                                         | Empty state rendered cleanly without crash or 500   | `tests/e2e/marketplace/workflow-journeys.spec.ts`                                                |

---

## 3. Authorization & IDOR Isolation Matrix

| ID     | Attack Vector                                                                                                                        | Expected Defense              | Suite File                                                                                  |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------- | ------------------------------------------------------------------------------------------- |
| SEC-01 | Seller tries to purchase own service                                                                                                 | HTTP `403`                    | `tests/security/marketplace-idor-authorization.spec.ts`                                     |
| SEC-02 | Outsider / other buyer calls `accept`, `revision`, or `cancel` on another buyer's order                                              | HTTP `404` (existence hidden) | `tests/security/marketplace-idor-authorization.spec.ts`                                     |
| SEC-03 | Outsider / other seller calls `start` or `delivery` on another seller's order                                                        | HTTP `404`                    | `tests/security/marketplace-idor-authorization.spec.ts`                                     |
| SEC-04 | Buyer invokes seller-only `start` or `delivery`; Seller invokes buyer-only `accept` or `revision`                                    | HTTP `403` / `404`            | `tests/security/marketplace-idor-authorization.spec.ts`                                     |
| SEC-05 | `BUYER` or `SELLER` accesses `/admin/review-queue`, `/admin/services/:id/approve`, `/admin/sellers/:id/review`, `/financial/admin/*` | HTTP `403`                    | `tests/security/marketplace-idor-authorization.spec.ts`                                     |
| SEC-06 | Seller attaches another user's upload reference (`upload:<otherUser>/...`) in order delivery                                         | HTTP `403`                    | `tests/security/marketplace-idor-authorization.spec.ts`                                     |
| SEC-07 | Outsider reads/writes another user's conversation or attaches cross-owner upload                                                     | HTTP `403` / `404`            | `tests/api/marketplace-integration.spec.ts`, `tests/security/upload-chat-isolation.spec.ts` |

---

## 4. Journeys Explicitly Marked `NOT IMPLEMENTED`

- Live external payout settlement to real bank accounts (`NOT IMPLEMENTED` — intentionally fail-closed).
- Real-time multi-currency FX conversion (`NOT IMPLEMENTED`).
- Automated third-party identity document OCR (`NOT IMPLEMENTED` — admin manual review workflow is implemented).
