import crypto from 'node:crypto';
import rateLimit from 'express-rate-limit';
import type { Request, RequestHandler } from 'express';

// Topology constraint (SINGLE-INSTANCE RATE LIMITER):
// Uses express-rate-limit's default in-memory store. In a multi-replica API deployment, effective
// per-window limits multiply by replica count until wired to a shared Redis store (e.g. rate-limit-redis).
const WINDOW_MS = 15 * 60 * 1000;

function normalizedEmailKey(req: Request): string {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const digest = crypto.createHash('sha256').update(email || 'invalid').digest('hex');
  return `email:${digest}`;
}

function ipKey(req: Request): string {
  return `ip:${req.ip || 'unknown'}`;
}

export function createPasswordResetRateLimiters(options?: {
  windowMs?: number;
  forgotIpLimit?: number;
  forgotAccountLimit?: number;
  resetIpLimit?: number;
}): {
  forgotIpLimiter: RequestHandler;
  forgotAccountLimiter: RequestHandler;
  resetIpLimiter: RequestHandler;
} {
  const windowMs = options?.windowMs ?? WINDOW_MS;
  const message = {
    success: false,
    error: { message: 'Too many password reset requests. Please try again later.' },
  };

  return {
    forgotIpLimiter: rateLimit({
      windowMs,
      limit: options?.forgotIpLimit ?? 15,
      keyGenerator: ipKey,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      message,
    }),
    forgotAccountLimiter: rateLimit({
      windowMs,
      limit: options?.forgotAccountLimit ?? 5,
      keyGenerator: normalizedEmailKey,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      message,
    }),
    resetIpLimiter: rateLimit({
      windowMs,
      limit: options?.resetIpLimit ?? 15,
      keyGenerator: ipKey,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      message,
    }),
  };
}
