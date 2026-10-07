import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { getIO } from '../../lib/socket';

export class NotificationService {
  static async createNotification(
    userId: string,
    type: 'ORDER_UPDATE' | 'NEW_MESSAGE' | 'SYSTEM_ALERT',
    title: string,
    message: string,
    data?: Prisma.InputJsonValue
  ) {
    // Save to DB
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: data ?? Prisma.JsonNull
      }
    });

    // Push to client via Socket.io if online
    try {
      const io = getIO();
      // Socket users are joined to personal rooms formatted as `user_${userId}`
      io.to(`user_${userId}`).emit('new_notification', notification);
    } catch (error) {
      console.warn('Could not emit socket event for notification:', error);
    }

    return notification;
  }

  static async getNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: [
        { isRead: 'asc' }, // Unread first
        { createdAt: 'desc' } // Then newest first
      ],
      take: 50 // Limit to last 50 for performance
    });
  }

  static async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true }
    });
  }

  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
  }
}
