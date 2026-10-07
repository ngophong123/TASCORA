import { Router } from 'express';
import { paymentCapability } from './payment-provider';

export function healthRouter(probes: { database: () => Promise<unknown>; redis: () => Promise<unknown> }) {
  const router = Router();
  router.get('/health/live', (_req, res) => { res.setHeader('Cache-Control', 'no-store'); res.json({ status: 'ok' }); });
  router.get('/health', async (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const payments = paymentCapability();
    try {
      await probes.database();
      await probes.redis();
      res.json({ status: 'ok', db: 'ok', redis: 'ok', payments });
    } catch {
      res.status(503).json({ status: 'error', payments });
    }
  });
  return router;
}
