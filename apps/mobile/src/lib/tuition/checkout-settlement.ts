import type { ParentBillingData, SavedPaymentMethodSummary } from '@/lib/parent/parent-portal-api';
import type { StripeCheckoutOutcome } from '@/lib/parent/stripe-checkout-outcome';

/** Delays (ms) between billing refreshes while waiting for the Stripe webhook to land. */
export const CHECKOUT_SETTLE_REFRESH_DELAYS_MS = [2000, 3000, 5000] as const;

export type CheckoutSettlementBaseline = {
  succeededPaymentIds: Set<string>;
  savedPaymentMethodKey: string | null;
};

function savedPaymentMethodKey(method: SavedPaymentMethodSummary | null): string | null {
  if (!method) return null;
  return [method.brand, method.last4, method.expMonth, method.expYear].join(':');
}

export function captureCheckoutSettlementBaseline(
  data: ParentBillingData | null,
): CheckoutSettlementBaseline {
  return {
    succeededPaymentIds: new Set(
      (data?.payments ?? [])
        .filter((payment) => payment.status === 'succeeded')
        .map((payment) => payment.id),
    ),
    savedPaymentMethodKey: savedPaymentMethodKey(data?.savedPaymentMethod ?? null),
  };
}

/** True once billing data reflects the checkout that just returned. */
export function hasCheckoutSettled(
  outcome: StripeCheckoutOutcome,
  baseline: CheckoutSettlementBaseline,
  data: ParentBillingData | null,
): boolean {
  if (!data) return false;

  if (outcome === 'paid') {
    return data.payments.some(
      (payment) =>
        payment.status === 'succeeded' && !baseline.succeededPaymentIds.has(payment.id),
    );
  }

  if (outcome === 'card_saved') {
    const nextKey = savedPaymentMethodKey(data.savedPaymentMethod);
    return nextKey !== null && nextKey !== baseline.savedPaymentMethodKey;
  }

  return true;
}
