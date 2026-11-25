import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { scanTextForSecrets, scanTrackedRepository } from '../../scripts/scan-secrets';

describe('Phase 4G Production Readiness Security & Load-Guard Checks', () => {
  it('detects synthetic secrets accurately while allowing documented test fixtures', () => {
    const syntheticStripe = ['sk', 'live', '999988887777666655554444'].join('_');
    const syntheticAws = ['AKIA', '1234567890ABCDEF'].join('');
    const leak = scanTextForSecrets(
      `STRIPE_SECRET_KEY=${syntheticStripe}\nAWS_KEY=${syntheticAws}`,
      'synthetic.env'
    );
    expect(leak.map((f) => f.rule)).toEqual(['stripe-live-secret-key', 'aws-access-key-id']);

    const safeFixture = scanTextForSecrets(
      "vi.stubEnv('STRIPE_SECRET_KEY', 'sk_live_fixture'); // test-only",
      'test.spec.ts'
    );
    expect(safeFixture).toEqual([]);
  });

  it('finds zero accidental live secrets across all tracked repository files', () => {
    const scan = scanTrackedRepository(process.cwd());
    expect(scan.filesScanned).toBeGreaterThan(50);
    expect(scan.findings).toEqual([]);
  });

  it('enforces localhost-only target guard in the k6 load test script', () => {
    const k6Script = fs.readFileSync(
      path.join(process.cwd(), 'tests/load/k6-tascora-local.js'),
      'utf8'
    );
    expect(k6Script).toContain('http://127.0.0.1');
    expect(k6Script).toContain('Refusing load test against non-local target');
  });
});
