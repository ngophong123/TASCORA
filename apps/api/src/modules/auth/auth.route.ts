import { Router } from 'express';
import { register, login, refresh, logout, protectCookieAction, verifyEmail, resendVerification } from './auth.controller';
import { validate } from '../../middlewares/validate';
import { registerSchema, loginSchema, verifyEmailSchema, resendVerificationSchema } from './auth.schema';

const router = Router();
router.use((_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), protectCookieAction, login);
router.post('/refresh', protectCookieAction, refresh);
router.post('/logout', protectCookieAction, logout);
router.post('/verify-email', validate(verifyEmailSchema), verifyEmail);
router.post('/resend-verification', validate(resendVerificationSchema), resendVerification);

export default router;
