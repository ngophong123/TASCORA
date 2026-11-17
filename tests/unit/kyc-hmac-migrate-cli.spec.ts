import { describe, expect, it, vi } from 'vitest';
import {
  MAX_CLI_BATCHES,
  MAX_CLI_BATCH_SIZE,
  parseCliArgs,
  runKycHmacMigrateCli,
} from '../../apps/api/src/workers/kyc-hmac-migrate';

describe('kyc-hmac-migrate CLI option validation (HMAC-CLI-01)', () => {
  it('parses valid boolean and bounded integer CLI flags cleanly', () => {
    expect(parseCliArgs(['--dry-run', '--rotate-encryption', '--batch-size=50', '--max-batches=10', '--cursor=kyc_10'])).toEqual({
      dryRun: true,
      verifyOnly: false,
      rotateEncryption: true,
      batchSize: 50,
      maxBatches: 10,
      cursor: 'kyc_10',
    });

    expect(parseCliArgs(['--verify-only', '--batch-size', String(MAX_CLI_BATCH_SIZE), '--max-batches', String(MAX_CLI_BATCHES)])).toEqual({
      dryRun: false,
      verifyOnly: true,
      rotateEncryption: false,
      batchSize: MAX_CLI_BATCH_SIZE,
      maxBatches: MAX_CLI_BATCHES,
      cursor: undefined,
    });
  });

  it('rejects non-finite, zero, negative, decimal, oversized, empty, and malformed numeric CLI options', async () => {
    const invalidCases = [
      ['--batch-size=0'],
      ['--batch-size=-5'],
      ['--batch-size=1.5'],
      ['--batch-size=abc'],
      ['--batch-size=NaN'],
      ['--batch-size=Infinity'],
      ['--batch-size=1e2'],
      [`--batch-size=${MAX_CLI_BATCH_SIZE + 1}`],
      ['--batch-size='],
      ['--batch-size'],
      ['--max-batches=0'],
      ['--max-batches=-1'],
      ['--max-batches=2.5'],
      ['--max-batches=NaN'],
      ['--max-batches=Infinity'],
      [`--max-batches=${MAX_CLI_BATCHES + 1}`],
      ['--max-batches='],
      ['--max-batches'],
      ['--cursor='],
      ['--cursor=   '],
      ['--unknown-flag'],
    ];

    for (const argv of invalidCases) {
      expect(() => parseCliArgs(argv)).toThrow();
    }

    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      const code = await runKycHmacMigrateCli(['--batch-size=NaN']);
      expect(code).toBe(1);
      expect(errSpy).toHaveBeenCalled();
    } finally {
      errSpy.mockRestore();
    }
  });
});
