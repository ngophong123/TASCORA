import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/requireAuth';
import { ReviewService } from './review.service';

export const createReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const buyerId = req.user!.userId;
    const review = await ReviewService.createReview(buyerId, req.body);
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

export const replyToReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const sellerId = req.user!.userId;
    const reviewId = req.params.id;
    const { reply } = req.body;
    const review = await ReviewService.replyToReview(sellerId, reviewId, reply);
    res.status(200).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

export const getServiceReviews = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { serviceId } = req.params;
    const reviews = await ReviewService.getServiceReviews(serviceId);
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};
