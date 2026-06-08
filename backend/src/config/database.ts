import { PrismaClient } from '@prisma/client';
import { env } from './env';
import { logger } from '../utils/logger';

/**
 * Prisma client singleton. In dev, ts-node-dev re-runs the module on changes,
 * so we cache the client on `globalThis` to avoid exhausting DB connections.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/** Verify connectivity at startup; throws if the database is unreachable. */
export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
  logger.info('🗄️  Database connected.');
}

/** Disconnect cleanly during graceful shutdown. */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info('Database disconnected.');
}
