import { prisma } from '../../lib/prisma';

export class FavoriteService {
  static async addFavorite(userId: string, serviceId: string) {
    // Check if the service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      throw new Error('Service not found');
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
    } catch (error: any) {
      // P2002 is Prisma's unique constraint violation error code
      if (error.code === 'P2002') {
        throw new Error('Already favorited');
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
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new Error('Favorite not found');
      }
      throw error;
    }
  }

  static async getMyFavorites(userId: string) {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        service: {
          include: {
            seller: {
              include: {
                user: { select: { email: true } }
              }
            },
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
