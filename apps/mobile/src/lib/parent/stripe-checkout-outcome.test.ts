import {
  isStripeCheckoutSuccess,
  parseStripeCheckoutOutcome,
  STRIPE_CHECKOUT_REDIRECT_URL,
} from '@/lib/parent/stripe-checkout-outcome';

describe('parseStripeCheckoutOutcome', () => {
  it('uses the scheme the server returns to', () => {
    expect(STRIPE_CHECKOUT_REDIRECT_URL).toBe('schoolstack://stripe-checkout');
  });

  it.each(['paid', 'cancelled', 'card_saved', 'card_cancelled'] as const)(
    'parses outcome=%s',
    (outcome) => {
      expect(
        parseStripeCheckoutOutcome(
          `schoolstack://stripe-checkout?outcome=${outcome}&slug=rooted-meadows`,
        ),
      ).toBe(outcome);
    },
  );

  it('reads outcome when it is not the first param', () => {
    expect(
      parseStripeCheckoutOutcome('schoolstack://stripe-checkout?slug=rooted-meadows&outcome=paid'),
    ).toBe('paid');
  });

  it('treats missing, unknown, or empty URLs as dismissed', () => {
    expect(parseStripeCheckoutOutcome(undefined)).toBe('dismissed');
    expect(parseStripeCheckoutOutcome('')).toBe('dismissed');
    expect(parseStripeCheckoutOutcome('schoolstack://stripe-checkout')).toBe('dismissed');
    expect(parseStripeCheckoutOutcome('schoolstack://stripe-checkout?outcome=hacked')).toBe(
      'dismissed',
    );
  });
});

describe('isStripeCheckoutSuccess', () => {
  it('is true only for paid and card_saved', () => {
    expect(isStripeCheckoutSuccess('paid')).toBe(true);
    expect(isStripeCheckoutSuccess('card_saved')).toBe(true);
    expect(isStripeCheckoutSuccess('cancelled')).toBe(false);
    expect(isStripeCheckoutSuccess('card_cancelled')).toBe(false);
    expect(isStripeCheckoutSuccess('dismissed')).toBe(false);
  });
});
