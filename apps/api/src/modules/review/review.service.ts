import { z } from 'zod';
import { createReviewSchema } from './review.schema';
import { prisma } from '../../lib/prisma';
import { HttpError } from '../../lib/errors';

export class ReviewService {
  static async createReview(buyerId: string, data: z.infer<typeof createReviewSchema>['body']) {
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
      include: { review: true, seller: { select: { userId: true } } },
    });

    if (!order || order.buyerId !== buyerId) throw new HttpError(404, 'Order not found');
    if (order.seller.userId === buyerId) throw new HttpError(403, 'Cannot review yourself');
    if (order.status !== 'COMPLETED') throw new HttpError(409, 'Order is not completed');
    if (order.review) throw new HttpError(409, 'Review already exists for this order');

    const rating = (data.communication + data.serviceQuality + data.recommend) / 3.0;

    return prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtext(${order.id}))`;
      await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtext(${`review-seller:${order.sellerId}`}))`;
      const current = await tx.order.findUnique({ where: { id: order.id }, include: { review: true } });
      if (!current || current.status !== 'COMPLETED' || current.review) throw new HttpError(409, 'Order is not eligible for another review');
      // 1. Create review
      const review = await tx.review.create({
        data: {
          orderId: order.id,
          serviceId: order.serviceId,
          buyerId,
          sellerId: order.sellerId,
          communication: data.communication,
          serviceQuality: data.serviceQuality,
          recommend: data.recommend,
          rating,
          comment: data.comment,
        },
      });

      // 2. Update Service rating cache
      const serviceRatings = await tx.review.aggregate({ where: { serviceId: order.serviceId }, _avg: { rating: true }, _count: { id: true } });
      await tx.service.update({ where: { id: order.serviceId }, data: { ratingCount: serviceRatings._count.id, ratingAverage: serviceRatings._avg.rating || 0 } });

      // 3. Update Seller rating cache
      const sellerRatings = await tx.review.aggregate({ where: { sellerId: order.sellerId }, _avg: { rating: true }, _count: { id: true } });
      await tx.sellerProfile.update({ where: { id: order.sellerId }, data: { ratingCount: sellerRatings._count.id, ratingAverage: sellerRatings._avg.rating || 0 } });

      return review;
    });
  }

  static async replyToReview(userId: string, reviewId: string, reply: string) {
    const seller = await prisma.sellerProfile.findUnique({ where: { userId } });
    if (!seller) throw new Error('Seller profile not found');

    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review || review.sellerId !== seller.id) {
      throw new Error('Review not found or unauthorized');
    }

    if (review.sellerReply) {
      throw new Error('Already replied to this review');
    }

    const changed = await prisma.review.updateMany({
      where: { id: reviewId, sellerId: seller.id, sellerReply: null },
      data: { sellerReply: reply },
    });
    if (changed.count !== 1) throw new HttpError(409, 'Already replied to this review');
    return prisma.review.findUnique({ where: { id: reviewId } });
  }

  static async getServiceReviews(serviceId: string) {
    return prisma.review.findMany({
      where: { serviceId },
      include: { buyer: { select: { id: true, buyerProfile: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
