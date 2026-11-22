import { pathToFileURL } from 'node:url';

export interface StagingTargetConfig {
  apiUrl: string;
  webUrl: string;
  allowLocalhost?: boolean;
}

export type AcceptanceCheckStatus = 'PASS' | 'FAIL' | 'BLOCKED' | 'SKIPPED';

export interface AcceptanceCheckResult {
  id: string;
  name: string;
  status: AcceptanceCheckStatus;
  httpStatus?: number;
  detail: string;
}

export interface StagingAcceptanceReport {
  overallStatus: 'HOSTED_VERIFIED' | 'FAILED' | 'BLOCKED';
  executedAt: string;
  apiOrigin: string | null;
  webOrigin: string | null;
  checks: AcceptanceCheckResult[];
}

export type FetchLike = (
  input: string | URL,
  init?: RequestInit
) => Promise<{
  status: number;
  ok: boolean;
  headers: { get(name: string): string | null };
  text(): Promise<string>;
}>;

const DISALLOWED_PRODUCTION_HOSTS = [
  /^tascora\.com$/i,
  /^www\.tascora\.com$/i,
  /^api\.tascora\.com$/i,
  /^app\.tascora\.com$/i,
  /(^|\.)prod\./i,
  /(^|\.)production\./i,
];

function isLocalhost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

export function validateStagingTargets(
  config: Partial<StagingTargetConfig>
): { valid: true; apiOrigin: string; webOrigin: string } | { valid: false; reason: string } {
  const rawApi = (config.apiUrl || '').trim();
  const rawWeb = (config.webUrl || '').trim();

  if (!rawApi || !rawWeb) {
    return {
      valid: false,
      reason:
        'Missing required staging targets: both STAGING_API_URL and STAGING_WEB_URL must be provided.',
    };
  }

  let apiUrl: URL;
  let webUrl: URL;
  try {
    apiUrl = new URL(rawApi);
    webUrl = new URL(rawWeb);
  } catch {
    return { valid: false, reason: 'STAGING_API_URL and STAGING_WEB_URL must be valid URLs.' };
  }

  for (const [label, parsed] of [
    ['STAGING_API_URL', apiUrl],
    ['STAGING_WEB_URL', webUrl],
  ] as const) {
    const local = isLocalhost(parsed.hostname);
    if (local && !config.allowLocalhost) {
      return {
        valid: false,
        reason: `${label} points to localhost; hosted staging acceptance requires deployed HTTPS URLs.`,
      };
    }
    if (!local && parsed.protocol !== 'https:') {
      return {
        valid: false,
        reason: `${label} must use https:// for hosted staging verification.`,
      };
    }
    if (DISALLOWED_PRODUCTION_HOSTS.some((re) => re.test(parsed.hostname))) {
      return {
        valid: false,
        reason: `${label} matches a disallowed production hostname (${parsed.hostname}). Refusing to target production.`,
      };
    }
  }

  return { valid: true, apiOrigin: apiUrl.origin, webOrigin: webUrl.origin };
}

export function evaluateHealthResponse(
  endpoint: '/health/live' | '/health',
  status: number,
  bodyText: string
): AcceptanceCheckResult {
  const id = endpoint === '/health/live' ? 'health-live' : 'health-ready';
  const name = endpoint === '/health/live' ? 'API Liveness (/health/live)' : 'API Readiness (/health)';

  if (status !== 200) {
    return { id, name, status: 'FAIL', httpStatus: status, detail: `Expected HTTP 200, received ${status}.` };
  }

  const secretLeakPattern = /(sk_live_|sk_test_|whsec_|postgresql:\/\/|rediss?:\/\/.*@|KYC_ENCRYPTION_KEY)/i;
  if (secretLeakPattern.test(bodyText)) {
    return {
      id,
      name,
      status: 'FAIL',
      httpStatus: status,
      detail: 'Health payload appears to expose sensitive configuration values.',
    };
  }

  try {
    const rawParsed: unknown = JSON.parse(bodyText);
    if (!rawParsed || typeof rawParsed !== 'object' || Array.isArray(rawParsed)) {
      return {
        id,
        name,
        status: 'FAIL',
        httpStatus: status,
        detail: `${endpoint} returned non-object JSON payload.`,
      };
    }

    const parsed = rawParsed as Record<string, unknown>;
    if (parsed.status !== 'ok') {
      return {
        id,
        name,
        status: 'FAIL',
        httpStatus: status,
        detail: `${endpoint} expected status="ok", received status=${JSON.stringify(parsed.status)}.`,
      };
    }

    if (endpoint === '/health') {
      const dbOk = parsed.db === 'ok';
      const redisOk = parsed.redis === 'ok';
      if (!dbOk || !redisOk) {
        return {
          id,
          name,
          status: 'FAIL',
          httpStatus: status,
          detail: `Expected db="ok" and redis="ok" on /health; received db=${JSON.stringify(parsed.db)}, redis=${JSON.stringify(parsed.redis)}.`,
        };
      }
    }
    return { id, name, status: 'PASS', httpStatus: status, detail: `${endpoint} returned HTTP 200 with clean payload.` };
  } catch {
    return {
      id,
      name,
      status: 'FAIL',
      httpStatus: status,
      detail: `${endpoint} did not return valid JSON.`,
    };
  }
}

export function evaluateCorsResponse(
  expectedOrigin: string,
  allowedHeader: string | null,
  credentialsHeader: string | null,
  isNegativeProbe: boolean
): AcceptanceCheckResult {
  if (isNegativeProbe) {
    const rejected = !allowedHeader || allowedHeader !== expectedOrigin;
    return {
      id: 'cors-reject-untrusted',
      name: 'CORS Rejects Untrusted Origin',
      status: rejected ? 'PASS' : 'FAIL',
      detail: rejected
        ? 'Untrusted origin was not echoed in Access-Control-Allow-Origin.'
        : `Untrusted origin was reflected: ${allowedHeader}`,
    };
  }

  const ok = allowedHeader === expectedOrigin && credentialsHeader === 'true';
  return {
    id: 'cors-allow-web',
    name: 'CORS Allows Staging Web Origin with Credentials',
    status: ok ? 'PASS' : 'FAIL',
    detail: ok
      ? `Access-Control-Allow-Origin=${allowedHeader}, Allow-Credentials=true.`
      : `Unexpected CORS headers (origin=${String(allowedHeader)}, credentials=${String(credentialsHeader)}).`,
  };
}

export function evaluateAuthBoundary(
  id: string,
  name: string,
  status: number
): AcceptanceCheckResult {
  const blocked = status === 401 || status === 403;
  return {
    id,
    name,
    status: blocked ? 'PASS' : 'FAIL',
    httpStatus: status,
    detail: blocked
      ? `Unauthenticated request properly rejected with HTTP ${status}.`
      : `Expected HTTP 401 or 403 for protected route, received ${status}.`,
  };
}

export async function runStagingAcceptanceChecks(
  config: Partial<StagingTargetConfig>,
  fetchImpl: FetchLike = fetch as unknown as FetchLike
): Promise<StagingAcceptanceReport> {
  const executedAt = new Date().toISOString();
  const validation = validateStagingTargets(config);

  if (!validation.valid) {
    return {
      overallStatus: 'BLOCKED',
      executedAt,
      apiOrigin: null,
      webOrigin: null,
      checks: [
        {
          id: 'staging-targets',
          name: 'Staging Target Configuration',
          status: 'BLOCKED',
          detail: validation.reason,
        },
      ],
    };
  }

  const { apiOrigin, webOrigin } = validation;
  const checks: AcceptanceCheckResult[] = [];

  const safeFetch = async (url: string, init?: RequestInit) => {
    try {
      return await fetchImpl(url, init);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Network error';
      return {
        status: 0,
        ok: false,
        headers: { get: () => null },
        text: async () => msg,
      };
    }
  };

  // 1. /health/live
  const liveRes = await safeFetch(`${apiOrigin}/health/live`);
  checks.push(evaluateHealthResponse('/health/live', liveRes.status, await liveRes.text()));

  // 2. /health
  const readyRes = await safeFetch(`${apiOrigin}/health`);
  checks.push(evaluateHealthResponse('/health', readyRes.status, await readyRes.text()));

  // 3. CORS allow staging web origin
  const corsAllowRes = await safeFetch(`${apiOrigin}/health/live`, {
    method: 'GET',
    headers: { Origin: webOrigin },
  });
  checks.push(
    evaluateCorsResponse(
      webOrigin,
      corsAllowRes.headers.get('access-control-allow-origin'),
      corsAllowRes.headers.get('access-control-allow-credentials'),
      false
    )
  );

  // 4. CORS reject untrusted origin
  const untrustedOrigin = 'https://untrusted-origin.example';
  const corsDenyRes = await safeFetch(`${apiOrigin}/health/live`, {
    method: 'GET',
    headers: { Origin: untrustedOrigin },
  });
  checks.push(
    evaluateCorsResponse(
      untrustedOrigin,
      corsDenyRes.headers.get('access-control-allow-origin'),
      corsDenyRes.headers.get('access-control-allow-credentials'),
      true
    )
  );

  // 5. Protected session, admin, and private KYC upload routes reject anonymous callers
  const sessionsRes = await safeFetch(`${apiOrigin}/api/v1/sessions`);
  checks.push(
    evaluateAuthBoundary(
      'sessions-auth-boundary',
      'Unauthenticated /api/v1/sessions Rejected',
      sessionsRes.status
    )
  );

  const adminRes = await safeFetch(`${apiOrigin}/api/v1/admin/users`);
  checks.push(
    evaluateAuthBoundary('admin-route-boundary', 'Unauthenticated Admin Endpoint Rejected', adminRes.status)
  );

  const kycUploadRes = await safeFetch(
    `${apiOrigin}/api/v1/uploads/kyc/nonexistent-owner/nonexistent-file`
  );
  checks.push(
    evaluateAuthBoundary(
      'private-kyc-boundary',
      'Unauthenticated Private KYC Download Rejected',
      kycUploadRes.status
    )
  );

  // 6. Web storefront reachable
  const webRes = await safeFetch(`${webOrigin}/en`);
  checks.push({
    id: 'web-home-en',
    name: 'Staging Web Home (/en) Reachable',
    status: webRes.status === 200 ? 'PASS' : 'FAIL',
    httpStatus: webRes.status,
    detail:
      webRes.status === 200
        ? 'Staging web storefront responded with HTTP 200.'
        : `Expected HTTP 200 from ${webOrigin}/en, received ${webRes.status}.`,
  });

  const anyFailed = checks.some((c) => c.status === 'FAIL');
  const isLocal = isLocalhost(new URL(apiOrigin).hostname) || isLocalhost(new URL(webOrigin).hostname);

  return {
    overallStatus: anyFailed ? 'FAILED' : isLocal ? 'BLOCKED' : 'HOSTED_VERIFIED',
    executedAt,
    apiOrigin,
    webOrigin,
    checks,
  };
}

async function main() {
  const report = await runStagingAcceptanceChecks({
    apiUrl: process.env.STAGING_API_URL,
    webUrl: process.env.STAGING_WEB_URL,
    allowLocalhost: process.env.ALLOW_LOCALHOST_DRY_RUN === 'true',
  });

  console.log(JSON.stringify(report, null, 2));
  if (report.overallStatus !== 'HOSTED_VERIFIED') {
    process.exitCode = report.overallStatus === 'BLOCKED' ? 2 : 1;
  }
}

const isEntrypoint =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isEntrypoint) {
  void main();
}
