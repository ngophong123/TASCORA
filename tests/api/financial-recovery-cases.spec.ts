import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Prisma, type AccountStatus, type OrderStatus, type PayoutStatus, type SellerStatus, type TransactionStatus, type VerificationStatus } from '@prisma/client';
import express from 'express';
import request from 'supertest';

type UserRec = { id: string; role: 'BUYER' | 'SELLER' | 'ADMIN'; status: AccountStatus; email: string };
type SellerRec = { id: string; userId: string; firstName: string; lastName: string; status: SellerStatus; verificationStatus: VerificationStatus; stripeAccountId: string | null };
type OrderRec = { id: string; buyerId: string; sellerId: string; amount: Prisma.Decimal; currency: string; platformFeeBps: number; purchaseSnapshot: Record<string, unknown>; status: OrderStatus; completedAt: Date | null; createdAt: Date };
type DisputeRec = { id: string; orderId: string; openedBy: string; category: string; description: string; status: string; resolutionReason: string | null; resolvedAt: Date | null; providerDisputeId: string | null; providerStatus: string | null; lastProviderEventId: string | null; lastProviderEventType: string | null; lastProviderEventCreated: number | null; recoveryRequired: boolean; createdAt: Date; updatedAt: Date };
type CaseRec = { id: string; disputeId: string; orderId: string; sellerProfileId: string; assignedAdminId: string | null; status: string; recoveryAmount: Prisma.Decimal; currency: string; lastActivityAt: Date; createdAt: Date; updatedAt: Date };
type CaseEventRec = { id: string; recoveryCaseId: string; eventKey: string | null; actorId: string | null; type: string; previousStatus: string | null; nextStatus: string | null; assignedAdminId: string | null; note: string | null; evidenceRef: string | null; metadata: unknown; createdAt: Date };
type EntryRec = { id: string; eventKey: string; orderId: string; type: string; actorId: string | null; providerId: string | null; reason: string | null; amount: Prisma.Decimal; pendingDelta: Prisma.Decimal; availableDelta: Prisma.Decimal; reservedDelta: Prisma.Decimal; paidDelta: Prisma.Decimal; feeDelta: Prisma.Decimal; createdAt: Date };
type PayoutRec = { id: string; escrowId: string; sellerProfileId: string; amount: Prisma.Decimal; status: PayoutStatus; attempt: number; failureReason: string | null; createdAt: Date; updatedAt: Date };

const state = vi.hoisted(() => ({
  seq: 0,
  users: new Map<string, UserRec>(),
  sellers: new Map<string, SellerRec>(),
  orders: new Map<string, OrderRec>(),
  disputes: new Map<string, DisputeRec>(),
  cases: new Map<string, CaseRec>(),
  events: new Map<string, CaseEventRec>(),
  entries: new Map<string, EntryRec>(),
  payouts: new Map<string, PayoutRec>(),
  auditLogs: [] as Array<Record<string, unknown>>,
}));

function nextId(prefix: string) {
  state.seq += 1;
  return `${prefix}${String(state.seq).padStart(18, '0')}`;
}

function resetState() {
  state.seq = 0;
  state.users.clear();
  state.sellers.clear();
  state.orders.clear();
  state.disputes.clear();
  state.cases.clear();
  state.events.clear();
  state.entries.clear();
  state.payouts.clear();
  state.auditLogs.length = 0;

  state.users.set('buyer', { id: 'buyer', role: 'BUYER', status: 'ACTIVE', email: 'buyer-pii@example.test' });
  state.users.set('seller', { id: 'seller', role: 'SELLER', status: 'ACTIVE', email: 'seller-pii@example.test' });
  state.users.set('admin1', { id: 'admin1', role: 'ADMIN', status: 'ACTIVE', email: 'admin1-pii@example.test' });
  state.users.set('admin2', { id: 'admin2', role: 'ADMIN', status: 'ACTIVE', email: 'admin2-pii@example.test' });
  state.users.set('admin_suspended', { id: 'admin_suspended', role: 'ADMIN', status: 'SUSPENDED', email: 'suspended@example.test' });

  state.sellers.set('sp_1', {
    id: 'sp_1',
    userId: 'seller',
    firstName: 'Ada',
    lastName: 'Lovelace',
    status: 'APPROVED',
    verificationStatus: 'APPROVED',
    stripeAccountId: 'acct_test_verified',
  });
}

function seedRecoveryCase(
  overrides: {
    amount?: string;
    status?: string;
    assignedAdminId?: string | null;
    providerDisputeId?: string;
    recoveryRequired?: boolean;
  } = {}
) {
  const orderId = nextId('cord');
  const disputeId = nextId('cdsp');
  const caseId = `frc_${disputeId}`;
  const amount = new Prisma.Decimal(overrides.amount ?? '100.00');
  const now = new Date(Date.now() + state.seq * 1000);

  state.orders.set(orderId, {
    id: orderId,
    buyerId: 'buyer',
    sellerId: 'sp_1',
    amount,
    currency: 'usd',
    platformFeeBps: 1000,
    purchaseSnapshot: { deliveryDays: 2, revisions: 1 },
    status: 'DISPUTED',
    completedAt: now,
    createdAt: now,
  });

  state.disputes.set(disputeId, {
    id: disputeId,
    orderId,
    openedBy: 'buyer',
    category: 'PAYMENT_CHARGEBACK',
    description: 'Stripe dispute closed (lost); financial recovery required',
    status: 'UNDER_REVIEW',
    resolutionReason: 'Stripe dispute closed (lost); financial recovery required',
    resolvedAt: null,
    providerDisputeId: overrides.providerDisputeId ?? `dp_${state.seq}`,
    providerStatus: 'lost',
    lastProviderEventId: `evt_${state.seq}`,
    lastProviderEventType: 'charge.dispute.closed',
    lastProviderEventCreated: 1_700_000_900,
    recoveryRequired: overrides.recoveryRequired ?? true,
    createdAt: now,
    updatedAt: now,
  });

  state.entries.set(nextId('cfe'), {
    id: nextId('cfe'),
    eventKey: `payment:${orderId}:received`,
    orderId,
    type: 'PAYMENT_RECEIVED',
    actorId: null,
    providerId: `pi_${orderId}`,
    reason: null,
    amount,
    pendingDelta: new Prisma.Decimal(0),
    availableDelta: new Prisma.Decimal(0),
    reservedDelta: new Prisma.Decimal('90.00'),
    paidDelta: new Prisma.Decimal(0),
    feeDelta: new Prisma.Decimal('10.00'),
    createdAt: now,
  });

  state.entries.set(nextId('cfe'), {
    id: nextId('cfe'),
    eventKey: `chargeback-loss:${disputeId}`,
    orderId,
    type: 'CHARGEBACK_RECOVERY_REQUIRED',
    actorId: null,
    providerId: overrides.providerDisputeId ?? `dp_${state.seq}`,
    reason: 'Stripe dispute lost; financial recovery required',
    amount,
    pendingDelta: new Prisma.Decimal(0),
    availableDelta: new Prisma.Decimal(0),
    reservedDelta: new Prisma.Decimal(0),
    paidDelta: new Prisma.Decimal(0),
    feeDelta: new Prisma.Decimal(0),
    createdAt: now,
  });

  const rec: CaseRec = {
    id: caseId,
    disputeId,
    orderId,
    sellerProfileId: 'sp_1',
    assignedAdminId: overrides.assignedAdminId ?? null,
    status: overrides.status ?? 'OPEN',
    recoveryAmount: amount,
    currency: 'usd',
    lastActivityAt: now,
    createdAt: now,
    updatedAt: now,
  };
  state.cases.set(caseId, rec);

  const openEvt: CaseEventRec = {
    id: nextId('cfre'),
    recoveryCaseId: caseId,
    eventKey: `recovery-case:${disputeId}:opened`,
    actorId: null,
    type: 'CASE_OPENED',
    previousStatus: null,
    nextStatus: 'OPEN',
    assignedAdminId: null,
    note: 'Recovery case opened automatically',
    evidenceRef: null,
    metadata: null,
    createdAt: now,
  };
  state.events.set(openEvt.id, openEvt);

  return { orderId, disputeId, caseId };
}

function hydrateCase(c: CaseRec) {
  const dispute = state.disputes.get(c.disputeId)!;
  const seller = state.sellers.get(c.sellerProfileId)!;
  const order = state.orders.get(c.orderId)!;
  const assignedAdmin = c.assignedAdminId ? state.users.get(c.assignedAdminId) ?? null : null;
  const entries = [...state.entries.values()].filter(e => e.orderId === c.orderId);
  const events = [...state.events.values()]
    .filter(e => e.recoveryCaseId === c.id)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime() || b.id.localeCompare(a.id))
    .map(e => ({
      ...e,
      actor: e.actorId ? { id: e.actorId, role: state.users.get(e.actorId)?.role ?? 'ADMIN' } : null,
    }));
  const payout = [...state.payouts.values()].find(p => p.sellerProfileId === c.sellerProfileId) ?? null;

  return {
    ...c,
    dispute,
    seller,
    assignedAdmin: assignedAdmin ? { id: assignedAdmin.id, role: assignedAdmin.role } : null,
    order: {
      ...order,
      transactions: [
        {
          id: `tx_${order.id}`,
          stripePaymentId: `pi_${order.id}`,
          amount: order.amount,
          refundedAmount: new Prisma.Decimal(0),
          currency: 'usd',
          status: 'SUCCEEDED' as TransactionStatus,
          createdAt: order.createdAt,
        },
      ],
      refunds: [],
      escrow: {
        id: `esc_${order.id}`,
        amount: order.amount,
        released: true,
        releasedAt: order.completedAt,
        payout,
      },
      financialEntries: entries,
    },
    events,
  };
}

vi.mock('../../apps/api/src/lib/prisma', () => {
  const client = {
    $queryRaw: vi.fn(async () => [{ '?column?': 1 }]),
    user: {
      findUnique: vi.fn(async ({ where }: { where: { id: string } }) => state.users.get(where.id) ?? null),
      findMany: vi.fn(async ({ where }: { where?: { role?: string; status?: string } }) =>
        [...state.users.values()]
          .filter(u => (!where?.role || u.role === where.role) && (!where?.status || u.status === where.status))
          .map(u => ({ id: u.id, role: u.role }))
      ),
    },
    sellerProfile: {
      findUnique: vi.fn(async ({ where }: { where: { id?: string; userId?: string } }) => {
        const s = where.id
          ? state.sellers.get(where.id)
          : [...state.sellers.values()].find(item => item.userId === where.userId);
        if (!s) return null;
        const u = state.users.get(s.userId)!;
        return { ...s, user: { status: u.status } };
      }),
    },
    order: {
      findUnique: vi.fn(async ({ where }: { where: { id: string } }) => {
        const o = state.orders.get(where.id);
        if (!o) return null;
        const s = state.sellers.get(o.sellerId)!;
        const d = [...state.disputes.values()].find(item => item.orderId === o.id) ?? null;
        return {
          ...o,
          seller: { userId: s.userId },
          escrow: { id: `esc_${o.id}`, orderId: o.id, released: true },
          dispute: d,
          deliveries: [],
          revisions: [],
          refunds: [],
        };
      }),
    },
    marketplaceDispute: {
      count: vi.fn(async ({ where }: { where?: { order?: { sellerId?: string }; recoveryRequired?: boolean } }) =>
        [...state.disputes.values()].filter(d => {
          if (where?.recoveryRequired !== undefined && d.recoveryRequired !== where.recoveryRequired) return false;
          if (where?.order?.sellerId) {
            const ord = state.orders.get(d.orderId);
            if (!ord || ord.sellerId !== where.order.sellerId) return false;
          }
          return true;
        }).length
      ),
    },
    financialEntry: {
      findMany: vi.fn(async (args?: { where?: { orderId?: { in?: string[] }; notifyUserId?: { not: null } } }) => {
        if (args?.where?.notifyUserId) return [];
        const list = [...state.entries.values()];
        if (args?.where?.orderId?.in) {
          const set = new Set(args.where.orderId.in);
          return list.filter(e => set.has(e.orderId));
        }
        return list;
      }),
      findUnique: vi.fn(async () => null),
      aggregate: vi.fn(async ({ where }: { where: { orderId: string } }) => {
        const list = [...state.entries.values()].filter(e => e.orderId === where.orderId);
        const sum = (f: 'pendingDelta' | 'availableDelta' | 'reservedDelta' | 'paidDelta') =>
          list.reduce((acc, e) => acc.add(e[f]), new Prisma.Decimal(0));
        return { _sum: { pendingDelta: sum('pendingDelta'), availableDelta: sum('availableDelta'), reservedDelta: sum('reservedDelta'), paidDelta: sum('paidDelta') } };
      }),
    },
    financialRecoveryCase: {
      count: vi.fn(async (args?: { where?: Record<string, unknown> }) => {
        return filterCases(args?.where).length;
      }),
      aggregate: vi.fn(async (args?: { where?: Record<string, unknown> }) => {
        const list = filterCases(args?.where);
        const sum =
          list.length > 0
            ? list.reduce((acc, item) => acc.add(item.recoveryAmount), new Prisma.Decimal(0))
            : null;
        return {
          _count: { _all: list.length },
          _sum: { recoveryAmount: sum },
        };
      }),
      groupBy: vi.fn(async (args?: { by: string[]; where?: Record<string, unknown> }) => {
        const list = filterCases(args?.where);
        const buckets = new Map<string, number>();
        for (const item of list) {
          buckets.set(item.status, (buckets.get(item.status) ?? 0) + 1);
        }
        return [...buckets.entries()].map(([status, count]) => ({
          status,
          _count: { _all: count },
        }));
      }),
      findMany: vi.fn(async (args?: { where?: Record<string, unknown>; skip?: number; take?: number; orderBy?: Array<Record<string, 'asc' | 'desc'>> }) => {
        let list = filterCases(args?.where).map(hydrateCase);
        const primary = args?.orderBy?.[0];
        if (primary) {
          const [field, dir] = Object.entries(primary)[0]!;
          list.sort((a, b) => {
            const av = field === 'recoveryAmount' ? a.recoveryAmount.toNumber() : new Date(a[field as 'lastActivityAt' | 'createdAt']).getTime();
            const bv = field === 'recoveryAmount' ? b.recoveryAmount.toNumber() : new Date(b[field as 'lastActivityAt' | 'createdAt']).getTime();
            return dir === 'asc' ? av - bv : bv - av;
          });
        }
        if (args?.skip !== undefined) list = list.slice(args.skip);
        if (args?.take !== undefined) list = list.slice(0, args.take);
        return list;
      }),
      findUnique: vi.fn(async ({ where }: { where: { id?: string; disputeId?: string } }) => {
        const rec = where.id
          ? state.cases.get(where.id)
          : [...state.cases.values()].find(c => c.disputeId === where.disputeId);
        return rec ? hydrateCase(rec) : null;
      }),
      update: vi.fn(async ({ where, data }: { where: { id: string }; data: Partial<CaseRec> }) => {
        const rec = state.cases.get(where.id)!;
        Object.assign(rec, data, { updatedAt: new Date() });
        return rec;
      }),
    },
    financialRecoveryEvent: {
      findUnique: vi.fn(async ({ where }: { where: { eventKey?: string } }) => {
        if (!where.eventKey) return null;
        return [...state.events.values()].find(e => e.eventKey === where.eventKey) ?? null;
      }),
      create: vi.fn(async ({ data }: { data: Partial<CaseEventRec> & { recoveryCaseId: string; type: string } }) => {
        const rec: CaseEventRec = {
          id: nextId('cfre'),
          recoveryCaseId: data.recoveryCaseId,
          eventKey: data.eventKey ?? null,
          actorId: data.actorId ?? null,
          type: data.type,
          previousStatus: data.previousStatus ?? null,
          nextStatus: data.nextStatus ?? null,
          assignedAdminId: data.assignedAdminId ?? null,
          note: data.note ?? null,
          evidenceRef: data.evidenceRef ?? null,
          metadata: data.metadata ?? null,
          createdAt: new Date(),
        };
        state.events.set(rec.id, rec);
        return {
          ...rec,
          actor: rec.actorId ? { id: rec.actorId, role: state.users.get(rec.actorId)?.role ?? 'ADMIN' } : null,
        };
      }),
    },
    adminAuditLog: {
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
        state.auditLogs.push(data);
        return { id: nextId('caud'), ...data };
      }),
    },
  };

  function filterCases(where?: Record<string, unknown>) {
    return [...state.cases.values()].filter(c => {
      if (!where) return true;
      if (typeof where.status === 'string' && c.status !== where.status) return false;
      if ('assignedAdminId' in where) {
        if (where.assignedAdminId === null && c.assignedAdminId !== null) return false;
        if (typeof where.assignedAdminId === 'string' && c.assignedAdminId !== where.assignedAdminId) return false;
      }
      if (typeof where.sellerProfileId === 'string' && c.sellerProfileId !== where.sellerProfileId) return false;
      if (where.dispute && typeof where.dispute === 'object') {
        const dispFilter = where.dispute as { recoveryRequired?: boolean; is?: { recoveryRequired?: boolean } };
        const expectedRecoveryRequired = dispFilter.recoveryRequired ?? dispFilter.is?.recoveryRequired;
        if (typeof expectedRecoveryRequired === 'boolean') {
          const disp = state.disputes.get(c.disputeId);
          if (!disp || disp.recoveryRequired !== expectedRecoveryRequired) return false;
        }
      }
      if (Array.isArray(where.OR)) {
        const q = String((where.OR[0] as { id?: { contains?: string } })?.id?.contains ?? '').toLowerCase();
        const disp = state.disputes.get(c.disputeId);
        const hay = `${c.id} ${c.orderId} ${c.disputeId} ${c.sellerProfileId} ${disp?.providerDisputeId ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  return {
    prisma: {
      ...client,
      $transaction: async <T>(fn: (tx: typeof client) => Promise<T>) => fn(client),
    },
  };
});

vi.mock('../../apps/api/src/middlewares/requireAuth', () => ({
  requireAuth: (req: express.Request & { user?: { userId: string; role: string } }, res: express.Response, next: express.NextFunction) => {
    const actor = req.headers.authorization?.replace('Bearer ', '');
    if (!actor) return res.status(401).json({ success: false, error: 'Authentication required' });
    const u = state.users.get(actor);
    req.user = { userId: actor, role: u?.role ?? 'BUYER' };
    next();
  },
}));

import financialRouter from '../../apps/api/src/modules/financial/financial.route';
import { PayoutService } from '../../apps/api/src/modules/financial/payout.service';
import { prisma } from '../../apps/api/src/lib/prisma';

const app = express();
app.use(express.json());
app.use('/api/v1/financial', financialRouter);
app.use((err: Error & { status?: number; code?: string }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(err.status || 500).json({ success: false, error: { code: err.code || 'ERROR', message: err.message } });
});

beforeEach(() => {
  resetState();
  vi.stubEnv('APP_ENV', 'test');
  vi.stubEnv('PAYMENTS_PROVIDER', 'stripe');
  vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_recovery_api');
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('Admin Financial Recovery Cases API & Financial Safety Boundaries', () => {
  it('enforces authentication, admin role, and active financial administrator authorization', async () => {
    const { caseId } = seedRecoveryCase();

    // Unauthenticated -> 401
    expect((await request(app).get('/api/v1/financial/admin/recovery-cases')).status).toBe(401);
    expect((await request(app).get(`/api/v1/financial/admin/recovery-cases/${caseId}`)).status).toBe(401);

    // Non-admin (buyer/seller) -> 403
    expect(
      (await request(app).get('/api/v1/financial/admin/recovery-cases').set('Authorization', 'Bearer buyer')).status
    ).toBe(403);
    expect(
      (await request(app).patch(`/api/v1/financial/admin/recovery-cases/${caseId}/status`).set('Authorization', 'Bearer seller').send({ status: 'INVESTIGATING', reason: 'Unauthorized attempt' })).status
    ).toBe(403);

    // Suspended admin -> 403 from requireFinancialAdmin
    expect(
      (await request(app).get('/api/v1/financial/admin/recovery-cases').set('Authorization', 'Bearer admin_suspended')).status
    ).toBe(403);
  });

  it('lists, filters, paginates, and returns case details without exposing personal email PII', async () => {
    const c1 = seedRecoveryCase({ amount: '120.00', status: 'OPEN', providerDisputeId: 'dp_alpha' });
    seedRecoveryCase({ amount: '80.50', status: 'INVESTIGATING', assignedAdminId: 'admin1', providerDisputeId: 'dp_beta' });

    const listRes = await request(app)
      .get('/api/v1/financial/admin/recovery-cases?limit=1&page=1&sortBy=recoveryAmount&sortOrder=desc')
      .set('Authorization', 'Bearer admin1');
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.overview.totalCases).toBe(2);
    expect(listRes.body.data.overview.totalRecoveryAmount).toBe('200.50');
    expect(listRes.body.data.overview.unassignedCount).toBe(1);
    expect(listRes.body.data.overview.activeFinancialHoldCount).toBe(2);
    expect(listRes.body.data.overview.externalPayoutsDisabled).toBe(true);
    expect(listRes.body.data.items).toHaveLength(1);
    expect(listRes.body.data.meta).toEqual({ total: 2, page: 1, limit: 1, totalPages: 2 });
    expect(JSON.stringify(listRes.body)).not.toContain('seller-pii@example.test');
    expect(JSON.stringify(listRes.body)).not.toContain('buyer-pii@example.test');
    expect(JSON.stringify(listRes.body)).not.toContain('admin1-pii@example.test');

    // Filter by search
    const searchRes = await request(app)
      .get('/api/v1/financial/admin/recovery-cases?search=dp_alpha')
      .set('Authorization', 'Bearer admin1');
    expect(searchRes.status).toBe(200);
    expect(searchRes.body.data.items).toHaveLength(1);
    expect(searchRes.body.data.items[0].id).toBe(c1.caseId);

    // Detail endpoint
    const detailRes = await request(app)
      .get(`/api/v1/financial/admin/recovery-cases/${c1.caseId}`)
      .set('Authorization', 'Bearer admin1');
    expect(detailRes.status).toBe(200);
    expect(detailRes.body.data.recoveryCase.financialHoldActive).toBe(true);
    expect(detailRes.body.data.recoveryCase.allowedNextStatuses).toEqual(['INVESTIGATING', 'AWAITING_EVIDENCE']);
    expect(detailRes.body.data.balances.reserved).toBe('90.00');
    expect(detailRes.body.data.ledgerHistory).toHaveLength(2);
    expect(detailRes.body.data.timeline).toHaveLength(1);
    expect(JSON.stringify(detailRes.body)).not.toContain('seller-pii@example.test');
    expect(state.auditLogs.some(l => l.action === 'RECOVERY_CASE_VIEWED')).toBe(true);

    // Unknown case -> 404, malformed ID -> 400
    expect(
      (await request(app).get('/api/v1/financial/admin/recovery-cases/frc_missing_case_01').set('Authorization', 'Bearer admin1')).status
    ).toBe(404);
    expect(
      (await request(app).get('/api/v1/financial/admin/recovery-cases/bad').set('Authorization', 'Bearer admin1')).status
    ).toBe(400);
  });

  it('supports assignment, notes, evidence attachment, status transitions, idempotency, and NEVER clears financial holds or balances', async () => {
    const { caseId, orderId, disputeId } = seedRecoveryCase({ amount: '100.00' });
    const initialEntryCount = state.entries.size;

    // 1. Assign active admin (rejects non-admin / suspended admin)
    expect(
      (await request(app).patch(`/api/v1/financial/admin/recovery-cases/${caseId}/assign`).set('Authorization', 'Bearer admin1').send({ assignedAdminId: 'seller' })).status
    ).toBe(400);
    expect(
      (await request(app).patch(`/api/v1/financial/admin/recovery-cases/${caseId}/assign`).set('Authorization', 'Bearer admin1').send({ assignedAdminId: 'admin_suspended' })).status
    ).toBe(400);

    const assigned = await request(app)
      .patch(`/api/v1/financial/admin/recovery-cases/${caseId}/assign`)
      .set('Authorization', 'Bearer admin1')
      .send({ assignedAdminId: 'admin2', note: 'Assigning to finance lead', idempotencyKey: 'assign_key_valid_001' });
    expect(assigned.status).toBe(200);
    expect(state.cases.get(caseId)!.assignedAdminId).toBe('admin2');

    // Duplicate idempotent assign does not create duplicate event; conflicting payload -> 409
    const dupAssign = await request(app)
      .patch(`/api/v1/financial/admin/recovery-cases/${caseId}/assign`)
      .set('Authorization', 'Bearer admin1')
      .send({ assignedAdminId: 'admin2', note: 'Assigning to finance lead', idempotencyKey: 'assign_key_valid_001' });
    expect(dupAssign.status).toBe(200);
    const conflictAssign = await request(app)
      .patch(`/api/v1/financial/admin/recovery-cases/${caseId}/assign`)
      .set('Authorization', 'Bearer admin1')
      .send({ assignedAdminId: 'admin1', idempotencyKey: 'assign_key_valid_001' });
    expect(conflictAssign.status).toBe(409);

    // 2. Append investigation note, evidence attachment, and evidence request
    const noteRes = await request(app)
      .post(`/api/v1/financial/admin/recovery-cases/${caseId}/events`)
      .set('Authorization', 'Bearer admin2')
      .send({ type: 'NOTE_ADDED', note: 'Verified bank chargeback code 10.4', idempotencyKey: 'note_key_valid_0001' });
    expect(noteRes.status).toBe(201);

    const evidenceRes = await request(app)
      .post(`/api/v1/financial/admin/recovery-cases/${caseId}/events`)
      .set('Authorization', 'Bearer admin2')
      .send({
        type: 'EVIDENCE_ATTACHED',
        note: 'Uploaded Stripe dispute summary export',
        evidenceRef: 'ref:stripe-dispute-export-42',
        idempotencyKey: 'evid_key_valid_0001',
      });
    expect(evidenceRes.status).toBe(201);

    const reqEvRes = await request(app)
      .post(`/api/v1/financial/admin/recovery-cases/${caseId}/events`)
      .set('Authorization', 'Bearer admin2')
      .send({ type: 'EVIDENCE_REQUESTED', note: 'Requested signed proof of delivery from seller' });
    expect(reqEvRes.status).toBe(201);

    // Invalid evidence attachment without ref -> 400
    expect(
      (await request(app).post(`/api/v1/financial/admin/recovery-cases/${caseId}/events`).set('Authorization', 'Bearer admin2').send({ type: 'EVIDENCE_ATTACHED', note: 'Missing ref' })).status
    ).toBe(400);

    // 3. Valid status transitions OPEN -> INVESTIGATING -> PENDING_VERIFICATION
    // Invalid skip OPEN -> PENDING_VERIFICATION rejected with 409
    expect(
      (await request(app).patch(`/api/v1/financial/admin/recovery-cases/${caseId}/status`).set('Authorization', 'Bearer admin2').send({ status: 'PENDING_VERIFICATION', reason: 'Skipping investigation' })).status
    ).toBe(409);

    const st1 = await request(app)
      .patch(`/api/v1/financial/admin/recovery-cases/${caseId}/status`)
      .set('Authorization', 'Bearer admin2')
      .send({ status: 'INVESTIGATING', reason: 'Started seller chargeback investigation', idempotencyKey: 'status_key_valid_01' });
    expect(st1.status).toBe(200);
    expect(state.cases.get(caseId)!.status).toBe('INVESTIGATING');

    const st2 = await request(app)
      .patch(`/api/v1/financial/admin/recovery-cases/${caseId}/status`)
      .set('Authorization', 'Bearer admin2')
      .send({ status: 'PENDING_VERIFICATION', reason: 'Evidence collected; awaiting external settlement verification' });
    expect(st2.status).toBe(200);
    expect(state.cases.get(caseId)!.status).toBe('PENDING_VERIFICATION');

    // Fake terminal status or mass-assignment recoveryRequired=false rejected with 400
    expect(
      (await request(app).patch(`/api/v1/financial/admin/recovery-cases/${caseId}/status`).set('Authorization', 'Bearer admin2').send({ status: 'RESOLVED', reason: 'Fake clear' })).status
    ).toBe(400);
    expect(
      (await request(app).patch(`/api/v1/financial/admin/recovery-cases/${caseId}/status`).set('Authorization', 'Bearer admin2').send({ status: 'INVESTIGATING', reason: 'Attempt bypass', recoveryRequired: false })).status
    ).toBe(400);

    // 4. Financial Regression Proofs:
    // - Zero new FinancialEntry rows written and zero balance modifications
    expect(state.entries.size).toBe(initialEntryCount);
    // - Dispute financial hold remains strictly active (recoveryRequired === true)
    expect(state.disputes.get(disputeId)!.recoveryRequired).toBe(true);
    // - Order remains DISPUTED
    expect(state.orders.get(orderId)!.status).toBe('DISPUTED');
    // - Seller-level payout restriction still blocks payouts on a sibling COMPLETED order
    const siblingId = nextId('cord');
    state.orders.set(siblingId, {
      id: siblingId,
      buyerId: 'buyer',
      sellerId: 'sp_1',
      amount: new Prisma.Decimal('50.00'),
      currency: 'usd',
      platformFeeBps: 1000,
      purchaseSnapshot: { deliveryDays: 2, revisions: 1 },
      status: 'COMPLETED',
      completedAt: new Date(),
      createdAt: new Date(),
    });
    await expect(PayoutService.request('seller', siblingId, 'payout_blocked_post_investigation')).rejects.toThrow(/recovery/i);
    // - External payouts remain hard-disabled (503)
    const procRes = await request(app)
      .post('/api/v1/financial/admin/payouts/cm1234567890abcdefghijklm/process')
      .set('Authorization', 'Bearer admin1')
      .send({});
    expect(procRes.status).toBe(503);
  });

  it('computes overview statistics via database-side aggregations without an unbounded findMany', async () => {
    // Empty state returns exact zeroes when aggregate sum is null.
    const emptyRes = await request(app)
      .get('/api/v1/financial/admin/recovery-cases')
      .set('Authorization', 'Bearer admin1');
    expect(emptyRes.status).toBe(200);
    expect(emptyRes.body.data.overview).toEqual({
      totalCases: 0,
      totalRecoveryAmount: '0.00',
      currency: 'usd',
      countsByStatus: {
        OPEN: 0,
        INVESTIGATING: 0,
        AWAITING_EVIDENCE: 0,
        PENDING_VERIFICATION: 0,
      },
      unassignedCount: 0,
      activeFinancialHoldCount: 0,
      externalPayoutsDisabled: true,
    });

    // Seed mixed statuses, assignment states, fractional cent amounts, and one non-hold dispute.
    seedRecoveryCase({ amount: '0.10', status: 'OPEN', assignedAdminId: null, recoveryRequired: true });
    seedRecoveryCase({ amount: '0.20', status: 'OPEN', assignedAdminId: 'admin1', recoveryRequired: true });
    seedRecoveryCase({ amount: '120.05', status: 'INVESTIGATING', assignedAdminId: 'admin2', recoveryRequired: true });
    seedRecoveryCase({ amount: '80.50', status: 'AWAITING_EVIDENCE', assignedAdminId: null, recoveryRequired: true });
    seedRecoveryCase({ amount: '49.15', status: 'PENDING_VERIFICATION', assignedAdminId: 'admin1', recoveryRequired: false });

    const findManyMock = vi.mocked(prisma.financialRecoveryCase.findMany);
    const aggregateMock = vi.mocked(prisma.financialRecoveryCase.aggregate);
    const groupByMock = vi.mocked(prisma.financialRecoveryCase.groupBy);
    const countMock = vi.mocked(prisma.financialRecoveryCase.count);
    findManyMock.mockClear();
    aggregateMock.mockClear();
    groupByMock.mockClear();
    countMock.mockClear();

    const filteredRes = await request(app)
      .get('/api/v1/financial/admin/recovery-cases?status=OPEN&limit=1&page=2&sortBy=recoveryAmount&sortOrder=asc')
      .set('Authorization', 'Bearer admin1');
    expect(filteredRes.status).toBe(200);

    // Overview retains global statistics across all 5 cases with exact integer-cent sum (0.10 + 0.20 + 120.05 + 80.50 + 49.15 = 250.00).
    expect(filteredRes.body.data.overview).toEqual({
      totalCases: 5,
      totalRecoveryAmount: '250.00',
      currency: 'usd',
      countsByStatus: {
        OPEN: 2,
        INVESTIGATING: 1,
        AWAITING_EVIDENCE: 1,
        PENDING_VERIFICATION: 1,
      },
      unassignedCount: 2,
      activeFinancialHoldCount: 4,
      externalPayoutsDisabled: true,
    });

    // Filtering and pagination apply strictly to items + meta.
    expect(filteredRes.body.data.items).toHaveLength(1);
    expect(filteredRes.body.data.items[0].status).toBe('OPEN');
    expect(filteredRes.body.data.items[0].recoveryAmount).toBe('0.20');
    expect(filteredRes.body.data.meta).toEqual({ total: 2, page: 2, limit: 1, totalPages: 2 });

    // Exactly ONE bounded findMany (with explicit skip/take) for the current page; overview uses aggregate/groupBy/count.
    expect(findManyMock).toHaveBeenCalledTimes(1);
    expect(findManyMock).toHaveBeenCalledWith(expect.objectContaining({ skip: 1, take: 1 }));
    expect(aggregateMock).toHaveBeenCalledTimes(1);
    expect(groupByMock).toHaveBeenCalledTimes(1);
    expect(countMock).toHaveBeenCalledTimes(3);
  });
});
