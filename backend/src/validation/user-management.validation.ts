import { z } from 'zod';

export const createAdminSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(80),
  email: z.string().trim().email('Enter a valid email'),
  phone: z.string().trim().min(7, 'Enter a valid phone number').max(20).optional(),
});

export const setAdminStatusSchema = z.object({ isActive: z.boolean() });

export type CreateAdminInput = z.infer<typeof createAdminSchema>;
