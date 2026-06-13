import { z } from 'zod';

export const updateConfigSchema = z
  .object({
    storeName: z.string().trim().min(1).max(80),
    supportEmail: z.string().trim().email(),
    maintenanceMode: z.boolean(),
    maintenanceMessage: z.string().trim().min(1).max(300),
    codEnabled: z.boolean(),
    stripeEnabled: z.boolean(),
    jazzcashEnabled: z.boolean(),
    easypaisaEnabled: z.boolean(),
    codFee: z.coerce.number().int().min(0).max(100000),
    codMinOrder: z.coerce.number().int().min(0).max(10000000),
    paymentMode: z.enum(['sandbox', 'live']),
  })
  .partial()
  .refine((d) => Object.keys(d).length > 0, { message: 'No settings provided.' });

export type UpdateConfigInput = z.infer<typeof updateConfigSchema>;
