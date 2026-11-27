import { describe, expect, it, vi } from 'vitest';
import { Prisma } from '@prisma/client';
import {
  RECOVERY_CASE_STATUSES,
  RecoveryCaseService,
  addRecoveryEventBodySchema,
  aggregateRecoveryAmountsCents,
  assertValidRecoveryStatusTransition,
  assignRecoveryCaseBodySchema,
  isValidRecoveryStatusTransition,
  listRecoveryCasesQuerySchema,
  normalizeRecoveryPagination,
  recoveryCaseIdSchema,
  updateRecoveryStatusBodySchema,
} from '../../apps/api/src/modules/financial/recovery-case.service';
import type { Tx } from '../../apps/api/src/modules/financial/domain';

describe('Financial Recovery Case unit invariants', () => {
  it('enforces valid investigation status transitions and rejects invalid or terminal-bypass transitions', () => {
    expect(isValidRecoveryStatusTransition('OPEN', 'INVESTIGATING')).toBe(true);
    expect(isValidRecoveryStatusTransition('OPEN', 'AWAITING_EVIDENCE')).toBe(true);
    expect(isValidRecoveryStatusTransition('INVESTIGATING', 'AWAITING_EVIDENCE')).toBe(true);
    expect(isValidRecoveryStatusTransition('INVESTIGATING', 'PENDING_VERIFICATION')).toBe(true);
    expect(isValidRecoveryStatusTransition('AWAITING_EVIDENCE', 'INVESTIGATING')).toBe(true);
    expect(isValidRecoveryStatusTransition('AWAITING_EVIDENCE', 'PENDING_VERIFICATION')).toBe(true);
    expect(isValidRecoveryStatusTransition('PENDING_VERIFICATION', 'INVESTIGATING')).toBe(true);
    expect(isValidRecoveryStatusTransition('PENDING_VERIFICATION', 'AWAITING_EVIDENCE')).toBe(true);

    // OPEN cannot skip directly to PENDING_VERIFICATION
    expect(isValidRecoveryStatusTransition('OPEN', 'PENDING_VERIFICATION')).toBe(false);
    expect(() => assertValidRecoveryStatusTransition('OPEN', 'PENDING_VERIFICATION')).toThrow(
      'Invalid recovery case status transition'
    );
    // Self-transitions rejected
    for (const status of RECOVERY_CASE_STATUSES) {
      expect(() => assertValidRecoveryStatusTransition(status, status)).toThrow('already in status');
    }
    // Unknown current state rejected
    expect(() => assertValidRecoveryStatusTransition('RESOLVED', 'INVESTIGATING')).toThrow(
      'Unknown current recovery case status'
    );
  });

  it('aggregates recovery amounts in exact integer cents without floating-point drift', () => {
    const total = aggregateRecoveryAmountsCents([
      { recoveryAmount: new Prisma.Decimal('0.10') },
      { recoveryAmount: new Prisma.Decimal('0.20') },
      { recoveryAmount: '99.70' },
      { recoveryAmount: 25.05 },
    ]);
    expect(total).toBe(12505);
  });

  it('normalizes pagination bounds deterministically', () => {
    expect(normalizeRecoveryPagination({ page: 0, limit: 500, total: 250 })).toEqual({
      page: 1,
      limit: 100,
      skip: 0,
      total: 250,
      totalPages: 3,
    });
    expect(normalizeRecoveryPagination({ page: 2, limit: 20, total: 45 })).toEqual({
      page: 2,
      limit: 20,
      skip: 20,
      total: 45,
      totalPages: 3,
    });
    expect(normalizeRecoveryPagination({ total: 0 })).toEqual({
      page: 1,
      limit: 20,
      skip: 0,
      total: 0,
      totalPages: 1,
    });
  });

  it('validates recovery case schemas strictly and blocks mass-assignment or unsafe evidence references', () => {
    expect(recoveryCaseIdSchema.safeParse('frc_cm1234567890abcdef').success).toBe(true);
    expect(recoveryCaseIdSchema.safeParse('../etc/passwd').success).toBe(false);

    // Valid event payloads
    expect(
      addRecoveryEventBodySchema.safeParse({
        type: 'NOTE_ADDED',
        note: 'Reviewed Stripe dispute evidence package',
      }).success
    ).toBe(true);
    expect(
      addRecoveryEventBodySchema.safeParse({
        type: 'EVIDENCE_ATTACHED',
        note: 'Attached signed delivery receipt',
        evidenceRef: 'ref:stripe-dispute-doc-123',
      }).success
    ).toBe(true);

    // Missing evidenceRef on EVIDENCE_ATTACHED rejected
    expect(
      addRecoveryEventBodySchema.safeParse({
        type: 'EVIDENCE_ATTACHED',
        note: 'Missing attachment reference',
      }).success
    ).toBe(false);

    // Unsafe javascript:/data: evidenceRef rejected
    expect(
      addRecoveryEventBodySchema.safeParse({
        type: 'EVIDENCE_ATTACHED',
        note: 'Malicious reference',
        evidenceRef: 'javascript:alert(1)',
      }).success
    ).toBe(false);

    // Mass-assignment attempt to clear recoveryRequired rejected by .strict()
    expect(
      updateRecoveryStatusBodySchema.safeParse({
        status: 'INVESTIGATING',
        reason: 'Starting investigation',
        recoveryRequired: false,
      }).success
    ).toBe(false);

    // Fake terminal status rejected
    expect(
      updateRecoveryStatusBodySchema.safeParse({
        status: 'RESOLVED',
        reason: 'Attempting fake resolution',
      }).success
    ).toBe(false);

    // Assignment schema accepts null or admin ID, rejects extra fields
    expect(assignRecoveryCaseBodySchema.safeParse({ assignedAdminId: null }).success).toBe(true);
    expect(
      assignRecoveryCaseBodySchema.safeParse({ assignedAdminId: 'admin_1', role: 'ADMIN' }).success
    ).toBe(false);

    // List query defaults and bounds
    const parsedQuery = listRecoveryCasesQuerySchema.parse({});
    expect(parsedQuery).toMatchObject({
      page: 1,
      limit: 20,
      sortBy: 'lastActivityAt',
      sortOrder: 'desc',
    });
    expect(listRecoveryCasesQuerySchema.safeParse({ limit: 500 }).success).toBe(false);
  });

  it('prevents duplicate recovery case creation in ensureCaseInTx', async () => {
    const existingCase = {
      id: 'frc_disp_1',
      disputeId: 'disp_1',
      orderId: 'ord_1',
      sellerProfileId: 'sp_1',
      status: 'OPEN',
      recoveryAmount: new Prisma.Decimal('100.00'),
    };
    const createCase = vi.fn();
    const createEvent = vi.fn();
    const tx = {
      financialRecoveryCase: {
        findUnique: vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(existingCase),
        create: createCase.mockResolvedValueOnce(existingCase),
      },
      financialRecoveryEvent: {
        findUnique: vi.fn().mockResolvedValueOnce(null),
        create: createEvent.mockResolvedValueOnce({ id: 'fre_1', type: 'CASE_OPENED' }),
      },
    } as unknown as Tx;

    const first = await RecoveryCaseService.ensureCaseInTx(tx, {
      disputeId: 'disp_1',
      orderId: 'ord_1',
      sellerProfileId: 'sp_1',
      recoveryAmountCents: 10000,
    });
    const second = await RecoveryCaseService.ensureCaseInTx(tx, {
      disputeId: 'disp_1',
      orderId: 'ord_1',
      sellerProfileId: 'sp_1',
      recoveryAmountCents: 10000,
    });

    expect(first.id).toBe('frc_disp_1');
    expect(second.id).toBe('frc_disp_1');
    expect(createCase).toHaveBeenCalledTimes(1);
    expect(createEvent).toHaveBeenCalledTimes(1);
  });
});
