import { z } from 'zod';

const code = z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit code');

export const twoFactorTokenSchema = z.object({ token: code });

export const verifyTwoFactorLoginSchema = z.object({
  userId: z.string().uuid(),
  token: code,
});
