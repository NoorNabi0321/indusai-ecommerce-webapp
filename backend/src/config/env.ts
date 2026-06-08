import path from 'node:path';
import { config } from 'dotenv';
import { z } from 'zod';

/**
 * Load environment variables. Single source of truth is the monorepo-root `.env`;
 * a `backend/.env` (if present) is also loaded as a fallback. dotenv does not
 * override already-set vars, so root values win.
 */
config({ path: path.resolve(process.cwd(), '../.env') });
config();

/**
 * Treat empty strings (`KEY=` in .env) as undefined so optional, phase-gated
 * keys don't accidentally parse as set.
 */
const emptyToUndefined = (v: unknown) => (v === '' ? undefined : v);
const optionalString = z.preprocess(emptyToUndefined, z.string().optional());

const envSchema = z.object({
  // ── App (required, with sensible defaults) ──
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),

  // ── JWT (required — server refuses to start without these) ──
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 chars'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 chars'),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('7d'),

  // ── Database (Phase 2) ──
  DATABASE_URL: optionalString,

  // ── Seed owner (Phase 2.1) ──
  SEED_OWNER_EMAIL: optionalString,
  SEED_OWNER_PASSWORD: optionalString,

  // ── Cloudinary (Phase 3) ──
  CLOUDINARY_CLOUD_NAME: optionalString,
  CLOUDINARY_API_KEY: optionalString,
  CLOUDINARY_API_SECRET: optionalString,

  // ── SendGrid (Phase 2 / 11) ──
  SENDGRID_API_KEY: optionalString,
  SENDGRID_FROM_EMAIL: optionalString,

  // ── Twilio (Phase 11, optional) ──
  TWILIO_ACCOUNT_SID: optionalString,
  TWILIO_AUTH_TOKEN: optionalString,
  TWILIO_VERIFY_SERVICE_SID: optionalString,
  TWILIO_PHONE_NUMBER: optionalString,

  // ── Stripe (Phase 10) ──
  STRIPE_SECRET_KEY: optionalString,
  STRIPE_PUBLISHABLE_KEY: optionalString,
  STRIPE_WEBHOOK_SECRET: optionalString,

  // ── JazzCash (Phase 10) ──
  JAZZCASH_MERCHANT_ID: optionalString,
  JAZZCASH_PASSWORD: optionalString,
  JAZZCASH_INTEGRITY_SALT: optionalString,
  JAZZCASH_SANDBOX_URL: optionalString,

  // ── Easypaisa (Phase 10) ──
  EASYPAISA_STORE_ID: optionalString,
  EASYPAISA_HASH_KEY: optionalString,
  EASYPAISA_SANDBOX_URL: optionalString,

  // ── OpenAI (Phase 9) ──
  OPENAI_API_KEY: optionalString,

  // ── Sentry (Phase 14) ──
  SENTRY_DSN_BACKEND: optionalString,
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // logger isn't available yet (it depends on env) — use console directly.
  console.error('❌ Invalid environment configuration:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
