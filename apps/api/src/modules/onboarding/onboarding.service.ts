import { prisma } from '../../lib/prisma';

export class OnboardingService {
  static async updateStep(userId: string, step: number, data: any) {
    const profile = await prisma.sellerProfile.upsert({
      where: { userId },
      update: {
        ...data,
        onboardingStep: step + 1, // Advance to next step automatically
      },
      create: {
        userId,
        ...data,
        onboardingStep: step + 1,
      },
    });
    return profile;
  }

  static async submit(userId: string) {
    const profile = await prisma.sellerProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Profile not found');

    // Basic validation to ensure required fields are present
    const requiredFields = ['firstName', 'lastName', 'professionalTitle', 'bio', 'hourlyRate'];
    for (const field of requiredFields) {
      if (!(profile as any)[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    const updatedProfile = await prisma.sellerProfile.update({
      where: { userId },
      data: {
        status: 'PENDING_REVIEW',
        verificationStatus: 'PENDING',
      },
    });

    return updatedProfile;
  }
}
