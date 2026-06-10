import { z } from 'zod';

const returnItemSchema = z.object({
  orderItemId: z.string().uuid(),
  quantity: z.coerce.number().int().positive(),
});

export const createReturnSchema = z.object({
  orderId: z.string().uuid(),
  // Sent as a JSON string in multipart form data.
  items: z
    .string()
    .transform((s) => JSON.parse(s) as unknown)
    .pipe(z.array(returnItemSchema).min(1, 'Select at least one item')),
  reason: z.enum(['DEFECTIVE', 'WRONG_ITEM', 'NOT_AS_DESCRIBED', 'CHANGED_MIND', 'SIZE_ISSUE', 'OTHER']),
  description: z.string().max(1000).optional(),
  refundMethod: z.enum(['ORIGINAL', 'STORE_CREDIT']),
});

export type CreateReturnInput = z.infer<typeof createReturnSchema>;
