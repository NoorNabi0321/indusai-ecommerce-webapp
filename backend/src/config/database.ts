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

/**
 * Verify connectivity at startup, retrying with backoff. Serverless Postgres
 * (Neon) auto-suspends when idle and can take a few seconds to cold-start, so a
 * single attempt may time out — we retry before giving up.
 */
export async function connectDatabase(retries = 5, delayMs = 3000): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await prisma.$connect();
      logger.info('🗄️  Database connected.');
      return;
    } catch (error) {
      if (attempt === retries) throw error;
      logger.warn(
        `Database connection attempt ${attempt}/${retries} failed; retrying in ${delayMs}ms…`,
      );
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

/** Disconnect cleanly during graceful shutdown. */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info('Database disconnected.');
}
