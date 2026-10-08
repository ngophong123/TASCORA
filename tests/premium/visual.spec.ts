import { test, expect } from '../e2e/support/live-fixtures';
import fs from 'node:fs';
const phase = process.env.PREMIUM_PHASE || 'after';
const widths = phase === 'before' ? [390, 768, 1440] : [360, 390, 768, 1280, 1440, 1920];
const routes = [['home', '/'], ['services', '/services'], ['explore', '/explore'], ['categories', '/categories'], ['freelancer', '/freelancers/seller'], ['detail', '/services/srv-1'], ['login', '/login'], ['register', '/register'], ['verify', '/verify-email'], ['dashboard', '/dashboard'], ['orders', '/dashboard/orders'], ['settings', '/dashboard/settings'], ['saved', '/dashboard/saved'], ['notifications', '/dashboard/notifications'], ['messages', '/dashboard/messages'], ['payments', '/dashboard/payments'], ['gigs', '/dashboard/gigs'], ['seller', '/seller/dashboard'], ['admin', '/dashboard/admin']] as const;
for (const width of widths) {
  for (const [name, route] of routes) {
    test(`${phase} ${name} ${width}`, async ({ page }) => {
      await page.context().route('**/*', route => {
        const host = new URL(route.request().url()).hostname;
        return ['127.0.0.1', 'localhost'].includes(host) ? route.continue() : route.abort();
      });
      await page.setViewportSize({ width, height: 900 });
      if (name === 'seller' || name === 'admin' || name === 'gigs') await page.addInitScript(role => {
        localStorage.setItem('user', JSON.stringify({ id: role, email: `${role}@example.test`, role: role.toUpperCase() }));
        localStorage.setItem('token', `e2e-${role}`);
      }, name === 'gigs' ? 'seller' : name);
      await page.route('**/api/v1/payments/capabilities', route => route.fulfill({ json: { success: true, data: { provider: 'disabled', status: 'disabled', available: false, providerValidated: false, externalPayoutsAvailable: false } } }));
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => {
        if (message.type() === 'error' && /hydration|hydrated|uncaught|maximum update depth/i.test(message.text())) errors.push(message.text());
      });
      await page.goto(`/en${route === '/' ? '' : route}`);
      await page.locator('h1, h2').first().waitFor();
      await page.waitForTimeout(1000);
      // Full-page screenshots do not load offscreen lazy images by themselves.
      for (let y = 0; y < await page.evaluate(() => document.documentElement.scrollHeight); y += 700) {
        await page.evaluate(top => window.scrollTo(0, top), y);
        await page.waitForTimeout(100);
      }
      await expect.poll(() => page.locator('img').evaluateAll(images => images.filter(img => img.getClientRects().length > 0).every(img => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0))).toBe(true);
      await page.evaluate(() => window.scrollTo(0, 0));
      const directory = `docs/premium-ui/${phase}`;
      fs.mkdirSync(directory, { recursive: true });
      await page.screenshot({ path: `${directory}/${name}-${width}.png`, fullPage: true });
      if (phase !== 'before') {
        expect(errors).toEqual([]);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      }
    });
  }
}
