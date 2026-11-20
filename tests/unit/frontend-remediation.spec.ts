import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  resolvePostLoginRedirect,
  sanitizeRedirectPath,
} from '../../apps/web/src/lib/auth-redirect';

const webRoot = path.resolve(process.cwd(), 'apps/web');

function readWebFile(relPath: string): string {
  return fs.readFileSync(path.join(webRoot, relPath), 'utf8');
}

describe('Phase FE.2 frontend remediation regressions', () => {
  it('FE-103: preserves locale prefix and prevents open redirects after login', () => {
    expect(sanitizeRedirectPath(null)).toBe('/dashboard');
    expect(sanitizeRedirectPath('https://evil.example/phish')).toBe('/dashboard');
    expect(sanitizeRedirectPath('//evil.example/phish')).toBe('/dashboard');
    expect(sanitizeRedirectPath('/\\evil.example')).toBe('/dashboard');
    expect(sanitizeRedirectPath('/dashboard/orders?orderId=123')).toBe('/dashboard/orders?orderId=123');

    expect(resolvePostLoginRedirect(null, 'BUYER', 'vi')).toBe('/vi/dashboard');
    expect(resolvePostLoginRedirect(null, 'SELLER', 'vi')).toBe('/vi/seller/dashboard');
    expect(resolvePostLoginRedirect(null, 'SELLER', 'en')).toBe('/en/seller/dashboard');
    expect(resolvePostLoginRedirect('/dashboard/orders?orderId=o1', 'BUYER', 'vi')).toBe(
      '/vi/dashboard/orders?orderId=o1'
    );
    expect(resolvePostLoginRedirect('/vi/dashboard/messages', 'BUYER', 'vi')).toBe(
      '/vi/dashboard/messages'
    );
    expect(resolvePostLoginRedirect('https://evil.example', 'SELLER', 'vi')).toBe(
      '/vi/seller/dashboard'
    );
  });

  it('FE-101 & FE-102: orders page consumes ?orderId= deep links and freelancer CTA links to /dashboard/gigs/new', () => {
    const ordersPage = readWebFile('src/app/[locale]/dashboard/orders/page.tsx');
    expect(ordersPage).toContain('useSearchParams');
    expect(ordersPage).toContain('searchParams.get("orderId")');
    expect(ordersPage).toContain('href="/dashboard/gigs/new"');
    expect(ordersPage).not.toContain('href="/dashboard/gigs"\n');
  });

  it('FE-104: orphaned mock financial and dashboard components are removed', () => {
    const removedPaths = [
      'src/components/dashboard/payments/ClientPaymentMethods.tsx',
      'src/components/dashboard/payments/BalanceCards.tsx',
      'src/components/dashboard/payments/RevenueBarChart.tsx',
      'src/components/dashboard/payments/TransactionsTable.tsx',
      'src/components/dashboard/overview/ProfileStrengthCard.tsx',
      'src/components/dashboard/overview/RecommendedSpecialists.tsx',
      'src/components/dashboard/overview/RevenueAreaChart.tsx',
      'src/data/dashboard/payments.ts',
      'src/data/dashboard/notifications.ts',
      'src/data/dashboard/saved.ts',
    ];
    for (const rel of removedPaths) {
      expect(fs.existsSync(path.join(webRoot, rel))).toBe(false);
    }
  });

  it('FE-105: seller dashboard relies on apiFetch cookie auth instead of premature localStorage rejection', () => {
    const sellerPage = readWebFile('src/app/[locale]/seller/dashboard/page.tsx');
    expect(sellerPage).not.toContain('localStorage.getItem("user")');
    expect(sellerPage).toContain('apiFetch("/api/v1/analytics/seller/dashboard")');
  });

  it('FE-106 & FE-107: active dashboard and service detail files have zero nested <Link><Button> pairs and no duplicate pause action', () => {
    const checkedFiles = [
      'src/app/[locale]/dashboard/gigs/page.tsx',
      'src/components/dashboard/gigs/GigsList.tsx',
      'src/components/dashboard/gigs/GigWizard.tsx',
      'src/app/[locale]/dashboard/messages/page.tsx',
      'src/app/[locale]/services/[id]/page.tsx',
    ];
    for (const rel of checkedFiles) {
      const content = readWebFile(rel);
      const linkBlocks = [...content.matchAll(/<Link\b[^>]*>([\s\S]*?)<\/Link>/g)];
      const nested = linkBlocks.filter((m) => /<(?:Button|button)\b/.test(m[1] || ''));
      expect(nested, `Expected no nested button inside Link in ${rel}`).toHaveLength(0);
    }

    const gigsList = readWebFile('src/components/dashboard/gigs/GigsList.tsx');
    expect(gigsList).not.toContain('handleDelete');
  });

  it('FE-108 & FE-109 & FE-201 & FE-202 & FE-203 & FE-301: admin feedback, button defaults, toast accuracy, shell nav, and vi parity', () => {
    const adminPage = readWebFile('src/app/[locale]/dashboard/admin/page.tsx');
    expect(adminPage).toContain('setStatusMessage');
    expect(adminPage).toContain('type="submit"');
    expect(adminPage).toContain('type="button"');

    const buttonComponent = readWebFile('src/components/ui/button.tsx');
    expect(buttonComponent).not.toContain('Thành công');
    expect(buttonComponent).not.toContain('Thử lại');
    expect(buttonComponent).toContain('"Success"');
    expect(buttonComponent).toContain('"Retry"');

    const dashboardContext = readWebFile('src/context/DashboardContext.tsx');
    expect(dashboardContext).toContain('External seller payouts remain unavailable.');
    expect(dashboardContext).not.toContain('Financial settlement is unavailable.');

    const sidebar = readWebFile('src/components/dashboard/shell/DashboardSidebar.tsx');
    const mobileNav = readWebFile('src/components/dashboard/shell/MobileDashboardNav.tsx');
    expect(sidebar).toContain('href="/dashboard/admin"');
    expect(mobileNav).toContain('href="/dashboard/admin"');
    expect(mobileNav).toContain('disabled={!account?.sellerProfile}');

    const liveEarnings = readWebFile('src/components/dashboard/payments/LiveEarnings.tsx');
    expect(liveEarnings).toContain('type="button"');
    expect(liveEarnings).toContain('min-h-11');

    const enMessages = JSON.parse(readWebFile('messages/en.json')) as Record<string, unknown>;
    const viMessages = JSON.parse(readWebFile('messages/vi.json')) as {
      freelancerProfile: { directory: string };
    };
    expect(viMessages.freelancerProfile.directory).toBe('Chợ dịch vụ');
    expect(Object.keys(enMessages).sort()).toEqual(Object.keys(viMessages).sort());
  });
});
