import { prisma } from '../../lib/prisma';
import { getIO } from '../../lib/socket';

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
        participant1: { select: { id: true, buyerProfile: true, sellerProfile: true } },
        participant2: { select: { id: true, buyerProfile: true, sellerProfile: true } },
        order: { select: { id: true, status: true } },
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

    if (!conversation) throw new Error('Conversation not found');
    if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
      throw new Error('Unauthorized');
    }

    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      skip,
      take
    });
  }

  static async sendMessage(conversationId: string, senderId: string, content: string, attachmentUrl?: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation) throw new Error('Conversation not found');
    if (conversation.participant1Id !== senderId && conversation.participant2Id !== senderId) {
      throw new Error('Unauthorized');
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
        attachmentUrl
      }
    });

    const isParticipant1 = conversation.participant1Id === senderId;
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        unreadCount2: isParticipant1 ? { increment: 1 } : conversation.unreadCount2,
        unreadCount1: !isParticipant1 ? { increment: 1 } : conversation.unreadCount1,
      }
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
