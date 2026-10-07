import { prisma } from '../../lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import { registerSchema, loginSchema } from './auth.schema';
import { HttpError } from '../../lib/errors';
import { hashToken, newRefreshToken, tokenSessionId, signAccessToken, refreshLifetime } from './token';
import { EmailService } from '../email/email.service';
import { getIO } from '../../lib/socket';

type Registration = z.infer<typeof registerSchema>['body'];
type Login = z.infer<typeof loginSchema>['body'];
const safeUser = { id: true, email: true, role: true, status: true } as const;

export class AuthService {
  static async register(data: Registration) {
    const email = data.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new HttpError(409, 'Email already exists');
    const password = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: { email, password, role: data.role === 'seller' ? 'SELLER' : 'BUYER', buyerProfile: { create: {} },
        ...(data.role === 'seller' ? { sellerProfile: { create: { skills: [], languages: [] } } } : {}) },
      select: safeUser,
    });
    await this.sendVerification(email);
    return user;
  }

  static async sendVerification(email: string) {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() }, select: safeUser });
    if (!user || user.status !== 'PENDING_VERIFICATION') return;
    const token = crypto.randomBytes(32).toString('hex');
    await prisma.emailVerification.create({ data: {
      userId: user.id, email: user.email, token: hashToken(token), expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    } });
    await EmailService.sendVerificationEmail(user.email, token);
  }

  static async verifyEmail(token: string) {
    const now = new Date();
    const result = await prisma.$transaction(async tx => {
      const record = await tx.emailVerification.findUnique({ where: { token: hashToken(token) } });
      if (!record || !record.userId || record.expiresAt <= now) return false;
      const used = await tx.emailVerification.updateMany({ where: { id: record.id, expiresAt: { gt: now } }, data: { expiresAt: now } });
      if (used.count !== 1) return false;
      await tx.user.updateMany({ where: { id: record.userId, email: record.email, status: 'PENDING_VERIFICATION' }, data: { status: 'ACTIVE' } });
      return true;
    });
    if (!result) throw new HttpError(400, 'Invalid or expired verification link');
  }

  static async login(data: Login, ip: string, device: string) {
    const user = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (!user || user.status !== 'ACTIVE' || !await bcrypt.compare(data.password, user.password)) {
      throw new HttpError(401, 'Invalid credentials or account not verified');
    }
    const sessionId = crypto.randomUUID();
    const refreshToken = newRefreshToken(sessionId);
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + refreshLifetime);
    await prisma.$transaction(async tx => {
      await tx.userSession.create({ data: { id: sessionId, userId: user.id, deviceInfo: device, ipAddress: ip, expiresAt, refreshToken: tokenHash } });
      await tx.refreshToken.create({ data: { userId: user.id, tokenHash, expiresAt } });
    });
    return { user: { id: user.id, email: user.email, role: user.role }, accessToken: signAccessToken(user, sessionId), refreshToken, expiresAt };
  }

  static async refresh(token: string) {
    const sessionId = tokenSessionId(token);
    if (!sessionId) throw new HttpError(401, 'Invalid refresh token');
    const tokenHash = hashToken(token);
    const now = new Date();
    const result = await prisma.$transaction(async tx => {
      const record = await tx.refreshToken.findUnique({ where: { tokenHash } });
      const session = await tx.userSession.findUnique({ where: { id: sessionId } });
      if (!record || !session || record.userId !== session.userId) return null;
      if (record.revoked || session.refreshToken !== tokenHash) {
        // A previously consumed token revokes its family, not other devices.
        await tx.userSession.updateMany({ where: { id: sessionId }, data: { revoked: true } });
        if (session.refreshToken) await tx.refreshToken.updateMany({ where: { tokenHash: session.refreshToken }, data: { revoked: true } });
        return null;
      }
      const user = await tx.user.findUnique({ where: { id: record.userId }, select: safeUser });
      if (session.revoked || record.expiresAt <= now || session.expiresAt <= now || !user || user.status !== 'ACTIVE') return null;
      const refreshToken = newRefreshToken(sessionId);
      const nextHash = hashToken(refreshToken);
      const claimed = await tx.userSession.updateMany({ where: { id: sessionId, revoked: false, refreshToken: tokenHash }, data: { refreshToken: nextHash, lastActivity: now } });
      if (claimed.count !== 1) {
        await tx.userSession.updateMany({ where: { id: sessionId }, data: { revoked: true } });
        // Concurrent replay also invalidates the active token through the session.
        return null;
      }
      await tx.refreshToken.update({ where: { id: record.id }, data: { revoked: true } });
      await tx.refreshToken.create({ data: { userId: user.id, tokenHash: nextHash, expiresAt: session.expiresAt } });
      return { user: { id: user.id, email: user.email, role: user.role }, accessToken: signAccessToken(user, sessionId), refreshToken, expiresAt: session.expiresAt };
    });
    if (!result) {
      const revokedSession = await prisma.userSession.findUnique({ where: { id: sessionId } });
      // Unknown tokens must not disconnect an active session by guessed ID.
      if (revokedSession?.revoked) { try { getIO().in(`session_${sessionId}`).disconnectSockets(true); } catch { /* No realtime server in isolated auth tests. */ } }
      throw new HttpError(401, 'Invalid, expired, or reused refresh token');
    }
    return result;
  }

  static async logout(token: string) {
    const sessionId = tokenSessionId(token);
    if (!sessionId) return null;
    return prisma.$transaction(async tx => {
      const record = await tx.refreshToken.findUnique({ where: { tokenHash: hashToken(token) } });
      const session = await tx.userSession.findUnique({ where: { id: sessionId } });
      if (!record || !session || record.userId !== session.userId) return null;
      await tx.userSession.updateMany({ where: { id: sessionId }, data: { revoked: true } });
      await tx.refreshToken.updateMany({ where: { tokenHash: { in: [record.tokenHash, session.refreshToken || ''] } }, data: { revoked: true } });
      return sessionId;
    });
  }
}
