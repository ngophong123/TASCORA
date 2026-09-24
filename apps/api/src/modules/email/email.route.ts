import { Router } from 'express';
import { requireAuth } from '../../middlewares/requireAuth';
import { sendTestEmail } from './email.controller';

const router = Router();

router.use(requireAuth);

router.post('/test', sendTestEmail);

export default router;
