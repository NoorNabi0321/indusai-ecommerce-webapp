import type { User } from '@prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { hashPassword, comparePassword } from '../utils/hash';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getTokenExpiry,
} from '../utils/jwt';
import { createOTPRecord, verifyOTPRecord } from '../utils/otp';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email';
import { writeAuditLog } from './audit.service';
import { verifyToken as verifyTotp } from './twofactor.service';

export type SafeUser = Omit<User, 'password' | 'twoFactorSecret'>;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  password: string;
}

/** Strip secrets (password hash, 2FA secret) before returning a user to the client. */
function sanitize(user: User): SafeUser {
  const { password: _password, twoFactorSecret: _twoFactorSecret, ...safe } = user;
  return safe;
}

/** Issue an access + refresh token pair and persist the refresh token. */
async function issueTokens(user: User): Promise<AuthTokens> {
  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: { userId: user.id, token: refreshToken, expiresAt: getTokenExpiry(refreshToken) },
  });

  return { accessToken, refreshToken };
}

// ──────────────────────────────── Register ───────────────────────────────

export async function registerCustomer(input: RegisterInput): Promise<SafeUser> {
  const email = input.email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw AppError.conflict('An account with this email already exists.');
  }
  if (input.phone) {
    const phoneTaken = await prisma.user.findUnique({ where: { phone: input.phone } });
    if (phoneTaken) {
      throw AppError.conflict('An account with this phone number already exists.');
    }
  }

  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email,
      phone: input.phone,
      password: await hashPassword(input.password),
      role: 'CUSTOMER',
      // TEMPORARY: email verification is disabled while running on the Resend
      // sandbox (which can't deliver OTPs to arbitrary addresses). New accounts
      // are created pre-verified so the user can log in immediately.
      // To re-enable OTP: set this back to `false` and restore the two lines
      // below (createOTPRecord + sendVerificationEmail), and point RegisterPage
      // back to '/auth/verify-otp'.
      isVerified: true,
    },
  });

  // const otp = await createOTPRecord(user.id, 'EMAIL_VERIFY');
  // await sendVerificationEmail(user.email, user.name, otp);

  return sanitize(user);
}

// ───────────────────────────── Email verify ──────────────────────────────

export async function verifyEmail(userId: string, otp: string): Promise<SafeUser> {
  const valid = await verifyOTPRecord(userId, otp, 'EMAIL_VERIFY');
  if (!valid) {
    throw AppError.badRequest('Invalid or expired verification code.');
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { isVerified: true },
  });

  return sanitize(user);
}

/** Re-send a verification code for an unverified account. */
export async function resendVerification(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.isVerified) return;
  const otp = await createOTPRecord(user.id, 'EMAIL_VERIFY');
  await sendVerificationEmail(user.email, user.name, otp);
}

// ─────────────────────────────────  Login ────────────────────────────────

export async function login(
  email: string,
  password: string,
  meta?: { ip?: string },
): Promise<{ user: SafeUser } & AuthTokens> {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user) {
    throw AppError.unauthorized('Invalid email or password.');
  }
  if (!user.isActive) {
    throw AppError.forbidden('Your account has been suspended. Please contact support.');
  }

  const ok = await comparePassword(password, user.password);
  if (!ok) {
    throw AppError.unauthorized('Invalid email or password.');
  }

  if (!user.isVerified) {
    // Surface the user id so the client can route to the OTP screen.
    throw new AppError('Please verify your email to continue.', 403, 'EMAIL_NOT_VERIFIED', {
      userId: user.id,
    });
  }

  // Password is correct — if 2FA is on, defer token issuance to the code step.
  if (user.twoFactorEnabled) {
    throw new AppError('Two-factor authentication code required.', 401, 'TWO_FACTOR_REQUIRED', {
      userId: user.id,
    });
  }

  return completeLogin(user, meta);
}

/** Second step of a 2FA login — validates the TOTP code, then issues tokens. */
export async function verifyTwoFactorLogin(
  userId: string,
  token: string,
  meta?: { ip?: string },
): Promise<{ user: SafeUser } & AuthTokens> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.isActive) throw AppError.unauthorized('Account unavailable.');
  if (!user.twoFactorEnabled || !user.twoFactorSecret) {
    throw AppError.badRequest('Two-factor authentication is not enabled for this account.');
  }
  if (!verifyTotp(user.twoFactorSecret, token)) {
    throw AppError.unauthorized('Invalid authentication code.');
  }
  return completeLogin(user, meta);
}

/** Issues tokens and records staff sign-ins. Shared by both login paths. */
async function completeLogin(user: User, meta?: { ip?: string }): Promise<{ user: SafeUser } & AuthTokens> {
  const tokens = await issueTokens(user);

  // Record staff sign-ins so they surface in the admin settings activity log.
  if (user.role === 'ADMINISTRATOR' || user.role === 'OWNER') {
    await writeAuditLog({
      actorId: user.id,
      actorRole: user.role,
      action: 'LOGIN',
      target: 'Session',
      ipAddress: meta?.ip,
    });
  }

  return { user: sanitize(user), ...tokens };
}

// ──────────────────────────────── Refresh ────────────────────────────────

export async function refreshTokens(
  oldToken: string,
): Promise<{ user: SafeUser } & AuthTokens> {
  let payload: { sub: string };
  try {
    payload = verifyRefreshToken(oldToken);
  } catch {
    throw AppError.unauthorized('Invalid or expired session.');
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token: oldToken } });
  if (!stored) {
    throw AppError.unauthorized('Session not recognised. Please sign in again.');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.isActive) {
    throw AppError.unauthorized('Account unavailable.');
  }

  // Rotate: invalidate the used refresh token, issue a fresh pair.
  await prisma.refreshToken.delete({ where: { id: stored.id } });
  const tokens = await issueTokens(user);

  return { user: sanitize(user), ...tokens };
}

// ──────────────────────────────── Logout ─────────────────────────────────

export async function logout(refreshToken: string): Promise<void> {
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
}

// ───────────────────────── Password reset flow ───────────────────────────

export async function forgotPassword(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  // Always resolve silently — never reveal whether an email is registered.
  if (!user || !user.isActive) return;

  const otp = await createOTPRecord(user.id, 'PASSWORD_RESET');
  await sendPasswordResetEmail(user.email, user.name, otp);
}

export async function resetPassword(
  email: string,
  otp: string,
  newPassword: string,
): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  // Generic error — never reveal whether the email exists.
  if (!user) {
    throw AppError.badRequest('Invalid or expired reset code.');
  }

  const valid = await verifyOTPRecord(user.id, otp, 'PASSWORD_RESET');
  if (!valid) {
    throw AppError.badRequest('Invalid or expired reset code.');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { password: await hashPassword(newPassword) },
  });

  // Force re-authentication everywhere.
  await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
}

/** Fetch the current user (for GET /auth/me). */
export async function getCurrentUser(userId: string): Promise<SafeUser> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw AppError.notFound('User not found.');
  return sanitize(user);
}
