# Stripe Connect Test-Mode Engineering & Verification Guide (Phase 4C)

> **Safety Boundary:** TASCORA is a portfolio demonstration project. **Stripe Test Mode only (`sk_test_*`). Live Stripe keys (`sk_live_*`, `rk_live_*`), live webhooks (`livemode=true`), production payout execution, and real money movement are strictly disabled and rejected at runtime.**

---

## 1. Architecture Overview

Phase 4C introduces a strictly test-mode Stripe Connect integration layered cleanly on top of TASCORA's existing append-only financial ledger (`FinancialEntry`), `Escrow`, `Payout`, `Refund`, `MarketplaceDispute`, and `ProviderEvent` models:

1. **Test-Mode Guard (`assertStripeConnectTestMode` in `apps/api/src/modules/financial/stripe-connect.service.ts`):**
   - Rejects `PAYMENTS_PROVIDER=disabled` (`503`).
   - Rejects `APP_ENV=production` (`503`).
   - Rejects any live credential prefix (`sk_live_*`, `rk_live_*`) (`403`).
   - Requires `sk_test_*` or `rk_test_*`.
2. **Seller Eligibility Gate (`StripeConnectService.getEligibility` + `evaluateSellerPayoutEligibility`):**
   - Evaluates KYC status (`APPROVED` / `VERIFIED`), seller profile approval (`APPROVED`), user account status (`ACTIVE`), active dispute holds, and connected `SellerProfile.stripeAccountId`.
   - Always reports `eligibleForLivePayouts: false` while exposing `eligibleForTestModePayouts` for test-mode sandbox verification.
3. **Connected Account & Onboarding Links (Test Mode Only):**
   - `POST /api/v1/financial/connect/account`: Creates/reuses a Stripe Express test account (`acct_*`) with idempotency key `connect-account:<sellerProfileId>` and persists `stripeAccountId`.
   - `POST /api/v1/financial/connect/onboarding-link`: Validates `returnUrl` / `refreshUrl` against TASCORA's `isAllowedOrigin` allowlist and generates a Stripe Connect onboarding link.
4. **Test-Mode Payout Provider Adapter (`StripeConnectService.createTestModePayoutProvider`):**
   - Default `POST /api/v1/financial/admin/payouts/:id/process` continues using `unavailablePayoutProvider` (`503` fail-closed) so no production/staging route can trigger external payouts inadvertently.
   - The injected test-mode adapter re-validates seller KYC/status/Connect eligibility before submitting an idempotent `stripe.transfers.create` call (`idempotencyKey: payout:<id>:attempt:<n>`).
5. **Connect & Dispute Webhook Handling (`StripeConnectService.handleConnectWebhookEvent`):**
   - Dispatched from `apps/api/src/modules/payment/payment.controller.ts` after cryptographic `Stripe.webhooks.constructEvent` verification.
   - Strictly rejects `event.livemode === true`.
   - Handles `account.updated`, `charge.dispute.created`, `charge.dispute.updated`, `charge.dispute.closed`, `payout.paid`, and `payout.failed` with `ProviderEvent` replay deduplication and append-only `FinancialEntry` audit events.
6. **Read-Only Financial Reconciliation (`apps/api/src/modules/financial/reconciliation.service.ts`):**
   - Compares local `Transaction` / `FinancialEntry` ledger state against Stripe test-mode `PaymentIntent` and `Refund` records via `POST /api/v1/financial/admin/reconciliation/report`.
   - Detects `MISSING_REMOTE_TRANSACTION`, `MISSING_LOCAL_TRANSACTION`, `DUPLICATE_PROVIDER_REFERENCE`, `AMOUNT_MISMATCH`, `CURRENCY_MISMATCH`, `STATUS_MISMATCH`, `REFUND_MISMATCH`, and `LEDGER_CONSERVATION_MISMATCH`.
   - Never mutates historical ledger rows.

---

## 2. How to Run Verification Locally

```bash
pnpm vitest run tests/unit/financial-reconciliation.spec.ts
pnpm vitest run -c vitest.api.config.mts tests/api/stripe-connect-payouts.spec.ts
pnpm vitest run tests/security/stripe-connect-safety.spec.ts
```

All automated tests block outbound HTTPS/fetch calls and run strictly against mocked Stripe test responses and isolated fixtures.
