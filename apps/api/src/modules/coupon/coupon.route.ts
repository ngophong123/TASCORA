import { Router } from 'express';
import { requireAuth } from '../../middlewares/requireAuth';
import { createCoupon, getSellerCoupons, validateCoupon } from './coupon.controller';

const router = Router();

// Validate có thể gọi bởi buyer
router.post('/validate', requireAuth, validateCoupon);

// Tạo và xem mã chỉ dành cho seller
router.post('/', requireAuth, createCoupon);
router.get('/', requireAuth, getSellerCoupons);

export default router;
