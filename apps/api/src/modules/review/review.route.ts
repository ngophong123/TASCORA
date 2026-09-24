import { Router } from 'express';
import { createReview, replyToReview, getServiceReviews } from './review.controller';
import { validate } from '../../middlewares/validate';
import { createReviewSchema, replyReviewSchema } from './review.schema';
import { requireAuth } from '../../middlewares/requireAuth';

const router = Router();

router.get('/service/:serviceId', requireAuth, getServiceReviews); 
router.post('/', requireAuth, validate(createReviewSchema), createReview);
router.post('/:id/reply', requireAuth, validate(replyReviewSchema), replyToReview);

export default router;
