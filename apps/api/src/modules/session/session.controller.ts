import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/requireAuth';
import { SessionService } from './session.service';

export const getSessions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const sessions = await SessionService.getActiveSessions(userId);
    res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    next(error);
  }
};

export const revokeSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const sessionId = req.params.id!;
    await SessionService.revokeSession(userId, sessionId);
    res.status(200).json({ success: true, message: 'Session revoked successfully' });
  } catch (error) {
    next(error);
  }
};

export const revokeAllSessions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    await SessionService.revokeAllSessions(userId);
    res.status(200).json({ success: true, message: 'All sessions revoked successfully' });
  } catch (error) {
    next(error);
  }
};
