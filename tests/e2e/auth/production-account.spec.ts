import { test, expect } from '../support/live-fixtures';

test('email verification uses the API and shows a sign-in result', async ({ page }) => {
  await page.route('**/api/v1/auth/verify-email', async route => {
    expect(route.request().postDataJSON().token).toBe('a'.repeat(64));
    await route.fulfill({ json: { success: true } });
  });
  await page.goto(`/verify-email?token=${'a'.repeat(64)}`);
  await page.getByRole('button', { name: 'Verify email', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Email verified');
});

test('expired access refreshes once and customer profile changes use the live endpoint', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('token', 'expired-test-access');
    localStorage.setItem('user', JSON.stringify({ id: 'test-user', email: 'customer@example.com', role: 'BUYER' }));
  });
  let refreshed = 0;
  await page.route('**/api/v1/auth/refresh', async route => {
    refreshed++;
    expect(route.request().headers()['x-csrf-protection']).toBe('1');
    await route.fulfill({ json: { success: true, data: { accessToken: 'fresh-test-access', user: { id: 'test-user', email: 'customer@example.com', role: 'BUYER' } } } });
  });
  await page.route('**/api/v1/profile/me', async route => {
    if (route.request().headers().authorization !== 'Bearer fresh-test-access') { await route.fulfill({ status: 401, json: { success: false } }); return; }
    await route.fulfill({ json: { success: true, data: { email: 'customer@example.com', buyerProfile: { firstName: 'Customer', lastName: 'Account', bio: 'A customer' }, sellerProfile: null } } });
  });
  await page.route('**/api/v1/profile/buyer', async route => {
    expect(route.request().headers().authorization).toBe('Bearer fresh-test-access');
    expect(route.request().postDataJSON().firstName).toBe('Updated');
    await route.fulfill({ json: { success: true } });
  });
  await page.goto('/dashboard');
  await expect(page.getByText('customer@example.com', { exact: true })).toBeVisible();
  await page.getByLabel('First name', { exact: true }).fill('Updated');
  await page.getByRole('button', { name: 'Save profile', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Profile saved.' })).toBeVisible();
  expect(refreshed).toBe(1);
});
