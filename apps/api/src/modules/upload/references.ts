import path from 'node:path';
import { HttpError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { ownedKey } from './storage';

const BLOCKED_GENERAL_SCAN_STATUSES = new Set([
  'QUARANTINED',
  'PENDING_SCAN',
  'SCANNING',
  'SCAN_FAILED',
  'SCAN_UNAVAILABLE',
  'INFECTED',
]);

export function parseUploadReference(
  reference: string | undefined | null
): { owner: string; file: string; key: string } | null {
  if (!reference?.startsWith('upload:')) return null;
  const [owner, file, extra] = reference.slice(7).split('/');
  if (!owner || !file || extra) return null;
  const key = ownedKey(owner, file);
  return { owner, file, key };
}

export function assertOwnedUpload(reference: string | undefined, userId: string, imageOnly = false) {
  if (!reference?.startsWith('upload:')) return;
  const [owner, file, extra] = reference.slice(7).split('/');
  if (owner !== userId || !file || extra) {
    throw new HttpError(403, 'Upload belongs to another user or has an invalid reference');
  }
  ownedKey(owner, file);
  if (imageOnly && !/\.(png|jpg|webp)$/.test(file)) {
    throw new HttpError(400, 'A profile or service image must be PNG, JPEG or WebP');
  }
}

export function assertPrivateKycUpload(reference: string, userId: string, imageOnly = false): { owner: string; file: string } {
  if (!reference.startsWith('upload:')) {
    throw new HttpError(400, 'Identity documents must use private uploaded files');
  }
  const [owner, file, extra] = reference.slice(7).split('/');
  if (owner !== userId || !file || extra) {
    throw new HttpError(403, 'Upload belongs to another user or has an invalid reference');
  }
  ownedKey(owner, file);
  if (imageOnly && !/\.(png|jpg|webp)$/.test(file)) {
    throw new HttpError(400, 'Selfie verification image must be PNG, JPEG or WebP');
  }
  return { owner, file };
}

function hasAsciiControlChars(value: string): boolean {
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code <= 0x1f || code === 0x7f) return true;
  }
  return false;
}

function extractRawUrlPath(rawUrl: string): string {
  const withoutHash = rawUrl.split('#')[0] ?? '';
  const withoutQuery = withoutHash.split('?')[0] ?? '';
  if (/^https?:\/\//i.test(withoutQuery)) {
    const schemeEnd = withoutQuery.indexOf('://') + 3;
    const firstSlash = withoutQuery.indexOf('/', schemeEnd);
    return firstSlash === -1 ? '/' : withoutQuery.slice(firstSlash);
  }
  if (withoutQuery.startsWith('//')) {
    const firstSlash = withoutQuery.indexOf('/', 2);
    return firstSlash === -1 ? '/' : withoutQuery.slice(firstSlash);
  }
  return withoutQuery;
}

function containsRawDotTraversal(rawUrl: string): boolean {
  return extractRawUrlPath(rawUrl)
    .split(/[/\\]+/)
    .some(seg => seg === '.' || seg === '..' || /^%2e$/i.test(seg) || /^%2e%2e$/i.test(seg));
}

/**
 * Normalizes legitimate internal Tascora upload URLs (`/api/v1/uploads/...`) into
 * canonical `upload:<owner>/<file>` references and rejects malformed internal upload URLs.
 * Non-upload external URLs are returned unchanged.
 */
export function resolveCanonicalUploadRef(
  reference: string | undefined,
  userId?: string
): string | undefined {
  if (!reference) return reference;
  if (hasAsciiControlChars(reference)) {
    throw new HttpError(400, 'Invalid upload URL reference', 'INVALID_UPLOAD_REFERENCE');
  }
  if (reference.startsWith('upload:')) return reference;

  const trimmed = reference.trim();
  if (/[/\\]api[/\\]v1[/\\]uploads/i.test(trimmed) && trimmed.includes('\\')) {
    throw new HttpError(400, 'Malformed internal upload URL reference', 'INVALID_UPLOAD_REFERENCE');
  }

  const isUrlOrPath =
    /^(?:https?:)?\/\/|^\//i.test(trimmed) || /^api\/v1\/uploads(?:\/|$)/i.test(trimmed);
  if (!isUrlOrPath) {
    return reference;
  }

  const urlInput = /^api\/v1\/uploads(?:\/|$)/i.test(trimmed) ? `/${trimmed}` : trimmed;
  let parsed: URL;
  try {
    parsed = new URL(urlInput, 'https://tascora.invalid');
  } catch {
    if (/uploads/i.test(trimmed)) {
      throw new HttpError(400, 'Malformed upload URL reference', 'INVALID_UPLOAD_REFERENCE');
    }
    return reference;
  }

  const rawPathname = parsed.pathname;
  const hasEncodedSeparator = /%(?:2f|5c)/i.test(rawPathname) || rawPathname.includes('\\');
  let decodedPathname: string;
  try {
    decodedPathname = decodeURIComponent(rawPathname);
  } catch {
    if (/uploads/i.test(trimmed)) {
      throw new HttpError(400, 'Malformed encoded upload URL reference', 'INVALID_UPLOAD_REFERENCE');
    }
    return reference;
  }

  const hasDoubleEncoding = /%[0-9a-f]{2}/i.test(decodedPathname);
  const collapsed = decodedPathname.replace(/\\+/g, '/').replace(/\/{2,}/g, '/');
  const normalizedPath = path.posix.normalize(collapsed).replace(/\/+$/, '') || '/';
  const lowerPath = normalizedPath.toLowerCase();
  const rawTargetsInternalUploads =
    /^\/api(?:\/|\\|%2f|%5c)+v1(?:\/|\\|%2f|%5c)+uploads(?:\/|\\|%2f|%5c|$)/i.test(
      extractRawUrlPath(urlInput)
    );
  const isPreNormInternalUpload = /^\/api\/v1\/uploads(?:\/|$)/i.test(collapsed);
  const isPostNormInternalUpload =
    lowerPath === '/api/v1/uploads' || lowerPath.startsWith('/api/v1/uploads/');

  if (!rawTargetsInternalUploads && !isPreNormInternalUpload && !isPostNormInternalUpload) {
    return reference;
  }

  if (
    hasEncodedSeparator ||
    hasDoubleEncoding ||
    decodedPathname.includes('\\') ||
    Boolean(parsed.username) ||
    Boolean(parsed.password) ||
    containsRawDotTraversal(urlInput)
  ) {
    throw new HttpError(400, 'Malformed internal upload URL reference', 'INVALID_UPLOAD_REFERENCE');
  }

  const segments = normalizedPath.slice('/api/v1/uploads'.length).split('/').filter(Boolean);
  if (segments.length === 3) {
    const [kind, owner, file] = segments;
    if (!kind || !['public', 'shared', 'kyc'].includes(kind.toLowerCase()) || !owner || !file) {
      throw new HttpError(400, 'Unsupported internal upload route segment', 'INVALID_UPLOAD_REFERENCE');
    }
    ownedKey(owner, file);
    return `upload:${owner}/${file}`;
  }

  if (segments.length === 1) {
    const [file] = segments;
    if (!file) {
      throw new HttpError(400, 'Missing upload file identifier', 'INVALID_UPLOAD_REFERENCE');
    }
    if (!userId) {
      throw new HttpError(
        400,
        'Owner-unqualified internal upload URL requires an authenticated owner context',
        'INVALID_UPLOAD_REFERENCE'
      );
    }
    ownedKey(userId, file);
    return `upload:${userId}/${file}`;
  }

  throw new HttpError(400, 'Malformed internal upload URL reference', 'INVALID_UPLOAD_REFERENCE');
}

/**
 * Canonical upload reference format (`upload:<ownerId>/<fileName>`).
 */
export type CanonicalUploadRef = `upload:${string}/${string}`;

export interface VerifiedNonKycReference {
  raw: string;
  canonicalRef: string;
  isInternalUpload: boolean;
}

/**
 * Safely attempts to resolve a persisted DB reference into canonical `upload:<owner>/<file>`
 * form for a known owner, returning `undefined` instead of throwing on legacy malformed values.
 */
export function canonicalizeStoredUploadCandidate(
  storedRef: string | null | undefined,
  ownerId: string
): string | undefined {
  if (!storedRef) return undefined;
  try {
    return resolveCanonicalUploadRef(storedRef, ownerId);
  } catch {
    return undefined;
  }
}

/**
 * Authorizes an upload or external media reference and returns its canonical representation.
 * Internal `/api/v1/uploads/...` URL variants are normalized to `upload:<ownerId>/<file>`.
 */
export async function authorizeAndCanonicalizeNonKycUpload(
  reference: string | undefined,
  userId: string,
  imageOnly = false
): Promise<VerifiedNonKycReference | undefined> {
  if (reference === undefined || reference === null) return undefined;

  const canonicalRef = resolveCanonicalUploadRef(reference, userId);
  assertOwnedUpload(canonicalRef, userId, imageOnly);
  if (!canonicalRef) return undefined;

  if (!canonicalRef.startsWith('upload:')) {
    return {
      raw: reference,
      canonicalRef,
      isInternalUpload: false,
    };
  }

  const prismaRecord = prisma as unknown as Record<string, unknown>;

  if (
    prismaRecord.identityVerification &&
    typeof prisma.identityVerification.findFirst === 'function'
  ) {
    const linkedKyc = await prisma.identityVerification.findFirst({
      where: {
        OR: [
          { documentUrl: canonicalRef },
          { documentBackUrl: canonicalRef },
          { selfieUrl: canonicalRef },
        ],
      },
      select: { id: true },
    });
    if (linkedKyc) {
      throw new HttpError(
        403,
        'Identity verification documents cannot be used outside KYC verification',
        'KYC_DOCUMENT_REUSE_FORBIDDEN'
      );
    }
  }

  if (
    prismaRecord.uploadObject &&
    typeof prisma.uploadObject.findUnique === 'function'
  ) {
    const uploadObj = await prisma.uploadObject.findUnique({
      where: { reference: canonicalRef },
      select: {
        id: true,
        ownerId: true,
        purpose: true,
        lifecycleStatus: true,
        scanStatus: true,
      },
    });
    if (!uploadObj) {
      throw new HttpError(
        404,
        'Uploaded file metadata record not found; re-upload the attachment',
        'UPLOAD_OBJECT_NOT_FOUND'
      );
    }
    if (uploadObj.ownerId !== userId) {
      throw new HttpError(403, 'Upload belongs to another user', 'UPLOAD_FORBIDDEN');
    }
    if (uploadObj.purpose !== 'GENERAL') {
      throw new HttpError(
        403,
        'KYC-classified uploads cannot be attached to messages, orders, profiles, or listings',
        'KYC_DOCUMENT_REUSE_FORBIDDEN'
      );
    }
    if (uploadObj.lifecycleStatus !== 'ACTIVE') {
      throw new HttpError(
        409,
        'Replaced, orphaned, or deleted uploads cannot be attached',
        'UPLOAD_INACTIVE'
      );
    }
    if (BLOCKED_GENERAL_SCAN_STATUSES.has(uploadObj.scanStatus)) {
      throw new HttpError(
        423,
        'Quarantined or infected uploads cannot be attached',
        uploadObj.scanStatus === 'INFECTED' ? 'KYC_DOCUMENT_INFECTED' : 'KYC_DOCUMENT_QUARANTINED'
      );
    }
  }

  return {
    raw: reference,
    canonicalRef,
    isInternalUpload: true,
  };
}

/**
 * Enforces server-side upload classification and scan status before an upload reference
 * can be attached to messages, deliveries, profiles, onboarding, or public service listings,
 * and returns the canonical persisted reference (`upload:<ownerId>/<file>` or external URL).
 */
export async function assertUsableNonKycUpload(
  reference: string,
  userId: string,
  imageOnly?: boolean
): Promise<string>;
export async function assertUsableNonKycUpload(
  reference: string | undefined,
  userId: string,
  imageOnly?: boolean
): Promise<string | undefined>;
export async function assertUsableNonKycUpload(
  reference: string | undefined,
  userId: string,
  imageOnly = false
): Promise<string | undefined> {
  const verified = await authorizeAndCanonicalizeNonKycUpload(reference, userId, imageOnly);
  return verified?.canonicalRef;
}
