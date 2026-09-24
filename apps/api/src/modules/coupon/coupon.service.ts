import { prisma } from '../../lib/prisma';

export class CouponService {
  static async createCoupon(sellerUserId: string, data: { code: string; discountPercent: number; maxUses: number; expiresAt?: string }) {
    const seller = await prisma.sellerProfile.findUnique({
      where: { userId: sellerUserId }
    });

    if (!seller) {
      throw new Error('Seller profile not found');
    }

    // code must be uppercase
    const code = data.code.toUpperCase().trim();

    return prisma.coupon.create({
      data: {
        code,
        sellerId: seller.id,
        discountPercent: data.discountPercent,
        maxUses: data.maxUses,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null
      }
    });
  }

  static async getSellerCoupons(sellerUserId: string) {
    const seller = await prisma.sellerProfile.findUnique({
      where: { userId: sellerUserId }
    });

    if (!seller) {
      throw new Error('Seller profile not found');
    }

    return prisma.coupon.findMany({
      where: { sellerId: seller.id },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async validateCoupon(code: string, serviceId: string) {
    code = code.toUpperCase().trim();

    // 1. Find service to get sellerId and price
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { packages: true }
    });

    if (!service) {
      throw new Error('Service not found');
    }

    // 2. Find coupon by code and sellerId
    const coupon = await prisma.coupon.findUnique({
      where: {
        sellerId_code: {
          sellerId: service.sellerProfileId,
          code
        }
      }
    });

    if (!coupon) {
      throw new Error('Invalid coupon code');
    }

    // 3. Check expiration
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      throw new Error('Coupon has expired');
    }

    // 4. Check usage limits
    if (coupon.usedCount >= coupon.maxUses) {
      throw new Error('Coupon usage limit reached');
    }

    // Return the discount percentage
    return {
      isValid: true,
      couponId: coupon.id,
      code: coupon.code,
      discountPercent: coupon.discountPercent
    };
  }
}
