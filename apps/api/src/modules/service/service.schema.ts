import { z } from 'zod';
import { Prisma } from '@prisma/client';

export const createServiceSchema = z.object({
  body: z.object({
    categoryId: z.string().cuid(),
    title: z.string().min(5).max(100),
    description: z.string().min(20).max(5000),
  }),
});

export const updateServiceSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  body: z.object({
    categoryId: z.string().cuid().optional(),
    title: z.string().min(5).max(100).optional(),
    description: z.string().min(20).max(5000).optional(),
  }),
});

export const createPackageSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  body: z.object({
    type: z.enum(['BASIC', 'STANDARD', 'PREMIUM']),
    title: z.string().min(5).max(50),
    description: z.string().max(500),
    price: z.number().finite().positive().max(99999999.99).refine(
      value => new Prisma.Decimal(value).decimalPlaces() <= 2,
      'Price must have at most two decimal places',
    ),
    deliveryDays: z.number().int().positive(),
    revisions: z.number().int().min(0),
    features: z.array(z.string()),
  }),
});

export const searchServiceSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    categoryId: z.string().optional(), // Could be cuid or slug, depending on how we want to search. Let's use optional string
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    rating: z.coerce.number().min(0).max(5).optional(),
    deliveryTime: z.coerce.number().min(1).optional(),
    sort: z.enum(['newest', 'price_asc', 'price_desc', 'rating', 'popular', 'recommended']).optional(),
    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(1).max(50).optional().default(10),
  }),
});
