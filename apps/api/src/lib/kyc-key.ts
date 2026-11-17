import crypto from 'node:crypto';
import { HttpError } from './errors';

export const DEFAULT_KYC_KEY_ID = 'k1';
export const DEFAULT_KYC_HMAC_KEY_ID = 'h1';
const KEY_ID_REGEX = /^[a-z0-9][a-z0-9_-]{0,15}$/;
const HEX_64_REGEX = /^[0-9a-f]{64}$/i;
const PLACEHOLDER_PREFIX_REGEX = /^(secret|password|changeme|placeholder|default|tascora|kyc[-_]?key|example)/i;

export interface KycKeyring {
  activeKeyId: string;
  activeKey: Buffer;
  previousKeys: Map<string, Buffer>;
}

export type KycHmacKeyring = KycKeyring;

export function validateKycKeyId(rawKeyId: string | undefined, varName = 'KYC_ENCRYPTION_KEY_ID'): string {
  const defaultId = varName.includes('HMAC') ? DEFAULT_KYC_HMAC_KEY_ID : DEFAULT_KYC_KEY_ID;
  const keyId = (rawKeyId ?? defaultId).trim();
  if (!KEY_ID_REGEX.test(keyId)) {
    throw new Error(`${varName} must match ^[a-z0-9][a-z0-9_-]{0,15}$`);
  }
  return keyId;
}

export function parseKycKeyMaterial(rawSecret: string, varName = 'KYC_ENCRYPTION_KEY'): Buffer {
  const trimmed = rawSecret.trim();
  if (!trimmed) {
    throw new Error(`${varName} must not be empty`);
  }

  if (HEX_64_REGEX.test(trimmed)) {
    const keyBuf = Buffer.from(trimmed, 'hex');
    if (new Set(keyBuf).size < 12) {
      throw new Error(`${varName} hex key has insufficient byte diversity`);
    }
    return keyBuf;
  }

  if (trimmed.length < 32) {
    throw new Error(
      `${varName} must be 64 hex characters (256-bit) or a high-entropy passphrase of at least 32 characters`
    );
  }
  if (PLACEHOLDER_PREFIX_REGEX.test(trimmed)) {
    throw new Error(`${varName} must not start with a predictable placeholder or dictionary token`);
  }
  if (/(.)\1{11,}/.test(trimmed)) {
    throw new Error(`${varName} must not contain repeated character runs`);
  }
  if (new Set(trimmed).size < 10) {
    throw new Error(`${varName} must contain at least 10 distinct characters for sufficient entropy`);
  }

  return crypto.createHash('sha256').update(trimmed, 'utf8').digest();
}

export function parsePreviousKycKeys(
  rawPrevious: string | undefined,
  activeKeyId: string,
  envPrefix: 'KYC_ENCRYPTION' | 'KYC_DOCUMENT_HMAC' = 'KYC_ENCRYPTION'
): Map<string, Buffer> {
  const varName = `${envPrefix}_PREVIOUS_KEYS`;
  const activeIdVarName = `${envPrefix}_KEY_ID`;
  const previous = new Map<string, Buffer>();
  const trimmed = rawPrevious?.trim();
  if (!trimmed) {
    return previous;
  }

  if (trimmed.startsWith('{')) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      throw new Error(`${varName} JSON is malformed`);
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error(`${varName} JSON must be an object mapping keyId to key`);
    }
    for (const [rawId, rawSecret] of Object.entries(parsed as Record<string, unknown>)) {
      const id = validateKycKeyId(rawId, varName);
      if (id === activeKeyId) {
        throw new Error(`${varName} keyId "${id}" conflicts with active ${activeIdVarName}`);
      }
      if (typeof rawSecret !== 'string') {
        throw new Error(`${varName} entry "${id}" must be a string secret`);
      }
      previous.set(id, parseKycKeyMaterial(rawSecret, `${varName}[${id}]`));
    }
    return previous;
  }

  const entries = trimmed.split(',').map(item => item.trim()).filter(Boolean);
  for (const entry of entries) {
    const eqIndex = entry.indexOf('=');
    if (eqIndex <= 0 || eqIndex === entry.length - 1) {
      throw new Error(`${varName} entries must follow keyId=secret syntax`);
    }
    const id = validateKycKeyId(entry.slice(0, eqIndex), varName);
    if (id === activeKeyId) {
      throw new Error(`${varName} keyId "${id}" conflicts with active ${activeIdVarName}`);
    }
    if (previous.has(id)) {
      throw new Error(`Duplicate keyId "${id}" in ${varName}`);
    }
    const secret = entry.slice(eqIndex + 1);
    previous.set(id, parseKycKeyMaterial(secret, `${varName}[${id}]`));
  }

  return previous;
}

export function validateKycKeyConfig(env: NodeJS.ProcessEnv, isProd: boolean): string {
  const activeKeyId = validateKycKeyId(env.KYC_ENCRYPTION_KEY_ID, 'KYC_ENCRYPTION_KEY_ID');
  const rawActive = env.KYC_ENCRYPTION_KEY?.trim();
  const rawPrevious = env.KYC_ENCRYPTION_PREVIOUS_KEYS?.trim();

  if (rawActive) {
    parseKycKeyMaterial(rawActive, 'KYC_ENCRYPTION_KEY');
    parsePreviousKycKeys(rawPrevious, activeKeyId, 'KYC_ENCRYPTION');
  } else if (rawPrevious) {
    throw new Error('KYC_ENCRYPTION_PREVIOUS_KEYS requires KYC_ENCRYPTION_KEY to be configured');
  } else if (isProd) {
    throw new Error('Missing production configuration: KYC_ENCRYPTION_KEY');
  }

  return activeKeyId;
}

export function parseLegacyHmacDisabledFlag(rawValue: string | undefined): boolean {
  const normalized = rawValue?.trim().toLowerCase();
  if (!normalized || normalized === 'false') return false;
  if (normalized === 'true') return true;
  throw new Error('KYC_DISABLE_LEGACY_HMAC must be "true" or "false" when set');
}

export function validateKycHmacKeyConfig(env: NodeJS.ProcessEnv, isProd: boolean): string {
  const activeKeyId = validateKycKeyId(env.KYC_DOCUMENT_HMAC_KEY_ID, 'KYC_DOCUMENT_HMAC_KEY_ID');
  const rawActive = env.KYC_DOCUMENT_HMAC_KEY?.trim();
  const rawPrevious = env.KYC_DOCUMENT_HMAC_PREVIOUS_KEYS?.trim();
  const legacyDisabled = parseLegacyHmacDisabledFlag(env.KYC_DISABLE_LEGACY_HMAC);

  if (rawActive) {
    const hmacKey = parseKycKeyMaterial(rawActive, 'KYC_DOCUMENT_HMAC_KEY');
    const rawEnc = env.KYC_ENCRYPTION_KEY?.trim();
    if (rawEnc) {
      const encKey = parseKycKeyMaterial(rawEnc, 'KYC_ENCRYPTION_KEY');
      if (hmacKey.equals(encKey)) {
        throw new Error('KYC_DOCUMENT_HMAC_KEY must be cryptographically separate from KYC_ENCRYPTION_KEY');
      }
    }
    parsePreviousKycKeys(rawPrevious, activeKeyId, 'KYC_DOCUMENT_HMAC');
  } else if (rawPrevious) {
    throw new Error('KYC_DOCUMENT_HMAC_PREVIOUS_KEYS requires KYC_DOCUMENT_HMAC_KEY to be configured');
  } else if (isProd) {
    throw new Error('Missing production configuration: KYC_DOCUMENT_HMAC_KEY');
  } else if (legacyDisabled) {
    throw new Error('KYC_DISABLE_LEGACY_HMAC=true requires an explicit KYC_DOCUMENT_HMAC_KEY configuration');
  }

  return activeKeyId;
}

export function resolveKycKeyring(
  env: NodeJS.ProcessEnv,
  isProd: boolean,
  devFallbackSeed: string
): KycKeyring {
  const activeKeyId = validateKycKeyId(env.KYC_ENCRYPTION_KEY_ID, 'KYC_ENCRYPTION_KEY_ID');
  const rawActive = env.KYC_ENCRYPTION_KEY?.trim();
  if (rawActive) {
    const activeKey = parseKycKeyMaterial(rawActive, 'KYC_ENCRYPTION_KEY');
    const previousKeys = parsePreviousKycKeys(env.KYC_ENCRYPTION_PREVIOUS_KEYS, activeKeyId, 'KYC_ENCRYPTION');
    return { activeKeyId, activeKey, previousKeys };
  }

  if (isProd) {
    throw new HttpError(503, 'KYC encryption key is not configured', 'KYC_ENCRYPTION_UNCONFIGURED');
  }

  return {
    activeKeyId,
    activeKey: crypto.createHash('sha256').update(`dev-only:${devFallbackSeed}`, 'utf8').digest(),
    previousKeys: parsePreviousKycKeys(undefined, activeKeyId, 'KYC_ENCRYPTION'),
  };
}

export function resolveKycHmacKeyring(
  env: NodeJS.ProcessEnv,
  isProd: boolean,
  devFallbackSeed: string
): KycHmacKeyring {
  const activeKeyId = validateKycKeyId(env.KYC_DOCUMENT_HMAC_KEY_ID, 'KYC_DOCUMENT_HMAC_KEY_ID');
  const rawActive = env.KYC_DOCUMENT_HMAC_KEY?.trim();
  if (rawActive) {
    const activeKey = parseKycKeyMaterial(rawActive, 'KYC_DOCUMENT_HMAC_KEY');
    const rawEnc = env.KYC_ENCRYPTION_KEY?.trim();
    if (rawEnc) {
      const encKey = parseKycKeyMaterial(rawEnc, 'KYC_ENCRYPTION_KEY');
      if (activeKey.equals(encKey)) {
        throw new HttpError(
          500,
          'KYC_DOCUMENT_HMAC_KEY must be distinct from KYC_ENCRYPTION_KEY',
          'KYC_HMAC_KEY_SEPARATION_ERROR'
        );
      }
    }
    const previousKeys = parsePreviousKycKeys(
      env.KYC_DOCUMENT_HMAC_PREVIOUS_KEYS,
      activeKeyId,
      'KYC_DOCUMENT_HMAC'
    );
    return { activeKeyId, activeKey, previousKeys };
  }

  if (isProd) {
    throw new HttpError(503, 'KYC document HMAC key is not configured', 'KYC_HMAC_UNCONFIGURED');
  }

  return {
    activeKeyId,
    activeKey: crypto.createHash('sha256').update(`dev-only-doc-hmac:${devFallbackSeed}`, 'utf8').digest(),
    previousKeys: parsePreviousKycKeys(undefined, activeKeyId, 'KYC_DOCUMENT_HMAC'),
  };
}
