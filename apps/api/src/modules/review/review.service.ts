import { prisma } from '../../lib/prisma';

export class ReviewService {
  static async createReview(buyerId: string, data: any) {
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
      include: { review: true },
    });

    if (!order) throw new Error('Order not found');
    if (order.buyerId !== buyerId) throw new Error('Unauthorized');
    if (order.status !== 'COMPLETED') throw new Error('Order is not completed');
    if (order.review) throw new Error('Review already exists for this order');

    const rating = (data.communication + data.serviceQuality + data.recommend) / 3.0;

    return prisma.$transaction(async (tx) => {
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
      const service = await tx.service.findUnique({ where: { id: order.serviceId } });
      if (service) {
        const newCount = service.ratingCount + 1;
        const newAverage = ((service.ratingAverage * service.ratingCount) + rating) / newCount;
        await tx.service.update({
          where: { id: service.id },
          data: { ratingCount: newCount, ratingAverage: newAverage },
        });
      }

      // 3. Update Seller rating cache
      const seller = await tx.sellerProfile.findUnique({ where: { id: order.sellerId } });
      if (seller) {
        const newCount = seller.ratingCount + 1;
        const newAverage = ((seller.ratingAverage * seller.ratingCount) + rating) / newCount;
        await tx.sellerProfile.update({
          where: { id: seller.id },
          data: { ratingCount: newCount, ratingAverage: newAverage },
        });
      }

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

    return prisma.review.update({
      where: { id: reviewId },
      data: { sellerReply: reply },
    });
  }

  static async getServiceReviews(serviceId: string) {
    return prisma.review.findMany({
      where: { serviceId },
      include: { buyer: { select: { id: true, buyerProfile: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
