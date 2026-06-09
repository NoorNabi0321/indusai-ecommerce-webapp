import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters')
  .regex(/[A-Za-z]/, 'Password must contain a letter')
  .regex(/[0-9]/, 'Password must contain a number');

const otpSchema = z.string().regex(/^\d{6}$/, 'OTP must be 6 digits');

export const registerSchema = z.object({
  name: z.string().min(2, 'Name is too short').max(80),
  email: z.string().email('Enter a valid email').toLowerCase(),
  phone: z.string().min(7, 'Enter a valid phone number').max(20),
  password: passwordSchema,
});

export const verifyEmailSchema = z.object({
  userId: z.string().uuid('Invalid user reference'),
  otp: otpSchema,
});

export const resendVerificationSchema = z.object({
  userId: z.string().uuid('Invalid user reference'),
});

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email').toLowerCase(),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Enter a valid email').toLowerCase(),
  otp: otpSchema,
  password: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
