import { api } from '@/lib/axios';
import type { ApiSuccess } from '@/types/api.types';
import type { User, Address } from '@/types/user.types';

// ── Profile ──
export async function updateProfile(data: { name?: string; phone?: string }): Promise<User> {
  const { data: res } = await api.patch<ApiSuccess<User>>('/users/me', data);
  return res.data;
}

export async function changePassword(payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  await api.patch('/users/me/password', payload);
}

export async function uploadAvatar(file: File): Promise<User> {
  const form = new FormData();
  form.append('avatar', file);
  const { data } = await api.post<ApiSuccess<User>>('/users/me/avatar', form);
  return data.data;
}

// ── Addresses ──
export type AddressPayload = Omit<Address, 'id' | 'userId'>;

export async function getAddresses(): Promise<Address[]> {
  const { data } = await api.get<ApiSuccess<Address[]>>('/addresses');
  return data.data;
}

export async function createAddress(payload: AddressPayload): Promise<Address> {
  const { data } = await api.post<ApiSuccess<Address>>('/addresses', payload);
  return data.data;
}

export async function updateAddress(id: string, payload: Partial<AddressPayload>): Promise<Address> {
  const { data } = await api.patch<ApiSuccess<Address>>(`/addresses/${id}`, payload);
  return data.data;
}

export async function setDefaultAddress(id: string): Promise<Address> {
  const { data } = await api.patch<ApiSuccess<Address>>(`/addresses/${id}/default`);
  return data.data;
}

export async function deleteAddress(id: string): Promise<void> {
  await api.delete(`/addresses/${id}`);
}
