import { VerificationStatus } from '@prisma/client';
import { HttpError } from '../../lib/errors';

export const KYC_DOCUMENT_TYPES = [
  'PASSPORT',
  'NATIONAL_ID',
  'DRIVERS_LICENSE',
  'RESIDENCE_PERMIT',
] as const;

export type KycDocumentType = (typeof KYC_DOCUMENT_TYPES)[number];

export const KYC_SCAN_STATUSES = [
  'PENDING_SCAN',
  'QUARANTINED',
  'SCANNING',
  'VERIFIED_SAFE',
  'SCAN_FAILED',
  'SCAN_UNAVAILABLE',
  'INFECTED',
] as const;

export type KycScanStatus = (typeof KYC_SCAN_STATUSES)[number];

export const DELIVERABLE_SCAN_STATUS = 'VERIFIED_SAFE' as const;

export const RETRYABLE_SCAN_STATUSES = new Set<string>([
  'QUARANTINED',
  'PENDING_SCAN',
  'SCAN_FAILED',
  'SCAN_UNAVAILABLE',
]);

export function assertCanTransitionScanStatus(
  current: string | null | undefined,
  next: KycScanStatus
): void {
  if (current === 'INFECTED') {
    throw new HttpError(
      409,
      'Infected KYC evidence cannot transition to another scan state without a fresh seller resubmission',
      'KYC_DOCUMENT_INFECTED'
    );
  }
  if (next === 'SCANNING') {
    if (current && !RETRYABLE_SCAN_STATUSES.has(current) && current !== 'SCANNING') {
      throw new HttpError(
        409,
        `Cannot begin scan from scanStatus ${current}`,
        'KYC_INVALID_SCAN_TRANSITION'
      );
    }
    return;
  }
  if (next === 'VERIFIED_SAFE' || next === 'INFECTED' || next === 'SCAN_FAILED' || next === 'QUARANTINED' || next === 'SCAN_UNAVAILABLE') {
    if (current === 'VERIFIED_SAFE' && next !== 'VERIFIED_SAFE' && next !== 'QUARANTINED') {
      throw new HttpError(
        409,
        `Cannot transition VERIFIED_SAFE KYC record directly to ${next}`,
        'KYC_INVALID_SCAN_TRANSITION'
      );
    }
  }
}

export function assertDocumentSafeForDelivery(scanStatus: string | null | undefined): void {
  if (scanStatus === DELIVERABLE_SCAN_STATUS) {
    return;
  }
  if (scanStatus === 'INFECTED') {
    throw new HttpError(
      423,
      'Document is quarantined due to malware detection and cannot be accessed',
      'KYC_DOCUMENT_INFECTED'
    );
  }
  throw new HttpError(
    423,
    'Document is quarantined until security scanning verifies it is safe',
    'KYC_DOCUMENT_QUARANTINED'
  );
}

export function assertScanVerifiedForApproval(scanStatus: string | null | undefined): void {
  if (scanStatus === DELIVERABLE_SCAN_STATUS) {
    return;
  }
  throw new HttpError(
    409,
    scanStatus === 'INFECTED'
      ? 'KYC submission cannot be approved because uploaded evidence failed malware scanning'
      : 'KYC submission cannot be approved until all required evidence passes security scanning',
    'KYC_SECURITY_SCAN_REQUIRED'
  );
}

export const SELLER_SUBMITTABLE_STATES = new Set<VerificationStatus>([
  'NOT_SUBMITTED',
  'NEEDS_RESUBMISSION',
  'REJECTED',
]);

export const SELLER_UPDATABLE_STATES = new Set<VerificationStatus>([
  'PENDING',
  'NEEDS_RESUBMISSION',
]);

export const ADMIN_ALLOWED_TRANSITIONS: Record<
  'UNDER_REVIEW' | 'APPROVED' | 'NEEDS_RESUBMISSION' | 'REJECTED',
  Set<VerificationStatus>
> = {
  UNDER_REVIEW: new Set<VerificationStatus>(['PENDING']),
  APPROVED: new Set<VerificationStatus>(['PENDING', 'UNDER_REVIEW']),
  NEEDS_RESUBMISSION: new Set<VerificationStatus>(['PENDING', 'UNDER_REVIEW']),
  REJECTED: new Set<VerificationStatus>(['PENDING', 'UNDER_REVIEW', 'NEEDS_RESUBMISSION']),
};

export function isKycVerifiedStatus(status: VerificationStatus | string | null | undefined): boolean {
  return status === 'APPROVED' || status === 'VERIFIED';
}

export function assertSellerCanSubmit(current: VerificationStatus): void {
  if (!SELLER_SUBMITTABLE_STATES.has(current)) {
    throw new HttpError(
      409,
      `Identity verification cannot be submitted while status is ${current}`,
      'KYC_INVALID_STATE_TRANSITION'
    );
  }
}

export function assertSellerCanUpdate(current: VerificationStatus): void {
  if (!SELLER_UPDATABLE_STATES.has(current)) {
    throw new HttpError(
      409,
      `Identity verification cannot be updated while status is ${current}`,
      'KYC_INVALID_STATE_TRANSITION'
    );
  }
}

export function assertAdminCanTransition(
  current: VerificationStatus,
  target: 'UNDER_REVIEW' | 'APPROVED' | 'NEEDS_RESUBMISSION' | 'REJECTED'
): void {
  if (!ADMIN_ALLOWED_TRANSITIONS[target].has(current)) {
    throw new HttpError(
      409,
      `Invalid KYC transition from ${current} to ${target}`,
      'KYC_INVALID_STATE_TRANSITION'
    );
  }
}
