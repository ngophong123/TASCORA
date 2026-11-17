import { beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import express from 'express';
import request from 'supertest';
import { S3Client } from '@aws-sdk/client-s3';
import {
  decryptSensitiveField,
  encryptSensitiveField,
  hmacDocumentNumber,
  maskDateOfBirth,
  maskDocumentNumber,
  sanitizeAuditMetadata,
} from '../../apps/api/src/lib/kyc-crypto';
import { LocalStorage, S3Storage } from '../../apps/api/src/modules/upload/storage';

const { state, txClient } = vi.hoisted(() => {
  const hoistedState = {
    users: new Map<string, { id: string; role: string; status: string }>(),
    kycs: new Map<
      string,
      {
        id: string;
        sellerProfileId: string;
        userId: string;
        status: string;
        country?: string | null;
        documentType?: string;
        documentNumberHash?: string | null;
        documentNumberHmacVersion?: string;
        scanStatus: string;
        documentUrl: string;
        documentBackUrl: string | null;
        selfieUrl: string | null;
        scanResult?: string | null;
        scannedAt?: Date | null;
        scanEngineVersion?: string | null;
        scanAttempts?: number;
        lastScanAttemptAt?: Date | null;
        nextScanRetryAt?: Date | null;
        scanLeaseExpiresAt?: Date | null;
        scanClaimId?: string | null;
        version: number;
      }
    >(),
    uploads: new Map<string, {
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
    }>(),
    audits: [] as Record<string, unknown>[],
    publicProfileHit: vi.fn().mockResolvedValue(null),
    serviceImageHit: vi.fn().mockResolvedValue(null),
  };

  const hoistedTxClient = {
    $queryRaw: vi.fn().mockResolvedValue([{ '?column?': 1 }]),
    user: {
      findUnique: async ({ where }: { where: { id: string } }) => hoistedState.users.get(where.id) || null,
      findFirst: hoistedState.publicProfileHit,
    },
    serviceImage: { findFirst: hoistedState.serviceImageHit },
    message: { findFirst: async () => null },
    orderDelivery: { findFirst: async () => null },
    buyerProfile: { findFirst: async () => null },
    uploadObject: {
      create: async ({ data }: { data: { objectKey: string; reference: string; ownerId: string; mimeType: string; byteSize: number; purpose: string; lifecycleStatus: string; scanStatus: string } }) => {
        const row = {
          id: `uo_${hoistedState.uploads.size + 1}`,
          scanResult: null,
          scannedAt: null,
          scanEngineVersion: null,
          kycVerificationId: null,
          kycSlot: null,
          replacedAt: null,
          retentionUntil: null,
          deletedAt: null,
          ...data,
        };
        hoistedState.uploads.set(row.reference, row);
        return row;
      },
      findUnique: async ({ where }: { where: { reference: string } }) =>
        hoistedState.uploads.get(where.reference) || null,
      update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        const row = [...hoistedState.uploads.values()].find(u => u.id === where.id)!;
        Object.assign(row, data);
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
        data: Record<string, unknown>;
      }) => {
        let count = 0;
        for (const u of hoistedState.uploads.values()) {
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
              'kycVerificationId' in cond && ((u.kycVerificationId as string | null) ?? null) === (cond.kycVerificationId ?? null)
            );
            if (!ok) continue;
          }
          Object.assign(u, data);
          count += 1;
        }
        return { count };
      },
    },
    identityVerification: {
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
        for (const k of hoistedState.kycs.values()) {
          if (where.sellerProfile?.userId && k.userId !== where.sellerProfile.userId) continue;
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
            const matched = where.OR.some(
              c =>
                (c.documentUrl && k.documentUrl === c.documentUrl) ||
                (c.documentBackUrl && k.documentBackUrl === c.documentBackUrl) ||
                (c.selfieUrl && k.selfieUrl === c.selfieUrl)
            );
            if (!matched) continue;
          }
          return k;
        }
        return null;
      },
      findUnique: async ({ where }: { where: { id?: string; sellerProfileId?: string } }) => {
        const k = [...hoistedState.kycs.values()].find(item => item.id === where.id || item.sellerProfileId === where.sellerProfileId);
        return k ? { ...k, sellerProfile: { id: k.sellerProfileId, userId: k.userId, status: 'APPROVED', user: hoistedState.users.get(k.userId)! } } : null;
      },
      findUniqueOrThrow: async ({ where }: { where: { id: string } }) => {
        const k = hoistedState.kycs.get(where.id);
        if (!k) throw new Error('Not found');
        return k;
      },
      updateMany: async ({ where, data }: { where: { id: string; version?: number }; data: Record<string, unknown> }) => {
        const k = hoistedState.kycs.get(where.id);
        if (!k || (where.version !== undefined && k.version !== where.version)) {
          return { count: 0 };
        }
        Object.assign(k, data);
        return { count: 1 };
      },
    },
    sellerProfile: {
      findUnique: async () => ({ id: 'sp-a', userId: 'seller-a', status: 'APPROVED', verificationStatus: 'NOT_SUBMITTED', user: { id: 'seller-a', role: 'SELLER', status: 'ACTIVE' }, identityVerification: null }),
      update: async () => ({}),
    },
    kycReviewHistory: {
      create: async ({ data }: { data: Record<string, unknown> }) => ({ id: 'khist-1', createdAt: new Date(), ...data }),
    },
    adminAuditLog: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        hoistedState.audits.push(data);
        return { id: `audit_${hoistedState.audits.length}`, ...data };
      },
    },
  };

  return { state: hoistedState, txClient: hoistedTxClient };
});

vi.mock('../../apps/api/src/middlewares/requireAuth', () => ({
  requireAuth: (req: express.Request & { user?: { userId: string; role: string; sessionId: string; expiresAt: number } }, res: express.Response, next: express.NextFunction) => {
    const actor = req.headers.authorization?.replace('Bearer ', '');
    if (!actor || !state.users.has(actor)) {
      res.status(401).json({ success: false });
      return;
    }
    const dbUser = state.users.get(actor)!;
    const spoofRole = req.headers['x-spoof-role'] as string | undefined;
    req.user = { userId: dbUser.id, role: spoofRole || dbUser.role, sessionId: 'sess', expiresAt: Date.now() + 60000 };
    next();
  },
}));

vi.mock('../../apps/api/src/modules/auth/token', () => ({
  authenticateAccess: async (token: string) => {
    const u = state.users.get(token);
    if (!u) throw new Error('Unauthorized');
    return { userId: u.id, role: u.role, sessionId: 'sess', expiresAt: Date.now() + 60000 };
  },
}));

vi.mock('../../apps/api/src/lib/prisma', () => ({
  prisma: {
    ...txClient,
    $transaction: async <T>(fn: (tx: typeof txClient) => Promise<T>) => fn(txClient),
  },
}));

import { uploadRouter } from '../../apps/api/src/modules/upload/upload.route';
import { createAdminKycRouter } from '../../apps/api/src/modules/kyc/kyc.route';
import { KycService } from '../../apps/api/src/modules/kyc/kyc.service';
import { UnavailableMalwareScanner, type MalwareScanner } from '../../apps/api/src/modules/kyc/malware-scanner';

const png = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 1]);

describe('KYC PII encryption, IDOR prevention, and private storage security controls', () => {
  beforeEach(() => {
    state.users.clear();
    state.kycs.clear();
    state.uploads.clear();
    state.audits = [];
    state.users.set('seller-a', { id: 'seller-a', role: 'SELLER', status: 'ACTIVE' });
    state.users.set('seller-b', { id: 'seller-b', role: 'SELLER', status: 'ACTIVE' });
    state.users.set('buyer-spoof', { id: 'buyer-spoof', role: 'BUYER', status: 'ACTIVE' });
    state.users.set('suspended-admin', { id: 'suspended-admin', role: 'ADMIN', status: 'SUSPENDED' });
    state.users.set('real-admin', { id: 'real-admin', role: 'ADMIN', status: 'ACTIVE' });
  });

  it('encrypts/decrypts sensitive PII with authenticated AES-256-GCM and redacts metadata', () => {
    const encrypted = encryptSensitiveField('DL-99887766');
    expect(encrypted.startsWith('v2:')).toBe(true);
    expect(encrypted).not.toContain('DL-99887766');
    expect(decryptSensitiveField(encrypted)).toBe('DL-99887766');
    expect(hmacDocumentNumber(' dl-99887766 ')).toBe(hmacDocumentNumber('DL99887766'));
    expect(maskDocumentNumber('DL-99887766')).toBe('•••••••7766');
    expect(maskDateOfBirth('1991-08-23')).toBe('1991-**-**');

    // Tampered ciphertext throws authentication error
    const tampered = `${encrypted.slice(0, -2)}ff`;
    expect(() => decryptSensitiveField(tampered)).toThrow();

    const sanitized = sanitizeAuditMetadata({
      documentNumber: 'SECRET-DOC',
      dateOfBirth: '1991-08-23',
      resetToken: 'abcd1234',
      password: 'plain',
      nested: { fileBuffer: 'binary' },
      slot: 'front',
    }) as Record<string, unknown>;
    expect(sanitized.documentNumber).toBe('[REDACTED]');
    expect(sanitized.dateOfBirth).toBe('[REDACTED]');
    expect(sanitized.resetToken).toBe('[REDACTED]');
    expect(sanitized.password).toBe('[REDACTED]');
    expect((sanitized.nested as Record<string, unknown>).fileBuffer).toBe('[REDACTED]');
    expect(sanitized.slot).toBe('front');
  });

  it('blocks public exposure, cross-seller IDOR, forged URL injection, and suspended-admin access', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'tascora-kyc-sec-'));
    try {
      const storage = new LocalStorage(dir);
      const app = express();
      app.use(express.json());
      app.use('/api/v1/uploads', uploadRouter(storage));
      app.use('/api/v1/admin', (req: express.Request & { user?: { userId: string; role: string } }, res, next) => {
        const actor = req.headers.authorization?.replace('Bearer ', '');
        if (!actor || !state.users.has(actor)) { res.status(401).json({ success: false }); return; }
        req.user = { userId: actor, role: (req.headers['x-spoof-role'] as string) || state.users.get(actor)!.role };
        next();
      }, createAdminKycRouter(storage));
      app.use((err: { status?: number; code?: string; message?: string }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
        res.status(err.status || 500).json({ success: false, error: { code: err.code, message: err.message } });
      });

      const uploaded = await request(app)
        .post('/api/v1/uploads')
        .set('Authorization', 'Bearer seller-a')
        .set('Content-Type', 'image/png')
        .send(png);
      const file = uploaded.body.data.id as string;
      const ref = uploaded.body.data.reference as string;

      state.kycs.set('ckyc_sec_000a', {
        id: 'ckyc_sec_000a',
        sellerProfileId: 'sp-a',
        userId: 'seller-a',
        status: 'PENDING',
        scanStatus: 'QUARANTINED',
        documentUrl: ref,
        documentBackUrl: null,
        selfieUrl: null,
        version: 1,
      });

      // Public route cannot access KYC docs
      expect((await request(app).get(`/api/v1/uploads/public/seller-a/${file}`)).status).toBe(404);

      // Unauthenticated cannot access KYC upload route
      expect((await request(app).get(`/api/v1/uploads/kyc/seller-a/${file}`)).status).toBe(401);

      // Other seller & buyer IDOR attempt receive 404 without confirmation
      expect((await request(app).get(`/api/v1/uploads/kyc/seller-a/${file}`).set('Authorization', 'Bearer seller-b')).status).toBe(404);
      expect((await request(app).get(`/api/v1/uploads/kyc/seller-a/${file}`).set('Authorization', 'Bearer buyer-spoof')).status).toBe(404);

      // Suspended admin cannot access KYC detail/docs
      expect((await request(app).get('/api/v1/admin/kyc/ckyc_sec_000a/documents/front').set('Authorization', 'Bearer suspended-admin')).status).toBe(403);

      // Buyer spoofing ADMIN role header rejected by DB active-admin guard
      expect((await request(app).get('/api/v1/admin/kyc/ckyc_sec_000a/documents/front').set('Authorization', 'Bearer buyer-spoof').set('X-Spoof-Role', 'ADMIN')).status).toBe(403);

      // Cross-seller upload reference injection rejected before DB lock
      await expect(
        KycService.submitKyc('seller-a', {
          documentType: 'PASSPORT',
          documentNumber: 'P1234567',
          legalName: 'Seller A',
          dateOfBirth: '1990-01-01',
          country: 'US',
          documentFrontUrl: `upload:seller-b/${file}`,
        })
      ).rejects.toThrow('another user');

      // Fail closed: active admin & owner CANNOT download QUARANTINED documents or view/approve them
      const blockedAdminDoc = await request(app)
        .get('/api/v1/admin/kyc/ckyc_sec_000a/documents/front')
        .set('Authorization', 'Bearer real-admin');
      expect(blockedAdminDoc.status).toBe(423);
      expect(blockedAdminDoc.body.error.code).toBe('KYC_DOCUMENT_QUARANTINED');

      const blockedUploadRoute = await request(app)
        .get(`/api/v1/uploads/kyc/seller-a/${file}`)
        .set('Authorization', 'Bearer real-admin');
      expect(blockedUploadRoute.status).toBe(423);

      const blockedOwnerUpload = await request(app)
        .get(`/api/v1/uploads/kyc/seller-a/${file}`)
        .set('Authorization', 'Bearer seller-a');
      expect(blockedOwnerUpload.status).toBe(423);

      expect(state.audits.some(a => a.action === 'KYC_DOCUMENT_VIEWED')).toBe(false);

      await expect(
        KycService.reviewKycDecision('ckyc_sec_000a', 'real-admin', 'APPROVED', {
          reason: 'Should fail until verified clean',
          expectedVersion: 1,
        })
      ).rejects.toMatchObject({ status: 409, code: 'KYC_SECURITY_SCAN_REQUIRED' });

      // Unavailable scanner keeps document fail-closed (QUARANTINED)
      const unavailableScan = await KycService.scanPendingDocuments(
        'ckyc_sec_000a',
        new UnavailableMalwareScanner(),
        storage
      );
      expect(unavailableScan.scanStatus).toBe('QUARANTINED');

      // Failing scanner transitions cleanly to retryable fail-closed SCAN_FAILED
      const crashingScanner: MalwareScanner = {
        providerName: 'test-crash',
        scanBuffer: async () => {
          throw new Error('Daemon offline');
        },
      };
      const failedScan = await KycService.scanPendingDocuments('ckyc_sec_000a', crashingScanner, storage);
      expect(failedScan.scanStatus).toBe('SCAN_FAILED');
      expect(
        (await request(app).get('/api/v1/admin/kyc/ckyc_sec_000a/documents/front').set('Authorization', 'Bearer real-admin')).status
      ).toBe(423);

      // Malware detection marks INFECTED and permanently blocks access, re-scan promotion & approval
      const infectedScanner: MalwareScanner = {
        providerName: 'test-clamd',
        scanBuffer: async () => ({
          scanStatus: 'INFECTED',
          verdict: 'INFECTED',
          resultDetail: 'Eicar-Signature',
          engineVersion: 'ClamAV 1.4.0',
          scannedAt: new Date(),
        }),
      };
      const infectedScan = await KycService.scanPendingDocuments('ckyc_sec_000a', infectedScanner, storage);
      expect(infectedScan.scanStatus).toBe('INFECTED');
      expect(infectedScan.scanResult).toContain('Eicar-Signature');
      const blockedInfected = await request(app)
        .get('/api/v1/admin/kyc/ckyc_sec_000a/documents/front')
        .set('Authorization', 'Bearer real-admin');
      expect(blockedInfected.status).toBe(423);
      expect(blockedInfected.body.error.code).toBe('KYC_DOCUMENT_INFECTED');

      // Clean scanner CANNOT auto-clear or overwrite an INFECTED record without a fresh resubmission
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
      await expect(
        KycService.scanPendingDocuments('ckyc_sec_000a', cleanScanner, storage)
      ).rejects.toMatchObject({ status: 409, code: 'KYC_DOCUMENT_INFECTED' });
      expect(state.kycs.get('ckyc_sec_000a')!.scanStatus).toBe('INFECTED');

      // A clean upload on a quarantined record promotes to VERIFIED_SAFE and unlocks audited download
      const cleanUpload = await request(app)
        .post('/api/v1/uploads?purpose=kyc')
        .set('Authorization', 'Bearer seller-a')
        .set('Content-Type', 'image/png')
        .send(png);
      const cleanFile = cleanUpload.body.data.id as string;
      state.kycs.set('ckyc_sec_clean', {
        id: 'ckyc_sec_clean',
        sellerProfileId: 'sp-clean',
        userId: 'seller-a',
        status: 'PENDING',
        scanStatus: 'QUARANTINED',
        documentUrl: cleanUpload.body.data.reference as string,
        documentBackUrl: null,
        selfieUrl: null,
        version: 1,
      });

      const cleanScan = await KycService.scanPendingDocuments('ckyc_sec_clean', cleanScanner, storage);
      expect(cleanScan.scanStatus).toBe('VERIFIED_SAFE');

      const ok = await request(app)
        .get(`/api/v1/uploads/kyc/seller-a/${cleanFile}`)
        .set('Authorization', 'Bearer real-admin');
      expect(ok.status).toBe(200);
      expect(ok.headers['cache-control']).toBe('private, no-store');
      expect(ok.headers['content-disposition']).toContain('attachment');
      expect(ok.headers['content-security-policy']).toContain('sandbox');
      expect(ok.headers['x-tascora-scan-status']).toBe('VERIFIED_SAFE');
      expect(state.audits.some(a => a.action === 'KYC_DOCUMENT_VIEWED' && a.adminId === 'real-admin')).toBe(true);
    } finally {
      await fs.rm(dir, { recursive: true, force: true });
    }
  });

  it('never issues S3 presigned URLs for quarantined files and allows 60s attachment-only S3 presigned URLs only for VERIFIED_SAFE', async () => {
    const readSpy = vi.fn().mockResolvedValue({
      kind: 'redirect' as const,
      url: 'https://s3.invalid/presigned?X-Amz-Expires=60&response-content-disposition=attachment',
    });
    const spyStorage = {
      put: vi.fn(),
      read: readSpy,
    };

    state.kycs.set('ckyc_s3_quarantine', {
      id: 'ckyc_s3_quarantine',
      sellerProfileId: 'sp-a',
      userId: 'seller-a',
      status: 'PENDING',
      scanStatus: 'QUARANTINED',
      documentUrl: 'upload:seller-a/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa.png',
      documentBackUrl: null,
      selfieUrl: null,
      version: 1,
    });

    await expect(
      KycService.accessAdminKycDocument('ckyc_s3_quarantine', 'front', 'real-admin', spyStorage)
    ).rejects.toMatchObject({ status: 423, code: 'KYC_DOCUMENT_QUARANTINED' });
    expect(readSpy).not.toHaveBeenCalled();

    state.kycs.get('ckyc_s3_quarantine')!.scanStatus = 'VERIFIED_SAFE';
    const allowed = await KycService.accessAdminKycDocument('ckyc_s3_quarantine', 'front', 'real-admin', spyStorage);
    expect(allowed.scanStatus).toBe('VERIFIED_SAFE');
    expect(readSpy).toHaveBeenCalledOnce();

    const client = new S3Client({ region: 'us-east-1', credentials: { accessKeyId: 'test', secretAccessKey: 'test' } });
    const s3 = new S3Storage(client, 'kyc-private-bucket');
    const result = await s3.read('seller-a/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa.png');
    expect(result.kind).toBe('redirect');
    if (result.kind === 'redirect') {
      expect(result.url).toContain('X-Amz-Expires=60');
      expect(result.url).toContain('response-content-disposition=attachment');
      expect(result.url).toContain('response-cache-control=private%2C%20no-store');
    }
    client.destroy();
  });

  it('rejects concurrent evidence promotion during scanning if files change', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'tascora-kyc-toctou-'));
    try {
      const storage = new LocalStorage(dir);
      const key = 'seller-a/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa.png';
      await storage.put(key, png, 'image/png');
      state.kycs.set('ckyc_toctou', {
        id: 'ckyc_toctou',
        sellerProfileId: 'sp-a',
        userId: 'seller-a',
        status: 'PENDING',
        scanStatus: 'QUARANTINED',
        documentUrl: `upload:${key}`,
        documentBackUrl: null,
        selfieUrl: null,
        version: 1,
      });

      const mutatingScanner: MalwareScanner = {
        providerName: 'test-race',
        scanBuffer: async () => {
          const row = state.kycs.get('ckyc_toctou')!;
          row.version += 1;
          row.scanStatus = 'QUARANTINED';
          row.documentUrl = 'upload:seller-a/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb.png';
          return {
            scanStatus: 'VERIFIED_SAFE',
            verdict: 'CLEAN',
            resultDetail: 'CLEAN',
            engineVersion: 'ClamAV 1.4.0',
            scannedAt: new Date(),
          };
        },
      };

      await expect(
        KycService.scanPendingDocuments('ckyc_toctou', mutatingScanner, storage)
      ).rejects.toMatchObject({ status: 409, code: 'KYC_CONCURRENT_MODIFICATION' });
      expect(state.kycs.get('ckyc_toctou')!.scanStatus).toBe('QUARANTINED');
    } finally {
      await fs.rm(dir, { recursive: true, force: true });
    }
  });
});
