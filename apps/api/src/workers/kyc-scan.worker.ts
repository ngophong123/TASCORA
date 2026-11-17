import { logger } from '../server';
import { KycService } from '../modules/kyc/kyc.service';

const DEFAULT_SCAN_INTERVAL_MS = 15_000;
const DEFAULT_SCAN_BATCH_SIZE = 10;

let activeTimer: ReturnType<typeof setInterval> | null = null;
let inFlightTick: Promise<void> | null = null;
let stopped = false;

export async function runKycScanWorkerTick(): Promise<void> {
  if (stopped) return;
  if (inFlightTick) {
    return inFlightTick;
  }

  const batchSize = Math.min(
    50,
    Math.max(1, Number(process.env.KYC_SCAN_BATCH_SIZE || DEFAULT_SCAN_BATCH_SIZE))
  );

  inFlightTick = (async () => {
    try {
      const summary = await KycService.processPendingScanBatch({ limit: batchSize });
      if (!summary.skippedUnconfigured && (summary.scanned > 0 || summary.purgedUploads > 0)) {
        logger.info('Processed KYC malware scan batch', summary);
      }
    } catch (error) {
      logger.error('KYC malware scan worker tick failed', {
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      inFlightTick = null;
    }
  })();

  return inFlightTick;
}

export function startKycScanWorker(): void {
  if (activeTimer) return;
  stopped = false;
  const intervalMs = Math.max(
    1_000,
    Number(process.env.KYC_SCAN_INTERVAL_MS || DEFAULT_SCAN_INTERVAL_MS)
  );
  logger.info('Starting KYC malware scan worker', { intervalMs });
  activeTimer = setInterval(() => {
    void runKycScanWorkerTick();
  }, intervalMs);
  activeTimer.unref?.();
}

export async function stopKycScanWorker(): Promise<void> {
  stopped = true;
  if (activeTimer) {
    clearInterval(activeTimer);
    activeTimer = null;
  }
  if (inFlightTick) {
    await inFlightTick;
  }
}
