import { z } from 'zod';

const strongPasswordRule = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .refine(value => Buffer.byteLength(value, 'utf8') <= 72, 'Password must be at most 72 UTF-8 bytes')
  .refine(
    value => /(?=.*[A-Za-z])(?=.*[^A-Za-z\s])/.test(value),
    'Password must include at least one letter and one number or symbol'
  );

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: strongPasswordRule,
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

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().trim().email().max(254),
  }).strict(),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().regex(/^[0-9a-f]{64}$/, 'Invalid or expired password reset token'),
    password: strongPasswordRule,
  }).strict(),
});
