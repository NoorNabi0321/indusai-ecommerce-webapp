import type { Server } from 'node:http';
import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { initSentry, captureException } from './utils/sentry';
import { connectDatabase, disconnectDatabase } from './config/database';

initSentry();

const app = createApp();
let server: Server;

async function start(): Promise<void> {
  await connectDatabase();
  server = app.listen(env.PORT, () => {
    logger.info(`🚀 IndusAI API running at http://localhost:${env.PORT}/api  [${env.NODE_ENV}]`);
    logger.info(`   Health check: http://localhost:${env.PORT}/api/health`);
  });
}

void start().catch((error) => {
  logger.error('Failed to start server:', error);
  captureException(error);
  process.exit(1);
});

// ── Process-level safety nets ──
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection:', reason);
  captureException(reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  captureException(error);
  // Uncaught exceptions leave the process in an undefined state — exit and let the host restart.
  process.exit(1);
});

// ── Graceful shutdown ──
function shutdown(signal: string): void {
  logger.info(`${signal} received — shutting down gracefully…`);
  server?.close(() => {
    void disconnectDatabase().finally(() => {
      logger.info('HTTP server closed. Bye 👋');
      process.exit(0);
    });
  });
  // Force-exit if connections don't drain in time.
  setTimeout(() => process.exit(1), 10_000).unref();
}

(['SIGINT', 'SIGTERM'] as const).forEach((signal) => {
  process.on(signal, () => shutdown(signal));
});
