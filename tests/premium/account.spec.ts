import { test, expect } from '../e2e/support/live-fixtures';
import '../e2e/auth/production-account.spec';
test.beforeEach(async ({ page }) => {
  await page.context().route('**/*', route => ['localhost', '127.0.0.1'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
});
test('login labels, visibility and error recovery preserve real sign-in', async ({ page }) => {
  await page.goto('/en/login');
  const email = page.getByLabel(/^Work email$/i);
  const password = page.getByLabel('Password', { exact: true });
  await email.fill('missing@example.test'); await password.fill('E2E-password-123!');
  const toggle = page.getByRole('button', { name: 'Toggle password visibility' });
  await toggle.click(); await expect(password).toHaveAttribute('type', 'text');
  await toggle.click(); await expect(password).toHaveAttribute('type', 'password');
  await page.getByRole('button', { name: 'Sign In to TASCORA', exact: true }).click();
  await expect(page.locator('#auth-error')).toBeVisible();
  await email.fill('buyer@example.test'); await page.getByRole('button', { name: 'Sign In to TASCORA', exact: true }).click();
  await expect(page).toHaveURL(/dashboard/);
});
test('registration validates confirmation and retains verification status', async ({ page }) => {
  await page.goto('/en/register');
  await page.getByLabel(/^Work email$/i).fill('new@example.test');
  await page.getByLabel('Password', { exact: true }).fill('E2E-password-123!');
  await page.getByLabel(/^Confirm password$/i).fill('different-password');
  await page.getByRole('button', { name: /Create.*Account/ }).click();
  await expect(page.locator('#auth-error')).toBeVisible();
  await page.getByLabel(/^Confirm password$/i).fill('E2E-password-123!');
  await page.getByRole('button', { name: /Create.*Account/ }).click();
  await expect(page.getByRole('status').filter({ hasText: /verify|verification/i }).first()).toBeVisible();
});
