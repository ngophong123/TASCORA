import { prisma } from '../../lib/prisma';
import { HttpError } from '../../lib/errors';
import { computeMarketplaceKpis, toCents } from './kpi-calculator';

export interface DateRangeFilter {
  from?: Date;
  to?: Date;
}

function buildCreatedAtFilter(range?: DateRangeFilter) {
  if (!range?.from && !range?.to) return undefined;
  return {
    ...(range.from ? { gte: range.from } : {}),
    ...(range.to ? { lte: range.to } : {}),
  };
}

export class AnalyticsService {
  static async getSellerDashboardMetrics(userId: string, range?: DateRangeFilter) {
    const seller = await prisma.sellerProfile.findUnique({
      where: { userId },
    });

    if (!seller) {
      throw new HttpError(404, 'Seller profile not found');
    }

    const sellerId = seller.id;
    const createdAt = buildCreatedAtFilter(range);
    const orderWhere = { sellerId, ...(createdAt ? { createdAt } : {}) };

    const [orders, refunds, disputes, ledgerAgg] = await Promise.all([
      prisma.order.findMany({
        where: orderWhere,
        select: { id: true, status: true, amount: true, createdAt: true },
      }),
      prisma.refund.findMany({
        where: { order: orderWhere },
        select: { orderId: true, status: true, amount: true },
      }),
      prisma.marketplaceDispute.findMany({
        where: { order: orderWhere },
        select: { orderId: true },
      }),
      prisma.financialEntry.aggregate({
        where: { order: orderWhere },
        _sum: {
          pendingDelta: true,
          availableDelta: true,
          reservedDelta: true,
          paidDelta: true,
          feeDelta: true,
        },
      }),
    ]);

    const kpis = computeMarketplaceKpis({
      orders: orders.map((o) => ({
        id: o.id,
        status: o.status,
        amountCents: toCents(o.amount),
        createdAt: o.createdAt,
      })),
      refunds: refunds.map((r) => ({
        orderId: r.orderId,
        status: r.status,
        amountCents: toCents(r.amount),
      })),
      disputedOrderIds: disputes.map((d) => d.orderId),
      ledger: {
        pendingCents: toCents(ledgerAgg._sum.pendingDelta),
        availableCents: toCents(ledgerAgg._sum.availableDelta),
        reservedCents: toCents(ledgerAgg._sum.reservedDelta),
        paidCents: toCents(ledgerAgg._sum.paidDelta),
        feeCents: toCents(ledgerAgg._sum.feeDelta),
      },
      profileViews: null,
    });

    const completedOrderValue = Number(
      (
        orders
          .filter((o) => o.status === 'COMPLETED')
          .reduce((sum, o) => sum + toCents(o.amount), 0) / 100
      ).toFixed(2)
    );

    return {
      totalEarnings: Number(kpis.sellerEarnings),
      completedOrderValue,
      activeOrdersCount: kpis.orderVolume.active,
      completedOrdersCount: kpis.orderVolume.completed,
      averageRating: seller.ratingAverage,
      profileViews: kpis.profileViews,
      conversionRate: kpis.conversionRate,
      sellerStatus: seller.status,
      sellerLevel: seller.level,
      kpis,
      dateRange: {
        from: range?.from?.toISOString() ?? null,
        to: range?.to?.toISOString() ?? null,
      },
      dataLabel: process.env.APP_ENV === 'production' ? 'Live Data' : 'Demo Data',
    };
  }

  static async getAdminPlatformKpis(range?: DateRangeFilter) {
    const createdAt = buildCreatedAtFilter(range);
    const orderWhere = createdAt ? { createdAt } : {};

    const [orders, refunds, disputes, ledgerAgg, approvedSellers, publishedServices] =
      await Promise.all([
        prisma.order.findMany({
          where: orderWhere,
          select: { id: true, status: true, amount: true, createdAt: true },
        }),
        prisma.refund.findMany({
          where: createdAt ? { order: { createdAt } } : {},
          select: { orderId: true, status: true, amount: true },
        }),
        prisma.marketplaceDispute.findMany({
          where: createdAt ? { order: { createdAt } } : {},
          select: { orderId: true },
        }),
        prisma.financialEntry.aggregate({
          where: createdAt ? { order: { createdAt } } : {},
          _sum: {
            pendingDelta: true,
            availableDelta: true,
            reservedDelta: true,
            paidDelta: true,
            feeDelta: true,
          },
        }),
        prisma.sellerProfile.count({ where: { status: 'APPROVED' } }),
        prisma.service.count({ where: { status: 'PUBLISHED' } }),
      ]);

    const kpis = computeMarketplaceKpis({
      orders: orders.map((o) => ({
        id: o.id,
        status: o.status,
        amountCents: toCents(o.amount),
        createdAt: o.createdAt,
      })),
      refunds: refunds.map((r) => ({
        orderId: r.orderId,
        status: r.status,
        amountCents: toCents(r.amount),
      })),
      disputedOrderIds: disputes.map((d) => d.orderId),
      ledger: {
        pendingCents: toCents(ledgerAgg._sum.pendingDelta),
        availableCents: toCents(ledgerAgg._sum.availableDelta),
        reservedCents: toCents(ledgerAgg._sum.reservedDelta),
        paidCents: toCents(ledgerAgg._sum.paidDelta),
        feeCents: toCents(ledgerAgg._sum.feeDelta),
      },
      profileViews: null,
    });

    return {
      kpis,
      marketplaceHealth: {
        approvedSellers,
        publishedServices,
      },
      dateRange: {
        from: range?.from?.toISOString() ?? null,
        to: range?.to?.toISOString() ?? null,
      },
      dataLabel: process.env.APP_ENV === 'production' ? 'Live Data' : 'Demo Data',
    };
  }
}
