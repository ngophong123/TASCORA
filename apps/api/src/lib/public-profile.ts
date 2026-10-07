import type { Prisma } from '@prisma/client';
export const publicSellerSelect = {
  id: true, status: true, firstName: true, lastName: true, avatar: true, bio: true,
  professionalTitle: true, country: true, level: true, ratingAverage: true, ratingCount: true,
  skills: true, languages: true,
  createdAt: true,
} satisfies Prisma.SellerProfileSelect;
