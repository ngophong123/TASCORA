import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/requireAuth';
import { HttpError } from '../../lib/errors';
import { AnalyticsService, type DateRangeFilter } from './analytics.service';

function parseDateRange(query: Record<string, unknown>): DateRangeFilter {
  const rawFrom = typeof query.from === 'string' && query.from.trim() ? query.from.trim() : undefined;
  const rawTo = typeof query.to === 'string' && query.to.trim() ? query.to.trim() : undefined;

  const from = rawFrom ? new Date(rawFrom) : undefined;
  const to = rawTo ? new Date(rawTo) : undefined;

  if (from && Number.isNaN(from.getTime())) {
    throw new HttpError(400, 'Invalid "from" date parameter');
  }
  if (to && Number.isNaN(to.getTime())) {
    throw new HttpError(400, 'Invalid "to" date parameter');
  }
  if (from && to && from.getTime() > to.getTime()) {
    throw new HttpError(400, '"from" date must be before or equal to "to" date');
  }
  return { from, to };
}

export const getSellerDashboardMetrics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const range = parseDateRange(req.query as Record<string, unknown>);
    const metrics = await AnalyticsService.getSellerDashboardMetrics(userId, range);
    res.status(200).json({ success: true, data: metrics });
  } catch (error) {
    next(error);
  }
};

export const getAdminPlatformKpis = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const range = parseDateRange(req.query as Record<string, unknown>);
    const metrics = await AnalyticsService.getAdminPlatformKpis(range);
    res.status(200).json({ success: true, data: metrics });
  } catch (error) {
    next(error);
  }
};
