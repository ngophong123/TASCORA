// Test-runner preload only. Never imported by production application code.
const original = globalThis.fetch;
const api = new URL(process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com');
if (api.username || api.password) throw new Error('Fixture API URL must not contain credentials');
globalThis.fetch = (input, init) => {
  const address = typeof input === 'string' || input instanceof URL ? String(input) : input.url;
  const url = new URL(address);
  if (url.origin === api.origin && ['/api/v1/services', '/api/v1/marketplace/categories'].includes(url.pathname)) {
    const method = init?.method || (typeof input === 'object' && input.method) || 'GET';
    if (method !== 'GET') throw new Error('SSR fixture only permits public reads');
    const local = 'http://localhost:3211' + url.pathname + url.search;
    return original(typeof input === 'string' || input instanceof URL ? local : new Request(local, input), init);
  }
  if (['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) return original(input, init);
  throw new Error('External server fetch blocked by E2E fixture');
};
