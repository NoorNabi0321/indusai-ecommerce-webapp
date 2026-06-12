import { z } from 'zod';

export const updateStockSchema = z.object({
  stock: z.coerce.number().int().nonnegative('Stock cannot be negative'),
});

export const bulkUpdateStockSchema = z.object({
  updates: z
    .array(
      z.object({
        sku: z.string().trim().min(1, 'SKU is required'),
        stock: z.coerce.number().int().nonnegative('Stock cannot be negative'),
      }),
    )
    .min(1, 'No rows to update')
    .max(1000, 'Too many rows (max 1000)'),
});

export type UpdateStockInput = z.infer<typeof updateStockSchema>;
export type BulkUpdateStockInput = z.infer<typeof bulkUpdateStockSchema>;
