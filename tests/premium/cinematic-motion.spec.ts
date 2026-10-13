import { test, expect } from '../e2e/support/live-fixtures';
import fs from 'node:fs';

test.use({ reducedMotion: 'no-preference' });
test.beforeEach(async ({ page }) => {
  await page.context().route('**/*', route => ['localhost', '127.0.0.1'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
});

for (const width of [360, 390, 768, 1024, 1280, 1440, 1920]) {
  test(`cinematic homepage remains usable at ${width}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
      if (message.type() === 'error' && /hydration|hydrated|uncaught|maximum update depth/i.test(message.text())) errors.push(message.text());
    });
    await page.goto('/en');
    await expect(page.getByTestId('gig-card').first()).toBeVisible();
    const depth = page.locator('[data-cinema-depth]').first();
    if (width < 1024) {
      await expect(page.locator('.home-cinema')).toHaveAttribute('data-cinema-pending', 'true');
      expect(await depth.evaluate(node => node.style.transform)).toBe('');
      await page.mouse.wheel(0, 80);
      // Do not race the new activation gesture's Lenis target with Playwright's
      // subsequent programmatic scrollIntoView (which Lenis would overwrite).
      await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(75);
      await expect(page.locator('html')).not.toHaveClass(/lenis-scrolling/);
    }
    await expect.poll(() => depth.evaluate(node => node.style.transform)).not.toBe('');
    await page.locator('#how-it-works').scrollIntoViewIfNeeded();
    await expect.poll(() => page.locator('[data-cinema-workflow]').evaluate(node => Number(node.style.getPropertyValue('--cinema-progress')))).toBeGreaterThan(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`workflow-${width}.png`) });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect.poll(() => depth.evaluate(node => node.style.transform)).toBe('');
    await expect(page.locator('.home-cinema')).not.toHaveAttribute('data-cinema-triggers');
    await expect(page.locator('#how-it-works li')).toHaveCount(3);
    expect(errors).toEqual([]);
  });
}

test('hero image scrubs with actual scrolling and reverses; routes and preferences do not duplicate triggers', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/en');
  const root = page.locator('.home-cinema');
  const image = page.locator('[data-cinema-hero-image]');
  await expect(root).toHaveAttribute('data-cinema-triggers', /\d+/);
  await expect(image).toBeVisible();
  await page.waitForTimeout(800);
  const count = await root.getAttribute('data-cinema-triggers');
  const scale = () => image.evaluate(node => new DOMMatrixReadOnly(getComputedStyle(node).transform).a);
  const initial = await scale();
  await page.screenshot({ path: testInfo.outputPath('hero-start.png') });
  await page.mouse.wheel(0, 350);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(250);
  await expect.poll(scale).toBeGreaterThan(initial + 0.01);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: testInfo.outputPath('hero-scrub.png') });
  await page.mouse.wheel(0, -500);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(2);
  await expect.poll(scale).toBeLessThan(initial + 0.005);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(root).not.toHaveAttribute('data-cinema-triggers');
  await expect.poll(() => image.evaluate(node => node.style.transform)).toBe('');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(root).toHaveAttribute('data-cinema-triggers', count!);
  await page.setViewportSize({ width: 768, height: 900 });
  await expect(root).toHaveAttribute('data-cinema-mode', 'light');
  await expect(root).toHaveAttribute('data-cinema-triggers', count!);
  await page.locator('[data-cinema-hero]').getByRole('link', { name: 'Explore services', exact: true }).click();
  await expect(page).toHaveURL(/\/services/);
  await expect(root).toHaveCount(0);
  await page.goBack();
  await expect(root).toHaveAttribute('data-cinema-triggers', count!);
});

test('low-resource devices use light motion even at desktop width', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => Object.defineProperty(navigator, 'deviceMemory', { value: 2, configurable: true }));
  await page.goto('/en');
  await expect(page.locator('.home-cinema')).toHaveAttribute('data-cinema-mode', 'light');
  expect(await page.locator('.cinema-workflow-heading').evaluate(node => getComputedStyle(node).position)).not.toBe('sticky');
});

test('ScrollTrigger does not retain an idle synchronization interval', async ({ page }) => {
  await page.addInitScript(() => {
    Object.assign(window, { cinematicFrames: 0 });
    const raf = requestAnimationFrame.bind(window);
    window.requestAnimationFrame = callback => raf(time => {
      (window as unknown as { cinematicFrames: number }).cinematicFrames++;
      callback(time);
    });
  });
  await page.goto('/en');
  await expect(page.locator('.cinema-service-frame')).toHaveCount(6);
  await expect(page.locator('.home-cinema')).toHaveAttribute('data-cinema-triggers', /\d+/);
  await page.waitForTimeout(1000);
  const frames = () => page.evaluate(() => (window as unknown as { cinematicFrames: number }).cinematicFrames);
  const before = await frames();
  await page.waitForTimeout(2000);
  expect((await frames()) - before).toBeLessThan(4);
  await page.mouse.wheel(0, 400);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(300);
  await page.waitForTimeout(1500);
  const settled = await frames();
  await page.waitForTimeout(2000);
  expect((await frames()) - settled).toBeLessThan(4);
});

test('each storytelling scene responds to scrolling with live service links preserved', async ({ page, marketplace }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/en');
  await expect(page.locator('.cinema-service-frame')).toHaveCount(6);
  await expect(page.locator('.home-cinema')).toHaveAttribute('data-cinema-mode', 'full');
  for (const [name, selector] of [
    ['talent', '[data-cinema-profile]'],
    ['categories', '[data-cinema-category]'],
    ['featured', '.cinema-service-frame'],
    ['finale', '[data-cinema-finale-title]'],
  ] as const) {
    const target = page.locator(selector).first();
    const y = () => target.evaluate(node => new DOMMatrixReadOnly(getComputedStyle(node).transform).f);
    const before = await y();
    // Some next scenes are already visible. scrollIntoViewIfNeeded would do
    // nothing; scroll them through the actual scrub range with wheel input.
    const distance = await target.evaluate(node => node.getBoundingClientRect().top - innerHeight * 0.25);
    await page.mouse.wheel(0, distance);
    await expect.poll(y).toBeLessThan(before - 1);
    await page.screenshot({ path: testInfo.outputPath(`${name}-scene.png`) });
  }
  const service = page.locator('.cinema-service-frame').first().getByTestId('gig-card-link');
  await service.click();
  await expect(page).toHaveURL(url => url.pathname === `/services/${marketplace.services[0]!.id}`);
  await expect(page.getByTestId('service-title')).toHaveText(marketplace.services[0]!.title);
});

test('motion is progressive enhancement with JavaScript disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.route('**/*', route => ['localhost', '127.0.0.1'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
    await page.goto('http://localhost:3210/en');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#how-it-works li')).toHaveCount(3);
    await expect(page.locator('#how-it-works h2')).toBeVisible();
  } finally { await context.close(); }
});

test('mobile activation respects typing, preferences, navigation and scroll keys', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/en');
  const root = page.locator('.home-cinema');
  await expect(root).toHaveAttribute('data-cinema-pending', 'true');
  await expect(root).not.toHaveAttribute('data-cinema-triggers');
  const search = page.getByTestId('hero-search-input');
  await search.fill('Next.js');
  await search.press('ArrowDown');
  await expect(root).toHaveAttribute('data-cinema-pending', 'true');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(root).not.toHaveAttribute('data-cinema-pending');
  await expect(root).not.toHaveAttribute('data-cinema-triggers');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(root).toHaveAttribute('data-cinema-pending', 'true');
  await page.getByTestId('hero-search-submit').click();
  await expect(page).toHaveURL(/services\?.*q=Next\.js/);
  await expect(root).toHaveCount(0);
  await page.goBack();
  await expect(root).toHaveAttribute('data-cinema-pending', 'true');
  await page.locator('#main-content').focus();
  await page.keyboard.press('PageDown');
  await expect(root).toHaveAttribute('data-cinema-mode', 'light');
  await expect(root).toHaveAttribute('data-cinema-triggers', /\d+/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
  await expect.poll(() => page.locator('[data-cinema-hero-image]').evaluate(node => new DOMMatrixReadOnly(getComputedStyle(node).transform).a)).toBeGreaterThan(1);
});

test('mobile first-scroll activation keeps real motion and records startup work', async ({ page, browserName }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  if (browserName === 'chromium') {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  }
  await page.addInitScript(() => {
    const tasks: { start: number; duration: number }[] = [];
    Object.assign(window, { activationTasks: tasks });
    if (PerformanceObserver.supportedEntryTypes.includes('longtask')) {
      new PerformanceObserver(list => {
        tasks.push(...list.getEntries().map(entry => ({ start: entry.startTime, duration: entry.duration })));
      }).observe({ type: 'longtask', buffered: true });
    }
  });
  await page.goto('/en');
  const root = page.locator('.home-cinema');
  await expect(root).toHaveAttribute('data-cinema-pending', 'true');
  await expect(page.locator('[data-cinema-hero-image]')).toBeVisible();
  await page.waitForTimeout(500);
  const start = await page.evaluate(() => performance.now());
  await page.mouse.wheel(0, 200);
  await expect(root).toHaveAttribute('data-cinema-mode', 'light');
  await expect(root).toHaveAttribute('data-cinema-triggers', /\d+/);
  const image = page.locator('[data-cinema-hero-image]');
  await expect.poll(() => image.evaluate(node => new DOMMatrixReadOnly(getComputedStyle(node).transform).a)).toBeGreaterThan(1);
  await page.waitForTimeout(1000);
  const result = await page.evaluate(start => ({
    activationWindowMs: performance.now() - start,
    supportsLongTasks: PerformanceObserver.supportedEntryTypes.includes('longtask'),
    tasks: (window as unknown as { activationTasks: { start: number; duration: number }[] }).activationTasks.filter(task => task.start >= start),
  }), start);
  fs.mkdirSync(testInfo.outputDir, { recursive: true });
  fs.writeFileSync(testInfo.outputPath('mobile-activation.json'), JSON.stringify({ browserName, cpuMultiplier: browserName === 'chromium' ? 4 : null, ...result }, null, 2));
  const scale = await image.evaluate(node => new DOMMatrixReadOnly(getComputedStyle(node).transform).a);
  await page.mouse.wheel(0, -400);
  await expect.poll(() => image.evaluate(node => new DOMMatrixReadOnly(getComputedStyle(node).transform).a)).toBeLessThan(scale);
});
