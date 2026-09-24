import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/requireAuth';
import { ProfileService } from './profile.service';

export const getMyProfiles = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const profiles = await ProfileService.getMyProfiles(userId);
    res.status(200).json({ success: true, data: profiles });
  } catch (error) {
    next(error);
  }
};

export const updateBuyerProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const profile = await ProfileService.updateBuyerProfile(userId, req.body);
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

export const updateSellerProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const profile = await ProfileService.updateSellerProfile(userId, req.body);
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};
