import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../e2e/support/live-fixtures';
for (const width of [390, 1280]) {
  for (const [name, route] of [['home', '/en'], ['services', '/en/services'], ['explore', '/en/explore'], ['detail', '/en/services/srv-1'], ['categories', '/en/categories'], ['freelancer', '/en/freelancers/seller'], ['login', '/en/login'], ['register', '/en/register'], ['verify', '/en/verify-email']] as const) {
    test(`WCAG scan ${name} ${width}`, async ({ page }, testInfo) => {
      await page.context().route('**/*', route => ['localhost', '127.0.0.1'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route);
      await page.locator('h1').first().waitFor();
      await page.waitForTimeout(500);
      const results = await new AxeBuilder({ page }).exclude('nextjs-portal').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      await testInfo.attach('axe-results', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
      expect(results.violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => node.target) }))).toEqual([]);
    });
  }
}
