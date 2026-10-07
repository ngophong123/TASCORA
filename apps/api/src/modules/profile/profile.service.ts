import { z } from 'zod';
import { updateBuyerProfileSchema, updateSellerProfileSchema } from './profile.schema';
import { prisma } from '../../lib/prisma';
import { assertOwnedUpload } from '../upload/references';

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
    
    const { password: _password, ...safeUser } = user;
    return safeUser;
  }

  static async updateBuyerProfile(userId: string, data: z.infer<typeof updateBuyerProfileSchema>['body']) {
    assertOwnedUpload(data.avatar, userId, true);
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

  static async updateSellerProfile(userId: string, data: z.infer<typeof updateSellerProfileSchema>['body']) {
    assertOwnedUpload(data.avatar, userId, true);
    const profile = await prisma.sellerProfile.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        skills: [],
        languages: [],
        ...data,
      },
    });
    return profile;
  }
}
