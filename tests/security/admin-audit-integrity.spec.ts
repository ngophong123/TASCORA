import { describe, expect, it, vi } from 'vitest';
import { prisma } from '../../apps/api/src/lib/prisma';
import { AuditService } from '../../apps/api/src/modules/audit/audit.service';

describe('Admin audit log immutability and tamper resistance', () => {
  it('blocks update, updateMany, upsert, delete, and deleteMany on AdminAuditLog at the application Prisma layer', async () => {
    await expect(
      prisma.adminAuditLog.update({ where: { id: 'audit-1' }, data: { reason: 'tampered' } })
    ).rejects.toThrow('append-only and immutable');
    await expect(
      prisma.adminAuditLog.updateMany({ where: {}, data: { reason: 'tampered' } })
    ).rejects.toThrow('append-only and immutable');
    await expect(
      prisma.adminAuditLog.upsert({
        where: { id: 'audit-1' },
        update: { reason: 'tampered' },
        create: {
          adminId: 'admin-1',
          action: 'KYC_APPROVED',
          targetEntity: 'IdentityVerification',
          targetId: 'kyc-1',
          correlationId: 'corr-1',
        },
      })
    ).rejects.toThrow('append-only and immutable');
    await expect(prisma.adminAuditLog.delete({ where: { id: 'audit-1' } })).rejects.toThrow(
      'append-only and immutable'
    );
    await expect(prisma.adminAuditLog.deleteMany({ where: {} })).rejects.toThrow(
      'append-only and immutable'
    );
  });

  it('blocks mutating/deleting KycReviewHistory records at the application Prisma layer', async () => {
    await expect(
      prisma.kycReviewHistory.update({ where: { id: 'hist-1' }, data: { reason: 'tampered' } })
    ).rejects.toThrow('append-only and immutable');
    await expect(prisma.kycReviewHistory.delete({ where: { id: 'hist-1' } })).rejects.toThrow(
      'append-only and immutable'
    );
  });

  it('blocks update, updateMany, upsert, delete, and deleteMany on FinancialEntry at the application Prisma layer', async () => {
    await expect(
      prisma.financialEntry.update({ where: { id: 'fe-1' }, data: { amount: 1 } })
    ).rejects.toThrow('append-only and immutable');
    await expect(
      prisma.financialEntry.updateMany({ where: {}, data: { amount: 1 } })
    ).rejects.toThrow('append-only and immutable');
    await expect(
      prisma.financialEntry.upsert({
        where: { id: 'fe-1' },
        update: { amount: 1 },
        create: {
          orderId: 'ord-1',
          type: 'ADJUSTMENT',
          eventKey: 'fe-upsert-1',
        },
      })
    ).rejects.toThrow('append-only and immutable');
    await expect(prisma.financialEntry.delete({ where: { id: 'fe-1' } })).rejects.toThrow(
      'append-only and immutable'
    );
    await expect(prisma.financialEntry.deleteMany({ where: {} })).rejects.toThrow(
      'append-only and immutable'
    );
  });

  it('strips secrets, tokens, and identity numbers from persisted audit metadata', async () => {
    const createSpy = vi.fn().mockImplementation(async args => ({ id: 'audit-created', ...args.data }));
    const mockDb = { adminAuditLog: { create: createSpy } } as unknown as Parameters<typeof AuditService.record>[0];

    await AuditService.record(mockDb, {
      adminId: 'admin-1',
      action: 'KYC_DOCUMENT_VIEWED',
      targetEntity: 'IdentityVerification',
      targetId: 'kyc-1',
      metadata: {
        slot: 'front',
        documentNumber: 'P987654321',
        dateOfBirth: '1990-02-02',
        resetToken: 'deadbeef',
        password: 'rawpassword',
      },
      context: { correlationId: 'corr-12345678', ipAddress: '127.0.0.1', userAgent: 'Vitest' },
    });

    expect(createSpy).toHaveBeenCalledOnce();
    const persisted = createSpy.mock.calls[0]![0].data;
    expect(persisted.correlationId).toBe('corr-12345678');
    const serialized = JSON.stringify(persisted.metadata);
    expect(serialized).not.toContain('P987654321');
    expect(serialized).not.toContain('1990-02-02');
    expect(serialized).not.toContain('deadbeef');
    expect(serialized).not.toContain('rawpassword');
    expect(persisted.metadata).toMatchObject({
      slot: 'front',
      documentNumber: '[REDACTED]',
      dateOfBirth: '[REDACTED]',
      resetToken: '[REDACTED]',
      password: '[REDACTED]',
    });
  });
});
