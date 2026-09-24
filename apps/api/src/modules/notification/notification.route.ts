import { Router } from 'express';
import { requireAuth } from '../../middlewares/requireAuth';
import { getNotifications, markAsRead, markAllAsRead, createTestNotification } from './notification.controller';

const router = Router();

router.use(requireAuth);

router.get('/', getNotifications);
router.put('/read-all', markAllAsRead); // Must be before /:id/read
router.put('/:id/read', markAsRead);
router.post('/test', createTestNotification);

export default router;
