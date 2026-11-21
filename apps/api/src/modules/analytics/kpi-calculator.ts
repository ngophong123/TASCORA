export interface OrderKpiRow {
  id: string;
  status: string;
  amountCents: number;
  createdAt?: Date;
}

export interface RefundKpiRow {
  orderId: string;
  status: string;
  amountCents: number;
}

export interface LedgerAggregateCents {
  pendingCents: number;
  availableCents: number;
  reservedCents: number;
  paidCents: number;
  feeCents: number;
}

export interface KpiSummary {
  currency: 'usd';
  gmvCents: number;
  gmv: string;
  refundedCents: number;
  refunded: string;
  netGmvCents: number;
  netGmv: string;
  platformRevenueCents: number;
  platformRevenue: string;
  sellerEarningsCents: number;
  sellerEarnings: string;
  sellerPendingCents: number;
  sellerAvailableCents: number;
  sellerReservedCents: number;
  sellerPaidCents: number;
  orderVolume: {
    total: number;
    funded: number;
    active: number;
    completed: number;
    cancelled: number;
    disputed: number;
    refunded: number;
  };
  refundRate: number;
  disputeRate: number;
  orderCompletionRate: number;
  conversionRate: number | null;
  profileViews: number | null;
  accountingInvariants: {
    gmvDistinctFromPlatformRevenue: boolean;
    gmvDistinctFromSellerEarnings: boolean;
  };
}

const FUNDED_STATUSES = new Set([
  'PAID',
  'IN_PROGRESS',
  'IN_REVISION',
  'DELIVERED',
  'COMPLETED',
  'DISPUTED',
  'REFUNDED',
]);

const ACTIVE_STATUSES = new Set(['PENDING', 'PAID', 'IN_PROGRESS', 'IN_REVISION', 'DELIVERED']);

export function toCents(value: unknown): number {
  if (value === null || value === undefined) return 0;
  const num = typeof value === 'number' ? value : Number(String(value));
  if (!Number.isFinite(num)) return 0;
  return Math.round(num * 100);
}

export function formatCents(centsValue: number): string {
  return (centsValue / 100).toFixed(2);
}

function safeRate(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Number((numerator / denominator).toFixed(4));
}

export function computeMarketplaceKpis(input: {
  orders: OrderKpiRow[];
  refunds: RefundKpiRow[];
  disputedOrderIds: string[];
  ledger: LedgerAggregateCents;
  profileViews?: number | null;
}): KpiSummary {
  let gmvCents = 0;
  let funded = 0;
  let active = 0;
  let completed = 0;
  let cancelled = 0;
  let refundedOrdersCount = 0;

  const fundedOrderIds = new Set<string>();
  const refundedOrderIds = new Set<string>();
  const disputedSet = new Set<string>(input.disputedOrderIds);

  for (const order of input.orders) {
    if (ACTIVE_STATUSES.has(order.status)) active += 1;
    if (order.status === 'COMPLETED') completed += 1;
    if (order.status === 'CANCELLED') cancelled += 1;
    if (order.status === 'DISPUTED') disputedSet.add(order.id);
    if (order.status === 'REFUNDED') refundedOrderIds.add(order.id);

    if (FUNDED_STATUSES.has(order.status)) {
      funded += 1;
      fundedOrderIds.add(order.id);
      gmvCents += order.amountCents;
    }
  }

  let refundedCents = 0;
  for (const refund of input.refunds) {
    if (refund.status === 'SUCCEEDED') {
      refundedCents += refund.amountCents;
      refundedOrderIds.add(refund.orderId);
    }
  }
  refundedOrdersCount = refundedOrderIds.size;

  const netGmvCents = Math.max(0, gmvCents - refundedCents);
  const platformRevenueCents = input.ledger.feeCents;
  const sellerEarningsCents =
    input.ledger.pendingCents +
    input.ledger.availableCents +
    input.ledger.reservedCents +
    input.ledger.paidCents;

  const disputedCount = [...disputedSet].filter((id) => fundedOrderIds.has(id) || input.orders.some((o) => o.id === id)).length;
  const profileViews = input.profileViews ?? null;
  const conversionRate =
    profileViews !== null && profileViews > 0
      ? safeRate(funded, profileViews)
      : input.orders.length > 0
        ? safeRate(funded, input.orders.length)
        : null;

  return {
    currency: 'usd',
    gmvCents,
    gmv: formatCents(gmvCents),
    refundedCents,
    refunded: formatCents(refundedCents),
    netGmvCents,
    netGmv: formatCents(netGmvCents),
    platformRevenueCents,
    platformRevenue: formatCents(platformRevenueCents),
    sellerEarningsCents,
    sellerEarnings: formatCents(sellerEarningsCents),
    sellerPendingCents: input.ledger.pendingCents,
    sellerAvailableCents: input.ledger.availableCents,
    sellerReservedCents: input.ledger.reservedCents,
    sellerPaidCents: input.ledger.paidCents,
    orderVolume: {
      total: input.orders.length,
      funded,
      active,
      completed,
      cancelled,
      disputed: disputedCount,
      refunded: refundedOrdersCount,
    },
    refundRate: safeRate(refundedOrdersCount, funded),
    disputeRate: safeRate(disputedCount, funded),
    orderCompletionRate: safeRate(completed, funded),
    conversionRate,
    profileViews,
    accountingInvariants: {
      gmvDistinctFromPlatformRevenue: gmvCents === 0 || platformRevenueCents !== gmvCents,
      gmvDistinctFromSellerEarnings: gmvCents === 0 || sellerEarningsCents !== gmvCents,
    },
  };
}
