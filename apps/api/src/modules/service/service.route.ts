import { Router } from 'express';
import { createService, getMyServices, updateService, addPackage, searchServices, getServiceById, getRecommendations } from './service.controller';
import { validate } from '../../middlewares/validate';
import { createServiceSchema, updateServiceSchema, createPackageSchema, searchServiceSchema } from './service.schema';
import { requireAuth } from '../../middlewares/requireAuth';

const router = Router();

// Public routes (Tìm kiếm)
router.get('/', validate(searchServiceSchema), searchServices);

// Recommendation route (phải đặt trước /:id)
router.get('/recommendations', getRecommendations);

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
