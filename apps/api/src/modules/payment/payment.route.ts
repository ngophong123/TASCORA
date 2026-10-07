import { Router } from 'express';
import { createIntent } from './payment.controller';
import { z } from 'zod';
import { validate } from '../../middlewares/validate';
import { requireAuth } from '../../middlewares/requireAuth';

const router = Router();

// Endpoint for creating intent requires Auth and JSON body
router.post('/create-intent', requireAuth, validate(z.object({ body: z.object({ orderId: z.string().cuid() }).strict() })), createIntent);

// Note: /webhook is mounted in server.ts to ensure raw body parsing

export default router;
