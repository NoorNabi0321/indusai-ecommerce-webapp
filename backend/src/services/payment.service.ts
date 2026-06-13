import Stripe from 'stripe';
import { env } from '../config/env';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';
import { notifyUser } from './notification.service';

/** Single Stripe client (null until a secret key is configured). */
const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY) : null;

const CURRENCY = 'pkr'; // PKR is a 2-decimal currency in Stripe — amounts are in paisa.

export function isStripeConfigured(): boolean {
  return stripe !== null;
}

function requireStripe(): Stripe {
  if (!stripe) throw AppError.badRequest('Card payments are not configured on this server.');
  return stripe;
}

/**
 * Creates (or reuses) a Stripe PaymentIntent for an existing STRIPE order and
 * returns its client secret. The amount is taken from the server-side order
 * total — never trusted from the client.
 */
export async function createPaymentIntent(userId: string, orderId: string) {
  const s = requireStripe();
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { payment: true } });
  if (!order || order.userId !== userId) throw AppError.notFound('Order not found.');
  if (!order.payment || order.payment.method !== 'STRIPE') {
    throw AppError.badRequest('This order is not a card payment.');
  }
  if (order.payment.status === 'PAID') throw AppError.badRequest('This order is already paid.');

  const amount = Math.round(Number(order.total) * 100);

  // Reuse an existing intent if one is already attached and still usable.
  let intent: Stripe.PaymentIntent | null = null;
  if (order.payment.transactionId) {
    try {
      const existing = await s.paymentIntents.retrieve(order.payment.transactionId);
      if (existing.status !== 'succeeded' && existing.status !== 'canceled') intent = existing;
    } catch {
      intent = null;
    }
  }

  if (!intent) {
    intent = await s.paymentIntents.create({
      amount,
      currency: CURRENCY,
      metadata: { orderId: order.id, orderNumber: order.orderNumber, userId },
      automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
    });
    await prisma.payment.update({ where: { orderId: order.id }, data: { transactionId: intent.id } });
  }

  return { clientSecret: intent.client_secret, amount, currency: CURRENCY };
}

/** Marks an order paid + moves it to PROCESSING. Idempotent. */
async function markOrderPaid(orderId: string, intent: Stripe.PaymentIntent): Promise<void> {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { payment: true } });
  if (!order || !order.payment) return;
  if (order.payment.status === 'PAID') return;

  await prisma.$transaction([
    prisma.payment.update({
      where: { orderId },
      data: { status: 'PAID', transactionId: intent.id, gatewayResponse: { id: intent.id, status: intent.status, amount: intent.amount } },
    }),
    prisma.order.update({ where: { id: orderId }, data: { status: 'PROCESSING' } }),
  ]);

  await notifyUser(order.userId, {
    type: 'ORDER_UPDATE',
    title: 'Payment received',
    message: `We've received your payment for order ${order.orderNumber}. It's now being processed.`,
    link: `/account/orders/${orderId}`,
  });
}

/**
 * Server-side confirmation used right after the client confirms the card. We
 * re-fetch the PaymentIntent from Stripe (source of truth) and only then flip
 * the order to paid — so a successful charge is recorded even when webhooks
 * aren't reachable in local development.
 */
export async function confirmPayment(userId: string, orderId: string) {
  const s = requireStripe();
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { payment: true } });
  if (!order || order.userId !== userId) throw AppError.notFound('Order not found.');
  if (!order.payment?.transactionId) throw AppError.badRequest('No payment in progress for this order.');

  const intent = await s.paymentIntents.retrieve(order.payment.transactionId);
  if (intent.status === 'succeeded') {
    await markOrderPaid(orderId, intent);
    return { status: 'PAID' as const };
  }
  if (intent.status === 'requires_payment_method') {
    await prisma.payment.update({ where: { orderId }, data: { status: 'FAILED' } });
    return { status: 'FAILED' as const };
  }
  return { status: 'PENDING' as const };
}

/** Verifies + handles a Stripe webhook event (production path). */
export async function handleWebhookEvent(rawBody: Buffer, signature: string): Promise<void> {
  const s = requireStripe();
  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw AppError.badRequest('Webhook secret not configured.');
  }

  let event: Stripe.Event;
  try {
    event = s.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.warn(`Stripe webhook signature verification failed: ${(err as Error).message}`);
    throw AppError.badRequest('Invalid webhook signature.');
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as Stripe.PaymentIntent;
    const orderId = intent.metadata?.orderId;
    if (orderId) await markOrderPaid(orderId, intent);
  } else if (event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object as Stripe.PaymentIntent;
    const orderId = intent.metadata?.orderId;
    if (orderId) {
      await prisma.payment.updateMany({ where: { orderId, status: { not: 'PAID' } }, data: { status: 'FAILED' } });
    }
  }
}
