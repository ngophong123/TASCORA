import crypto from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

interface Row {
  id: string;
  sellerProfileId: string;
  status: string;
  country: string | null;
  documentType: string;
  documentNumberEncrypted: string | null;
  dateOfBirthEncrypted: string | null;
  documentNumberHash: string | null;
  documentNumberHmacVersion: string | null;
  version: number;
}

interface FingerprintRow {
  id: string;
  identityVerificationId: string;
  sellerProfileId: string;
  country: string;
  documentType: string;
  hmacVersion: string;
  documentNumberHash: string;
}

const store = vi.hoisted(() => ({
  rows: new Map<string, Row>(),
  fingerprints: new Map<string, FingerprintRow>(),
}));

function matchVerificationWhere(r: Row, where: Record<string, unknown>): boolean {
  if (where.documentNumberEncrypted && (where.documentNumberEncrypted as { not?: null }).not === null && !r.documentNumberEncrypted) {
    return false;
  }
  if (where.status && typeof where.status === 'object' && 'not' in where.status) {
    if (r.status === (where.status as { not: string }).not) return false;
  }
  if (where.id && typeof where.id === 'object' && 'gt' in where.id) {
    const gt = (where.id as { gt?: string }).gt;
    if (gt && r.id <= gt) return false;
  }
  if (where.documentNumberHmacVersion !== undefined) {
    if (typeof where.documentNumberHmacVersion === 'string') {
      if (r.documentNumberHmacVersion !== where.documentNumberHmacVersion) return false;
    } else if (typeof where.documentNumberHmacVersion === 'object' && where.documentNumberHmacVersion !== null && 'not' in where.documentNumberHmacVersion) {
      if (r.documentNumberHmacVersion === (where.documentNumberHmacVersion as { not: string }).not) return false;
    }
  }
  if (where.documentNumberHash !== undefined) {
    if (where.documentNumberHash === null && r.documentNumberHash !== null) return false;
    if (typeof where.documentNumberHash === 'string' && r.documentNumberHash !== where.documentNumberHash) return false;
  }
  if (where.documentFingerprints && typeof where.documentFingerprints === 'object' && 'none' in where.documentFingerprints) {
    const targetVer = (where.documentFingerprints as { none: { hmacVersion: string } }).none.hmacVersion;
    const hasTarget = [...store.fingerprints.values()].some(
      fp => fp.identityVerificationId === r.id && fp.hmacVersion === targetVer
    );
    if (hasTarget) return false;
  }
  if (Array.isArray(where.OR)) {
    const anyMatch = (where.OR as Record<string, unknown>[]).some(branch => matchVerificationWhere(r, branch));
    if (!anyMatch) return false;
  }
  return true;
}

vi.mock('../../apps/api/src/lib/prisma', () => {
  const client = {
    $queryRaw: async () => [{ '?column?': 1 }],
    identityVerification: {
      findMany: async ({
        where = {},
        take = 50,
      }: {
        where?: Record<string, unknown>;
        take?: number;
      } = {}) => {
        return [...store.rows.values()]
          .filter(r => matchVerificationWhere(r, where))
          .sort((a, b) => a.id.localeCompare(b.id))
          .slice(0, take);
      },
      findFirst: async ({ where }: { where: Record<string, unknown> }) => {
        for (const r of store.rows.values()) {
          const notId = (where.id as { not?: string } | undefined)?.not;
          const notSp = (where.sellerProfileId as { not?: string } | undefined)?.not;
          const notStatus = (where.status as { not?: string } | undefined)?.not;
          if (notId && r.id === notId) continue;
          if (notSp && r.sellerProfileId === notSp) continue;
          if (notStatus && r.status === notStatus) continue;
          if (where.country !== undefined && r.country !== where.country) continue;
          if (where.documentType !== undefined && r.documentType !== where.documentType) continue;
          if (where.documentNumberHash !== undefined) {
            if (typeof where.documentNumberHash === 'string') {
              if (r.documentNumberHash !== where.documentNumberHash) continue;
            } else if (
              typeof where.documentNumberHash === 'object' &&
              where.documentNumberHash !== null &&
              'in' in where.documentNumberHash &&
              Array.isArray((where.documentNumberHash as { in?: string[] }).in)
            ) {
              const hashes = (where.documentNumberHash as { in: string[] }).in;
              if (!r.documentNumberHash || !hashes.includes(r.documentNumberHash)) continue;
            }
          }
          return { id: r.id };
        }
        return null;
      },
      findUnique: async ({ where }: { where: { id: string } }) => store.rows.get(where.id) ?? null,
      updateMany: async ({ where, data }: { where: { id: string; version: number }; data: Partial<Row> }) => {
        const r = store.rows.get(where.id);
        if (!r || r.version !== where.version) return { count: 0 };
        Object.assign(r, data);
        return { count: 1 };
      },
      count: async ({ where = {} }: { where?: Record<string, unknown> } = {}) =>
        [...store.rows.values()].filter(r => matchVerificationWhere(r, where)).length,
    },
    identityDocumentFingerprint: {
      findMany: async ({ where }: { where: { identityVerificationId?: string } }) =>
        [...store.fingerprints.values()].filter(fp => fp.identityVerificationId === where.identityVerificationId),
      findFirst: async ({ where }: { where: Record<string, unknown> }) => {
        const hashCond = where.documentNumberHash as string | { in: string[] } | undefined;
        const hashSet = typeof hashCond === 'string' ? [hashCond] : hashCond?.in ?? [];
        const excludedVerification = (where.identityVerificationId as { not?: string } | undefined)?.not;
        const excludedSeller = (where.sellerProfileId as { not?: string } | undefined)?.not;
        for (const fp of store.fingerprints.values()) {
          if (excludedVerification && fp.identityVerificationId === excludedVerification) continue;
          if (excludedSeller && fp.sellerProfileId === excludedSeller) continue;
          if (where.country !== undefined && fp.country !== where.country) continue;
          if (where.documentType !== undefined && fp.documentType !== where.documentType) continue;
          if (hashSet.length > 0 && !hashSet.includes(fp.documentNumberHash)) continue;
          return { id: fp.id };
        }
        return null;
      },
      upsert: async ({
        where,
        update,
        create,
      }: {
        where: { identityVerificationId_hmacVersion: { identityVerificationId: string; hmacVersion: string } };
        update: Partial<FingerprintRow>;
        create: Omit<FingerprintRow, 'id'>;
      }) => {
        const key = `${where.identityVerificationId_hmacVersion.identityVerificationId}:${where.identityVerificationId_hmacVersion.hmacVersion}`;
        const existing = store.fingerprints.get(key);
        if (existing) {
          Object.assign(existing, update);
          return existing;
        }
        const row: FingerprintRow = { id: `fp_${store.fingerprints.size + 1}`, ...create };
        store.fingerprints.set(key, row);
        return row;
      },
      deleteMany: async ({ where }: { where: { identityVerificationId: string } }) => {
        let count = 0;
        for (const [k, fp] of store.fingerprints.entries()) {
          if (fp.identityVerificationId === where.identityVerificationId) {
            store.fingerprints.delete(k);
            count += 1;
          }
        }
        return { count };
      },
    },
    $disconnect: async () => undefined,
  };
  return { prisma: { ...client, $transaction: async <T>(fn: (tx: typeof client) => Promise<T>) => fn(client) } };
});

import {
  computeAllDocumentNumberLookupHashes,
  encryptSensitiveField,
  hmacDocumentNumberLegacyV1,
  hmacDocumentNumberWithVersion,
} from '../../apps/api/src/lib/kyc-crypto';
import { validateKycHmacKeyConfig } from '../../apps/api/src/lib/kyc-key';
import { KycHmacMigrationService } from '../../apps/api/src/modules/kyc/kyc-hmac-migration.service';
import { runKycHmacMigrateCli } from '../../apps/api/src/workers/kyc-hmac-migrate';

describe('Workstream D: Separated KYC Document HMAC Keyring, Migration & Retirement', () => {
  const ENC_KEY = '0123456789abcdef1032547698badcfe0123456789abcdef1032547698badcfe';
  const ENC_KEY_2 = '11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff';
  const HMAC_KEY_1 = 'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90';
  const HMAC_KEY_2 = 'ffeeddccbbaa99887766554433221100ffeeddccbbaa99887766554433221100';
  const HMAC_KEY_3 = '0f1e2d3c4b5a69788796a5b4c3d2e1f00f1e2d3c4b5a69788796a5b4c3d2e1f0';

  beforeEach(() => {
    store.rows.clear();
    store.fingerprints.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('rejects reusing KYC_ENCRYPTION_KEY as KYC_DOCUMENT_HMAC_KEY in production', () => {
    expect(() =>
      validateKycHmacKeyConfig(
        {
          KYC_ENCRYPTION_KEY: ENC_KEY,
          KYC_DOCUMENT_HMAC_KEY: ENC_KEY,
        },
        true
      )
    ).toThrow(/cryptographically separate from KYC_ENCRYPTION_KEY/i);
  });

  it('computes transition lookup hashes across active HMAC key, rotated previous HMAC keys, and legacy v1 unless disabled', () => {
    vi.stubEnv('KYC_ENCRYPTION_KEY', ENC_KEY);
    vi.stubEnv('KYC_DOCUMENT_HMAC_KEY', HMAC_KEY_1);
    vi.stubEnv('KYC_DOCUMENT_HMAC_KEY_ID', 'h1');

    const first = hmacDocumentNumberWithVersion('A-123456');
    expect(first.version).toBe('v2:h1');
    const legacyHash = hmacDocumentNumberLegacyV1('A-123456');
    expect(first.hash).not.toBe(legacyHash);

    // Rotate to h2 with h1 retained in KYC_DOCUMENT_HMAC_PREVIOUS_KEYS.
    vi.stubEnv('KYC_DOCUMENT_HMAC_KEY', HMAC_KEY_2);
    vi.stubEnv('KYC_DOCUMENT_HMAC_KEY_ID', 'h2');
    vi.stubEnv('KYC_DOCUMENT_HMAC_PREVIOUS_KEYS', `h1=${HMAC_KEY_1}`);

    const second = hmacDocumentNumberWithVersion('A-123456');
    expect(second.version).toBe('v2:h2');
    expect(second.hash).not.toBe(first.hash);

    const withLegacy = computeAllDocumentNumberLookupHashes('A-123456');
    expect(withLegacy).toContain(second.hash);
    expect(withLegacy).toContain(first.hash);
    expect(withLegacy).toContain(legacyHash);

    // Enabling retirement flag excludes legacy v1 hash from lookup candidates.
    vi.stubEnv('KYC_DISABLE_LEGACY_HMAC', 'true');
    const withoutLegacy = computeAllDocumentNumberLookupHashes('A-123456');
    expect(withoutLegacy).toContain(second.hash);
    expect(withoutLegacy).toContain(first.hash);
    expect(withoutLegacy).not.toContain(legacyHash);
  });

  it('runs resumable dry-run -> apply -> verify-completeness migration and skips duplicate conflicts safely', async () => {
    vi.stubEnv('KYC_ENCRYPTION_KEY', ENC_KEY);
    vi.stubEnv('KYC_ENCRYPTION_KEY_ID', 'k1');
    vi.stubEnv('KYC_DOCUMENT_HMAC_KEY', HMAC_KEY_1);
    vi.stubEnv('KYC_DOCUMENT_HMAC_KEY_ID', 'h1');

    const legacyV1Subkey = Buffer.from(
      crypto.hkdfSync('sha256', Buffer.from(ENC_KEY, 'hex'), Buffer.alloc(0), Buffer.from('tascora:kyc:pii:aes-256-gcm:v1', 'utf8'), 32)
    );
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', legacyV1Subkey, iv);
    const ct = Buffer.concat([cipher.update('PASSPORT-001', 'utf8'), cipher.final()]);
    const legacyEncDoc = `v1:${iv.toString('hex')}:${cipher.getAuthTag().toString('hex')}:${ct.toString('hex')}`;

    const targetHash = hmacDocumentNumberWithVersion('CONFLICT-99').hash;

    store.rows.set('kyc_01', {
      id: 'kyc_01',
      sellerProfileId: 'sp_1',
      status: 'APPROVED',
      country: 'VN',
      documentType: 'PASSPORT',
      documentNumberEncrypted: legacyEncDoc,
      dateOfBirthEncrypted: encryptSensitiveField('1990-01-01'),
      documentNumberHash: hmacDocumentNumberLegacyV1('PASSPORT-001'),
      documentNumberHmacVersion: 'v1',
      version: 1,
    });
    store.rows.set('kyc_02', {
      id: 'kyc_02',
      sellerProfileId: 'sp_2',
      status: 'PENDING',
      country: 'VN',
      documentType: 'PASSPORT',
      documentNumberEncrypted: encryptSensitiveField('CONFLICT-99'),
      dateOfBirthEncrypted: encryptSensitiveField('1991-02-02'),
      documentNumberHash: hmacDocumentNumberLegacyV1('CONFLICT-99'),
      documentNumberHmacVersion: 'v1',
      version: 1,
    });
    store.rows.set('kyc_03', {
      id: 'kyc_03',
      sellerProfileId: 'sp_3',
      status: 'PENDING',
      country: 'VN',
      documentType: 'PASSPORT',
      documentNumberEncrypted: encryptSensitiveField('CONFLICT-99'),
      dateOfBirthEncrypted: encryptSensitiveField('1992-03-03'),
      documentNumberHash: targetHash,
      documentNumberHmacVersion: 'v2:h1',
      version: 1,
    });
    store.fingerprints.set('kyc_03:v2:h1', {
      id: 'fp_03',
      identityVerificationId: 'kyc_03',
      sellerProfileId: 'sp_3',
      country: 'VN',
      documentType: 'PASSPORT',
      hmacVersion: 'v2:h1',
      documentNumberHash: targetHash,
    });

    const dryRun = await KycHmacMigrationService.runBatchMigration({ dryRun: true, batchSize: 1, maxBatches: 1 });
    expect(dryRun).toMatchObject({
      dryRun: true,
      targetVersion: 'v2:h1',
      scanned: 1,
      wouldMigrate: 1,
      migrated: 0,
      hasMore: true,
      lastCursor: 'kyc_01',
    });

    const beforeVerify = await KycHmacMigrationService.verifyMigrationCompleteness();
    expect(beforeVerify.readyToRetireLegacyHmac).toBe(false);
    expect(beforeVerify.remainingLegacyV1Records).toBe(2);

    const applied = await KycHmacMigrationService.runBatchMigration({ dryRun: false, rotateEncryption: true });
    expect(applied.migrated).toBe(1);
    expect(applied.conflicts).toEqual(['kyc_02']);
    expect(store.rows.get('kyc_01')!.documentNumberHmacVersion).toBe('v2:h1');
    expect(store.rows.get('kyc_01')!.documentNumberEncrypted!.startsWith('v2:k1:')).toBe(true);
    expect(store.rows.get('kyc_01')!.documentNumberHash).toBe(hmacDocumentNumberWithVersion('PASSPORT-001').hash);
  });

  function seedCompleteRecord(
    id: string,
    sellerProfileId: string,
    docNumber: string,
    versions: Array<{ hmacVersion: string; hash: string }>,
    overrides: Partial<Row> = {}
  ) {
    const primary = versions[0]!;
    store.rows.set(id, {
      id,
      sellerProfileId,
      status: 'APPROVED',
      country: 'VN',
      documentType: 'PASSPORT',
      documentNumberEncrypted: encryptSensitiveField(docNumber),
      dateOfBirthEncrypted: encryptSensitiveField('1990-01-01'),
      documentNumberHash: primary.hash,
      documentNumberHmacVersion: primary.hmacVersion,
      version: 1,
      ...overrides,
    });
    for (const v of versions) {
      store.fingerprints.set(`${id}:${v.hmacVersion}`, {
        id: `fp_${id}_${v.hmacVersion}`,
        identityVerificationId: id,
        sellerProfileId,
        country: 'VN',
        documentType: 'PASSPORT',
        hmacVersion: v.hmacVersion,
        documentNumberHash: v.hash,
      });
    }
  }

  it('D4.1: reports ready when only active targetVersion is configured and all active records are migrated & indexed', async () => {
    vi.stubEnv('KYC_ENCRYPTION_KEY', ENC_KEY);
    vi.stubEnv('KYC_ENCRYPTION_KEY_ID', 'k1');
    vi.stubEnv('KYC_DOCUMENT_HMAC_KEY', HMAC_KEY_1);
    vi.stubEnv('KYC_DOCUMENT_HMAC_KEY_ID', 'h1');
    vi.stubEnv('KYC_DOCUMENT_HMAC_PREVIOUS_KEYS', '');
    vi.stubEnv('KYC_DISABLE_LEGACY_HMAC', 'true');

    const { hash, version } = hmacDocumentNumberWithVersion('ACTIVE-001');
    seedCompleteRecord('kyc_a1', 'sp_a1', 'ACTIVE-001', [{ hmacVersion: version, hash }]);

    const report = await KycHmacMigrationService.verifyMigrationCompleteness();
    expect(report).toMatchObject({
      targetVersion: 'v2:h1',
      expectedHistoricalVersions: [],
      expectedFingerprintVersions: ['v2:h1'],
      totalEncryptedRecords: 1,
      migratedRecords: 1,
      remainingLegacyV1Records: 0,
      remainingNonTargetRecords: 0,
      missingActiveFingerprintRecords: 0,
      missingHistoricalFingerprintRecords: 0,
      unindexedActiveRecords: 0,
      recordsWithUnavailableKeys: 0,
      readyToRetireLegacyHmac: true,
      blockingReasons: [],
    });
    await expect(KycHmacMigrationService.assertLegacyHmacRetirementAllowed()).resolves.toBeUndefined();
  });

  it('D4.2 & D4.8 & D4.9: detects missing historical fingerprint across multiple configured keys, blocks retirement, and backfills only missing historical versions cleanly', async () => {
    vi.stubEnv('KYC_ENCRYPTION_KEY', ENC_KEY);
    vi.stubEnv('KYC_ENCRYPTION_KEY_ID', 'k1');
    vi.stubEnv('KYC_DOCUMENT_HMAC_KEY', HMAC_KEY_1);
    vi.stubEnv('KYC_DOCUMENT_HMAC_KEY_ID', 'h1');
    const h1 = hmacDocumentNumberWithVersion('MULTI-77');
    vi.stubEnv('KYC_DOCUMENT_HMAC_KEY', HMAC_KEY_2);
    vi.stubEnv('KYC_DOCUMENT_HMAC_KEY_ID', 'h2');
    const h2 = hmacDocumentNumberWithVersion('MULTI-77');
    vi.stubEnv('KYC_DOCUMENT_HMAC_KEY', HMAC_KEY_3);
    vi.stubEnv('KYC_DOCUMENT_HMAC_KEY_ID', 'h3');
    const h3 = hmacDocumentNumberWithVersion('MULTI-77');

    // Configure h3 as active with h2 and h1 as historical keys.
    vi.stubEnv('KYC_DOCUMENT_HMAC_PREVIOUS_KEYS', `h2=${HMAC_KEY_2},h1=${HMAC_KEY_1}`);

    // Seed record that already has target v2:h3 AND historical v2:h2, but is MISSING v2:h1!
    seedCompleteRecord('kyc_m1', 'sp_m1', 'MULTI-77', [
      { hmacVersion: h3.version, hash: h3.hash },
      { hmacVersion: h2.version, hash: h2.hash },
    ]);

    const incomplete = await KycHmacMigrationService.verifyMigrationCompleteness();
    expect(incomplete.readyToRetireLegacyHmac).toBe(false);
    expect(incomplete.missingActiveFingerprintRecords).toBe(0);
    expect(incomplete.missingHistoricalFingerprintRecords).toBe(1);
    expect(incomplete.missingFingerprintVersions).toEqual({
      'v2:h3': 0,
      'v2:h2': 0,
      'v2:h1': 1,
    });
    expect(incomplete.blockingReasons).toContain('MISSING_HISTORICAL_FINGERPRINT_RECORDS:1');

    // Enabling retirement flag while v2:h1 is missing MUST fail closed.
    vi.stubEnv('KYC_DISABLE_LEGACY_HMAC', 'true');
    await expect(KycHmacMigrationService.assertLegacyHmacRetirementAllowed()).rejects.toMatchObject({
      status: 503,
      code: 'LEGACY_HMAC_RETIREMENT_BLOCKED',
    });

    // Dry-run and apply batch migration MUST detect record missing historical v2:h1 even though primary is v2:h3.
    vi.stubEnv('KYC_DISABLE_LEGACY_HMAC', 'false');
    const dryRun = await KycHmacMigrationService.runBatchMigration({ dryRun: true });
    expect(dryRun.scanned).toBe(1);
    expect(dryRun.wouldMigrate).toBe(1);

    const applied = await KycHmacMigrationService.runBatchMigration({ dryRun: false });
    expect(applied.migrated).toBe(1);
    expect(store.fingerprints.get('kyc_m1:v2:h1')?.documentNumberHash).toBe(h1.hash);

    const verified = await KycHmacMigrationService.verifyMigrationCompleteness();
    expect(verified.readyToRetireLegacyHmac).toBe(true);
    expect(verified.missingHistoricalFingerprintRecords).toBe(0);

    vi.stubEnv('KYC_DISABLE_LEGACY_HMAC', 'true');
    await expect(KycHmacMigrationService.assertLegacyHmacRetirementAllowed()).resolves.toBeUndefined();
  });

  it('D4.3: detects missing active targetVersion fingerprint even when historical fingerprints exist', async () => {
    vi.stubEnv('KYC_ENCRYPTION_KEY', ENC_KEY);
    vi.stubEnv('KYC_ENCRYPTION_KEY_ID', 'k1');
    vi.stubEnv('KYC_DOCUMENT_HMAC_KEY', HMAC_KEY_1);
    vi.stubEnv('KYC_DOCUMENT_HMAC_KEY_ID', 'h1');
    const h1 = hmacDocumentNumberWithVersion('ACTIVE-MISS-1');

    vi.stubEnv('KYC_DOCUMENT_HMAC_KEY', HMAC_KEY_2);
    vi.stubEnv('KYC_DOCUMENT_HMAC_KEY_ID', 'h2');
    vi.stubEnv('KYC_DOCUMENT_HMAC_PREVIOUS_KEYS', `h1=${HMAC_KEY_1}`);
    const h2 = hmacDocumentNumberWithVersion('ACTIVE-MISS-1');

    // Primary says v2:h2, fingerprint table only has historical v2:h1 (missing active target v2:h2).
    seedCompleteRecord(
      'kyc_act_miss',
      'sp_act_miss',
      'ACTIVE-MISS-1',
      [{ hmacVersion: h1.version, hash: h1.hash }],
      { documentNumberHash: h2.hash, documentNumberHmacVersion: 'v2:h2' }
    );

    const report = await KycHmacMigrationService.verifyMigrationCompleteness();
    expect(report.readyToRetireLegacyHmac).toBe(false);
    expect(report.missingActiveFingerprintRecords).toBe(1);
    expect(report.missingHistoricalFingerprintRecords).toBe(0);
    expect(report.missingFingerprintVersions).toEqual({ 'v2:h2': 1, 'v2:h1': 0 });
  });

  it('D4.4: fails closed on unavailable/missing historical or encryption key material without marking ready or logging secrets', async () => {
    vi.stubEnv('KYC_ENCRYPTION_KEY', ENC_KEY);
    vi.stubEnv('KYC_ENCRYPTION_KEY_ID', 'k1');
    vi.stubEnv('KYC_DOCUMENT_HMAC_KEY', HMAC_KEY_1);
    vi.stubEnv('KYC_DOCUMENT_HMAC_KEY_ID', 'h1');

    // Case A: Record encrypted with missing encryption key version k_retired while active is k2.
    const encWithK1 = encryptSensitiveField('UNAVAIL-01');
    vi.stubEnv('KYC_ENCRYPTION_KEY', ENC_KEY_2);
    vi.stubEnv('KYC_ENCRYPTION_KEY_ID', 'k2');
    const h1 = hmacDocumentNumberWithVersion('UNAVAIL-01');
    seedCompleteRecord('kyc_nokey', 'sp_nokey', 'UNAVAIL-01', [{ hmacVersion: h1.version, hash: h1.hash }], {
      documentNumberEncrypted: encWithK1,
    });

    const reportEncMissing = await KycHmacMigrationService.verifyMigrationCompleteness();
    expect(reportEncMissing.readyToRetireLegacyHmac).toBe(false);
    expect(reportEncMissing.recordsWithUnavailableKeys).toBe(1);
    expect(reportEncMissing.unavailableKeyVersions).toContain('enc:v2:k1');
    expect(JSON.stringify(reportEncMissing)).not.toContain(ENC_KEY);
    expect(JSON.stringify(reportEncMissing)).not.toContain(HMAC_KEY_1);

    // Case B: Record primary HMAC version references unknown key v2:h_retired not in configured keyring.
    store.rows.clear();
    store.fingerprints.clear();
    vi.stubEnv('KYC_ENCRYPTION_KEY', ENC_KEY);
    vi.stubEnv('KYC_ENCRYPTION_KEY_ID', 'k1');
    seedCompleteRecord('kyc_nohmac', 'sp_nohmac', 'UNAVAIL-02', [{ hmacVersion: 'v2:h1', hash: h1.hash }], {
      documentNumberHmacVersion: 'v2:h_retired',
    });

    const reportHmacMissing = await KycHmacMigrationService.verifyMigrationCompleteness();
    expect(reportHmacMissing.readyToRetireLegacyHmac).toBe(false);
    expect(reportHmacMissing.recordsWithUnavailableKeys).toBe(1);
    expect(reportHmacMissing.unavailableKeyVersions).toContain('v2:h_retired');

    // Case C: Misconfigured previous HMAC key without active key fails closed immediately.
    vi.stubEnv('KYC_DOCUMENT_HMAC_KEY', '');
    vi.stubEnv('KYC_DOCUMENT_HMAC_PREVIOUS_KEYS', `h1=${HMAC_KEY_1}`);
    await expect(KycHmacMigrationService.verifyMigrationCompleteness()).rejects.toThrow(/requires KYC_DOCUMENT_HMAC_KEY/i);
  });

  it('D4.5 & D4.6: blocks readiness when v1 legacy records or unindexed active records (null hash) remain and repairs unindexed rows', async () => {
    vi.stubEnv('KYC_ENCRYPTION_KEY', ENC_KEY);
    vi.stubEnv('KYC_ENCRYPTION_KEY_ID', 'k1');
    vi.stubEnv('KYC_DOCUMENT_HMAC_KEY', HMAC_KEY_1);
    vi.stubEnv('KYC_DOCUMENT_HMAC_KEY_ID', 'h1');

    // Unindexed active row (primary hash null)
    seedCompleteRecord('kyc_unidx', 'sp_unidx', 'UNIDX-01', [{ hmacVersion: 'v2:h1', hash: '' }], {
      documentNumberHash: null,
      documentNumberHmacVersion: 'v2:h1',
    });
    store.fingerprints.clear();

    const reportBefore = await KycHmacMigrationService.verifyMigrationCompleteness();
    expect(reportBefore.readyToRetireLegacyHmac).toBe(false);
    expect(reportBefore.unindexedActiveRecords).toBe(1);
    expect(reportBefore.missingActiveFingerprintRecords).toBe(1);

    const repaired = await KycHmacMigrationService.runBatchMigration({ dryRun: false });
    expect(repaired.migrated).toBe(1);
    expect(store.rows.get('kyc_unidx')!.documentNumberHash).toBe(hmacDocumentNumberWithVersion('UNIDX-01').hash);

    const reportAfter = await KycHmacMigrationService.verifyMigrationCompleteness();
    expect(reportAfter.readyToRetireLegacyHmac).toBe(true);
    expect(reportAfter.unindexedActiveRecords).toBe(0);
  });

  it('D4.7: records decryption failures during migration cleanly without leaking keys or marking ready', async () => {
    vi.stubEnv('KYC_ENCRYPTION_KEY', ENC_KEY);
    vi.stubEnv('KYC_ENCRYPTION_KEY_ID', 'k1');
    vi.stubEnv('KYC_DOCUMENT_HMAC_KEY', HMAC_KEY_1);
    vi.stubEnv('KYC_DOCUMENT_HMAC_KEY_ID', 'h1');

    const cipherFromK1 = encryptSensitiveField('FAIL-DEC-01');
    vi.stubEnv('KYC_ENCRYPTION_KEY', ENC_KEY_2);
    vi.stubEnv('KYC_ENCRYPTION_KEY_ID', 'k2');

    store.rows.set('kyc_fail', {
      id: 'kyc_fail',
      sellerProfileId: 'sp_fail',
      status: 'PENDING',
      country: 'VN',
      documentType: 'PASSPORT',
      documentNumberEncrypted: cipherFromK1,
      dateOfBirthEncrypted: null,
      documentNumberHash: hmacDocumentNumberLegacyV1('FAIL-DEC-01'),
      documentNumberHmacVersion: 'v1',
      version: 1,
    });

    const result = await KycHmacMigrationService.runBatchMigration({ dryRun: false, rotateEncryption: true });
    expect(result.migrated).toBe(0);
    expect(result.failures).toHaveLength(1);
    expect(result.failures[0]!.id).toBe('kyc_fail');
    expect(result.failures[0]!.reason).not.toContain(ENC_KEY);
    expect(result.failures[0]!.reason).not.toContain(ENC_KEY_2);
    expect(result.failures[0]!.reason).not.toContain('FAIL-DEC-01');

    const report = await KycHmacMigrationService.verifyMigrationCompleteness();
    expect(report.readyToRetireLegacyHmac).toBe(false);
    expect(report.recordsWithUnavailableKeys).toBe(1);
  });

  it('D4.10: CLI --verify-only exits 2 with historical gap breakdown and exits 0 only once all historical + target versions complete', async () => {
    vi.stubEnv('KYC_ENCRYPTION_KEY', ENC_KEY);
    vi.stubEnv('KYC_ENCRYPTION_KEY_ID', 'k1');
    vi.stubEnv('KYC_DOCUMENT_HMAC_KEY', HMAC_KEY_1);
    vi.stubEnv('KYC_DOCUMENT_HMAC_KEY_ID', 'h1');
    const h1 = hmacDocumentNumberWithVersion('CLI-001');
    vi.stubEnv('KYC_DOCUMENT_HMAC_KEY', HMAC_KEY_2);
    vi.stubEnv('KYC_DOCUMENT_HMAC_KEY_ID', 'h2');
    const h2 = hmacDocumentNumberWithVersion('CLI-001');
    vi.stubEnv('KYC_DOCUMENT_HMAC_PREVIOUS_KEYS', `h1=${HMAC_KEY_1}`);

    seedCompleteRecord('kyc_cli', 'sp_cli', 'CLI-001', [{ hmacVersion: h2.version, hash: h2.hash }]);

    const logs: string[] = [];
    const logSpy = vi.spyOn(console, 'log').mockImplementation((msg: unknown) => {
      logs.push(String(msg));
    });

    try {
      const codeBefore = await runKycHmacMigrateCli(['--verify-only']);
      expect(codeBefore).toBe(2);
      const parsedBefore = JSON.parse(logs.pop()!);
      expect(parsedBefore).toMatchObject({
        mode: 'verify-only',
        readyToRetireLegacyHmac: false,
        missingHistoricalFingerprintRecords: 1,
        missingFingerprintVersions: { 'v2:h2': 0, 'v2:h1': 1 },
      });
      expect(JSON.stringify(parsedBefore)).not.toContain(HMAC_KEY_1);
      expect(JSON.stringify(parsedBefore)).not.toContain(HMAC_KEY_2);

      store.fingerprints.set('kyc_cli:v2:h1', {
        id: 'fp_cli_h1',
        identityVerificationId: 'kyc_cli',
        sellerProfileId: 'sp_cli',
        country: 'VN',
        documentType: 'PASSPORT',
        hmacVersion: 'v2:h1',
        documentNumberHash: h1.hash,
      });

      const codeAfter = await runKycHmacMigrateCli(['--verify-only']);
      expect(codeAfter).toBe(0);
      const parsedAfter = JSON.parse(logs.pop()!);
      expect(parsedAfter.readyToRetireLegacyHmac).toBe(true);
    } finally {
      logSpy.mockRestore();
    }
  });
});
