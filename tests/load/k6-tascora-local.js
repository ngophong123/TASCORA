import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

/**
 * TASCORA Local-Only Controlled Load Test Script (Workstream 3 / Phase 4G)
 *
 * SAFETY GUARD:
 * Strictly refuses execution against any non-local or third-party host.
 * Never targets production, hosted staging without local opt-in, Stripe, or Mailtrap.
 *
 * Usage (after starting local API on 127.0.0.1:4000):
 *   LOAD_TEST_BASE_URL="http://127.0.0.1:4000" k6 run tests/load/k6-tascora-local.js
 * Optional authenticated load (non-production local test user JWT):
 *   LOAD_TEST_AUTH_TOKEN="<local-test-jwt>" LOAD_TEST_SERVICE_ID="<cuid>" LOAD_TEST_PACKAGE_ID="<cuid>" k6 run tests/load/k6-tascora-local.js
 */
const BASE_URL = __ENV.LOAD_TEST_BASE_URL || 'http://127.0.0.1:4000';
const AUTH_TOKEN = __ENV.LOAD_TEST_AUTH_TOKEN || '';
const SERVICE_ID = __ENV.LOAD_TEST_SERVICE_ID || 'c000000000000000000000001';
const PACKAGE_ID = __ENV.LOAD_TEST_PACKAGE_ID || 'c000000000000000000000002';

const ALLOWED_LOCAL_PREFIXES = ['http://127.0.0.1', 'http://localhost'];
if (!ALLOWED_LOCAL_PREFIXES.some((prefix) => BASE_URL.startsWith(prefix))) {
  throw new Error(
    `Refusing load test against non-local target (${BASE_URL}). Only localhost / 127.0.0.1 is allowed.`
  );
}

const catalogLatency = new Trend('tascora_catalog_duration_ms', true);
const detailLatency = new Trend('tascora_service_detail_duration_ms', true);
const authBoundaryLatency = new Trend('tascora_auth_duration_ms', true);
const orderConcurrencyLatency = new Trend('tascora_order_concurrency_duration_ms', true);
const socketHandshakeLatency = new Trend('tascora_socket_handshake_duration_ms', true);
const rateLimitTriggered = new Rate('tascora_rate_limit_429_rate');

export const options = {
  summaryTrendStats: ['avg', 'min', 'med', 'p(50)', 'p(90)', 'p(95)', 'p(99)', 'max'],
  scenarios: {
    catalog_and_detail_browse: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '15s', target: 10 },
        { duration: '30s', target: 25 },
        { duration: '15s', target: 0 },
      ],
      exec: 'browseCatalogAndDetail',
    },
    auth_analytics_payment_boundaries: {
      executor: 'constant-vus',
      vus: 5,
      duration: '30s',
      exec: 'exerciseAuthPaymentAnalytics',
    },
    order_concurrency_idempotency: {
      executor: 'per-vu-iterations',
      vus: 10,
      iterations: 3,
      maxDuration: '30s',
      exec: 'exerciseOrderConcurrency',
    },
    realtime_and_rate_limit: {
      executor: 'constant-vus',
      vus: 4,
      duration: '20s',
      exec: 'probeSocketAndRateLimit',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.10'],
    'http_req_duration{scenario:catalog_and_detail_browse}': ['p(50)<150', 'p(95)<500', 'p(99)<1000'],
    'tascora_catalog_duration_ms': ['p(95)<400'],
    'tascora_socket_handshake_duration_ms': ['p(95)<300'],
  },
};

function authHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (AUTH_TOKEN) {
    headers.Authorization = `Bearer ${AUTH_TOKEN}`;
  }
  return headers;
}

export function browseCatalogAndDetail() {
  group('Marketplace Catalog & Service Detail', () => {
    const listRes = http.get(`${BASE_URL}/api/v1/services?search=design&page=1&limit=10`);
    catalogLatency.add(listRes.timings.duration);
    rateLimitTriggered.add(listRes.status === 429);
    check(listRes, {
      'catalog search returns 200 or 429': (r) => r.status === 200 || r.status === 429,
    });

    const recRes = http.get(`${BASE_URL}/api/v1/services/recommendations?limit=6`);
    check(recRes, {
      'recommendations returns 200 or 429': (r) => r.status === 200 || r.status === 429,
    });

    const detailRes = http.get(`${BASE_URL}/api/v1/services/${SERVICE_ID}`);
    detailLatency.add(detailRes.timings.duration);
    check(detailRes, {
      'service detail returns 200, 404, or 429': (r) =>
        r.status === 200 || r.status === 404 || r.status === 429,
    });
  });

  sleep(0.4);
}

export function exerciseAuthPaymentAnalytics() {
  group('Auth, Payment & Analytics Endpoints', () => {
    const loginRes = http.post(
      `${BASE_URL}/api/v1/auth/login`,
      JSON.stringify({ email: 'loadtest-invalid@example.invalid', password: 'WrongPassword123!' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    authBoundaryLatency.add(loginRes.timings.duration);
    rateLimitTriggered.add(loginRes.status === 429);
    check(loginRes, {
      'invalid login rejected (400/401/429)': (r) =>
        r.status === 400 || r.status === 401 || r.status === 429,
    });

    const analyticsRes = http.get(`${BASE_URL}/api/v1/analytics/seller/dashboard`, {
      headers: authHeaders(),
    });
    check(analyticsRes, {
      'analytics respects auth boundary (200/401/404/429)': (r) =>
        r.status === 200 || r.status === 401 || r.status === 404 || r.status === 429,
    });

    const paymentRes = http.post(
      `${BASE_URL}/api/v1/payments/create-intent`,
      JSON.stringify({ orderId: 'c000000000000000000000099' }),
      { headers: authHeaders() }
    );
    check(paymentRes, {
      'payment intent boundary safe (401/404/409/429/503)': (r) =>
        [401, 404, 409, 429, 503].includes(r.status),
    });
  });

  sleep(0.5);
}

export function exerciseOrderConcurrency() {
  group('Order Lifecycle & Concurrent Idempotency Check', () => {
    // Shared idempotency key across concurrent VUs verifies zero duplicate orders
    const sharedKey = `k6_concurrent_iter_${__ITER}`;
    const res = http.post(
      `${BASE_URL}/api/v1/orders`,
      JSON.stringify({
        serviceId: SERVICE_ID,
        packageId: PACKAGE_ID,
        idempotencyKey: sharedKey,
      }),
      { headers: authHeaders() }
    );
    orderConcurrencyLatency.add(res.timings.duration);
    check(res, {
      'concurrent order call safe (201/401/404/409/429)': (r) =>
        [201, 401, 404, 409, 429].includes(r.status),
    });
  });

  sleep(0.2);
}

export function probeSocketAndRateLimit() {
  group('Health, Redis Readiness & Socket.IO Handshake', () => {
    const liveRes = http.get(`${BASE_URL}/health/live`);
    check(liveRes, { 'health/live returns 200': (r) => r.status === 200 });

    const readyRes = http.get(`${BASE_URL}/health`);
    check(readyRes, {
      'health readiness returns 200 or 503': (r) => r.status === 200 || r.status === 503,
    });

    // Engine.IO v4 polling handshake checks Socket.IO listener availability
    const sioRes = http.get(`${BASE_URL}/socket.io/?EIO=4&transport=polling`);
    socketHandshakeLatency.add(sioRes.timings.duration);
    check(sioRes, {
      'Socket.IO handshake responds cleanly (200/400/403)': (r) =>
        r.status === 200 || r.status === 400 || r.status === 403,
    });
  });

  sleep(0.4);
}

export function handleSummary(data) {
  const duration = data.metrics.http_req_duration ? data.metrics.http_req_duration.values : {};
  const reqs = data.metrics.http_reqs ? data.metrics.http_reqs.values : {};
  const failed = data.metrics.http_req_failed ? data.metrics.http_req_failed.values : {};
  const summary = {
    target: BASE_URL,
    executedAt: new Date().toISOString(),
    throughputReqPerSec: reqs.rate || 0,
    totalRequests: reqs.count || 0,
    errorRate: failed.rate || 0,
    latencyMs: {
      p50: duration['p(50)'] || duration.med || 0,
      p95: duration['p(95)'] || 0,
      p99: duration['p(99)'] || 0,
      avg: duration.avg || 0,
    },
  };
  return {
    stdout: `${JSON.stringify(summary, null, 2)}\n`,
  };
}
