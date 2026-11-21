import { prisma } from '../../lib/prisma';
import { HttpError } from '../../lib/errors';

export class CouponService {
  static async createCoupon(
    sellerUserId: string,
    data: { code: string; discountPercent: number; maxUses: number; expiresAt?: string }
  ) {
    const seller = await prisma.sellerProfile.findUnique({
      where: { userId: sellerUserId },
      select: { id: true, status: true },
    });

    if (!seller) {
      throw new HttpError(404, 'Seller profile not found');
    }
    if (seller.status !== 'APPROVED') {
      throw new HttpError(403, 'Approved seller profile required to create coupons');
    }
    if (!Number.isFinite(data.discountPercent) || data.discountPercent < 1 || data.discountPercent > 90) {
      throw new HttpError(400, 'Discount percent must be between 1 and 90');
    }
    if (!Number.isInteger(data.maxUses) || data.maxUses < 1 || data.maxUses > 10000) {
      throw new HttpError(400, 'maxUses must be an integer between 1 and 10000');
    }

    let expiresAtDate: Date | null = null;
    if (data.expiresAt) {
      expiresAtDate = new Date(data.expiresAt);
      if (Number.isNaN(expiresAtDate.getTime()) || expiresAtDate.getTime() <= Date.now()) {
        throw new HttpError(400, 'expiresAt must be a valid future timestamp');
      }
    }

    const code = data.code.toUpperCase().trim();

    return prisma.coupon.create({
      data: {
        code,
        sellerId: seller.id,
        discountPercent: data.discountPercent,
        maxUses: data.maxUses,
        expiresAt: expiresAtDate,
      },
    });
  }

  static async getSellerCoupons(sellerUserId: string) {
    const seller = await prisma.sellerProfile.findUnique({
      where: { userId: sellerUserId },
      select: { id: true },
    });

    if (!seller) {
      throw new HttpError(404, 'Seller profile not found');
    }

    return prisma.coupon.findMany({
      where: { sellerId: seller.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async validateCoupon(code: string, serviceId: string) {
    const normalizedCode = code.toUpperCase().trim();

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { id: true, sellerProfileId: true, status: true },
    });

    if (!service || service.status !== 'PUBLISHED') {
      throw new HttpError(400, 'Coupon is invalid or unavailable');
    }

    const coupon = await prisma.coupon.findUnique({
      where: {
        sellerId_code: {
          sellerId: service.sellerProfileId,
          code: normalizedCode,
        },
      },
    });

    if (!coupon) {
      throw new HttpError(400, 'Coupon is invalid or unavailable');
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      throw new HttpError(400, 'Coupon has expired');
    }

    if (coupon.usedCount >= coupon.maxUses) {
      throw new HttpError(400, 'Coupon usage limit reached');
    }

    return {
      isValid: true,
      couponId: coupon.id,
      code: coupon.code,
      discountPercent: coupon.discountPercent,
    };
  }
}
