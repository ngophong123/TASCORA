import '../lib/config';
import { prisma } from '../lib/prisma';
import { KycHmacMigrationService } from '../modules/kyc/kyc-hmac-migration.service';

export const MAX_CLI_BATCH_SIZE = 500;
export const MAX_CLI_BATCHES = 100_000;

export interface ParsedKycHmacMigrateArgs {
  dryRun: boolean;
  verifyOnly: boolean;
  rotateEncryption: boolean;
  batchSize?: number;
  maxBatches?: number;
  cursor?: string;
}

function parsePositiveIntOption(flagName: string, rawValue: string, max: number): number {
  if (!/^\d+$/.test(rawValue)) {
    throw new Error(`Invalid ${flagName} value "${rawValue}": expected an integer between 1 and ${max}`);
  }
  const parsed = Number(rawValue);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > max) {
    throw new Error(`Invalid ${flagName} value "${rawValue}": expected an integer between 1 and ${max}`);
  }
  return parsed;
}

export function parseCliArgs(argv: string[]): ParsedKycHmacMigrateArgs {
  let dryRun = false;
  let verifyOnly = false;
  let rotateEncryption = false;
  let batchSize: number | undefined;
  let maxBatches: number | undefined;
  let cursor: string | undefined;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]!;
    if (arg === '--dry-run') {
      dryRun = true;
    } else if (arg === '--verify-only') {
      verifyOnly = true;
    } else if (arg === '--rotate-encryption') {
      rotateEncryption = true;
    } else if (arg === '--batch-size' || arg.startsWith('--batch-size=')) {
      const value = arg.startsWith('--batch-size=') ? arg.slice('--batch-size='.length) : argv[++i];
      if (value === undefined) {
        throw new Error('Missing value for --batch-size');
      }
      batchSize = parsePositiveIntOption('--batch-size', value, MAX_CLI_BATCH_SIZE);
    } else if (arg === '--max-batches' || arg.startsWith('--max-batches=')) {
      const value = arg.startsWith('--max-batches=') ? arg.slice('--max-batches='.length) : argv[++i];
      if (value === undefined) {
        throw new Error('Missing value for --max-batches');
      }
      maxBatches = parsePositiveIntOption('--max-batches', value, MAX_CLI_BATCHES);
    } else if (arg === '--cursor' || arg.startsWith('--cursor=')) {
      const value = arg.startsWith('--cursor=') ? arg.slice('--cursor='.length) : argv[++i];
      const trimmed = value?.trim();
      if (!trimmed) {
        throw new Error('Invalid --cursor value: cursor must not be empty');
      }
      cursor = trimmed;
    } else {
      throw new Error(`Unknown CLI argument: ${arg}`);
    }
  }

  return { dryRun, verifyOnly, rotateEncryption, batchSize, maxBatches, cursor };
}

export async function runKycHmacMigrateCli(argv: string[]): Promise<number> {
  let args: ParsedKycHmacMigrateArgs;
  try {
    args = parseCliArgs(argv);
  } catch (err) {
    console.error(err instanceof Error ? err.message : 'Invalid CLI arguments');
    return 1;
  }

  try {
    if (args.verifyOnly) {
      try {
        const report = await KycHmacMigrationService.verifyMigrationCompleteness();
        console.log(JSON.stringify({ mode: 'verify-only', ...report }, null, 2));
        return report.readyToRetireLegacyHmac ? 0 : 2;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to verify KYC HMAC migration completeness';
        console.error(message);
        console.log(
          JSON.stringify(
            {
              mode: 'verify-only',
              readyToRetireLegacyHmac: false,
              error: message,
            },
            null,
            2
          )
        );
        return 1;
      }
    }

    const migration = await KycHmacMigrationService.runBatchMigration({
      dryRun: args.dryRun,
      rotateEncryption: args.rotateEncryption,
      batchSize: args.batchSize,
      maxBatches: args.maxBatches,
      cursor: args.cursor,
    });
    const verification = await KycHmacMigrationService.verifyMigrationCompleteness();

    console.log(JSON.stringify({ mode: args.dryRun ? 'dry-run' : 'apply', migration, verification }, null, 2));
    return migration.conflicts.length > 0 || migration.failures.length > 0 ? 1 : 0;
  } finally {
    await prisma.$disconnect().catch(() => undefined);
  }
}

const isDirectExecution =
  !process.env.VITEST &&
  typeof require !== 'undefined' &&
  typeof module !== 'undefined' &&
  require.main === module;

if (isDirectExecution) {
  void runKycHmacMigrateCli(process.argv.slice(2)).then(code => {
    process.exitCode = code;
  });
}
