import { allowedOrigins } from './config';
import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { authenticateAccess } from '../modules/auth/token';
import { z } from 'zod';
import type { Message, Notification } from '@prisma/client';
import { prisma } from './prisma';
import { assertOwnedUpload } from '../modules/upload/references';

export interface ServerToClientEvents {
  new_message: (message: Message) => void;
  message_read: (data: { messageId: string; conversationId: string }) => void;
  new_notification: (notification: Notification) => void;
}

export interface ClientToServerEvents {
  join_conversation: (conversationId: string) => void;
  leave_conversation: (conversationId: string) => void;
  send_message: (data: { conversationId: string; content: string; attachmentUrl?: string }) => void;
  mark_read: (data: { messageId: string; conversationId: string }) => void;
}

export type InterServerEvents = Record<string, never>;

export interface SocketData {
  userId: string;
  role: string;
  sessionId: string;
  expiresAt: number;
}

let io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export const initSocket = (httpServer: HttpServer) => {


  io = new Server(httpServer, {
    allowRequest: (req, callback) => {
      const origin = req.headers.origin;
      callback(null, !origin || allowedOrigins.includes(origin));
    },
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication Middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers['authorization']?.split(' ')[1];
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const user = await authenticateAccess(token);
      Object.assign(socket.data, user);
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (User: ${socket.data.userId})`);

    // Join a personal room for the user to receive global notifications
    Promise.resolve(socket.join([`user_${socket.data.userId}`, `session_${socket.data.sessionId}`])).catch(() => socket.disconnect(true));
    const expiryTimer = setTimeout(() => socket.disconnect(true), Math.max(0, socket.data.expiresAt - Date.now()));
    expiryTimer.unref();
    socket.use(async (_packet, next) => {
      try { await authenticateAccess(socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1] || ''); next(); }
      catch { socket.disconnect(true); next(new Error('Session expired or revoked')); }
    });
    socket.once('disconnect', () => clearTimeout(expiryTimer));

    socket.on('join_conversation', async (conversationId) => {
      try {
        const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
        if (conversation && [conversation.participant1Id, conversation.participant2Id].includes(socket.data.userId)) {
          await socket.join(`conv_${conversationId}`);
        }
      } catch { /* Invalid or unavailable conversations cannot be joined. */ }
    });

    socket.on('leave_conversation', (conversationId) => {
      Promise.resolve(socket.leave(`conv_${conversationId}`)).catch(() => socket.disconnect(true));
    });

    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content, attachmentUrl } = z.object({ conversationId: z.string().min(1), content: z.string().min(1).max(10000), attachmentUrl: z.string().url().optional() }).parse(data);
        const senderId = socket.data.userId;

        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
        });

        if (!conversation) return;
        if (conversation.participant1Id !== senderId && conversation.participant2Id !== senderId) return;

        const isParticipant1 = conversation.participant1Id === senderId;
        assertOwnedUpload(attachmentUrl, senderId);
        const message = await prisma.$transaction(async tx => {
          await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtext(${`chat:${conversationId}`}))`;
          const created = await tx.message.create({
            data: {
              conversationId,
              senderId,
              content,
              attachmentUrl,
            },
          });

          await tx.conversation.update({
            where: { id: conversationId },
            data: {
              lastMessageAt: new Date(),
              ...(isParticipant1 ? { unreadCount2: { increment: 1 } } : { unreadCount1: { increment: 1 } }),
            },
          });
          await tx.notification.create({ data: { userId: isParticipant1 ? conversation.participant2Id : conversation.participant1Id, type: 'NEW_MESSAGE', title: 'New message', message: 'You have a new conversation message.', data: { conversationId } } });
          return created;
        });

        // Emit to the conversation room
        io.to(`conv_${conversationId}`).emit('new_message', message);

        // Also emit to the receiver's personal room for global notification
        const receiverId = isParticipant1 ? conversation.participant2Id : conversation.participant1Id;
        io.to(`user_${receiverId}`).emit('new_message', message);
      } catch (error) {
        console.error('Socket send_message error:', error);
      }
    });

    socket.on('mark_read', async (data) => {
      try {
        const { messageId, conversationId } = data;
        
        const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
        if (!conversation || ![conversation.participant1Id, conversation.participant2Id].includes(socket.data.userId)) return;
        const message = await prisma.message.findUnique({ where: { id: messageId } });
        if (!message || message.conversationId !== conversationId || message.senderId === socket.data.userId) return;
        await prisma.$transaction(async tx => {
          await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtext(${`chat:${conversationId}`}))`;
          await tx.message.update({ where: { id: messageId }, data: { isRead: true } });
          const unread = await tx.message.count({ where: { conversationId, senderId: { not: socket.data.userId }, isRead: false } });
          const isParticipant1 = conversation.participant1Id === socket.data.userId;
          await tx.conversation.update({
            where: { id: conversationId },
            data: {
              ...(isParticipant1 ? { unreadCount1: unread } : { unreadCount2: unread }),
            },
          });
        });

        socket.to(`conv_${conversationId}`).emit('message_read', { messageId, conversationId });
      } catch (error) {
        console.error('Socket mark_read error:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};
