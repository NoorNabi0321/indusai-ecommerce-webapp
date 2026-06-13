import { api } from '@/lib/axios';
import type { ApiSuccess } from '@/types/api.types';

export interface SystemConfig {
  id: string;
  storeName: string;
  supportEmail: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  codEnabled: boolean;
  stripeEnabled: boolean;
  jazzcashEnabled: boolean;
  easypaisaEnabled: boolean;
  codFee: number;
  codMinOrder: number;
  paymentMode: 'sandbox' | 'live';
  updatedAt: string;
}

export type ConfigPatch = Partial<Omit<SystemConfig, 'id' | 'updatedAt'>>;

export interface PublicConfig {
  storeName: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  paymentMode: 'sandbox' | 'live';
  payments: { cod: boolean; stripe: boolean; jazzcash: boolean; easypaisa: boolean };
  codFee: number;
  codMinOrder: number;
}

export async function getOwnerConfig(): Promise<SystemConfig> {
  const { data } = await api.get<ApiSuccess<SystemConfig>>('/owner/config');
  return data.data;
}

export async function updateOwnerConfig(patch: ConfigPatch): Promise<SystemConfig> {
  const { data } = await api.put<ApiSuccess<SystemConfig>>('/owner/config', patch);
  return data.data;
}

export async function getPublicConfig(): Promise<PublicConfig> {
  const { data } = await api.get<ApiSuccess<PublicConfig>>('/config/public');
  return data.data;
}
