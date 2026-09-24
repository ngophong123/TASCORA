import { z } from 'zod';

export const updateOnboardingStepSchema = z.object({
  params: z.object({
    step: z.string().regex(/^\d+$/),
  }),
  body: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    professionalTitle: z.string().optional(),
    bio: z.string().optional(),
    skills: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),
    hourlyRate: z.number().optional(),
    avatar: z.string().url().optional(),
  }),
});
