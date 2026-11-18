import crypto from 'node:crypto';
import { HttpError } from './errors';
import { isProduction, jwtAccessSecret } from './config';
import {
  parseLegacyHmacDisabledFlag,
  resolveKycHmacKeyring,
  resolveKycKeyring,
  validateKycHmacKeyConfig,
  validateKycKeyConfig,
} from './kyc-key';

const LEGACY_ENCRYPTION_VERSION = 'v1';
const ENVELOPE_VERSION = 'v2';
export const LEGACY_DOCUMENT_HMAC_VERSION = 'v1';
export const DOCUMENT_HMAC_ENVELOPE_VERSION = 'v2';

function deriveSubkeyFromMaterial(ikm: Buffer, purpose: string): Buffer {
  return Buffer.from(crypto.hkdfSync('sha256', ikm, Buffer.alloc(0), Buffer.from(purpose, 'utf8'), 32));
}

function decryptAesGcmWithKey(key: Buffer, ivHex: string, tagHex: string, dataHex: string): string {
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  if (iv.length !== 12 || tag.length !== 16) {
    throw new HttpError(500, 'Corrupted encrypted identity record');
  }
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]);
  return decrypted.toString('utf8');
}

export function encryptSensitiveField(plaintext: string): string {
  const keyring = resolveKycKeyring(process.env, isProduction, jwtAccessSecret);
  const key = deriveSubkeyFromMaterial(
    keyring.activeKey,
    `tascora:kyc:pii:aes-256-gcm:${ENVELOPE_VERSION}:${keyring.activeKeyId}`
  );
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${ENVELOPE_VERSION}:${keyring.activeKeyId}:${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function getEncryptedFieldKeyVersion(ciphertext: string | null | undefined): string | null {
  if (!ciphertext) return null;
  const parts = ciphertext.split(':');
  if (parts.length === 4 && parts[0] === LEGACY_ENCRYPTION_VERSION) {
    return LEGACY_ENCRYPTION_VERSION;
  }
  if (parts.length === 5 && parts[0] === ENVELOPE_VERSION && parts[1]) {
    return parts[1];
  }
  return null;
}

export function needsKeyRotation(ciphertext: string | null | undefined): boolean {
  if (!ciphertext) return false;
  const keyring = resolveKycKeyring(process.env, isProduction, jwtAccessSecret);
  const parts = ciphertext.split(':');
  if (parts.length === 4 && parts[0] === LEGACY_ENCRYPTION_VERSION) {
    return true;
  }
  if (parts.length === 5 && parts[0] === ENVELOPE_VERSION) {
    return parts[1] !== keyring.activeKeyId;
  }
  return false;
}

export function decryptSensitiveField(ciphertext: string | null | undefined): string | null {
  if (!ciphertext) return null;
  const keyring = resolveKycKeyring(process.env, isProduction, jwtAccessSecret);
  const parts = ciphertext.split(':');

  // Versioned envelope with explicit keyId (`v2:<keyId>:<iv>:<tag>:<cipher>`).
  if (parts.length === 5 && parts[0] === ENVELOPE_VERSION) {
    const [, keyId, ivHex, tagHex, dataHex] = parts;
    const ikm =
      keyId === keyring.activeKeyId ? keyring.activeKey : keyring.previousKeys.get(keyId!);
    if (!ikm || !ivHex || !tagHex || !dataHex) {
      throw new HttpError(500, 'Corrupted or unknown encryption key version for identity record');
    }
    const key = deriveSubkeyFromMaterial(
      ikm,
      `tascora:kyc:pii:aes-256-gcm:${ENVELOPE_VERSION}:${keyId}`
    );
    return decryptAesGcmWithKey(key, ivHex, tagHex, dataHex);
  }

  // Backward compatibility for Milestone 4A.5 `v1:<iv>:<tag>:<cipher>` rows.
  if (parts.length === 4 && parts[0] === LEGACY_ENCRYPTION_VERSION) {
    const [, ivHex, tagHex, dataHex] = parts;
    if (!ivHex || !tagHex || !dataHex) {
      throw new HttpError(500, 'Corrupted encrypted identity record');
    }
    const candidates: Buffer[] = [];
    const explicitV1 = keyring.previousKeys.get(LEGACY_ENCRYPTION_VERSION);
    if (explicitV1) candidates.push(explicitV1);
    candidates.push(keyring.activeKey);
    for (const [id, buf] of keyring.previousKeys.entries()) {
      if (id !== LEGACY_ENCRYPTION_VERSION) candidates.push(buf);
    }

    for (const ikm of candidates) {
      try {
        const key = deriveSubkeyFromMaterial(ikm, 'tascora:kyc:pii:aes-256-gcm:v1');
        return decryptAesGcmWithKey(key, ivHex, tagHex, dataHex);
      } catch {
        // Try next key in configured keyring until GCM tag verifies.
      }
    }
    throw new HttpError(500, 'Corrupted encrypted identity record');
  }

  throw new HttpError(500, 'Corrupted encrypted identity record');
}

export function reencryptSensitiveField(ciphertext: string | null | undefined): string | null {
  const plaintext = decryptSensitiveField(ciphertext);
  if (plaintext === null) return null;
  return encryptSensitiveField(plaintext);
}

export function normalizeDocumentNumberForHmac(documentNumber: string): string {
  return documentNumber.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function getCurrentDocumentHmacVersion(): string {
  const hmacKeyring = resolveKycHmacKeyring(process.env, isProduction, jwtAccessSecret);
  return `${DOCUMENT_HMAC_ENVELOPE_VERSION}:${hmacKeyring.activeKeyId}`;
}

export function hmacDocumentNumberWithVersion(documentNumber: string): {
  hash: string;
  version: string;
} {
  const normalized = normalizeDocumentNumberForHmac(documentNumber);
  const hmacKeyring = resolveKycHmacKeyring(process.env, isProduction, jwtAccessSecret);
  const version = `${DOCUMENT_HMAC_ENVELOPE_VERSION}:${hmacKeyring.activeKeyId}`;
  const key = deriveSubkeyFromMaterial(
    hmacKeyring.activeKey,
    `tascora:kyc:doc-hmac:${DOCUMENT_HMAC_ENVELOPE_VERSION}:${hmacKeyring.activeKeyId}`
  );
  const hash = crypto.createHmac('sha256', key).update(normalized, 'utf8').digest('hex');
  return { hash, version };
}

export function hmacDocumentNumber(documentNumber: string): string {
  return hmacDocumentNumberWithVersion(documentNumber).hash;
}

/**
 * Computes legacy encryption-key-derived blind index HMAC for pre-separation rows (`v1`).
 * Used only during migration/duplicate transition lookup unless KYC_DISABLE_LEGACY_HMAC=true.
 */
export function hmacDocumentNumberLegacyV1(documentNumber: string, encryptionKeyIkm?: Buffer): string {
  const normalized = normalizeDocumentNumberForHmac(documentNumber);
  const ikm =
    encryptionKeyIkm ?? resolveKycKeyring(process.env, isProduction, jwtAccessSecret).activeKey;
  const key = deriveSubkeyFromMaterial(ikm, 'tascora:kyc:doc-hmac:v1');
  return crypto.createHmac('sha256', key).update(normalized, 'utf8').digest('hex');
}

export interface DocumentNumberFingerprintEntry {
  hmacVersion: string;
  hash: string;
}

export interface ExpectedDocumentHmacVersions {
  targetVersion: string;
  historicalVersions: string[];
  expectedVersions: string[];
}

export function getExpectedDocumentHmacVersions(): ExpectedDocumentHmacVersions {
  validateKycKeyConfig(process.env, isProduction);
  validateKycHmacKeyConfig(process.env, isProduction);
  const hmacKeyring = resolveKycHmacKeyring(process.env, isProduction, jwtAccessSecret);
  const targetVersion = `${DOCUMENT_HMAC_ENVELOPE_VERSION}:${hmacKeyring.activeKeyId}`;
  const historicalVersions = [...hmacKeyring.previousKeys.keys()].map(
    id => `${DOCUMENT_HMAC_ENVELOPE_VERSION}:${id}`
  );
  return {
    targetVersion,
    historicalVersions,
    expectedVersions: [targetVersion, ...historicalVersions],
  };
}

export function checkEncryptedFieldKeyAvailability(
  ciphertext: string | null | undefined
): { available: boolean; versionLabel: string | null } {
  if (!ciphertext) {
    return { available: true, versionLabel: null };
  }
  const keyring = resolveKycKeyring(process.env, isProduction, jwtAccessSecret);
  const parts = ciphertext.split(':');
  if (parts.length === 5 && parts[0] === ENVELOPE_VERSION) {
    const keyId = parts[1]?.trim();
    if (!keyId || !parts[2] || !parts[3] || !parts[4]) {
      return { available: false, versionLabel: 'enc:malformed' };
    }
    const available = keyId === keyring.activeKeyId || keyring.previousKeys.has(keyId);
    return {
      available,
      versionLabel: `enc:${ENVELOPE_VERSION}:${keyId}`,
    };
  }
  if (parts.length === 4 && parts[0] === LEGACY_ENCRYPTION_VERSION) {
    if (!parts[1] || !parts[2] || !parts[3]) {
      return { available: false, versionLabel: 'enc:malformed' };
    }
    return { available: true, versionLabel: `enc:${LEGACY_ENCRYPTION_VERSION}` };
  }
  return { available: false, versionLabel: 'enc:malformed' };
}

export function isLegacyHmacDisabled(): boolean {
  return parseLegacyHmacDisabledFlag(process.env.KYC_DISABLE_LEGACY_HMAC);
}

/**
 * Returns every active, rotated, and (while permitted) legacy document blind-index
 * version/digest pair used both for duplicate checks and cross-version index storage.
 */
export function computeDocumentNumberFingerprintEntries(
  documentNumber: string
): DocumentNumberFingerprintEntry[] {
  const normalized = normalizeDocumentNumberForHmac(documentNumber);
  const seenHashes = new Set<string>();
  const entries: DocumentNumberFingerprintEntry[] = [];

  const pushEntry = (hmacVersion: string, hash: string) => {
    if (!seenHashes.has(hash)) {
      seenHashes.add(hash);
      entries.push({ hmacVersion, hash });
    }
  };

  const hmacKeyring = resolveKycHmacKeyring(process.env, isProduction, jwtAccessSecret);
  const activeKey = deriveSubkeyFromMaterial(
    hmacKeyring.activeKey,
    `tascora:kyc:doc-hmac:${DOCUMENT_HMAC_ENVELOPE_VERSION}:${hmacKeyring.activeKeyId}`
  );
  pushEntry(
    `${DOCUMENT_HMAC_ENVELOPE_VERSION}:${hmacKeyring.activeKeyId}`,
    crypto.createHmac('sha256', activeKey).update(normalized, 'utf8').digest('hex')
  );

  for (const [prevId, prevIkm] of hmacKeyring.previousKeys.entries()) {
    const prevKey = deriveSubkeyFromMaterial(
      prevIkm,
      `tascora:kyc:doc-hmac:${DOCUMENT_HMAC_ENVELOPE_VERSION}:${prevId}`
    );
    pushEntry(
      `${DOCUMENT_HMAC_ENVELOPE_VERSION}:${prevId}`,
      crypto.createHmac('sha256', prevKey).update(normalized, 'utf8').digest('hex')
    );
  }

  if (!isLegacyHmacDisabled()) {
    const encKeyring = resolveKycKeyring(process.env, isProduction, jwtAccessSecret);
    pushEntry(LEGACY_DOCUMENT_HMAC_VERSION, hmacDocumentNumberLegacyV1(normalized, encKeyring.activeKey));
    for (const [prevEncId, prevEncIkm] of encKeyring.previousKeys.entries()) {
      pushEntry(
        `${LEGACY_DOCUMENT_HMAC_VERSION}:enc:${prevEncId}`,
        hmacDocumentNumberLegacyV1(normalized, prevEncIkm)
      );
    }
  }

  return entries;
}

/**
 * Returns all candidate document number blind-index digests across the active dedicated
 * HMAC key, any rotated previous HMAC keys, and (during migration) legacy `v1` keys.
 */
export function computeAllDocumentNumberLookupHashes(documentNumber: string): string[] {
  return computeDocumentNumberFingerprintEntries(documentNumber).map(entry => entry.hash);
}

export function maskDocumentNumber(documentNumber: string | null | undefined): string | null {
  if (!documentNumber) return null;
  const cleaned = documentNumber.trim();
  if (cleaned.length <= 4) return '••••';
  return `${'•'.repeat(Math.min(8, cleaned.length - 4))}${cleaned.slice(-4)}`;
}

export function maskDateOfBirth(dob: string | null | undefined): string | null {
  if (!dob) return null;
  const match = /^(\d{4})-\d{2}-\d{2}$/.exec(dob.trim());
  if (!match) return '****-**-**';
  return `${match[1]}-**-**`;
}

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'resettoken',
  'refreshtoken',
  'accesstoken',
  'documentnumber',
  'documentnumberencrypted',
  'documentnumberhash',
  'dateofbirth',
  'dateofbirthencrypted',
  'dob',
  'secret',
  'authorization',
  'cookie',
  'body',
  'filebuffer',
]);

export function sanitizeAuditMetadata(input: unknown, depth = 0): unknown {
  if (input === null || input === undefined) return undefined;
  if (depth > 4) return '[TRUNCATED]';
  if (typeof input === 'string') return input.slice(0, 500);
  if (typeof input === 'number' || typeof input === 'boolean') return input;
  if (input instanceof Date) return input.toISOString();
  if (Array.isArray(input)) {
    return input.slice(0, 20).map(item => sanitizeAuditMetadata(item, depth + 1));
  }
  if (typeof input === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase().replace(/[^a-z0-9]/g, ''))) {
        out[key] = '[REDACTED]';
      } else {
        const sanitized = sanitizeAuditMetadata(value, depth + 1);
        if (sanitized !== undefined) out[key] = sanitized;
      }
    }
    return out;
  }
  return '[UNSUPPORTED]';
}
