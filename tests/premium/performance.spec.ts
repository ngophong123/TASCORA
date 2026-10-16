import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '../e2e/support/live-fixtures';

// Unthrottled local interaction lab; these are not field Core Web Vitals.
test.use({ viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' });
for (const route of ['/', '/services', '/explore']) {
  test(`record local interaction timings ${route}`, async ({ page }) => {
    const phase = process.env.PREMIUM_PERFORMANCE_PHASE || 'current';
    if (!/^[a-z0-9-]+$/i.test(phase)) throw new Error('Invalid phase');
    await page.context().route('**/*', request => ['localhost', '127.0.0.1'].includes(new URL(request.request().url()).hostname) ? request.continue() : request.abort());
    await page.addInitScript(() => {
      const data = { lcpMs: 0, shifts: [] as { time: number; value: number; sources: string[] }[], events: [] as { id: number; duration: number }[], longTasks: [] as number[], rafCallbacks: 0, supported: PerformanceObserver.supportedEntryTypes };
      Object.assign(window, { premiumTiming: data });
      const raf = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = callback => raf(time => { data.rafCallbacks++; callback(time); });
      if (data.supported.includes('largest-contentful-paint')) new PerformanceObserver(list => { for (const entry of list.getEntries()) data.lcpMs = entry.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
      if (data.supported.includes('layout-shift')) new PerformanceObserver(list => { for (const entry of list.getEntries()) { const shift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number; sources: { node: Element | null }[] }; if (!shift.hadRecentInput) data.shifts.push({ time: shift.startTime, value: shift.value, sources: shift.sources.map(source => source.node ? `${source.node.tagName}.${source.node.className}` : 'unavailable') }); } }).observe({ type: 'layout-shift', buffered: true });
      if (data.supported.includes('event')) new PerformanceObserver(list => { for (const entry of list.getEntries()) { const event = entry as PerformanceEntry & { interactionId: number }; if (event.interactionId) data.events.push({ id: event.interactionId, duration: event.duration }); } }).observe({ type: 'event', buffered: true, durationThreshold: 16 } as PerformanceObserverInit);
      if (data.supported.includes('longtask')) new PerformanceObserver(list => { data.longTasks.push(...list.getEntries().map(entry => entry.duration)); }).observe({ type: 'longtask', buffered: true });
    });
    const consoleErrors: string[] = [];
    page.on('pageerror', error => consoleErrors.push(error.message));
    await page.goto(route);
    await expect(page.getByTestId('mobile-menu-toggle')).toBeVisible();
    await page.waitForTimeout(2000);
    const start = await page.evaluate(() => (window as unknown as { premiumTiming: { rafCallbacks: number } }).premiumTiming.rafCallbacks);
    await page.waitForTimeout(2000);
    const end = await page.evaluate(() => (window as unknown as { premiumTiming: { rafCallbacks: number } }).premiumTiming.rafCallbacks);
    await page.getByTestId('mobile-menu-toggle').click();
    await expect(page.getByTestId('mobile-drawer')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('mobile-drawer')).not.toBeVisible();
    await page.waitForTimeout(500);
    const timings = await page.evaluate(() => {
      const data = (window as unknown as { premiumTiming: { lcpMs: number; shifts: { time: number; value: number }[]; events: { id: number; duration: number }[]; longTasks: number[]; supported: string[] } }).premiumTiming;
      let cls = 0, session = 0, first = 0, last = 0;
      for (const shift of data.shifts) { if (shift.time - last > 1000 || shift.time - first > 5000) { session = 0; first = shift.time; } session += shift.value; last = shift.time; cls = Math.max(cls, session); }
      const interactions = new Map<number, number>();
      for (const event of data.events) interactions.set(event.id, Math.max(interactions.get(event.id) || 0, event.duration));
      return { lcpMs: data.lcpMs, cls, layoutShifts: data.shifts, recordedInteractionCount: interactions.size, recordedInteractionMaxMs: interactions.size ? Math.max(...interactions.values()) : null, eventThresholdMs: 16, longTasks: data.longTasks, supported: data.supported, resources: performance.getEntriesByType('resource').map(entry => ({ name: entry.name, bytes: (entry as PerformanceResourceTiming).transferSize, duration: entry.duration })) };
    });
    expect(consoleErrors).toEqual([]);
    const directory = path.resolve('docs/performance', phase);
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(path.join(directory, `${route === '/' ? 'home' : route.slice(1)}-interactions.json`), JSON.stringify({ route, viewport: '390x844', throttling: 'none', fixture: true, idleRafCallbacksIn2Seconds: end - start, ...timings }, null, 2));
    if (phase === 'final' && route === '/explore') expect(timings.cls).toBeLessThan(0.1);
    if (phase === 'phase2-verified') {
      expect(timings.cls).toBeLessThan(0.01);
      expect(end - start).toBeLessThan(4);
    }
  });
}
