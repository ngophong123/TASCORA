import { Router } from 'express';
import { z } from 'zod';
import { createService, getMyServices, updateService, addPackage, searchServices, getServiceById, getRecommendations } from './service.controller';
import { validate } from '../../middlewares/validate';
import { createServiceSchema, updateServiceSchema, createPackageSchema, searchServiceSchema } from './service.schema';
import { requireAuth } from '../../middlewares/requireAuth';
import { prisma } from '../../lib/prisma';
import { generateProjectBrief, hybridSemanticSearch } from './semantic-search.service';

const router = Router();

// Public routes (Tìm kiếm)
router.get('/', validate(searchServiceSchema), searchServices);

// Recommendation route (phải đặt trước /:id)
router.get('/recommendations', getRecommendations);

// Hybrid semantic + keyword search with deterministic zero-key fallback
router.get(
  '/semantic-search',
  validate(
    z.object({
      query: z.object({
        q: z.string().trim().min(2).max(200),
        limit: z.coerce.number().int().min(1).max(20).optional(),
      }),
    })
  ),
  async (req, res, next) => {
    try {
      const q = String(req.query.q || '');
      const limit = req.query.limit ? Number(req.query.limit) : 5;
      const services = await prisma.service.findMany({
        where: { status: 'PUBLISHED', seller: { status: 'APPROVED' } },
        take: 100,
        include: {
          category: { select: { name: true } },
          packages: { take: 1, orderBy: { price: 'asc' }, select: { price: true } },
          tags: { include: { tag: { select: { name: true } } } },
        },
      });
      const catalog = services.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        category: s.category?.name || 'General',
        tags: (s.tags || []).map((t) => t.tag.name),
        startingPriceUsd: s.packages[0] ? Number(s.packages[0].price) : 0,
        ratingAverage: s.ratingAverage || 0,
      }));
      const result = hybridSemanticSearch(q, catalog, limit);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

// Schema-validated Project Brief Assistant (advisory only)
router.post(
  '/brief-assistant',
  requireAuth,
  validate(
    z.object({
      body: z
        .object({
          idea: z.string().trim().min(10).max(1500),
          budgetHintUsd: z.number().min(5).max(100000).optional(),
          timelineDays: z.number().int().min(1).max(365).optional(),
        })
        .strict(),
    })
  ),
  (req, res, next) => {
    try {
      const body = req.body as { idea: string; budgetHintUsd?: number; timelineDays?: number };
      const brief = generateProjectBrief(body);
      res.json({ success: true, data: brief });
    } catch (error) {
      next(error);
    }
  }
);

// Protected route cho Seller (Phải đặt trước /:id để tránh bị match nhầm 'seller' thành 'id')
router.get('/seller/me', requireAuth, getMyServices);

// Public route (Xem chi tiết)
router.get('/:id', getServiceById);

// Protected routes (Chỉ Seller mới được đăng/sửa bài)
router.use(requireAuth);

router.post('/', validate(createServiceSchema), createService);
router.put('/:id', validate(updateServiceSchema), updateService);
router.post('/:id/packages', validate(createPackageSchema), addPackage);

export default router;
