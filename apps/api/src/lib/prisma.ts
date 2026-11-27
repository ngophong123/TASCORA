import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const IMMUTABLE_MODELS = new Set(['AdminAuditLog', 'KycReviewHistory', 'FinancialEntry']);
const MUTATING_ACTIONS = new Set(['update', 'updateMany', 'upsert', 'delete', 'deleteMany']);

function createConfiguredPrismaClient() {
  const client = new PrismaClient();
  // Defense-in-depth immutability guard complementing PostgreSQL BEFORE UPDATE/DELETE triggers.
  if (typeof client.$use === 'function') {
    client.$use(async (params, next) => {
      if (params.model && IMMUTABLE_MODELS.has(params.model) && MUTATING_ACTIONS.has(params.action)) {
        throw new Error(`${params.model} is append-only and immutable`);
      }
      return next(params);
    });
  }
  return client;
}

export const prisma = globalForPrisma.prisma || createConfiguredPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
