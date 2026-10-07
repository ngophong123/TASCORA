import { z } from 'zod';
import { createPackageSchema } from '../service/service.schema';

export const updateOnboardingStepSchema = z.object({
  params: z.object({
    step: z.string().regex(/^[1-5]$/),
  }),
  body: z.object({
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
    professionalTitle: z.string().trim().min(1).max(100).optional(),
    bio: z.string().trim().min(1).max(1000).optional(),
    skills: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),
    hourlyRate: createPackageSchema.shape.body.shape.price.optional(),
    avatar: z.string().url().optional(),
  }),
});
