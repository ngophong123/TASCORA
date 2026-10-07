import { test, expect } from '../support/live-fixtures';
import type { Page } from '@playwright/test';
const message = 'Payments are temporarily unavailable in this environment.';
async function disable(page: Page) {
  await page.route('**/api/v1/payments/capabilities', route => route.fulfill({
    json: { success: true, data: { provider: 'disabled', status: 'disabled', available: false, providerValidated: false, externalPayoutsAvailable: false } },
    headers: { 'Access-Control-Allow-Origin': 'http://localhost:3000', 'Access-Control-Allow-Credentials': 'true' },
  }));
}
async function open(page: Page, id: string) {
  await page.goto('/dashboard/orders');
  await page.locator(`[data-testid="order-row-${id}"]:visible, [data-testid="order-card-${id}"]:visible`).getByText(id, { exact: true }).click();
}
async function login(page: Page, actor: string) {
  await page.goto('/login');
  await page.locator('input[placeholder="name@company.com"]').fill(`${actor}@example.test`);
  await page.locator('input[type="password"]').first().fill('E2E-password-123!');
  await page.getByRole('button', { name: 'Sign In to TASCORA', exact: true }).click();
  await expect(page).toHaveURL(/dashboard/);
}
test('disabled payments keep service browsing available and prevent checkout/order creation', async ({ page, marketplace }) => {
  await disable(page);
  const ordersBefore = marketplace.orders.length;
  const providerRequests: string[] = [];
  page.on('request', req => { if (req.method() === 'POST' && /\/orders$|\/payments\//.test(req.url())) providerRequests.push(req.url()); });
  await page.goto('/services/srv-1');
  await expect(page.getByTestId('service-title')).toBeVisible();
  await expect(page.getByText(message, { exact: true })).toBeVisible();
  await expect(page.getByTestId('continue-order-btn')).toBeDisabled();
  await expect(page.getByTestId('checkout-drawer')).toHaveCount(0);
  expect(marketplace.orders).toHaveLength(ordersBefore); expect(providerRequests).toEqual([]);
});
test('disabled pending payment never loads Stripe or advances financial state', async ({ page, marketplace }) => {
  await disable(page);
  const order = marketplace.orders[0]!; order.status = 'PENDING';
  const requests: string[] = [];
  page.on('request', req => { if (/js\.stripe\.com|\/payments\/create-intent|\/test-provider\//.test(req.url())) requests.push(req.url()); });
  await open(page, order.id);
  await expect(page.getByText(message, { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Prepare payment', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Confirm payment', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Cancel pending payment', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Cancel unpaid order', exact: true })).toBeEnabled();
  expect(order.status).toBe('PENDING'); expect(requests).toEqual([]);
});
test('disabled payments prevent buyer refund requests without affecting existing order visibility', async ({ page, marketplace }) => {
  await disable(page);
  const order = marketplace.orders[0]!; order.status = 'PAID';
  await open(page, order.id);
  await page.getByLabel('Cancellation reason', { exact: true }).fill('Please cancel before work');
  await expect(page.getByRole('button', { name: 'Request full refund before work starts', exact: true })).toBeDisabled();
  await expect(page.getByText(message, { exact: true })).toBeVisible();
  expect(marketplace.refundRequests).toHaveLength(0); expect(order.status).toBe('PAID');
});
test('disabled provider blocks seller reservations and admin provider actions while keeping review accessible', async ({ page, marketplace }) => {
  await disable(page);
  const order = marketplace.orders[0]!;
  order.status = 'COMPLETED'; order.seller = marketplace.users[1]!.sellerProfile!; marketplace.funded.add(order.id);
  const mutations: string[] = [];
  page.on('request', req => { if (req.method() === 'POST' && /\/financial\//.test(req.url())) mutations.push(req.url()); });
  await login(page, 'seller'); await page.goto('/dashboard/earnings');
  await expect(page.getByTestId('earnings-available')).toHaveText('$225.00 USD');
  await expect(page.getByRole('button', { name: 'Request payout for order', exact: true })).toBeDisabled();
  expect(marketplace.payouts).toHaveLength(0);
  await login(page, 'admin'); await page.goto('/dashboard/admin');
  await page.getByLabel('Order ID', { exact: true }).fill(order.id);
  await page.getByLabel('Resolution / refund reason').fill('Review without provider execution');
  await page.getByLabel('Refund amount (USD)').fill('10.00');
  await expect(page.getByRole('button', { name: 'Inspect financial order', exact: true })).toBeEnabled();
  for (const name of ['Resolve for buyer / request refund', 'Request controlled refund', 'Check provider reconciliation']) {
    await expect(page.getByRole('button', { name, exact: true })).toBeDisabled();
  }
  await expect(page.getByText(message, { exact: true })).toBeVisible();
  expect(mutations).toEqual([]); expect(marketplace.refundRequests).toHaveLength(0);
});
