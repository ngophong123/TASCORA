import { publicSellerSelect } from '../../lib/public-profile';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { createServiceSchema, updateServiceSchema, createPackageSchema, searchServiceSchema } from './service.schema';
import { HttpError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';

export class ServiceService {
  static async createService(userId: string, data: z.infer<typeof createServiceSchema>['body']) {
    const seller = await prisma.sellerProfile.findUnique({ where: { userId } });
    if (!seller) throw new HttpError(403, 'A seller profile is required');

    return prisma.service.create({
      data: {
        sellerProfileId: seller.id,
        categoryId: data.categoryId,
        title: data.title,
        description: data.description,
        status: 'DRAFT', // Publication uses the existing admin review flow.
      },
    });
  }

  static async getMyServices(userId: string) {
    const seller = await prisma.sellerProfile.findUnique({ where: { userId } });
    if (!seller) throw new HttpError(403, 'A seller profile is required');

    return prisma.service.findMany({
      where: { sellerProfileId: seller.id },
      include: {
        category: true,
        packages: true,
        images: true,
        faqs: true,
        requirements: true,
        tags: { include: { tag: true } },
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async updateService(userId: string, serviceId: string, data: z.infer<typeof updateServiceSchema>['body']) {
    const seller = await prisma.sellerProfile.findUnique({ where: { userId } });
    if (!seller) throw new HttpError(403, 'A seller profile is required');

    return prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtext(${`service:${serviceId}`}))`;
      const service = await tx.service.findUnique({ where: { id: serviceId } });
      if (!service || service.sellerProfileId !== seller.id) throw new HttpError(404, 'Service not found');
      return tx.service.update({ where: { id: serviceId }, data: { ...data, status: 'DRAFT' } });
    });
  }

  static async addPackage(userId: string, serviceId: string, data: z.infer<typeof createPackageSchema>['body']) {
    const seller = await prisma.sellerProfile.findUnique({ where: { userId } });
    if (!seller) throw new HttpError(403, 'A seller profile is required');
    return prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtext(${`service:${serviceId}`}))`;
      const service = await tx.service.findUnique({ where: { id: serviceId } });
      if (!service || service.sellerProfileId !== seller.id) throw new HttpError(404, 'Service not found');
      const pkg = await tx.servicePackage.upsert({ where: { serviceId_type: { serviceId, type: data.type } }, update: data, create: { ...data, serviceId } });
      await tx.service.update({ where: { id: serviceId }, data: { status: 'DRAFT' } });
      return pkg;
    });
  }

  static async searchServices(query: unknown) {
    const { q, categoryId, minPrice, maxPrice, rating, deliveryTime, sort, page = 1, limit = 10 } = searchServiceSchema.shape.query.parse(query);
    const where: Prisma.ServiceWhereInput = { status: 'PUBLISHED', seller: { status: 'APPROVED', user: { status: 'ACTIVE' } }, packages: { some: { price: { gt: 0 } } } };

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
      const packageWhere: Prisma.ServicePackageWhereInput = {};
      packageWhere.price = { gt: 0, gte: minPrice, lte: maxPrice };
      if (deliveryTime !== undefined) packageWhere.deliveryDays = { lte: deliveryTime };
      where.packages = { some: packageWhere };
    }

    let orderBy: Prisma.ServiceOrderByWithRelationInput = { createdAt: 'desc' };
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
          seller: { select: publicSellerSelect },
          category: true,
          packages: true,
          images: true,
          tags: { include: { tag: true } },
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
    const service = await prisma.service.findFirst({
      where: { id, status: 'PUBLISHED', seller: { status: 'APPROVED', user: { status: 'ACTIVE' } }, packages: { some: { price: { gt: 0 } } } },
      include: {
        seller: { select: publicSellerSelect },
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
    
    if (!service || service.status !== 'PUBLISHED' || service.seller.status !== 'APPROVED') throw new HttpError(404, 'Service not found');
    return service;
  }
}
