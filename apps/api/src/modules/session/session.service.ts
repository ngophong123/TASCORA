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

    return prisma.userSession.update({
      where: { id: sessionId },
      data: { revoked: true },
    });
  }

  static async revokeAllSessions(userId: string, excludeSessionId?: string) {
    const whereClause: any = { userId };
    if (excludeSessionId) {
      whereClause.id = { not: excludeSessionId };
    }

    return prisma.userSession.updateMany({
      where: whereClause,
      data: { revoked: true },
    });
  }
}
