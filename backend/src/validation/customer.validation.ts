import { z } from 'zod';

export const setCustomerStatusSchema = z.object({ isActive: z.boolean() });

export type SetCustomerStatusInput = z.infer<typeof setCustomerStatusSchema>;
