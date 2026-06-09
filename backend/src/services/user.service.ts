import type { User } from '@prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { hashPassword, comparePassword } from '../utils/hash';
import { uploadImageBuffer } from '../config/cloudinary';

type SafeUser = Omit<User, 'password'>;

function sanitize(user: User): SafeUser {
  const { password: _password, ...safe } = user;
  return safe;
}

export async function updateProfile(
  userId: string,
  data: { name?: string; phone?: string },
): Promise<SafeUser> {
  if (data.phone) {
    const taken = await prisma.user.findFirst({
      where: { phone: data.phone, NOT: { id: userId } },
      select: { id: true },
    });
    if (taken) throw AppError.conflict('That phone number is already in use.');
  }
  const user = await prisma.user.update({
    where: { id: userId },
    data: { ...(data.name ? { name: data.name } : {}), ...(data.phone ? { phone: data.phone } : {}) },
  });
  return sanitize(user);
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const ok = await comparePassword(currentPassword, user.password);
  if (!ok) throw AppError.badRequest('Your current password is incorrect.');
  await prisma.user.update({ where: { id: userId }, data: { password: await hashPassword(newPassword) } });
}

export async function updateAvatar(userId: string, file: Express.Multer.File): Promise<SafeUser> {
  const { url } = await uploadImageBuffer(file.buffer, 'indusai/avatars');
  const user = await prisma.user.update({ where: { id: userId }, data: { avatar: url } });
  return sanitize(user);
}
