import { test, expect } from '../e2e/support/live-fixtures';
import fs from 'node:fs';
const phase = process.env.PREMIUM_PHASE || 'after';
const widths = phase === 'before' ? [390, 768, 1440] : [360, 390, 768, 1280, 1440, 1920];
const routes = [['home', '/'], ['services', '/services'], ['explore', '/explore'], ['categories', '/categories'], ['freelancer', '/freelancers/seller'], ['detail', '/services/srv-1'], ['login', '/login'], ['register', '/register'], ['verify', '/verify-email'], ['dashboard', '/dashboard'], ['orders', '/dashboard/orders'], ['settings', '/dashboard/settings'], ['saved', '/dashboard/saved'], ['notifications', '/dashboard/notifications'], ['messages', '/dashboard/messages'], ['payments', '/dashboard/payments'], ['gigs', '/dashboard/gigs'], ['new-service', '/dashboard/gigs/new'], ['edit-service', '/dashboard/gigs/srv-1/edit'], ['earnings', '/dashboard/earnings'], ['seller', '/seller/dashboard'], ['admin', '/dashboard/admin']] as const;
for (const width of widths) {
  for (const [name, route] of routes) {
    test(`${phase} ${name} ${width}`, async ({ page }, testInfo) => {
      await page.context().route('**/*', route => {
        const host = new URL(route.request().url()).hostname;
        return ['127.0.0.1', 'localhost'].includes(host) ? route.continue() : route.abort();
      });
      await page.setViewportSize({ width, height: 900 });
      if (['seller', 'admin', 'gigs', 'new-service', 'edit-service', 'earnings'].includes(name)) await page.addInitScript(role => {
        localStorage.setItem('user', JSON.stringify({ id: role, email: `${role}@example.test`, role: role.toUpperCase() }));
        localStorage.setItem('token', `e2e-${role}`);
      }, name === 'admin' ? 'admin' : 'seller');
      await page.route('**/api/v1/payments/capabilities', route => route.fulfill({ json: { success: true, data: { provider: 'disabled', status: 'disabled', available: false, providerValidated: false, externalPayoutsAvailable: false } } }));
      const errors: string[] = [];
      const imageNetwork: object[] = [];
      const trackedImage = (url: string) => /market-research-tam-sizing|accessible-tailwind-components/.test(url);
      page.on('request', request => { if (trackedImage(request.url())) imageNetwork.push({ event: 'request', url: request.url() }); });
      page.on('response', response => { if (trackedImage(response.url())) imageNetwork.push({ event: 'response', url: response.url(), status: response.status() }); });
      page.on('requestfailed', request => { if (trackedImage(request.url())) imageNetwork.push({ event: 'failed', url: request.url(), error: request.failure()?.errorText }); });
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => {
        if (message.type() === 'error' && /hydration|hydrated|uncaught|maximum update depth/i.test(message.text())) errors.push(message.text());
      });
      await page.goto(`/en${route === '/' ? '' : route}`);
      await page.locator('h1, h2').first().waitFor();
      if (['home', 'services', 'explore', 'freelancer'].includes(name)) await page.getByTestId('gig-card').first().waitFor();
      if (name === 'detail') await page.getByTestId('service-title').waitFor();
      await page.waitForTimeout(1000);
      // Full-page screenshots do not load offscreen lazy images by themselves.
      for (let y = 0; y < await page.evaluate(() => document.documentElement.scrollHeight); y += 700) {
        await page.evaluate(top => window.scrollTo(0, top), y);
        await page.waitForTimeout(100);
      }
      try {
        // A fast full-page sweep can miss native lazy-loading activation near
        // the last rows. Bring each still-unloaded visible image into view.
        const pendingIndices = await page.locator('img').evaluateAll(images => images.flatMap((img, index) => {
          const rect = img.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && (!(img as HTMLImageElement).complete || !(img as HTMLImageElement).naturalWidth) ? [index] : [];
        }));
        for (const index of pendingIndices) {
          const img = page.locator('img').nth(index);
          await img.scrollIntoViewIfNeeded();
          await expect.poll(() => img.evaluate(node => (node as HTMLImageElement).complete && (node as HTMLImageElement).naturalWidth > 0)).toBe(true);
        }
        await expect.poll(() => page.locator('img').evaluateAll(images => images.filter(img => img.getClientRects().length > 0).every(img => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0))).toBe(true);
      } catch (error) {
        const pending = await page.locator('img').evaluateAll(images => images.filter(img => !(img as HTMLImageElement).complete || !(img as HTMLImageElement).naturalWidth).map(img => ({ src: img.getAttribute('src'), currentSrc: (img as HTMLImageElement).currentSrc, complete: (img as HTMLImageElement).complete, naturalWidth: (img as HTMLImageElement).naturalWidth, srcset: img.getAttribute('srcset'), alt: img.getAttribute('alt'), loading: img.getAttribute('loading'), rect: img.getBoundingClientRect().toJSON() })));
        fs.mkdirSync('docs/premium-ui/diagnostics', { recursive: true });
        fs.writeFileSync(`docs/premium-ui/diagnostics/${name}-${width}-pending-images.json`, JSON.stringify(pending, null, 2));
        fs.writeFileSync(`docs/premium-ui/diagnostics/${name}-${width}-network.json`, JSON.stringify(imageNetwork, null, 2));
        await testInfo.attach('pending-images', { body: JSON.stringify(pending, null, 2), contentType: 'application/json' });
        throw error;
      }
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
