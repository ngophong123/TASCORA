import { test, expect } from '../e2e/support/live-fixtures';
import fs from 'node:fs';

test.use({ reducedMotion: 'no-preference', video: 'on' });
test.beforeEach(async ({ page }) => {
  await page.context().route('**/*', route => ['localhost', '127.0.0.1'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
});

for (const width of [390, 768, 1024, 1440]) {
  test(`editorial spacing and sticky geometry at ${width}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
      if (message.type() === 'error' && /hydration|hydrated|uncaught|maximum update depth/i.test(message.text())) errors.push(message.text());
    });
    await page.goto('/en');
    await expect(page.locator('.cinema-service-frame')).toHaveCount(6);
    if (width < 1024) {
      await expect(page.locator('.home-cinema')).toHaveAttribute('data-cinema-pending', 'true');
      await page.mouse.wheel(0, 40);
      await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(35);
      await expect(page.locator('html')).not.toHaveClass(/lenis-scrolling/);
    }
    await expect(page.locator('.home-cinema')).toHaveAttribute('data-cinema-triggers', /\d+/);
    await page.screenshot({ path: testInfo.outputPath('hero.png') });
    const findings: object[] = [];
    for (const [scene, selector] of [
      ['talent', '[data-cinema-talent]'],
      ['categories', '[data-cinema-categories]'],
      ['featured', '[data-cinema-featured]'],
      ['workflow', '[data-cinema-workflow]'],
      ['finale', '[data-cinema-finale]'],
    ] as const) {
      const section = page.locator(selector);
      for (const position of [0.78, 0.45, 0.12]) {
        await section.evaluate((node, position) => window.scrollTo(0, Math.max(0, node.getBoundingClientRect().top + scrollY - innerHeight * position)), position);
        await page.waitForTimeout(250);
        const geometry = await section.evaluate(node => {
          const h2 = node.querySelector('h2')!;
          const paragraph = h2.nextElementSibling?.tagName === 'P' ? h2.nextElementSibling : h2.parentElement?.nextElementSibling;
          const heading = h2.getBoundingClientRect();
          const body = paragraph?.getBoundingClientRect();
          const navbar = document.querySelector('header')!.getBoundingClientRect();
          return { headingTop: heading.top, headingBottom: heading.bottom, bodyTop: body?.top, textGap: body ? body.top - heading.bottom : null, navbarTop: navbar.top, navbarBottom: navbar.bottom, overflow: document.documentElement.scrollWidth - innerWidth };
        });
        findings.push({ scene, position, ...geometry });
        await page.screenshot({ path: testInfo.outputPath(`${scene}-${position}.png`) });
        expect.soft(geometry.overflow, `${scene} overflow`).toBeLessThanOrEqual(0);
        if (scene === 'talent' || scene === 'finale') expect.soft(geometry.textGap, `${scene} heading overlaps copy at ${position}`).toBeGreaterThanOrEqual(8);
      }
    }
    const geometryPath = testInfo.outputPath('scroll-geometry.json');
    fs.writeFileSync(geometryPath, JSON.stringify(findings, null, 2));
    await testInfo.attach('scroll-geometry', { path: geometryPath, contentType: 'application/json' });
    await page.locator('[data-cinema-workflow]').evaluate(node => window.scrollTo(0, node.getBoundingClientRect().top + scrollY + 260));
    await page.waitForTimeout(250);
    if (width >= 1024) {
      await expect.poll(() => page.locator('.cinema-workflow-heading').evaluate(node => node.getBoundingClientRect().top)).toBeCloseTo(128, 0);
    }
    expect(errors).toEqual([]);
  });
}

test('rapid/reverse scroll, resize and back navigation retain usable choreography', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/en');
  await expect(page.locator('.cinema-service-frame')).toHaveCount(6);
  const root = page.locator('.home-cinema');
  await expect(root).toHaveAttribute('data-cinema-triggers', /\d+/);
  await page.waitForTimeout(500);
  const count = await root.getAttribute('data-cinema-triggers');
  for (const delta of [2200, -1200, 3000, -4500]) await page.mouse.wheel(0, delta);
  await page.waitForTimeout(1500);
  await page.keyboard.press('Home');
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(2);
  for (const width of [390, 1024, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(root).toHaveAttribute('data-cinema-triggers', count!);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.getByTestId('hero-search-input').fill('Next.js');
  await page.getByTestId('hero-search-submit').click();
  await expect(page).toHaveURL(/services\?.*q=Next\.js/);
  await page.goBack();
  await expect(root).toHaveAttribute('data-cinema-triggers', count!);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(root).not.toHaveAttribute('data-cinema-triggers');
  await expect(page.getByTestId('hero-search-input')).toBeVisible();
});

test('browser back restores the featured showcase position', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/en');
  const card = page.locator('.cinema-service-frame').first().getByTestId('gig-card-link');
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.evaluate(() => document.addEventListener('click', () => {
    Object.assign(window, { cinematicDeparture: { y: scrollY, height: document.documentElement.scrollHeight, cardTop: document.querySelector('.cinema-service-frame')!.getBoundingClientRect().top } });
  }, { capture: true, once: true }));
  const before = await page.evaluate(() => scrollY);
  expect(before).toBeGreaterThan(1000);
  await card.click();
  await expect(page.getByTestId('service-title')).toBeVisible();
  await page.goBack();
  await expect(page.locator('.cinema-service-frame')).toHaveCount(6);
  await page.waitForTimeout(1000);
  const positions = await page.evaluate(() => ({ departure: (window as unknown as { cinematicDeparture: { y: number; height: number; cardTop: number } }).cinematicDeparture, restored: { y: scrollY, height: document.documentElement.scrollHeight, cardTop: document.querySelector('.cinema-service-frame')!.getBoundingClientRect().top } }));
  const historyPath = testInfo.outputPath('history-position.json');
  fs.mkdirSync(testInfo.outputDir, { recursive: true });
  fs.writeFileSync(historyPath, JSON.stringify({ before, ...positions }, null, 2));
  await testInfo.attach('history-position', { path: historyPath, contentType: 'application/json' });
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before - 40);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(before + 40);
});

test('detached image scenes are released and keyboard focus stays stable', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/en');
  const root = page.locator('.home-cinema');
  await expect(root).toHaveAttribute('data-cinema-triggers', /\d+/);
  await expect(page.locator('[data-cinema-hero-image]')).toBeVisible();
  await page.waitForTimeout(500);
  const count = await root.getAttribute('data-cinema-triggers');
  // Emulate asynchronous React replacement: the trigger's section survives,
  // but its previous animated target must not remain registered.
  await page.locator('[data-cinema-hero-image]').evaluate(node => {
    const replacement = node.cloneNode(true) as HTMLElement;
    replacement.removeAttribute('style');
    node.replaceWith(replacement);
  });
  await expect.poll(() => page.locator('[data-cinema-hero-image]').evaluate(node => node.style.transform)).not.toBe('');
  await expect(root).toHaveAttribute('data-cinema-triggers', count!);
  await page.mouse.wheel(0, 200);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
  const panel = page.locator('[data-cinema-depth]').first();
  await panel.getByRole('link').first().focus();
  await expect.poll(() => panel.evaluate(node => new DOMMatrixReadOnly(getComputedStyle(node).transform).f)).toBe(0);
  await page.waitForTimeout(250);
  expect(await panel.evaluate(node => new DOMMatrixReadOnly(getComputedStyle(node).transform).f)).toBe(0);
});

test('hero scrub progresses continuously under wheel input and reverse', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/en');
  await expect(page.locator('[data-cinema-hero-image]')).toBeVisible();
  await expect(page.locator('.cinema-service-frame')).toHaveCount(6);
  await expect(page.locator('.home-cinema')).toHaveAttribute('data-cinema-triggers', /\d+/);
  await page.waitForTimeout(1000);
  const results = [];
  for (const delta of [350, -500]) {
    const sampling = page.evaluate(() => new Promise<{ time: number; scroll: number; scale: number }[]>(resolve => {
      const samples: { time: number; scroll: number; scale: number }[] = [];
      const start = performance.now();
      const frame = (time: number) => {
        const image = document.querySelector('[data-cinema-hero-image]')!;
        samples.push({ time: time - start, scroll: scrollY, scale: new DOMMatrixReadOnly(getComputedStyle(image).transform).a });
        if (time - start < 1200) requestAnimationFrame(frame);
        else resolve(samples);
      };
      requestAnimationFrame(frame);
    }));
    await page.mouse.wheel(0, delta);
    const frames = await sampling;
    results.push({ delta, frames });
    const samplePath = testInfo.outputPath('scrub-frame-samples.json');
    fs.mkdirSync(testInfo.outputDir, { recursive: true });
    fs.writeFileSync(samplePath, JSON.stringify(results, null, 2));
    expect(frames.length).toBeGreaterThan(2);
    const movement = frames.at(-1)!.scale - frames[0]!.scale;
    if (delta > 0) expect(movement).toBeGreaterThan(0.01);
    else expect(movement).toBeLessThan(-0.01);
    for (let index = 1; index < frames.length; index++) {
      const change = frames[index]!.scale - frames[index - 1]!.scale;
      expect(Math.abs(change)).toBeLessThan(0.035);
      if (delta > 0) expect(change).toBeGreaterThanOrEqual(-0.0025);
      else expect(change).toBeLessThanOrEqual(0.0025);
    }
  }
  const framePath = testInfo.outputPath('scrub-frame-samples.json');
  fs.mkdirSync(testInfo.outputDir, { recursive: true });
  fs.writeFileSync(framePath, JSON.stringify(results, null, 2));
  await testInfo.attach('scrub-frame-samples', { path: framePath, contentType: 'application/json' });
});
