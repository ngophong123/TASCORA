import { Router } from 'express';
import { requireAuth } from '../../middlewares/requireAuth';
import { requireAdminRole } from '../admin/admin.controller';
import { isProduction } from '../../lib/config';
import { HttpError } from '../../lib/errors';
import { getNotifications, markAsRead, markAllAsRead, createTestNotification } from './notification.controller';

const router = Router();

router.use(requireAuth);

router.get('/', getNotifications);
router.put('/read-all', markAllAsRead); // Must be before /:id/read
router.put('/:id/read', markAsRead);
router.post(
  '/test',
  requireAdminRole,
  (_req, _res, next) => {
    if (isProduction && process.env.APP_ENV !== 'staging') {
      next(new HttpError(403, 'Test notifications are disabled in production'));
      return;
    }
    next();
  },
  createTestNotification
);

export default router;
