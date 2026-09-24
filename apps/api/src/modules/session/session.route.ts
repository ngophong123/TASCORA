import { Router } from 'express';
import { getSessions, revokeSession, revokeAllSessions } from './session.controller';
import { requireAuth } from '../../middlewares/requireAuth';

const router = Router();

router.use(requireAuth);

router.get('/', getSessions);
router.delete('/:id', revokeSession);
router.delete('/', revokeAllSessions);

export default router;
