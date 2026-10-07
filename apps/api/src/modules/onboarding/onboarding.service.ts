import { z } from 'zod';
import { updateOnboardingStepSchema } from './onboarding.schema';
import { prisma } from '../../lib/prisma';
import { HttpError } from '../../lib/errors';
import { assertOwnedUpload } from '../upload/references';

export class OnboardingService {
  static async updateStep(userId: string, step: number, data: z.infer<typeof updateOnboardingStepSchema>['body']) {
    assertOwnedUpload(data.avatar, userId, true);
    const existing = await prisma.sellerProfile.findUnique({ where: { userId } });
    if (existing && !['DRAFT', 'REJECTED'].includes(existing.status)) throw new HttpError(409, 'Seller profile is already submitted or approved');
    if (existing) {
      const changed = await prisma.sellerProfile.updateMany({ where: { id: existing.id, status: { in: ['DRAFT', 'REJECTED'] } }, data: { ...data, onboardingStep: step + 1 } });
      if (changed.count !== 1) throw new HttpError(409, 'Seller profile changed during save');
      return prisma.sellerProfile.findUnique({ where: { id: existing.id } });
    }
    const profile = await prisma.sellerProfile.create({
      data: {
        userId,
        skills: [],
        languages: [],
        ...data,
        onboardingStep: step + 1,
      },
    });
    return profile;
  }

  static async submit(userId: string) {
    const profile = await prisma.sellerProfile.findUnique({ where: { userId } });
    if (!profile) throw new HttpError(404, 'Profile not found');
    if (!['DRAFT', 'REJECTED'].includes(profile.status)) throw new HttpError(409, 'Seller profile is already submitted or approved');

    // Basic validation to ensure required fields are present
    const requiredFields = ['firstName', 'lastName', 'professionalTitle', 'bio', 'hourlyRate'] as const;
    for (const field of requiredFields) {
      if (!profile[field]) {
        throw new HttpError(400, `Missing required field: ${field}`);
      }
    }

    const changed = await prisma.sellerProfile.updateMany({
      where: { userId, status: { in: ['DRAFT', 'REJECTED'] }, updatedAt: profile.updatedAt },
      data: {
        status: 'PENDING_REVIEW',
        verificationStatus: 'PENDING',
      },
    });

    if (changed.count !== 1) throw new HttpError(409, 'Profile changed during submission; reload and retry');
    return prisma.sellerProfile.findUnique({ where: { userId } });
  }
}
