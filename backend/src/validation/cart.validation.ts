import { z } from 'zod';

export const cartItemSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().nullable().optional(),
  quantity: z.coerce.number().int().min(0).max(99),
});

export const mergeCartSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        variantId: z.string().uuid().nullable().optional(),
        quantity: z.coerce.number().int().positive().max(99),
      }),
    )
    .max(100),
});

export type CartItemInput = z.infer<typeof cartItemSchema>;
export type MergeItem = z.infer<typeof mergeCartSchema>['items'][number];
