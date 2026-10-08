import { Router } from 'express';
import { paymentCapability } from './payment-provider';

export function healthRouter(probes: { database: () => Promise<unknown>; redis: () => Promise<unknown> }, deadlineMs = 4000) {
  const router = Router();
  // Reuse unfinished probes so repeated health requests cannot grow queues.
  let inFlight: Promise<void> | undefined;
  router.get('/health/live', (_req, res) => { res.setHeader('Cache-Control', 'no-store'); res.json({ status: 'ok' }); });
  router.get('/health', async (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const payments = paymentCapability();
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      if (!inFlight) {
        inFlight = Promise.allSettled([
          Promise.resolve().then(probes.database), Promise.resolve().then(probes.redis),
        ]).then(results => {
          if (results.some(result => result.status === 'rejected')) throw new Error('Dependency unavailable');
        }).finally(() => { inFlight = undefined; });
      }
      await Promise.race([inFlight, new Promise<never>((_resolve, reject) => {
        timer = setTimeout(() => reject(new Error('Health deadline exceeded')), deadlineMs);
      })]);
      res.json({ status: 'ok', db: 'ok', redis: 'ok', payments });
    } catch {
      res.status(503).json({ status: 'error', payments });
    } finally {
      if (timer) clearTimeout(timer);
    }
  });
  return router;
}
