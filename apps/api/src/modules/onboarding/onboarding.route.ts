import { Router } from 'express';
import { updateStep, submit } from './onboarding.controller';
import { validate } from '../../middlewares/validate';
import { updateOnboardingStepSchema } from './onboarding.schema';
import { requireAuth } from '../../middlewares/requireAuth';

const router = Router();

router.use(requireAuth);

router.put('/seller/step/:step', validate(updateOnboardingStepSchema), updateStep);
router.post('/seller/submit', submit);

export default router;
