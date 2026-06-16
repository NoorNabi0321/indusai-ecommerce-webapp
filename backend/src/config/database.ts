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
 * (Neon) auto-suspends when idle, and a DEEP suspend can take 30–60s+ to
 * cold-start — so we retry for up to ~60s before giving up (the first failed
 * attempts are what wake the compute). Once connected, the keep-alive below
 * holds it warm so this only matters on a cold start.
 */
export async function connectDatabase(retries = 12, delayMs = 5000): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await prisma.$connect();
      logger.info('🗄️  Database connected.');
      startKeepAlive();
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

/**
 * Neon's free tier auto-suspends the database after ~5 minutes of inactivity,
 * which terminates live connections (Postgres 57P01) and adds a cold-start delay
 * to the next request. A light `SELECT 1` every 4 minutes keeps the compute warm
 * while the server is running — eliminating those connection-termination logs and
 * keeping demos snappy. Failures are swallowed (the pool reconnects on its own).
 */
let keepAliveTimer: NodeJS.Timeout | undefined;

function startKeepAlive(): void {
  if (keepAliveTimer) return;
  keepAliveTimer = setInterval(() => {
    void prisma.$queryRaw`SELECT 1`.catch(() => undefined);
  }, 4 * 60_000);
  keepAliveTimer.unref(); // don't keep the process alive just for this
}

/** Disconnect cleanly during graceful shutdown. */
export async function disconnectDatabase(): Promise<void> {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = undefined;
  }
  await prisma.$disconnect();
  logger.info('Database disconnected.');
}
