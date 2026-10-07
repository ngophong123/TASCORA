import { publicSellerSelect } from '../../lib/public-profile';
import { Prisma } from '@prisma/client';
import { HttpError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';

export class FavoriteService {
  static async addFavorite(userId: string, serviceId: string) {
    // Check if the service exists
    const service = await prisma.service.findFirst({
      where: { id: serviceId, status: 'PUBLISHED', seller: { status: 'APPROVED', user: { status: 'ACTIVE' } } }
    });

    if (!service || service.status !== 'PUBLISHED') {
      throw new HttpError(404, 'Service not found');
    }

    // Upsert or just create. Unique constraint will throw if exists.
    // Using try-catch to handle duplicate gracefully
    try {
      const favorite = await prisma.favorite.create({
        data: {
          userId,
          serviceId
        }
      });
      return favorite;
    } catch (error) {
      // P2002 is Prisma's unique constraint violation error code
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new HttpError(409, 'Already favorited');
      }
      throw error;
    }
  }

  static async removeFavorite(userId: string, serviceId: string) {
    try {
      await prisma.favorite.delete({
        where: {
          userId_serviceId: {
            userId,
            serviceId
          }
        }
      });
      return { success: true };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new HttpError(404, 'Favorite not found');
      }
      throw error;
    }
  }

  static async getMyFavorites(userId: string) {
    const favorites = await prisma.favorite.findMany({
      where: { userId, service: { status: 'PUBLISHED', seller: { status: 'APPROVED', user: { status: 'ACTIVE' } } } },
      include: {
        service: {
          include: {
            seller: { select: publicSellerSelect },
            category: true,
            packages: true,
            images: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Format output to return services directly for convenience
    return favorites.map(fav => ({
      favoriteId: fav.id,
      favoritedAt: fav.createdAt,
      ...fav.service
    }));
  }
}
