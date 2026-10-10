import fs from 'node:fs';
import path from 'node:path';
import { test } from '../e2e/support/live-fixtures';
for (const mode of ['normal', 'no-font', 'delayed-categories']) {
  test(`attribute home layout shift ${mode}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.context().route('**/*', route => ['localhost', '127.0.0.1'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
    if (mode === 'no-font') await page.route('**/*.woff2', route => route.abort());
    if (mode === 'delayed-categories') await page.route('**/marketplace/categories', async route => { await new Promise(resolve => setTimeout(resolve, 3000)); await route.fallback(); });
    await page.addInitScript(() => {
      const data = { samples: [] as object[], shifts: [] as object[] };
      Object.assign(window, { homeDiagnostic: data });
      new PerformanceObserver(list => { for (const entry of list.getEntries()) { const item = entry as PerformanceEntry & { value: number; hadRecentInput: boolean; sources: { node: Node | null }[] }; if (!item.hadRecentInput) data.shifts.push({ time: item.startTime, value: item.value, sources: item.sources.map(source => source.node instanceof Element ? `${source.node.tagName}.${source.node.className}` : source.node?.nodeName) }); } }).observe({ type: 'layout-shift', buffered: true });
      const sample = () => data.samples.push({ time: performance.now(), fonts: document.fonts.status, elements: ['h1', 'h1 + p', '[data-testid="hero-category-select"]', 'h1 + p + div'].map(selector => { const node = document.querySelector(selector); return { selector, rect: node?.getBoundingClientRect().toJSON(), font: node ? getComputedStyle(node).fontFamily : null }; }) });
      document.addEventListener('DOMContentLoaded', () => { for (const delay of [0, 50, 100, 200, 500, 1000, 2000, 3500]) setTimeout(sample, delay); });
      document.fonts.addEventListener('loadingdone', sample);
    });
    await page.goto('/'); await page.waitForTimeout(4000);
    const directory = path.resolve('docs/performance', process.env.PREMIUM_PERFORMANCE_PHASE || 'phase2-before');
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(path.join(directory, `home-cls-${mode}.json`), JSON.stringify(await page.evaluate(() => (window as unknown as { homeDiagnostic: object }).homeDiagnostic), null, 2));
  });
}
