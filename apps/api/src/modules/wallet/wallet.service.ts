import { prisma } from '../../lib/prisma';
import { Prisma, WalletTransactionType } from '@prisma/client';

export class WalletService {
  static async getWallet(userId: string) {
    let wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!wallet) {
      // Lazy init wallet if it doesn't exist
      wallet = await prisma.wallet.create({
        data: { userId },
        include: {
          transactions: true,
        },
      });
    }
    return wallet;
  }

  static async addTransaction(walletId: string, amount: number, type: WalletTransactionType, description?: string) {
    const delta = new Prisma.Decimal(amount);
    if (!delta.isFinite() || delta.isZero() || delta.decimalPlaces() > 2) throw new Error('Invalid wallet amount');
    const debit = type === WalletTransactionType.WITHDRAWAL || type === WalletTransactionType.PAYMENT;
    if (debit !== delta.isNegative()) throw new Error('Wallet transaction direction is invalid');
    return prisma.$transaction(async tx => {
      const updated = await tx.wallet.updateMany({ where: { id: walletId, ...(debit ? { balance: { gte: delta.negated() } } : {}) }, data: { balance: { increment: delta } } });
      if (updated.count !== 1) throw new Error('Wallet not found or insufficient funds');
      return tx.walletTransaction.create({ data: { walletId, amount: delta, type, description, status: 'SUCCEEDED' } });
    });
  }
}
