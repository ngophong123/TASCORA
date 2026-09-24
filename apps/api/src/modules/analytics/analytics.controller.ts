import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/requireAuth';
import { AnalyticsService } from './analytics.service';

export const getSellerDashboardMetrics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const metrics = await AnalyticsService.getSellerDashboardMetrics(userId);
    res.status(200).json({ success: true, data: metrics });
  } catch (error) {
    next(error);
  }
};
