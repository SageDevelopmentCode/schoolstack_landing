import * as Linking from 'expo-linking';
import { openAuthSessionAsync } from 'expo-web-browser';

import { PAYMENT_METHOD_SHEET_CLOSE_MS } from '@/components/parent/billing/parent-payment-method-sheet';

export const STRIPE_CHECKOUT_REDIRECT_PATH = 'stripe-checkout';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function getStripeCheckoutRedirectUrl(): string {
  return Linking.createURL(STRIPE_CHECKOUT_REDIRECT_PATH);
}

export async function openStripeCheckout(checkoutUrl: string): Promise<void> {
  const redirectUrl = getStripeCheckoutRedirectUrl();
  await openAuthSessionAsync(checkoutUrl, redirectUrl);
}

/** Wait for payment-method sheet animation to finish before presenting Stripe checkout. */
export async function waitBeforeStripeCheckout(): Promise<void> {
  await sleep(PAYMENT_METHOD_SHEET_CLOSE_MS + 150);
}
