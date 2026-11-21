import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * TASCORA Local-Only Load Test Script (Phase 4G)
 *
 * SAFETY GUARD:
 * Refuses to execute against non-local or third-party hosts (never production,
 * never Stripe/Mailtrap/external APIs).
 */
const BASE_URL = __ENV.LOAD_TEST_BASE_URL || 'http://127.0.0.1:4000';

const ALLOWED_LOCAL_PREFIXES = ['http://127.0.0.1', 'http://localhost'];
if (!ALLOWED_LOCAL_PREFIXES.some((prefix) => BASE_URL.startsWith(prefix))) {
  throw new Error(
    `Refusing load test against non-local target (${BASE_URL}). Only localhost / 127.0.0.1 is allowed.`
  );
}

export const options = {
  scenarios: {
    public_catalog_browse: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '15s', target: 10 },
        { duration: '30s', target: 25 },
        { duration: '15s', target: 0 },
      ],
      exec: 'browseAndSearch',
    },
    health_and_auth_boundary: {
      executor: 'constant-vus',
      vus: 5,
      duration: '30s',
      exec: 'probeHealthAndAuth',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<500'],
  },
};

export function browseAndSearch() {
  const listRes = http.get(`${BASE_URL}/api/v1/services?search=design&page=1&limit=10`);
  check(listRes, {
    'services search returns 200 or 429': (r) => r.status === 200 || r.status === 429,
  });

  const recRes = http.get(`${BASE_URL}/api/v1/services/recommendations?limit=6`);
  check(recRes, {
    'recommendations returns 200 or 429': (r) => r.status === 200 || r.status === 429,
  });

  sleep(0.5);
}

export function probeHealthAndAuth() {
  const liveRes = http.get(`${BASE_URL}/health/live`);
  check(liveRes, {
    'liveness returns 200': (r) => r.status === 200,
  });

  // Verify unauthenticated order creation is cleanly rejected with 401
  const unauthOrder = http.post(
    `${BASE_URL}/api/v1/orders`,
    JSON.stringify({
      serviceId: 'c000000000000000000000001',
      packageId: 'c000000000000000000000002',
      idempotencyKey: `k6_unauth_${__VU}_${__ITER}`,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  check(unauthOrder, {
    'unauthenticated order rejected (401/429)': (r) => r.status === 401 || r.status === 429,
  });

  sleep(0.5);
}
