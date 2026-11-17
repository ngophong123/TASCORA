import crypto from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { sanitizeAuditMetadata } from '../../lib/kyc-crypto';

export type AuditDbClient = Prisma.TransactionClient | typeof prisma;

export const ADMIN_AUDIT_ACTIONS = [
  'KYC_RECORD_VIEWED',
  'KYC_DOCUMENT_VIEWED',
  'KYC_MARKED_UNDER_REVIEW',
  'KYC_APPROVED',
  'KYC_REJECTED',
  'KYC_RESUBMISSION_REQUESTED',
  'SELLER_REVIEWED',
  'USER_STATUS_CHANGED',
  'SERVICE_APPROVED',
] as const;

export type AdminAuditAction = (typeof ADMIN_AUDIT_ACTIONS)[number];

export interface AuditContext {
  correlationId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export function resolveCorrelationId(headerValue?: string | string[]): string {
  const candidate = Array.isArray(headerValue) ? headerValue[0] : headerValue;
  if (candidate && /^[a-zA-Z0-9._-]{8,64}$/.test(candidate.trim())) {
    return candidate.trim();
  }
  return crypto.randomUUID();
}

export class AuditService {
  static async record(
    db: AuditDbClient,
    entry: {
      adminId: string;
      action: AdminAuditAction;
      targetEntity: string;
      targetId: string;
      previousState?: string | null;
      newState?: string | null;
      reason?: string | null;
      metadata?: Record<string, unknown>;
      context?: AuditContext;
    }
  ) {
    const correlationId = entry.context?.correlationId || crypto.randomUUID();
    const safeMetadata = entry.metadata ? sanitizeAuditMetadata(entry.metadata) : undefined;

    return db.adminAuditLog.create({
      data: {
        adminId: entry.adminId,
        action: entry.action,
        targetEntity: entry.targetEntity,
        targetId: entry.targetId,
        correlationId,
        previousState: entry.previousState ?? null,
        newState: entry.newState ?? null,
        reason: entry.reason ? entry.reason.slice(0, 1000) : null,
        metadata: (safeMetadata as Prisma.InputJsonValue | undefined) ?? undefined,
        ipAddress: entry.context?.ipAddress?.slice(0, 64) || null,
        userAgent: entry.context?.userAgent?.slice(0, 255) || null,
      },
    });
  }

  static async listLogs(filters: {
    page?: number;
    limit?: number;
    action?: string;
    targetEntity?: string;
    targetId?: string;
    adminId?: string;
    correlationId?: string;
  }) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 25));
    const skip = (page - 1) * limit;

    const where: Prisma.AdminAuditLogWhereInput = {
      ...(filters.action ? { action: filters.action } : {}),
      ...(filters.targetEntity ? { targetEntity: filters.targetEntity } : {}),
      ...(filters.targetId ? { targetId: filters.targetId } : {}),
      ...(filters.adminId ? { adminId: filters.adminId } : {}),
      ...(filters.correlationId ? { correlationId: filters.correlationId } : {}),
    };

    const [logs, total] = await Promise.all([
      prisma.adminAuditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          adminId: true,
          action: true,
          targetEntity: true,
          targetId: true,
          correlationId: true,
          previousState: true,
          newState: true,
          reason: true,
          metadata: true,
          ipAddress: true,
          createdAt: true,
          admin: {
            select: { id: true, email: true, role: true },
          },
        },
      }),
      prisma.adminAuditLog.count({ where }),
    ]);

    return {
      logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }
}
