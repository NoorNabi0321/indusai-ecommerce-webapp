import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { orderRefSchema } from '../validation/payment.validation';
import * as ctrl from '../controllers/payment.controller';

export const paymentRouter = Router();

// Stripe — card payments (authenticated customer endpoints).
paymentRouter.post('/stripe/create-intent', authenticate, validate({ body: orderRefSchema }), ctrl.createStripeIntent);
paymentRouter.post('/stripe/confirm', authenticate, validate({ body: orderRefSchema }), ctrl.confirmStripePayment);

// Webhook is mounted separately (raw body) in app.ts — see stripeWebhook.
