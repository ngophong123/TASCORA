import { Router } from 'express';
import { getMyProfiles, updateBuyerProfile, updateSellerProfile } from './profile.controller';
import { validate } from '../../middlewares/validate';
import { updateBuyerProfileSchema, updateSellerProfileSchema } from './profile.schema';
import { requireAuth } from '../../middlewares/requireAuth';

const router = Router();

router.use(requireAuth); // Protect all profile routes

router.get('/me', getMyProfiles);
router.put('/buyer', validate(updateBuyerProfileSchema), updateBuyerProfile);
router.put('/seller', validate(updateSellerProfileSchema), updateSellerProfile);

export default router;
