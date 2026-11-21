import { describe, expect, it } from 'vitest';
import { reconcileFinancialRecords } from '../../apps/api/src/modules/financial/reconciliation.service';

describe('Phase 4C Read-Only Financial Reconciliation', () => {
  it('returns healthy=true when local payments, remote Stripe records, and ledgers match', () => {
    const report = reconcileFinancialRecords({
      localPayments: [
        {
          transactionId: 'tx_1',
          orderId: 'ord_1',
          stripePaymentId: 'pi_1',
          amountCents: 10000,
          refundedCents: 0,
          currency: 'usd',
          status: 'SUCCEEDED',
        },
      ],
      remotePayments: [
        {
          stripePaymentId: 'pi_1',
          orderId: 'ord_1',
          amountCents: 10000,
          refundedCents: 0,
          currency: 'usd',
          status: 'succeeded',
        },
      ],
      ledgers: [
        {
          orderId: 'ord_1',
          grossCapturedCents: 10000,
          pendingCents: 0,
          availableCents: 9000,
          reservedCents: 0,
          paidCents: 0,
          feeCents: 1000,
          refundedCents: 0,
        },
      ],
    });

    expect(report.readOnly).toBe(true);
    expect(report.summary.healthy).toBe(true);
    expect(report.summary.discrepancyCount).toBe(0);
    expect(report.findings).toEqual([]);
  });

  it('detects missing remote, missing local, duplicate reference, amount/currency/status/refund mismatch, and ledger conservation breach', () => {
    const report = reconcileFinancialRecords({
      localPayments: [
        {
          transactionId: 'tx_unbound',
          orderId: 'ord_unbound',
          stripePaymentId: null,
          amountCents: 5000,
          refundedCents: 0,
          currency: 'usd',
          status: 'PENDING',
        },
        {
          transactionId: 'tx_mismatch',
          orderId: 'ord_mismatch',
          stripePaymentId: 'pi_mismatch',
          amountCents: 10000,
          refundedCents: 0,
          currency: 'usd',
          status: 'PENDING',
        },
        {
          transactionId: 'tx_dup',
          orderId: 'ord_dup',
          stripePaymentId: 'pi_mismatch',
          amountCents: 10000,
          refundedCents: 0,
          currency: 'usd',
          status: 'SUCCEEDED',
        },
        {
          transactionId: 'tx_missing_remote',
          orderId: 'ord_missing_remote',
          stripePaymentId: 'pi_missing_remote',
          amountCents: 4000,
          refundedCents: 0,
          currency: 'usd',
          status: 'SUCCEEDED',
        },
      ],
      remotePayments: [
        {
          stripePaymentId: 'pi_mismatch',
          orderId: 'ord_mismatch',
          amountCents: 9500,
          refundedCents: 500,
          currency: 'eur',
          status: 'succeeded',
        },
        {
          stripePaymentId: 'pi_orphan_remote',
          orderId: 'ord_orphan',
          amountCents: 2500,
          refundedCents: 0,
          currency: 'usd',
          status: 'succeeded',
        },
      ],
      ledgers: [
        {
          orderId: 'ord_broken_ledger',
          grossCapturedCents: 10000,
          pendingCents: 0,
          availableCents: 8500,
          reservedCents: 0,
          paidCents: 0,
          feeCents: 1000,
          refundedCents: 0,
        },
      ],
    });

    const codes = report.findings.map((f) => f.code);
    expect(report.summary.healthy).toBe(false);
    expect(codes).toContain('MISSING_REMOTE_TRANSACTION');
    expect(codes).toContain('MISSING_LOCAL_TRANSACTION');
    expect(codes).toContain('DUPLICATE_PROVIDER_REFERENCE');
    expect(codes).toContain('AMOUNT_MISMATCH');
    expect(codes).toContain('CURRENCY_MISMATCH');
    expect(codes).toContain('STATUS_MISMATCH');
    expect(codes).toContain('REFUND_MISMATCH');
    expect(codes).toContain('LEDGER_CONSERVATION_MISMATCH');
  });
});
