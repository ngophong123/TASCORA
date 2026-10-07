import { requireAdminRole } from '../admin/admin.controller';
import { Router } from 'express';
import { requireAuth } from '../../middlewares/requireAuth';
import { sendTestEmail } from './email.controller';

const router = Router();

router.use(requireAuth);
router.use(requireAdminRole);

router.post('/test', sendTestEmail);

export default router;
