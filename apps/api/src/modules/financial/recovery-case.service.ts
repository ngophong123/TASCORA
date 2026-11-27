import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { HttpError } from '../../lib/errors';
import { AuditService, type AuditContext } from '../audit/audit.service';
import { financialTx, lockOrder, reasonSchema, requestKey, type Tx } from './domain';
import { cents, money } from './money';
import { requireFinancialAdmin } from './refund.service';

export const RECOVERY_CASE_STATUSES = [
  'OPEN',
  'INVESTIGATING',
  'AWAITING_EVIDENCE',
  'PENDING_VERIFICATION',
] as const;

export type RecoveryCaseStatus = (typeof RECOVERY_CASE_STATUSES)[number];

export const RECOVERY_EVENT_TYPES = [
  'CASE_OPENED',
  'ASSIGNED',
  'NOTE_ADDED',
  'EVIDENCE_ATTACHED',
  'EVIDENCE_REQUESTED',
  'STATUS_CHANGED',
] as const;

export type RecoveryEventType = (typeof RECOVERY_EVENT_TYPES)[number];

export const ADMIN_MUTABLE_RECOVERY_EVENT_TYPES = [
  'NOTE_ADDED',
  'EVIDENCE_ATTACHED',
  'EVIDENCE_REQUESTED',
] as const;

export type AdminMutableRecoveryEventType = (typeof ADMIN_MUTABLE_RECOVERY_EVENT_TYPES)[number];

/**
 * Permitted investigation workflow transitions.
 * Intentionally excludes any RESOLVED/CLEARED/RELEASED state because administrative
 * investigation notes and evidence cannot release financial holds or alter balances.
 */
export const RECOVERY_STATUS_TRANSITIONS: Record<RecoveryCaseStatus, readonly RecoveryCaseStatus[]> = {
  OPEN: ['INVESTIGATING', 'AWAITING_EVIDENCE'],
  INVESTIGATING: ['AWAITING_EVIDENCE', 'PENDING_VERIFICATION'],
  AWAITING_EVIDENCE: ['INVESTIGATING', 'PENDING_VERIFICATION'],
  PENDING_VERIFICATION: ['INVESTIGATING', 'AWAITING_EVIDENCE'],
};

export const recoveryCaseIdSchema = z
  .string()
  .regex(/^[A-Za-z0-9_-]{8,64}$/, 'Invalid recovery case identifier');

export const evidenceRefSchema = z
  .string()
  .trim()
  .min(3)
  .max(500)
  .regex(
    /^(upload:[A-Za-z0-9_-]{1,128}\/[0-9a-f-]{36}\.(png|jpg|webp|pdf)|ref:[A-Za-z0-9._:/-]{3,200}|https:\/\/[^\s<>"{}|\\^`[\]]{4,480})$/,
    'Evidence reference must be an upload:<owner>/<uuid>, ref:<id>, or https:// URL'
  );

export const listRecoveryCasesQuerySchema = z
  .object({
    status: z.enum(RECOVERY_CASE_STATUSES).optional(),
    assignedAdminId: z.string().trim().min(1).max(64).optional(),
    sellerProfileId: z.string().trim().min(1).max(64).optional(),
    search: z.string().trim().max(100).optional(),
    page: z.coerce.number().int().min(1).max(10000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.enum(['lastActivityAt', 'createdAt', 'recoveryAmount']).default('lastActivityAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  })
  .strict();

export const addRecoveryEventBodySchema = z
  .object({
    type: z.enum(ADMIN_MUTABLE_RECOVERY_EVENT_TYPES),
    note: reasonSchema,
    evidenceRef: evidenceRefSchema.optional(),
    idempotencyKey: requestKey.optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.type === 'EVIDENCE_ATTACHED' && !data.evidenceRef) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['evidenceRef'],
        message: 'evidenceRef is required when attaching evidence',
      });
    }
  });

export const updateRecoveryStatusBodySchema = z
  .object({
    status: z.enum(RECOVERY_CASE_STATUSES),
    reason: reasonSchema,
    idempotencyKey: requestKey.optional(),
  })
  .strict();

export const assignRecoveryCaseBodySchema = z
  .object({
    assignedAdminId: z.string().trim().min(1).max(64).nullable(),
    note: reasonSchema.optional(),
    idempotencyKey: requestKey.optional(),
  })
  .strict();

export function isValidRecoveryStatusTransition(
  from: RecoveryCaseStatus,
  to: RecoveryCaseStatus
): boolean {
  return RECOVERY_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertValidRecoveryStatusTransition(
  from: string,
  to: RecoveryCaseStatus
): void {
  if (!RECOVERY_CASE_STATUSES.includes(from as RecoveryCaseStatus)) {
    throw new HttpError(409, `Unknown current recovery case status: ${from}`);
  }
  const current = from as RecoveryCaseStatus;
  if (current === to) {
    throw new HttpError(409, `Recovery case is already in status ${to}`);
  }
  if (!isValidRecoveryStatusTransition(current, to)) {
    throw new HttpError(
      409,
      `Invalid recovery case status transition from ${current} to ${to}`
    );
  }
}

export function aggregateRecoveryAmountsCents(
  cases: Array<{ recoveryAmount: Prisma.Decimal | string | number }>
): number {
  let total = 0;
  for (const item of cases) {
    total += cents(item.recoveryAmount, true);
  }
  return total;
}

export function normalizeRecoveryPagination(input: {
  page?: number;
  limit?: number;
  total: number;
}): { page: number; limit: number; skip: number; total: number; totalPages: number } {
  const limit = Math.min(100, Math.max(1, Math.trunc(input.limit ?? 20)));
  const page = Math.max(1, Math.trunc(input.page ?? 1));
  const total = Math.max(0, Math.trunc(input.total));
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    page,
    limit,
    skip: (page - 1) * limit,
    total,
    totalPages,
  };
}

function signedCents(value: Prisma.Decimal | string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const scaled = new Prisma.Decimal(value).mul(100);
  if (!scaled.isFinite() || !scaled.isInteger() || !scaled.abs().lte(9999999999)) {
    throw new HttpError(500, 'Invalid financial ledger delta');
  }
  return scaled.toNumber();
}

function formatSellerDisplayName(seller: {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
}): string {
  const name = [seller.firstName, seller.lastName].filter(Boolean).join(' ').trim();
  return name || `Seller ${seller.id.slice(-6)}`;
}

function sumOrderLedgerBalances(
  entries: Array<{
    pendingDelta: Prisma.Decimal;
    availableDelta: Prisma.Decimal;
    reservedDelta: Prisma.Decimal;
    paidDelta: Prisma.Decimal;
    feeDelta: Prisma.Decimal;
  }>
) {
  let pending = 0;
  let available = 0;
  let reserved = 0;
  let paid = 0;
  let fee = 0;
  for (const item of entries) {
    pending += signedCents(item.pendingDelta);
    available += signedCents(item.availableDelta);
    reserved += signedCents(item.reservedDelta);
    paid += signedCents(item.paidDelta);
    fee += signedCents(item.feeDelta);
  }
  return {
    pending: money(pending).toFixed(2),
    available: money(available).toFixed(2),
    reserved: money(reserved).toFixed(2),
    paid: money(paid).toFixed(2),
    fee: money(fee).toFixed(2),
  };
}

export class RecoveryCaseService {
  /**
   * Idempotently ensures one FinancialRecoveryCase + initial CASE_OPENED event
   * exists for a recovery-required dispute inside the caller's locked order transaction.
   * Does not modify FinancialEntry balances or clear recoveryRequired.
   */
  static async ensureCaseInTx(
    tx: Tx,
    input: {
      disputeId: string;
      orderId: string;
      sellerProfileId: string;
      recoveryAmountCents: number;
      currency?: string;
      note?: string;
      providerDisputeId?: string | null;
    }
  ) {
    if (!Number.isSafeInteger(input.recoveryAmountCents) || input.recoveryAmountCents <= 0) {
      throw new HttpError(400, 'Recovery amount must be a positive integer cent value');
    }
    const existing = await tx.financialRecoveryCase.findUnique({
      where: { disputeId: input.disputeId },
    });
    if (existing) return existing;

    const created = await tx.financialRecoveryCase.create({
      data: {
        disputeId: input.disputeId,
        orderId: input.orderId,
        sellerProfileId: input.sellerProfileId,
        status: 'OPEN',
        recoveryAmount: money(input.recoveryAmountCents),
        currency: input.currency ?? 'usd',
      },
    });

    const openEventKey = `recovery-case:${input.disputeId}:opened`;
    const existingEvent = await tx.financialRecoveryEvent.findUnique({
      where: { eventKey: openEventKey },
    });
    if (!existingEvent) {
      await tx.financialRecoveryEvent.create({
        data: {
          recoveryCaseId: created.id,
          eventKey: openEventKey,
          actorId: null,
          type: 'CASE_OPENED',
          nextStatus: 'OPEN',
          note:
            input.note ??
            `Recovery case opened for chargeback dispute ${input.providerDisputeId ?? input.disputeId}`,
          metadata: input.providerDisputeId
            ? { providerDisputeId: input.providerDisputeId }
            : undefined,
        },
      });
    }

    return created;
  }

  static async listCases(
    adminId: string,
    rawQuery: z.input<typeof listRecoveryCasesQuerySchema> = {}
  ) {
    await requireFinancialAdmin(adminId);
    const query = listRecoveryCasesQuerySchema.parse(rawQuery);

    const where: Prisma.FinancialRecoveryCaseWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.assignedAdminId === 'unassigned'
        ? { assignedAdminId: null }
        : query.assignedAdminId
          ? { assignedAdminId: query.assignedAdminId }
          : {}),
      ...(query.sellerProfileId ? { sellerProfileId: query.sellerProfileId } : {}),
      ...(query.search
        ? {
            OR: [
              { id: { contains: query.search, mode: 'insensitive' } },
              { orderId: { contains: query.search, mode: 'insensitive' } },
              { disputeId: { contains: query.search, mode: 'insensitive' } },
              { sellerProfileId: { contains: query.search, mode: 'insensitive' } },
              {
                dispute: {
                  providerDisputeId: { contains: query.search, mode: 'insensitive' },
                },
              },
            ],
          }
        : {}),
    };

    const [total, allSummaryRows, availableAdmins] = await Promise.all([
      prisma.financialRecoveryCase.count({ where }),
      prisma.financialRecoveryCase.findMany({
        select: {
          status: true,
          recoveryAmount: true,
          assignedAdminId: true,
          dispute: { select: { recoveryRequired: true } },
        },
      }),
      prisma.user.findMany({
        where: { role: 'ADMIN', status: 'ACTIVE' },
        orderBy: { id: 'asc' },
        select: { id: true, role: true },
        take: 100,
      }),
    ]);

    const pagination = normalizeRecoveryPagination({
      page: query.page,
      limit: query.limit,
      total,
    });

    const orderBy: Prisma.FinancialRecoveryCaseOrderByWithRelationInput[] = [
      { [query.sortBy]: query.sortOrder },
      { id: 'desc' },
    ];

    const rows = await prisma.financialRecoveryCase.findMany({
      where,
      orderBy,
      skip: pagination.skip,
      take: pagination.limit,
      include: {
        dispute: {
          select: {
            id: true,
            status: true,
            category: true,
            providerDisputeId: true,
            providerStatus: true,
            recoveryRequired: true,
            updatedAt: true,
          },
        },
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            status: true,
            verificationStatus: true,
          },
        },
        assignedAdmin: {
          select: { id: true, role: true },
        },
        order: {
          select: {
            id: true,
            status: true,
            amount: true,
            currency: true,
            escrow: {
              select: {
                released: true,
                payout: {
                  select: { id: true, status: true, amount: true, updatedAt: true },
                },
              },
            },
          },
        },
      },
    });

    const orderIds = rows.map(row => row.orderId);
    const ledgerRows =
      orderIds.length > 0
        ? await prisma.financialEntry.findMany({
            where: { orderId: { in: orderIds } },
            select: {
              orderId: true,
              pendingDelta: true,
              availableDelta: true,
              reservedDelta: true,
              paidDelta: true,
              feeDelta: true,
            },
          })
        : [];

    const ledgerByOrder = new Map<string, typeof ledgerRows>();
    for (const entryRow of ledgerRows) {
      const bucket = ledgerByOrder.get(entryRow.orderId) ?? [];
      bucket.push(entryRow);
      ledgerByOrder.set(entryRow.orderId, bucket);
    }

    const countsByStatus: Record<RecoveryCaseStatus, number> = {
      OPEN: 0,
      INVESTIGATING: 0,
      AWAITING_EVIDENCE: 0,
      PENDING_VERIFICATION: 0,
    };
    let unassignedCount = 0;
    let activeFinancialHoldCount = 0;
    for (const row of allSummaryRows) {
      if (row.status in countsByStatus) {
        countsByStatus[row.status as RecoveryCaseStatus] += 1;
      }
      if (!row.assignedAdminId) unassignedCount += 1;
      if (row.dispute.recoveryRequired) activeFinancialHoldCount += 1;
    }

    const totalRecoveryCents = aggregateRecoveryAmountsCents(allSummaryRows);

    return {
      overview: {
        totalCases: allSummaryRows.length,
        totalRecoveryAmount: money(totalRecoveryCents).toFixed(2),
        currency: 'usd',
        countsByStatus,
        unassignedCount,
        activeFinancialHoldCount,
        externalPayoutsDisabled: true,
      },
      items: rows.map(row => ({
        id: row.id,
        disputeId: row.disputeId,
        orderId: row.orderId,
        sellerProfileId: row.sellerProfileId,
        sellerRef: formatSellerDisplayName(row.seller),
        status: row.status as RecoveryCaseStatus,
        recoveryAmount: row.recoveryAmount.toFixed(2),
        currency: row.currency,
        providerDisputeId: row.dispute.providerDisputeId,
        providerStatus: row.dispute.providerStatus,
        disputeStatus: row.dispute.status,
        recoveryRequired: row.dispute.recoveryRequired,
        orderStatus: row.order.status,
        orderAmount: row.order.amount.toFixed(2),
        assignedAdmin: row.assignedAdmin ? { id: row.assignedAdmin.id, role: row.assignedAdmin.role } : null,
        balances: sumOrderLedgerBalances(ledgerByOrder.get(row.orderId) ?? []),
        payout: row.order.escrow?.payout
          ? {
              id: row.order.escrow.payout.id,
              status: row.order.escrow.payout.status,
              amount: row.order.escrow.payout.amount.toFixed(2),
              updatedAt: row.order.escrow.payout.updatedAt,
            }
          : null,
        lastActivityAt: row.lastActivityAt,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      })),
      meta: {
        total: pagination.total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: pagination.totalPages,
      },
      availableAdmins,
    };
  }

  static async getCaseDetail(adminId: string, caseId: string, context?: AuditContext) {
    await requireFinancialAdmin(adminId);
    recoveryCaseIdSchema.parse(caseId);

    const record = await prisma.financialRecoveryCase.findUnique({
      where: { id: caseId },
      include: {
        dispute: {
          select: {
            id: true,
            orderId: true,
            category: true,
            description: true,
            status: true,
            resolutionReason: true,
            resolvedAt: true,
            providerDisputeId: true,
            providerStatus: true,
            lastProviderEventId: true,
            lastProviderEventType: true,
            lastProviderEventCreated: true,
            recoveryRequired: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            status: true,
            verificationStatus: true,
          },
        },
        assignedAdmin: {
          select: { id: true, role: true },
        },
        order: {
          select: {
            id: true,
            status: true,
            amount: true,
            currency: true,
            platformFeeBps: true,
            createdAt: true,
            completedAt: true,
            transactions: {
              orderBy: { createdAt: 'asc' },
              select: {
                id: true,
                stripePaymentId: true,
                amount: true,
                refundedAmount: true,
                currency: true,
                status: true,
                createdAt: true,
              },
            },
            refunds: {
              orderBy: { createdAt: 'asc' },
              select: {
                id: true,
                amount: true,
                status: true,
                reason: true,
                stripeRefundId: true,
                createdAt: true,
              },
            },
            escrow: {
              select: {
                id: true,
                amount: true,
                released: true,
                releasedAt: true,
                payout: {
                  select: {
                    id: true,
                    amount: true,
                    status: true,
                    attempt: true,
                    failureReason: true,
                    createdAt: true,
                    updatedAt: true,
                  },
                },
              },
            },
            financialEntries: {
              orderBy: { createdAt: 'asc' },
              select: {
                id: true,
                eventKey: true,
                type: true,
                actorId: true,
                providerId: true,
                reason: true,
                amount: true,
                pendingDelta: true,
                availableDelta: true,
                reservedDelta: true,
                paidDelta: true,
                feeDelta: true,
                createdAt: true,
              },
            },
          },
        },
        events: {
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          select: {
            id: true,
            type: true,
            previousStatus: true,
            nextStatus: true,
            assignedAdminId: true,
            note: true,
            evidenceRef: true,
            metadata: true,
            createdAt: true,
            actor: { select: { id: true, role: true } },
          },
        },
      },
    });

    if (!record) throw new HttpError(404, 'Financial recovery case not found');

    await AuditService.record(prisma, {
      adminId,
      action: 'RECOVERY_CASE_VIEWED',
      targetEntity: 'FinancialRecoveryCase',
      targetId: record.id,
      previousState: record.status,
      newState: record.status,
      metadata: { orderId: record.orderId, disputeId: record.disputeId },
      context,
    });

    const balancesSummary = sumOrderLedgerBalances(record.order.financialEntries);
    const currentStatus = record.status as RecoveryCaseStatus;

    return {
      recoveryCase: {
        id: record.id,
        disputeId: record.disputeId,
        orderId: record.orderId,
        sellerProfileId: record.sellerProfileId,
        sellerRef: formatSellerDisplayName(record.seller),
        status: currentStatus,
        allowedNextStatuses: [...RECOVERY_STATUS_TRANSITIONS[currentStatus]],
        recoveryAmount: record.recoveryAmount.toFixed(2),
        currency: record.currency,
        assignedAdmin: record.assignedAdmin,
        financialHoldActive: record.dispute.recoveryRequired,
        externalPayoutsDisabled: true,
        lastActivityAt: record.lastActivityAt,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      },
      dispute: record.dispute,
      seller: {
        id: record.seller.id,
        displayName: formatSellerDisplayName(record.seller),
        status: record.seller.status,
        verificationStatus: record.seller.verificationStatus,
      },
      order: {
        id: record.order.id,
        status: record.order.status,
        amount: record.order.amount.toFixed(2),
        currency: record.order.currency,
        platformFeeBps: record.order.platformFeeBps,
        createdAt: record.order.createdAt,
        completedAt: record.order.completedAt,
      },
      balances: balancesSummary,
      escrow: record.order.escrow
        ? {
            id: record.order.escrow.id,
            amount: record.order.escrow.amount.toFixed(2),
            released: record.order.escrow.released,
            releasedAt: record.order.escrow.releasedAt,
          }
        : null,
      payouts: record.order.escrow?.payout
        ? [
            {
              id: record.order.escrow.payout.id,
              amount: record.order.escrow.payout.amount.toFixed(2),
              status: record.order.escrow.payout.status,
              attempt: record.order.escrow.payout.attempt,
              failureReason: record.order.escrow.payout.failureReason,
              createdAt: record.order.escrow.payout.createdAt,
              updatedAt: record.order.escrow.payout.updatedAt,
            },
          ]
        : [],
      transactions: record.order.transactions.map(tx => ({
        id: tx.id,
        stripePaymentId: tx.stripePaymentId,
        amount: tx.amount.toFixed(2),
        refundedAmount: tx.refundedAmount.toFixed(2),
        currency: tx.currency,
        status: tx.status,
        createdAt: tx.createdAt,
      })),
      refunds: record.order.refunds.map(ref => ({
        id: ref.id,
        amount: ref.amount.toFixed(2),
        status: ref.status,
        reason: ref.reason,
        stripeRefundId: ref.stripeRefundId,
        createdAt: ref.createdAt,
      })),
      ledgerHistory: record.order.financialEntries.map(fe => ({
        id: fe.id,
        type: fe.type,
        actorId: fe.actorId,
        providerId: fe.providerId,
        reason: fe.reason,
        amount: fe.amount.toFixed(2),
        pendingDelta: fe.pendingDelta.toFixed(2),
        availableDelta: fe.availableDelta.toFixed(2),
        reservedDelta: fe.reservedDelta.toFixed(2),
        paidDelta: fe.paidDelta.toFixed(2),
        feeDelta: fe.feeDelta.toFixed(2),
        createdAt: fe.createdAt,
      })),
      timeline: record.events,
    };
  }

  static async addEvent(
    adminId: string,
    caseId: string,
    rawBody: z.input<typeof addRecoveryEventBodySchema>,
    context?: AuditContext
  ) {
    await requireFinancialAdmin(adminId);
    recoveryCaseIdSchema.parse(caseId);
    const body = addRecoveryEventBodySchema.parse(rawBody);

    const lookup = await prisma.financialRecoveryCase.findUnique({
      where: { id: caseId },
      select: { id: true, orderId: true },
    });
    if (!lookup) throw new HttpError(404, 'Financial recovery case not found');

    return financialTx(async tx => {
      await lockOrder(tx, lookup.orderId);
      const current = await tx.financialRecoveryCase.findUnique({ where: { id: caseId } });
      if (!current) throw new HttpError(404, 'Financial recovery case not found');

      const eventKey = body.idempotencyKey
        ? `recovery-event:${caseId}:${body.idempotencyKey}`
        : undefined;
      if (eventKey) {
        const existing = await tx.financialRecoveryEvent.findUnique({ where: { eventKey } });
        if (existing) {
          if (
            existing.type !== body.type ||
            existing.note !== body.note ||
            (existing.evidenceRef ?? null) !== (body.evidenceRef ?? null)
          ) {
            throw new HttpError(409, 'Idempotency key reused with different recovery event payload');
          }
          return existing;
        }
      }

      const now = new Date();
      const created = await tx.financialRecoveryEvent.create({
        data: {
          recoveryCaseId: current.id,
          eventKey,
          actorId: adminId,
          type: body.type,
          note: body.note,
          evidenceRef: body.evidenceRef ?? null,
        },
        select: {
          id: true,
          recoveryCaseId: true,
          type: true,
          note: true,
          evidenceRef: true,
          createdAt: true,
          actor: { select: { id: true, role: true } },
        },
      });

      await tx.financialRecoveryCase.update({
        where: { id: current.id },
        data: { lastActivityAt: now },
      });

      await AuditService.record(tx, {
        adminId,
        action: 'RECOVERY_CASE_EVENT_ADDED',
        targetEntity: 'FinancialRecoveryCase',
        targetId: current.id,
        previousState: current.status,
        newState: current.status,
        reason: body.note,
        metadata: {
          eventId: created.id,
          eventType: body.type,
          hasEvidenceRef: Boolean(body.evidenceRef),
          orderId: current.orderId,
        },
        context,
      });

      return created;
    });
  }

  static async updateStatus(
    adminId: string,
    caseId: string,
    rawBody: z.input<typeof updateRecoveryStatusBodySchema>,
    context?: AuditContext
  ) {
    await requireFinancialAdmin(adminId);
    recoveryCaseIdSchema.parse(caseId);
    const body = updateRecoveryStatusBodySchema.parse(rawBody);

    const lookup = await prisma.financialRecoveryCase.findUnique({
      where: { id: caseId },
      select: { id: true, orderId: true },
    });
    if (!lookup) throw new HttpError(404, 'Financial recovery case not found');

    return financialTx(async tx => {
      await lockOrder(tx, lookup.orderId);
      const current = await tx.financialRecoveryCase.findUnique({ where: { id: caseId } });
      if (!current) throw new HttpError(404, 'Financial recovery case not found');

      const eventKey = body.idempotencyKey
        ? `recovery-status:${caseId}:${body.idempotencyKey}`
        : undefined;
      if (eventKey) {
        const existing = await tx.financialRecoveryEvent.findUnique({ where: { eventKey } });
        if (existing) {
          if (existing.nextStatus !== body.status || existing.note !== body.reason) {
            throw new HttpError(409, 'Idempotency key reused with different status update');
          }
          return current;
        }
      }

      assertValidRecoveryStatusTransition(current.status, body.status);

      const now = new Date();
      const updated = await tx.financialRecoveryCase.update({
        where: { id: current.id },
        data: { status: body.status, lastActivityAt: now },
      });

      await tx.financialRecoveryEvent.create({
        data: {
          recoveryCaseId: current.id,
          eventKey,
          actorId: adminId,
          type: 'STATUS_CHANGED',
          previousStatus: current.status,
          nextStatus: body.status,
          note: body.reason,
        },
      });

      await AuditService.record(tx, {
        adminId,
        action: 'RECOVERY_CASE_STATUS_CHANGED',
        targetEntity: 'FinancialRecoveryCase',
        targetId: current.id,
        previousState: current.status,
        newState: body.status,
        reason: body.reason,
        metadata: { orderId: current.orderId },
        context,
      });

      return updated;
    });
  }

  static async assignAdmin(
    adminId: string,
    caseId: string,
    rawBody: z.input<typeof assignRecoveryCaseBodySchema>,
    context?: AuditContext
  ) {
    await requireFinancialAdmin(adminId);
    recoveryCaseIdSchema.parse(caseId);
    const body = assignRecoveryCaseBodySchema.parse(rawBody);

    if (body.assignedAdminId !== null) {
      const assignee = await prisma.user.findUnique({
        where: { id: body.assignedAdminId },
        select: { id: true, role: true, status: true },
      });
      if (!assignee || assignee.role !== 'ADMIN' || assignee.status !== 'ACTIVE') {
        throw new HttpError(400, 'Assigned investigator must be an active administrator');
      }
    }

    const lookup = await prisma.financialRecoveryCase.findUnique({
      where: { id: caseId },
      select: { id: true, orderId: true },
    });
    if (!lookup) throw new HttpError(404, 'Financial recovery case not found');

    return financialTx(async tx => {
      await lockOrder(tx, lookup.orderId);
      const current = await tx.financialRecoveryCase.findUnique({ where: { id: caseId } });
      if (!current) throw new HttpError(404, 'Financial recovery case not found');

      const eventKey = body.idempotencyKey
        ? `recovery-assign:${caseId}:${body.idempotencyKey}`
        : undefined;
      if (eventKey) {
        const existing = await tx.financialRecoveryEvent.findUnique({ where: { eventKey } });
        if (existing) {
          if ((existing.assignedAdminId ?? null) !== body.assignedAdminId) {
            throw new HttpError(409, 'Idempotency key reused with different assignment');
          }
          return current;
        }
      }

      const now = new Date();
      const updated = await tx.financialRecoveryCase.update({
        where: { id: current.id },
        data: { assignedAdminId: body.assignedAdminId, lastActivityAt: now },
      });

      const note =
        body.note ??
        (body.assignedAdminId
          ? `Assigned recovery investigation to administrator ${body.assignedAdminId}`
          : 'Unassigned recovery investigation');

      await tx.financialRecoveryEvent.create({
        data: {
          recoveryCaseId: current.id,
          eventKey,
          actorId: adminId,
          type: 'ASSIGNED',
          assignedAdminId: body.assignedAdminId,
          note,
          metadata: {
            previousAssignedAdminId: current.assignedAdminId,
            nextAssignedAdminId: body.assignedAdminId,
          },
        },
      });

      await AuditService.record(tx, {
        adminId,
        action: 'RECOVERY_CASE_ASSIGNED',
        targetEntity: 'FinancialRecoveryCase',
        targetId: current.id,
        previousState: current.status,
        newState: current.status,
        reason: note,
        metadata: {
          orderId: current.orderId,
          previousAssignedAdminId: current.assignedAdminId,
          nextAssignedAdminId: body.assignedAdminId,
        },
        context,
      });

      return updated;
    });
  }
}
