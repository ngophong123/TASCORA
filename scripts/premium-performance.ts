// Local production lab only. Read-only API fixtures, no hosted services or secrets.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';
import { createStore } from '../tests/e2e/support/live-fixtures';

const phase = process.argv[2] || 'before';
if (!/^[a-z0-9-]+$/i.test(phase)) throw new Error('Invalid phase');
const smoke = process.argv.includes('--smoke');
const runs = smoke ? 1 : 3;
const requireCli = createRequire(fs.realpathSync('node_modules/@lhci/cli/package.json'));
const lighthousePath = requireCli.resolve('lighthouse');
const lighthouseModule = await import(pathToFileURL(lighthousePath).href);
const requireLighthouse = createRequire(lighthousePath);
const puppeteer = requireLighthouse('puppeteer-core');
const directory = path.resolve('docs/performance', phase);
fs.mkdirSync(directory, { recursive: true });
console.log('Starting local Chromium through the pipe transport');
const browser = await puppeteer.launch({ executablePath: chromium.executablePath(), headless: true, pipe: true, timeout: 15000, userDataDir: path.resolve('.premium-performance/chromium', phase) });
const summaries: object[] = [];

async function fixturePage(page: any) {
  const state = createStore();
  const blocked: string[] = [];
  await page.setRequestInterception(true);
  page.on('request', async (request: any) => {
    if (request.isInterceptResolutionHandled()) return;
    const url = new URL(request.url());
    if (url.hostname === 'api.tascora.test') {
      const headers = { 'Access-Control-Allow-Origin': 'http://localhost:3210', 'Access-Control-Allow-Credentials': 'true', 'Access-Control-Allow-Headers': 'Authorization,Content-Type,X-CSRF-Protection', 'Access-Control-Allow-Methods': 'GET,OPTIONS' };
      if (request.method() === 'OPTIONS') { await request.respond({ status: 204, headers }); return; }
      if (request.method() !== 'GET') { await request.respond({ status: 405, headers }); return; }
      const endpoint = url.pathname.replace('/api/v1', '');
      let data: unknown;
      if (endpoint === '/marketplace/categories') data = state.categories;
      else if (endpoint === '/marketplace/sellers') data = [state.users[1]!.sellerProfile];
      else if (endpoint === '/payments/capabilities') data = { provider: 'disabled', status: 'disabled', available: false, providerValidated: false, externalPayoutsAvailable: false };
      else if (endpoint === '/services') {
        const pageNumber = Number(url.searchParams.get('page') || 1), limit = Number(url.searchParams.get('limit') || 10);
        data = { services: state.services.slice((pageNumber - 1) * limit, pageNumber * limit), total: state.services.length, totalPages: Math.ceil(state.services.length / limit), page: pageNumber, limit };
      }
      await new Promise(resolve => setTimeout(resolve, 100));
      await request.respond({ status: data === undefined ? 404 : 200, headers, contentType: 'application/json', body: JSON.stringify({ success: data !== undefined, data, ...(data === undefined ? { error: 'Read-only performance fixture unavailable' } : {}) }) });
    } else if (url.hostname === 'localhost' && url.port === '3210') await request.continue();
    else { blocked.push(url.hostname); await request.abort(); }
  });
  return blocked;
}

try {
  console.log(JSON.stringify({ phase, lighthouse: '12.6.1', browser: await browser.version(), runs, fixtureServices: createStore().services.length, apiDelayMs: 100, productionUrl: 'http://localhost:3210' }));
  const cases = smoke ? [['home', '/']] : [['home', '/'], ['services', '/services'], ['explore', '/explore']];
  for (const [name, route] of cases) {
    for (let run = 1; run <= runs; run++) {
      const context = await browser.createBrowserContext();
      const page = await context.newPage();
      const blocked = await fixturePage(page);
      const result = await lighthouseModule.default(`http://localhost:3210${route}`, {
        logLevel: 'error', output: 'json', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        disableStorageReset: true, maxWaitForLoad: 45000,
      }, undefined, page);
      if (!result) throw new Error('Lighthouse returned no result');
      const lhr = result.lhr;
      const stem = `${name}-mobile-${run}`;
      fs.writeFileSync(path.join(directory, `${stem}.json`), JSON.stringify(lhr, null, 2));
      fs.writeFileSync(path.join(directory, `${stem}.html`), lighthouseModule.generateReport(lhr, 'html'));
      if (lhr.runtimeError || lhr.categories.performance.score === null) throw new Error(`Lighthouse failed: ${lhr.runtimeError?.code || 'no score'}`);
      const summary = {
        name, run, mode: 'mobile-simulated', performance: lhr.categories.performance.score * 100,
        accessibility: lhr.categories.accessibility.score * 100, bestPractices: lhr.categories['best-practices'].score * 100, seo: lhr.categories.seo.score * 100,
        fcpMs: lhr.audits['first-contentful-paint'].numericValue, lcpMs: lhr.audits['largest-contentful-paint'].numericValue,
        cls: lhr.audits['cumulative-layout-shift'].numericValue, tbtMs: lhr.audits['total-blocking-time'].numericValue,
        speedIndexMs: lhr.audits['speed-index'].numericValue, settings: lhr.configSettings,
        warnings: lhr.runWarnings, blockedHosts: [...new Set(blocked)],
        network: lhr.audits['resource-summary']?.details?.items,
      };
      summaries.push(summary);
      fs.writeFileSync(path.join(directory, 'summary.json'), JSON.stringify(summaries, null, 2));
      console.log(JSON.stringify({ phase, name, run, score: summary.performance, lcpMs: summary.lcpMs, cls: summary.cls, tbtMs: summary.tbtMs }));
      await context.close();
    }
  }
} finally {
  // Only this harness-owned Chromium process; bounded cleanup on Windows.
  const process = browser.process();
  await Promise.race([browser.close(), new Promise(resolve => setTimeout(resolve, 5000))]);
  if (process && process.exitCode === null) process.kill();
}
