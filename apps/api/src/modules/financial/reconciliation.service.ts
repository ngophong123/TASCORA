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
