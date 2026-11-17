import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/requireAuth';
import { prisma } from '../../lib/prisma';
import { HttpError } from '../../lib/errors';
import { getIO } from '../../lib/socket';
import { AuditService, resolveCorrelationId } from '../audit/audit.service';

export const requireAdminRole = (req: AuthRequest, res: Response, next: NextFunction): void | Response => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: 'Forbidden: Admins only' });
  }
  return next();
};

export const getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ]);

    res.status(200).json({
      success: true,
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const banUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // BANNED or ACTIVE

    if (!['BANNED', 'ACTIVE', 'SUSPENDED'].includes(status)) {
      res.status(400).json({ success: false, error: 'Invalid status' });
      return;
    }

    const correlationId = resolveCorrelationId(req.headers['x-correlation-id'] || req.headers['x-request-id']);
    const updatedUser = await prisma.$transaction(async tx => {
      const existing = await tx.user.findUnique({ where: { id }, select: { id: true, status: true } });
      if (!existing) throw new HttpError(404, 'User not found');
      const nextUser = await tx.user.update({
        where: { id },
        data: { status },
        select: { id: true, email: true, status: true },
      });
      await AuditService.record(tx, {
        adminId: req.user!.userId,
        action: 'USER_STATUS_CHANGED',
        targetEntity: 'User',
        targetId: existing.id,
        previousState: existing.status,
        newState: status,
        context: {
          correlationId,
          ipAddress: req.ip || '',
          userAgent: req.headers['user-agent'] || '',
        },
      });
      return nextUser;
    });
    if (status !== 'ACTIVE') { try { getIO().in(`user_${id}`).disconnectSockets(true); } catch { /* No realtime server during isolated administration tests. */ } }

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    next(error);
  }
};

export const approveService = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const correlationId = resolveCorrelationId(req.headers['x-correlation-id'] || req.headers['x-request-id']);
    const updatedService = await prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtext(${`service:${id}`}))`;
      const service = await tx.service.findUnique({ where: { id }, include: { seller: { include: { user: { select: { status: true } } } }, packages: true } });
      if (!service) throw new HttpError(404, 'Service not found');
      if (service.status !== 'DRAFT' || service.seller.status !== 'APPROVED' || service.seller.user.status !== 'ACTIVE' || !service.packages.length || service.packages.some(p => !p.price.isPositive())) throw new HttpError(409, 'Service requires an approved active seller and valid package before publication');
      const published = await tx.service.update({ where: { id }, data: { status: 'PUBLISHED' } });
      await AuditService.record(tx, {
        adminId: req.user!.userId,
        action: 'SERVICE_APPROVED',
        targetEntity: 'Service',
        targetId: published.id,
        previousState: service.status,
        newState: 'PUBLISHED',
        context: {
          correlationId,
          ipAddress: req.ip || '',
          userAgent: req.headers['user-agent'] || '',
        },
      });
      return published;
    });

    res.status(200).json({ success: true, data: updatedService });
  } catch (error) {
    next(error);
  }
};
