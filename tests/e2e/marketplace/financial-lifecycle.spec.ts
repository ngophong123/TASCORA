import { test, expect } from '../support/live-fixtures';
import { GigDetailPage } from '../pages/GigDetailPage';
import type { Page } from '@playwright/test';
async function login(page: Page, actor: string) {
  await page.goto('/login'); await page.locator('input[placeholder="name@company.com"]').fill(`${actor}@example.test`); await page.locator('input[type="password"]').first().fill('E2E-password-123!'); await page.getByRole('button', { name: 'Sign In to TASCORA', exact: true }).click(); await expect(page).toHaveURL(/dashboard/);
}
async function open(page: Page, id: string) { await page.goto('/dashboard/orders'); await page.locator(`[data-testid="order-row-${id}"]:visible, [data-testid="order-card-${id}"]:visible`).getByText(id, { exact: true }).click(); }
async function createAndFund(page: Page) {
  const service = new GigDetailPage(page); await service.goto('srv-1'); await service.selectPackageTier('basic'); await service.openCheckout(); await service.confirmCheckout();
  await page.getByTestId('view-order-dashboard-btn').click();
  await expect(page).toHaveURL(/\/dashboard\/orders/);
  await expect(page.locator('[data-testid^="order-row-"]:visible, [data-testid^="order-card-"]:visible').first()).toBeVisible();
}
test('buyer payment -> funded seller work -> delivery -> acceptance -> earnings reservation', async ({ page, marketplace }) => {
  await createAndFund(page); const order = marketplace.orders[0]!; await open(page, order.id);
  await page.getByRole('button', { name: 'Prepare payment', exact: true }).click(); await expect(page.getByText('Test provider payment form', { exact: true })).toBeVisible(); await page.getByRole('button', { name: 'Confirm payment', exact: true }).click();
  await expect(page.getByText('Order status: PAID')).toBeVisible(); expect(order.status).toBe('PAID');
  await login(page, 'seller');
  await expect(page.getByRole('heading', { name: 'Seller financial account', exact: true })).toBeVisible();
  await expect(page.getByText('pending: USD 225.00', { exact: true })).toBeVisible();
  await page.goto('/dashboard/earnings'); await expect(page.getByTestId('earnings-pending')).toHaveText('$225.00 USD'); await expect(page.getByTestId('earnings-available')).toHaveText('$0.00 USD');
  await open(page, order.id); await page.getByRole('button', { name: 'Start work', exact: true }).click(); await expect(page.getByText('Order status: IN_PROGRESS')).toBeVisible(); await page.getByLabel('Delivery message').fill('A professional completed delivery'); await page.getByRole('button', { name: 'Submit delivery', exact: true }).click(); await expect(page.getByText('Order status: DELIVERED')).toBeVisible();
  await login(page, 'buyer'); await open(page, order.id); await page.getByRole('button', { name: 'Accept delivery', exact: true }).click(); await expect(page.getByText('Order status: COMPLETED')).toBeVisible();
  await login(page, 'seller'); await page.goto('/dashboard/earnings'); await expect(page.getByTestId('earnings-available')).toHaveText('$225.00 USD'); await page.getByRole('button', { name: 'Request payout for order', exact: true }).click(); await expect(page.getByTestId('earnings-requested')).toHaveText('$225.00 USD'); await expect(page.getByTestId('earnings-paid')).toHaveText('$0.00 USD');
});
test('revision requires reason and persists before seller redelivery', async ({ page, marketplace }) => {
  const order = marketplace.orders.find(o => o.status === 'DELIVERED')!;
  await open(page, order.id); await expect(page.getByRole('button', { name: 'Request revision', exact: true })).toBeDisabled(); await page.getByLabel('Revision instructions').fill('Please adjust the final output'); await page.getByRole('button', { name: 'Request revision', exact: true }).click(); await expect(page.getByText('Order status: IN_REVISION')).toBeVisible();
  expect(order.revisions?.[0]!.message).toBe('Please adjust the final output');
  await login(page, 'seller'); order.seller = marketplace.users[1]!.sellerProfile!; await open(page, order.id); await page.getByRole('button', { name: 'Continue work', exact: true }).click(); await expect(page.getByText('Order status: IN_PROGRESS')).toBeVisible(); await page.getByLabel('Delivery message').fill('Completed requested revision'); await page.getByRole('button', { name: 'Submit delivery', exact: true }).click(); await expect(page.getByText('Order status: DELIVERED')).toBeVisible();
});
test('internal dispute blocks normal acceptance; admin buyer resolution waits for refund confirmation', async ({ page, marketplace }) => {
  const order = marketplace.orders.find(o => o.status === 'DELIVERED')!;
  await open(page, order.id); await page.getByLabel('Dispute reason').fill('Delivery does not match agreement'); await page.getByRole('button', { name: 'Open dispute', exact: true }).click(); await expect(page.getByText('Order status: DISPUTED')).toBeVisible(); await expect(page.getByRole('button', { name: 'Accept delivery', exact: true })).toHaveCount(0);
  await login(page, 'admin'); await page.goto('/dashboard/admin'); await page.getByLabel('Order ID', { exact: true }).fill(order.id); await page.getByLabel('Resolution / refund reason').fill('Buyer evidence supports full refund'); await page.getByRole('button', { name: 'Resolve for buyer / request refund', exact: true }).click(); await expect(page.getByRole('button', { name: 'Process / reconcile refund', exact: true })).toBeVisible(); expect(order.status).toBe('DISPUTED');
  await page.getByRole('button', { name: 'Process / reconcile refund', exact: true }).click(); await expect.poll(() => order.status).toBe('REFUNDED');
  await login(page, 'buyer'); await open(page, order.id); await expect(page.getByText('Order status: REFUNDED')).toBeVisible();
});

test('a confirmed failed payout permits a new request key while an ambiguous request retains its key', async ({ page, marketplace }) => {
  const orderId = marketplace.orders[0]!.id;
  const keys: string[] = [];
  let ambiguous = true, confirmed = false, reserved = false;
  await login(page, 'seller');
  const headers = { 'Access-Control-Allow-Origin': new URL(page.url()).origin, 'Access-Control-Allow-Credentials': 'true' };
  await page.route('**/api/v1/financial/earnings', async route => {
    if (route.request().method() === 'OPTIONS') { await route.fallback(); return; }
    await route.fulfill({ headers, json: { success: true, data: { currency: 'usd', pending: '0.00', available: reserved ? '0.00' : '100.00', requested: reserved ? '100.00' : '0.00', paid: '0.00', payouts: [], availableOrders: reserved ? [] : [{ id: orderId }], providerAvailable: false } } });
  });
  await page.route(`**/api/v1/financial/orders/${orderId}/payouts`, async route => {
    if (route.request().method() === 'OPTIONS') { await route.fallback(); return; }
    keys.push(route.request().postDataJSON().idempotencyKey);
    if (ambiguous) { ambiguous = false; await route.abort(); return; }
    if (confirmed) reserved = true;
    confirmed = true;
    // The first confirmed request immediately receives a simulated provider
    // failure; availability returns. This is test-only, no external payout.
    await route.fulfill({ headers, json: { success: true, data: { id: 'fixture-payout', amount: '100.00', status: reserved ? 'PENDING' : 'FAILED' } } });
  });
  await page.goto('/dashboard/earnings');
  const button = page.getByRole('button', { name: 'Request payout for order', exact: true });
  await button.click(); await expect(page.getByRole('alert').filter({ hasText: 'Retry' })).toBeVisible();
  await button.click(); await expect(page.getByRole('status').filter({ hasText: 'Payout request recorded' })).toBeVisible();
  await expect(button).toBeEnabled(); await button.click();
  await expect(page.getByTestId('earnings-requested')).toHaveText('$100.00 USD');
  expect(keys).toHaveLength(3); expect(keys[1]).toBe(keys[0]); expect(keys[2]).not.toBe(keys[1]);
});
