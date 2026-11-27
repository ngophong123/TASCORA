import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/requireAuth';
import { WalletService } from './wallet.service';

export const getMyWallet = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const wallet = await WalletService.getWallet(userId);
    // Legacy/disconnected endpoint: FinancialEntry (/api/v1/financial/earnings) is authoritative.
    res.setHeader('X-Tascora-Legacy-Wallet', 'deprecated-use-financial-earnings');
    res.status(200).json({ success: true, data: wallet });
  } catch (error) {
    next(error);
  }
};
