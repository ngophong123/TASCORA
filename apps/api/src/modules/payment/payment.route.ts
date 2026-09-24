import { Router } from 'express';
import { createIntent } from './payment.controller';
import { requireAuth } from '../../middlewares/requireAuth';

const router = Router();

// Endpoint for creating intent requires Auth and JSON body
router.post('/create-intent', requireAuth, createIntent);

// Note: /webhook is mounted in server.ts to ensure raw body parsing

export default router;
