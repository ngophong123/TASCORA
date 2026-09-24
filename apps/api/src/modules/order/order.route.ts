import { Router } from 'express';
import { createOrder, getMyPurchases, getMySales, updateOrderStatus } from './order.controller';
import { validate } from '../../middlewares/validate';
import { createOrderSchema, updateOrderStatusSchema } from './order.schema';
import { requireAuth } from '../../middlewares/requireAuth';

const router = Router();

router.use(requireAuth);

router.post('/', validate(createOrderSchema), createOrder);
router.get('/my-purchases', getMyPurchases);
router.get('/my-sales', getMySales);
router.post('/:id/status', validate(updateOrderStatusSchema), updateOrderStatus);

export default router;
