import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/requireAuth';
import { OnboardingService } from './onboarding.service';

export const updateStep = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const step = parseInt(req.params.step, 10);
    const profile = await OnboardingService.updateStep(userId, step, req.body);
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

export const submit = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const profile = await OnboardingService.submit(userId);
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};
