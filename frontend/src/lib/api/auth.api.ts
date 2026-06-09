import { api } from '@/lib/axios';
import type { ApiSuccess } from '@/types/api.types';
import type { User, RegisterPayload } from '@/types/user.types';

interface AuthSession {
  user: User;
  accessToken: string;
}

/** Unwrap the standard { success, data } envelope. */
function unwrap<T>(body: ApiSuccess<T>): T {
  return body.data;
}

export async function registerApi(payload: RegisterPayload): Promise<User> {
  const { data } = await api.post<ApiSuccess<User>>('/auth/register', payload);
  return unwrap(data);
}

export async function verifyEmailApi(userId: string, otp: string): Promise<User> {
  const { data } = await api.post<ApiSuccess<User>>('/auth/verify-email', { userId, otp });
  return unwrap(data);
}

export async function resendVerificationApi(userId: string): Promise<void> {
  await api.post('/auth/resend-verification', { userId });
}

export async function loginApi(email: string, password: string): Promise<AuthSession> {
  const { data } = await api.post<ApiSuccess<AuthSession>>('/auth/login', { email, password });
  return unwrap(data);
}

export async function refreshApi(): Promise<AuthSession> {
  const { data } = await api.post<ApiSuccess<AuthSession>>('/auth/refresh', {});
  return unwrap(data);
}

export async function logoutApi(): Promise<void> {
  await api.post('/auth/logout', {});
}

export async function forgotPasswordApi(email: string): Promise<void> {
  await api.post('/auth/forgot-password', { email });
}

export async function resetPasswordApi(
  email: string,
  otp: string,
  password: string,
): Promise<void> {
  await api.post('/auth/reset-password', { email, otp, password });
}

export async function meApi(): Promise<User> {
  const { data } = await api.get<ApiSuccess<User>>('/auth/me');
  return unwrap(data);
}
