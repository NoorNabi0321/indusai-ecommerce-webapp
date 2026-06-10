import { api } from '@/lib/axios';
import type { ApiSuccess } from '@/types/api.types';

export interface ReturnResult {
  id: string;
  status: string;
  orderNumber: string;
}

export async function createReturn(formData: FormData): Promise<ReturnResult> {
  const { data } = await api.post<ApiSuccess<ReturnResult>>('/returns', formData);
  return data.data;
}
