import { z } from 'zod';

const variantSchema = z.object({
  id: z.string().uuid().optional(),
  size: z.string().trim().min(1).optional(),
  color: z.string().trim().min(1).optional(),
  sku: z.string().trim().min(1).optional(),
  stock: z.coerce.number().int().nonnegative().default(0),
  price: z.coerce.number().positive().optional(),
});

export const createProductSchema = z
  .object({
    name: z.string().trim().min(2, 'Name is too short').max(140),
    description: z.string().trim().min(1, 'Description is required'),
    categoryId: z.string().uuid('Invalid category'),
    brand: z.string().trim().min(1).optional(),
    tags: z.array(z.string().trim().min(1)).max(20).default([]),
    basePrice: z.coerce.number().positive('Price must be positive'),
    comparePrice: z.coerce.number().positive().optional(),
    isFeatured: z.boolean().default(false),
    isActive: z.boolean().default(true),
    variants: z.array(variantSchema).default([]),
  })
  .refine((d) => d.comparePrice == null || d.comparePrice > d.basePrice, {
    message: 'Compare-at price must be greater than the price',
    path: ['comparePrice'],
  });

export const updateProductSchema = z.object({
  name: z.string().trim().min(2).max(140).optional(),
  description: z.string().trim().min(1).optional(),
  categoryId: z.string().uuid().optional(),
  brand: z.string().trim().min(1).nullable().optional(),
  tags: z.array(z.string().trim().min(1)).max(20).optional(),
  basePrice: z.coerce.number().positive().optional(),
  comparePrice: z.coerce.number().positive().nullable().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  variants: z.array(variantSchema).optional(),
});

export const toggleStatusSchema = z.object({ isActive: z.boolean() });

export const requestDeleteSchema = z.object({
  reason: z.string().trim().min(5, 'Please provide a reason (min 5 chars)').max(500),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type VariantInput = z.infer<typeof variantSchema>;
