import { describe, expect, it } from 'vitest';
import { computeMarketplaceKpis } from '../../apps/api/src/modules/analytics/kpi-calculator';
import { DEMO_KPI_DATASET, runDemoKpiVerification } from '../../scripts/seed-kpi-demo';

describe('Phase 4E KPI Calculations & Accounting Invariants', () => {
  it('distinguishes GMV, Net GMV, Platform Revenue, and Seller Earnings accurately on the demo dataset', () => {
    const kpi = computeMarketplaceKpis(DEMO_KPI_DATASET);

    // 5 funded orders: 200 + 150 + 100 + 50 + 100 = $600.00 (cancelled $75 excluded)
    expect(kpi.gmv).toBe('600.00');
    expect(kpi.refunded).toBe('100.00');
    expect(kpi.netGmv).toBe('500.00');
    expect(kpi.platformRevenue).toBe('50.00');
    expect(kpi.sellerEarnings).toBe('450.00');

    // Core accounting invariant: GMV != Platform Revenue != Seller Earnings
    expect(kpi.gmv).not.toBe(kpi.platformRevenue);
    expect(kpi.gmv).not.toBe(kpi.sellerEarnings);
    expect(kpi.platformRevenue).not.toBe(kpi.sellerEarnings);
    expect(kpi.platformRevenueCents + kpi.sellerEarningsCents).toBe(kpi.netGmvCents);
    expect(kpi.accountingInvariants).toEqual({
      gmvDistinctFromPlatformRevenue: true,
      gmvDistinctFromSellerEarnings: true,
    });

    // Volume & rates (5 funded orders: 2 completed, 1 refunded, 1 disputed)
    expect(kpi.orderVolume).toEqual({
      total: 6,
      funded: 5,
      active: 1,
      completed: 2,
      cancelled: 1,
      disputed: 1,
      refunded: 1,
    });
    expect(kpi.refundRate).toBe(0.2);
    expect(kpi.disputeRate).toBe(0.2);
    expect(kpi.orderCompletionRate).toBe(0.4);
    expect(kpi.profileViews).toBeNull();
  });

  it('handles empty datasets without NaN or division-by-zero errors', () => {
    const empty = computeMarketplaceKpis({
      orders: [],
      refunds: [],
      disputedOrderIds: [],
      ledger: { pendingCents: 0, availableCents: 0, reservedCents: 0, paidCents: 0, feeCents: 0 },
    });

    expect(empty.gmv).toBe('0.00');
    expect(empty.netGmv).toBe('0.00');
    expect(empty.platformRevenue).toBe('0.00');
    expect(empty.sellerEarnings).toBe('0.00');
    expect(empty.refundRate).toBe(0);
    expect(empty.disputeRate).toBe(0);
    expect(empty.orderCompletionRate).toBe(0);
    expect(empty.conversionRate).toBeNull();
  });

  it('guards demo KPI seed verification with assertSafeSeedTarget', () => {
    expect(() =>
      runDemoKpiVerification(
        {
          APP_ENV: 'production',
          DATABASE_URL: 'postgresql://user:pass@localhost:5432/tascoradb',
          TASCORA_CONFIRM_SEED: 'YES_SEED_NON_PRODUCTION',
        },
        []
      )
    ).toThrow('APP_ENV=production is strictly forbidden');

    const localRun = runDemoKpiVerification(
      {
        APP_ENV: 'development',
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/tascoradb',
        TASCORA_CONFIRM_SEED: 'YES_SEED_NON_PRODUCTION',
      },
      []
    );
    expect(localRun.label).toBe('Demo Data');
    expect(localRun.summary.netGmv).toBe('500.00');
  });
});
