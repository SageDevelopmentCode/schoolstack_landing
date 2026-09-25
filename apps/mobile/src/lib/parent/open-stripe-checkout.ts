import { openAuthSessionAsync } from 'expo-web-browser';

import { PAYMENT_METHOD_SHEET_CLOSE_MS } from '@/components/parent/billing/parent-payment-method-sheet';
import {
  parseStripeCheckoutOutcome,
  STRIPE_CHECKOUT_REDIRECT_URL,
  type StripeCheckoutOutcome,
} from '@/lib/parent/stripe-checkout-outcome';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function openStripeCheckout(checkoutUrl: string): Promise<StripeCheckoutOutcome> {
  const result = await openAuthSessionAsync(checkoutUrl, STRIPE_CHECKOUT_REDIRECT_URL);
  return result.type === 'success' ? parseStripeCheckoutOutcome(result.url) : 'dismissed';
}

/** Wait for payment-method sheet animation to finish before presenting Stripe checkout. */
export async function waitBeforeStripeCheckout(): Promise<void> {
  await sleep(PAYMENT_METHOD_SHEET_CLOSE_MS + 150);
}
