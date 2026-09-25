/** Must match MOBILE_APP_SCHEME / MOBILE_CHECKOUT_PATH in src/lib/stripe/checkout-return-urls.ts. */
export const STRIPE_CHECKOUT_APP_SCHEME = 'schoolstack';
export const STRIPE_CHECKOUT_REDIRECT_PATH = 'stripe-checkout';
export const STRIPE_CHECKOUT_REDIRECT_URL = `${STRIPE_CHECKOUT_APP_SCHEME}://${STRIPE_CHECKOUT_REDIRECT_PATH}`;

export type StripeCheckoutReturnOutcome = 'paid' | 'cancelled' | 'card_saved' | 'card_cancelled';

export type StripeCheckoutOutcome = StripeCheckoutReturnOutcome | 'dismissed';

const RETURN_OUTCOMES: readonly StripeCheckoutReturnOutcome[] = [
  'paid',
  'cancelled',
  'card_saved',
  'card_cancelled',
];

export function isStripeCheckoutReturnOutcome(
  value: unknown,
): value is StripeCheckoutReturnOutcome {
  return (
    typeof value === 'string' &&
    (RETURN_OUTCOMES as readonly string[]).includes(value)
  );
}

/** Reads `outcome` from a `schoolstack://stripe-checkout?outcome=...` return URL. */
export function parseStripeCheckoutOutcome(url: string | null | undefined): StripeCheckoutOutcome {
  if (!url) return 'dismissed';

  const queryStart = url.indexOf('?');
  if (queryStart === -1) return 'dismissed';

  const query = url.slice(queryStart + 1).split('#')[0] ?? '';
  for (const pair of query.split('&')) {
    const [rawKey, rawValue = ''] = pair.split('=');
    if (rawKey !== 'outcome') continue;
    const value = decodeURIComponent(rawValue.replace(/\+/g, ' '));
    return isStripeCheckoutReturnOutcome(value) ? value : 'dismissed';
  }

  return 'dismissed';
}

export function isStripeCheckoutSuccess(outcome: StripeCheckoutOutcome): boolean {
  return outcome === 'paid' || outcome === 'card_saved';
}
