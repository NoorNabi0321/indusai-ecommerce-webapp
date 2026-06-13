import { api } from '@/lib/axios';
import type { ApiSuccess } from '@/types/api.types';

export async function setup2FA(): Promise<{ secret: string; otpauthUrl: string }> {
  const { data } = await api.post<ApiSuccess<{ secret: string; otpauthUrl: string }>>('/users/me/2fa/setup');
  return data.data;
}

export async function enable2FA(token: string): Promise<void> {
  await api.post('/users/me/2fa/enable', { token });
}

export async function disable2FA(token: string): Promise<void> {
  await api.post('/users/me/2fa/disable', { token });
}
