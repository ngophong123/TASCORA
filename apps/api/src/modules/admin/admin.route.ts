import { Router } from 'express';
import { requireAuth, type AuthRequest } from '../../middlewares/requireAuth';
import { requireAdminRole, getAllUsers, banUser, approveService } from './admin.controller';
import { prisma } from '../../lib/prisma';
import { HttpError } from '../../lib/errors';
import { validate } from '../../middlewares/validate';
import { z } from 'zod';
import { AuditService, resolveCorrelationId } from '../audit/audit.service';

const router = Router();

router.use(requireAuth);
router.use(requireAdminRole);
router.post('/categories', validate(z.object({ body: z.object({ name: z.string().trim().min(1).max(100), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100) }) })), async (req, res, next) => {
  try { const body = req.body as { name: string; slug: string }; const category = await prisma.category.create({ data: body }); res.status(201).json({ success: true, data: category }); } catch (error) { next(error); }
});

router.get('/users', getAllUsers);
router.put('/users/:id/ban', banUser);
router.put('/services/:id/approve', approveService);
router.get('/review-queue', async (_req, res, next) => {
  try {
    const [sellers, services] = await Promise.all([
      prisma.sellerProfile.findMany({ where: { status: 'PENDING_REVIEW' }, select: { id: true, firstName: true, lastName: true, bio: true, professionalTitle: true, hourlyRate: true, status: true }, take: 100 }),
      prisma.service.findMany({ where: { status: 'DRAFT', seller: { status: 'APPROVED' } }, include: { packages: true, category: true }, take: 100 }),
    ]); res.json({ success: true, data: { sellers, services } });
  } catch (error) { next(error); }
});
router.put('/sellers/:id/review', validate(z.object({ params: z.object({ id: z.string().cuid() }), body: z.object({ status: z.enum(['APPROVED', 'REJECTED']) }) })), async (req: AuthRequest, res, next) => {
  try {
    const status = req.body.status as 'APPROVED' | 'REJECTED';
    const correlationId = resolveCorrelationId(req.headers['x-correlation-id'] || req.headers['x-request-id']);
    const sellerId = req.params.id!;
    await prisma.$transaction(async tx => {
      const changed = await tx.sellerProfile.updateMany({ where: { id: sellerId, status: 'PENDING_REVIEW', user: { status: 'ACTIVE' } }, data: { status } });
      if (changed.count !== 1) throw new HttpError(409, 'Seller is not awaiting review or account is inactive');
      await AuditService.record(tx, {
        adminId: req.user!.userId,
        action: 'SELLER_REVIEWED',
        targetEntity: 'SellerProfile',
        targetId: sellerId,
        previousState: 'PENDING_REVIEW',
        newState: status,
        context: {
          correlationId,
          ipAddress: req.ip || '',
          userAgent: req.headers['user-agent'] || '',
        },
      });
    });
    // Profile approval does not assert identity/KYC verification or payment onboarding.
    res.json({ success: true });
  } catch (error) { next(error); }
});

import { createAdminKycRouter } from '../kyc/kyc.route';
import { finOpsTracker } from '../service/ai-finops';
import { evaluateTrustSafetyAdvisory } from '../service/semantic-search.service';

router.post(
  '/ai/trust-safety/advisory',
  validate(
    z.object({
      body: z
        .object({
          title: z.string().trim().min(3).max(200),
          description: z.string().trim().min(5).max(2000),
          priceUsd: z.number().min(0).max(100000).optional(),
        })
        .strict(),
    })
  ),
  (req, res, next) => {
    try {
      const body = req.body as { title: string; description: string; priceUsd?: number };
      res.json({ success: true, data: evaluateTrustSafetyAdvisory(body) });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/ai/finops/summary', (_req, res) => {
  res.json({ success: true, data: finOpsTracker.summary() });
});

router.use('/', createAdminKycRouter());

export default router;
