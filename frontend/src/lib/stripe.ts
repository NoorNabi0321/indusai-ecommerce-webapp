import { loadStripe, type Stripe } from '@stripe/stripe-js';

const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;

/** Lazily-loaded Stripe.js instance. `null` when no publishable key is configured. */
export const stripePromise: Promise<Stripe | null> | null = key ? loadStripe(key) : null;

export const isStripeEnabled = Boolean(key);
