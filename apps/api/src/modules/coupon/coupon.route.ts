import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middlewares/requireAuth';
import { validate } from '../../middlewares/validate';
import { createCoupon, getSellerCoupons, validateCoupon } from './coupon.controller';

const router = Router();

const createCouponSchema = z.object({
  body: z
    .object({
      code: z
        .string()
        .trim()
        .regex(/^[A-Za-z0-9_-]{3,32}$/, 'Code must be 3-32 alphanumeric, hyphen, or underscore characters'),
      discountPercent: z.coerce.number().finite().min(1).max(90),
      maxUses: z.coerce.number().int().min(1).max(10000).optional().default(100),
      expiresAt: z.string().datetime().optional(),
    })
    .strict(),
});

const validateCouponSchema = z.object({
  body: z
    .object({
      code: z.string().trim().min(1).max(32),
      serviceId: z.string().cuid(),
    })
    .strict(),
});

// Validate can be called by an authenticated buyer
router.post('/validate', requireAuth, validate(validateCouponSchema), validateCoupon);

// Creating and listing coupons is restricted to authenticated approved sellers
router.post('/', requireAuth, validate(createCouponSchema), createCoupon);
router.get('/', requireAuth, getSellerCoupons);

export default router;
