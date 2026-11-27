import type Stripe from 'stripe';
import { prisma } from '../../lib/prisma';
import { stripe } from '../payment/payment.service';
import { cents } from './money';

export type ReconciliationDiscrepancyCode =
  | 'MISSING_REMOTE_TRANSACTION'
  | 'MISSING_LOCAL_TRANSACTION'
  | 'DUPLICATE_PROVIDER_REFERENCE'
  | 'AMOUNT_MISMATCH'
  | 'CURRENCY_MISMATCH'
  | 'STATUS_MISMATCH'
  | 'REFUND_MISMATCH'
  | 'LEDGER_CONSERVATION_MISMATCH';

export interface LocalPaymentRecord {
  transactionId: string;
  orderId: string;
  stripePaymentId: string | null;
  amountCents: number;
  refundedCents: number;
  currency: string;
  status: string;
}

export interface RemoteStripePaymentRecord {
  stripePaymentId: string;
  orderId?: string;
  amountCents: number;
  refundedCents: number;
  currency: string;
  status: string;
}

export interface LocalLedgerSummary {
  orderId: string;
  grossCapturedCents: number;
  pendingCents: number;
  availableCents: number;
  reservedCents: number;
  paidCents: number;
  feeCents: number;
  refundedCents: number;
}

export interface ReconciliationFinding {
  code: ReconciliationDiscrepancyCode;
  severity: 'HIGH' | 'MEDIUM';
  orderId: string | null;
  transactionId: string | null;
  stripePaymentId: string | null;
  detail: string;
}

export interface ReconciliationReport {
  readOnly: true;
  checkedAt: string;
  summary: {
    localTransactionsChecked: number;
    remoteTransactionsChecked: number;
    ledgersChecked: number;
    discrepancyCount: number;
    healthy: boolean;
  };
  findings: ReconciliationFinding[];
}

function normalizeStatusMatches(localStatus: string, remoteStatus: string): boolean {
  if (remoteStatus === 'succeeded') {
    return ['SUCCEEDED', 'PARTIALLY_REFUNDED', 'REFUNDED'].includes(localStatus);
  }
  if (remoteStatus === 'canceled') {
    return localStatus === 'CANCELLED';
  }
  if (remoteStatus === 'processing') {
    return localStatus === 'PROCESSING';
  }
  if (remoteStatus === 'requires_payment_method' || remoteStatus === 'requires_action') {
    return ['PENDING', 'FAILED'].includes(localStatus);
  }
  return false;
}

/**
 * Pure read-only reconciliation comparator between local ledger/transactions
 * and Stripe test-mode records. Never mutates historical financial entries.
 */
export function reconcileFinancialRecords(input: {
  localPayments: LocalPaymentRecord[];
  remotePayments: RemoteStripePaymentRecord[];
  ledgers?: LocalLedgerSummary[];
}): ReconciliationReport {
  const findings: ReconciliationFinding[] = [];
  const remoteById = new Map<string, RemoteStripePaymentRecord>();
  const seenLocalProviderIds = new Map<string, string>();

  for (const remote of input.remotePayments) {
    if (remoteById.has(remote.stripePaymentId)) {
      findings.push({
        code: 'DUPLICATE_PROVIDER_REFERENCE',
        severity: 'HIGH',
        orderId: remote.orderId ?? null,
        transactionId: null,
        stripePaymentId: remote.stripePaymentId,
        detail: `Duplicate remote Stripe payment reference ${remote.stripePaymentId} returned in reconciliation feed.`,
      });
    } else {
      remoteById.set(remote.stripePaymentId, remote);
    }
  }

  const matchedRemoteIds = new Set<string>();

  for (const local of input.localPayments) {
    if (!local.stripePaymentId) {
      findings.push({
        code: 'MISSING_REMOTE_TRANSACTION',
        severity: 'MEDIUM',
        orderId: local.orderId,
        transactionId: local.transactionId,
        stripePaymentId: null,
        detail: `Local transaction ${local.transactionId} has no bound stripePaymentId.`,
      });
      continue;
    }

    const previousLocalTx = seenLocalProviderIds.get(local.stripePaymentId);
    if (previousLocalTx) {
      findings.push({
        code: 'DUPLICATE_PROVIDER_REFERENCE',
        severity: 'HIGH',
        orderId: local.orderId,
        transactionId: local.transactionId,
        stripePaymentId: local.stripePaymentId,
        detail: `Provider reference ${local.stripePaymentId} is bound to multiple local transactions (${previousLocalTx}, ${local.transactionId}).`,
      });
    } else {
      seenLocalProviderIds.set(local.stripePaymentId, local.transactionId);
    }

    const remote = remoteById.get(local.stripePaymentId);
    if (!remote) {
      findings.push({
        code: 'MISSING_REMOTE_TRANSACTION',
        severity: 'HIGH',
        orderId: local.orderId,
        transactionId: local.transactionId,
        stripePaymentId: local.stripePaymentId,
        detail: `Local transaction ${local.transactionId} references ${local.stripePaymentId}, which is missing in Stripe test records.`,
      });
      continue;
    }

    matchedRemoteIds.add(remote.stripePaymentId);

    if (local.amountCents !== remote.amountCents) {
      findings.push({
        code: 'AMOUNT_MISMATCH',
        severity: 'HIGH',
        orderId: local.orderId,
        transactionId: local.transactionId,
        stripePaymentId: local.stripePaymentId,
        detail: `Amount mismatch: local=${local.amountCents}c vs remote=${remote.amountCents}c.`,
      });
    }

    if (local.currency.toLowerCase() !== remote.currency.toLowerCase()) {
      findings.push({
        code: 'CURRENCY_MISMATCH',
        severity: 'HIGH',
        orderId: local.orderId,
        transactionId: local.transactionId,
        stripePaymentId: local.stripePaymentId,
        detail: `Currency mismatch: local=${local.currency} vs remote=${remote.currency}.`,
      });
    }

    if (!normalizeStatusMatches(local.status, remote.status)) {
      findings.push({
        code: 'STATUS_MISMATCH',
        severity: 'HIGH',
        orderId: local.orderId,
        transactionId: local.transactionId,
        stripePaymentId: local.stripePaymentId,
        detail: `Status mismatch: local=${local.status} vs remote=${remote.status}.`,
      });
    }

    if (local.refundedCents !== remote.refundedCents) {
      findings.push({
        code: 'REFUND_MISMATCH',
        severity: 'HIGH',
        orderId: local.orderId,
        transactionId: local.transactionId,
        stripePaymentId: local.stripePaymentId,
        detail: `Refund mismatch: localRefunded=${local.refundedCents}c vs remoteRefunded=${remote.refundedCents}c.`,
      });
    }
  }

  for (const remote of input.remotePayments) {
    if (!matchedRemoteIds.has(remote.stripePaymentId)) {
      findings.push({
        code: 'MISSING_LOCAL_TRANSACTION',
        severity: 'HIGH',
        orderId: remote.orderId ?? null,
        transactionId: null,
        stripePaymentId: remote.stripePaymentId,
        detail: `Remote Stripe payment ${remote.stripePaymentId} has no corresponding local transaction record.`,
      });
    }
  }

  const ledgers = input.ledgers ?? [];
  for (const ledger of ledgers) {
    const allocated =
      ledger.pendingCents +
      ledger.availableCents +
      ledger.reservedCents +
      ledger.paidCents +
      ledger.feeCents +
      ledger.refundedCents;
    if (allocated !== ledger.grossCapturedCents) {
      findings.push({
        code: 'LEDGER_CONSERVATION_MISMATCH',
        severity: 'HIGH',
        orderId: ledger.orderId,
        transactionId: null,
        stripePaymentId: null,
        detail: `Ledger conservation failed for order ${ledger.orderId}: gross=${ledger.grossCapturedCents}c vs allocated=${allocated}c.`,
      });
    }
  }

  return {
    readOnly: true,
    checkedAt: new Date().toISOString(),
    summary: {
      localTransactionsChecked: input.localPayments.length,
      remoteTransactionsChecked: input.remotePayments.length,
      ledgersChecked: ledgers.length,
      discrepancyCount: findings.length,
      healthy: findings.length === 0,
    },
    findings,
  };
}

export interface ReconciliationPagination {
  limit: number;
  nextCursor: string | null;
  hasMoreLocal: boolean;
  nextStripeStartingAfter: string | null;
  hasMoreRemote: boolean;
  stripePagesScanned: number;
  refundScanTruncated: boolean;
}

export interface PaginatedReconciliationReport extends ReconciliationReport {
  pagination: ReconciliationPagination;
}

export interface ReconciliationRunOptions {
  limit?: number;
  cursor?: string;
  stripeStartingAfter?: string;
  createdFrom?: Date;
  createdTo?: Date;
  maxStripePages?: number;
  maxRefundPagesPerPayment?: number;
}

function signedCents(value: { mul: (n: number) => { isFinite: () => boolean; isInteger: () => boolean; abs: () => { lte: (n: number) => boolean }; toNumber: () => number } }): number {
  const scaled = value.mul(100);
  if (!scaled.isFinite() || !scaled.isInteger() || !scaled.abs().lte(9999999999)) {
    throw new Error('Invalid signed monetary ledger delta');
  }
  return scaled.toNumber();
}

function isStripeResourceMissing(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const candidate = error as { statusCode?: unknown; code?: unknown; raw?: { statusCode?: unknown; code?: unknown } };
  return (
    candidate.statusCode === 404 ||
    candidate.raw?.statusCode === 404 ||
    candidate.code === 'resource_missing' ||
    candidate.raw?.code === 'resource_missing'
  );
}

async function sumPaginatedStripeRefunds(
  paymentIntentId: string,
  maxPages: number
): Promise<{ refundedCents: number; truncated: boolean }> {
  let refundedCents = 0;
  let startingAfter: string | undefined;
  let truncated = false;

  for (let page = 0; page < maxPages; page++) {
    const list = await stripe.refunds.list({
      payment_intent: paymentIntentId,
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });
    for (const refund of list.data) {
      if (refund.status === 'succeeded') {
        refundedCents += refund.amount;
      }
    }
    if (!list.has_more || list.data.length === 0) {
      return { refundedCents, truncated: false };
    }
    if (page === maxPages - 1) {
      truncated = true;
      break;
    }
    startingAfter = list.data[list.data.length - 1]!.id;
  }

  return { refundedCents, truncated };
}

/**
 * Bounded, paginated, strictly read-only reconciliation runner comparing local
 * transactions + authoritative FinancialEntry order ledgers against paginated
 * Stripe PaymentIntents and Refunds.
 */
export async function runAdminReconciliationReport(
  options: ReconciliationRunOptions = {}
): Promise<PaginatedReconciliationReport> {
  const limit = Math.min(Math.max(options.limit ?? 100, 1), 200);
  const maxStripePages = Math.min(Math.max(options.maxStripePages ?? 5, 1), 20);
  const maxRefundPagesPerPayment = Math.min(Math.max(options.maxRefundPagesPerPayment ?? 10, 1), 20);

  const createdAtFilter =
    options.createdFrom || options.createdTo
      ? {
          ...(options.createdFrom ? { gte: options.createdFrom } : {}),
          ...(options.createdTo ? { lte: options.createdTo } : {}),
        }
      : undefined;

  const rows = await prisma.transaction.findMany({
    ...(createdAtFilter ? { where: { createdAt: createdAtFilter } } : {}),
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: limit + 1,
    ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
    select: {
      id: true,
      orderId: true,
      stripePaymentId: true,
      amount: true,
      refundedAmount: true,
      currency: true,
      status: true,
    },
  });

  const hasMoreLocal = rows.length > limit;
  const transactions = hasMoreLocal ? rows.slice(0, limit) : rows;
  const nextCursor = hasMoreLocal && transactions.length > 0 ? transactions[transactions.length - 1]!.id : null;

  const localPaymentIds = new Set(
    transactions.map(tx => tx.stripePaymentId).filter((id): id is string => Boolean(id))
  );

  // 1. Fetch paginated Stripe PaymentIntents to discover missing local transactions.
  const listedRemote = new Map<string, Stripe.PaymentIntent>();
  const stripeCreatedFilter =
    options.createdFrom || options.createdTo
      ? {
          ...(options.createdFrom ? { gte: Math.floor(options.createdFrom.getTime() / 1000) } : {}),
          ...(options.createdTo ? { lte: Math.floor(options.createdTo.getTime() / 1000) } : {}),
        }
      : undefined;

  let stripeStartingAfter = options.stripeStartingAfter;
  let hasMoreRemote = false;
  let stripePagesScanned = 0;

  for (let page = 0; page < maxStripePages; page++) {
    const remotePage = await stripe.paymentIntents.list({
      limit: Math.min(limit, 100),
      ...(stripeStartingAfter ? { starting_after: stripeStartingAfter } : {}),
      ...(stripeCreatedFilter ? { created: stripeCreatedFilter } : {}),
    });
    stripePagesScanned += 1;
    for (const pi of remotePage.data) {
      listedRemote.set(pi.id, pi);
    }
    if (!remotePage.has_more || remotePage.data.length === 0) {
      hasMoreRemote = false;
      stripeStartingAfter = undefined;
      break;
    }
    hasMoreRemote = true;
    stripeStartingAfter = remotePage.data[remotePage.data.length - 1]!.id;
  }

  // Filter out Stripe PIs that exist in another local pagination window (not truly missing locally).
  const candidateMissingLocalIds = [...listedRemote.keys()].filter(id => !localPaymentIds.has(id));
  const existingOutsidePage = new Set<string>();
  if (candidateMissingLocalIds.length > 0) {
    const matchedOutside = await prisma.transaction.findMany({
      where: { stripePaymentId: { in: candidateMissingLocalIds } },
      select: { stripePaymentId: true },
    });
    for (const row of matchedOutside) {
      if (row.stripePaymentId) existingOutsidePage.add(row.stripePaymentId);
    }
  }

  // 2. Ensure every local stripePaymentId in this page is fetched from Stripe if not in the list window.
  const remoteIntentsToCompare = new Map<string, Stripe.PaymentIntent>();
  for (const [id, pi] of listedRemote.entries()) {
    if (localPaymentIds.has(id) || !existingOutsidePage.has(id)) {
      remoteIntentsToCompare.set(id, pi);
    }
  }
  for (const localId of localPaymentIds) {
    if (!remoteIntentsToCompare.has(localId)) {
      try {
        const retrieved = await stripe.paymentIntents.retrieve(localId);
        remoteIntentsToCompare.set(retrieved.id, retrieved);
      } catch (error) {
        if (!isStripeResourceMissing(error)) throw error;
      }
    }
  }

  // 3. Paginate refunds for every compared PaymentIntent.
  let refundScanTruncated = false;
  const remotePayments: RemoteStripePaymentRecord[] = [];
  for (const pi of remoteIntentsToCompare.values()) {
    const { refundedCents, truncated } = await sumPaginatedStripeRefunds(pi.id, maxRefundPagesPerPayment);
    if (truncated) refundScanTruncated = true;
    remotePayments.push({
      stripePaymentId: pi.id,
      orderId: pi.metadata?.orderId,
      amountCents: pi.amount,
      refundedCents,
      currency: pi.currency,
      status: pi.status,
    });
  }

  // 4. Compute authoritative order-level FinancialEntry ledger summaries in integer cents.
  const capturedOrderTotals = new Map<string, { grossCapturedCents: number; refundedCents: number }>();
  for (const tx of transactions) {
    if (!['SUCCEEDED', 'PARTIALLY_REFUNDED', 'REFUNDED'].includes(tx.status)) continue;
    const prev = capturedOrderTotals.get(tx.orderId) ?? { grossCapturedCents: 0, refundedCents: 0 };
    prev.grossCapturedCents += cents(tx.amount);
    prev.refundedCents += cents(tx.refundedAmount, true);
    capturedOrderTotals.set(tx.orderId, prev);
  }

  const capturedOrderIds = [...capturedOrderTotals.keys()];
  const ledgers: LocalLedgerSummary[] = [];
  if (capturedOrderIds.length > 0) {
    const entries = await prisma.financialEntry.findMany({
      where: { orderId: { in: capturedOrderIds } },
      select: {
        orderId: true,
        pendingDelta: true,
        availableDelta: true,
        reservedDelta: true,
        paidDelta: true,
        feeDelta: true,
      },
    });
    const sumsByOrder = new Map<
      string,
      { pendingCents: number; availableCents: number; reservedCents: number; paidCents: number; feeCents: number }
    >();
    for (const orderId of capturedOrderIds) {
      sumsByOrder.set(orderId, { pendingCents: 0, availableCents: 0, reservedCents: 0, paidCents: 0, feeCents: 0 });
    }
    for (const row of entries) {
      const bucket = sumsByOrder.get(row.orderId);
      if (!bucket) continue;
      bucket.pendingCents += signedCents(row.pendingDelta);
      bucket.availableCents += signedCents(row.availableDelta);
      bucket.reservedCents += signedCents(row.reservedDelta);
      bucket.paidCents += signedCents(row.paidDelta);
      bucket.feeCents += signedCents(row.feeDelta);
    }
    for (const [orderId, totals] of capturedOrderTotals.entries()) {
      const bucket = sumsByOrder.get(orderId)!;
      ledgers.push({
        orderId,
        grossCapturedCents: totals.grossCapturedCents,
        refundedCents: totals.refundedCents,
        ...bucket,
      });
    }
  }

  const report = reconcileFinancialRecords({
    localPayments: transactions.map(tx => ({
      transactionId: tx.id,
      orderId: tx.orderId,
      stripePaymentId: tx.stripePaymentId,
      amountCents: cents(tx.amount),
      refundedCents: cents(tx.refundedAmount, true),
      currency: tx.currency,
      status: tx.status,
    })),
    remotePayments,
    ledgers,
  });

  return {
    ...report,
    pagination: {
      limit,
      nextCursor,
      hasMoreLocal,
      nextStripeStartingAfter: hasMoreRemote ? (stripeStartingAfter ?? null) : null,
      hasMoreRemote,
      stripePagesScanned,
      refundScanTruncated,
    },
  };
}
