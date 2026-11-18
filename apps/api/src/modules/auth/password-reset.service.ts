import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import { HttpError } from '../../lib/errors';
import { getIO } from '../../lib/socket';
import { EmailService } from '../email/email.service';
import { hashToken } from './token';

export const PASSWORD_RESET_TTL_MS = 30 * 60 * 1000;
export const GENERIC_FORGOT_PASSWORD_MESSAGE =
  'If an account matching that email exists, a password reset link has been sent.';
const INVALID_RESET_TOKEN_MESSAGE = 'Invalid or expired password reset token';

export class PasswordResetService {
  static async requestPasswordReset(
    email: string,
    metadata?: { ip?: string; userAgent?: string }
  ): Promise<{ accepted: true }> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, status: true },
    });

    if (!user || user.status !== 'ACTIVE') {
      // Constant-shape fallback work avoids leaking account existence by timing.
      hashToken(crypto.randomBytes(32).toString('hex'));
      return { accepted: true };
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + PASSWORD_RESET_TTL_MS);

    await prisma.$transaction(async tx => {
      await tx.passwordResetToken.updateMany({
        where: { userId: user.id, used: false },
        data: { used: true, usedAt: now },
      });

      await tx.passwordResetToken.create({
        data: {
          token: tokenHash,
          userId: user.id,
          expiresAt,
          used: false,
          requestedIp: metadata?.ip?.slice(0, 64) || null,
          userAgent: metadata?.userAgent?.slice(0, 255) || null,
        },
      });
    });

    try {
      await EmailService.sendPasswordResetEmail(user.email, rawToken);
    } catch {
      // Never leak account status or reset tokens on transient mail transport errors.
      console.error(JSON.stringify({ event: 'password_reset_email_failed', userId: user.id }));
    }

    return { accepted: true };
  }

  static async resetPassword(
    rawToken: string,
    newPassword: string,
    metadata?: { ip?: string }
  ): Promise<{ userId: string; revokedSessionCount: number }> {
    const tokenHash = hashToken(rawToken);
    // Hash password outside the DB transaction so slow bcrypt work never holds row locks.
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const now = new Date();

    const result = await prisma.$transaction(async tx => {
      const record = await tx.passwordResetToken.findUnique({
        where: { token: tokenHash },
        include: { user: { select: { id: true, status: true } } },
      });

      if (!record || record.used || record.expiresAt <= now || record.user.status !== 'ACTIVE') {
        throw new HttpError(400, INVALID_RESET_TOKEN_MESSAGE, 'INVALID_RESET_TOKEN');
      }

      const claimed = await tx.passwordResetToken.updateMany({
        where: { id: record.id, used: false, expiresAt: { gt: now } },
        data: { used: true, usedAt: now, consumedIp: metadata?.ip?.slice(0, 64) || null },
      });
      if (claimed.count !== 1) {
        throw new HttpError(400, INVALID_RESET_TOKEN_MESSAGE, 'INVALID_RESET_TOKEN');
      }

      await tx.passwordResetToken.updateMany({
        where: { userId: record.userId, used: false },
        data: { used: true, usedAt: now },
      });

      const updated = await tx.user.updateMany({
        where: { id: record.userId, status: 'ACTIVE' },
        data: { password: hashedPassword },
      });
      if (updated.count !== 1) {
        throw new HttpError(400, INVALID_RESET_TOKEN_MESSAGE, 'INVALID_RESET_TOKEN');
      }

      const activeSessions = await tx.userSession.findMany({
        where: { userId: record.userId, revoked: false },
        select: { id: true },
      });

      await tx.userSession.updateMany({
        where: { userId: record.userId, revoked: false },
        data: { revoked: true },
      });

      await tx.refreshToken.updateMany({
        where: { userId: record.userId, revoked: false },
        data: { revoked: true },
      });

      return { userId: record.userId, revokedSessionIds: activeSessions.map(s => s.id) };
    });

    for (const sessionId of result.revokedSessionIds) {
      try {
        getIO().in(`session_${sessionId}`).disconnectSockets(true);
      } catch {
        // Real-time socket server may be absent in isolated tests.
      }
    }

    return { userId: result.userId, revokedSessionCount: result.revokedSessionIds.length };
  }
}
