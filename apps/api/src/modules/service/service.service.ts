import { prisma } from '../../lib/prisma';

export class ServiceService {
  static async createService(userId: string, data: any) {
    const seller = await prisma.sellerProfile.findUnique({ where: { userId } });
    if (!seller) throw new Error('Seller profile not found');

    return prisma.service.create({
      data: {
        sellerProfileId: seller.id,
        categoryId: data.categoryId,
        title: data.title,
        description: data.description,
        status: 'PUBLISHED', // Tạm thời auto publish để test dễ dàng
      },
    });
  }

  static async getMyServices(userId: string) {
    const seller = await prisma.sellerProfile.findUnique({ where: { userId } });
    if (!seller) throw new Error('Seller profile not found');

    return prisma.service.findMany({
      where: { sellerProfileId: seller.id },
      include: {
        category: true,
        packages: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async updateService(userId: string, serviceId: string, data: any) {
    const seller = await prisma.sellerProfile.findUnique({ where: { userId } });
    if (!seller) throw new Error('Seller profile not found');

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || service.sellerProfileId !== seller.id) {
      throw new Error('Service not found or unauthorized');
    }

    return prisma.service.update({
      where: { id: serviceId },
      data,
    });
  }

  static async addPackage(userId: string, serviceId: string, data: any) {
    const seller = await prisma.sellerProfile.findUnique({ where: { userId } });
    if (!seller) throw new Error('Seller profile not found');

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || service.sellerProfileId !== seller.id) {
      throw new Error('Service not found or unauthorized');
    }

    return prisma.servicePackage.upsert({
      where: {
        serviceId_type: {
          serviceId,
          type: data.type,
        },
      },
      update: data,
      create: {
        ...data,
        serviceId,
      },
    });
  }

  static async searchServices(query: any) {
    const { q, categoryId, minPrice, maxPrice, rating, deliveryTime, sort, page = 1, limit = 10 } = query;
    const where: any = { status: 'PUBLISHED' };

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (rating) {
      where.ratingAverage = { gte: rating };
    }
    
    if (minPrice !== undefined || maxPrice !== undefined || deliveryTime !== undefined) {
      where.packages = { some: {} };
      if (minPrice !== undefined || maxPrice !== undefined) {
        where.packages.some.price = {};
        if (minPrice !== undefined) where.packages.some.price.gte = minPrice;
        if (maxPrice !== undefined) where.packages.some.price.lte = maxPrice;
      }
      if (deliveryTime !== undefined) {
        where.packages.some.deliveryDays = { lte: deliveryTime };
      }
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'rating') {
      orderBy = { ratingAverage: 'desc' };
    } else if (sort === 'popular') {
      orderBy = { ratingCount: 'desc' };
    }

    const skip = (page - 1) * limit;

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        include: {
          seller: { include: { user: { select: { email: true } } } },
          category: true,
          packages: true,
          images: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.service.count({ where }),
    ]);

    return { services, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async getServiceById(id: string) {
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        seller: { include: { user: { select: { email: true } } } },
        category: true,
        packages: true,
        images: true,
        faqs: true,
        requirements: true,
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { buyer: { select: { buyerProfile: true } } }
        }
      },
    });
    
    if (!service) throw new Error('Service not found');
    return service;
  }
}
