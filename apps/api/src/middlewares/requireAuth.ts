import { Request, Response, NextFunction } from 'express';
import { authenticateAccess } from '../modules/auth/token';
export interface AuthRequest extends Request { user?: { userId: string; role: string; sessionId: string; expiresAt: number } }
export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void | Response> => {
  const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : '';
  if (!token) return res.status(401).json({ success: false, error: 'Unauthorized' });
  try { req.user = await authenticateAccess(token); return next(); }
  catch { return res.status(401).json({ success: false, error: 'Invalid or expired token' }); }
};
