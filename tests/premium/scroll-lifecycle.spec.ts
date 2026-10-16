import { test, expect } from '../e2e/support/live-fixtures';
test.use({ reducedMotion: 'no-preference' });
test('on-demand Lenis scrolls, settles, responds to reduced motion and cleans up on dashboard', async ({ page }) => {
  await page.context().route('**/*', route => ['localhost', '127.0.0.1'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
  await page.addInitScript(() => {
    Object.assign(window, { rafCount: 0 });
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = callback => raf(time => { (window as unknown as { rafCount: number }).rafCount++; callback(time); });
  });
  await page.goto('/'); await page.waitForTimeout(2000);
  const count = () => page.evaluate(() => (window as unknown as { rafCount: number }).rafCount);
  const idle = await count(); await page.waitForTimeout(500); expect((await count()) - idle).toBeLessThan(4);
  await page.mouse.wheel(0, 600);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
  await page.waitForTimeout(1500);
  const settled = await count(); await page.waitForTimeout(500); expect((await count()) - settled).toBeLessThan(4);
  // Exercise the visibility listener without relying on browser focus policy.
  await page.mouse.wheel(0, 200);
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await page.waitForTimeout(200);
  const hidden = await count(); await page.waitForTimeout(500); expect((await count()) - hidden).toBeLessThan(4);
  await page.evaluate(() => { delete (document as unknown as { hidden?: boolean }).hidden; document.dispatchEvent(new Event('visibilitychange')); });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.keyboard.press('Home'); await page.keyboard.press('PageDown');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const position = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 400); await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(position);
  await page.waitForTimeout(1500);
  await page.goto('/dashboard'); await page.waitForTimeout(1000);
  const dashboard = await count(); await page.waitForTimeout(500); expect((await count()) - dashboard).toBeLessThan(4);
});
