import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { healthRouter } from '../../apps/api/src/lib/health';
import sessionRoutes from '../../apps/api/src/modules/session/session.route';
import { uploadRouter } from '../../apps/api/src/modules/upload/upload.route';
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

  it('validates the exact healthRouter JSON contract and fails closed on unhealthy, missing, legacy, or leaky payloads', async () => {
    const healthyApp = express();
    healthyApp.use(
      healthRouter({
        database: async () => [{ '?column?': 1 }],
        redis: async () => 'PONG',
      })
    );

    const liveRes = await request(healthyApp).get('/health/live');
    expect(
      evaluateHealthResponse('/health/live', liveRes.status, liveRes.text).status
    ).toBe('PASS');

    const readyRes = await request(healthyApp).get('/health');
    expect(readyRes.status).toBe(200);
    expect(readyRes.body).toMatchObject({ status: 'ok', db: 'ok', redis: 'ok' });
    expect(
      evaluateHealthResponse('/health', readyRes.status, readyRes.text).status
    ).toBe('PASS');

    // Unhealthy dependency from real healthRouter (503) must fail closed
    const unhealthyApp = express();
    unhealthyApp.use(
      healthRouter({
        database: async () => [{ '?column?': 1 }],
        redis: async () => {
          throw new Error('ECONNREFUSED');
        },
      })
    );
    const failedRes = await request(unhealthyApp).get('/health');
    expect(failedRes.status).toBe(503);
    expect(
      evaluateHealthResponse('/health', failedRes.status, failedRes.text).status
    ).toBe('FAIL');

    // Regression: legacy/wrong nested checks shape must fail closed
    expect(
      evaluateHealthResponse(
        '/health',
        200,
        JSON.stringify({ status: 'ok', checks: { database: 'ok', redis: 'ok' } })
      ).status
    ).toBe('FAIL');

    // Missing or non-"ok" db/redis fields must fail closed
    expect(
      evaluateHealthResponse('/health', 200, JSON.stringify({ status: 'ok', db: 'ok' })).status
    ).toBe('FAIL');
    expect(
      evaluateHealthResponse('/health', 200, JSON.stringify({ status: 'ok', redis: 'ok' })).status
    ).toBe('FAIL');
    expect(
      evaluateHealthResponse(
        '/health',
        200,
        JSON.stringify({ status: 'ok', db: 'ok', redis: 'down', payments: {} })
      ).status
    ).toBe('FAIL');
    expect(
      evaluateHealthResponse('/health', 200, JSON.stringify({ status: 'error', db: 'ok', redis: 'ok' })).status
    ).toBe('FAIL');
    expect(evaluateHealthResponse('/health', 200, 'not-json').status).toBe('FAIL');

    // Secret leak detection remains enforced
    expect(
      evaluateHealthResponse(
        '/health',
        200,
        JSON.stringify({ status: 'ok', db: 'ok', redis: 'ok', secret: 'sk_test_123456' })
      ).status
    ).toBe('FAIL');
  });

  it('verifies the real Express session and KYC upload routes reject unauthenticated access with 401/403', async () => {
    const app = express();
    app.use('/api/v1/sessions', sessionRoutes);
    app.use('/api/v1/uploads', uploadRouter());

    const sessionsRes = await request(app).get('/api/v1/sessions');
    expect([401, 403]).toContain(sessionsRes.status);
    expect(
      evaluateAuthBoundary('sessions-auth-boundary', 'Unauthenticated /api/v1/sessions Rejected', sessionsRes.status)
        .status
    ).toBe('PASS');

    const kycRes = await request(app).get('/api/v1/uploads/kyc/nonexistent-owner/nonexistent-file');
    expect([401, 403]).toContain(kycRes.status);
    expect(
      evaluateAuthBoundary('private-kyc-boundary', 'Unauthenticated Private KYC Download Rejected', kycRes.status)
        .status
    ).toBe('PASS');
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

  it('calls exact registered API endpoints and returns HOSTED_VERIFIED when all mocked HTTPS staging probes pass', async () => {
    const requestedUrls: string[] = [];
    const apiOrigin = 'https://tascora-api-staging.onrender.com';
    const webOrigin = 'https://tascora-staging.vercel.app';

    const mockFetch: FetchLike = async (input, init) => {
      const url = String(input);
      requestedUrls.push(url);
      const headersObj = (init?.headers ?? {}) as Record<string, string>;
      const reqOrigin = headersObj.Origin || headersObj.origin || null;
      const allowOrigin = reqOrigin === webOrigin ? reqOrigin : null;

      if (url === `${apiOrigin}/health/live`) {
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
      if (url === `${apiOrigin}/health`) {
        return {
          status: 200,
          ok: true,
          headers: { get: () => null },
          text: async () =>
            JSON.stringify({
              status: 'ok',
              db: 'ok',
              redis: 'ok',
              payments: { provider: 'disabled', status: 'disabled', available: false },
            }),
        };
      }
      if (
        url === `${apiOrigin}/api/v1/sessions` ||
        url === `${apiOrigin}/api/v1/admin/users` ||
        url === `${apiOrigin}/api/v1/uploads/kyc/nonexistent-owner/nonexistent-file`
      ) {
        return {
          status: 401,
          ok: false,
          headers: { get: () => null },
          text: async () => JSON.stringify({ success: false, error: 'Unauthorized' }),
        };
      }
      if (url === `${webOrigin}/en`) {
        return {
          status: 200,
          ok: true,
          headers: { get: () => null },
          text: async () => '<html><body>TASCORA</body></html>',
        };
      }

      throw new Error(`Unexpected URL requested by staging acceptance harness: ${url}`);
    };

    const report = await runStagingAcceptanceChecks(
      { apiUrl: apiOrigin, webUrl: webOrigin },
      mockFetch
    );

    expect(report.overallStatus).toBe('HOSTED_VERIFIED');
    expect(report.checks.every((c) => c.status === 'PASS')).toBe(true);
    expect(requestedUrls).toContain(`${apiOrigin}/api/v1/sessions`);
    expect(requestedUrls).toContain(`${apiOrigin}/api/v1/admin/users`);
    expect(requestedUrls).toContain(
      `${apiOrigin}/api/v1/uploads/kyc/nonexistent-owner/nonexistent-file`
    );
    expect(requestedUrls).not.toContain(`${apiOrigin}/api/v1/auth/me`);
    expect(requestedUrls).not.toContain(`${apiOrigin}/api/v1/uploads/kyc/nonexistent-id`);
  });
});
