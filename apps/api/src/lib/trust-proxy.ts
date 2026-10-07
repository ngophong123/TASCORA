export function parseTrustProxy(value: string | undefined): boolean | number {
  const normalized = value?.trim();
  if (!normalized || normalized === 'false') return false;
  if (normalized === 'true') return true;
  if (/^(0|[1-9]\d*)$/.test(normalized)) {
    const hops = Number(normalized);
    if (Number.isSafeInteger(hops)) return hops;
  }
  throw new Error('TRUST_PROXY must be true, false, or a non-negative safe integer hop count');
}
