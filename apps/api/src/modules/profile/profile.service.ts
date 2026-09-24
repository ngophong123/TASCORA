import { prisma } from '../../lib/prisma';

export class ProfileService {
  static async getMyProfiles(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        buyerProfile: true,
        sellerProfile: true,
      },
    });
    
    if (!user) throw new Error('User not found');
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = user;
    return safeUser;
  }

  static async updateBuyerProfile(userId: string, data: any) {
    const profile = await prisma.buyerProfile.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      },
    });
    return profile;
  }

  static async updateSellerProfile(userId: string, data: any) {
    const profile = await prisma.sellerProfile.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      },
    });
    return profile;
  }
}
