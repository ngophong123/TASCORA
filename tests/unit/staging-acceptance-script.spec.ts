import { describe, expect, it } from 'vitest';
import {
  evaluateAuthBoundary,
  evaluateCorsResponse,
  evaluateHealthResponse,
  runStagingAcceptanceChecks,
  validateStagingTargets,
  type FetchLike,
} from '../../scripts/verify-staging-acceptance';

describe('Phase 4A.8 staging acceptance harness', () => {
  it('blocks execution when STAGING_API_URL or STAGING_WEB_URL is missing', async () => {
    const report = await runStagingAcceptanceChecks({});
    expect(report.overallStatus).toBe('BLOCKED');
    expect(report.checks[0]?.status).toBe('BLOCKED');
    expect(report.checks[0]?.detail).toContain('STAGING_API_URL');
  });

  it('rejects non-HTTPS remote URLs, localhost without opt-in, and production hostnames', () => {
    expect(
      validateStagingTargets({
        apiUrl: 'http://api-staging.example.com',
        webUrl: 'https://web-staging.example.com',
      }).valid
    ).toBe(false);

    expect(
      validateStagingTargets({
        apiUrl: 'http://localhost:4000',
        webUrl: 'http://localhost:3200',
      }).valid
    ).toBe(false);

    expect(
      validateStagingTargets({
        apiUrl: 'https://api.tascora.com',
        webUrl: 'https://staging.tascora.dev',
      }).valid
    ).toBe(false);

    const valid = validateStagingTargets({
      apiUrl: 'https://tascora-api-staging.onrender.com/api',
      webUrl: 'https://tascora-web-staging.vercel.app/en',
    });
    expect(valid).toEqual({
      valid: true,
      apiOrigin: 'https://tascora-api-staging.onrender.com',
      webOrigin: 'https://tascora-web-staging.vercel.app',
    });
  });

  it('validates health payloads and catches secret leaks or unhealthy probes', () => {
    expect(
      evaluateHealthResponse('/health/live', 200, JSON.stringify({ status: 'ok' })).status
    ).toBe('PASS');

    expect(
      evaluateHealthResponse(
        '/health',
        200,
        JSON.stringify({ status: 'ok', checks: { database: 'ok', redis: 'ok' } })
      ).status
    ).toBe('PASS');

    expect(
      evaluateHealthResponse(
        '/health',
        200,
        JSON.stringify({ status: 'degraded', checks: { database: 'ok', redis: 'down' } })
      ).status
    ).toBe('FAIL');

    expect(
      evaluateHealthResponse('/health', 200, JSON.stringify({ secret: 'sk_test_123456' })).status
    ).toBe('FAIL');
  });

  it('validates CORS allow/deny and auth boundary checks', () => {
    expect(
      evaluateCorsResponse('https://staging.example.com', 'https://staging.example.com', 'true', false)
        .status
    ).toBe('PASS');
    expect(
      evaluateCorsResponse('https://untrusted.example', null, null, true).status
    ).toBe('PASS');
    expect(
      evaluateCorsResponse('https://untrusted.example', 'https://untrusted.example', 'true', true)
        .status
    ).toBe('FAIL');
    expect(evaluateAuthBoundary('auth', 'Auth', 401).status).toBe('PASS');
    expect(evaluateAuthBoundary('auth', 'Auth', 200).status).toBe('FAIL');
  });

  it('returns HOSTED_VERIFIED when all mocked HTTPS staging probes pass', async () => {
    const mockFetch: FetchLike = async (input, init) => {
      const url = String(input);
      const headersObj = (init?.headers ?? {}) as Record<string, string>;
      const reqOrigin = headersObj.Origin || headersObj.origin || null;
      const allowOrigin =
        reqOrigin === 'https://tascora-staging.vercel.app' ? reqOrigin : null;

      if (url.endsWith('/health/live')) {
        return {
          status: 200,
          ok: true,
          headers: {
            get: (k: string) => {
              const lower = k.toLowerCase();
              if (lower === 'access-control-allow-origin') return allowOrigin;
              if (lower === 'access-control-allow-credentials') return allowOrigin ? 'true' : null;
              return null;
            },
          },
          text: async () => JSON.stringify({ status: 'ok' }),
        };
      }
      if (url.endsWith('/health')) {
        return {
          status: 200,
          ok: true,
          headers: { get: () => null },
          text: async () =>
            JSON.stringify({ status: 'ok', checks: { database: 'ok', redis: 'ok' } }),
        };
      }
      if (url.includes('/api/v1/')) {
        return {
          status: 401,
          ok: false,
          headers: { get: () => null },
          text: async () => JSON.stringify({ success: false }),
        };
      }
      return {
        status: 200,
        ok: true,
        headers: { get: () => null },
        text: async () => '<html><body>TASCORA</body></html>',
      };
    };

    const report = await runStagingAcceptanceChecks(
      {
        apiUrl: 'https://tascora-api-staging.onrender.com',
        webUrl: 'https://tascora-staging.vercel.app',
      },
      mockFetch
    );

    expect(report.overallStatus).toBe('HOSTED_VERIFIED');
    expect(report.checks.every((c) => c.status === 'PASS')).toBe(true);
  });
});
