import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

export interface ServerToClientEvents {
  new_message: (message: any) => void;
  message_read: (data: { messageId: string; conversationId: string }) => void;
  new_notification: (notification: any) => void;
}

export interface ClientToServerEvents {
  join_conversation: (conversationId: string) => void;
  leave_conversation: (conversationId: string) => void;
  send_message: (data: { conversationId: string; content: string; attachmentUrl?: string }) => void;
  mark_read: (data: { messageId: string; conversationId: string }) => void;
}

export interface InterServerEvents {}

export interface SocketData {
  userId: string;
  role: string;
}

let io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export const initSocket = (httpServer: HttpServer) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3200',
    process.env.NEXT_PUBLIC_WEB_URL,
  ].filter(Boolean) as string[];

  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers['authorization']?.split(' ')[1];
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'access_secret') as any;
      socket.data.userId = decoded.userId;
      socket.data.role = decoded.role;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (User: ${socket.data.userId})`);

    // Join a personal room for the user to receive global notifications
    socket.join(`user_${socket.data.userId}`);

    socket.on('join_conversation', (conversationId) => {
      socket.join(`conv_${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conv_${conversationId}`);
    });

    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content, attachmentUrl } = data;
        const senderId = socket.data.userId;

        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
        });

        if (!conversation) return;
        if (conversation.participant1Id !== senderId && conversation.participant2Id !== senderId) return;

        const message = await prisma.message.create({
          data: {
            conversationId,
            senderId,
            content,
            attachmentUrl,
          },
        });

        const isParticipant1 = conversation.participant1Id === senderId;
        await prisma.conversation.update({
          where: { id: conversationId },
          data: {
            lastMessageAt: new Date(),
            unreadCount2: isParticipant1 ? { increment: 1 } : conversation.unreadCount2,
            unreadCount1: !isParticipant1 ? { increment: 1 } : conversation.unreadCount1,
          },
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
        
        await prisma.message.update({
          where: { id: messageId },
          data: { isRead: true },
        });

        const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
        if (conversation) {
          const isParticipant1 = conversation.participant1Id === socket.data.userId;
          await prisma.conversation.update({
            where: { id: conversationId },
            data: {
              unreadCount1: isParticipant1 ? 0 : conversation.unreadCount1,
              unreadCount2: !isParticipant1 ? 0 : conversation.unreadCount2,
            },
          });
        }

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
