import { z } from 'zod';

export const orderRefSchema = z.object({ orderId: z.string().uuid('Invalid order') });
export type OrderRefInput = z.infer<typeof orderRefSchema>;
