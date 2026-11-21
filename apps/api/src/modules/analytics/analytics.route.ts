import { Router } from 'express';
import { requireAuth } from '../../middlewares/requireAuth';
import { requireAdminRole } from '../admin/admin.controller';
import { getAdminPlatformKpis, getSellerDashboardMetrics } from './analytics.controller';

const router = Router();

router.use(requireAuth);

router.get('/seller/dashboard', getSellerDashboardMetrics);
router.get('/admin/kpis', requireAdminRole, getAdminPlatformKpis);

export default router;
