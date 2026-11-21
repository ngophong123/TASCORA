import { Writable } from 'node:stream';
import { describe, expect, it } from 'vitest';
import { createAppLogger } from '../../apps/api/src/lib/logger';

describe('Phase 4D Correlation Logging & Secret/PII Redaction', () => {
  it('emits structured JSON logs with correlationId while redacting passwords, tokens, cookies, and KYC PII', () => {
    const chunks: string[] = [];
    const sink = new Writable({
      write(chunk, _encoding, cb) {
        chunks.push(chunk.toString('utf8'));
        cb();
      },
    });

    const testLogger = createAppLogger(sink);
    const child = testLogger.child({ correlationId: 'corr-4d-audit-12345' });

    child.info(
      {
        password: 'SuperSecretPassword123!',
        refreshToken: 'rt_secret_token_999',
        documentNumber: 'ID-99887766',
        dateOfBirth: '1992-05-14',
        headers: {
          authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.secret.sig',
          cookie: 'refreshToken=abc123',
        },
        safeAction: 'order_viewed',
      },
      'Correlated request event'
    );

    const output = chunks.join('');
    expect(output).toContain('corr-4d-audit-12345');
    expect(output).toContain('order_viewed');
    expect(output).toContain('[REDACTED]');

    for (const forbidden of [
      'SuperSecretPassword123!',
      'rt_secret_token_999',
      'ID-99887766',
      '1992-05-14',
      'eyJhbGciOiJIUzI1NiJ9.secret.sig',
      'refreshToken=abc123',
    ]) {
      expect(output).not.toContain(forbidden);
    }
  });
});
