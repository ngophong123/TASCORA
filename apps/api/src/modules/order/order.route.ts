import { Router } from 'express';
import { createOrder, getMyPurchases, getMySales, updateOrderStatus } from './order.controller';
import { validate } from '../../middlewares/validate';
import { createOrderSchema, updateOrderStatusSchema } from './order.schema';
import { requireAuth, AuthRequest } from '../../middlewares/requireAuth';
import { z } from 'zod';
import { OrderService } from './order.service';
import { requestKey, reasonSchema, orderMutationView } from '../financial/domain';
const router = Router();
router.use(requireAuth);
router.post('/', validate(createOrderSchema), createOrder);
router.get('/my-purchases', getMyPurchases);
router.get('/my-sales', getMySales);
router.post('/:id/status', validate(updateOrderStatusSchema), updateOrderStatus);
router.post('/:id/operations/:operation', validate(z.object({ params: z.object({ id: z.string().cuid(), operation: z.enum(['start', 'accept', 'revision', 'cancel']) }), body: z.object({ message: reasonSchema.optional() }).strict() })), async (req: AuthRequest, res, next) => {
  try { const order = await OrderService.operate(req.user!.userId, req.params.id!, req.params.operation as 'start' | 'accept' | 'revision' | 'cancel', req.body.message as string | undefined); res.json({ success: true, data: orderMutationView(order) }); } catch (error) { next(error); }
});
router.post('/:id/delivery', validate(z.object({ params: z.object({ id: z.string().cuid() }), body: z.object({ message: reasonSchema, files: z.array(z.string().url()).max(10).default([]), idempotencyKey: requestKey }).strict() })), async (req: AuthRequest, res, next) => {
  try { const { message, files, idempotencyKey } = req.body as { message: string; files: string[]; idempotencyKey: string }; const order = await OrderService.deliver(req.user!.userId, req.params.id!, message, files, idempotencyKey); res.json({ success: true, data: orderMutationView(order) }); } catch (error) { next(error); }
});
export default router;
