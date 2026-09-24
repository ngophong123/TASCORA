import { Router } from 'express';
import { requireAuth } from '../../middlewares/requireAuth';
import { requireAdminRole, getAllUsers, banUser, approveService } from './admin.controller';

const router = Router();

router.use(requireAuth);
router.use(requireAdminRole);

router.get('/users', getAllUsers);
router.put('/users/:id/ban', banUser);
router.put('/services/:id/approve', approveService);

export default router;
