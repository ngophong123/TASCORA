import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/requireAuth';
import { EmailService } from './email.service';

import { prisma } from '../../lib/prisma';

export const sendTestEmail = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user || !user.email) {
      return res.status(400).json({ success: false, error: 'User email not found' });
    }

    const info = await EmailService.sendTestEmail(user.email);
    
    res.status(200).json({ 
      success: true, 
      message: 'Test email sent successfully',
      messageId: info.messageId 
    });
  } catch (error) {
    next(error);
  }
};
