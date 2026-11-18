import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

interface KycRow {
  id: string;
  sellerProfileId: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'NEEDS_RESUBMISSION' | 'APPROVED' | 'REJECTED';
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
}

interface FingerprintRow {
  id: string;
  identityVerificationId: string;
  sellerProfileId: string;
  country: string;
  documentType: string;
  hmacVersion: string;
  documentNumberHash: string;
  createdAt: Date;
}

const state = vi.hoisted(() => ({
  users: new Map<string, { id: string; role: 'SELLER' | 'ADMIN'; status: 'ACTIVE' }>(),
  sellers: new Map<string, { id: string; userId: string; status: string; verificationStatus: string; stripeAccountId: null }>(),
  kycs: new Map<string, KycRow>(),
  fingerprints: new Map<string, FingerprintRow>(),
  uploads: new Map<string, { id: string; reference: string; objectKey: string; ownerId: string; purpose: string; lifecycleStatus: string; scanStatus: string; kycVerificationId: string | null; kycSlot: string | null }>(),
  histories: [] as Array<{ id: string; identityVerificationId: string; decision: string; previousState: string; newState: string; createdAt: Date }>,
  audits: [] as Array<{ id: string; action: string }>,
  yieldDuringTx: false,
}));

function makeUniqueError(target: string) {
  return Object.assign(
    new Error(`Unique constraint failed on ${target}`),
    { code: 'P2002', meta: { target } }
  );
}

vi.mock('../../apps/api/src/lib/prisma', () => {
  function syncTriggerFromVerification(row: KycRow) {
    if (row.status === 'REJECTED' || !row.documentNumberHash) {
      for (const [id, fp] of state.fingerprints.entries()) {
        if (fp.identityVerificationId === row.id) state.fingerprints.delete(id);
      }
      return;
    }

    const country = (row.country ?? '').trim().toUpperCase();
    for (const other of state.fingerprints.values()) {
      if (
        other.identityVerificationId !== row.id &&
        other.country === country &&
        other.documentType === row.documentType &&
        other.documentNumberHash === row.documentNumberHash
      ) {
        throw makeUniqueError('identity_document_fingerprints_country_documentType_documentNumberHash_key');
      }
    }

    const existing = [...state.fingerprints.values()].find(
      fp => fp.identityVerificationId === row.id && fp.hmacVersion === row.documentNumberHmacVersion
    );
    if (existing) {
      existing.sellerProfileId = row.sellerProfileId;
      existing.country = country;
      existing.documentType = row.documentType;
      existing.documentNumberHash = row.documentNumberHash;
    } else {
      const id = `fp_trig_${state.fingerprints.size + 1}`;
      state.fingerprints.set(id, {
        id,
        identityVerificationId: row.id,
        sellerProfileId: row.sellerProfileId,
        country,
        documentType: row.documentType,
        hmacVersion: row.documentNumberHmacVersion,
        documentNumberHash: row.documentNumberHash,
        createdAt: new Date(),
      });
    }
  }

  function matchWhere(k: KycRow, where: Record<string, unknown>): boolean {
    if (where.id) {
      if (typeof where.id === 'string' && k.id !== where.id) return false;
      if (typeof where.id === 'object' && where.id !== null) {
        const cond = where.id as { not?: string; gt?: string };
        if (cond.not && k.id === cond.not) return false;
        if (cond.gt && k.id <= cond.gt) return false;
      }
    }
    if (where.sellerProfileId) {
      if (typeof where.sellerProfileId === 'string' && k.sellerProfileId !== where.sellerProfileId) return false;
      if (typeof where.sellerProfileId === 'object' && where.sellerProfileId !== null) {
        const cond = where.sellerProfileId as { not?: string };
        if (cond.not && k.sellerProfileId === cond.not) return false;
      }
    }
    if (where.status && typeof where.status === 'object' && where.status !== null && 'not' in where.status) {
      if (k.status === (where.status as { not: string }).not) return false;
    }
    if (where.country !== undefined && k.country !== where.country) return false;
    if (where.documentType !== undefined && k.documentType !== where.documentType) return false;
    if (where.documentNumberEncrypted && typeof where.documentNumberEncrypted === 'object' && 'not' in where.documentNumberEncrypted) {
      if (k.documentNumberEncrypted === null) return false;
    }
    if (where.documentNumberHmacVersion) {
      if (typeof where.documentNumberHmacVersion === 'string') {
        if (k.documentNumberHmacVersion !== where.documentNumberHmacVersion) return false;
      } else if (typeof where.documentNumberHmacVersion === 'object' && 'not' in where.documentNumberHmacVersion) {
        if (k.documentNumberHmacVersion === (where.documentNumberHmacVersion as { not: string }).not) return false;
      }
    }
    if (where.documentNumberHash !== undefined) {
      if (typeof where.documentNumberHash === 'object' && where.documentNumberHash !== null && 'in' in where.documentNumberHash) {
        if (!k.documentNumberHash || !(where.documentNumberHash as { in: string[] }).in.includes(k.documentNumberHash)) return false;
      } else if (k.documentNumberHash !== where.documentNumberHash) {
        return false;
      }
    }
    if (where.documentFingerprints && typeof where.documentFingerprints === 'object' && 'none' in where.documentFingerprints) {
      const targetVer = (where.documentFingerprints as { none: { hmacVersion: string } }).none.hmacVersion;
      const hasTarget = [...state.fingerprints.values()].some(
        fp => fp.identityVerificationId === k.id && fp.hmacVersion === targetVer
      );
      if (hasTarget) return false;
    }
    if (Array.isArray(where.OR)) {
      const anyMatch = (where.OR as Record<string, unknown>[]).some(branch => matchWhere(k, branch));
      if (!anyMatch) return false;
    }
    return true;
  }

  const client = {
    $queryRaw: vi.fn().mockResolvedValue([{ '?column?': 1 }]),
    user: {
      findUnique: async ({ where }: { where: { id: string } }) => state.users.get(where.id) ?? null,
    },
    sellerProfile: {
      findUnique: async ({ where }: { where: { id?: string; userId?: string } }) => {
        const sp = [...state.sellers.values()].find(s => s.id === where.id || s.userId === where.userId);
        if (!sp) return null;
        const usr = state.users.get(sp.userId)!;
        const iv = [...state.kycs.values()].find(k => k.sellerProfileId === sp.id) ?? null;
        return { ...sp, user: usr, identityVerification: iv };
      },
      update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        const sp = state.sellers.get(where.id)!;
        Object.assign(sp, data);
        return sp;
      },
    },
    uploadObject: {
      findUnique: async ({ where }: { where: { reference: string } }) => state.uploads.get(where.reference) ?? null,
      updateMany: async ({ where, data }: { where: { id?: string }; data: Record<string, unknown> }) => {
        const row = [...state.uploads.values()].find(u => u.id === where.id);
        if (!row) return { count: 0 };
        Object.assign(row, data);
        return { count: 1 };
      },
      update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        const row = [...state.uploads.values()].find(u => u.id === where.id)!;
        Object.assign(row, data);
        return row;
      },
    },
    serviceImage: { findFirst: async () => null },
    message: { findFirst: async () => null },
    orderDelivery: { findFirst: async () => null },
    buyerProfile: { findFirst: async () => null },
    identityVerification: {
      findUnique: async ({ where }: { where: { id?: string; sellerProfileId?: string } }) => {
        const row =
          [...state.kycs.values()].find(
            k => k.id === where.id || k.sellerProfileId === where.sellerProfileId
          ) ?? null;
        if (!row) return null;
        const sp = state.sellers.get(row.sellerProfileId);
        return {
          ...row,
          sellerProfile: sp ? { ...sp, user: state.users.get(sp.userId) } : undefined,
        };
      },
      findUniqueOrThrow: async ({ where }: { where: { id: string } }) => {
        const row = state.kycs.get(where.id);
        if (!row) throw new Error('KYC record not found');
        const sp = state.sellers.get(row.sellerProfileId);
        return {
          ...row,
          sellerProfile: sp ? { ...sp, user: state.users.get(sp.userId) } : undefined,
        };
      },
      findFirst: async ({ where }: { where: Record<string, unknown> }) => {
        for (const k of state.kycs.values()) {
          if (matchWhere(k, where)) return k;
        }
        return null;
      },
      findMany: async ({ where = {}, take }: { where?: Record<string, unknown>; take?: number } = {}) => {
        const rows = [...state.kycs.values()]
          .filter(k => matchWhere(k, where))
          .sort((a, b) => a.id.localeCompare(b.id));
        return take !== undefined ? rows.slice(0, take) : rows;
      },
      count: async ({ where = {} }: { where?: Record<string, unknown> } = {}) =>
        [...state.kycs.values()].filter(k => matchWhere(k, where)).length,
      create: async ({ data }: { data: Partial<KycRow> & { sellerProfileId: string; documentType: string; documentUrl: string } }) => {
        if (state.yieldDuringTx) await Promise.resolve();
        const row: KycRow = {
          id: `kyc_${state.kycs.size + 1}`,
          status: 'PENDING',
          legalName: null,
          dateOfBirthEncrypted: null,
          documentNumberEncrypted: null,
          documentNumberHash: null,
          documentNumberHmacVersion: 'v1',
          documentNumberLast4: null,
          country: null,
          documentBackUrl: null,
          selfieUrl: null,
          scanStatus: 'QUARANTINED',
          scanResult: null,
          scannedAt: null,
          scanEngineVersion: null,
          scanAttempts: 0,
          lastScanAttemptAt: null,
          nextScanRetryAt: null,
          scanLeaseExpiresAt: null,
          scanClaimId: null,
          submittedAt: new Date(),
          reviewedAt: null,
          reviewedById: null,
          resubmissionRequestedAt: null,
          decisionReason: null,
          comments: null,
          version: 1,
          updatedAt: new Date(),
          ...data,
        };
        syncTriggerFromVerification(row);
        state.kycs.set(row.id, row);
        return row;
      },
      updateMany: async ({ where, data }: { where: { id: string; version?: number }; data: Partial<KycRow> }) => {
        const row = state.kycs.get(where.id);
        if (!row || (where.version !== undefined && row.version !== where.version)) return { count: 0 };
        const copy = { ...row, ...data, updatedAt: new Date() };
        syncTriggerFromVerification(copy);
        Object.assign(row, copy);
        return { count: 1 };
      },
    },
    identityDocumentFingerprint: {
      findMany: async ({ where }: { where: { identityVerificationId?: string } }) =>
        [...state.fingerprints.values()].filter(fp => fp.identityVerificationId === where.identityVerificationId),
      findFirst: async ({ where }: { where: Record<string, unknown> }) => {
        const hashCond = where.documentNumberHash as string | { in: string[] } | undefined;
        const hashSet =
          typeof hashCond === 'string' ? [hashCond] : hashCond?.in ?? [];
        const excludedVerification = (where.identityVerificationId as { not?: string } | undefined)?.not;
        const excludedSeller = (where.sellerProfileId as { not?: string } | undefined)?.not;
        for (const fp of state.fingerprints.values()) {
          if (excludedVerification && fp.identityVerificationId === excludedVerification) continue;
          if (excludedSeller && fp.sellerProfileId === excludedSeller) continue;
          if (where.country !== undefined && fp.country !== where.country) continue;
          if (where.documentType !== undefined && fp.documentType !== where.documentType) continue;
          if (hashSet.length > 0 && !hashSet.includes(fp.documentNumberHash)) continue;
          return fp;
        }
        return null;
      },
      deleteMany: async ({ where }: { where: { identityVerificationId: string } }) => {
        let count = 0;
        for (const [id, fp] of state.fingerprints.entries()) {
          if (fp.identityVerificationId === where.identityVerificationId) {
            state.fingerprints.delete(id);
            count += 1;
          }
        }
        return { count };
      },
      upsert: async ({
        where,
        update,
        create,
      }: {
        where: { identityVerificationId_hmacVersion: { identityVerificationId: string; hmacVersion: string } };
        update: Partial<FingerprintRow>;
        create: Omit<FingerprintRow, 'id' | 'createdAt'>;
      }) => {
        const country = (create.country ?? '').trim().toUpperCase();
        for (const fp of state.fingerprints.values()) {
          if (
            fp.identityVerificationId !== create.identityVerificationId &&
            fp.country === country &&
            fp.documentType === create.documentType &&
            fp.documentNumberHash === create.documentNumberHash
          ) {
            throw makeUniqueError('identity_document_fingerprints_country_documentType_documentNumberHash_key');
          }
        }
        const existing = [...state.fingerprints.values()].find(
          fp =>
            fp.identityVerificationId === where.identityVerificationId_hmacVersion.identityVerificationId &&
            fp.hmacVersion === where.identityVerificationId_hmacVersion.hmacVersion
        );
        if (existing) {
          Object.assign(existing, update);
          return existing;
        }
        const id = `fp_${state.fingerprints.size + 1}`;
        const created: FingerprintRow = { id, ...create, createdAt: new Date() };
        state.fingerprints.set(id, created);
        return created;
      },
    },
    kycReviewHistory: {
      create: async ({ data }: { data: { identityVerificationId: string; decision: string; previousState: string; newState: string } }) => {
        const entry = { id: `hist_${state.histories.length + 1}`, ...data, createdAt: new Date() };
        state.histories.push(entry);
        return entry;
      },
    },
    adminAuditLog: {
      create: async ({ data }: { data: { action: string } }) => {
        const entry = { id: `aud_${state.audits.length + 1}`, ...data };
        state.audits.push(entry);
        return entry;
      },
    },
  };

  return {
    prisma: {
      ...client,
      $transaction: async <T>(fn: (tx: typeof client) => Promise<T>) => {
        const kycSnap = new Map([...state.kycs.entries()].map(([k, v]) => [k, { ...v }]));
        const fpSnap = new Map([...state.fingerprints.entries()].map(([k, v]) => [k, { ...v }]));
        const spSnap = new Map([...state.sellers.entries()].map(([k, v]) => [k, { ...v }]));
        try {
          return await fn(client);
        } catch (err) {
          state.kycs.clear();
          kycSnap.forEach((v, k) => state.kycs.set(k, v));
          state.fingerprints.clear();
          fpSnap.forEach((v, k) => state.fingerprints.set(k, v));
          state.sellers.clear();
          spSnap.forEach((v, k) => state.sellers.set(k, v));
          throw err;
        }
      },
    },
  };
});

import {
  encryptSensitiveField,
  hmacDocumentNumberLegacyV1,
  hmacDocumentNumberWithVersion,
} from '../../apps/api/src/lib/kyc-crypto';
import { validateKycHmacKeyConfig } from '../../apps/api/src/lib/kyc-key';
import { KycService } from '../../apps/api/src/modules/kyc/kyc.service';
import { KycHmacMigrationService } from '../../apps/api/src/modules/kyc/kyc-hmac-migration.service';

const ENC_KEY_1 = '102132435465768798a9bacbdcedfe0f1f2e3d4c5b6a79887766554433221100';
const ENC_KEY_2 = '90817263544536271809abcdef0123456789abcdef0123456789abcdef012345';
const HMAC_KEY_1 = '00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff';
const HMAC_KEY_2 = 'ffeeddccbbaa99887766554433221100ffeeddccbbaa99887766554433221100';

function seedSeller(idSuffix: string) {
  const userId = `u_${idSuffix}`;
  const sellerProfileId = `sp_${idSuffix}`;
  const ref = `upload:${userId}/${idSuffix.padStart(8, '1')}-1111-4111-8111-111111111111.png`;
  state.users.set(userId, { id: userId, role: 'SELLER', status: 'ACTIVE' });
  state.sellers.set(sellerProfileId, {
    id: sellerProfileId,
    userId,
    status: 'DRAFT',
    verificationStatus: 'NOT_SUBMITTED',
    stripeAccountId: null,
  });
  state.uploads.set(ref, {
    id: `uo_${idSuffix}`,
    reference: ref,
    objectKey: ref.slice(7),
    ownerId: userId,
    purpose: 'KYC',
    lifecycleStatus: 'ACTIVE',
    scanStatus: 'VERIFIED_SAFE',
    kycVerificationId: null,
    kycSlot: null,
  });
  return { userId, sellerProfileId, ref };
}

describe('Cross-version KYC HMAC uniqueness, concurrency, rotation, and retirement gate (KYC-DUP-02)', () => {
  beforeEach(() => {
    state.users.clear();
    state.sellers.clear();
    state.kycs.clear();
    state.fingerprints.clear();
    state.uploads.clear();
    state.histories.length = 0;
    state.audits.length = 0;
    state.yieldDuringTx = false;

    vi.stubEnv('KYC_ENCRYPTION_KEY', ENC_KEY_1);
    vi.stubEnv('KYC_ENCRYPTION_KEY_ID', 'k1');
    vi.stubEnv('KYC_DOCUMENT_HMAC_KEY', HMAC_KEY_1);
    vi.stubEnv('KYC_DOCUMENT_HMAC_KEY_ID', 'h1');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('blocks simultaneous cross-key submissions atomically via shared blind-index fingerprints and frees claim on REJECTED', async () => {
    const sellerA = seedSeller('1');
    const sellerB = seedSeller('2');
    const sellerC = seedSeller('3');
    state.users.set('admin_1', { id: 'admin_1', role: 'ADMIN', status: 'ACTIVE' });

    // 1. Seed a legacy v1 verification belonging to Seller A.
    const legacyHash = hmacDocumentNumberLegacyV1('PASS-889900');
    const legacyId = 'kyc_legacy_a';
    state.kycs.set(legacyId, {
      id: legacyId,
      sellerProfileId: sellerA.sellerProfileId,
      status: 'UNDER_REVIEW',
      documentType: 'PASSPORT',
      legalName: 'Alice Legacy',
      dateOfBirthEncrypted: encryptSensitiveField('1990-01-01'),
      documentNumberEncrypted: encryptSensitiveField('PASS-889900'),
      documentNumberHash: legacyHash,
      documentNumberHmacVersion: 'v1',
      documentNumberLast4: '9900',
      country: 'VN',
      documentUrl: sellerA.ref,
      documentBackUrl: null,
      selfieUrl: null,
      scanStatus: 'VERIFIED_SAFE',
      scanResult: 'Clean',
      scannedAt: new Date(),
      scanEngineVersion: 'ClamAV',
      scanAttempts: 1,
      lastScanAttemptAt: new Date(),
      nextScanRetryAt: null,
      scanLeaseExpiresAt: null,
      scanClaimId: null,
      submittedAt: new Date(),
      reviewedAt: new Date(),
      reviewedById: 'admin_1',
      resubmissionRequestedAt: null,
      decisionReason: null,
      comments: null,
      version: 1,
      updatedAt: new Date(),
    });
    state.fingerprints.set('fp_seed_a', {
      id: 'fp_seed_a',
      identityVerificationId: legacyId,
      sellerProfileId: sellerA.sellerProfileId,
      country: 'VN',
      documentType: 'PASSPORT',
      hmacVersion: 'v1',
      documentNumberHash: legacyHash,
      createdAt: new Date(),
    });

    // 2. Seller B attempts to register the same document after rotation to v2:h2 (with h1 in previousKeys): rejected with 409.
    vi.stubEnv('KYC_DOCUMENT_HMAC_KEY', HMAC_KEY_2);
    vi.stubEnv('KYC_DOCUMENT_HMAC_KEY_ID', 'h2');
    vi.stubEnv('KYC_DOCUMENT_HMAC_PREVIOUS_KEYS', `h1=${HMAC_KEY_1}`);

    await expect(
      KycService.submitKyc(sellerB.userId, {
        documentType: 'PASSPORT',
        documentNumber: 'pass 889900',
        legalName: 'Bob Duplicate',
        dateOfBirth: '1991-02-02',
        country: 'VN',
        documentFrontUrl: sellerB.ref,
      })
    ).rejects.toMatchObject({ status: 409, code: 'KYC_DUPLICATE_DOCUMENT' });

    // 3. Rejecting Seller A clears active fingerprint rows, allowing Seller C to submit legitimately.
    await KycService.reviewKycDecision(
      legacyId,
      'admin_1',
      'REJECTED',
      { reason: 'Forged image', expectedVersion: 1 }
    );
    expect(
      [...state.fingerprints.values()].some(fp => fp.identityVerificationId === legacyId)
    ).toBe(false);

    // Clear stale REJECTED v1? Migrate or test simultaneous race between Seller B and Seller C on fresh doc.
    state.yieldDuringTx = true;
    const race = await Promise.allSettled([
      KycService.submitKyc(sellerB.userId, {
        documentType: 'NATIONAL_ID',
        documentNumber: 'NID-556677',
        legalName: 'Bob Race',
        dateOfBirth: '1991-02-02',
        country: 'VN',
        documentFrontUrl: sellerB.ref,
      }),
      KycService.submitKyc(sellerC.userId, {
        documentType: 'NATIONAL_ID',
        documentNumber: 'nid556677',
        legalName: 'Carol Race',
        dateOfBirth: '1992-03-03',
        country: 'VN',
        documentFrontUrl: sellerC.ref,
      }),
    ]);

    expect(race.filter(r => r.status === 'fulfilled')).toHaveLength(1);
    const rejectedRace = race.find(r => r.status === 'rejected') as PromiseRejectedResult;
    expect(rejectedRace.reason).toMatchObject({ status: 409, code: 'KYC_DUPLICATE_DOCUMENT' });
  });

  it('blocks premature KYC_DISABLE_LEGACY_HMAC=true runtime usage until full migration & fingerprint backfill complete', async () => {
    const sellerA = seedSeller('11');
    const sellerB = seedSeller('12');

    const v1DocHash = hmacDocumentNumberLegacyV1('DOC-MIG-101');
    state.kycs.set('kyc_v1', {
      id: 'kyc_v1',
      sellerProfileId: sellerA.sellerProfileId,
      status: 'APPROVED',
      documentType: 'PASSPORT',
      legalName: 'Alice Unmigrated',
      dateOfBirthEncrypted: encryptSensitiveField('1990-01-01'),
      documentNumberEncrypted: encryptSensitiveField('DOC-MIG-101'),
      documentNumberHash: v1DocHash,
      documentNumberHmacVersion: 'v1',
      documentNumberLast4: 'g101',
      country: 'VN',
      documentUrl: sellerA.ref,
      documentBackUrl: null,
      selfieUrl: null,
      scanStatus: 'VERIFIED_SAFE',
      scanResult: 'Clean',
      scannedAt: new Date(),
      scanEngineVersion: 'ClamAV',
      scanAttempts: 1,
      lastScanAttemptAt: new Date(),
      nextScanRetryAt: null,
      scanLeaseExpiresAt: null,
      scanClaimId: null,
      submittedAt: new Date(),
      reviewedAt: new Date(),
      reviewedById: null,
      resubmissionRequestedAt: null,
      decisionReason: null,
      comments: null,
      version: 1,
      updatedAt: new Date(),
    });
    state.fingerprints.set('fp_v1', {
      id: 'fp_v1',
      identityVerificationId: 'kyc_v1',
      sellerProfileId: sellerA.sellerProfileId,
      country: 'VN',
      documentType: 'PASSPORT',
      hmacVersion: 'v1',
      documentNumberHash: v1DocHash,
      createdAt: new Date(),
    });

    // Inconsistent config without explicit HMAC key fails closed.
    expect(() =>
      validateKycHmacKeyConfig(
        {
          KYC_ENCRYPTION_KEY: ENC_KEY_1,
          KYC_DISABLE_LEGACY_HMAC: 'true',
        },
        false
      )
    ).toThrow(/requires an explicit KYC_DOCUMENT_HMAC_KEY/i);
    expect(() => validateKycHmacKeyConfig({ KYC_DISABLE_LEGACY_HMAC: 'yes' }, false)).toThrow();

    // Enabling retirement flag while v1 records still exist blocks runtime operations safely.
    vi.stubEnv('KYC_DISABLE_LEGACY_HMAC', 'true');
    await expect(KycHmacMigrationService.assertLegacyHmacRetirementAllowed()).rejects.toMatchObject({
      status: 503,
      code: 'LEGACY_HMAC_RETIREMENT_BLOCKED',
    });
    await expect(
      KycService.submitKyc(sellerB.userId, {
        documentType: 'PASSPORT',
        documentNumber: 'DOC-MIG-101',
        legalName: 'Bob Bypass Attempt',
        dateOfBirth: '1991-01-01',
        country: 'VN',
        documentFrontUrl: sellerB.ref,
      })
    ).rejects.toMatchObject({ status: 503, code: 'LEGACY_HMAC_RETIREMENT_BLOCKED' });

    // Unset flag, complete migration + encryption key rotation cleanly, verify readiness, then retire!
    vi.stubEnv('KYC_DISABLE_LEGACY_HMAC', 'false');
    vi.stubEnv('KYC_ENCRYPTION_KEY', ENC_KEY_2);
    vi.stubEnv('KYC_ENCRYPTION_KEY_ID', 'k2');
    vi.stubEnv('KYC_ENCRYPTION_PREVIOUS_KEYS', `k1=${ENC_KEY_1}`);

    const mig = await KycHmacMigrationService.runBatchMigration({ rotateEncryption: true });
    expect(mig.migrated).toBe(1);
    expect(mig.conflicts).toEqual([]);
    expect(mig.failures).toEqual([]);
    expect(state.kycs.get('kyc_v1')!.documentNumberHmacVersion).toBe('v2:h1');
    expect(state.kycs.get('kyc_v1')!.documentNumberEncrypted!.startsWith('v2:k2:')).toBe(true);

    // Re-running migration is idempotent and skips already-current records.
    const repeat = await KycHmacMigrationService.runBatchMigration({ rotateEncryption: true });
    expect(repeat.scanned).toBe(0);

    const readyReport = await KycHmacMigrationService.verifyMigrationCompleteness();
    expect(readyReport.readyToRetireLegacyHmac).toBe(true);
    expect(readyReport.missingActiveFingerprintRecords).toBe(0);

    // Now legacy retirement succeeds and still detects duplicates post-encryption rotation!
    vi.stubEnv('KYC_DISABLE_LEGACY_HMAC', 'true');
    await expect(KycHmacMigrationService.assertLegacyHmacRetirementAllowed()).resolves.toBeUndefined();
    await expect(
      KycService.submitKyc(sellerB.userId, {
        documentType: 'PASSPORT',
        documentNumber: 'DOC-MIG-101',
        legalName: 'Bob Duplicate Post Migration',
        dateOfBirth: '1991-01-01',
        country: 'VN',
        documentFrontUrl: sellerB.ref,
      })
    ).rejects.toMatchObject({ status: 409, code: 'KYC_DUPLICATE_DOCUMENT' });
    expect(hmacDocumentNumberWithVersion('DOC-MIG-101').hash).toBe(
      state.kycs.get('kyc_v1')!.documentNumberHash
    );
  });
});
