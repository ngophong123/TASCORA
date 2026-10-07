import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { jwtAccessSecret } from '../../lib/config';
import { prisma } from '../../lib/prisma';
import { HttpError } from '../../lib/errors';

export const refreshLifetime = 7 * 24 * 60 * 60 * 1000;
export const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');
export const newRefreshToken = (sessionId: string) => `${sessionId}.${crypto.randomBytes(32).toString('hex')}`;
export const tokenSessionId = (token: string) => /^[0-9a-f-]{36}\.[0-9a-f]{64}$/.test(token) ? token.split('.')[0] : undefined;
export const signAccessToken = (user: { id: string; role: string }, sessionId: string) =>
  jwt.sign({ userId: user.id, role: user.role, sessionId }, jwtAccessSecret, { expiresIn: '15m', algorithm: 'HS256' });

const claimsSchema = z.object({ userId: z.string(), sessionId: z.string(), exp: z.number() });
export async function authenticateAccess(token: string) {
  const claims = claimsSchema.parse(jwt.verify(token, jwtAccessSecret, { algorithms: ['HS256'] }));
  const [user, session] = await Promise.all([
    prisma.user.findUnique({ where: { id: claims.userId }, select: { id: true, role: true, status: true } }),
    prisma.userSession.findUnique({ where: { id: claims.sessionId } }),
  ]);
  if (!user || user.status !== 'ACTIVE' || !session || session.userId !== user.id || session.revoked || session.expiresAt <= new Date()) {
    throw new HttpError(401, 'Invalid or expired session');
  }
  return { userId: user.id, role: user.role, sessionId: session.id, expiresAt: Math.min(claims.exp * 1000, session.expiresAt.getTime()) };
}
