import { beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import express from 'express';
import request from 'supertest';
import { VerificationStatus } from '@prisma/client';

type UserRow = { id: string; email: string; role: 'BUYER' | 'SELLER' | 'ADMIN'; status: 'ACTIVE' | 'SUSPENDED' | 'BANNED'; createdAt: Date };
type SellerRow = {
  id: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  professionalTitle: string | null;
  country: string | null;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  verificationStatus: VerificationStatus;
  stripeAccountId: string | null;
};
type KycRow = {
  id: string;
  sellerProfileId: string;
  status: VerificationStatus;
  documentType: string;
  legalName: string | null;
  dateOfBirthEncrypted: string | null;
  documentNumberEncrypted: string | null;
  documentNumberHash: string | null;
  documentNumberHmacVersion: string;
  documentNumberLast4: string | null;
  country: string | null;
  documentUrl: string;
  documentBackUrl: string | null;
  selfieUrl: string | null;
  scanStatus: string;
  scanResult: string | null;
  scannedAt: Date | null;
  scanEngineVersion: string | null;
  scanAttempts: number;
  lastScanAttemptAt: Date | null;
  nextScanRetryAt: Date | null;
  scanLeaseExpiresAt: Date | null;
  scanClaimId: string | null;
  submittedAt: Date;
  reviewedAt: Date | null;
  reviewedById: string | null;
  resubmissionRequestedAt: Date | null;
  decisionReason: string | null;
  comments: string | null;
  version: number;
  updatedAt: Date;
};
type UploadObjectRow = {
  id: string;
  objectKey: string;
  reference: string;
  ownerId: string;
  mimeType: string;
  byteSize: number;
  purpose: string;
  lifecycleStatus: string;
  scanStatus: string;
  scanResult: string | null;
  scannedAt: Date | null;
  scanEngineVersion: string | null;
  kycVerificationId: string | null;
  kycSlot: string | null;
  replacedAt: Date | null;
  retentionUntil: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
type HistoryRow = {
  id: string;
  identityVerificationId: string;
  sellerProfileId: string;
  actorId: string;
  actorRole: 'BUYER' | 'SELLER' | 'ADMIN';
  decision: string;
  previousState: VerificationStatus;
  newState: VerificationStatus;
  reason: string | null;
  comments: string | null;
  correlationId: string;
  createdAt: Date;
};
type AuditRow = {
  id: string;
  adminId: string;
  action: string;
  targetEntity: string;
  targetId: string;
  correlationId: string;
  previousState: string | null;
  newState: string | null;
  reason: string | null;
  metadata: unknown;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
};

const store = vi.hoisted(() => ({
  users: new Map<string, UserRow>(),
  sellers: new Map<string, SellerRow>(),
  kycs: new Map<string, KycRow>(),
  uploadObjects: new Map<string, UploadObjectRow>(),
  histories: [] as HistoryRow[],
  audits: [] as AuditRow[],
}));

vi.mock('../../apps/api/src/middlewares/requireAuth', () => ({
  requireAuth: (req: express.Request & { user?: { userId: string; role: string; sessionId: string; expiresAt: number } }, res: express.Response, next: express.NextFunction) => {
    const actor = req.headers.authorization?.replace('Bearer ', '');
    if (!actor || !store.users.has(actor)) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      return;
    }
    const u = store.users.get(actor)!;
    const claimed = req.headers['x-test-claim-role'] as string | undefined;
    req.user = { userId: u.id, role: claimed || u.role, sessionId: `sess_${u.id}`, expiresAt: Date.now() + 60000 };
    next();
  },
}));

vi.mock('../../apps/api/src/lib/prisma', () => {
  const matchContains = (val: string | null | undefined, q: string) =>
    Boolean(val && val.toLowerCase().includes(q.toLowerCase()));

  const filterKycs = (where: Record<string, unknown> = {}) => {
    return [...store.kycs.values()].filter(k => {
      if (where.status) {
        if (typeof where.status === 'string' && k.status !== where.status) return false;
        if (typeof where.status === 'object' && where.status !== null && 'in' in where.status) {
          if (!(where.status as { in: string[] }).in.includes(k.status)) return false;
        }
      }
      if (Array.isArray(where.OR)) {
        const sp = store.sellers.get(k.sellerProfileId)!;
        const usr = store.users.get(sp.userId)!;
        const ok = (where.OR as Record<string, unknown>[]).some(cond => {
          if ('legalName' in cond) return matchContains(k.legalName, (cond.legalName as { contains: string }).contains);
          if ('country' in cond) return matchContains(k.country, (cond.country as { contains: string }).contains);
          if ('sellerProfile' in cond) {
            const sub = cond.sellerProfile as Record<string, unknown>;
            if ('firstName' in sub) return matchContains(sp.firstName, (sub.firstName as { contains: string }).contains);
            if ('lastName' in sub) return matchContains(sp.lastName, (sub.lastName as { contains: string }).contains);
            if ('user' in sub) return matchContains(usr.email, ((sub.user as Record<string, { contains: string }>).email!).contains);
          }
          return false;
        });
        if (!ok) return false;
      }
      return true;
    });
  };

  const client = {
    $queryRaw: vi.fn().mockResolvedValue([{ '?column?': 1 }]),
    user: {
      findUnique: async ({ where }: { where: { id: string } }) => store.users.get(where.id) || null,
      findFirst: async () => null,
    },
    serviceImage: { findFirst: async () => null },
    message: { findFirst: async () => null },
    orderDelivery: { findFirst: async () => null },
    buyerProfile: { findFirst: async () => null },
    uploadObject: {
      create: async ({ data }: { data: Partial<UploadObjectRow> & { objectKey: string; reference: string; ownerId: string; mimeType: string; byteSize: number } }) => {
        const now = new Date();
        const row: UploadObjectRow = {
          id: `uo_${store.uploadObjects.size + 1}`,
          purpose: 'GENERAL',
          lifecycleStatus: 'ACTIVE',
          scanStatus: 'NOT_REQUIRED',
          scanResult: null,
          scannedAt: null,
          scanEngineVersion: null,
          kycVerificationId: null,
          kycSlot: null,
          replacedAt: null,
          retentionUntil: null,
          deletedAt: null,
          createdAt: now,
          updatedAt: now,
          ...data,
        };
        store.uploadObjects.set(row.reference, row);
        return row;
      },
      findUnique: async ({ where }: { where: { reference?: string; id?: string } }) => {
        if (where.reference) return store.uploadObjects.get(where.reference) || null;
        return [...store.uploadObjects.values()].find(u => u.id === where.id) || null;
      },
      update: async ({ where, data }: { where: { id: string }; data: Partial<UploadObjectRow> }) => {
        const row = [...store.uploadObjects.values()].find(u => u.id === where.id)!;
        Object.assign(row, data, { updatedAt: new Date() });
        return row;
      },
      updateMany: async ({
        where,
        data,
      }: {
        where: {
          id?: string;
          ownerId?: string;
          reference?: { in: string[] };
          lifecycleStatus?: string | { in: string[] };
          OR?: Array<{ kycVerificationId?: string | null }>;
        };
        data: Partial<UploadObjectRow>;
      }) => {
        let count = 0;
        for (const u of store.uploadObjects.values()) {
          if (where.id && u.id !== where.id) continue;
          if (where.ownerId && u.ownerId !== where.ownerId) continue;
          if (where.reference?.in && !where.reference.in.includes(u.reference)) continue;
          if (where.lifecycleStatus) {
            if (typeof where.lifecycleStatus === 'string') {
              if (u.lifecycleStatus !== where.lifecycleStatus) continue;
            } else if (!where.lifecycleStatus.in.includes(u.lifecycleStatus)) {
              continue;
            }
          }
          if (Array.isArray(where.OR)) {
            const ok = where.OR.some(cond =>
              'kycVerificationId' in cond && (u.kycVerificationId ?? null) === (cond.kycVerificationId ?? null)
            );
            if (!ok) continue;
          }
          Object.assign(u, data, { updatedAt: new Date() });
          count += 1;
        }
        return { count };
      },
    },
    sellerProfile: {
      findUnique: async ({ where, include, select }: { where: { id?: string; userId?: string }; include?: Record<string, unknown>; select?: Record<string, unknown> }) => {
        const sp = [...store.sellers.values()].find(s => s.id === where.id || s.userId === where.userId);
        if (!sp) return null;
        const usr = store.users.get(sp.userId)!;
        const iv = [...store.kycs.values()].find(k => k.sellerProfileId === sp.id) || null;
        const reviewHistory = iv
          ? store.histories.filter(h => h.identityVerificationId === iv.id).slice().reverse()
          : [];
        return {
          ...sp,
          ...(include?.user || select?.user ? { user: usr } : {}),
          ...(include?.identityVerification || select?.identityVerification
            ? { identityVerification: iv ? { ...iv, reviewHistory } : null }
            : {}),
        };
      },
      findMany: async ({ where }: { where: { status?: string; user?: { status: string } } }) => {
        return [...store.sellers.values()]
          .filter(s => (!where?.status || s.status === where.status) && (!where?.user || store.users.get(s.userId)?.status === where.user.status))
          .map(s => ({ id: s.id, status: s.status, firstName: s.firstName, lastName: s.lastName, bio: null, professionalTitle: s.professionalTitle, country: s.country, createdAt: new Date() }));
      },
      findFirst: async () => null,
      update: async ({ where, data }: { where: { id: string }; data: Partial<SellerRow> }) => {
        const sp = store.sellers.get(where.id)!;
        Object.assign(sp, data);
        return sp;
      },
    },
    identityVerification: {
      findUnique: async ({ where, include }: { where: { id?: string; sellerProfileId?: string }; include?: Record<string, unknown> }) => {
        const iv = [...store.kycs.values()].find(k => k.id === where.id || k.sellerProfileId === where.sellerProfileId);
        if (!iv) return null;
        const sp = store.sellers.get(iv.sellerProfileId)!;
        const usr = store.users.get(sp.userId)!;
        const reviewedBy = iv.reviewedById ? store.users.get(iv.reviewedById) || null : null;
        const reviewHistory = store.histories
          .filter(h => h.identityVerificationId === iv.id)
          .slice()
          .reverse()
          .map(h => ({ ...h, actor: store.users.get(h.actorId) || null }));
        return {
          ...iv,
          sellerProfile: include?.sellerProfile || true ? { ...sp, user: usr } : undefined,
          reviewedBy,
          reviewHistory,
        };
      },
      findUniqueOrThrow: async ({ where }: { where: { id: string } }) => {
        const iv = store.kycs.get(where.id);
        if (!iv) throw new Error('KYC record not found');
        return iv;
      },
      findFirst: async ({
        where,
      }: {
        where: {
          sellerProfile?: { userId: string };
          sellerProfileId?: { not?: string };
          country?: string | null;
          documentType?: string;
          documentNumberHash?: string | { in: string[] } | null;
          status?: { not?: string };
          OR?: Record<string, string>[];
        };
      }) => {
        for (const k of store.kycs.values()) {
          const sp = store.sellers.get(k.sellerProfileId)!;
          if (where.sellerProfile?.userId && sp.userId !== where.sellerProfile.userId) continue;
          if (where.sellerProfileId?.not && k.sellerProfileId === where.sellerProfileId.not) continue;
          if (where.country !== undefined && k.country !== where.country) continue;
          if (where.documentType !== undefined && k.documentType !== where.documentType) continue;
          if (where.documentNumberHash !== undefined) {
            if (typeof where.documentNumberHash === 'object' && where.documentNumberHash !== null && 'in' in where.documentNumberHash) {
              if (!k.documentNumberHash || !where.documentNumberHash.in.includes(k.documentNumberHash)) continue;
            } else if (k.documentNumberHash !== where.documentNumberHash) {
              continue;
            }
          }
          if (where.status?.not && k.status === where.status.not) continue;
          if (where.OR) {
            const matched = where.OR.some(cond =>
              (cond.documentUrl && k.documentUrl === cond.documentUrl) ||
              (cond.documentBackUrl && k.documentBackUrl === cond.documentBackUrl) ||
              (cond.selfieUrl && k.selfieUrl === cond.selfieUrl)
            );
            if (!matched) continue;
          }
          return k;
        }
        return null;
      },
      findMany: async ({ where, skip = 0, take = 20 }: { where?: Record<string, unknown>; skip?: number; take?: number }) => {
        return filterKycs(where).slice(skip, skip + take).map(k => {
          const sp = store.sellers.get(k.sellerProfileId)!;
          const usr = store.users.get(sp.userId)!;
          return { ...k, sellerProfile: { ...sp, user: usr } };
        });
      },
      count: async ({ where }: { where?: Record<string, unknown> } = {}) => filterKycs(where).length,
      create: async ({ data }: { data: Omit<KycRow, 'id' | 'reviewedAt' | 'reviewedById' | 'resubmissionRequestedAt' | 'decisionReason' | 'comments' | 'updatedAt' | 'scanResult' | 'scannedAt' | 'scanEngineVersion' | 'scanAttempts' | 'lastScanAttemptAt' | 'nextScanRetryAt' | 'scanLeaseExpiresAt' | 'scanClaimId' | 'documentNumberHmacVersion'> & Partial<Pick<KycRow, 'scanResult' | 'scannedAt' | 'scanEngineVersion' | 'scanAttempts' | 'lastScanAttemptAt' | 'nextScanRetryAt' | 'scanLeaseExpiresAt' | 'scanClaimId' | 'documentNumberHmacVersion'>> }) => {
        const row: KycRow = {
          documentNumberHmacVersion: 'v1',
          scanResult: null,
          scannedAt: null,
          scanEngineVersion: null,
          scanAttempts: 0,
          lastScanAttemptAt: null,
          nextScanRetryAt: null,
          scanLeaseExpiresAt: null,
          scanClaimId: null,
          ...data,
          id: `ckyc_test_${String(store.kycs.size + 1).padStart(4, '0')}`,
          reviewedAt: null,
          reviewedById: null,
          resubmissionRequestedAt: null,
          decisionReason: null,
          comments: null,
          updatedAt: new Date(),
        };
        store.kycs.set(row.id, row);
        return row;
      },
      update: async ({ where, data }: { where: { id: string }; data: Partial<KycRow> }) => {
        const row = store.kycs.get(where.id)!;
        Object.assign(row, data, { updatedAt: new Date() });
        return row;
      },
      updateMany: async ({ where, data }: { where: { id: string; version?: number }; data: Partial<KycRow> }) => {
        const row = store.kycs.get(where.id);
        if (!row || (where.version !== undefined && row.version !== where.version)) {
          return { count: 0 };
        }
        Object.assign(row, data, { updatedAt: new Date() });
        return { count: 1 };
      },
    },
    kycReviewHistory: {
      create: async ({ data }: { data: Omit<HistoryRow, 'id' | 'createdAt'> }) => {
        const row: HistoryRow = { ...data, id: `khist_${store.histories.length + 1}`, createdAt: new Date() };
        store.histories.push(row);
        return row;
      },
    },
    adminAuditLog: {
      create: async ({ data }: { data: Omit<AuditRow, 'id' | 'createdAt'> }) => {
        const row: AuditRow = { ...data, id: `audit_${store.audits.length + 1}`, createdAt: new Date() };
        store.audits.push(row);
        return row;
      },
      findMany: async ({ where = {}, skip = 0, take = 25 }: { where?: Record<string, unknown>; skip?: number; take?: number }) => {
        return store.audits
          .filter(a => (!where.action || a.action === where.action) && (!where.targetEntity || a.targetEntity === where.targetEntity) && (!where.targetId || a.targetId === where.targetId))
          .slice()
          .reverse()
          .slice(skip, skip + take)
          .map(a => ({ ...a, admin: store.users.get(a.adminId) || null }));
      },
      count: async ({ where = {} }: { where?: Record<string, unknown> } = {}) =>
        store.audits.filter(a => (!where.action || a.action === where.action) && (!where.targetEntity || a.targetEntity === where.targetEntity)).length,
    },
    category: { findMany: async () => [] },
    order: { findMany: async () => [] },
  };

  return { prisma: { ...client, $transaction: async <T>(fn: (tx: typeof client) => Promise<T>) => fn(client) } };
});

import onboardingRouter from '../../apps/api/src/modules/onboarding/onboarding.route';
import adminRouter from '../../apps/api/src/modules/admin/admin.route';
import marketplaceRouter from '../../apps/api/src/modules/marketplace/marketplace.route';
import { uploadRouter } from '../../apps/api/src/modules/upload/upload.route';
import { createAdminKycRouter } from '../../apps/api/src/modules/kyc/kyc.route';
import { LocalStorage } from '../../apps/api/src/modules/upload/storage';
import { OnboardingService } from '../../apps/api/src/modules/onboarding/onboarding.service';
import { KycService } from '../../apps/api/src/modules/kyc/kyc.service';
import type { MalwareScanner } from '../../apps/api/src/modules/kyc/malware-scanner';

const pngBuffer = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 1]);

async function buildApp() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'tascora-kyc-test-'));
  const storage = new LocalStorage(dir);
  const app = express();
  app.use(express.json());
  app.use('/api/v1/uploads', uploadRouter(storage));
  app.use('/api/v1/onboarding', onboardingRouter);
  app.use('/api/v1/admin', adminRouter);
  app.use('/api/v1/admin-storage', (req, _res, next) => next());
  // Dedicated admin KYC mount with isolated LocalStorage for document downloads in test.
  app.use('/api/v1/admin-local', (req: express.Request & { user?: { userId: string; role: string } }, res, next) => {
    const actor = req.headers.authorization?.replace('Bearer ', '');
    if (!actor || !store.users.has(actor)) { res.status(401).json({ success: false }); return; }
    const u = store.users.get(actor)!;
    if (u.role !== 'ADMIN') { res.status(403).json({ success: false }); return; }
    req.user = { userId: u.id, role: u.role };
    next();
  }, createAdminKycRouter(storage));
  app.use('/api/v1/marketplace', marketplaceRouter);
  app.use((err: { status?: number; code?: string; message?: string }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(err.status || 500).json({ success: false, error: { code: err.code, message: err.message || 'Error' } });
  });
  return { app, storage, dir, cleanup: () => fs.rm(dir, { recursive: true, force: true }) };
}

describe('Seller KYC lifecycle, state transitions, and admin review workflow', () => {
  beforeEach(() => {
    store.users.clear();
    store.sellers.clear();
    store.kycs.clear();
    store.uploadObjects.clear();
    store.histories = [];
    store.audits = [];

    store.users.set('seller-1', { id: 'seller-1', email: 'seller1@tascora.dev', role: 'SELLER', status: 'ACTIVE', createdAt: new Date() });
    store.users.set('seller-2', { id: 'seller-2', email: 'seller2@tascora.dev', role: 'SELLER', status: 'ACTIVE', createdAt: new Date() });
    store.users.set('buyer-1', { id: 'buyer-1', email: 'buyer1@tascora.dev', role: 'BUYER', status: 'ACTIVE', createdAt: new Date() });
    store.users.set('admin-1', { id: 'admin-1', email: 'admin@tascora.dev', role: 'ADMIN', status: 'ACTIVE', createdAt: new Date() });

    store.sellers.set('sp-1', {
      id: 'sp-1',
      userId: 'seller-1',
      firstName: 'Linh',
      lastName: 'Tran',
      professionalTitle: 'Brand Designer',
      country: 'VN',
      status: 'APPROVED',
      verificationStatus: 'NOT_SUBMITTED',
      stripeAccountId: null,
    });
    store.sellers.set('sp-2', {
      id: 'sp-2',
      userId: 'seller-2',
      firstName: 'Alex',
      lastName: 'Morgan',
      professionalTitle: 'Full-stack Engineer',
      country: 'US',
      status: 'APPROVED',
      verificationStatus: 'NOT_SUBMITTED',
      stripeAccountId: null,
    });
  });

  it('completes submit -> update -> under-review -> request-resubmission -> resubmit -> approve flow cleanly and keeps payouts disabled', async () => {
    const ctx = await buildApp();
    try {
      const uploadFront = await request(ctx.app)
        .post('/api/v1/uploads')
        .set('Authorization', 'Bearer seller-1')
        .set('Content-Type', 'image/png')
        .send(pngBuffer);
      expect(uploadFront.status).toBe(201);
      const frontRef = uploadFront.body.data.reference as string;

      const uploadSelfie = await request(ctx.app)
        .post('/api/v1/uploads')
        .set('Authorization', 'Bearer seller-1')
        .set('Content-Type', 'image/png')
        .send(pngBuffer);
      expect(uploadSelfie.status).toBe(201);
      const selfieRef = uploadSelfie.body.data.reference as string;

      // Submit initial KYC
      const submitRes = await request(ctx.app)
        .post('/api/v1/onboarding/seller/kyc')
        .set('Authorization', 'Bearer seller-1')
        .send({
          documentType: 'PASSPORT',
          documentNumber: 'P987654321',
          legalName: 'Linh Nguyen Tran',
          dateOfBirth: '1994-05-12',
          country: 'vn',
          documentFrontUrl: frontRef,
          selfieUrl: selfieRef,
        });
      expect(submitRes.status).toBe(201);
      expect(submitRes.body.data.status).toBe('PENDING');
      expect(submitRes.body.data.scanStatus).toBe('QUARANTINED');
      expect(submitRes.body.data.documentNumberMasked).toBe('••••4321');
      expect(JSON.stringify(submitRes.body)).not.toContain('P987654321');
      expect(JSON.stringify(submitRes.body)).not.toContain('1994-05-12');

      const kycId = submitRes.body.data.id as string;

      // Update while PENDING
      const updateRes = await request(ctx.app)
        .put('/api/v1/onboarding/seller/kyc')
        .set('Authorization', 'Bearer seller-1')
        .send({ legalName: 'Linh T. Nguyen' });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.legalName).toBe('Linh T. Nguyen');
      expect(updateRes.body.data.version).toBe(2);

      // Admin queue lists item & counts without full unmasked PII
      const queueRes = await request(ctx.app)
        .get('/api/v1/admin/kyc?status=PENDING&search=Linh')
        .set('Authorization', 'Bearer admin-1');
      expect(queueRes.status).toBe(200);
      expect(queueRes.body.data.counts.pending).toBe(1);
      expect(queueRes.body.data.items).toHaveLength(1);
      expect(JSON.stringify(queueRes.body)).not.toContain('P987654321');
      expect(JSON.stringify(queueRes.body)).not.toContain('1994-05-12');

      // Admin inspects single record -> decrypts PII with no-store & audits access while docs stay quarantined
      const detailRes = await request(ctx.app)
        .get(`/api/v1/admin/kyc/${kycId}`)
        .set('Authorization', 'Bearer admin-1');
      expect(detailRes.status).toBe(200);
      expect(detailRes.headers['cache-control']).toBe('private, no-store');
      expect(detailRes.body.data.documentNumber).toBe('P987654321');
      expect(detailRes.body.data.dateOfBirth).toBe('1994-05-12');
      expect(detailRes.body.data.documents.front.downloadable).toBe(false);
      expect(detailRes.body.data.documents.front.downloadEndpoint).toBeNull();
      expect(detailRes.body.data.payoutEligibility.eligibleForLivePayouts).toBe(false);
      expect(detailRes.body.data.payoutEligibility.blockingReasons).toContain('PAYOUT_PROVIDER_DISABLED');

      // Fail closed: quarantined files CANNOT be downloaded or approved before malware scan passes
      const blockedDocDownload = await request(ctx.app)
        .get(`/api/v1/admin-local/kyc/${kycId}/documents/front`)
        .set('Authorization', 'Bearer admin-1');
      expect(blockedDocDownload.status).toBe(423);
      expect(blockedDocDownload.body.error.code).toBe('KYC_DOCUMENT_QUARANTINED');

      // Missing expectedVersion is rejected across state-changing review endpoints
      const missingVersionUnderReview = await request(ctx.app)
        .post(`/api/v1/admin/kyc/${kycId}/under-review`)
        .set('Authorization', 'Bearer admin-1')
        .send({});
      expect(missingVersionUnderReview.status).toBe(400);

      const missingVersionApprove = await request(ctx.app)
        .post(`/api/v1/admin/kyc/${kycId}/approve`)
        .set('Authorization', 'Bearer admin-1')
        .send({ reason: 'Missing expectedVersion' });
      expect(missingVersionApprove.status).toBe(400);

      const blockedApproveQuarantined = await request(ctx.app)
        .post(`/api/v1/admin/kyc/${kycId}/approve`)
        .set('Authorization', 'Bearer admin-1')
        .send({ reason: 'Premature approval attempt', expectedVersion: 2 });
      expect(blockedApproveQuarantined.status).toBe(409);
      expect(blockedApproveQuarantined.body.error.code).toBe('KYC_SECURITY_SCAN_REQUIRED');

      // Admin marks UNDER_REVIEW (version increments + stale expectedVersion rejected); seller edit is now blocked (409)
      const staleUnderReview = await request(ctx.app)
        .post(`/api/v1/admin/kyc/${kycId}/under-review`)
        .set('Authorization', 'Bearer admin-1')
        .send({ expectedVersion: 999 });
      expect(staleUnderReview.status).toBe(409);

      const underReview = await request(ctx.app)
        .post(`/api/v1/admin/kyc/${kycId}/under-review`)
        .set('Authorization', 'Bearer admin-1')
        .send({ expectedVersion: 2 });
      expect(underReview.status).toBe(200);
      expect(underReview.body.data.status).toBe('UNDER_REVIEW');
      expect(underReview.body.data.version).toBe(3);

      const blockedUpdate = await request(ctx.app)
        .put('/api/v1/onboarding/seller/kyc')
        .set('Authorization', 'Bearer seller-1')
        .send({ legalName: 'Should Fail Now' });
      expect(blockedUpdate.status).toBe(409);

      // Admin requests resubmission with mandatory reason
      const missingReason = await request(ctx.app)
        .post(`/api/v1/admin/kyc/${kycId}/request-resubmission`)
        .set('Authorization', 'Bearer admin-1')
        .send({ reason: 'ok', expectedVersion: 3 });
      expect(missingReason.status).toBe(400);

      const resubReq = await request(ctx.app)
        .post(`/api/v1/admin/kyc/${kycId}/request-resubmission`)
        .set('Authorization', 'Bearer admin-1')
        .send({ reason: 'Document glare obscured MRZ code; please upload clearer photo.', expectedVersion: 3 });
      expect(resubReq.status).toBe(200);
      expect(resubReq.body.data.status).toBe('NEEDS_RESUBMISSION');
      expect(resubReq.body.data.version).toBe(4);

      // Seller PUT update from NEEDS_RESUBMISSION clears stale decision metadata
      const putFromResub = await request(ctx.app)
        .put('/api/v1/onboarding/seller/kyc')
        .set('Authorization', 'Bearer seller-1')
        .send({
          documentNumber: 'P987654322',
          documentFrontUrl: frontRef,
        });
      expect(putFromResub.status).toBe(200);
      expect(putFromResub.body.data.status).toBe('PENDING');
      expect(putFromResub.body.data.decisionReason).toBeNull();
      expect(putFromResub.body.data.reviewedAt).toBeNull();
      expect(putFromResub.body.data.scanStatus).toBe('QUARANTINED');

      // Security scan passes cleanly -> VERIFIED_SAFE unlocks audited download and approval
      const cleanScanner: MalwareScanner = {
        providerName: 'test-clamd',
        scanBuffer: async () => ({
          scanStatus: 'VERIFIED_SAFE',
          verdict: 'CLEAN',
          resultDetail: 'CLEAN',
          engineVersion: 'ClamAV 1.4.0',
          scannedAt: new Date(),
        }),
      };
      const scanOutcome = await KycService.scanPendingDocuments(kycId, cleanScanner, ctx.storage);
      expect(scanOutcome.scanStatus).toBe('VERIFIED_SAFE');

      const docDownload = await request(ctx.app)
        .get(`/api/v1/admin-local/kyc/${kycId}/documents/front`)
        .set('Authorization', 'Bearer admin-1');
      expect(docDownload.status).toBe(200);
      expect(docDownload.headers['cache-control']).toBe('private, no-store');
      expect(docDownload.headers['content-disposition']).toContain('attachment');
      expect(docDownload.headers['x-content-type-options']).toBe('nosniff');
      expect(docDownload.headers['content-security-policy']).toContain('sandbox');
      expect(docDownload.headers['x-tascora-scan-status']).toBe('VERIFIED_SAFE');

      // Admin approves with clean verified evidence
      const approveRes = await request(ctx.app)
        .post(`/api/v1/admin/kyc/${kycId}/approve`)
        .set('Authorization', 'Bearer admin-1')
        .send({ reason: 'Verified clear passport copy.', expectedVersion: scanOutcome.version });
      expect(approveRes.status).toBe(200);
      expect(approveRes.body.data.status).toBe('APPROVED');
      expect(store.sellers.get('sp-1')!.verificationStatus).toBe('APPROVED');

      // Read-only payout eligibility confirms KYC satisfied while live payouts stay disabled!
      const eligRes = await request(ctx.app)
        .get('/api/v1/onboarding/seller/kyc/payout-eligibility')
        .set('Authorization', 'Bearer seller-1');
      expect(eligRes.status).toBe(200);
      expect(eligRes.body.data.kycSatisfied).toBe(true);
      expect(eligRes.body.data.eligibleForLivePayouts).toBe(false);
      expect(eligRes.body.data.blockingReasons).toContain('PAYOUT_PROVIDER_DISABLED');

      // Cannot re-submit or re-approve after APPROVED
      expect((await request(ctx.app).post(`/api/v1/admin/kyc/${kycId}/approve`).set('Authorization', 'Bearer admin-1').send({ expectedVersion: approveRes.body.data.version })).status).toBe(409);

      // Public seller listing NEVER leaks KYC PII
      const publicSellers = await request(ctx.app).get('/api/v1/marketplace/sellers');
      expect(publicSellers.status).toBe(200);
      const dumped = JSON.stringify(publicSellers.body);
      expect(dumped).not.toContain('P987654322');
      expect(dumped).not.toContain('1994-05-12');
      expect(dumped).not.toContain('identityVerification');
      expect(dumped).not.toContain('verificationStatus');
    } finally {
      await ctx.cleanup();
    }
  });

  it('prevents OnboardingService.submit from setting verificationStatus to PENDING implicitly', async () => {
    store.sellers.set('sp-draft', {
      id: 'sp-draft',
      userId: 'seller-2',
      firstName: 'Alex',
      lastName: 'Morgan',
      professionalTitle: 'Engineer',
      country: 'US',
      status: 'DRAFT',
      verificationStatus: 'NOT_SUBMITTED',
      stripeAccountId: null,
    });
    await expect(OnboardingService.submit('missing-user')).rejects.toThrow('Profile not found');
  });

  it('rejects non-sellers without a seller profile from submitting KYC', async () => {
    const ctx = await buildApp();
    try {
      const up = await request(ctx.app)
        .post('/api/v1/uploads')
        .set('Authorization', 'Bearer buyer-1')
        .set('Content-Type', 'image/png')
        .send(pngBuffer);
      const res = await request(ctx.app)
        .post('/api/v1/onboarding/seller/kyc')
        .set('Authorization', 'Bearer buyer-1')
        .send({
          documentType: 'NATIONAL_ID',
          documentNumber: 'ID12345678',
          legalName: 'Buyer One',
          dateOfBirth: '1990-01-01',
          country: 'US',
          documentFrontUrl: up.body.data.reference,
        });
      expect(res.status).toBe(403);
    } finally {
      await ctx.cleanup();
    }
  });

  it('rejects duplicate active (country, documentType, documentNumberHash) across sellers while allowing rejected claims or distinct doc types', async () => {
    const ctx = await buildApp();
    try {
      const up1 = await request(ctx.app)
        .post('/api/v1/uploads')
        .set('Authorization', 'Bearer seller-1')
        .set('Content-Type', 'image/png')
        .send(pngBuffer);
      const up2 = await request(ctx.app)
        .post('/api/v1/uploads')
        .set('Authorization', 'Bearer seller-2')
        .set('Content-Type', 'image/png')
        .send(pngBuffer);

      const first = await request(ctx.app)
        .post('/api/v1/onboarding/seller/kyc')
        .set('Authorization', 'Bearer seller-1')
        .send({
          documentType: 'PASSPORT',
          documentNumber: 'DUP-998877',
          legalName: 'Linh Tran',
          dateOfBirth: '1993-04-12',
          country: 'VN',
          documentFrontUrl: up1.body.data.reference,
        });
      expect(first.status).toBe(201);

      // Exact duplicate (country, documentType, documentNumberHash) on seller-2 -> 409 KYC_DUPLICATE_DOCUMENT
      const dup = await request(ctx.app)
        .post('/api/v1/onboarding/seller/kyc')
        .set('Authorization', 'Bearer seller-2')
        .send({
          documentType: 'PASSPORT',
          documentNumber: 'dup 998877',
          legalName: 'Alex Morgan',
          dateOfBirth: '1991-09-01',
          country: 'VN',
          documentFrontUrl: up2.body.data.reference,
        });
      expect(dup.status).toBe(409);
      expect(dup.body.error.code).toBe('KYC_DUPLICATE_DOCUMENT');

      // Different country is allowed under composite uniqueness policy.
      const differentCountry = await request(ctx.app)
        .post('/api/v1/onboarding/seller/kyc')
        .set('Authorization', 'Bearer seller-2')
        .send({
          documentType: 'PASSPORT',
          documentNumber: 'DUP-998877',
          legalName: 'Alex Morgan',
          dateOfBirth: '1991-09-01',
          country: 'US',
          documentFrontUrl: up2.body.data.reference,
        });
      expect(differentCountry.status).toBe(201);

      // Admin rejects seller-1 -> seller-2 may now claim VN PASSPORT DUP-998877 via update.
      const kycId1 = first.body.data.id;
      const rejectRes = await request(ctx.app)
        .post(`/api/v1/admin/kyc/${kycId1}/reject`)
        .set('Authorization', 'Bearer admin-1')
        .send({ reason: 'Wrong account owner claim', expectedVersion: first.body.data.version });
      expect(rejectRes.status).toBe(200);

      const reclaimRes = await request(ctx.app)
        .put('/api/v1/onboarding/seller/kyc')
        .set('Authorization', 'Bearer seller-2')
        .send({ country: 'VN' });
      expect(reclaimRes.status).toBe(200);
    } finally {
      await ctx.cleanup();
    }
  });

  it('requires valid expectedVersion on all admin review endpoints and blocks concurrent decision races with 409', async () => {
    const ctx = await buildApp();
    try {
      const up = await request(ctx.app)
        .post('/api/v1/uploads?purpose=kyc')
        .set('Authorization', 'Bearer seller-1')
        .set('Content-Type', 'image/png')
        .send(pngBuffer);
      expect(up.status).toBe(201);
      expect(store.uploadObjects.get(up.body.data.reference)?.purpose).toBe('KYC');

      const submitted = await request(ctx.app)
        .post('/api/v1/onboarding/seller/kyc')
        .set('Authorization', 'Bearer seller-1')
        .send({
          documentType: 'NATIONAL_ID',
          documentNumber: 'VER-554433',
          legalName: 'Linh Tran',
          dateOfBirth: '1993-04-12',
          country: 'VN',
          documentFrontUrl: up.body.data.reference,
        });
      expect(submitted.status).toBe(201);
      const kycId = submitted.body.data.id as string;

      const cleanScanner: MalwareScanner = {
        providerName: 'test-clamd',
        async scanBuffer() {
          return {
            verdict: 'CLEAN',
            scanStatus: 'VERIFIED_SAFE',
            engineVersion: 'ClamAV 1.4.2',
            resultDetail: 'Clean',
            scannedAt: new Date(),
          };
        },
      };
      const scanned = await KycService.scanPendingDocuments(kycId, cleanScanner, ctx.storage);
      const currentVersion = scanned.version;

      // Missing expectedVersion must be rejected across all 4 admin review endpoints.
      const missingResults = await Promise.all([
        request(ctx.app).post(`/api/v1/admin/kyc/${kycId}/under-review`).set('Authorization', 'Bearer admin-1').send({}),
        request(ctx.app).post(`/api/v1/admin/kyc/${kycId}/approve`).set('Authorization', 'Bearer admin-1').send({}),
        request(ctx.app)
          .post(`/api/v1/admin/kyc/${kycId}/reject`)
          .set('Authorization', 'Bearer admin-1')
          .send({ reason: 'Blur photo detected' }),
        request(ctx.app)
          .post(`/api/v1/admin/kyc/${kycId}/request-resubmission`)
          .set('Authorization', 'Bearer admin-1')
          .send({ reason: 'Resubmit clearer image' }),
      ]);
      for (const res of missingResults) {
        expect([400, 409]).toContain(res.status);
      }

      // Direct service call without expectedVersion also fails closed with KYC_VERSION_REQUIRED.
      await expect(
        KycService.reviewKycDecision(kycId, 'admin-1', 'UNDER_REVIEW', {} as { expectedVersion: number })
      ).rejects.toMatchObject({ status: 409, code: 'KYC_VERSION_REQUIRED' });

      // Stale expectedVersion returns 409 KYC_CONCURRENT_MODIFICATION without mutating state.
      const stale = await request(ctx.app)
        .post(`/api/v1/admin/kyc/${kycId}/approve`)
        .set('Authorization', 'Bearer admin-1')
        .send({ expectedVersion: currentVersion - 1 });
      expect(stale.status).toBe(409);
      expect(stale.body.error.code).toBe('KYC_CONCURRENT_MODIFICATION');

      // Concurrent decisions at same version: one succeeds, the rival loses with 409 KYC_CONCURRENT_MODIFICATION.
      const [r1, r2] = await Promise.all([
        request(ctx.app)
          .post(`/api/v1/admin/kyc/${kycId}/approve`)
          .set('Authorization', 'Bearer admin-1')
          .send({ expectedVersion: currentVersion }),
        request(ctx.app)
          .post(`/api/v1/admin/kyc/${kycId}/reject`)
          .set('Authorization', 'Bearer admin-1')
          .send({ reason: 'Concurrent conflicting review', expectedVersion: currentVersion }),
      ]);
      const statuses = [r1.status, r2.status].sort((a, b) => a - b);
      expect(statuses).toEqual([200, 409]);
      const loser = r1.status === 409 ? r1 : r2;
      expect(loser.body.error.code).toBe('KYC_CONCURRENT_MODIFICATION');
    } finally {
      await ctx.cleanup();
    }
  });

  it('rejects submitKyc on ORPHANED uploads and fails closed under concurrent cleanup race', async () => {
    const ctx = await buildApp();
    try {
      const orphanedUp = await request(ctx.app)
        .post('/api/v1/uploads?purpose=kyc')
        .set('Authorization', 'Bearer seller-1')
        .set('Content-Type', 'image/png')
        .send(pngBuffer);
      expect(orphanedUp.status).toBe(201);
      const orphanedRef = orphanedUp.body.data.reference as string;
      store.uploadObjects.get(orphanedRef)!.lifecycleStatus = 'ORPHANED';

      const orphanSubmit = await KycService.submitKyc('seller-1', {
        documentType: 'PASSPORT',
        legalName: 'Linh Tran',
        dateOfBirth: '1990-01-01',
        documentNumber: 'ORPHAN-100',
        country: 'VN',
        documentFrontUrl: orphanedRef,
      }).catch(err => err);
      expect(orphanSubmit).toMatchObject({ status: 409, code: 'UPLOAD_INACTIVE' });

      // Simulate concurrent orphan transition occurring between findUnique (ACTIVE) and conditional updateMany claim
      // on a fresh seller profile (seller-2) so cleanup interleaving fails closed with UPLOAD_INACTIVE.
      const raceUp = await request(ctx.app)
        .post('/api/v1/uploads?purpose=kyc')
        .set('Authorization', 'Bearer seller-2')
        .set('Content-Type', 'image/png')
        .send(pngBuffer);
      expect(raceUp.status).toBe(201);
      const raceRef = raceUp.body.data.reference as string;

      const { prisma } = await import('../../apps/api/src/lib/prisma');
      const origFindUnique = prisma.uploadObject.findUnique;
      let simulatedRace = false;
      const raceSpy = vi
        .spyOn(prisma.uploadObject, 'findUnique')
        .mockImplementation((async (args: { where?: { reference?: string; id?: string } }) => {
          const found = await origFindUnique(args as Parameters<typeof origFindUnique>[0]);
          if (!simulatedRace && found && found.reference === raceRef) {
            simulatedRace = true;
            const snapshot = { ...found };
            store.uploadObjects.get(raceRef)!.lifecycleStatus = 'ORPHANED';
            return snapshot;
          }
          return found;
        }) as unknown as typeof prisma.uploadObject.findUnique);

      try {
        const raceErr = await KycService.submitKyc('seller-2', {
          documentType: 'PASSPORT',
          legalName: 'Minh Nguyen',
          dateOfBirth: '1990-01-01',
          documentNumber: 'RACE-200',
          country: 'VN',
          documentFrontUrl: raceRef,
        }).catch(err => err);
        expect(raceErr).toMatchObject({ status: 409, code: 'UPLOAD_INACTIVE' });
      } finally {
        raceSpy.mockRestore();
      }
    } finally {
      await ctx.cleanup();
    }
  });
});
