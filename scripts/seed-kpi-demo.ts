import { pathToFileURL } from 'node:url';
import { assertSafeSeedTarget } from './safe-seed-guard';
import {
  computeMarketplaceKpis,
  type LedgerAggregateCents,
  type OrderKpiRow,
  type RefundKpiRow,
} from '../apps/api/src/modules/analytics/kpi-calculator';

/**
 * Deterministic demo KPI dataset (sample/seed data — never real revenue).
 * Used to verify exact accounting invariants: GMV != Platform Revenue != Seller Earnings.
 */
export const DEMO_KPI_DATASET: {
  label: 'Demo Data';
  orders: OrderKpiRow[];
  refunds: RefundKpiRow[];
  disputedOrderIds: string[];
  ledger: LedgerAggregateCents;
} = {
  label: 'Demo Data',
  orders: [
    { id: 'demo_ord_1', status: 'COMPLETED', amountCents: 20000 }, // $200.00 -> fee $20, seller $180
    { id: 'demo_ord_2', status: 'COMPLETED', amountCents: 15000 }, // $150.00 -> fee $15, seller $135
    { id: 'demo_ord_3', status: 'IN_PROGRESS', amountCents: 10000 }, // $100.00 -> fee $10, seller $90 pending
    { id: 'demo_ord_4', status: 'DISPUTED', amountCents: 5000 }, // $50.00 -> fee $5, seller $45 pending
    { id: 'demo_ord_5', status: 'REFUNDED', amountCents: 10000 }, // $100.00 -> refunded $100 -> fee $0, seller $0
    { id: 'demo_ord_6', status: 'CANCELLED', amountCents: 7500 }, // Unpaid cancel -> excluded from GMV
  ],
  refunds: [
    { orderId: 'demo_ord_5', status: 'SUCCEEDED', amountCents: 10000 },
  ],
  disputedOrderIds: ['demo_ord_4'],
  ledger: {
    // 10% platform fee retained on non-refunded funded orders ($500 * 10% = $50.00)
    feeCents: 5000,
    pendingCents: 13500, // ord_3 ($90) + ord_4 ($45)
    availableCents: 31500, // ord_1 ($180) + ord_2 ($135)
    reservedCents: 0,
    paidCents: 0,
  },
};

export function runDemoKpiVerification(
  env: NodeJS.ProcessEnv = process.env,
  argv: string[] = process.argv.slice(2)
) {
  const target = assertSafeSeedTarget(env, argv);
  const summary = computeMarketplaceKpis(DEMO_KPI_DATASET);
  return {
    target,
    label: DEMO_KPI_DATASET.label,
    summary,
  };
}

const isEntrypoint =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isEntrypoint) {
  const result = runDemoKpiVerification();
  console.log(JSON.stringify(result, null, 2));
}
