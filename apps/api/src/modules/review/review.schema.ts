import { z } from 'zod';

export const createReviewSchema = z.object({
  body: z.object({
    orderId: z.string().cuid(),
    communication: z.number().int().min(1).max(5),
    serviceQuality: z.number().int().min(1).max(5),
    recommend: z.number().int().min(1).max(5),
    comment: z.string().min(10).max(1000),
  }),
});

export const replyReviewSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  body: z.object({
    reply: z.string().min(10).max(1000),
  }),
});
