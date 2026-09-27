import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/requireAuth';
import { CouponService } from './coupon.service';

export const createCoupon = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { code, discountPercent, maxUses, expiresAt } = req.body;
    
    // Simple validation
    if (!code || !discountPercent) {
      res.status(400).json({ success: false, error: 'Code and discountPercent are required' });
      return;
    }

    const coupon = await CouponService.createCoupon(userId, {
      code,
      discountPercent: Number(discountPercent),
      maxUses: maxUses ? Number(maxUses) : 100,
      expiresAt
    });

    res.status(201).json({ success: true, data: coupon });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400);
      error.message = 'Coupon code already exists for this seller';
    }
    next(error);
  }
};

export const getSellerCoupons = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const coupons = await CouponService.getSellerCoupons(userId);
    res.status(200).json({ success: true, data: coupons });
  } catch (error) {
    next(error);
  }
};

export const validateCoupon = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { code, serviceId } = req.body;
    if (!code || !serviceId) {
      res.status(400).json({ success: false, error: 'Code and serviceId are required' });
      return;
    }

    const result = await CouponService.validateCoupon(code, serviceId);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
