// QA-only SSR API. Never imported by production application code.
import http from 'node:http';
import { createStore } from '../tests/e2e/support/live-fixtures';
const store = createStore();
let outage = false;
let delayMs = 100;
http.createServer(async (request, response) => {
  const url = new URL(request.url!, 'http://localhost:3211');
  if (url.pathname === '/__lab/health' && request.method === 'GET') {
    response.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ fixture: true })); return;
  }
  if (url.pathname === '/__lab/catalog' && request.method === 'POST') {
    try {
      const chunks: Buffer[] = []; let bytes = 0;
      for await (const chunk of request) {
        bytes += chunk.length;
        if (bytes > 4 * 1024 * 1024) { response.writeHead(413).end(); return; }
        chunks.push(Buffer.from(chunk));
      }
      const data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      if (!Array.isArray(data.services) || !Array.isArray(data.categories)) { response.writeHead(400).end(); return; }
      store.services = data.services; store.categories = data.categories;
      response.writeHead(204).end();
    } catch { response.writeHead(400).end(); }
    return;
  }
  if (url.pathname === '/__lab/outage' && request.method === 'POST') {
    outage = url.searchParams.get('enabled') === 'true';
    response.writeHead(204).end(); return;
  }
  if (url.pathname === '/__lab/delay' && request.method === 'POST') {
    const value = Number(url.searchParams.get('ms'));
    if (!Number.isInteger(value) || value < 0 || value > 10000) { response.writeHead(400).end(); return; }
    delayMs = value; response.writeHead(204).end(); return;
  }
  if (request.method !== 'GET') { response.writeHead(405).end(); return; }
  await new Promise(resolve => setTimeout(resolve, delayMs));
  let data: unknown;
  if (url.pathname === '/api/v1/services' && !outage) {
    const page = Number(url.searchParams.get('page') || 1), limit = Number(url.searchParams.get('limit') || 10);
    const published = store.services.filter(service => service.status === 'PUBLISHED');
    data = { services: published.slice((page - 1) * limit, page * limit), total: published.length, totalPages: Math.ceil(published.length / limit), page, limit };
  } else if (url.pathname === '/api/v1/marketplace/categories') data = store.categories;
  response.writeHead(data === undefined ? 503 : 200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify({ success: data !== undefined, data, error: data === undefined ? 'Catalog temporarily unavailable' : undefined }));
}).listen(3211, 'localhost', () => console.log('QA SSR catalog fixture localhost:3211; 73 services; 100ms delay'));
