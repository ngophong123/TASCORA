import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/requireAuth';
import { MessageService } from './message.service';

export const getConversations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const convs = await MessageService.getConversations(userId);
    res.status(200).json({ success: true, data: convs });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { conversationId } = req.params;
    const skip = parseInt(req.query.skip as string) || 0;
    const take = parseInt(req.query.take as string) || 50;
    const messages = await MessageService.getMessages(conversationId, userId, skip, take);
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const senderId = req.user!.userId;
    const { conversationId, content, attachmentUrl } = req.body;
    const message = await MessageService.sendMessage(conversationId, senderId, content, attachmentUrl);
    res.status(201).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
};
