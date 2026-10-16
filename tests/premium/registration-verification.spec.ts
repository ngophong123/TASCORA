import { test, expect } from '../e2e/support/live-fixtures';

test.beforeEach(async ({ page }) => {
  await page.context().route('**/*', route => ['localhost', '127.0.0.1'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
  // Override the marketplace fixture's signed-in default in either init order.
  await page.addInitScript(() => { localStorage.setItem('user', 'null'); localStorage.removeItem('token'); });
});

const locales = [
  { locale: 'en', email: 'Work Email', password: 'Password', confirmation: 'Confirm Password', create: 'Create Client Account', created: 'Account created', instruction: 'Check your email and verify your account before signing in.', resendLink: 'Resend verification', verifyTitle: 'Verify your email', verifyEmail: 'Email address', resend: 'Resend verification email', resendError: 'Unable to send verification. Please retry later.', resent: 'If your account needs verification, an email will be sent.', verify: 'Verify email', invalid: 'This verification link is invalid or expired.', verified: 'Email verified. You can now sign in.' },
  { locale: 'vi', email: 'Email công việc', password: 'Mật khẩu', confirmation: 'Xác nhận mật khẩu', create: 'Tạo tài khoản Khách hàng', created: 'Đã tạo tài khoản', instruction: 'Vui lòng kiểm tra email và xác minh tài khoản trước khi đăng nhập.', resendLink: 'Gửi lại email xác minh', verifyTitle: 'Xác minh email của bạn', verifyEmail: 'Địa chỉ email', resend: 'Gửi lại email xác minh', resendError: 'Không thể gửi email xác minh. Vui lòng thử lại sau.', resent: 'Nếu tài khoản của bạn cần xác minh, email sẽ được gửi đến bạn.', verify: 'Xác minh email', invalid: 'Liên kết xác minh không hợp lệ hoặc đã hết hạn.', verified: 'Email đã được xác minh. Bạn có thể đăng nhập.' },
];

for (const copy of locales) {
  test(`registration stays unauthenticated and offers localized resend in ${copy.locale}`, async ({ page }) => {
    let registrationCalls = 0, loginCalls = 0, resendCalls = 0;
    page.on('request', request => { if (request.url().endsWith('/auth/login')) loginCalls++; });
    await page.route('**/api/v1/auth/register', async route => {
      expect(route.request().postDataJSON()).toMatchObject({ email: 'pending@example.test', role: 'buyer' });
      registrationCalls++;
      await route.fulfill({ status: 201, json: { success: true, data: { id: 'registered-test', email: 'pending@example.test', verificationRequired: true } } });
    });
    await page.route('**/api/v1/auth/resend-verification', async route => {
      expect(route.request().postDataJSON()).toEqual({ email: 'pending@example.test' });
      resendCalls++;
      await route.fulfill({ status: resendCalls === 1 ? 503 : 200, json: { success: resendCalls > 1 } });
    });
    await page.goto(`/${copy.locale}/register`);
    await page.getByLabel(copy.email, { exact: true }).fill('pending@example.test');
    await page.getByLabel(copy.password, { exact: true }).fill('Test-password-123!');
    await page.getByLabel(copy.confirmation, { exact: true }).fill('Test-password-123!');
    await page.getByRole('button', { name: copy.create, exact: true }).click();
    await expect(page.getByRole('button', { name: copy.created, exact: true })).toBeDisabled();
    await expect(page.getByRole('status').filter({ hasText: copy.instruction })).toBeVisible();
    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByText(/Redirecting to your workspace|Đang chuyển hướng đến không gian làm việc/)).toHaveCount(0);
    expect(registrationCalls).toBe(1);
    expect(loginCalls).toBe(0);
    expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('user') || 'null'))).toBeNull();
    await page.getByRole('link', { name: copy.resendLink, exact: true }).click();
    await expect(page).toHaveURL(url => url.pathname === (copy.locale === 'vi' ? '/vi/verify-email' : '/verify-email') && !url.searchParams.has('email'));
    await expect(page.getByRole('heading', { name: copy.verifyTitle })).toBeVisible();
    await page.getByLabel(copy.verifyEmail, { exact: true }).fill('pending@example.test');
    await page.getByRole('button', { name: copy.resend, exact: true }).click();
    await expect(page.getByRole('status')).toContainText(copy.resendError);
    await page.getByRole('button', { name: copy.resend, exact: true }).click();
    await expect(page.getByRole('status')).toContainText(copy.resent);
    expect(resendCalls).toBe(2);
    expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull();
  });

  test(`verification failure and success remain localized without automatic login in ${copy.locale}`, async ({ page }) => {
    let calls = 0;
    await page.route('**/api/v1/auth/verify-email', async route => {
      expect(route.request().postDataJSON()).toEqual({ token: 'a'.repeat(64) });
      calls++;
      await route.fulfill({ status: calls === 1 ? 400 : 200, json: { success: calls > 1 } });
    });
    await page.goto(`/${copy.locale}/verify-email?token=${'a'.repeat(64)}`);
    await page.getByRole('button', { name: copy.verify, exact: true }).click();
    await expect(page.getByRole('status')).toContainText(copy.invalid);
    await page.getByRole('button', { name: copy.verify, exact: true }).click();
    await expect(page.getByRole('status')).toContainText(copy.verified);
    await expect(page).toHaveURL(/verify-email\?token=/);
    expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull();
  });
}
