import https from 'node:https';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Prisma, type AccountStatus, type OrderStatus, type PayoutStatus, type SellerStatus, type TransactionStatus, type VerificationStatus } from '@prisma/client';
import type Stripe from 'stripe';
import express from 'express';
import request from 'supertest';

type OrderRec = {
  id: string;
  buyerId: string;
  sellerId: string;
  amount: Prisma.Decimal;
  currency: string;
  platformFeeBps: number;
  purchaseSnapshot: Record<string, unknown>;
  status: OrderStatus;
  completedAt: Date | null;
  createdAt: Date;
};
type TxRec = {
  id: string;
  orderId: string;
  stripePaymentId: string | null;
  amount: Prisma.Decimal;
  refundedAmount: Prisma.Decimal;
  currency: string;
  status: TransactionStatus;
  attemptKey: string | null;
  createdAt: Date;
};
type EscrowRec = { id: string; orderId: string; transactionId: string; amount: Prisma.Decimal; released: boolean; releasedAt: Date | null };
type DisputeRec = {
  id: string;
  orderId: string;
  openedBy: string;
  category: string;
  description: string;
  status: string;
  resolvedBy: string | null;
  resolutionReason: string | null;
  resolvedAt: Date | null;
  providerDisputeId: string | null;
  providerStatus: string | null;
  lastProviderEventId: string | null;
  lastProviderEventType: string | null;
  lastProviderEventCreated: number | null;
  recoveryRequired: boolean;
};
type RefundRec = { id: string; orderId: string; transactionId: string; requestKey: string; actorId: string; reason: string; amount: Prisma.Decimal; status: TransactionStatus; stripeRefundId: string | null; createdAt: Date };
type PayoutRec = { id: string; escrowId: string; sellerProfileId: string; amount: Prisma.Decimal; status: PayoutStatus; requestKey: string | null; stripePayoutId: string | null; failureReason: string | null; attempt: number; createdAt: Date };
type EntryRec = {
  id: string;
  eventKey: string;
  orderId: string;
  type: string;
  actorId: string | null;
  amount: Prisma.Decimal;
  pendingDelta: Prisma.Decimal;
  availableDelta: Prisma.Decimal;
  reservedDelta: Prisma.Decimal;
  paidDelta: Prisma.Decimal;
  feeDelta: Prisma.Decimal;
  transactionId: string | null;
  refundId: string | null;
  payoutId: string | null;
  providerId: string | null;
  reason: string | null;
  notifyUserId: string | null;
  createdAt: Date;
};
type SellerRec = { id: string; userId: string; status: SellerStatus; verificationStatus: VerificationStatus; stripeAccountId: string | null; accountStatus: AccountStatus };

const store = vi.hoisted(() => ({
  seq: 0,
  users: new Map<string, { id: string; role: string; status: AccountStatus }>(),
  sellers: new Map<string, SellerRec>(),
  orders: new Map<string, OrderRec>(),
  transactions: new Map<string, TxRec>(),
  escrows: new Map<string, EscrowRec>(),
  disputes: new Map<string, DisputeRec>(),
  refunds: new Map<string, RefundRec>(),
  payouts: new Map<string, PayoutRec>(),
  entries: new Map<string, EntryRec>(),
  events: new Map<string, { id: string; type: string; objectId: string; payloadHash: string }>(),
  recoveryCases: new Map<string, { id: string; disputeId: string; orderId: string; sellerProfileId: string; status: string; recoveryAmount: Prisma.Decimal }>(),
  recoveryEvents: new Map<string, { id: string; recoveryCaseId: string; eventKey: string | null; type: string }>(),
}));

function resetStore() {
  store.seq = 0;
  store.users.clear();
  store.sellers.clear();
  store.orders.clear();
  store.transactions.clear();
  store.escrows.clear();
  store.disputes.clear();
  store.refunds.clear();
  store.payouts.clear();
  store.entries.clear();
  store.events.clear();
  store.recoveryCases.clear();
  store.recoveryEvents.clear();
  store.users.set('buyer', { id: 'buyer', role: 'BUYER', status: 'ACTIVE' });
  store.users.set('seller', { id: 'seller', role: 'SELLER', status: 'ACTIVE' });
  store.users.set('admin', { id: 'admin', role: 'ADMIN', status: 'ACTIVE' });
  store.sellers.set('sp_1', {
    id: 'sp_1',
    userId: 'seller',
    status: 'APPROVED',
    verificationStatus: 'APPROVED',
    stripeAccountId: 'acct_test_verified_1',
    accountStatus: 'ACTIVE',
  });
}

function nextId(prefix: string) {
  store.seq += 1;
  return `${prefix}${String(store.seq).padStart(20, '0')}`;
}

function hydrateOrder(o: OrderRec) {
  const seller = store.sellers.get(o.sellerId)!;
  const escrow = [...store.escrows.values()].find(e => e.orderId === o.id) ?? null;
  const dispute = [...store.disputes.values()].find(d => d.orderId === o.id) ?? null;
  const refunds = [...store.refunds.values()].filter(r => r.orderId === o.id);
  const transactions = [...store.transactions.values()]
    .filter(t => t.orderId === o.id)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return {
    ...o,
    seller: { id: seller.id, userId: seller.userId },
    escrow,
    dispute,
    refunds,
    transactions,
    deliveries: [],
    revisions: [],
  };
}

vi.mock('../../apps/api/src/lib/prisma', () => {
  const txClient = {
    $queryRaw: vi.fn(async () => [{ '?column?': 1 }]),
    user: {
      findUnique: vi.fn(async ({ where }: { where: { id: string } }) => store.users.get(where.id) ?? null),
    },
    sellerProfile: {
      findUnique: vi.fn(async ({ where }: { where: { id?: string; userId?: string } }) => {
        const s = where.id
          ? store.sellers.get(where.id)
          : [...store.sellers.values()].find(item => item.userId === where.userId);
        if (!s) return null;
        return {
          id: s.id,
          userId: s.userId,
          status: s.status,
          verificationStatus: s.verificationStatus,
          stripeAccountId: s.stripeAccountId,
          user: { status: s.accountStatus },
        };
      }),
    },
    order: {
      findUnique: vi.fn(async ({ where }: { where: { id: string } }) => {
        const o = store.orders.get(where.id);
        return o ? hydrateOrder(o) : null;
      }),
      findUniqueOrThrow: vi.fn(async ({ where }: { where: { id: string } }) => {
        const o = store.orders.get(where.id);
        if (!o) throw new Error('Order not found');
        return hydrateOrder(o);
      }),
      update: vi.fn(async ({ where, data }: { where: { id: string }; data: Partial<OrderRec> }) => {
        const o = store.orders.get(where.id)!;
        if (data.status) o.status = data.status;
        if (data.completedAt !== undefined) o.completedAt = data.completedAt;
        return hydrateOrder(o);
      }),
    },
    transaction: {
      create: vi.fn(async ({ data }: { data: { orderId: string; amount: Prisma.Decimal; currency?: string; status?: TransactionStatus; attemptKey?: string; stripePaymentId?: string } }) => {
        const rec: TxRec = {
          id: nextId('ctx'),
          orderId: data.orderId,
          stripePaymentId: data.stripePaymentId ?? null,
          amount: new Prisma.Decimal(data.amount),
          refundedAmount: new Prisma.Decimal(0),
          currency: data.currency ?? 'usd',
          status: data.status ?? 'PENDING',
          attemptKey: data.attemptKey ?? null,
          createdAt: new Date(),
        };
        store.transactions.set(rec.id, rec);
        return rec;
      }),
      findUnique: vi.fn(async ({ where }: { where: { id?: string; stripePaymentId?: string } }) => {
        if (where.id) return store.transactions.get(where.id) ?? null;
        if (where.stripePaymentId) return [...store.transactions.values()].find(t => t.stripePaymentId === where.stripePaymentId) ?? null;
        return null;
      }),
      findUniqueOrThrow: vi.fn(async ({ where }: { where: { id: string } }) => {
        const rec = store.transactions.get(where.id);
        if (!rec) throw new Error('Tx not found');
        return rec;
      }),
      findFirst: vi.fn(async ({ where }: { where: { OR?: Array<{ stripePaymentId?: string; id?: string }> } }) => {
        for (const cond of where.OR ?? []) {
          const found = [...store.transactions.values()].find(t =>
            (cond.stripePaymentId && t.stripePaymentId === cond.stripePaymentId) ||
            (cond.id && t.id === cond.id)
          );
          if (found) return { ...found, order: hydrateOrder(store.orders.get(found.orderId)!) };
        }
        return null;
      }),
      findMany: vi.fn(async (args?: { where?: { stripePaymentId?: { in?: string[] } }; take?: number; cursor?: { id: string }; skip?: number }) => {
        let list = [...store.transactions.values()].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime() || b.id.localeCompare(a.id));
        if (args?.where?.stripePaymentId?.in) {
          const set = new Set(args.where.stripePaymentId.in);
          list = list.filter(t => t.stripePaymentId !== null && set.has(t.stripePaymentId));
        }
        if (args?.cursor?.id) {
          const idx = list.findIndex(t => t.id === args.cursor!.id);
          if (idx >= 0) list = list.slice(idx + (args.skip ?? 0));
        }
        if (args?.take !== undefined) list = list.slice(0, args.take);
        return list;
      }),
      count: vi.fn(async ({ where }: { where: { orderId: string; id?: { not?: string }; status?: { notIn?: string[]; not?: string }; OR?: Array<{ status?: { notIn?: string[] } | string; stripePaymentId?: { not?: null } }> } }) => {
        return [...store.transactions.values()].filter(t => {
          if (t.orderId !== where.orderId) return false;
          if (where.id?.not && t.id === where.id.not) return false;
          if (where.OR) {
            return where.OR.some(branch => {
              if (typeof branch.status === 'string') {
                return t.status === branch.status && (branch.stripePaymentId?.not === null ? t.stripePaymentId !== null : true);
              }
              if (branch.status?.notIn) return !branch.status.notIn.includes(t.status);
              return false;
            });
          }
          if (where.status?.not && t.status === where.status.not) return false;
          if (where.status?.notIn && where.status.notIn.includes(t.status)) return false;
          return true;
        }).length;
      }),
      update: vi.fn(async ({ where, data }: { where: { id: string }; data: Partial<TxRec> }) => {
        const rec = store.transactions.get(where.id)!;
        Object.assign(rec, data);
        return rec;
      }),
      updateMany: vi.fn(async ({ where, data }: { where: { orderId: string; status?: TransactionStatus; stripePaymentId?: null }; data: Partial<TxRec> }) => {
        let count = 0;
        for (const t of store.transactions.values()) {
          if (t.orderId === where.orderId && (!where.status || t.status === where.status) && (where.stripePaymentId === undefined || t.stripePaymentId === where.stripePaymentId)) {
            Object.assign(t, data);
            count += 1;
          }
        }
        return { count };
      }),
    },
    escrow: {
      create: vi.fn(async ({ data }: { data: { orderId: string; transactionId: string; amount: Prisma.Decimal } }) => {
        const rec: EscrowRec = { id: nextId('cesc'), orderId: data.orderId, transactionId: data.transactionId, amount: new Prisma.Decimal(data.amount), released: false, releasedAt: null };
        store.escrows.set(rec.id, rec);
        return rec;
      }),
      update: vi.fn(async ({ where, data }: { where: { id: string }; data: Partial<EscrowRec> }) => {
        const rec = store.escrows.get(where.id)!;
        Object.assign(rec, data);
        return rec;
      }),
    },
    marketplaceDispute: {
      count: vi.fn(async ({ where }: { where?: { order?: { sellerId?: string }; recoveryRequired?: boolean } }) => {
        return [...store.disputes.values()].filter(d => {
          if (where?.recoveryRequired !== undefined && d.recoveryRequired !== where.recoveryRequired) return false;
          if (where?.order?.sellerId) {
            const ord = store.orders.get(d.orderId);
            if (!ord || ord.sellerId !== where.order.sellerId) return false;
          }
          return true;
        }).length;
      }),
      create: vi.fn(async ({ data }: { data: Partial<DisputeRec> & { orderId: string; openedBy: string; category: string; description: string } }) => {
        const rec: DisputeRec = {
          id: nextId('cdsp'),
          orderId: data.orderId,
          openedBy: data.openedBy,
          category: data.category,
          description: data.description,
          status: data.status ?? 'OPEN',
          resolvedBy: data.resolvedBy ?? null,
          resolutionReason: data.resolutionReason ?? null,
          resolvedAt: data.resolvedAt ?? null,
          providerDisputeId: data.providerDisputeId ?? null,
          providerStatus: data.providerStatus ?? null,
          lastProviderEventId: data.lastProviderEventId ?? null,
          lastProviderEventType: data.lastProviderEventType ?? null,
          lastProviderEventCreated: data.lastProviderEventCreated ?? null,
          recoveryRequired: data.recoveryRequired ?? false,
        };
        store.disputes.set(rec.id, rec);
        return rec;
      }),
      update: vi.fn(async ({ where, data }: { where: { id: string }; data: Partial<DisputeRec> }) => {
        const rec = store.disputes.get(where.id)!;
        Object.assign(rec, data);
        return rec;
      }),
    },
    refund: {
      findUnique: vi.fn(async ({ where }: { where: { id?: string; orderId_requestKey?: { orderId: string; requestKey: string } } }) => {
        if (where.id) return store.refunds.get(where.id) ?? null;
        if (where.orderId_requestKey) {
          return [...store.refunds.values()].find(
            r => r.orderId === where.orderId_requestKey!.orderId && r.requestKey === where.orderId_requestKey!.requestKey
          ) ?? null;
        }
        return null;
      }),
      findUniqueOrThrow: vi.fn(async ({ where }: { where: { id: string } }) => {
        const rec = store.refunds.get(where.id);
        if (!rec) throw new Error('Refund not found');
        return rec;
      }),
      aggregate: vi.fn(async ({ where }: { where: { transactionId: string; status: { in: string[] } } }) => {
        const sum = [...store.refunds.values()]
          .filter(r => r.transactionId === where.transactionId && where.status.in.includes(r.status))
          .reduce((acc, r) => acc.add(r.amount), new Prisma.Decimal(0));
        return { _sum: { amount: sum.isZero() ? null : sum } };
      }),
      create: vi.fn(async ({ data }: { data: { orderId: string; transactionId: string; actorId: string; amount: Prisma.Decimal; reason: string; requestKey: string } }) => {
        const rec: RefundRec = {
          id: nextId('cref'),
          orderId: data.orderId,
          transactionId: data.transactionId,
          actorId: data.actorId,
          amount: new Prisma.Decimal(data.amount),
          reason: data.reason,
          requestKey: data.requestKey,
          status: 'PENDING',
          stripeRefundId: null,
          createdAt: new Date(),
        };
        store.refunds.set(rec.id, rec);
        return rec;
      }),
      update: vi.fn(async ({ where, data }: { where: { id: string }; data: Partial<RefundRec> }) => {
        const rec = store.refunds.get(where.id)!;
        Object.assign(rec, data);
        return rec;
      }),
    },
    payout: {
      findUnique: vi.fn(async ({ where }: { where: { id?: string; escrowId?: string } }) => {
        const p = where.id ? store.payouts.get(where.id) : [...store.payouts.values()].find(item => item.escrowId === where.escrowId);
        if (!p) return null;
        return { ...p, escrow: store.escrows.get(p.escrowId)! };
      }),
      findUniqueOrThrow: vi.fn(async ({ where }: { where: { id: string } }) => {
        const p = store.payouts.get(where.id);
        if (!p) throw new Error('Payout not found');
        return { ...p, escrow: store.escrows.get(p.escrowId)! };
      }),
      upsert: vi.fn(async ({ where, create, update }: { where: { escrowId: string }; create: { escrowId: string; sellerProfileId: string; amount: Prisma.Decimal; requestKey: string }; update: Partial<PayoutRec> & { attempt?: { increment: number } } }) => {
        const existing = [...store.payouts.values()].find(p => p.escrowId === where.escrowId);
        if (existing) {
          existing.status = update.status ?? existing.status;
          existing.amount = update.amount ? new Prisma.Decimal(update.amount) : existing.amount;
          existing.requestKey = update.requestKey ?? existing.requestKey;
          existing.attempt += update.attempt?.increment ?? 0;
          return existing;
        }
        const rec: PayoutRec = {
          id: nextId('cpay'),
          escrowId: create.escrowId,
          sellerProfileId: create.sellerProfileId,
          amount: new Prisma.Decimal(create.amount),
          requestKey: create.requestKey,
          status: 'PENDING',
          stripePayoutId: null,
          failureReason: null,
          attempt: 1,
          createdAt: new Date(),
        };
        store.payouts.set(rec.id, rec);
        return rec;
      }),
      update: vi.fn(async ({ where, data }: { where: { id: string }; data: Partial<PayoutRec> }) => {
        const p = store.payouts.get(where.id)!;
        Object.assign(p, data);
        return p;
      }),
    },
    financialEntry: {
      findUnique: vi.fn(async ({ where }: { where: { eventKey: string } }) => {
        return [...store.entries.values()].find(e => e.eventKey === where.eventKey) ?? null;
      }),
      findMany: vi.fn(async (args?: { where?: { orderId?: { in?: string[] } | string; notifyUserId?: { not: null } } }) => {
        if (args?.where?.notifyUserId) return [];
        const list = [...store.entries.values()];
        if (args?.where?.orderId && typeof args.where.orderId === 'object' && args.where.orderId.in) {
          const set = new Set(args.where.orderId.in);
          return list.filter(e => set.has(e.orderId));
        }
        if (typeof args?.where?.orderId === 'string') {
          return list.filter(e => e.orderId === args.where!.orderId);
        }
        return list;
      }),
      create: vi.fn(async ({ data }: { data: Partial<EntryRec> & { orderId: string; type: string; eventKey: string } }) => {
        if ([...store.entries.values()].some(e => e.eventKey === data.eventKey)) {
          const dup = Object.assign(new Error('Unique constraint failed on eventKey'), { code: 'P2002' });
          throw dup;
        }
        const rec: EntryRec = {
          id: nextId('cfe'),
          eventKey: data.eventKey,
          orderId: data.orderId,
          type: data.type,
          actorId: data.actorId ?? null,
          amount: new Prisma.Decimal(data.amount ?? 0),
          pendingDelta: new Prisma.Decimal(data.pendingDelta ?? 0),
          availableDelta: new Prisma.Decimal(data.availableDelta ?? 0),
          reservedDelta: new Prisma.Decimal(data.reservedDelta ?? 0),
          paidDelta: new Prisma.Decimal(data.paidDelta ?? 0),
          feeDelta: new Prisma.Decimal(data.feeDelta ?? 0),
          transactionId: data.transactionId ?? null,
          refundId: data.refundId ?? null,
          payoutId: data.payoutId ?? null,
          providerId: data.providerId ?? null,
          reason: data.reason ?? null,
          notifyUserId: data.notifyUserId ?? null,
          createdAt: new Date(),
        };
        store.entries.set(rec.id, rec);
        return rec;
      }),
      aggregate: vi.fn(async ({ where }: { where: { orderId: string } }) => {
        const list = [...store.entries.values()].filter(e => e.orderId === where.orderId);
        const sum = (field: 'pendingDelta' | 'availableDelta' | 'reservedDelta' | 'paidDelta' | 'feeDelta') =>
          list.reduce((acc, e) => acc.add(e[field]), new Prisma.Decimal(0));
        return {
          _sum: {
            pendingDelta: sum('pendingDelta'),
            availableDelta: sum('availableDelta'),
            reservedDelta: sum('reservedDelta'),
            paidDelta: sum('paidDelta'),
            feeDelta: sum('feeDelta'),
          },
        };
      }),
    },
    providerEvent: {
      findUnique: vi.fn(async ({ where }: { where: { id: string } }) => store.events.get(where.id) ?? null),
      create: vi.fn(async ({ data }: { data: { id: string; type: string; objectId: string; payloadHash: string } }) => {
        store.events.set(data.id, data);
        return data;
      }),
    },
    financialRecoveryCase: {
      findUnique: vi.fn(async ({ where }: { where: { disputeId?: string; id?: string } }) => {
        if (where.id) return store.recoveryCases.get(where.id) ?? null;
        if (where.disputeId) return [...store.recoveryCases.values()].find(c => c.disputeId === where.disputeId) ?? null;
        return null;
      }),
      create: vi.fn(async ({ data }: { data: { disputeId: string; orderId: string; sellerProfileId: string; status?: string; recoveryAmount: Prisma.Decimal } }) => {
        const rec = {
          id: nextId('cfrc'),
          disputeId: data.disputeId,
          orderId: data.orderId,
          sellerProfileId: data.sellerProfileId,
          status: data.status ?? 'OPEN',
          recoveryAmount: new Prisma.Decimal(data.recoveryAmount),
        };
        store.recoveryCases.set(rec.id, rec);
        return rec;
      }),
    },
    financialRecoveryEvent: {
      findUnique: vi.fn(async ({ where }: { where: { eventKey?: string } }) => {
        if (!where.eventKey) return null;
        return [...store.recoveryEvents.values()].find(e => e.eventKey === where.eventKey) ?? null;
      }),
      create: vi.fn(async ({ data }: { data: { recoveryCaseId: string; eventKey?: string; type: string } }) => {
        const rec = { id: nextId('cfre'), recoveryCaseId: data.recoveryCaseId, eventKey: data.eventKey ?? null, type: data.type };
        store.recoveryEvents.set(rec.id, rec);
        return rec;
      }),
    },
    notification: {
      upsert: vi.fn(async () => ({})),
    },
  };

  return {
    prisma: {
      ...txClient,
      $transaction: async <T>(fn: (tx: typeof txClient) => Promise<T>) => fn(txClient),
    },
  };
});

vi.mock('../../apps/api/src/middlewares/requireAuth', () => ({
  requireAuth: (req: express.Request & { user?: { userId: string; role: string } }, res: express.Response, next: express.NextFunction) => {
    const actor = req.headers.authorization?.replace('Bearer ', '');
    if (!actor) return res.status(401).json({ success: false });
    const user = store.users.get(actor);
    req.user = { userId: actor, role: user?.role ?? 'BUYER' };
    next();
  },
}));

import { PaymentService, stripe } from '../../apps/api/src/modules/payment/payment.service';
import { handleWebhook } from '../../apps/api/src/modules/payment/payment.controller';
import { OrderService } from '../../apps/api/src/modules/order/order.service';
import { DisputeService } from '../../apps/api/src/modules/financial/dispute.service';
import { RefundService } from '../../apps/api/src/modules/financial/refund.service';
import { PayoutService } from '../../apps/api/src/modules/financial/payout.service';
import { runAdminReconciliationReport } from '../../apps/api/src/modules/financial/reconciliation.service';
import financialRouter from '../../apps/api/src/modules/financial/financial.route';

function seedFundedOrder(options: { status?: OrderStatus; released?: boolean; amount?: string; paymentId?: string } = {}) {
  const orderId = nextId('cord');
  const amount = new Prisma.Decimal(options.amount ?? '100.00');
  const order: OrderRec = {
    id: orderId,
    buyerId: 'buyer',
    sellerId: 'sp_1',
    amount,
    currency: 'usd',
    platformFeeBps: 1000,
    purchaseSnapshot: { deliveryDays: 2, revisions: 1 },
    status: options.status ?? 'PAID',
    completedAt: options.status === 'COMPLETED' ? new Date() : null,
    createdAt: new Date(),
  };
  store.orders.set(orderId, order);
  const txId = nextId('ctx');
  const paymentId = options.paymentId ?? `pi_${orderId}`;
  const tx: TxRec = {
    id: txId,
    orderId,
    stripePaymentId: paymentId,
    amount,
    refundedAmount: new Prisma.Decimal(0),
    currency: 'usd',
    status: 'SUCCEEDED',
    attemptKey: `payment:${orderId}:seed`,
    createdAt: new Date(),
  };
  store.transactions.set(txId, tx);
  const escrow: EscrowRec = {
    id: nextId('cesc'),
    orderId,
    transactionId: txId,
    amount,
    released: Boolean(options.released),
    releasedAt: options.released ? new Date() : null,
  };
  store.escrows.set(escrow.id, escrow);
  const grossCents = amount.mul(100).toNumber();
  const feeCents = Math.round(grossCents * 0.1);
  const netCents = grossCents - feeCents;
  const entryId = nextId('cfe');
  store.entries.set(entryId, {
    id: entryId,
    eventKey: `payment:${txId}:received`,
    orderId,
    type: 'PAYMENT_RECEIVED',
    actorId: null,
    amount,
    pendingDelta: new Prisma.Decimal(options.released ? 0 : netCents).div(100),
    availableDelta: new Prisma.Decimal(options.released ? netCents : 0).div(100),
    reservedDelta: new Prisma.Decimal(0),
    paidDelta: new Prisma.Decimal(0),
    feeDelta: new Prisma.Decimal(feeCents).div(100),
    transactionId: txId,
    refundId: null,
    payoutId: null,
    providerId: paymentId,
    reason: null,
    notifyUserId: null,
    createdAt: new Date(),
  });
  return { order, tx, escrow, paymentId };
}

function seedPendingOrder(amount = '100.00') {
  const orderId = nextId('cord');
  const order: OrderRec = {
    id: orderId,
    buyerId: 'buyer',
    sellerId: 'sp_1',
    amount: new Prisma.Decimal(amount),
    currency: 'usd',
    platformFeeBps: 1000,
    purchaseSnapshot: { deliveryDays: 2, revisions: 1 },
    status: 'PENDING',
    completedAt: null,
    createdAt: new Date(),
  };
  store.orders.set(orderId, order);
  return order;
}

function signWebhook(payload: string, secret = 'whsec_pr27_test_secret') {
  const ctor = stripe.constructor as unknown as {
    webhooks: { generateTestHeaderString: (opts: { payload: string; secret: string }) => string };
  };
  return ctor.webhooks.generateTestHeaderString({ payload, secret });
}

const app = express();
app.post('/api/v1/payments/webhook', express.raw({ type: 'application/json' }), handleWebhook);
app.use(express.json());
app.use('/api/v1/financial', financialRouter);
app.use((err: Error & { status?: number; code?: string }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(err.status || 500).json({ success: false, error: { code: err.code || 'ERROR', message: err.message } });
});

beforeEach(() => {
  resetStore();
  vi.stubEnv('APP_ENV', 'test');
  vi.stubEnv('PAYMENTS_PROVIDER', 'stripe');
  vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_pr27_fixture');
  vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_pr27_test_secret');
  vi.spyOn(https, 'request').mockImplementation(() => { throw new Error('Outbound HTTPS forbidden'); });
  vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Outbound fetch forbidden'));
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('PR #27 F-01: Stripe Chargeback Lifecycle', () => {
  it('handles created -> updated -> closed (won) dispute webhooks idempotently, rejects invalid signatures, and blocks payout while disputed', async () => {
    const { order, paymentId } = seedFundedOrder({ status: 'COMPLETED', released: true });

    // Invalid webhook signature is rejected before any mutation.
    const badSig = await request(app)
      .post('/api/v1/payments/webhook')
      .set('Content-Type', 'application/json')
      .set('Stripe-Signature', 't=1,v1=invalid')
      .send(JSON.stringify({ id: 'evt_bad_sig', type: 'charge.dispute.created', data: { object: {} } }));
    expect(badSig.status).toBe(400);

    // Created dispute transitions order -> DISPUTED and freezes seller funds.
    const createdBody = JSON.stringify({
      id: 'evt_cb_created_1',
      object: 'event',
      type: 'charge.dispute.created',
      livemode: false,
      data: { object: { id: 'dp_1', object: 'dispute', amount: 10000, currency: 'usd', payment_intent: paymentId, reason: 'fraudulent', status: 'needs_response' } },
    });
    const resCreated = await request(app)
      .post('/api/v1/payments/webhook')
      .set('Content-Type', 'application/json')
      .set('Stripe-Signature', signWebhook(createdBody))
      .send(createdBody);
    expect(resCreated.status).toBe(200);
    expect(store.orders.get(order.id)!.status).toBe('DISPUTED');
    const dispute = [...store.disputes.values()].find(d => d.orderId === order.id)!;
    expect(dispute.status).toBe('OPEN');

    // Duplicate webhook event is idempotent (no duplicate ledger entries).
    const resDup = await request(app)
      .post('/api/v1/payments/webhook')
      .set('Content-Type', 'application/json')
      .set('Stripe-Signature', signWebhook(createdBody))
      .send(createdBody);
    expect(resDup.status).toBe(200);
    expect([...store.entries.values()].filter(e => e.eventKey === 'stripe-dispute:evt_cb_created_1')).toHaveLength(1);

    // Disputed seller funds CANNOT be requested for payout.
    await expect(PayoutService.request('seller', order.id, 'payout_during_chargeback_1')).rejects.toThrow('undisputed');

    // Updated dispute moves MarketplaceDispute -> UNDER_REVIEW and keeps order frozen.
    const updatedBody = JSON.stringify({
      id: 'evt_cb_updated_1',
      object: 'event',
      type: 'charge.dispute.updated',
      livemode: false,
      data: { object: { id: 'dp_1', object: 'dispute', amount: 10000, currency: 'usd', payment_intent: paymentId, reason: 'fraudulent', status: 'under_review' } },
    });
    const resUpdated = await request(app)
      .post('/api/v1/payments/webhook')
      .set('Content-Type', 'application/json')
      .set('Stripe-Signature', signWebhook(updatedBody))
      .send(updatedBody);
    expect(resUpdated.status).toBe(200);
    expect(dispute.status).toBe('UNDER_REVIEW');
    expect(store.orders.get(order.id)!.status).toBe('DISPUTED');

    // Closed dispute (won) resolves dispute for seller and restores COMPLETED status.
    const closedWonBody = JSON.stringify({
      id: 'evt_cb_closed_won_1',
      object: 'event',
      type: 'charge.dispute.closed',
      livemode: false,
      data: { object: { id: 'dp_1', object: 'dispute', amount: 10000, currency: 'usd', payment_intent: paymentId, reason: 'fraudulent', status: 'won' } },
    });
    const resClosed = await request(app)
      .post('/api/v1/payments/webhook')
      .set('Content-Type', 'application/json')
      .set('Stripe-Signature', signWebhook(closedWonBody))
      .send(closedWonBody);
    expect(resClosed.status).toBe(200);
    expect(dispute.status).toBe('RESOLVED_SELLER');
    expect(store.orders.get(order.id)!.status).toBe('COMPLETED');
  });

  it('handles charge.dispute.closed (lost) with exact single reversal and never routes through assertStripeConnectTestMode', async () => {
    const { order, tx, paymentId } = seedFundedOrder({ status: 'PAID', released: false });
    // Even if APP_ENV=production with matching test/live webhook mode check, chargebacks do NOT hit Connect 503 gate.
    vi.stubEnv('APP_ENV', 'production');
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_nonlive_prod_check');

    const lostEvent = {
      id: 'evt_cb_closed_lost_1',
      object: 'event',
      type: 'charge.dispute.closed',
      livemode: false,
      data: { object: { id: 'dp_lost_1', object: 'dispute', amount: 10000, currency: 'usd', payment_intent: paymentId, reason: 'product_not_received', status: 'lost' } },
    } as unknown as Stripe.Event;

    await PaymentService.handleWebhookEvent(lostEvent);
    // Replaying with a distinct event ID must not reverse balances twice.
    await PaymentService.handleWebhookEvent({ ...lostEvent, id: 'evt_cb_closed_lost_2' } as Stripe.Event);

    expect(store.orders.get(order.id)!.status).toBe('REFUNDED');
    expect(store.transactions.get(tx.id)!.status).toBe('REFUNDED');
    expect(store.transactions.get(tx.id)!.refundedAmount.toFixed(2)).toBe('100.00');
    expect([...store.entries.values()].filter(e => e.type === 'CHARGEBACK_LOST')).toHaveLength(1);
    const pendingSum = [...store.entries.values()]
      .filter(e => e.orderId === order.id)
      .reduce((acc, e) => acc.add(e.pendingDelta), new Prisma.Decimal(0));
    expect(pendingSum.toFixed(2)).toBe('0.00');
  });

  it('ignores stale out-of-order dispute webhooks after closed-won, closed-lost, and newer active updates', async () => {
    // 1. closed (won) followed by stale updated and stale created must NOT reopen dispute or re-freeze order.
    const wonOrder = seedFundedOrder({ status: 'COMPLETED', released: true });
    await PaymentService.handleWebhookEvent({
      id: 'evt_won_first_1',
      object: 'event',
      type: 'charge.dispute.closed',
      created: 1_700_000_200,
      livemode: false,
      data: { object: { id: 'dp_won_oob', object: 'dispute', amount: 10000, currency: 'usd', payment_intent: wonOrder.paymentId, reason: 'fraudulent', status: 'won' } },
    } as unknown as Stripe.Event);
    const wonDispute = [...store.disputes.values()].find(d => d.orderId === wonOrder.order.id)!;
    expect(wonDispute.status).toBe('RESOLVED_SELLER');
    expect(wonDispute.providerStatus).toBe('won');
    expect(wonDispute.lastProviderEventCreated).toBe(1_700_000_200);
    expect(store.orders.get(wonOrder.order.id)!.status).toBe('COMPLETED');

    await PaymentService.handleWebhookEvent({
      id: 'evt_won_stale_updated_1',
      object: 'event',
      type: 'charge.dispute.updated',
      created: 1_700_000_150,
      livemode: false,
      data: { object: { id: 'dp_won_oob', object: 'dispute', amount: 10000, currency: 'usd', payment_intent: wonOrder.paymentId, reason: 'fraudulent', status: 'under_review' } },
    } as unknown as Stripe.Event);
    await PaymentService.handleWebhookEvent({
      id: 'evt_won_stale_created_1',
      object: 'event',
      type: 'charge.dispute.created',
      created: 1_700_000_100,
      livemode: false,
      data: { object: { id: 'dp_won_oob', object: 'dispute', amount: 10000, currency: 'usd', payment_intent: wonOrder.paymentId, reason: 'fraudulent', status: 'needs_response' } },
    } as unknown as Stripe.Event);
    // Exact duplicate of stale event is deduplicated cleanly.
    await PaymentService.handleWebhookEvent({
      id: 'evt_won_stale_updated_1',
      object: 'event',
      type: 'charge.dispute.updated',
      created: 1_700_000_150,
      livemode: false,
      data: { object: { id: 'dp_won_oob', object: 'dispute', amount: 10000, currency: 'usd', payment_intent: wonOrder.paymentId, reason: 'fraudulent', status: 'under_review' } },
    } as unknown as Stripe.Event);
    expect(wonDispute.status).toBe('RESOLVED_SELLER');
    expect(wonDispute.providerStatus).toBe('won');
    expect(store.orders.get(wonOrder.order.id)!.status).toBe('COMPLETED');
    expect([...store.entries.values()].filter(e => e.orderId === wonOrder.order.id && e.type === 'PROVIDER_DISPUTE_STALE_IGNORED')).toHaveLength(2);

    // 2. closed (lost) followed by stale updated must NOT reopen dispute or alter REFUNDED state.
    const lostOrder = seedFundedOrder({ status: 'PAID', released: false });
    await PaymentService.handleWebhookEvent({
      id: 'evt_lost_first_1',
      object: 'event',
      type: 'charge.dispute.closed',
      created: 1_700_000_300,
      livemode: false,
      data: { object: { id: 'dp_lost_oob', object: 'dispute', amount: 10000, currency: 'usd', payment_intent: lostOrder.paymentId, reason: 'product_not_received', status: 'lost' } },
    } as unknown as Stripe.Event);
    await PaymentService.handleWebhookEvent({
      id: 'evt_lost_stale_updated_1',
      object: 'event',
      type: 'charge.dispute.updated',
      created: 1_700_000_250,
      livemode: false,
      data: { object: { id: 'dp_lost_oob', object: 'dispute', amount: 10000, currency: 'usd', payment_intent: lostOrder.paymentId, reason: 'product_not_received', status: 'under_review' } },
    } as unknown as Stripe.Event);
    const lostDispute = [...store.disputes.values()].find(d => d.orderId === lostOrder.order.id)!;
    expect(lostDispute.status).toBe('RESOLVED_BUYER');
    expect(lostDispute.providerStatus).toBe('lost');
    expect(store.orders.get(lostOrder.order.id)!.status).toBe('REFUNDED');
    expect([...store.entries.values()].filter(e => e.orderId === lostOrder.order.id && e.type === 'PROVIDER_DISPUTE_STALE_IGNORED')).toHaveLength(1);

    // 3. Active dispute preserves legitimate forward update, rejects older timestamp regression.
    const activeOrder = seedFundedOrder({ status: 'PAID', released: false });
    await PaymentService.handleWebhookEvent({
      id: 'evt_act_newer_1',
      object: 'event',
      type: 'charge.dispute.updated',
      created: 1_700_000_500,
      livemode: false,
      data: { object: { id: 'dp_act_1', object: 'dispute', amount: 10000, currency: 'usd', payment_intent: activeOrder.paymentId, reason: 'general', status: 'under_review' } },
    } as unknown as Stripe.Event);
    await PaymentService.handleWebhookEvent({
      id: 'evt_act_older_1',
      object: 'event',
      type: 'charge.dispute.created',
      created: 1_700_000_400,
      livemode: false,
      data: { object: { id: 'dp_act_1', object: 'dispute', amount: 10000, currency: 'usd', payment_intent: activeOrder.paymentId, reason: 'general', status: 'needs_response' } },
    } as unknown as Stripe.Event);
    const actDispute = [...store.disputes.values()].find(d => d.orderId === activeOrder.order.id)!;
    expect(actDispute.status).toBe('UNDER_REVIEW');
    expect(actDispute.lastProviderEventCreated).toBe(1_700_000_500);
  });

  it('maps partial chargeback loss to Transaction=PARTIALLY_REFUNDED while keeping Order=DISPUTED (never REFUNDED)', async () => {
    const { order, tx, paymentId } = seedFundedOrder({ status: 'COMPLETED', released: true, amount: '100.00' });
    await PaymentService.handleWebhookEvent({
      id: 'evt_partial_cb_1',
      object: 'event',
      type: 'charge.dispute.closed',
      created: 1_700_000_600,
      livemode: false,
      data: { object: { id: 'dp_partial_1', object: 'dispute', amount: 4000, currency: 'usd', payment_intent: paymentId, reason: 'general', status: 'lost' } },
    } as unknown as Stripe.Event);

    expect(store.transactions.get(tx.id)!.status).toBe('PARTIALLY_REFUNDED');
    expect(store.transactions.get(tx.id)!.refundedAmount.toFixed(2)).toBe('40.00');
    expect(store.orders.get(order.id)!.status).toBe('DISPUTED');
    expect(store.orders.get(order.id)!.status).not.toBe('REFUNDED');
    const dispute = [...store.disputes.values()].find(d => d.orderId === order.id)!;
    expect(dispute.status).toBe('RESOLVED_BUYER');
    expect(dispute.recoveryRequired).toBe(false);
    // Remaining available balance = 90.00 - 36.00 = 54.00; fee = 10.00 - 4.00 = 6.00.
    const availableSum = [...store.entries.values()]
      .filter(e => e.orderId === order.id)
      .reduce((acc, e) => acc.add(e.availableDelta), new Prisma.Decimal(0));
    const feeSum = [...store.entries.values()]
      .filter(e => e.orderId === order.id)
      .reduce((acc, e) => acc.add(e.feeDelta), new Prisma.Decimal(0));
    expect(availableSum.toFixed(2)).toBe('54.00');
    expect(feeSum.toFixed(2)).toBe('6.00');
    // Order remains DISPUTED so remaining funds are NOT blindly paid out.
    await expect(PayoutService.request('seller', order.id, 'payout_after_partial_cb_1')).rejects.toThrow();
  });

  it('handles chargeback loss when funds are reserved or already paid by flagging CHARGEBACK_RECOVERY_REQUIRED and blocking payouts', async () => {
    // Case A: Funds already reserved for payout.
    const reservedCase = seedFundedOrder({ status: 'COMPLETED', released: true, amount: '100.00' });
    const reservedPayout = await PayoutService.request('seller', reservedCase.order.id, 'payout_before_cb_reserved_1');
    expect(reservedPayout.status).toBe('PENDING');

    await PaymentService.handleWebhookEvent({
      id: 'evt_cb_reserved_lost_1',
      object: 'event',
      type: 'charge.dispute.closed',
      created: 1_700_000_700,
      livemode: false,
      data: { object: { id: 'dp_reserved_1', object: 'dispute', amount: 10000, currency: 'usd', payment_intent: reservedCase.paymentId, reason: 'fraudulent', status: 'lost' } },
    } as unknown as Stripe.Event);

    expect(store.orders.get(reservedCase.order.id)!.status).toBe('DISPUTED');
    expect(store.transactions.get(reservedCase.tx.id)!.status).toBe('SUCCEEDED');
    const reservedDispute = [...store.disputes.values()].find(d => d.orderId === reservedCase.order.id)!;
    expect(reservedDispute.status).toBe('UNDER_REVIEW');
    expect(reservedDispute.recoveryRequired).toBe(true);
    expect([...store.entries.values()].filter(e => e.orderId === reservedCase.order.id && e.type === 'CHARGEBACK_RECOVERY_REQUIRED')).toHaveLength(1);
    // Reserved payout is frozen even with a test provider.
    await expect(
      PayoutService.process('admin', reservedPayout.id, {
        available: true,
        submit: async input => ({ ...input, providerId: 'po_should_not_run', status: 'PAID' }),
      })
    ).rejects.toThrow(/recovery/i);
    // Admin cannot release seller funds via DisputeService.resolve while recovery is unresolved.
    await expect(DisputeService.resolve('admin', reservedCase.order.id, 'SELLER', 'Attempt bypass')).rejects.toThrow(/recovery/i);
    // Stale updated webhook after recovery-required lost closure is ignored without clearing recoveryRequired.
    await PaymentService.handleWebhookEvent({
      id: 'evt_cb_reserved_stale_1',
      object: 'event',
      type: 'charge.dispute.updated',
      created: 1_700_000_650,
      livemode: false,
      data: { object: { id: 'dp_reserved_1', object: 'dispute', amount: 10000, currency: 'usd', payment_intent: reservedCase.paymentId, reason: 'fraudulent', status: 'needs_response' } },
    } as unknown as Stripe.Event);
    expect(reservedDispute.recoveryRequired).toBe(true);
    expect(reservedDispute.providerStatus).toBe('lost');

    // Unrelated completed order for the SAME seller is ALSO blocked from payout while recovery is unresolved!
    const otherCompleted = seedFundedOrder({ status: 'COMPLETED', released: true, amount: '50.00' });
    await expect(PayoutService.request('seller', otherCompleted.order.id, 'payout_blocked_by_recovery_1')).rejects.toThrow(/recovery/i);

    // Case B: Funds already PAID out.
    resetStore();
    const paidCase = seedFundedOrder({ status: 'COMPLETED', released: true, amount: '100.00' });
    const paidEntryId = nextId('cfe');
    store.entries.set(paidEntryId, {
      id: paidEntryId,
      eventKey: `payout:${paidCase.order.id}:paid-seed`,
      orderId: paidCase.order.id,
      type: 'PAYOUT_PAID',
      actorId: 'admin',
      amount: new Prisma.Decimal('90.00'),
      pendingDelta: new Prisma.Decimal(0),
      availableDelta: new Prisma.Decimal('-90.00'),
      reservedDelta: new Prisma.Decimal(0),
      paidDelta: new Prisma.Decimal('90.00'),
      feeDelta: new Prisma.Decimal(0),
      transactionId: paidCase.tx.id,
      refundId: null,
      payoutId: null,
      providerId: 'po_paid_seed',
      reason: null,
      notifyUserId: null,
      createdAt: new Date(),
    });

    await PaymentService.handleWebhookEvent({
      id: 'evt_cb_paid_lost_1',
      object: 'event',
      type: 'charge.dispute.closed',
      created: 1_700_000_800,
      livemode: false,
      data: { object: { id: 'dp_paid_1', object: 'dispute', amount: 10000, currency: 'usd', payment_intent: paidCase.paymentId, reason: 'fraudulent', status: 'lost' } },
    } as unknown as Stripe.Event);

    expect(store.orders.get(paidCase.order.id)!.status).toBe('DISPUTED');
    expect(store.transactions.get(paidCase.tx.id)!.status).toBe('SUCCEEDED');
    const paidDispute = [...store.disputes.values()].find(d => d.orderId === paidCase.order.id)!;
    expect(paidDispute.status).toBe('UNDER_REVIEW');
    expect(paidDispute.recoveryRequired).toBe(true);
    expect([...store.entries.values()].filter(e => e.orderId === paidCase.order.id && e.type === 'CHARGEBACK_RECOVERY_REQUIRED')).toHaveLength(1);

    const anotherOrder = seedFundedOrder({ status: 'COMPLETED', released: true, amount: '75.00' });
    await expect(PayoutService.request('seller', anotherOrder.order.id, 'payout_blocked_paid_recovery_1')).rejects.toThrow(/recovery/i);
  });
});

describe('PR #27 F-07: Failed PaymentIntent Creation & Abandoned Transaction Recovery', () => {
  it('marks definite Stripe 4xx rejection as FAILED, allows safe retry and clean cancellation without 409 deadlock', async () => {
    const order = seedPendingOrder();
    const stripe400 = Object.assign(new Error('Invalid payment method parameters'), {
      statusCode: 400,
      type: 'StripeInvalidRequestError',
    });
    const createSpy = vi.spyOn(stripe.paymentIntents, 'create').mockRejectedValueOnce(stripe400);

    await expect(PaymentService.createPaymentIntent('buyer', order.id)).rejects.toThrow('Invalid payment method');
    const failedTx = [...store.transactions.values()].find(t => t.orderId === order.id)!;
    expect(failedTx.status).toBe('FAILED');
    expect(failedTx.stripePaymentId).toBeNull();
    expect([...store.entries.values()].some(e => e.type === 'PAYMENT_INTENT_CREATION_FAILED')).toBe(true);

    // Retry creates a fresh durable attempt with a new idempotency key and succeeds.
    createSpy.mockResolvedValueOnce({
      id: 'pi_retry_ok_1',
      object: 'payment_intent',
      amount: 10000,
      currency: 'usd',
      status: 'requires_payment_method',
      client_secret: 'secret_retry_ok_1',
      metadata: { orderId: order.id, buyerId: 'buyer' },
    } as unknown as Stripe.Response<Stripe.PaymentIntent>);

    const retried = await PaymentService.createPaymentIntent('buyer', order.id);
    expect(retried).toEqual({ clientSecret: 'secret_retry_ok_1' });
    expect(createSpy).toHaveBeenCalledTimes(2);
    expect(createSpy.mock.calls[0]![1]!.idempotencyKey).not.toBe(createSpy.mock.calls[1]![1]!.idempotencyKey);

    // Duplicate payment request reuses the live PaymentIntent without creating a second charge.
    const retrieveSpy = vi.spyOn(stripe.paymentIntents, 'retrieve').mockResolvedValueOnce({
      id: 'pi_retry_ok_1',
      object: 'payment_intent',
      amount: 10000,
      currency: 'usd',
      status: 'requires_payment_method',
      client_secret: 'secret_retry_ok_1',
      metadata: { orderId: order.id, buyerId: 'buyer' },
    } as unknown as Stripe.Response<Stripe.PaymentIntent>);
    expect(await PaymentService.createPaymentIntent('buyer', order.id)).toEqual({ clientSecret: 'secret_retry_ok_1' });
    expect(retrieveSpy).toHaveBeenCalledWith('pi_retry_ok_1');
    expect(createSpy).toHaveBeenCalledTimes(2);
  });

  it('allows both local order cancel and cancel-payment after failed PI creation, and recovers abandoned >23h unbound attempts', async () => {
    // 1. Cancellation after definite failed PI creation via cancelPayment.
    const order1 = seedPendingOrder();
    const stripe400 = Object.assign(new Error('Card config invalid'), { statusCode: 400, type: 'StripeInvalidRequestError' });
    vi.spyOn(stripe.paymentIntents, 'create').mockRejectedValueOnce(stripe400);
    await expect(PaymentService.createPaymentIntent('buyer', order1.id)).rejects.toThrow();
    const cancelled1 = await PaymentService.cancelPayment('buyer', order1.id);
    expect(cancelled1.status).toBe('CANCELLED');

    // 2. Cancellation after definite failed PI creation via OrderService.operate('cancel').
    const order2 = seedPendingOrder();
    vi.spyOn(stripe.paymentIntents, 'create').mockRejectedValueOnce(stripe400);
    await expect(PaymentService.createPaymentIntent('buyer', order2.id)).rejects.toThrow();
    const cancelled2 = await OrderService.operate('buyer', order2.id, 'cancel');
    expect(cancelled2.status).toBe('CANCELLED');

    // 3. Abandoned >23h unbound PENDING attempt confirmed absent at Stripe recovers and creates a new intent.
    const order3 = seedPendingOrder();
    const oldTx: TxRec = {
      id: nextId('ctx'),
      orderId: order3.id,
      stripePaymentId: null,
      amount: order3.amount,
      refundedAmount: new Prisma.Decimal(0),
      currency: 'usd',
      status: 'PENDING',
      attemptKey: `payment:${order3.id}:old`,
      createdAt: new Date(Date.now() - 25 * 3600000),
    };
    store.transactions.set(oldTx.id, oldTx);
    vi.spyOn(stripe.paymentIntents, 'list').mockResolvedValueOnce({
      data: [],
      has_more: false,
    } as unknown as Stripe.Response<Stripe.ApiList<Stripe.PaymentIntent>>);
    vi.spyOn(stripe.paymentIntents, 'create').mockResolvedValueOnce({
      id: 'pi_after_abandoned_1',
      object: 'payment_intent',
      amount: 10000,
      currency: 'usd',
      status: 'requires_payment_method',
      client_secret: 'secret_after_abandoned',
      metadata: { orderId: order3.id, buyerId: 'buyer' },
    } as unknown as Stripe.Response<Stripe.PaymentIntent>);

    const recovered = await PaymentService.createPaymentIntent('buyer', order3.id);
    expect(recovered).toEqual({ clientSecret: 'secret_after_abandoned' });
    expect(store.transactions.get(oldTx.id)!.status).toBe('FAILED');
    expect([...store.entries.values()].some(e => e.type === 'PAYMENT_ATTEMPT_ABANDONED')).toBe(true);
  });
});

describe('PR #27 F-08: Refund Failure, Retry & Dispute Deadlock Recovery', () => {
  it('unblocks dispute resolution retry after Stripe refund failure and prevents duplicate successful refunds', async () => {
    const { order, paymentId } = seedFundedOrder({ status: 'PAID', released: false });
    await DisputeService.open('buyer', order.id, 'DELIVERY', 'Missing work deliverables');

    // Admin resolves for buyer -> reserves first dispute refund.
    const firstRes = await DisputeService.resolve('admin', order.id, 'BUYER', 'Buyer refund approved');
    expect(firstRes.status).toBe('UNDER_REVIEW');
    const firstRefund = [...store.refunds.values()].find(r => r.orderId === order.id)!;

    // Stripe returns failed refund.
    vi.spyOn(stripe.refunds, 'create').mockResolvedValueOnce({
      id: 're_failed_1',
      object: 'refund',
      amount: 10000,
      currency: 'usd',
      payment_intent: paymentId,
      status: 'failed',
      metadata: { refundId: firstRefund.id, orderId: order.id },
    } as unknown as Stripe.Response<Stripe.Refund>);
    const failedResult = await RefundService.process('admin', firstRefund.id);
    expect(failedResult.status).toBe('FAILED');

    // Dispute is NOT permanently deadlocked: admin can retry BUYER resolution cleanly.
    const retryDispute = await DisputeService.resolve('admin', order.id, 'BUYER', 'Retry buyer refund after Stripe failure');
    expect(retryDispute.status).toBe('UNDER_REVIEW');
    const allRefunds = [...store.refunds.values()].filter(r => r.orderId === order.id);
    expect(allRefunds).toHaveLength(2);
    const secondRefund = allRefunds[1]!;
    expect(secondRefund.requestKey).toBe(`dispute_${firstRes.id}_retry_1`);

    // Second refund succeeds.
    const okPayload = {
      id: 're_succeeded_2',
      object: 'refund',
      amount: 10000,
      currency: 'usd',
      payment_intent: paymentId,
      status: 'succeeded',
      metadata: { refundId: secondRefund.id, orderId: order.id },
    };
    vi.spyOn(stripe.refunds, 'create').mockResolvedValueOnce(okPayload as unknown as Stripe.Response<Stripe.Refund>);
    const succeeded = await RefundService.process('admin', secondRefund.id);
    expect(succeeded.status).toBe('SUCCEEDED');
    expect(store.orders.get(order.id)!.status).toBe('REFUNDED');
    expect(store.disputes.get(firstRes.id)!.status).toBe('RESOLVED_BUYER');

    // Duplicate refund webhook event cannot reverse money twice.
    await RefundService.handleEvent({
      id: 'evt_dup_refund_1',
      object: 'event',
      type: 'refund.updated',
      livemode: false,
      data: { object: okPayload },
    } as unknown as Stripe.Event);
    expect([...store.entries.values()].filter(e => e.type === 'REFUND')).toHaveLength(1);

    // Retrying a SUCCEEDED refund is rejected.
    await expect(RefundService.retry('admin', secondRefund.id, 'retry_succeeded_should_fail')).rejects.toThrow('failed or cancelled');
  });

  it('transitions refund to FAILED on definite Stripe 4xx rejection and supports RefundService.retry', async () => {
    const { order } = seedFundedOrder({ status: 'PAID', released: false });
    const reqRefund = await RefundService.request('buyer', order.id, undefined, 'Buyer cancellation', 'buyer_cancel_refund_1');
    const stripe400 = Object.assign(new Error('Charge cannot be refunded'), { statusCode: 400, type: 'StripeInvalidRequestError' });
    vi.spyOn(stripe.refunds, 'create').mockRejectedValueOnce(stripe400);

    await expect(RefundService.process('admin', reqRefund.id)).rejects.toThrow('Charge cannot be refunded');
    expect(store.refunds.get(reqRefund.id)!.status).toBe('FAILED');

    const retried = await RefundService.retry('admin', reqRefund.id, 'admin_retry_refund_key_1');
    expect(retried.status).toBe('PENDING');
    expect(retried.id).not.toBe(reqRefund.id);
  });
});

describe('PR #27 F-10: Paginated, Bounded, Read-Only Reconciliation', () => {
  it('reconciles >50 records with real ledgersChecked, multi-page refunds, missing local and unmatched remote Stripe payments', async () => {
    // Seed 55 captured orders/transactions (> 50 old hard cap).
    const seededIds: string[] = [];
    for (let i = 0; i < 55; i++) {
      const { paymentId } = seedFundedOrder({ status: 'PAID', released: false, amount: '20.00', paymentId: `pi_batch_${i}` });
      seededIds.push(paymentId);
    }
    // Seed 1 local transaction whose Stripe PI is missing remotely (404).
    const missingRemote = seedFundedOrder({ status: 'PAID', released: false, amount: '50.00', paymentId: 'pi_missing_remote_1' });

    // Stripe list returns first 55 + 1 unmatched Stripe payment (MISSING_LOCAL_TRANSACTION).
    vi.spyOn(stripe.paymentIntents, 'list').mockResolvedValueOnce({
      data: [
        ...seededIds.map(id => ({ id, amount: 2000, currency: 'usd', status: 'succeeded', metadata: {} })),
        { id: 'pi_orphan_stripe_only', amount: 7500, currency: 'usd', status: 'succeeded', metadata: { orderId: 'ord_missing_local' } },
      ],
      has_more: false,
    } as unknown as Stripe.Response<Stripe.ApiList<Stripe.PaymentIntent>>);

    // Missing remote PI throws Stripe 404 resource_missing.
    vi.spyOn(stripe.paymentIntents, 'retrieve').mockImplementation(async (id: string) => {
      if (id === missingRemote.paymentId) {
        throw Object.assign(new Error('No such payment_intent'), { statusCode: 404, code: 'resource_missing' });
      }
      throw new Error(`Unexpected retrieve ${id}`);
    });

    // Multi-page refunds on pi_batch_0 (2 pages totaling $5.00 vs local $0.00 -> REFUND_MISMATCH).
    vi.spyOn(stripe.refunds, 'list').mockImplementation(async (params?: Stripe.RefundListParams) => {
      if (params?.payment_intent === 'pi_batch_0') {
        if (!params.starting_after) {
          return {
            data: [{ id: 're_p1', amount: 300, status: 'succeeded' }],
            has_more: true,
          } as unknown as Stripe.Response<Stripe.ApiList<Stripe.Refund>>;
        }
        return {
          data: [{ id: 're_p2', amount: 200, status: 'succeeded' }],
          has_more: false,
        } as unknown as Stripe.Response<Stripe.ApiList<Stripe.Refund>>;
      }
      return { data: [], has_more: false } as unknown as Stripe.Response<Stripe.ApiList<Stripe.Refund>>;
    });

    // Non-admin blocked with 403.
    const forbidden = await request(app)
      .post('/api/v1/financial/admin/reconciliation/report')
      .set('Authorization', 'Bearer buyer')
      .send({ limit: 60 });
    expect(forbidden.status).toBe(403);

    const report = await runAdminReconciliationReport({ limit: 60 });
    expect(report.readOnly).toBe(true);
    expect(report.summary.localTransactionsChecked).toBe(56);
    expect(report.summary.ledgersChecked).toBe(56);
    expect(report.summary.healthy).toBe(false);
    expect(report.pagination.limit).toBe(60);
    expect(report.pagination.hasMoreLocal).toBe(false);

    const codes = report.findings.map(f => f.code);
    expect(codes).toContain('MISSING_LOCAL_TRANSACTION');
    expect(codes).toContain('MISSING_REMOTE_TRANSACTION');
    expect(codes).toContain('REFUND_MISMATCH');
    const refundFinding = report.findings.find(f => f.code === 'REFUND_MISMATCH')!;
    expect(refundFinding.detail).toContain('remoteRefunded=500c');
  });
});

describe('PR #27 F-11: Server-Side Payout Eligibility Guards & Active Kill Switch', () => {
  it.each([
    { label: 'KYC pending', patch: { verificationStatus: 'PENDING' as VerificationStatus }, expectedReason: 'KYC_NOT_APPROVED' },
    { label: 'KYC rejected', patch: { verificationStatus: 'REJECTED' as VerificationStatus }, expectedReason: 'KYC_NOT_APPROVED' },
    { label: 'Seller profile suspended', patch: { status: 'SUSPENDED' as SellerStatus }, expectedReason: 'SELLER_PROFILE_NOT_APPROVED' },
    { label: 'Seller account suspended', patch: { accountStatus: 'SUSPENDED' as AccountStatus }, expectedReason: 'ACCOUNT_NOT_ACTIVE' },
    { label: 'Stripe Connect missing', patch: { stripeAccountId: null }, expectedReason: 'STRIPE_CONNECT_ACCOUNT_MISSING' },
  ])('blocks PayoutService.request when $label', async ({ patch, expectedReason }) => {
    const { order } = seedFundedOrder({ status: 'COMPLETED', released: true });
    Object.assign(store.sellers.get('sp_1')!, patch);

    await expect(PayoutService.request('seller', order.id, 'payout_blocked_eligibility_1')).rejects.toThrow(expectedReason);
    expect(store.payouts.size).toBe(0);
  });

  it('keeps the payout kill switch unconditionally active on admin processing', async () => {
    const { order } = seedFundedOrder({ status: 'COMPLETED', released: true });
    const reserved = await PayoutService.request('seller', order.id, 'payout_eligible_killswitch_1');
    expect(reserved.status).toBe('PENDING');

    const res = await request(app)
      .post(`/api/v1/financial/admin/payouts/${reserved.id}/process`)
      .set('Authorization', 'Bearer admin')
      .send({});
    expect(res.status).toBe(503);
    expect(res.body.error.message).toContain('Payout provider validation required');
  });
});
