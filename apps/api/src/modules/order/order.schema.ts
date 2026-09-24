import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    serviceId: z.string().cuid(),
    packageId: z.string().cuid(),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  body: z.object({
    status: z.enum(['PAID', 'IN_PROGRESS', 'IN_REVISION', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'DISPUTED']),
    message: z.string().optional(),
  }),
});
