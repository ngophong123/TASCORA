import { Prisma } from '@prisma/client';
import { getIO } from '../../lib/socket';
import { prisma } from '../../lib/prisma';

export class SessionService {
  static async getActiveSessions(userId: string) {
    return prisma.userSession.findMany({
      where: {
        userId,
        revoked: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        deviceInfo: true,
        ipAddress: true,
        createdAt: true,
        lastActivity: true,
        expiresAt: true,
      },
      orderBy: {
        lastActivity: 'desc',
      },
    });
  }

  static async revokeSession(userId: string, sessionId: string) {
    const session = await prisma.userSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== userId) {
      throw new Error('Session not found or unauthorized');
    }

    const result = await prisma.userSession.update({
      where: { id: sessionId },
      data: { revoked: true },
    });
    getIO().in(`session_${sessionId}`).disconnectSockets(true);
    return result;
  }

  static async revokeAllSessions(userId: string, excludeSessionId?: string) {
    const whereClause: Prisma.UserSessionWhereInput = { userId };
    if (excludeSessionId) {
      whereClause.id = { not: excludeSessionId };
    }

    const sessions = await prisma.userSession.findMany({ where: whereClause, select: { id: true } });
    const result = await prisma.userSession.updateMany({
      where: whereClause,
      data: { revoked: true },
    });
    for (const session of sessions) getIO().in(`session_${session.id}`).disconnectSockets(true);
    return result;
  }
}
