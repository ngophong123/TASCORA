import { z } from 'zod';
import { createPackageSchema } from '../service/service.schema';

export const updateBuyerProfileSchema = z.object({
  body: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    avatar: z.string().url().optional(),
    bio: z.string().max(500).optional(),
    country: z.string().optional(),
    timezone: z.string().optional(),
  }),
});

export const updateSellerProfileSchema = z.object({
  body: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    avatar: z.string().url().optional(),
    bio: z.string().max(1000).optional(),
    country: z.string().optional(),
    timezone: z.string().optional(),
    professionalTitle: z.string().max(100).optional(),
    hourlyRate: createPackageSchema.shape.body.shape.price.optional(),
    languages: z.array(z.string()).optional(),
    skills: z.array(z.string()).optional(),
    availability: z.string().optional(),
  }),
});
