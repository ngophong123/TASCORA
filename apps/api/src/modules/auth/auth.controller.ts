import { Request, Response, NextFunction, CookieOptions } from 'express';
import { AuthService } from './auth.service';
import { GENERIC_FORGOT_PASSWORD_MESSAGE, PasswordResetService } from './password-reset.service';
import { isAllowedOrigin, cookieSameSite, isProduction } from '../../lib/config';
import { HttpError } from '../../lib/errors';
import { getIO } from '../../lib/socket';

const cookieOptions: CookieOptions = { httpOnly: true, secure: isProduction, sameSite: cookieSameSite as 'lax' | 'strict' | 'none', path: '/api/v1/auth' };
function readRefresh(req: Request): string {
  const values = (req.headers.cookie || '').split(';').map(value => value.trim()).filter(value => value.startsWith('refreshToken='));
  if (values.length !== 1) return '';
  try { return decodeURIComponent(values[0]!.slice('refreshToken='.length)); } catch { return ''; }
}
function replySession(res: Response, result: Awaited<ReturnType<typeof AuthService.login>>) {
  res.setHeader('Cache-Control', 'no-store');
  res.cookie('refreshToken', result.refreshToken, { ...cookieOptions, expires: result.expiresAt });
  res.json({ success: true, data: { accessToken: result.accessToken, user: result.user } });
}
export function protectCookieAction(req: Request, res: Response, next: NextFunction) {
  // Custom header requires CORS preflight; explicit origin prevents cross-site cookie abuse.
  if (req.headers['x-csrf-protection'] !== '1' || !req.headers.origin) {
    return next(new HttpError(403, 'Untrusted cookie action'));
  }
  void isAllowedOrigin(req.headers.origin).then(allowed => {
    next(allowed ? undefined : new HttpError(403, 'Untrusted cookie action'));
  }, () => next(new HttpError(403, 'Untrusted cookie action')));
}
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try { const user = await AuthService.register(req.body); res.status(201).json({ success: true, data: { id: user.id, email: user.email, verificationRequired: true } }); } catch (error) { next(error); }
};
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try { replySession(res, await AuthService.login(req.body, req.ip || '', req.headers['user-agent'] || 'unknown')); } catch (error) { next(error); }
};
export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try { replySession(res, await AuthService.refresh(readRefresh(req))); } catch (error) { res.clearCookie('refreshToken', cookieOptions); next(error); }
};
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try { const sessionId = await AuthService.logout(readRefresh(req));
    if (sessionId) getIO().in(`session_${sessionId}`).disconnectSockets(true);
    res.clearCookie('refreshToken', cookieOptions); res.setHeader('Cache-Control', 'no-store'); res.json({ success: true }); } catch (error) { next(error); }
};
export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try { await AuthService.verifyEmail(req.body.token); res.json({ success: true }); } catch (error) { next(error); }
};
export const resendVerification = async (req: Request, res: Response, next: NextFunction) => {
  try { await AuthService.sendVerification(req.body.email); res.json({ success: true, message: 'If verification is needed, an email will be sent.' }); } catch (error) { next(error); }
};
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    await PasswordResetService.requestPasswordReset(req.body.email, {
      ip: req.ip || '',
      userAgent: req.headers['user-agent'] || '',
    });
    res.status(200).json({ success: true, message: GENERIC_FORGOT_PASSWORD_MESSAGE });
  } catch (error) {
    next(error);
  }
};
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    await PasswordResetService.resetPassword(req.body.token, req.body.password, { ip: req.ip || '' });
    res.clearCookie('refreshToken', cookieOptions);
    res.status(200).json({ success: true, message: 'Password reset successfully. Please sign in with your new password.' });
  } catch (error) {
    next(error);
  }
};
