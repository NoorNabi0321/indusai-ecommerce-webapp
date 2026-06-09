import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import type { AddressInput, UpdateAddressInput } from '../validation/account.validation';

export function listAddresses(userId: string) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
  });
}

async function assertOwned(userId: string, id: string) {
  const address = await prisma.address.findUnique({ where: { id } });
  if (!address || address.userId !== userId) throw AppError.notFound('Address not found.');
  return address;
}

export async function createAddress(userId: string, data: AddressInput) {
  const count = await prisma.address.count({ where: { userId } });
  const makeDefault = data.isDefault || count === 0;
  if (makeDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }
  return prisma.address.create({ data: { ...data, userId, isDefault: makeDefault } });
}

export async function updateAddress(userId: string, id: string, data: UpdateAddressInput) {
  await assertOwned(userId, id);
  if (data.isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }
  return prisma.address.update({ where: { id }, data });
}

export async function setDefaultAddress(userId: string, id: string) {
  await assertOwned(userId, id);
  await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  return prisma.address.update({ where: { id }, data: { isDefault: true } });
}

export async function deleteAddress(userId: string, id: string) {
  await assertOwned(userId, id);
  const usedByOrder = await prisma.order.count({ where: { addressId: id } });
  if (usedByOrder > 0) {
    throw AppError.badRequest('This address is linked to an order and cannot be deleted.');
  }
  await prisma.address.delete({ where: { id } });
}
