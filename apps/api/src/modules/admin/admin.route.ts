import { Router } from 'express';
import { requireAuth } from '../../middlewares/requireAuth';
import { requireAdminRole, getAllUsers, banUser, approveService } from './admin.controller';
import { prisma } from '../../lib/prisma';
import { HttpError } from '../../lib/errors';
import { validate } from '../../middlewares/validate';
import { z } from 'zod';

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
router.put('/sellers/:id/review', validate(z.object({ params: z.object({ id: z.string().cuid() }), body: z.object({ status: z.enum(['APPROVED', 'REJECTED']) }) })), async (req, res, next) => {
  try {
    const status = req.body.status as 'APPROVED' | 'REJECTED';
    const changed = await prisma.sellerProfile.updateMany({ where: { id: req.params.id, status: 'PENDING_REVIEW', user: { status: 'ACTIVE' } }, data: { status } });
    if (changed.count !== 1) throw new HttpError(409, 'Seller is not awaiting review or account is inactive');
    // Profile approval does not assert identity/KYC verification or payment onboarding.
    res.json({ success: true });
  } catch (error) { next(error); }
});

export default router;
