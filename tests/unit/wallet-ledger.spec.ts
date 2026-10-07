import { beforeEach, expect, it, vi } from 'vitest';
import { Prisma, WalletTransactionType } from '@prisma/client';
const state = vi.hoisted(() => ({ balance: '10.00', ledger: vi.fn() }));
vi.mock('../../apps/api/src/lib/prisma', () => {
  const tx = {
    wallet: { updateMany: async ({ where, data }: { where: { balance?: { gte: Prisma.Decimal } }; data: { balance: { increment: Prisma.Decimal } } }) => {
      const balance = new Prisma.Decimal(state.balance);
      if (where.balance && balance.lt(where.balance.gte)) return { count: 0 };
      state.balance = balance.add(data.balance.increment).toFixed(2); return { count: 1 };
    } },
    walletTransaction: { create: state.ledger },
  };
  return { prisma: { $transaction: async (fn: (client: typeof tx) => Promise<unknown>) => fn(tx) } };
});
import { WalletService } from '../../apps/api/src/modules/wallet/wallet.service';
beforeEach(() => { state.balance = '10.00'; state.ledger.mockReset().mockResolvedValue({ id: 'ledger' }); });
it('uses exact decimal additions for wallet credit', async () => {
  await WalletService.addTransaction('wallet', 0.1, WalletTransactionType.DEPOSIT);
  await WalletService.addTransaction('wallet', 0.2, WalletTransactionType.DEPOSIT);
  expect(state.balance).toBe('10.30');
});
it('rejects invalid precision and incorrect transaction direction', async () => {
  await expect(WalletService.addTransaction('wallet', 0.001, WalletTransactionType.DEPOSIT)).rejects.toThrow();
  await expect(WalletService.addTransaction('wallet', 7, WalletTransactionType.WITHDRAWAL)).rejects.toThrow();
  expect(state.ledger).not.toHaveBeenCalled();
});
it('enforces an atomic balance guard when two debits race', async () => {
  const results = await Promise.allSettled([WalletService.addTransaction('wallet', -7, WalletTransactionType.WITHDRAWAL), WalletService.addTransaction('wallet', -7, WalletTransactionType.WITHDRAWAL)]);
  expect(results.filter(value => value.status === 'fulfilled')).toHaveLength(1);
  expect(state.balance).toBe('3.00'); expect(state.ledger).toHaveBeenCalledOnce();
});
