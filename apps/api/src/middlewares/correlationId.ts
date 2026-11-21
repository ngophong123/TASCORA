import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import type { Logger } from 'pino';
import { logger } from '../lib/logger';

export interface CorrelatedRequest extends Request {
  correlationId?: string;
  log?: Logger;
}

const SAFE_CORRELATION_ID_RE = /^[A-Za-z0-9._:-]{8,128}$/;

export function resolveRequestCorrelationId(headerValue: string | string[] | undefined): string {
  const candidate = Array.isArray(headerValue) ? headerValue[0] : headerValue;
  if (typeof candidate === 'string') {
    const trimmed = candidate.trim();
    if (SAFE_CORRELATION_ID_RE.test(trimmed)) {
      return trimmed;
    }
  }
  return crypto.randomUUID();
}

export function correlationIdMiddleware(
  req: CorrelatedRequest,
  res: Response,
  next: NextFunction
): void {
  const correlationId = resolveRequestCorrelationId(
    req.headers['x-correlation-id'] ?? req.headers['x-request-id']
  );
  req.correlationId = correlationId;
  req.log = logger.child({ correlationId, path: req.path, method: req.method });
  res.setHeader('X-Correlation-Id', correlationId);
  next();
}
