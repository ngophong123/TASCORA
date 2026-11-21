import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

const BATCH1_DOCS = [
  'README.md',
  'docs/PROJECT_CURRENT_STATE.md',
  'docs/STAGING_RUNBOOK.md',
  'docs/STAGING_READINESS_REPORT.md',
  'docs/ARCHITECTURE.md',
  'docs/FINANCIAL_ARCHITECTURE.md',
  'docs/IMPLEMENTATION_STATUS.md',
  'docs/KNOWN_LIMITATIONS.md',
  'docs/EMPLOYER_REVIEW_PREVIEW.md',
  'docs/FRONTEND_AUDIT.md',
  'docs/FRONTEND_ARCHITECTURE.md',
  'docs/adr/README.md',
  'docs/adr/001-modular-monolith-pnpm-workspaces.md',
  'docs/adr/002-append-only-financial-ledger-and-idempotency.md',
  'docs/adr/003-kyc-envelope-encryption-and-hmac-blind-index.md',
  'docs/adr/004-fail-closed-clamav-quarantine.md',
  'docs/internal/STAGING_MANUAL_STEPS.md',
  'docs/internal/GITHUB_PORTFOLIO_DRAFTS.md',
  'docs/internal/AGENT_STATE.md',
  'docs/internal/BATCH1_BRIEF.md',
  'docs/reports/phase-0.md',
  'docs/reports/phase-4a7.md',
  'docs/reports/phase-5a.md',
  'docs/reports/phase-fe1.md',
  'docs/reports/phase-fe2.md',
];

const PUBLIC_PORTFOLIO_DOCS = [
  'README.md',
  'docs/ARCHITECTURE.md',
  'docs/FINANCIAL_ARCHITECTURE.md',
  'docs/IMPLEMENTATION_STATUS.md',
  'docs/KNOWN_LIMITATIONS.md',
  'docs/FRONTEND_ARCHITECTURE.md',
  'docs/adr/README.md',
  'docs/adr/001-modular-monolith-pnpm-workspaces.md',
  'docs/adr/002-append-only-financial-ledger-and-idempotency.md',
  'docs/adr/003-kyc-envelope-encryption-and-hmac-blind-index.md',
  'docs/adr/004-fail-closed-clamav-quarantine.md',
];

function readDoc(relPath: string): string {
  return fs.readFileSync(path.join(repoRoot, relPath), 'utf8');
}

describe('Batch 1 documentation-to-code truthfulness invariants', () => {
  it('uses exact PAYMENTS_PROVIDER env var name and never singular PAYMENT_PROVIDER', () => {
    const paymentProviderCode = fs.readFileSync(
      path.join(repoRoot, 'apps/api/src/lib/payment-provider.ts'),
      'utf8'
    );
    expect(paymentProviderCode).toContain('process.env.PAYMENTS_PROVIDER');

    for (const doc of BATCH1_DOCS) {
      const content = readDoc(doc);
      expect(content, `Unexpected singular PAYMENT_PROVIDER in ${doc}`).not.toMatch(
        /\bPAYMENT_PROVIDER\b/
      );
    }
  });

  it('references real health endpoints (/health and /health/live) and never non-existent /ready', () => {
    const healthCode = fs.readFileSync(path.join(repoRoot, 'apps/api/src/lib/health.ts'), 'utf8');
    expect(healthCode).toContain("'/health/live'");
    expect(healthCode).toContain("'/health'");
    expect(healthCode).not.toContain("'/ready'");

    for (const doc of BATCH1_DOCS) {
      const content = readDoc(doc);
      expect(content, `Non-existent /ready endpoint referenced in ${doc}`).not.toMatch(/\/ready\b/);
    }
  });

  it('matches actual backend module count and installed frontend dependencies', () => {
    const modulesDir = path.join(repoRoot, 'apps/api/src/modules');
    const actualModules = fs
      .readdirSync(modulesDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory());

    const architectureDoc = readDoc('docs/ARCHITECTURE.md');
    expect(architectureDoc).toContain(`${actualModules.length} domain modules`);

    const webPkg = JSON.parse(
      fs.readFileSync(path.join(repoRoot, 'apps/web/package.json'), 'utf8')
    ) as { dependencies: Record<string, string> };
    const readme = readDoc('README.md');
    expect(readme).not.toContain('Radix UI');
    expect(webPkg.dependencies).toHaveProperty('@base-ui/react');
    expect(readme).toContain('@base-ui/react');
  });

  it('has zero broken relative Markdown links across all Batch 1 docs and zero buzzwords in public docs', () => {
    for (const doc of BATCH1_DOCS) {
      const full = path.join(repoRoot, doc);
      const dir = path.dirname(full);
      const content = fs.readFileSync(full, 'utf8');
      for (const match of content.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
        const href = match[1]?.trim() || '';
        if (/^(https?:|mailto:|#)/.test(href)) continue;
        const clean = href.split('#')[0];
        if (!clean) continue;
        expect(
          fs.existsSync(path.resolve(dir, clean)),
          `Broken link in ${doc}: ${href}`
        ).toBe(true);
      }
    }

    const buzzwordRe =
      /\b(production-ready|production-grade|enterprise-grade|fully scalable|secure by design|100% secure|zero-bug)\b/i;
    for (const doc of PUBLIC_PORTFOLIO_DOCS) {
      expect(readDoc(doc), `Buzzword found in ${doc}`).not.toMatch(buzzwordRe);
    }
  });

  it('accurately references Phase 0 dead CommandPalette route (/dashboard/gigs/create, not /dashboard/wallet)', () => {
    for (const doc of [
      'docs/FRONTEND_AUDIT.md',
      'docs/reports/phase-fe1.md',
      'docs/internal/GITHUB_PORTFOLIO_DRAFTS.md',
      'docs/internal/BATCH1_BRIEF.md',
    ]) {
      const content = readDoc(doc);
      expect(content, `Stale /dashboard/wallet reference in ${doc}`).not.toContain(
        '/dashboard/wallet'
      );
      expect(content, `Expected /dashboard/gigs/create in ${doc}`).toContain(
        '/dashboard/gigs/create'
      );
    }
  });
});
