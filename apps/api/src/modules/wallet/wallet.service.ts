import { prisma } from '../../lib/prisma';
import { WalletTransactionType } from '@prisma/client';

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
    const transaction = await prisma.$transaction(async (tx) => {
      // Tạo record giao dịch
      const newTx = await tx.walletTransaction.create({
        data: {
          walletId,
          amount,
          type,
          description,
          status: 'SUCCEEDED',
        },
      });

      // Cập nhật số dư
      const wallet = await tx.wallet.findUnique({ where: { id: walletId } });
      if (!wallet) throw new Error('Wallet not found');

      const updatedBalance = Number(wallet.balance) + amount;
      
      if (updatedBalance < 0) {
        throw new Error('Insufficient funds');
      }

      await tx.wallet.update({
        where: { id: walletId },
        data: { balance: updatedBalance },
      });

      return newTx;
    });

    return transaction;
  }
}
