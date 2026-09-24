import { prisma } from '../../lib/prisma';

export class RecommendationService {
  /**
   * Tính toán và trả về danh sách gợi ý dựa trên Deterministic Scoring
   */
  static async getRecommendations(context?: { categoryId?: string; limit?: number }) {
    const limit = context?.limit || 10;
    
    // 1. Fetch a pool of candidate services
    // For a real production app, we wouldn't fetch ALL, but rather filter candidates first
    // Since we don't have ML yet, we'll fetch up to 100 recent/active services to score them
    const candidates = await prisma.service.findMany({
      where: { status: 'PUBLISHED' },
      take: 100,
      include: {
        category: true,
        packages: {
          take: 1,
          orderBy: { price: 'asc' } // just to get a starting price
        },
        seller: {
          select: {
            ratingAverage: true,
            ratingCount: true,
            status: true,
            user: { select: { email: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // 2. Score each candidate
    const scoredServices = candidates.map(service => {
      let score = 0;

      // Factor 1: Rating (Max ~50 points)
      score += (service.ratingAverage || 0) * 10;

      // Factor 2: Review/Order Count Popularity (Max 20 points)
      // Using log scale or capped linear so popular ones don't dominate completely
      const popularityBonus = Math.min((service.ratingCount || 0) * 0.5, 20);
      score += popularityBonus;

      // Factor 3: Category Match (Contextual) - Add 30 points if it matches user's current category interest
      if (context?.categoryId && service.categoryId === context.categoryId) {
        score += 30;
      }

      // Factor 4: Freshness Boost (Help new sellers) - Max 15 points
      const daysSinceCreated = (Date.now() - service.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreated < 7) {
        score += 15; // New service boost
      } else if (daysSinceCreated < 30) {
        score += 5;
      }

      return {
        ...service,
        recommendationScore: parseFloat(score.toFixed(2))
      };
    });

    // 3. Sort by score descending
    scoredServices.sort((a, b) => b.recommendationScore - a.recommendationScore);

    // 4. Return top N
    return scoredServices.slice(0, limit);
  }
}
