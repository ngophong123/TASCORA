import crypto from 'node:crypto';
import { Prisma, VerificationStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { HttpError } from '../../lib/errors';
import {
  computeDocumentNumberFingerprintEntries,
  decryptSensitiveField,
  encryptSensitiveField,
  hmacDocumentNumberWithVersion,
  isLegacyHmacDisabled,
  maskDateOfBirth,
  maskDocumentNumber,
  type DocumentNumberFingerprintEntry,
} from '../../lib/kyc-crypto';
import {
  KycHmacMigrationService,
  syncVerificationDocumentFingerprints,
} from './kyc-hmac-migration.service';
import {
  assertPrivateKycUpload,
  canonicalizeStoredUploadCandidate,
  parseUploadReference,
} from '../upload/references';
import { createStorage, ownedKey, type Storage } from '../upload/storage';
import { AuditService, type AdminAuditAction, type AuditContext } from '../audit/audit.service';
import {
  assertAdminCanTransition,
  assertCanTransitionScanStatus,
  assertDocumentSafeForDelivery,
  assertScanVerifiedForApproval,
  assertSellerCanSubmit,
  assertSellerCanUpdate,
  DELIVERABLE_SCAN_STATUS,
  type KycDocumentType,
  type KycScanStatus,
} from './kyc.state-machine';
import {
  createDefaultMalwareScanner,
  isMalwareScannerConfigured,
  scanEvidenceBuffers,
  type EvidenceBufferEntry,
  type MalwareScanner,
} from './malware-scanner';
import { evaluateSellerPayoutEligibility } from './payout-eligibility';

export const DEFAULT_KYC_SCAN_MAX_ATTEMPTS = Math.max(
  1,
  Number(process.env.KYC_SCAN_MAX_ATTEMPTS || 5)
);
export const DEFAULT_KYC_SCAN_LEASE_MS = Math.max(
  10_000,
  Number(process.env.KYC_SCAN_LEASE_MS || 2 * 60 * 1000)
);
const DEFAULT_SCAN_BASE_RETRY_DELAY_MS = 15_000;
const DEFAULT_SCAN_MAX_RETRY_DELAY_MS = 15 * 60 * 1000;
const REPLACED_UPLOAD_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
const ORPHANED_UPLOAD_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
const INFECTED_UPLOAD_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
export const DEFAULT_ABANDONED_KYC_UPLOAD_TTL_MS = Math.max(
  60_000,
  Number(process.env.KYC_ABANDONED_KYC_UPLOAD_TTL_MS || 24 * 60 * 60 * 1000)
);

export type KycAdminDecision = 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'NEEDS_RESUBMISSION';
export type KycDocumentSlot = 'front' | 'back' | 'selfie';
export type KycUploadSlotName = 'documentFront' | 'documentBack' | 'selfie';

interface SubmitKycInput {
  documentType: KycDocumentType;
  documentNumber: string;
  legalName: string;
  dateOfBirth: string;
  country: string;
  documentFrontUrl: string;
  documentBackUrl?: string | null;
  selfieUrl?: string | null;
}

type UpdateKycInput = Partial<SubmitKycInput>;

function hasDelegate(obj: unknown, key: string): boolean {
  if (!obj || typeof obj !== 'object') return false;
  const delegate = (obj as Record<string, unknown>)[key];
  return Boolean(delegate && typeof delegate === 'object');
}

async function assertUploadNotAlreadyUsedOutsideKyc(
  tx: Prisma.TransactionClient,
  reference: string
): Promise<void> {
  const txAny = tx as unknown as Record<string, Record<string, ((args: unknown) => Promise<unknown>) | undefined>>;
  const checks: Array<Promise<unknown>> = [];
  if (typeof txAny.serviceImage?.findFirst === 'function') {
    checks.push(tx.serviceImage.findFirst({ where: { url: reference }, select: { id: true } }));
  }
  if (typeof txAny.message?.findFirst === 'function') {
    checks.push(tx.message.findFirst({ where: { attachmentUrl: reference }, select: { id: true } }));
  }
  if (typeof txAny.orderDelivery?.findFirst === 'function') {
    checks.push(tx.orderDelivery.findFirst({ where: { files: { has: reference } }, select: { id: true } }));
  }
  if (typeof txAny.buyerProfile?.findFirst === 'function') {
    checks.push(tx.buyerProfile.findFirst({ where: { avatar: reference }, select: { id: true } }));
  }
  if (typeof txAny.sellerProfile?.findFirst === 'function') {
    checks.push(tx.sellerProfile.findFirst({ where: { avatar: reference }, select: { id: true } }));
  }
  const results = await Promise.all(checks);
  if (results.some(Boolean)) {
    throw new HttpError(
      409,
      'Uploaded files already used in messages, orders, listings, or profiles cannot be submitted for KYC',
      'KYC_UPLOAD_REUSE_CONFLICT'
    );
  }

  // Compatibility read for pre-canonicalization legacy internal upload URLs stored before UPL-05.
  const parsed = parseUploadReference(reference);
  if (!parsed) return;
  const legacyChecks: Array<Promise<boolean>> = [];

  if (typeof txAny.serviceImage?.findMany === 'function') {
    legacyChecks.push(
      tx.serviceImage
        .findMany({
          where: { url: { contains: parsed.file }, service: { seller: { userId: parsed.owner } } },
          select: { url: true },
          take: 20,
        })
        .then(rows => rows.some(r => canonicalizeStoredUploadCandidate(r.url, parsed.owner) === reference))
    );
  }
  if (typeof txAny.message?.findMany === 'function') {
    legacyChecks.push(
      tx.message
        .findMany({
          where: { senderId: parsed.owner, attachmentUrl: { contains: parsed.file } },
          select: { attachmentUrl: true },
          take: 20,
        })
        .then(rows =>
          rows.some(r => r.attachmentUrl && canonicalizeStoredUploadCandidate(r.attachmentUrl, parsed.owner) === reference)
        )
    );
  }
  if (typeof txAny.buyerProfile?.findMany === 'function') {
    legacyChecks.push(
      tx.buyerProfile
        .findMany({
          where: { userId: parsed.owner, avatar: { contains: parsed.file } },
          select: { avatar: true },
          take: 5,
        })
        .then(rows => rows.some(r => canonicalizeStoredUploadCandidate(r.avatar, parsed.owner) === reference))
    );
  }
  if (typeof txAny.sellerProfile?.findMany === 'function') {
    legacyChecks.push(
      tx.sellerProfile
        .findMany({
          where: { userId: parsed.owner, avatar: { contains: parsed.file } },
          select: { avatar: true },
          take: 5,
        })
        .then(rows => rows.some(r => canonicalizeStoredUploadCandidate(r.avatar, parsed.owner) === reference))
    );
  }

  if (legacyChecks.length > 0 && (await Promise.all(legacyChecks)).some(Boolean)) {
    throw new HttpError(
      409,
      'Uploaded files already used in messages, orders, listings, or profiles cannot be submitted for KYC',
      'KYC_UPLOAD_REUSE_CONFLICT'
    );
  }
}

async function syncKycUploadLifecycle(
  tx: Prisma.TransactionClient,
  params: {
    userId: string;
    verificationId: string;
    previousRefs: Array<string | null | undefined>;
    activeSlots: Array<{ slot: KycUploadSlotName; reference: string | null | undefined }>;
    changedSlots: Set<string>;
    now: Date;
  }
): Promise<void> {
  if (!hasDelegate(tx, 'uploadObject') || typeof tx.uploadObject.findUnique !== 'function') {
    return;
  }

  const activeSet = new Set(
    params.activeSlots.map(s => s.reference).filter((ref): ref is string => Boolean(ref))
  );

  for (const item of params.activeSlots) {
    if (!item.reference) continue;
    await assertUploadNotAlreadyUsedOutsideKyc(tx, item.reference);
    const existingObj = await tx.uploadObject.findUnique({
      where: { reference: item.reference },
    });
    if (!existingObj) {
      throw new HttpError(
        400,
        `Uploaded file metadata not found for ${item.slot}; upload the file cleanly before submitting KYC`,
        'UPLOAD_OBJECT_NOT_FOUND'
      );
    }
    if (existingObj.ownerId !== params.userId) {
      throw new HttpError(403, 'KYC upload belongs to another user', 'UPLOAD_FORBIDDEN');
    }
    if (existingObj.lifecycleStatus !== 'ACTIVE') {
      throw new HttpError(
        409,
        'Replaced, orphaned, or deleted upload objects cannot be used for KYC',
        'UPLOAD_INACTIVE'
      );
    }
    if (existingObj.scanStatus === 'INFECTED') {
      throw new HttpError(
        423,
        'Infected upload objects cannot be reused for KYC submission',
        'KYC_DOCUMENT_INFECTED'
      );
    }
    if (
      existingObj.kycVerificationId &&
      existingObj.kycVerificationId !== params.verificationId
    ) {
      throw new HttpError(
        409,
        'Upload object is already bound to another verification record',
        'KYC_UPLOAD_REUSE_CONFLICT'
      );
    }

    const isFreshOrChanged = params.changedSlots.has(item.slot);
    const nextScanStatus =
      isFreshOrChanged || existingObj.scanStatus === 'NOT_REQUIRED'
        ? 'QUARANTINED'
        : existingObj.scanStatus;

    const updateData = {
      purpose: 'KYC',
      lifecycleStatus: 'ACTIVE',
      scanStatus: nextScanStatus,
      ...(isFreshOrChanged
        ? { scanResult: null, scannedAt: null, scanEngineVersion: null }
        : {}),
      kycVerificationId: params.verificationId,
      kycSlot: item.slot,
      replacedAt: null,
      retentionUntil: null,
    };

    if (typeof tx.uploadObject.updateMany === 'function') {
      const claim = await tx.uploadObject.updateMany({
        where: {
          id: existingObj.id,
          ownerId: params.userId,
          lifecycleStatus: 'ACTIVE',
          OR: [
            { kycVerificationId: null },
            { kycVerificationId: params.verificationId },
          ],
        },
        data: updateData,
      });
      if (claim.count !== 1) {
        throw new HttpError(
          409,
          'Upload object is no longer active or was concurrently claimed; re-upload the document',
          'UPLOAD_INACTIVE'
        );
      }
    } else {
      await tx.uploadObject.update({
        where: { id: existingObj.id },
        data: updateData,
      });
    }
  }

  for (const oldRef of params.previousRefs) {
    if (!oldRef || activeSet.has(oldRef)) continue;
    const oldObj = await tx.uploadObject.findUnique({ where: { reference: oldRef } });
    if (!oldObj || oldObj.lifecycleStatus === 'DELETED') continue;
    const retentionMs =
      oldObj.scanStatus === 'INFECTED' ? INFECTED_UPLOAD_RETENTION_MS : REPLACED_UPLOAD_RETENTION_MS;
    await tx.uploadObject.update({
      where: { id: oldObj.id },
      data: {
        purpose: 'KYC',
        lifecycleStatus: 'REPLACED',
        replacedAt: params.now,
        retentionUntil: new Date(params.now.getTime() + retentionMs),
      },
    });
  }
}

function buildSellerDocumentDescriptor(
  reference: string | null | undefined,
  slot: KycDocumentSlot,
  scanStatus: string
) {
  const parsed = parseUploadReference(reference);
  if (!parsed) return null;
  const downloadable = scanStatus === DELIVERABLE_SCAN_STATUS;
  return {
    slot,
    uploaded: true,
    filename: parsed.file,
    downloadable,
    downloadPath: downloadable ? `/api/v1/uploads/kyc/${parsed.owner}/${parsed.file}` : null,
  };
}

function toSellerKycView(
  verification: {
    id: string;
    status: VerificationStatus;
    documentType: string;
    legalName: string | null;
    documentNumberLast4: string | null;
    country: string | null;
    documentUrl: string;
    documentBackUrl: string | null;
    selfieUrl: string | null;
    scanStatus: string;
    scanResult?: string | null;
    scannedAt?: Date | null;
    scanEngineVersion?: string | null;
    submittedAt: Date;
    reviewedAt: Date | null;
    resubmissionRequestedAt: Date | null;
    decisionReason: string | null;
    comments: string | null;
    version: number;
    updatedAt: Date;
    dateOfBirthEncrypted: string | null;
  },
  reviewHistory: {
    id: string;
    decision: string;
    previousState: VerificationStatus;
    newState: VerificationStatus;
    reason: string | null;
    comments: string | null;
    createdAt: Date;
  }[]
) {
  const dobPlain = decryptSensitiveField(verification.dateOfBirthEncrypted);
  return {
    id: verification.id,
    status: verification.status,
    documentType: verification.documentType,
    legalName: verification.legalName,
    documentNumberMasked: verification.documentNumberLast4
      ? `••••${verification.documentNumberLast4}`
      : null,
    dateOfBirthMasked: maskDateOfBirth(dobPlain),
    country: verification.country,
    scanStatus: verification.scanStatus,
    scanResult: verification.scanResult ?? null,
    scannedAt: verification.scannedAt ?? null,
    scanEngineVersion: verification.scanEngineVersion ?? null,
    documents: {
      front: buildSellerDocumentDescriptor(verification.documentUrl, 'front', verification.scanStatus),
      back: buildSellerDocumentDescriptor(verification.documentBackUrl, 'back', verification.scanStatus),
      selfie: buildSellerDocumentDescriptor(verification.selfieUrl, 'selfie', verification.scanStatus),
    },
    submittedAt: verification.submittedAt,
    reviewedAt: verification.reviewedAt,
    resubmissionRequestedAt: verification.resubmissionRequestedAt,
    decisionReason: verification.decisionReason,
    comments: verification.comments,
    version: verification.version,
    updatedAt: verification.updatedAt,
    reviewHistory,
  };
}

function decisionToAuditAction(decision: KycAdminDecision): AdminAuditAction {
  switch (decision) {
    case 'UNDER_REVIEW':
      return 'KYC_MARKED_UNDER_REVIEW';
    case 'APPROVED':
      return 'KYC_APPROVED';
    case 'REJECTED':
      return 'KYC_REJECTED';
    case 'NEEDS_RESUBMISSION':
      return 'KYC_RESUBMISSION_REQUESTED';
  }
}

export class KycService {
  static async requireActiveAdmin(adminId: string) {
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      select: { id: true, role: true, status: true },
    });
    if (!admin || admin.role !== 'ADMIN' || admin.status !== 'ACTIVE') {
      throw new HttpError(403, 'Active administrator privileges required');
    }
    return admin;
  }

  static async getMyKyc(userId: string) {
    const seller = await prisma.sellerProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        status: true,
        verificationStatus: true,
        stripeAccountId: true,
        user: { select: { id: true, status: true } },
        identityVerification: {
          include: {
            reviewHistory: {
              orderBy: { createdAt: 'desc' },
              take: 25,
              select: {
                id: true,
                decision: true,
                previousState: true,
                newState: true,
                reason: true,
                comments: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!seller) {
      throw new HttpError(403, 'Seller profile is required before accessing identity verification');
    }

    const payoutEligibility = evaluateSellerPayoutEligibility({
      sellerStatus: seller.status,
      verificationStatus: seller.verificationStatus,
      accountStatus: seller.user.status,
      hasStripeAccountId: Boolean(seller.stripeAccountId),
    });

    return {
      status: seller.verificationStatus,
      sellerProfileStatus: seller.status,
      submission: seller.identityVerification
        ? toSellerKycView(seller.identityVerification, seller.identityVerification.reviewHistory)
        : null,
      payoutEligibility,
    };
  }

  static async getSellerPayoutEligibility(userId: string) {
    const seller = await prisma.sellerProfile.findUnique({
      where: { userId },
      select: {
        status: true,
        verificationStatus: true,
        stripeAccountId: true,
        user: { select: { status: true } },
      },
    });
    if (!seller) {
      throw new HttpError(403, 'Seller profile is required');
    }
    return evaluateSellerPayoutEligibility({
      sellerStatus: seller.status,
      verificationStatus: seller.verificationStatus,
      accountStatus: seller.user.status,
      hasStripeAccountId: Boolean(seller.stripeAccountId),
    });
  }

  private static async executeWithDuplicateHandling<T>(op: () => Promise<T>): Promise<T> {
    try {
      return await op();
    } catch (err) {
      const e = err as { code?: string; message?: string } | null;
      if (
        e?.code === 'P2002' ||
        (typeof e?.message === 'string' &&
          (e.message.includes('Duplicate active identity document') ||
            e.message.includes('identity_document_fingerprints_country_documentType_documentNumberHash_key') ||
            e.message.includes('23505')))
      ) {
        throw new HttpError(
          409,
          'This government identity document is already associated with an active verification record',
          'KYC_DUPLICATE_DOCUMENT'
        );
      }
      throw err;
    }
  }

  private static async assertNoDuplicateActiveDocument(
    tx: Prisma.TransactionClient,
    params: {
      sellerProfileId: string;
      country: string | null | undefined;
      documentType: string;
      documentNumberHashes: string[];
    }
  ) {
    const hashes = Array.from(new Set(params.documentNumberHashes.filter(Boolean)));
    if (hashes.length === 0) return;
    const normalizedCountry = params.country ? params.country.trim().toUpperCase() : null;
    const hashFilter = hashes.length === 1 ? hashes[0]! : { in: hashes };

    const duplicate = await tx.identityVerification.findFirst({
      where: {
        sellerProfileId: { not: params.sellerProfileId },
        country: normalizedCountry,
        documentType: params.documentType,
        documentNumberHash: hashFilter,
        status: { not: 'REJECTED' },
      },
      select: { id: true },
    });
    if (duplicate) {
      throw new HttpError(
        409,
        'This government identity document is already associated with an active verification record',
        'KYC_DUPLICATE_DOCUMENT'
      );
    }

    if (
      hasDelegate(tx, 'identityDocumentFingerprint') &&
      typeof tx.identityDocumentFingerprint.findFirst === 'function'
    ) {
      const fingerprintDuplicate = await tx.identityDocumentFingerprint.findFirst({
        where: {
          sellerProfileId: { not: params.sellerProfileId },
          country: normalizedCountry ?? '',
          documentType: params.documentType,
          documentNumberHash: hashFilter,
        },
        select: { id: true },
      });
      if (fingerprintDuplicate) {
        throw new HttpError(
          409,
          'This government identity document is already associated with an active verification record',
          'KYC_DUPLICATE_DOCUMENT'
        );
      }
    }
  }

  static async submitKyc(userId: string, input: SubmitKycInput, context?: AuditContext) {
    assertPrivateKycUpload(input.documentFrontUrl, userId, false);
    if (input.documentBackUrl) assertPrivateKycUpload(input.documentBackUrl, userId, false);
    if (input.selfieUrl) assertPrivateKycUpload(input.selfieUrl, userId, true);

    const normalizedDocNum = input.documentNumber.trim().replace(/\s+/g, '');
    const encryptedDocNum = encryptSensitiveField(normalizedDocNum);
    const encryptedDob = encryptSensitiveField(input.dateOfBirth.trim());
    const { hash: docNumHash, version: docNumHmacVersion } =
      hmacDocumentNumberWithVersion(normalizedDocNum);
    const fingerprintEntries = computeDocumentNumberFingerprintEntries(normalizedDocNum);
    const lookupHashes = fingerprintEntries.map(entry => entry.hash);
    const docNumLast4 = normalizedDocNum.slice(-4);
    const now = new Date();
    const correlationId = context?.correlationId || crypto.randomUUID();

    // Policy: only one non-rejected verification across separate seller profiles may claim a given
    // (country, documentType, documentNumberHash). Rejected claims remain excluded so a malicious
    // claimant cannot permanently deny the legitimate document holder on another account.
    const normalizedCountry = (input.country ?? '').trim().toUpperCase();

    const view = await this.executeWithDuplicateHandling(() => prisma.$transaction(async tx => {
      const seller = await tx.sellerProfile.findUnique({
        where: { userId },
        include: { user: { select: { id: true, role: true, status: true } }, identityVerification: true },
      });
      if (!seller || seller.user.status !== 'ACTIVE') {
        throw new HttpError(403, 'An active seller profile is required for KYC submission');
      }

      await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtext(${`kyc:${seller.id}`}))`;
      if (isLegacyHmacDisabled()) {
        await KycHmacMigrationService.assertLegacyHmacRetirementAllowed(tx);
      }
      const existing = await tx.identityVerification.findUnique({ where: { sellerProfileId: seller.id } });
      const previousState = existing?.status ?? seller.verificationStatus;
      assertSellerCanSubmit(previousState);

      await this.assertNoDuplicateActiveDocument(tx, {
        sellerProfileId: seller.id,
        country: normalizedCountry,
        documentType: input.documentType,
        documentNumberHashes: lookupHashes,
      });

      const previousRefs = existing
        ? [existing.documentUrl, existing.documentBackUrl, existing.selfieUrl]
        : [];
      const changedSlots = new Set<string>(['documentFront', 'documentBack', 'selfie']);
      const scannerConfigured = isMalwareScannerConfigured();
      const initialScanResult = scannerConfigured ? 'PENDING_SCAN' : 'SCANNER_NOT_CONFIGURED';
      let saved;
      if (existing) {
        if (
          hasDelegate(tx, 'identityDocumentFingerprint') &&
          typeof tx.identityDocumentFingerprint.deleteMany === 'function'
        ) {
          await tx.identityDocumentFingerprint.deleteMany({
            where: { identityVerificationId: existing.id },
          });
        }
        const nextVersion = existing.version + 1;
        const result = await tx.identityVerification.updateMany({
          where: { id: existing.id, version: existing.version },
          data: {
            status: 'PENDING',
            documentType: input.documentType,
            legalName: input.legalName.trim(),
            dateOfBirthEncrypted: encryptedDob,
            documentNumberEncrypted: encryptedDocNum,
            documentNumberHash: docNumHash,
            documentNumberHmacVersion: docNumHmacVersion,
            documentNumberLast4: docNumLast4,
            country: input.country.trim().toUpperCase(),
            documentUrl: input.documentFrontUrl,
            documentBackUrl: input.documentBackUrl ?? null,
            selfieUrl: input.selfieUrl ?? null,
            scanStatus: 'QUARANTINED',
            scanResult: initialScanResult,
            scannedAt: null,
            scanEngineVersion: null,
            scanAttempts: 0,
            lastScanAttemptAt: null,
            nextScanRetryAt: null,
            scanLeaseExpiresAt: null,
            scanClaimId: null,
            submittedAt: now,
            reviewedAt: null,
            reviewedById: null,
            resubmissionRequestedAt: null,
            decisionReason: null,
            comments: null,
            version: nextVersion,
          },
        });
        if (result.count !== 1) {
          throw new HttpError(409, 'KYC verification changed concurrently; please retry', 'KYC_CONCURRENT_MODIFICATION');
        }
        saved = await tx.identityVerification.findUniqueOrThrow({ where: { id: existing.id } });
      } else {
        saved = await tx.identityVerification.create({
          data: {
            sellerProfileId: seller.id,
            status: 'PENDING',
            documentType: input.documentType,
            legalName: input.legalName.trim(),
            dateOfBirthEncrypted: encryptedDob,
            documentNumberEncrypted: encryptedDocNum,
            documentNumberHash: docNumHash,
            documentNumberHmacVersion: docNumHmacVersion,
            documentNumberLast4: docNumLast4,
            country: input.country.trim().toUpperCase(),
            documentUrl: input.documentFrontUrl,
            documentBackUrl: input.documentBackUrl ?? null,
            selfieUrl: input.selfieUrl ?? null,
            scanStatus: 'QUARANTINED',
            scanResult: initialScanResult,
            scannedAt: null,
            scanEngineVersion: null,
            scanAttempts: 0,
            lastScanAttemptAt: null,
            nextScanRetryAt: null,
            scanLeaseExpiresAt: null,
            scanClaimId: null,
            submittedAt: now,
            version: 1,
          },
        });
      }

      await syncVerificationDocumentFingerprints(tx, {
        identityVerificationId: saved.id,
        sellerProfileId: seller.id,
        status: saved.status,
        country: saved.country,
        documentType: saved.documentType,
        entries: fingerprintEntries,
        replaceExisting: false,
      });

      await syncKycUploadLifecycle(tx, {
        userId,
        verificationId: saved.id,
        previousRefs,
        activeSlots: [
          { slot: 'documentFront', reference: saved.documentUrl },
          { slot: 'documentBack', reference: saved.documentBackUrl },
          { slot: 'selfie', reference: saved.selfieUrl },
        ],
        changedSlots,
        now,
      });

      await tx.sellerProfile.update({
        where: { id: seller.id },
        data: { verificationStatus: 'PENDING' },
      });

      const history = await tx.kycReviewHistory.create({
        data: {
          identityVerificationId: saved.id,
          sellerProfileId: seller.id,
          actorId: userId,
          actorRole: seller.user.role,
          decision: existing ? 'RESUBMITTED' : 'SUBMITTED',
          previousState,
          newState: 'PENDING',
          correlationId,
        },
      });

      return toSellerKycView(saved, [history]);
    }));

    this.triggerAsyncKycScan(view.id);
    return view;
  }

  static async updatePendingKyc(userId: string, input: UpdateKycInput, context?: AuditContext) {
    if (input.documentFrontUrl) assertPrivateKycUpload(input.documentFrontUrl, userId, false);
    if (input.documentBackUrl) assertPrivateKycUpload(input.documentBackUrl, userId, false);
    if (input.selfieUrl) assertPrivateKycUpload(input.selfieUrl, userId, true);

    const normalizedDocNum = input.documentNumber?.trim().replace(/\s+/g, '');
    const now = new Date();
    const correlationId = context?.correlationId || crypto.randomUUID();

    const view = await this.executeWithDuplicateHandling(() => prisma.$transaction(async tx => {
      const seller = await tx.sellerProfile.findUnique({
        where: { userId },
        include: { user: { select: { id: true, role: true, status: true } } },
      });
      if (!seller || seller.user.status !== 'ACTIVE') {
        throw new HttpError(403, 'An active seller profile is required for KYC updates');
      }

      await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtext(${`kyc:${seller.id}`}))`;
      if (isLegacyHmacDisabled()) {
        await KycHmacMigrationService.assertLegacyHmacRetirementAllowed(tx);
      }
      const existing = await tx.identityVerification.findUnique({ where: { sellerProfileId: seller.id } });
      if (!existing) {
        throw new HttpError(404, 'No existing KYC submission found');
      }
      assertSellerCanUpdate(existing.status);

      const previousState = existing.status;
      const targetCountry = (input.country ?? existing.country)?.trim().toUpperCase() ?? null;
      const targetDocType = input.documentType ?? existing.documentType;
      const nextHmac = normalizedDocNum ? hmacDocumentNumberWithVersion(normalizedDocNum) : null;
      const targetDocHash = nextHmac ? nextHmac.hash : existing.documentNumberHash;
      let fingerprintEntries: DocumentNumberFingerprintEntry[] = [];
      if (normalizedDocNum) {
        fingerprintEntries = computeDocumentNumberFingerprintEntries(normalizedDocNum);
      } else if (existing.documentNumberEncrypted) {
        try {
          const decryptedExistingDoc = decryptSensitiveField(existing.documentNumberEncrypted);
          if (decryptedExistingDoc) {
            fingerprintEntries = computeDocumentNumberFingerprintEntries(decryptedExistingDoc);
          }
        } catch {
          if (existing.documentNumberHash) {
            fingerprintEntries = [
              { hmacVersion: existing.documentNumberHmacVersion, hash: existing.documentNumberHash },
            ];
          }
        }
      } else if (existing.documentNumberHash) {
        fingerprintEntries = [
          { hmacVersion: existing.documentNumberHmacVersion, hash: existing.documentNumberHash },
        ];
      }
      const lookupHashes = fingerprintEntries.map(entry => entry.hash);

      await this.assertNoDuplicateActiveDocument(tx, {
        sellerProfileId: seller.id,
        country: targetCountry,
        documentType: targetDocType,
        documentNumberHashes: lookupHashes,
      });

      if (
        hasDelegate(tx, 'identityDocumentFingerprint') &&
        typeof tx.identityDocumentFingerprint.deleteMany === 'function'
      ) {
        await tx.identityDocumentFingerprint.deleteMany({
          where: { identityVerificationId: existing.id },
        });
      }

      const changedSlots = new Set<string>();
      if (input.documentFrontUrl !== undefined && input.documentFrontUrl !== existing.documentUrl) {
        changedSlots.add('documentFront');
      }
      if (input.documentBackUrl !== undefined && input.documentBackUrl !== existing.documentBackUrl) {
        changedSlots.add('documentBack');
      }
      if (input.selfieUrl !== undefined && input.selfieUrl !== existing.selfieUrl) {
        changedSlots.add('selfie');
      }
      const hasChangedFiles = changedSlots.size > 0;
      const scannerConfigured = isMalwareScannerConfigured();
      const updateData: Prisma.IdentityVerificationUncheckedUpdateManyInput = {
        status: 'PENDING',
        version: existing.version + 1,
        submittedAt: now,
        ...(previousState !== 'PENDING'
          ? {
              reviewedAt: null,
              reviewedById: null,
              resubmissionRequestedAt: null,
              decisionReason: null,
              comments: null,
            }
          : {}),
        ...(input.documentType ? { documentType: input.documentType } : {}),
        ...(input.legalName ? { legalName: input.legalName.trim() } : {}),
        ...(input.country ? { country: input.country.trim().toUpperCase() } : {}),
        ...(input.dateOfBirth ? { dateOfBirthEncrypted: encryptSensitiveField(input.dateOfBirth.trim()) } : {}),
        ...(normalizedDocNum && targetDocHash && nextHmac
          ? {
              documentNumberEncrypted: encryptSensitiveField(normalizedDocNum),
              documentNumberHash: targetDocHash,
              documentNumberHmacVersion: nextHmac.version,
              documentNumberLast4: normalizedDocNum.slice(-4),
            }
          : {}),
        ...(input.documentFrontUrl !== undefined ? { documentUrl: input.documentFrontUrl } : {}),
        ...(input.documentBackUrl !== undefined ? { documentBackUrl: input.documentBackUrl } : {}),
        ...(input.selfieUrl !== undefined ? { selfieUrl: input.selfieUrl } : {}),
        ...(hasChangedFiles
          ? {
              scanStatus: 'QUARANTINED',
              scanResult: scannerConfigured ? 'PENDING_SCAN' : 'SCANNER_NOT_CONFIGURED',
              scannedAt: null,
              scanEngineVersion: null,
              scanAttempts: 0,
              lastScanAttemptAt: null,
              nextScanRetryAt: null,
              scanLeaseExpiresAt: null,
              scanClaimId: null,
            }
          : {}),
      };

      const updateResult = await tx.identityVerification.updateMany({
        where: { id: existing.id, version: existing.version },
        data: updateData,
      });
      if (updateResult.count !== 1) {
        throw new HttpError(409, 'KYC verification changed concurrently; please retry', 'KYC_CONCURRENT_MODIFICATION');
      }
      const saved = await tx.identityVerification.findUniqueOrThrow({ where: { id: existing.id } });

      await syncVerificationDocumentFingerprints(tx, {
        identityVerificationId: saved.id,
        sellerProfileId: seller.id,
        status: saved.status,
        country: saved.country,
        documentType: saved.documentType,
        entries: fingerprintEntries,
        replaceExisting: false,
      });

      await syncKycUploadLifecycle(tx, {
        userId,
        verificationId: saved.id,
        previousRefs: [existing.documentUrl, existing.documentBackUrl, existing.selfieUrl],
        activeSlots: [
          { slot: 'documentFront', reference: saved.documentUrl },
          { slot: 'documentBack', reference: saved.documentBackUrl },
          { slot: 'selfie', reference: saved.selfieUrl },
        ],
        changedSlots,
        now,
      });

      if (previousState !== 'PENDING') {
        await tx.sellerProfile.update({
          where: { id: seller.id },
          data: { verificationStatus: 'PENDING' },
        });
      }

      const history = await tx.kycReviewHistory.create({
        data: {
          identityVerificationId: saved.id,
          sellerProfileId: seller.id,
          actorId: userId,
          actorRole: seller.user.role,
          decision: 'RESUBMITTED',
          previousState,
          newState: 'PENDING',
          correlationId,
        },
      });

      return toSellerKycView(saved, [history]);
    }));

    if (
      input.documentFrontUrl !== undefined ||
      input.documentBackUrl !== undefined ||
      input.selfieUrl !== undefined
    ) {
      this.triggerAsyncKycScan(view.id);
    }
    return view;
  }

  static async getAdminQueue(filters: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;
    const search = filters.search?.trim();

    const where: Prisma.IdentityVerificationWhereInput = {
      ...(filters.status && filters.status !== 'ALL'
        ? { status: filters.status as VerificationStatus }
        : {}),
      ...(search
        ? {
            OR: [
              { legalName: { contains: search, mode: 'insensitive' } },
              { country: { contains: search, mode: 'insensitive' } },
              { sellerProfile: { firstName: { contains: search, mode: 'insensitive' } } },
              { sellerProfile: { lastName: { contains: search, mode: 'insensitive' } } },
              { sellerProfile: { user: { email: { contains: search, mode: 'insensitive' } } } },
            ],
          }
        : {}),
    };

    const [items, total, pendingCount, underReviewCount, needsResubmissionCount, approvedCount, rejectedCount] =
      await Promise.all([
        prisma.identityVerification.findMany({
          where,
          skip,
          take: limit,
          orderBy: [{ submittedAt: 'asc' }],
          select: {
            id: true,
            sellerProfileId: true,
            status: true,
            documentType: true,
            legalName: true,
            documentNumberLast4: true,
            country: true,
            scanStatus: true,
            submittedAt: true,
            reviewedAt: true,
            version: true,
            sellerProfile: {
              select: {
                id: true,
                userId: true,
                firstName: true,
                lastName: true,
                status: true,
                verificationStatus: true,
                user: { select: { id: true, email: true, status: true } },
              },
            },
          },
        }),
        prisma.identityVerification.count({ where }),
        prisma.identityVerification.count({ where: { status: 'PENDING' } }),
        prisma.identityVerification.count({ where: { status: 'UNDER_REVIEW' } }),
        prisma.identityVerification.count({ where: { status: 'NEEDS_RESUBMISSION' } }),
        prisma.identityVerification.count({ where: { status: { in: ['APPROVED', 'VERIFIED'] } } }),
        prisma.identityVerification.count({ where: { status: 'REJECTED' } }),
      ]);

    return {
      items: items.map(item => ({
        id: item.id,
        sellerProfileId: item.sellerProfileId,
        status: item.status,
        documentType: item.documentType,
        legalName: item.legalName,
        documentNumberMasked: item.documentNumberLast4 ? `••••${item.documentNumberLast4}` : null,
        country: item.country,
        scanStatus: item.scanStatus,
        submittedAt: item.submittedAt,
        reviewedAt: item.reviewedAt,
        version: item.version,
        seller: {
          id: item.sellerProfile.id,
          userId: item.sellerProfile.userId,
          email: item.sellerProfile.user.email,
          accountStatus: item.sellerProfile.user.status,
          firstName: item.sellerProfile.firstName,
          lastName: item.sellerProfile.lastName,
          profileStatus: item.sellerProfile.status,
        },
      })),
      counts: {
        pending: pendingCount,
        underReview: underReviewCount,
        needsResubmission: needsResubmissionCount,
        approved: approvedCount,
        rejected: rejectedCount,
        actionable: pendingCount + underReviewCount,
      },
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  static async getAdminKycDetail(id: string, adminId: string, context?: AuditContext) {
    await this.requireActiveAdmin(adminId);

    const verification = await prisma.identityVerification.findUnique({
      where: { id },
      include: {
        sellerProfile: {
          select: {
            id: true,
            userId: true,
            firstName: true,
            lastName: true,
            professionalTitle: true,
            country: true,
            status: true,
            verificationStatus: true,
            stripeAccountId: true,
            user: { select: { id: true, email: true, status: true, createdAt: true } },
          },
        },
        reviewedBy: { select: { id: true, email: true } },
        reviewHistory: {
          orderBy: { createdAt: 'desc' },
          include: { actor: { select: { id: true, email: true, role: true } } },
        },
      },
    });

    if (!verification) {
      throw new HttpError(404, 'KYC verification record not found');
    }

    await AuditService.record(prisma, {
      adminId,
      action: 'KYC_RECORD_VIEWED',
      targetEntity: 'IdentityVerification',
      targetId: verification.id,
      previousState: verification.status,
      newState: verification.status,
      metadata: {
        sellerProfileId: verification.sellerProfileId,
        scanStatus: verification.scanStatus,
        hasBackDocument: Boolean(verification.documentBackUrl),
        hasSelfie: Boolean(verification.selfieUrl),
      },
      context,
    });

    const documentNumber = decryptSensitiveField(verification.documentNumberEncrypted);
    const dateOfBirth = decryptSensitiveField(verification.dateOfBirthEncrypted);
    const front = parseUploadReference(verification.documentUrl);
    const back = parseUploadReference(verification.documentBackUrl);
    const selfie = parseUploadReference(verification.selfieUrl);

    const payoutEligibility = evaluateSellerPayoutEligibility({
      sellerStatus: verification.sellerProfile.status,
      verificationStatus: verification.sellerProfile.verificationStatus,
      accountStatus: verification.sellerProfile.user.status,
      hasStripeAccountId: Boolean(verification.sellerProfile.stripeAccountId),
    });

    return {
      id: verification.id,
      sellerProfileId: verification.sellerProfileId,
      status: verification.status,
      documentType: verification.documentType,
      legalName: verification.legalName,
      documentNumber,
      documentNumberMasked: maskDocumentNumber(documentNumber),
      dateOfBirth,
      dateOfBirthMasked: maskDateOfBirth(dateOfBirth),
      country: verification.country,
      scanStatus: verification.scanStatus,
      scanResult: verification.scanResult ?? null,
      scannedAt: verification.scannedAt ?? null,
      scanEngineVersion: verification.scanEngineVersion ?? null,
      submittedAt: verification.submittedAt,
      reviewedAt: verification.reviewedAt,
      reviewedBy: verification.reviewedBy,
      resubmissionRequestedAt: verification.resubmissionRequestedAt,
      decisionReason: verification.decisionReason,
      comments: verification.comments,
      version: verification.version,
      seller: {
        id: verification.sellerProfile.id,
        userId: verification.sellerProfile.userId,
        email: verification.sellerProfile.user.email,
        accountStatus: verification.sellerProfile.user.status,
        firstName: verification.sellerProfile.firstName,
        lastName: verification.sellerProfile.lastName,
        professionalTitle: verification.sellerProfile.professionalTitle,
        profileStatus: verification.sellerProfile.status,
        verificationStatus: verification.sellerProfile.verificationStatus,
      },
      documents: (() => {
        const downloadable = verification.scanStatus === DELIVERABLE_SCAN_STATUS;
        const mapSlot = (slot: KycDocumentSlot, parsed: { owner: string; file: string } | null) =>
          parsed
            ? {
                slot,
                filename: parsed.file,
                extension: parsed.file.split('.').pop() || '',
                downloadable,
                downloadEndpoint: downloadable
                  ? `/api/v1/admin/kyc/${verification.id}/documents/${slot}`
                  : null,
              }
            : null;
        return {
          front: mapSlot('front', front),
          back: mapSlot('back', back),
          selfie: mapSlot('selfie', selfie),
        };
      })(),
      reviewHistory: verification.reviewHistory,
      payoutEligibility,
    };
  }

  static triggerAsyncKycScan(verificationId: string): void {
    if (!isMalwareScannerConfigured() || process.env.KYC_DISABLE_AUTO_SCAN === 'true') {
      return;
    }
    queueMicrotask(() => {
      void this.scanPendingDocuments(verificationId).catch(() => undefined);
    });
  }

  static async scanPendingDocuments(
    verificationId: string,
    scanner: MalwareScanner = createDefaultMalwareScanner(),
    storage: Storage = createStorage(),
    options: {
      respectBackoff?: boolean;
      respectRetryLimit?: boolean;
      maxAttempts?: number;
      leaseMs?: number;
      baseRetryDelayMs?: number;
      now?: Date;
    } = {}
  ) {
    const claimNow = options.now ?? new Date();
    const maxAttempts = Math.max(1, options.maxAttempts ?? DEFAULT_KYC_SCAN_MAX_ATTEMPTS);
    const leaseMs = Math.max(1_000, options.leaseMs ?? DEFAULT_KYC_SCAN_LEASE_MS);
    const baseRetryDelayMs = Math.max(100, options.baseRetryDelayMs ?? DEFAULT_SCAN_BASE_RETRY_DELAY_MS);
    const claimId = crypto.randomUUID();
    const leaseExpiresAt = new Date(claimNow.getTime() + leaseMs);

    const claimState = await prisma.$transaction(async tx => {
      const pre = await tx.identityVerification.findUnique({
        where: { id: verificationId },
        select: { id: true, sellerProfileId: true },
      });
      if (!pre) {
        throw new HttpError(404, 'KYC verification record not found');
      }

      await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtext(${`kyc:${pre.sellerProfileId}`}))`;

      const current = await tx.identityVerification.findUnique({
        where: { id: verificationId },
        select: {
          id: true,
          sellerProfileId: true,
          documentUrl: true,
          documentBackUrl: true,
          selfieUrl: true,
          scanStatus: true,
          scanResult: true,
          scannedAt: true,
          scanEngineVersion: true,
          scanAttempts: true,
          nextScanRetryAt: true,
          scanLeaseExpiresAt: true,
          scanClaimId: true,
          version: true,
          sellerProfile: { select: { userId: true } },
        },
      });
      if (!current) {
        throw new HttpError(404, 'KYC verification record not found');
      }

      if (current.scanStatus === 'INFECTED') {
        throw new HttpError(
          409,
          'Infected KYC evidence cannot be re-scanned without a fresh seller resubmission',
          'KYC_DOCUMENT_INFECTED'
        );
      }

      if (current.scanStatus === 'VERIFIED_SAFE') {
        return { kind: 'already_clean' as const, record: current };
      }

      const currentAttempts = current.scanAttempts ?? 0;
      if (options.respectRetryLimit && currentAttempts >= maxAttempts) {
        throw new HttpError(
          409,
          'KYC malware scan retry limit exhausted',
          'KYC_SCAN_RETRY_EXHAUSTED'
        );
      }

      if (
        options.respectBackoff &&
        current.nextScanRetryAt &&
        current.nextScanRetryAt.getTime() > claimNow.getTime()
      ) {
        return { kind: 'backoff_active' as const, record: current };
      }

      if (
        current.scanStatus === 'SCANNING' &&
        current.scanLeaseExpiresAt &&
        current.scanLeaseExpiresAt.getTime() > claimNow.getTime()
      ) {
        throw new HttpError(
          409,
          'KYC verification is already being scanned by another worker',
          'KYC_SCAN_IN_PROGRESS'
        );
      }

      assertCanTransitionScanStatus(current.scanStatus, 'SCANNING');

      const claimedAttempts = currentAttempts + 1;
      const claimRes = await tx.identityVerification.updateMany({
        where: { id: current.id, version: current.version },
        data: {
          scanStatus: 'SCANNING',
          scanClaimId: claimId,
          scanLeaseExpiresAt: leaseExpiresAt,
          lastScanAttemptAt: claimNow,
          scanAttempts: claimedAttempts,
          version: current.version + 1,
        },
      });
      if (claimRes.count !== 1) {
        throw new HttpError(409, 'KYC verification changed concurrently while claiming scan lease', 'KYC_CONCURRENT_MODIFICATION');
      }

      const activeRefs = [current.documentUrl, current.documentBackUrl, current.selfieUrl].filter(
        (ref): ref is string => Boolean(ref)
      );
      if (activeRefs.length > 0 && hasDelegate(tx, 'uploadObject') && typeof tx.uploadObject.updateMany === 'function') {
        await tx.uploadObject.updateMany({
          where: { reference: { in: activeRefs }, lifecycleStatus: 'ACTIVE' },
          data: { scanStatus: 'SCANNING' },
        });
      }

      return {
        kind: 'claimed' as const,
        snapshot: {
          ...current,
          version: current.version + 1,
          priorAttempts: currentAttempts,
          claimedAttempts,
        },
      };
    });

    if (claimState.kind !== 'claimed') {
      return claimState.record;
    }

    const { snapshot } = claimState;
    const slotRefs: Array<{ slot: KycDocumentSlot; ref: string | null | undefined }> = [
      { slot: 'front', ref: snapshot.documentUrl },
      { slot: 'back', ref: snapshot.documentBackUrl },
      { slot: 'selfie', ref: snapshot.selfieUrl },
    ];

    const entries: EvidenceBufferEntry[] = [];
    let scanOutcome;
    try {
      if (typeof storage.readBuffer !== 'function') {
        throw new Error('Storage adapter does not support direct buffer reads');
      }
      for (const item of slotRefs) {
        if (!item.ref) continue;
        const parsed = parseUploadReference(item.ref);
        if (!parsed || parsed.owner !== snapshot.sellerProfile.userId) {
          throw new HttpError(400, `Invalid KYC upload reference on slot ${item.slot}`);
        }
        const key = ownedKey(parsed.owner, parsed.file);
        const buffer = await storage.readBuffer(key);
        entries.push({ slot: item.slot, key, buffer });
      }
      scanOutcome = await scanEvidenceBuffers(entries, scanner);
    } catch {
      scanOutcome = {
        scanStatus: 'SCAN_FAILED' as KycScanStatus,
        verdict: 'FAILED' as const,
        resultDetail: 'EVIDENCE_READ_FAILED',
        engineVersion: null,
        scannedAt: new Date(),
      };
    }

    const commitNow = options.now ?? new Date();
    const isUnconfiguredUnavailable =
      scanOutcome.verdict === 'UNAVAILABLE' && scanOutcome.scanStatus === 'QUARANTINED';

    const nextScanRetryAt =
      scanOutcome.scanStatus === 'SCAN_FAILED' && snapshot.claimedAttempts < maxAttempts
        ? new Date(
            commitNow.getTime() +
              Math.min(
                DEFAULT_SCAN_MAX_RETRY_DELAY_MS,
                baseRetryDelayMs * Math.pow(2, Math.max(0, snapshot.claimedAttempts - 1))
              )
          )
        : null;

    return prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtext(${`kyc:${snapshot.sellerProfileId}`}))`;
      const current = await tx.identityVerification.findUnique({
        where: { id: snapshot.id },
        select: {
          id: true,
          version: true,
          scanStatus: true,
          scanClaimId: true,
          documentUrl: true,
          documentBackUrl: true,
          selfieUrl: true,
        },
      });
      if (!current) {
        throw new HttpError(404, 'KYC verification record not found');
      }
      if (
        current.version !== snapshot.version ||
        current.scanClaimId !== claimId ||
        current.scanStatus === 'INFECTED' ||
        current.documentUrl !== snapshot.documentUrl ||
        current.documentBackUrl !== snapshot.documentBackUrl ||
        current.selfieUrl !== snapshot.selfieUrl
      ) {
        throw new HttpError(
          409,
          'KYC evidence changed during scanning; keeping new upload quarantined',
          'KYC_CONCURRENT_MODIFICATION'
        );
      }

      const updateRes = await tx.identityVerification.updateMany({
        where: { id: current.id, version: current.version },
        data: {
          scanStatus: scanOutcome.scanStatus,
          scanResult: scanOutcome.resultDetail,
          scannedAt: scanOutcome.scannedAt,
          scanEngineVersion: scanOutcome.engineVersion,
          scanAttempts: isUnconfiguredUnavailable ? snapshot.priorAttempts : snapshot.claimedAttempts,
          scanClaimId: null,
          scanLeaseExpiresAt: null,
          nextScanRetryAt,
          version: current.version + 1,
        },
      });
      if (updateRes.count !== 1) {
        throw new HttpError(409, 'KYC verification changed concurrently during scan commit', 'KYC_CONCURRENT_MODIFICATION');
      }

      const activeRefs = [current.documentUrl, current.documentBackUrl, current.selfieUrl].filter(
        (ref): ref is string => Boolean(ref)
      );
      if (activeRefs.length > 0 && hasDelegate(tx, 'uploadObject') && typeof tx.uploadObject.updateMany === 'function') {
        await tx.uploadObject.updateMany({
          where: { reference: { in: activeRefs }, lifecycleStatus: 'ACTIVE' },
          data: {
            scanStatus: scanOutcome.scanStatus,
            scanResult: scanOutcome.resultDetail,
            scannedAt: scanOutcome.scannedAt,
            scanEngineVersion: scanOutcome.engineVersion,
          },
        });
      }

      return tx.identityVerification.findUniqueOrThrow({ where: { id: current.id } });
    });
  }

  static async processPendingScanBatch(
    options: {
      limit?: number;
      scanner?: MalwareScanner;
      storage?: Storage;
      maxAttempts?: number;
      leaseMs?: number;
      baseRetryDelayMs?: number;
      now?: Date;
    } = {}
  ): Promise<{
    scanned: number;
    succeeded: number;
    failed: number;
    skippedUnconfigured: boolean;
    purgedUploads: number;
  }> {
    const scanner = options.scanner ?? createDefaultMalwareScanner();
    const storage = options.storage ?? createStorage();
    const now = options.now ?? new Date();

    if (scanner.providerName === 'unavailable') {
      await this.markAbandonedKycUploadsOrphaned(now).catch(() => 0);
      const purgedUploads = await this.purgeExpiredUploads(storage, now).catch(() => 0);
      return {
        scanned: 0,
        succeeded: 0,
        failed: 0,
        skippedUnconfigured: true,
        purgedUploads,
      };
    }

    const limit = Math.min(50, Math.max(1, options.limit ?? 10));
    const maxAttempts = Math.max(1, options.maxAttempts ?? DEFAULT_KYC_SCAN_MAX_ATTEMPTS);

    const candidates = await prisma.identityVerification.findMany({
      where: {
        OR: [
          {
            scanStatus: { in: ['QUARANTINED', 'PENDING_SCAN'] },
            OR: [{ nextScanRetryAt: null }, { nextScanRetryAt: { lte: now } }],
          },
          {
            scanStatus: { in: ['SCAN_FAILED', 'SCAN_UNAVAILABLE'] },
            scanAttempts: { lt: maxAttempts },
            OR: [{ nextScanRetryAt: null }, { nextScanRetryAt: { lte: now } }],
          },
          {
            scanStatus: 'SCANNING',
            scanLeaseExpiresAt: { lte: now },
            scanAttempts: { lt: maxAttempts },
          },
        ],
      },
      orderBy: [{ submittedAt: 'asc' }],
      take: limit,
      select: { id: true },
    });

    let succeeded = 0;
    let failed = 0;

    for (const candidate of candidates) {
      try {
        const result = await this.scanPendingDocuments(candidate.id, scanner, storage, {
          respectBackoff: true,
          respectRetryLimit: true,
          maxAttempts,
          leaseMs: options.leaseMs,
          baseRetryDelayMs: options.baseRetryDelayMs,
          now,
        });
        if (result.scanStatus === 'VERIFIED_SAFE') {
          succeeded += 1;
        } else {
          failed += 1;
        }
      } catch {
        failed += 1;
      }
    }

    await this.markAbandonedKycUploadsOrphaned(now).catch(() => 0);
    const purgedUploads = await this.purgeExpiredUploads(storage, now).catch(() => 0);
    return {
      scanned: candidates.length,
      succeeded,
      failed,
      skippedUnconfigured: false,
      purgedUploads,
    };
  }

  /**
   * Transitions unattached `?purpose=kyc` uploads whose attachment TTL has expired from
   * `ACTIVE` to `ORPHANED` atomically so concurrent `submitKyc` attachment cannot race with cleanup.
   */
  static async markAbandonedKycUploadsOrphaned(
    now: Date = new Date(),
    options: { abandonedTtlMs?: number; limit?: number } = {}
  ): Promise<number> {
    if (!hasDelegate(prisma, 'uploadObject') || typeof prisma.uploadObject.findMany !== 'function') {
      return 0;
    }

    const ttlMs = Math.max(60_000, options.abandonedTtlMs ?? DEFAULT_ABANDONED_KYC_UPLOAD_TTL_MS);
    const cutoff = new Date(now.getTime() - ttlMs);

    const candidates = await prisma.uploadObject.findMany({
      where: {
        purpose: 'KYC',
        lifecycleStatus: 'ACTIVE',
        kycVerificationId: null,
        createdAt: { lte: cutoff },
      },
      take: Math.min(200, Math.max(1, options.limit ?? 100)),
      select: { id: true, scanStatus: true },
    });

    let orphanedCount = 0;
    for (const item of candidates) {
      const retentionMs =
        item.scanStatus === 'INFECTED'
          ? INFECTED_UPLOAD_RETENTION_MS
          : ORPHANED_UPLOAD_RETENTION_MS;
      const retentionUntil = new Date(now.getTime() + retentionMs);

      if (typeof prisma.uploadObject.updateMany === 'function') {
        const result = await prisma.uploadObject.updateMany({
          where: {
            id: item.id,
            purpose: 'KYC',
            lifecycleStatus: 'ACTIVE',
            kycVerificationId: null,
            createdAt: { lte: cutoff },
          },
          data: {
            lifecycleStatus: 'ORPHANED',
            replacedAt: now,
            retentionUntil,
          },
        });
        orphanedCount += result.count;
      } else {
        await prisma.uploadObject.update({
          where: { id: item.id },
          data: {
            lifecycleStatus: 'ORPHANED',
            replacedAt: now,
            retentionUntil,
          },
        });
        orphanedCount += 1;
      }
    }
    return orphanedCount;
  }

  static async purgeExpiredUploads(
    storage: Storage = createStorage(),
    now: Date = new Date(),
    limit = 50
  ): Promise<number> {
    if (!hasDelegate(prisma, 'uploadObject') || typeof prisma.uploadObject.findMany !== 'function') {
      return 0;
    }

    const expired = await prisma.uploadObject.findMany({
      where: {
        lifecycleStatus: { in: ['REPLACED', 'ORPHANED'] },
        retentionUntil: { lte: now },
      },
      take: Math.min(100, Math.max(1, limit)),
      select: { id: true, objectKey: true },
    });

    let deletedCount = 0;
    for (const item of expired) {
      try {
        if (typeof storage.delete === 'function') {
          await storage.delete(item.objectKey);
        }
        if (typeof prisma.uploadObject.updateMany === 'function') {
          const result = await prisma.uploadObject.updateMany({
            where: {
              id: item.id,
              lifecycleStatus: { in: ['REPLACED', 'ORPHANED'] },
              retentionUntil: { lte: now },
            },
            data: { lifecycleStatus: 'DELETED', deletedAt: now },
          });
          deletedCount += result.count;
        } else {
          await prisma.uploadObject.update({
            where: { id: item.id },
            data: { lifecycleStatus: 'DELETED', deletedAt: now },
          });
          deletedCount += 1;
        }
      } catch {
        // Isolate deletion failures per object so one transient storage error doesn't block cleanup.
      }
    }
    return deletedCount;
  }

  static async accessAdminKycDocument(
    id: string,
    slot: KycDocumentSlot,
    adminId: string,
    storage: Storage = createStorage(),
    context?: AuditContext
  ) {
    await this.requireActiveAdmin(adminId);

    const verification = await prisma.identityVerification.findUnique({
      where: { id },
      select: {
        id: true,
        sellerProfileId: true,
        status: true,
        scanStatus: true,
        documentUrl: true,
        documentBackUrl: true,
        selfieUrl: true,
        sellerProfile: { select: { userId: true } },
      },
    });
    if (!verification) {
      throw new HttpError(404, 'KYC verification record not found');
    }

    const reference =
      slot === 'front'
        ? verification.documentUrl
        : slot === 'back'
          ? verification.documentBackUrl
          : verification.selfieUrl;

    const parsed = parseUploadReference(reference);
    if (!parsed || parsed.owner !== verification.sellerProfile.userId) {
      throw new HttpError(404, 'Requested verification document not found');
    }

    // Fail closed: block local bytes and S3 presigned URLs until scanner promotes to VERIFIED_SAFE.
    assertDocumentSafeForDelivery(verification.scanStatus);
    if (reference && hasDelegate(prisma, 'uploadObject') && typeof prisma.uploadObject.findUnique === 'function') {
      const uploadObj = await prisma.uploadObject.findUnique({
        where: { reference },
        select: { lifecycleStatus: true, scanStatus: true },
      });
      if (uploadObj) {
        if (uploadObj.scanStatus === 'INFECTED') assertDocumentSafeForDelivery('INFECTED');
        if (uploadObj.lifecycleStatus !== 'ACTIVE') {
          throw new HttpError(404, 'Requested verification document is no longer active');
        }
        assertDocumentSafeForDelivery(uploadObj.scanStatus);
      }
    }

    const key = ownedKey(parsed.owner, parsed.file);
    const readResult = await storage.read(key);

    await AuditService.record(prisma, {
      adminId,
      action: 'KYC_DOCUMENT_VIEWED',
      targetEntity: 'IdentityVerification',
      targetId: verification.id,
      previousState: verification.status,
      newState: verification.status,
      metadata: {
        slot,
        sellerProfileId: verification.sellerProfileId,
        file: parsed.file,
        scanStatus: verification.scanStatus,
      },
      context,
    });

    return {
      filename: parsed.file,
      scanStatus: verification.scanStatus,
      readResult,
    };
  }

  static async reviewKycDecision(
    id: string,
    adminId: string,
    decision: KycAdminDecision,
    payload: { reason?: string; comments?: string; expectedVersion: number },
    context?: AuditContext
  ) {
    if (
      payload.expectedVersion === undefined ||
      payload.expectedVersion === null ||
      !Number.isInteger(payload.expectedVersion) ||
      payload.expectedVersion < 1
    ) {
      throw new HttpError(
        409,
        'expectedVersion is required for optimistic locking on KYC decisions',
        'KYC_VERSION_REQUIRED'
      );
    }

    await this.requireActiveAdmin(adminId);
    const correlationId = context?.correlationId || crypto.randomUUID();
    const now = new Date();

    return prisma.$transaction(async tx => {
      const initial = await tx.identityVerification.findUnique({
        where: { id },
        select: { id: true, sellerProfileId: true },
      });
      if (!initial) {
        throw new HttpError(404, 'KYC verification record not found');
      }

      await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtext(${`kyc:${initial.sellerProfileId}`}))`;

      const current = await tx.identityVerification.findUnique({
        where: { id },
        include: {
          sellerProfile: {
            select: { id: true, userId: true, status: true, user: { select: { id: true, status: true } } },
          },
        },
      });
      if (!current) {
        throw new HttpError(404, 'KYC verification record not found');
      }

      if (payload.expectedVersion !== current.version) {
        throw new HttpError(
          409,
          'KYC verification version mismatch; refresh the record before submitting a decision',
          'KYC_CONCURRENT_MODIFICATION'
        );
      }

      assertAdminCanTransition(current.status, decision);

      if (decision === 'APPROVED') {
        assertScanVerifiedForApproval(current.scanStatus);
        if (current.sellerProfile.user.status !== 'ACTIVE') {
          throw new HttpError(409, 'Cannot approve KYC for an inactive or suspended account');
        }
      }

      const trimmedReason = payload.reason?.trim() || null;
      const trimmedComments = payload.comments?.trim() || null;
      const previousState = current.status;
      const nextVersion = current.version + 1;

      const updateRes = await tx.identityVerification.updateMany({
        where: { id: current.id, version: current.version },
        data: {
          status: decision,
          reviewedById: adminId,
          reviewedAt: decision === 'UNDER_REVIEW' ? current.reviewedAt : now,
          resubmissionRequestedAt: decision === 'NEEDS_RESUBMISSION' ? now : current.resubmissionRequestedAt,
          decisionReason: trimmedReason ?? current.decisionReason,
          comments: trimmedComments ?? current.comments,
          version: nextVersion,
        },
      });
      if (updateRes.count !== 1) {
        throw new HttpError(409, 'KYC verification changed concurrently; please retry', 'KYC_CONCURRENT_MODIFICATION');
      }
      const updated = await tx.identityVerification.findUniqueOrThrow({ where: { id: current.id } });

      if (
        decision === 'REJECTED' &&
        hasDelegate(tx, 'identityDocumentFingerprint') &&
        typeof tx.identityDocumentFingerprint.deleteMany === 'function'
      ) {
        await tx.identityDocumentFingerprint.deleteMany({
          where: { identityVerificationId: current.id },
        });
      }

      await tx.sellerProfile.update({
        where: { id: current.sellerProfileId },
        data: { verificationStatus: decision },
      });

      const reviewEntry = await tx.kycReviewHistory.create({
        data: {
          identityVerificationId: current.id,
          sellerProfileId: current.sellerProfileId,
          actorId: adminId,
          actorRole: 'ADMIN',
          decision,
          previousState,
          newState: decision,
          reason: trimmedReason,
          comments: trimmedComments,
          correlationId,
        },
      });

      const auditEntry = await AuditService.record(tx, {
        adminId,
        action: decisionToAuditAction(decision),
        targetEntity: 'IdentityVerification',
        targetId: current.id,
        previousState,
        newState: decision,
        reason: trimmedReason,
        metadata: {
          sellerProfileId: current.sellerProfileId,
          sellerUserId: current.sellerProfile.userId,
          version: updated.version,
          scanStatus: current.scanStatus,
          commentsProvided: Boolean(trimmedComments),
          payoutsActivated: false,
        },
        context: { ...context, correlationId },
      });

      return {
        id: updated.id,
        sellerProfileId: updated.sellerProfileId,
        status: updated.status,
        version: updated.version,
        reviewedAt: updated.reviewedAt,
        reviewedById: updated.reviewedById,
        resubmissionRequestedAt: updated.resubmissionRequestedAt,
        decisionReason: updated.decisionReason,
        comments: updated.comments,
        reviewHistoryEntry: reviewEntry,
        auditLogId: auditEntry.id,
        correlationId,
      };
    });
  }
}
