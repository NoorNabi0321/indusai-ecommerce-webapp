import crypto from 'node:crypto';
import type { OTPType } from '@prisma/client';
import { prisma } from '../config/database';

/** OTP lifetime in minutes. */
const OTP_TTL_MINUTES = 10;

/** Generate a cryptographically-random 6-digit numeric code. */
export function generateOTP(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
}

/**
 * Create and persist an OTP for a user, invalidating any prior unused codes of
 * the same type. Returns the plaintext code (to be emailed).
 */
export async function createOTPRecord(userId: string, type: OTPType): Promise<string> {
  const code = generateOTP();

  await prisma.oTPRecord.updateMany({
    where: { userId, type, isUsed: false },
    data: { isUsed: true },
  });

  await prisma.oTPRecord.create({
    data: {
      userId,
      code,
      type,
      expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60_000),
    },
  });

  return code;
}

/** Validate a code; marks it used on success. Returns whether it was valid. */
export async function verifyOTPRecord(
  userId: string,
  code: string,
  type: OTPType,
): Promise<boolean> {
  const record = await prisma.oTPRecord.findFirst({
    where: { userId, code, type, isUsed: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });

  if (!record) return false;

  await prisma.oTPRecord.update({
    where: { id: record.id },
    data: { isUsed: true },
  });

  return true;
}
