import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import * as paymentService from '../services/payment.service';

// POST /api/payments/stripe/create-intent
export const createStripeIntent = asyncHandler(async (req: Request, res: Response) => {
  const data = await paymentService.createPaymentIntent(req.user!.id, req.body.orderId);
  res.json({ success: true, data });
});

// POST /api/payments/stripe/confirm
export const confirmStripePayment = asyncHandler(async (req: Request, res: Response) => {
  const data = await paymentService.confirmPayment(req.user!.id, req.body.orderId);
  res.json({ success: true, data, message: data.status === 'PAID' ? 'Payment confirmed.' : undefined });
});

// POST /api/payments/stripe/webhook  (raw body; no auth)
export const stripeWebhook = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'];
  if (!signature || typeof signature !== 'string') throw AppError.badRequest('Missing Stripe signature.');
  await paymentService.handleWebhookEvent(req.body as Buffer, signature);
  res.json({ received: true });
});
