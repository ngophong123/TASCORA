import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/requireAuth';
import { WalletService } from './wallet.service';

export const getMyWallet = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const wallet = await WalletService.getWallet(userId);
    res.status(200).json({ success: true, data: wallet });
  } catch (error) {
    next(error);
  }
};
