import { Router } from 'express';
import { requireAuth } from '../../middlewares/requireAuth';
import { getMyWallet } from './wallet.controller';

const router = Router();

router.use(requireAuth);
router.get('/me', getMyWallet);

export default router;
