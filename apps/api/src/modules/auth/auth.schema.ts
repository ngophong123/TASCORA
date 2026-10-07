import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8).refine(value => Buffer.byteLength(value, 'utf8') <= 72, 'Password must be at most 72 UTF-8 bytes'),
    role: z.enum(['buyer', 'seller']).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

export const verifyEmailSchema = z.object({ body: z.object({ token: z.string().regex(/^[0-9a-f]{64}$/) }) });
export const resendVerificationSchema = z.object({ body: z.object({ email: z.string().email() }) });
