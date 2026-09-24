import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await AuthService.register(req.body);
    res.status(201).json({ success: true, data: { id: user.id, email: user.email } });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ip = req.ip || '';
    const device = req.headers['user-agent'] || 'unknown';
    
    const result = await AuthService.login(req.body, ip, device);
    
    // In production, set httpOnly cookie for refresh token
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      data: {
        accessToken: result.accessToken,
        user: { id: result.user.id, email: result.user.email, role: result.user.role },
      },
    });
  } catch (error) {
    next(error);
  }
};
