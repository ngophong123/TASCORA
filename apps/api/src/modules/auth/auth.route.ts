import { Router } from 'express';
import {
  register,
  login,
  refresh,
  logout,
  protectCookieAction,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
} from './auth.controller';
import { validate } from '../../middlewares/validate';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.schema';
import { createPasswordResetRateLimiters } from './auth.rate-limit';

export function createAuthRouter(rateLimiters = createPasswordResetRateLimiters()) {
  const router = Router();
  router.use((_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });

  router.post('/register', validate(registerSchema), register);
  router.post('/login', validate(loginSchema), protectCookieAction, login);
  router.post('/refresh', protectCookieAction, refresh);
  router.post('/logout', protectCookieAction, logout);
  router.post('/verify-email', validate(verifyEmailSchema), verifyEmail);
  router.post('/resend-verification', validate(resendVerificationSchema), resendVerification);
  router.post(
    '/forgot-password',
    rateLimiters.forgotIpLimiter,
    validate(forgotPasswordSchema),
    rateLimiters.forgotAccountLimiter,
    forgotPassword
  );
  router.post(
    '/reset-password',
    rateLimiters.resetIpLimiter,
    validate(resetPasswordSchema),
    resetPassword
  );

  return router;
}

const router = createAuthRouter();
export default router;
