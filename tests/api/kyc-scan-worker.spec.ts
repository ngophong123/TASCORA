import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

interface KycRecord {
  id: string;
  sellerProfileId: string;
  status: string;
  scanStatus: string;
  scanResult: string | null;
  scannedAt: Date | null;
  scanEngineVersion: string | null;
  scanAttempts: number;
  lastScanAttemptAt: Date | null;
  nextScanRetryAt: Date | null;
  scanLeaseExpiresAt: Date | null;
  scanClaimId: string | null;
  documentUrl: string;
  documentBackUrl: string | null;
  selfieUrl: string | null;
  submittedAt: Date;
  version: number;
  sellerProfile: { id: string; userId: string };
}

interface UploadRow {
  id: string;
  reference: string;
  objectKey: string;
  ownerId: string;
  purpose: string;
  lifecycleStatus: string;
  scanStatus: string;
  scanResult: string | null;
  scannedAt: Date | null;
  scanEngineVersion: string | null;
  retentionUntil: Date | null;
  deletedAt: Date | null;
  kycVerificationId?: string | null;
  kycSlot?: string | null;
  createdAt?: Date;
}

const store = vi.hoisted(() => ({
  kycs: new Map<string, KycRecord>(),
  uploads: new Map<string, UploadRow>(),
  scanner: {
    providerName: 'mock-clamd',
    scanBuffer: vi.fn(),
  },
}));

vi.mock('../../apps/api/src/lib/prisma', () => {
  const matchesWhere = (row: KycRecord, where: Record<string, unknown>): boolean => {
    for (const [k, v] of Object.entries(where)) {
      if (k === 'OR' && Array.isArray(v)) {
        if (!v.some(sub => matchesWhere(row, sub as Record<string, unknown>))) return false;
        continue;
      }
      if (v && typeof v === 'object' && !(v instanceof Date)) {
        const cond = v as Record<string, unknown>;
        const actual = (row as unknown as Record<string, unknown>)[k];
        if ('in' in cond && Array.isArray(cond.in)) {
          if (!cond.in.includes(actual)) return false;
        }
        if ('lt' in cond) {
          if (typeof actual !== 'number' || actual >= (cond.lt as number)) return false;
        }
        if ('lte' in cond) {
          if (!(actual instanceof Date) || actual.getTime() > (cond.lte as Date).getTime()) return false;
        }
        continue;
      }
      if ((row as unknown as Record<string, unknown>)[k] !== v) return false;
    }
    return true;
  };

  const client = {
    $queryRaw: async () => [{ '?column?': 1 }],
    identityVerification: {
      findMany: async ({ where = {}, take = 10 }: { where?: Record<string, unknown>; take?: number } = {}) =>
        [...store.kycs.values()]
          .filter(k => matchesWhere(k, where))
          .sort((a, b) => a.submittedAt.getTime() - b.submittedAt.getTime())
          .slice(0, take)
          .map(k => ({ id: k.id })),
      findUnique: async ({ where }: { where: { id?: string } }) => {
        const k = where.id ? store.kycs.get(where.id) : null;
        return k ? { ...k } : null;
      },
      findUniqueOrThrow: async ({ where }: { where: { id: string } }) => {
        const k = store.kycs.get(where.id);
        if (!k) throw new Error('Not found');
        return { ...k };
      },
      updateMany: async ({ where, data }: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
        const row = store.kycs.get(String(where.id));
        if (!row) return { count: 0 };
        if (where.version !== undefined && row.version !== where.version) return { count: 0 };
        Object.assign(row, data);
        return { count: 1 };
      },
    },
    uploadObject: {
      findUnique: async ({ where }: { where: { reference?: string } }) =>
        where.reference ? store.uploads.get(where.reference) ?? null : null,
      findMany: async ({ where = {}, take = 50 }: { where?: Record<string, unknown>; take?: number } = {}) => {
        const out: UploadRow[] = [];
        const lifeObj = where.lifecycleStatus;
        const lifeList =
          typeof lifeObj === 'string'
            ? [lifeObj]
            : (lifeObj as { in?: string[] } | undefined)?.in;
        const lteRetention = (where.retentionUntil as { lte?: Date } | undefined)?.lte;
        const lteCreated = (where.createdAt as { lte?: Date } | undefined)?.lte;
        for (const u of store.uploads.values()) {
          if (where.purpose && u.purpose !== where.purpose) continue;
          if (lifeList && !lifeList.includes(u.lifecycleStatus)) continue;
          if ('kycVerificationId' in where) {
            const expectedKycId = (where as { kycVerificationId?: string | null }).kycVerificationId ?? null;
            if ((u.kycVerificationId ?? null) !== expectedKycId) continue;
          }
          if (lteRetention && (!u.retentionUntil || u.retentionUntil.getTime() > lteRetention.getTime())) continue;
          if (lteCreated && (!u.createdAt || u.createdAt.getTime() > lteCreated.getTime())) continue;
          out.push(u);
          if (out.length >= take) break;
        }
        return out;
      },
      update: async ({ where, data }: { where: { id: string }; data: Partial<UploadRow> }) => {
        for (const row of store.uploads.values()) {
          if (row.id === where.id) {
            Object.assign(row, data);
            return row;
          }
        }
        throw new Error('UploadObject not found');
      },
      updateMany: async ({
        where,
        data,
      }: {
        where: {
          id?: string;
          reference?: { in: string[] };
          purpose?: string;
          lifecycleStatus?: string | { in: string[] };
          kycVerificationId?: string | null;
          retentionUntil?: { lte?: Date };
          createdAt?: { lte?: Date };
        };
        data: Partial<UploadRow>;
      }) => {
        let count = 0;
        for (const row of store.uploads.values()) {
          if (where.id && row.id !== where.id) continue;
          if (where.reference?.in && !where.reference.in.includes(row.reference)) continue;
          if (where.purpose && row.purpose !== where.purpose) continue;
          if (where.lifecycleStatus) {
            if (typeof where.lifecycleStatus === 'string') {
              if (row.lifecycleStatus !== where.lifecycleStatus) continue;
            } else if (!where.lifecycleStatus.in.includes(row.lifecycleStatus)) {
              continue;
            }
          }
          if ('kycVerificationId' in where && (row.kycVerificationId ?? null) !== (where.kycVerificationId ?? null)) {
            continue;
          }
          if (where.retentionUntil?.lte && (!row.retentionUntil || row.retentionUntil.getTime() > where.retentionUntil.lte.getTime())) {
            continue;
          }
          if (where.createdAt?.lte && (!row.createdAt || row.createdAt.getTime() > where.createdAt.lte.getTime())) {
            continue;
          }
          Object.assign(row, data);
          count += 1;
        }
        return { count };
      },
    },
  };

  return { prisma: { ...client, $transaction: async <T>(fn: (tx: typeof client) => Promise<T>) => fn(client) } };
});

vi.mock('../../apps/api/src/modules/kyc/malware-scanner', async () => {
  const actual = await vi.importActual<typeof import('../../apps/api/src/modules/kyc/malware-scanner')>(
    '../../apps/api/src/modules/kyc/malware-scanner'
  );
  return {
    ...actual,
    createDefaultMalwareScanner: () => store.scanner,
  };
});

import { KycService } from '../../apps/api/src/modules/kyc/kyc.service';
import { LocalStorage } from '../../apps/api/src/modules/upload/storage';
import { runKycScanWorkerTick, stopKycScanWorker } from '../../apps/api/src/workers/kyc-scan.worker';

function makeKyc(id: string, userId: string, ref: string, overrides: Partial<KycRecord> = {}): KycRecord {
  return {
    id,
    sellerProfileId: `sp-${id}`,
    status: 'PENDING',
    scanStatus: 'QUARANTINED',
    scanResult: null,
    scannedAt: null,
    scanEngineVersion: null,
    scanAttempts: 0,
    lastScanAttemptAt: null,
    nextScanRetryAt: null,
    scanLeaseExpiresAt: null,
    scanClaimId: null,
    documentUrl: ref,
    documentBackUrl: null,
    selfieUrl: null,
    submittedAt: new Date('2026-11-15T00:00:00Z'),
    version: 1,
    sellerProfile: { id: `sp-${id}`, userId },
    ...overrides,
  };
}

describe('Workstream A: KYC automated scan worker, leasing, retry backoff & forensic retention', () => {
  beforeEach(() => {
    store.kycs.clear();
    store.uploads.clear();
    store.scanner.providerName = 'mock-clamd';
    store.scanner.scanBuffer.mockReset();
    vi.restoreAllMocks();
  });

  it('processes due records, isolates per-record crashes, enforces backoff & retry ceilings, and recovers expired leases', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'tascora-worker-test-'));
    try {
      const storage = new LocalStorage(dir);
      const validBytes = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 1]);

      const refOk = 'upload:u1/11111111-1111-4111-8111-111111111111.png';
      const refMissing = 'upload:u2/22222222-2222-4222-8222-222222222222.png';
      const refExpiredLease = 'upload:u3/33333333-3333-4333-8333-333333333333.png';
      const refMaxed = 'upload:u4/44444444-4444-4444-8444-444444444444.png';
      const refFutureBackoff = 'upload:u5/55555555-5555-4555-8555-555555555555.png';
      const refInfected = 'upload:u6/66666666-6666-4666-8666-666666666666.png';

      await storage.put('u1/11111111-1111-4111-8111-111111111111.png', validBytes, 'image/png');
      // refMissing intentionally not written to trigger storage read error!
      await storage.put('u3/33333333-3333-4333-8333-333333333333.png', validBytes, 'image/png');

      const now = new Date('2026-11-15T10:00:00Z');
      store.kycs.set('kyc-missing', makeKyc('kyc-missing', 'u2', refMissing, { submittedAt: new Date('2026-11-15T01:00:00Z') }));
      store.kycs.set('kyc-ok', makeKyc('kyc-ok', 'u1', refOk, { submittedAt: new Date('2026-11-15T02:00:00Z') }));
      store.kycs.set(
        'kyc-lease-expired',
        makeKyc('kyc-lease-expired', 'u3', refExpiredLease, {
          scanStatus: 'SCANNING',
          scanLeaseExpiresAt: new Date(now.getTime() - 10_000),
          scanClaimId: 'dead-worker',
          scanAttempts: 1,
          submittedAt: new Date('2026-11-15T03:00:00Z'),
        })
      );
      store.kycs.set(
        'kyc-maxed',
        makeKyc('kyc-maxed', 'u4', refMaxed, {
          scanStatus: 'SCAN_FAILED',
          scanAttempts: 3,
          nextScanRetryAt: null,
        })
      );
      store.kycs.set(
        'kyc-backoff',
        makeKyc('kyc-backoff', 'u5', refFutureBackoff, {
          scanStatus: 'SCAN_FAILED',
          scanAttempts: 1,
          nextScanRetryAt: new Date(now.getTime() + 60_000),
        })
      );
      store.kycs.set(
        'kyc-infected',
        makeKyc('kyc-infected', 'u6', refInfected, {
          scanStatus: 'INFECTED',
          scanAttempts: 1,
        })
      );

      store.uploads.set(refOk, {
        id: 'up-1',
        reference: refOk,
        objectKey: 'u1/11111111-1111-4111-8111-111111111111.png',
        ownerId: 'u1',
        purpose: 'KYC',
        lifecycleStatus: 'ACTIVE',
        scanStatus: 'QUARANTINED',
        scanResult: null,
        scannedAt: null,
        scanEngineVersion: null,
        retentionUntil: null,
        deletedAt: null,
        kycVerificationId: 'kyc-ok',
        createdAt: now,
      });

      const scanner = {
        providerName: 'mock-clamd',
        async scanBuffer() {
          return {
            verdict: 'CLEAN' as const,
            scanStatus: 'VERIFIED_SAFE' as const,
            engineVersion: 'ClamAV 1.4.2',
            resultDetail: 'Clean',
            scannedAt: now,
          };
        },
      };

      const summary = await KycService.processPendingScanBatch({
        limit: 10,
        maxAttempts: 3,
        baseRetryDelayMs: 5_000,
        scanner,
        storage,
        now,
      });

      // Only 3 eligible records (missing, ok, expired lease); maxed, future backoff, and infected skipped.
      expect(summary).toEqual({
        scanned: 3,
        succeeded: 2,
        failed: 1,
        skippedUnconfigured: false,
        purgedUploads: 0,
      });

      expect(store.kycs.get('kyc-ok')!.scanStatus).toBe('VERIFIED_SAFE');
      expect(store.uploads.get(refOk)!.scanStatus).toBe('VERIFIED_SAFE');
      expect(store.kycs.get('kyc-lease-expired')!.scanStatus).toBe('VERIFIED_SAFE');
      expect(store.kycs.get('kyc-missing')!.scanStatus).toBe('SCAN_FAILED');
      expect(store.kycs.get('kyc-missing')!.scanAttempts).toBe(1);
      expect(store.kycs.get('kyc-missing')!.nextScanRetryAt!.getTime()).toBe(now.getTime() + 5_000);
      expect(store.kycs.get('kyc-infected')!.scanStatus).toBe('INFECTED');
      expect(store.kycs.get('kyc-backoff')!.scanAttempts).toBe(1);

      // Re-scanning an active unexpired lease rejects with 409 KYC_SCAN_IN_PROGRESS.
      store.kycs.set(
        'kyc-active-lease',
        makeKyc('kyc-active-lease', 'u1', refOk, {
          scanStatus: 'SCANNING',
          scanLeaseExpiresAt: new Date(now.getTime() + 30_000),
          scanClaimId: 'other-worker',
        })
      );
      await expect(
        KycService.scanPendingDocuments('kyc-active-lease', scanner, storage, { now })
      ).rejects.toMatchObject({ status: 409, code: 'KYC_SCAN_IN_PROGRESS' });

      // Reaching maxAttempts clears nextScanRetryAt so failed records hit retry ceiling cleanly.
      const kycMissing = store.kycs.get('kyc-missing')!;
      await KycService.scanPendingDocuments('kyc-missing', scanner, storage, {
        maxAttempts: 2,
        now: new Date(now.getTime() + 10_000),
      });
      expect(kycMissing.scanAttempts).toBe(2);
      expect(kycMissing.scanStatus).toBe('SCAN_FAILED');
      expect(kycMissing.nextScanRetryAt).toBeNull();
    } finally {
      await fs.rm(dir, { recursive: true, force: true });
    }
  });

  it('prevents overlapping worker ticks and waits for in-flight tick during shutdown', async () => {
    let resolveBatch!: () => void;
    const gate = new Promise<void>(resolve => {
      resolveBatch = resolve;
    });
    const spy = vi.spyOn(KycService, 'processPendingScanBatch').mockImplementation(async () => {
      await gate;
      return { scanned: 1, succeeded: 1, failed: 0, skippedUnconfigured: false, purgedUploads: 0 };
    });

    const p1 = runKycScanWorkerTick();
    const p2 = runKycScanWorkerTick();
    expect(spy).toHaveBeenCalledTimes(1);

    let shutdownCompleted = false;
    const stopping = stopKycScanWorker().then(() => {
      shutdownCompleted = true;
    });

    await Promise.resolve();
    expect(shutdownCompleted).toBe(false);

    resolveBatch();
    await Promise.all([p1, p2, stopping]);
    expect(shutdownCompleted).toBe(true);
  });

  it('purges expired ORPHANED/REPLACED uploads while preserving INFECTED forensic evidence', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'tascora-purge-test-'));
    try {
      const storage = new LocalStorage(dir);
      await storage.put('u1/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.png', Buffer.from('old-replaced'), 'image/png');
      await storage.put('u1/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb.png', Buffer.from('infected-evidence'), 'image/png');

      const now = new Date('2026-11-15T12:00:00Z');
      store.uploads.set('upload:u1/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.png', {
        id: 'up-old',
        reference: 'upload:u1/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.png',
        objectKey: 'u1/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.png',
        ownerId: 'u1',
        purpose: 'KYC',
        lifecycleStatus: 'REPLACED',
        scanStatus: 'QUARANTINED',
        scanResult: null,
        scannedAt: null,
        scanEngineVersion: null,
        retentionUntil: new Date(now.getTime() - 1000),
        deletedAt: null,
      });
      store.uploads.set('upload:u1/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb.png', {
        id: 'up-infected',
        reference: 'upload:u1/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb.png',
        objectKey: 'u1/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb.png',
        ownerId: 'u1',
        purpose: 'KYC',
        lifecycleStatus: 'REPLACED',
        scanStatus: 'INFECTED',
        scanResult: 'Eicar FOUND',
        scannedAt: now,
        scanEngineVersion: 'ClamAV 1.4',
        // Infected uploads hold extended retention far in the future.
        retentionUntil: new Date(now.getTime() + 90 * 24 * 3600 * 1000),
        deletedAt: null,
      });

      const purged = await KycService.purgeExpiredUploads(storage, now);
      expect(purged).toBe(1);
      expect(store.uploads.get('upload:u1/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.png')!.lifecycleStatus).toBe('DELETED');
      await expect(storage.exists('u1/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.png')).resolves.toBe(false);
      await expect(storage.exists('u1/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb.png')).resolves.toBe(true);
    } finally {
      await fs.rm(dir, { recursive: true, force: true });
    }
  });

  it('marks expired unattached KYC uploads ORPHANED, preserves recent/attached/GENERAL uploads, and purges safely', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'tascora-orphan-kyc-'));
    try {
      const storage = new LocalStorage(dir);
      const staleUnattachedKey = 'u1/11111111-1111-4111-8111-111111111112.png';
      const recentUnattachedKey = 'u1/22222222-2222-4222-8222-222222222223.png';
      const attachedKey = 'u1/33333333-3333-4333-8333-333333333334.png';
      const generalOldKey = 'u1/44444444-4444-4444-8444-444444444445.png';
      await storage.put(staleUnattachedKey, Buffer.from('stale-kyc'), 'image/png');
      await storage.put(recentUnattachedKey, Buffer.from('recent-kyc'), 'image/png');
      await storage.put(attachedKey, Buffer.from('attached-kyc'), 'image/png');
      await storage.put(generalOldKey, Buffer.from('old-general'), 'image/png');

      const now = new Date('2026-11-15T18:00:00Z');
      store.uploads.set(`upload:${staleUnattachedKey}`, {
        id: 'up-stale-kyc',
        reference: `upload:${staleUnattachedKey}`,
        objectKey: staleUnattachedKey,
        ownerId: 'u1',
        purpose: 'KYC',
        lifecycleStatus: 'ACTIVE',
        scanStatus: 'QUARANTINED',
        scanResult: null,
        scannedAt: null,
        scanEngineVersion: null,
        retentionUntil: null,
        deletedAt: null,
        kycVerificationId: null,
        createdAt: new Date(now.getTime() - 25 * 3600 * 1000),
      });
      store.uploads.set(`upload:${recentUnattachedKey}`, {
        id: 'up-recent-kyc',
        reference: `upload:${recentUnattachedKey}`,
        objectKey: recentUnattachedKey,
        ownerId: 'u1',
        purpose: 'KYC',
        lifecycleStatus: 'ACTIVE',
        scanStatus: 'QUARANTINED',
        scanResult: null,
        scannedAt: null,
        scanEngineVersion: null,
        retentionUntil: null,
        deletedAt: null,
        kycVerificationId: null,
        createdAt: new Date(now.getTime() - 10 * 60 * 1000),
      });
      store.uploads.set(`upload:${attachedKey}`, {
        id: 'up-attached-kyc',
        reference: `upload:${attachedKey}`,
        objectKey: attachedKey,
        ownerId: 'u1',
        purpose: 'KYC',
        lifecycleStatus: 'ACTIVE',
        scanStatus: 'QUARANTINED',
        scanResult: null,
        scannedAt: null,
        scanEngineVersion: null,
        retentionUntil: null,
        deletedAt: null,
        kycVerificationId: 'kyc-attached',
        createdAt: new Date(now.getTime() - 48 * 3600 * 1000),
      });
      store.uploads.set(`upload:${generalOldKey}`, {
        id: 'up-general-old',
        reference: `upload:${generalOldKey}`,
        objectKey: generalOldKey,
        ownerId: 'u1',
        purpose: 'GENERAL',
        lifecycleStatus: 'ACTIVE',
        scanStatus: 'NOT_REQUIRED',
        scanResult: null,
        scannedAt: null,
        scanEngineVersion: null,
        retentionUntil: null,
        deletedAt: null,
        kycVerificationId: null,
        createdAt: new Date(now.getTime() - 72 * 3600 * 1000),
      });

      const orphaned = await KycService.markAbandonedKycUploadsOrphaned(now);
      expect(orphaned).toBe(1);

      const staleRow = store.uploads.get(`upload:${staleUnattachedKey}`)!;
      expect(staleRow.lifecycleStatus).toBe('ORPHANED');
      expect(staleRow.retentionUntil).toBeInstanceOf(Date);
      expect(staleRow.retentionUntil!.getTime()).toBeGreaterThan(now.getTime());

      expect(store.uploads.get(`upload:${recentUnattachedKey}`)!.lifecycleStatus).toBe('ACTIVE');
      expect(store.uploads.get(`upload:${attachedKey}`)!.lifecycleStatus).toBe('ACTIVE');
      expect(store.uploads.get(`upload:${generalOldKey}`)!.lifecycleStatus).toBe('ACTIVE');

      // Nothing purges before retentionUntil expires.
      expect(await KycService.purgeExpiredUploads(storage, now)).toBe(0);
      await expect(storage.exists(staleUnattachedKey)).resolves.toBe(true);

      // Once retentionUntil expires, transient storage failure preserves ORPHANED metadata so retry still deletes it.
      const afterRetention = new Date(staleRow.retentionUntil!.getTime() + 1000);
      const delSpy = vi.spyOn(storage, 'delete').mockRejectedValueOnce(new Error('Transient S3 timeout'));
      expect(await KycService.purgeExpiredUploads(storage, afterRetention)).toBe(0);
      expect(staleRow.lifecycleStatus).toBe('ORPHANED');
      expect(staleRow.deletedAt).toBeNull();
      await expect(storage.exists(staleUnattachedKey)).resolves.toBe(true);
      delSpy.mockRestore();

      expect(await KycService.purgeExpiredUploads(storage, afterRetention)).toBe(1);
      expect(staleRow.lifecycleStatus).toBe('DELETED');
      expect(staleRow.deletedAt).toBeInstanceOf(Date);
      await expect(storage.exists(staleUnattachedKey)).resolves.toBe(false);
    } finally {
      await fs.rm(dir, { recursive: true, force: true });
    }
  });
});
