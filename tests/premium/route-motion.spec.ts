import { test, expect } from '../e2e/support/live-fixtures';

for (const reducedMotion of ['reduce', 'no-preference'] as const) {
  test(`native route fade respects ${reducedMotion} and keeps initial content visible`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });
    await page.context().route('**/*', route => ['localhost', '127.0.0.1'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
    await page.addInitScript(() => {
      const original = Element.prototype.animate;
      Object.assign(window, { routeFades: 0 });
      Element.prototype.animate = function (...args: Parameters<typeof original>) {
        if (this.parentElement?.tagName === 'MAIN') {
          const state = window as unknown as { routeFades: number };
          state.routeFades++;
        }
        return original.apply(this, args);
      };
    });
    await page.goto('/');
    await expect(page.getByTestId('hero-search-input')).toBeVisible();
    expect(await page.evaluate(() => getComputedStyle(document.querySelector('main > div')!).opacity)).toBe('1');
    expect(await page.evaluate(() => (window as unknown as { routeFades: number }).routeFades)).toBe(0);
    await page.getByTestId('hero-search-input').fill('Next.js');
    await page.getByTestId('hero-search-submit').click();
    await expect(page).toHaveURL(/services.*q=Next\.js/);
    await expect(page.getByTestId('services-search-input')).toHaveValue('Next.js');
    await expect.poll(() => page.evaluate(() => (window as unknown as { routeFades: number }).routeFades)).toBe(reducedMotion === 'reduce' ? 0 : 1);
    await expect.poll(() => page.evaluate(() => getComputedStyle(document.querySelector('main > div')!).opacity)).toBe('1');
  });
}
