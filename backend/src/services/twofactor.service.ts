import { authenticator } from 'otplib';
import type { UserRole } from '@prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { writeAuditLog } from './audit.service';

interface Actor {
  id: string;
  role: UserRole;
  ip?: string;
}

const ISSUER = 'IndusAI Technology';

/**
 * Begins 2FA enrolment: generates a TOTP secret, stores it (NOT yet enabled),
 * and returns the otpauth URI + manual key for the authenticator app. Enrolment
 * only takes effect once the user verifies a code via `enable`.
 */
export async function setup2FA(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, twoFactorEnabled: true } });
  if (!user) throw AppError.notFound('User not found.');
  if (user.twoFactorEnabled) throw AppError.badRequest('Two-factor authentication is already enabled.');

  const secret = authenticator.generateSecret();
  await prisma.user.update({ where: { id: userId }, data: { twoFactorSecret: secret } });

  return {
    secret,
    otpauthUrl: authenticator.keyuri(user.email, ISSUER, secret),
  };
}

/** Verifies a code against the pending secret and switches 2FA on. */
export async function enable2FA(actor: Actor, token: string) {
  const user = await prisma.user.findUnique({ where: { id: actor.id }, select: { twoFactorSecret: true, twoFactorEnabled: true } });
  if (!user?.twoFactorSecret) throw AppError.badRequest('Start 2FA setup first.');
  if (user.twoFactorEnabled) throw AppError.badRequest('Two-factor authentication is already enabled.');
  if (!authenticator.verify({ token, secret: user.twoFactorSecret })) {
    throw AppError.badRequest('Invalid code. Check your authenticator app and try again.');
  }

  await prisma.user.update({ where: { id: actor.id }, data: { twoFactorEnabled: true } });
  await writeAuditLog({ actorId: actor.id, actorRole: actor.role, action: '2FA_ENABLE', target: 'User', targetId: actor.id, ipAddress: actor.ip });
  return { enabled: true };
}

/** Verifies a current code and switches 2FA off, clearing the secret. */
export async function disable2FA(actor: Actor, token: string) {
  const user = await prisma.user.findUnique({ where: { id: actor.id }, select: { twoFactorSecret: true, twoFactorEnabled: true } });
  if (!user?.twoFactorEnabled || !user.twoFactorSecret) throw AppError.badRequest('Two-factor authentication is not enabled.');
  if (!authenticator.verify({ token, secret: user.twoFactorSecret })) {
    throw AppError.badRequest('Invalid code.');
  }

  await prisma.user.update({ where: { id: actor.id }, data: { twoFactorEnabled: false, twoFactorSecret: null } });
  await writeAuditLog({ actorId: actor.id, actorRole: actor.role, action: '2FA_DISABLE', target: 'User', targetId: actor.id, ipAddress: actor.ip });
  return { enabled: false };
}

/** Validates a login-time TOTP code against a user's stored secret. */
export function verifyToken(secret: string, token: string): boolean {
  return authenticator.verify({ token, secret });
}
