import { api } from '@/lib/axios';
import type { ApiSuccess } from '@/types/api.types';

export async function createStripeIntent(orderId: string): Promise<{ clientSecret: string; amount: number; currency: string }> {
  const { data } = await api.post<ApiSuccess<{ clientSecret: string; amount: number; currency: string }>>(
    '/payments/stripe/create-intent',
    { orderId },
  );
  return data.data;
}

export async function confirmStripePayment(orderId: string): Promise<{ status: 'PAID' | 'FAILED' | 'PENDING' }> {
  const { data } = await api.post<ApiSuccess<{ status: 'PAID' | 'FAILED' | 'PENDING' }>>(
    '/payments/stripe/confirm',
    { orderId },
  );
  return data.data;
}
