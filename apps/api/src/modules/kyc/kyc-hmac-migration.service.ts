import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { isProduction } from '../../lib/config';
import { HttpError } from '../../lib/errors';
import { validateKycHmacKeyConfig } from '../../lib/kyc-key';
import {
  checkEncryptedFieldKeyAvailability,
  computeDocumentNumberFingerprintEntries,
  decryptSensitiveField,
  getExpectedDocumentHmacVersions,
  hmacDocumentNumberWithVersion,
  isLegacyHmacDisabled,
  needsKeyRotation,
  reencryptSensitiveField,
  type DocumentNumberFingerprintEntry,
} from '../../lib/kyc-crypto';

export interface KycHmacMigrationOptions {
  batchSize?: number;
  dryRun?: boolean;
  cursor?: string;
  maxBatches?: number;
  rotateEncryption?: boolean;
}

export interface KycHmacMigrationResult {
  dryRun: boolean;
  targetVersion: string;
  scanned: number;
  migrated: number;
  wouldMigrate: number;
  skippedAlreadyCurrent: number;
  conflicts: string[];
  failures: Array<{ id: string; reason: string }>;
  lastCursor: string | null;
  hasMore: boolean;
}

export interface KycHmacVerificationReport {
  targetVersion: string;
  expectedHistoricalVersions: string[];
  expectedFingerprintVersions: string[];
  totalEncryptedRecords: number;
  migratedRecords: number;
  remainingLegacyV1Records: number;
  remainingNonTargetRecords: number;
  missingActiveFingerprintRecords: number;
  missingHistoricalFingerprintRecords: number;
  missingFingerprintVersions: Record<string, number>;
  unindexedActiveRecords: number;
  recordsWithUnavailableKeys: number;
  unavailableKeyVersions: string[];
  readyToRetireLegacyHmac: boolean;
  blockingReasons: string[];
}

type DbClient = Prisma.TransactionClient | typeof prisma;

function hasDelegate(obj: unknown, key: string): boolean {
  if (!obj || typeof obj !== 'object') return false;
  const delegate = (obj as Record<string, unknown>)[key];
  return Boolean(delegate && typeof delegate === 'object');
}

function isUniqueConstraintError(err: unknown): boolean {
  const e = err as { code?: string; message?: string } | null;
  if (e?.code === 'P2002') return true;
  if (typeof e?.message === 'string') {
    return (
      e.message.includes('Duplicate active identity document') ||
      e.message.includes('identity_document_fingerprints_country_documentType_documentNumberHash_key') ||
      e.message.includes('23505')
    );
  }
  return false;
}

/**
 * Persists all configured blind-index fingerprint rows for an active (non-REJECTED) KYC record
 * or removes all fingerprint claims if the verification is rejected.
 */
export async function syncVerificationDocumentFingerprints(
  tx: DbClient,
  params: {
    identityVerificationId: string;
    sellerProfileId: string;
    status: string;
    country: string | null | undefined;
    documentType: string;
    entries: DocumentNumberFingerprintEntry[];
    replaceExisting?: boolean;
  }
): Promise<void> {
  if (!hasDelegate(tx, 'identityDocumentFingerprint')) return;

  const delegate = tx.identityDocumentFingerprint;
  if (params.status === 'REJECTED') {
    if (typeof delegate.deleteMany === 'function') {
      await delegate.deleteMany({
        where: { identityVerificationId: params.identityVerificationId },
      });
    }
    return;
  }

  if (params.replaceExisting && typeof delegate.deleteMany === 'function') {
    await delegate.deleteMany({
      where: { identityVerificationId: params.identityVerificationId },
    });
  }

  const normalizedCountry = (params.country ?? '').trim().toUpperCase();
  for (const entry of params.entries) {
    if (typeof delegate.upsert === 'function') {
      await delegate.upsert({
        where: {
          identityVerificationId_hmacVersion: {
            identityVerificationId: params.identityVerificationId,
            hmacVersion: entry.hmacVersion,
          },
        },
        update: {
          sellerProfileId: params.sellerProfileId,
          country: normalizedCountry,
          documentType: params.documentType,
          documentNumberHash: entry.hash,
        },
        create: {
          identityVerificationId: params.identityVerificationId,
          sellerProfileId: params.sellerProfileId,
          country: normalizedCountry,
          documentType: params.documentType,
          hmacVersion: entry.hmacVersion,
          documentNumberHash: entry.hash,
        },
      });
    } else if (typeof delegate.create === 'function') {
      await delegate.create({
        data: {
          identityVerificationId: params.identityVerificationId,
          sellerProfileId: params.sellerProfileId,
          country: normalizedCountry,
          documentType: params.documentType,
          hmacVersion: entry.hmacVersion,
          documentNumberHash: entry.hash,
        },
      });
    }
  }
}

export class KycHmacMigrationService {
  /**
   * Fails closed if `KYC_DISABLE_LEGACY_HMAC=true` is active while key config is inconsistent
   * or while any encrypted / active KYC record still relies on legacy `v1`, a non-target HMAC
   * version, or lacks an active target-version fingerprint row.
   */
  static async assertLegacyHmacRetirementAllowed(db: DbClient = prisma): Promise<void> {
    if (!isLegacyHmacDisabled()) return;

    try {
      validateKycHmacKeyConfig(process.env, isProduction);
    } catch (err) {
      throw new HttpError(
        503,
        err instanceof Error ? err.message : 'Invalid KYC HMAC configuration for legacy retirement',
        'LEGACY_HMAC_RETIREMENT_BLOCKED'
      );
    }

    let report: KycHmacVerificationReport;
    try {
      report = await this.verifyMigrationCompleteness(db);
    } catch (err) {
      if (err instanceof HttpError && err.code === 'LEGACY_HMAC_RETIREMENT_BLOCKED') {
        throw err;
      }
      throw new HttpError(
        503,
        err instanceof Error ? err.message : 'Unable to verify KYC HMAC migration completeness',
        'LEGACY_HMAC_RETIREMENT_BLOCKED'
      );
    }

    if (!report.readyToRetireLegacyHmac) {
      throw new HttpError(
        503,
        `Legacy KYC HMAC retirement blocked: ${report.remainingLegacyV1Records} v1, ${report.remainingNonTargetRecords} non-target, ${report.missingActiveFingerprintRecords} missing active fingerprints, ${report.missingHistoricalFingerprintRecords} missing historical fingerprints, ${report.unindexedActiveRecords} unindexed, and ${report.recordsWithUnavailableKeys} unavailable-key records remain`,
        'LEGACY_HMAC_RETIREMENT_BLOCKED'
      );
    }
  }

  static async runBatchMigration(
    options: KycHmacMigrationOptions = {}
  ): Promise<KycHmacMigrationResult> {
    if (isLegacyHmacDisabled()) {
      await this.assertLegacyHmacRetirementAllowed(prisma);
    }

    const dryRun = Boolean(options.dryRun);
    const rotateEncryption = Boolean(options.rotateEncryption);
    const batchSize = Math.min(500, Math.max(1, options.batchSize ?? 50));
    const maxBatches = options.maxBatches !== undefined ? Math.max(1, options.maxBatches) : Infinity;
    const { targetVersion, expectedVersions } = getExpectedDocumentHmacVersions();
    const supportsFingerprints = hasDelegate(prisma, 'identityDocumentFingerprint');

    let cursor = options.cursor;
    let batchesExecuted = 0;
    let scanned = 0;
    let migrated = 0;
    let wouldMigrate = 0;
    let skippedAlreadyCurrent = 0;
    const conflicts: string[] = [];
    const failures: Array<{ id: string; reason: string }> = [];
    let hasMore = false;

    while (batchesExecuted < maxBatches) {
      const whereClause: Prisma.IdentityVerificationWhereInput = supportsFingerprints
        ? {
            documentNumberEncrypted: { not: null },
            OR: [
              { documentNumberHmacVersion: { not: targetVersion } },
              { documentNumberHash: null },
              ...expectedVersions.map(ver => ({
                status: { not: 'REJECTED' as const },
                documentFingerprints: { none: { hmacVersion: ver } },
              })),
            ],
            ...(cursor ? { id: { gt: cursor } } : {}),
          }
        : {
            documentNumberEncrypted: { not: null },
            documentNumberHmacVersion: { not: targetVersion },
            ...(cursor ? { id: { gt: cursor } } : {}),
          };

      const rows = await prisma.identityVerification.findMany({
        where: whereClause,
        orderBy: { id: 'asc' },
        take: batchSize + 1,
        select: {
          id: true,
          sellerProfileId: true,
          status: true,
          country: true,
          documentType: true,
          documentNumberEncrypted: true,
          dateOfBirthEncrypted: true,
          documentNumberHash: true,
          documentNumberHmacVersion: true,
          version: true,
        },
      });

      hasMore = rows.length > batchSize;
      const batch = hasMore ? rows.slice(0, batchSize) : rows;
      if (batch.length === 0) {
        hasMore = false;
        break;
      }

      batchesExecuted += 1;

      for (const row of batch) {
        cursor = row.id;
        scanned += 1;

        if (!row.documentNumberEncrypted) continue;

        let plaintextDoc: string | null = null;
        try {
          plaintextDoc = decryptSensitiveField(row.documentNumberEncrypted);
        } catch (err) {
          failures.push({
            id: row.id,
            reason: err instanceof Error ? err.message : 'DECRYPTION_FAILED',
          });
          continue;
        }

        if (!plaintextDoc) {
          failures.push({ id: row.id, reason: 'EMPTY_DECRYPTED_DOCUMENT_NUMBER' });
          continue;
        }

        const { hash: nextHash, version: nextVersion } = hmacDocumentNumberWithVersion(plaintextDoc);
        const fingerprintEntries = computeDocumentNumberFingerprintEntries(plaintextDoc);
        const allCandidateHashes = fingerprintEntries.map(entry => entry.hash);
        const normalizedCountry = (row.country ?? '').trim().toUpperCase();

        let existingFingerprintsForRow: Array<{ hmacVersion: string; documentNumberHash: string }> = [];
        if (supportsFingerprints && row.status !== 'REJECTED') {
          existingFingerprintsForRow = await prisma.identityDocumentFingerprint.findMany({
            where: { identityVerificationId: row.id },
            select: { hmacVersion: true, documentNumberHash: true },
          });
        }

        const fingerprintMap = new Map(
          existingFingerprintsForRow.map(fp => [fp.hmacVersion, fp.documentNumberHash])
        );
        const needsPrimaryHmacUpdate =
          row.documentNumberHmacVersion !== targetVersion ||
          !row.documentNumberHash ||
          row.documentNumberHash !== nextHash;
        const needsEncryptionUpdate =
          rotateEncryption &&
          (needsKeyRotation(row.documentNumberEncrypted) || needsKeyRotation(row.dateOfBirthEncrypted));
        const needsFingerprintBackfill =
          supportsFingerprints &&
          row.status !== 'REJECTED' &&
          fingerprintEntries.some(entry => fingerprintMap.get(entry.hmacVersion) !== entry.hash);

        if (!needsPrimaryHmacUpdate && !needsEncryptionUpdate && !needsFingerprintBackfill) {
          skippedAlreadyCurrent += 1;
          continue;
        }

        if (row.status !== 'REJECTED') {
          const conflictingActive = await prisma.identityVerification.findFirst({
            where: {
              id: { not: row.id },
              sellerProfileId: { not: row.sellerProfileId },
              country: row.country ? normalizedCountry : null,
              documentType: row.documentType,
              documentNumberHash: { in: allCandidateHashes },
              status: { not: 'REJECTED' },
            },
            select: { id: true },
          });
          if (conflictingActive) {
            conflicts.push(row.id);
            continue;
          }

          if (supportsFingerprints) {
            const conflictingFingerprint = await prisma.identityDocumentFingerprint.findFirst({
              where: {
                identityVerificationId: { not: row.id },
                sellerProfileId: { not: row.sellerProfileId },
                country: normalizedCountry,
                documentType: row.documentType,
                documentNumberHash: { in: allCandidateHashes },
              },
              select: { id: true },
            });
            if (conflictingFingerprint) {
              conflicts.push(row.id);
              continue;
            }
          }
        }

        if (dryRun) {
          wouldMigrate += 1;
          continue;
        }

        try {
          await prisma.$transaction(async tx => {
            await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtext(${`kyc:${row.sellerProfileId}`}))`;
            const fresh = await tx.identityVerification.findUnique({
              where: { id: row.id },
              select: {
                id: true,
                sellerProfileId: true,
                status: true,
                country: true,
                documentType: true,
                version: true,
                documentNumberHash: true,
                documentNumberHmacVersion: true,
                documentNumberEncrypted: true,
                dateOfBirthEncrypted: true,
              },
            });
            if (!fresh) {
              skippedAlreadyCurrent += 1;
              return;
            }

            const shouldReencryptDoc =
              rotateEncryption && needsKeyRotation(fresh.documentNumberEncrypted);
            const shouldReencryptDob =
              rotateEncryption && needsKeyRotation(fresh.dateOfBirthEncrypted);
            const updateVerification =
              fresh.documentNumberHmacVersion !== targetVersion ||
              !fresh.documentNumberHash ||
              fresh.documentNumberHash !== nextHash ||
              shouldReencryptDoc ||
              shouldReencryptDob;

            if (updateVerification) {
              const updateRes = await tx.identityVerification.updateMany({
                where: { id: fresh.id, version: fresh.version },
                data: {
                  documentNumberHash: nextHash,
                  documentNumberHmacVersion: nextVersion,
                  ...(shouldReencryptDoc
                    ? { documentNumberEncrypted: reencryptSensitiveField(fresh.documentNumberEncrypted) }
                    : {}),
                  ...(shouldReencryptDob
                    ? { dateOfBirthEncrypted: reencryptSensitiveField(fresh.dateOfBirthEncrypted) }
                    : {}),
                  version: fresh.version + 1,
                },
              });
              if (updateRes.count !== 1) {
                throw new Error('CONCURRENT_MODIFICATION');
              }
            }

            await syncVerificationDocumentFingerprints(tx, {
              identityVerificationId: fresh.id,
              sellerProfileId: fresh.sellerProfileId,
              status: fresh.status,
              country: fresh.country,
              documentType: fresh.documentType,
              entries: fingerprintEntries,
              replaceExisting: false,
            });

            migrated += 1;
          });
        } catch (err) {
          if (isUniqueConstraintError(err)) {
            conflicts.push(row.id);
          } else {
            failures.push({
              id: row.id,
              reason: err instanceof Error ? err.message : 'UPDATE_FAILED',
            });
          }
        }
      }

      if (!hasMore) break;
    }

    return {
      dryRun,
      targetVersion,
      scanned,
      migrated,
      wouldMigrate,
      skippedAlreadyCurrent,
      conflicts,
      failures,
      lastCursor: cursor ?? null,
      hasMore,
    };
  }

  static async verifyMigrationCompleteness(
    db: DbClient = prisma
  ): Promise<KycHmacVerificationReport> {
    const { targetVersion, historicalVersions, expectedVersions } = getExpectedDocumentHmacVersions();
    const supportsFingerprints =
      hasDelegate(db, 'identityDocumentFingerprint') &&
      typeof db.identityDocumentFingerprint.findMany === 'function';

    const missingFingerprintVersions: Record<string, number> = Object.fromEntries(
      expectedVersions.map(ver => [ver, 0])
    );
    const unavailableKeySet = new Set<string>();

    let totalEncryptedRecords = 0;
    let migratedRecords = 0;
    let remainingLegacyV1Records = 0;
    let remainingNonTargetRecords = 0;
    let missingActiveFingerprintRecords = 0;
    let missingHistoricalFingerprintRecords = 0;
    let unindexedActiveRecords = 0;
    let recordsWithUnavailableKeys = 0;

    let cursor: string | undefined;
    const scanBatchSize = 250;

    while (true) {
      const rows = await db.identityVerification.findMany({
        where: {
          documentNumberEncrypted: { not: null },
          ...(cursor ? { id: { gt: cursor } } : {}),
        },
        orderBy: { id: 'asc' },
        take: scanBatchSize + 1,
        select: {
          id: true,
          status: true,
          documentNumberEncrypted: true,
          dateOfBirthEncrypted: true,
          documentNumberHash: true,
          documentNumberHmacVersion: true,
        },
      });

      const hasMore = rows.length > scanBatchSize;
      const batch = hasMore ? rows.slice(0, scanBatchSize) : rows;
      if (batch.length === 0) break;

      for (const row of batch) {
        cursor = row.id;
        if (!row.documentNumberEncrypted) continue;
        totalEncryptedRecords += 1;

        let recordHasUnavailableKey = false;
        const docKeyCheck = checkEncryptedFieldKeyAvailability(row.documentNumberEncrypted);
        if (!docKeyCheck.available) {
          recordHasUnavailableKey = true;
          if (docKeyCheck.versionLabel) unavailableKeySet.add(docKeyCheck.versionLabel);
        }
        const dobKeyCheck = checkEncryptedFieldKeyAvailability(row.dateOfBirthEncrypted);
        if (!dobKeyCheck.available) {
          recordHasUnavailableKey = true;
          if (dobKeyCheck.versionLabel) unavailableKeySet.add(dobKeyCheck.versionLabel);
        }

        const hmacVer = row.documentNumberHmacVersion?.trim() ?? '';
        const isLegacyV1 = hmacVer === 'v1' || hmacVer.startsWith('v1:');
        const isTarget = hmacVer === targetVersion;
        const hasPrimaryHash = Boolean(row.documentNumberHash?.trim());

        if (isLegacyV1) {
          remainingLegacyV1Records += 1;
        }
        if (!isTarget) {
          remainingNonTargetRecords += 1;
          if (hmacVer && !isLegacyV1 && !expectedVersions.includes(hmacVer)) {
            recordHasUnavailableKey = true;
            unavailableKeySet.add(hmacVer);
          }
        }

        let fingerprintsCompleteForRow = true;
        if (row.status !== 'REJECTED') {
          if (!hasPrimaryHash || !hmacVer) {
            unindexedActiveRecords += 1;
            fingerprintsCompleteForRow = false;
          }

          if (supportsFingerprints) {
            const fps = await db.identityDocumentFingerprint.findMany({
              where: { identityVerificationId: row.id },
              select: { hmacVersion: true, documentNumberHash: true },
            });
            const presentVersions = new Set(
              fps.filter(fp => Boolean(fp.documentNumberHash?.trim())).map(fp => fp.hmacVersion)
            );

            if (!presentVersions.has(targetVersion)) {
              missingActiveFingerprintRecords += 1;
              missingFingerprintVersions[targetVersion] =
                (missingFingerprintVersions[targetVersion] ?? 0) + 1;
              fingerprintsCompleteForRow = false;
            }

            let missingHistForRow = false;
            for (const histVer of historicalVersions) {
              if (!presentVersions.has(histVer)) {
                missingHistForRow = true;
                missingFingerprintVersions[histVer] =
                  (missingFingerprintVersions[histVer] ?? 0) + 1;
                fingerprintsCompleteForRow = false;
              }
            }
            if (missingHistForRow) {
              missingHistoricalFingerprintRecords += 1;
            }
          }
        }

        if (recordHasUnavailableKey) {
          recordsWithUnavailableKeys += 1;
        }

        if (isTarget && hasPrimaryHash && !recordHasUnavailableKey && fingerprintsCompleteForRow) {
          migratedRecords += 1;
        }
      }

      if (!hasMore) break;
    }

    const blockingReasons: string[] = [];
    if (remainingLegacyV1Records > 0) {
      blockingReasons.push(`REMAINING_LEGACY_V1_RECORDS:${remainingLegacyV1Records}`);
    }
    if (remainingNonTargetRecords > 0) {
      blockingReasons.push(`REMAINING_NON_TARGET_RECORDS:${remainingNonTargetRecords}`);
    }
    if (missingActiveFingerprintRecords > 0) {
      blockingReasons.push(`MISSING_ACTIVE_FINGERPRINT_RECORDS:${missingActiveFingerprintRecords}`);
    }
    if (missingHistoricalFingerprintRecords > 0) {
      blockingReasons.push(`MISSING_HISTORICAL_FINGERPRINT_RECORDS:${missingHistoricalFingerprintRecords}`);
    }
    if (unindexedActiveRecords > 0) {
      blockingReasons.push(`UNINDEXED_ACTIVE_RECORDS:${unindexedActiveRecords}`);
    }
    if (recordsWithUnavailableKeys > 0) {
      blockingReasons.push(`UNAVAILABLE_KEY_RECORDS:${recordsWithUnavailableKeys}`);
    }
    if (!supportsFingerprints && totalEncryptedRecords > 0 && historicalVersions.length > 0) {
      blockingReasons.push('FINGERPRINT_INDEX_UNAVAILABLE');
    }

    return {
      targetVersion,
      expectedHistoricalVersions: historicalVersions,
      expectedFingerprintVersions: expectedVersions,
      totalEncryptedRecords,
      migratedRecords,
      remainingLegacyV1Records,
      remainingNonTargetRecords,
      missingActiveFingerprintRecords,
      missingHistoricalFingerprintRecords,
      missingFingerprintVersions,
      unindexedActiveRecords,
      recordsWithUnavailableKeys,
      unavailableKeyVersions: [...unavailableKeySet].sort(),
      readyToRetireLegacyHmac: blockingReasons.length === 0,
      blockingReasons,
    };
  }
}
