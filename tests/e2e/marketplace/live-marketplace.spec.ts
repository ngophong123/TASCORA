import { test, expect } from '../support/live-fixtures';
import { GigDetailPage } from '../pages/GigDetailPage';
import type { Page } from '@playwright/test';
const orderItem = (page: Page, id: string) => page.locator(`[data-testid="order-row-${id}"]:visible, [data-testid="order-card-${id}"]:visible`);
const openOrder = (page: Page, id: string) => orderItem(page, id).getByText(id, { exact: true }).click();
async function openChat(page: Page) {
  await page.goto('/dashboard/messages');
  if ((page.viewportSize()?.width || 1280) < 1024) await page.locator('[data-testid^="conversation-item-"]').first().click();
  await expect.poll(() => page.evaluate(() => window.innerWidth)).toBe(page.viewportSize()!.width);
}

test('avatar and chat uploads persist server-issued references through reload', async ({ page, marketplace }) => {
  const image = { name: 'test-avatar.png', mimeType: 'image/png', buffer: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0]) };
  await page.goto('/dashboard/settings');
  await page.getByLabel('Avatar (public on your marketplace profile)').setInputFiles(image);
  await expect(page.getByRole('status').filter({ hasText: 'Avatar saved.' })).toBeVisible();
  const reference = marketplace.users[0]!.buyerProfile.avatar!;
  expect(reference).toMatch(/^upload:buyer\//);
  await page.reload();
  expect(marketplace.users[0]!.buyerProfile.avatar).toBe(reference);
  await openChat(page);
  await page.getByLabel('Chat attachment (private to this conversation)').setInputFiles(image);
  await expect(page.getByText('Attachment ready', { exact: true })).toBeVisible();
  await page.getByTestId('message-input').fill('Persistent attachment');
  await page.getByTestId('send-message-btn').click();
  await expect(page.getByTestId('chat-message-bubble').filter({ hasText: 'Persistent attachment' })).toBeVisible();
  expect(marketplace.messages.at(-1)!.attachmentUrl).toBe(reference);
  await page.reload();
  if ((page.viewportSize()?.width || 1280) < 1024) await page.locator('[data-testid^="conversation-item-"]').first().click();
  await expect(page.getByTestId('chat-message-bubble').filter({ hasText: 'Persistent attachment' })).toContainText('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa.png');
});
test('buyer purchase is pending and the same order appears in seller sales', async ({ page, marketplace }) => {
  const detail = new GigDetailPage(page); await detail.goto('srv-1'); await detail.selectPackageTier('basic'); await detail.openCheckout(); await detail.confirmCheckout();
  await expect(detail.checkoutSuccess).toContainText('payment pending');
  const order = marketplace.orders[0]!;
  expect(order.status).toBe('PENDING'); expect(order.amount).toBe('250');
  await page.goto('/dashboard/orders'); await expect(orderItem(page, order.id)).toBeVisible();
  await page.goto('/login'); await page.locator('input[placeholder="name@company.com"]').fill('seller@example.test'); await page.locator('input[type="password"]').fill('E2E-password-123!'); await page.getByRole('button', { name: 'Sign In to TASCORA', exact: true }).click();
  await expect(page).toHaveURL(/seller\/dashboard/); await page.goto('/dashboard/orders');
  await expect(orderItem(page, order.id)).toBeVisible();
});
test('failed catalog and missing detail show errors without substituted sample records', async ({ page }) => {
  await page.route('**/api/v1/services?**', route => route.fulfill({ status: 503, json: { success: false, error: 'Catalog temporarily unavailable' } }));
  await page.goto('/services'); await expect(page.getByRole('alert').filter({ hasText: 'Catalog temporarily unavailable' })).toContainText('Catalog temporarily unavailable'); await expect(page.getByTestId('gig-card')).toHaveCount(0);
  await page.route('**/api/v1/services/missing', route => route.fulfill({ status: 404, json: { success: false, error: 'Service not found' } }));
  await page.goto('/services/missing'); await expect(page.getByRole('alert').filter({ hasText: 'Service not found' })).toContainText('Service not found'); await expect(page.getByTestId('service-title')).toHaveCount(0);
});
test('favorites survive reload and removal persists through the API', async ({ page, marketplace }) => {
  const id = marketplace.services[0]!.id;
  marketplace.favorites.add(id);
  await page.goto('/dashboard/saved'); await expect(page.getByText(marketplace.services[0]!.title, { exact: true })).toBeVisible();
  await page.reload(); await expect(page.getByText(marketplace.services[0]!.title, { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /^Remove saved service/ }).first().click();
  await expect(page.getByText('You have no saved gigs.')).toBeVisible(); expect(marketplace.favorites.size).toBe(0);
});
test('completed order review persists and is displayed after reload', async ({ page, marketplace }) => {
  const order = marketplace.orders.find(o => o.status === 'COMPLETED')!;
  await page.goto('/dashboard/orders'); await openOrder(page, order.id);
  await page.getByLabel('Review', { exact: true }).fill('Professional delivery and excellent communication.'); await page.getByRole('button', { name: 'Submit review', exact: true }).click();
  await expect(page.getByText('Review: 5/5 · Professional delivery and excellent communication.')).toBeVisible();
  expect(order.review?.comment).toContain('Professional delivery');
  await page.reload(); await openOrder(page, order.id); await expect(page.getByText('Review: 5/5 · Professional delivery and excellent communication.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Submit review', exact: true })).toHaveCount(0);
});
test('chat reload retains sent messages without generated partner replies', async ({ page, marketplace }) => {
  await openChat(page); await page.getByTestId('message-input').fill('Persist this marketplace message'); await page.getByTestId('send-message-btn').click();
  await expect(page.getByText('Escrow Protected', { exact: true })).toHaveCount(0);
  await expect(page.getByText(/End-to-end encrypted collaboration/)).toHaveCount(0);
  await expect(page.getByTestId('chat-message-bubble').filter({ hasText: 'Persist this marketplace message' })).toBeVisible();
  await page.reload(); if ((page.viewportSize()?.width || 1280) < 1024) await page.locator('[data-testid^="conversation-item-"]').first().click(); await expect(page.getByTestId('chat-message-bubble').filter({ hasText: 'Persist this marketplace message' })).toBeVisible();
  expect(marketplace.messages).toHaveLength(2);
  await expect(page.getByText('Thanks for the update! I will incorporate this immediately into our deployment checklist.')).toHaveCount(0);
});

test('order amounts retain cents in the list and order detail', async ({ page, marketplace }) => {
  const order = marketplace.orders[0]!; order.amount = '250.29';
  await page.goto('/dashboard/orders');
  await expect(orderItem(page, order.id)).toContainText('$250.29');
  await openOrder(page, order.id);
  await expect(page.getByText('Total: $250.29', { exact: true })).toBeVisible();
  await expect(page.getByRole('dialog').getByText('$250.29', { exact: true })).toBeVisible();
  await expect(page.getByText(/Locked in Escrow/)).toHaveCount(0);
});
test('financial pages cannot fabricate balances or confirm withdrawals', async ({ page }) => {
  await page.goto('/dashboard/earnings'); await expect(page.getByRole('alert').filter({ hasText: 'Fixture request rejected' })).toBeVisible(); await expect(page.getByRole('button', { name: 'Withdraw Funds' })).toHaveCount(0);
  await page.goto('/dashboard/payments'); await expect(page.getByText(/Stored payment methods and invoices are unavailable/)).toBeVisible(); await expect(page.getByRole('button', { name: 'Fund Escrow' })).toHaveCount(0);
});
test('seller onboarding survives reload and admin approval is deliberate', async ({ page, marketplace }) => {
  marketplace.users[1]!.sellerProfile!.status = 'DRAFT';
  await page.goto('/login'); await page.locator('input[placeholder="name@company.com"]').fill('seller@example.test'); await page.locator('input[type="password"]').first().fill('E2E-password-123!'); await page.locator('form button[type="submit"]').first().click();
  await expect(page).toHaveURL(/seller\/dashboard/);
  await page.getByLabel('First name', { exact: true }).fill('Persistent'); await page.getByLabel('Hourly rate', { exact: true }).fill('12.50'); await page.getByRole('button', { name: 'Save profile', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Profile saved.' })).toBeVisible();
  await page.reload(); await expect(page.getByLabel('First name', { exact: true })).toHaveValue('Persistent');
  await page.getByRole('button', { name: 'Submit seller profile for review', exact: true }).click();
  await expect(page.getByText('Seller profile submitted for review.', { exact: true })).toBeVisible();
  expect(marketplace.users[1]!.sellerProfile!.status).toBe('PENDING_REVIEW');
  await page.goto('/login'); await page.locator('input[placeholder="name@company.com"]').fill('admin@example.test'); await page.locator('input[type="password"]').first().fill('E2E-password-123!'); await page.locator('form button[type="submit"]').first().click();
  await expect(page).toHaveURL(/dashboard/); await page.goto('/dashboard/admin'); await page.getByRole('button', { name: 'Approve seller', exact: true }).click();
  await expect(page.getByText('No seller profiles awaiting review.')).toBeVisible(); expect(marketplace.users[1]!.sellerProfile!.status).toBe('APPROVED');
});
test('service editing persists a draft and only admin publication makes it public', async ({ page, marketplace }) => {
  const service = marketplace.services[0]!;
  await page.goto('/login'); await page.locator('input[placeholder="name@company.com"]').fill('seller@example.test'); await page.locator('input[type="password"]').first().fill('E2E-password-123!'); await page.locator('form button[type="submit"]').first().click(); await expect(page).toHaveURL(/seller\/dashboard/);
  await page.goto(`/dashboard/gigs/${service.id}/edit`); const title = page.getByTestId('wizard-gig-title-input'); await expect(title).toHaveValue(service.title); await title.fill('A persistently edited marketplace service');
  await expect.poll(() => page.evaluate(() => window.innerWidth)).toBe(page.viewportSize()!.width);
  await page.getByTestId('wizard-step-5').click(); await page.getByTestId('wizard-publish-btn').click(); await expect(page).toHaveURL(/dashboard\/gigs$/);
  expect(service.status).toBe('DRAFT'); expect(service.title).toBe('A persistently edited marketplace service');
  await page.goto('/login'); await page.locator('input[placeholder="name@company.com"]').fill('admin@example.test'); await page.locator('input[type="password"]').first().fill('E2E-password-123!'); await page.locator('form button[type="submit"]').first().click();
  await expect(page).toHaveURL(/dashboard/); await page.goto('/dashboard/admin'); await page.getByRole('button', { name: 'Publish service', exact: true }).click();
  await expect(page.getByText('No eligible service drafts awaiting review.')).toBeVisible(); expect(service.status).toBe('PUBLISHED');
  await page.goto(`/services/${service.id}`); await expect(page.getByTestId('service-title')).toHaveText(service.title);
});
