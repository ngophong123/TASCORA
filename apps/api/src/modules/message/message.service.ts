import { prisma } from '../../lib/prisma';
import { getIO } from '../../lib/socket';
import { publicSellerSelect } from '../../lib/public-profile';
import { HttpError } from '../../lib/errors';
import { assertOwnedUpload } from '../upload/references';

export class MessageService {
  static async getConversations(userId: string) {
    return prisma.conversation.findMany({
      where: {
        OR: [
          { participant1Id: userId },
          { participant2Id: userId }
        ]
      },
      include: {
        participant1: { select: { id: true, buyerProfile: true, sellerProfile: { select: publicSellerSelect } } },
        participant2: { select: { id: true, buyerProfile: true, sellerProfile: { select: publicSellerSelect } } },
        order: { include: { service: true, package: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { lastMessageAt: 'desc' }
    });
  }

  static async getMessages(conversationId: string, userId: string, skip = 0, take = 50) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation) throw new HttpError(404, 'Conversation not found');
    if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
      throw new HttpError(403, 'Unauthorized');
    }

    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      skip,
      take
    });
  }

  static async sendMessage(conversationId: string, senderId: string, content: string, attachmentUrl?: string) {
    assertOwnedUpload(attachmentUrl, senderId);
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation) throw new HttpError(404, 'Conversation not found');
    if (conversation.participant1Id !== senderId && conversation.participant2Id !== senderId) {
      throw new HttpError(403, 'Unauthorized');
    }

    const isParticipant1 = conversation.participant1Id === senderId;
    const message = await prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtext(${`chat:${conversationId}`}))`;
      const created = await tx.message.create({
        data: {
          conversationId,
          senderId,
          content,
          attachmentUrl
        }
      });

      await tx.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessageAt: new Date(),
          ...(isParticipant1 ? { unreadCount2: { increment: 1 } } : { unreadCount1: { increment: 1 } }),
        }
      });
      await tx.notification.create({ data: { userId: isParticipant1 ? conversation.participant2Id : conversation.participant1Id, type: 'NEW_MESSAGE', title: 'New message', message: 'You have a new conversation message.', data: { conversationId } } });
      return created;
    });

    // Fallback: emit from HTTP as well if sent via REST API
    try {
      const io = getIO();
      io.to(`conv_${conversationId}`).emit('new_message', message);
      const receiverId = isParticipant1 ? conversation.participant2Id : conversation.participant1Id;
      io.to(`user_${receiverId}`).emit('new_message', message);
    } catch (error) {
      console.warn('Socket not initialized or emit failed:', error);
    }

    return message;
  }
}
