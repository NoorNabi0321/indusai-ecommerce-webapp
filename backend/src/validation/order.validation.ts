import { z } from 'zod';

export const createOrderSchema = z.object({
  addressId: z.string().uuid('Select a delivery address'),
  deliveryType: z.enum(['standard', 'express']),
  paymentMethod: z.enum(['STRIPE', 'JAZZCASH', 'EASYPAISA', 'COD']),
  notes: z.string().max(500).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
  trackingNumber: z.string().max(100).optional(),
  internalNotes: z.string().max(1000).optional(),
});
