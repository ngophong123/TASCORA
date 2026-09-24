import { Router } from 'express';
import { requireAuth } from '../../middlewares/requireAuth';
import { getSellerDashboardMetrics } from './analytics.controller';

const router = Router();

router.use(requireAuth);

router.get('/seller/dashboard', getSellerDashboardMetrics);

export default router;
