import type { StripeCheckoutOutcome } from '@/lib/parent/stripe-checkout-outcome';
import type { CheckoutSettlementBaseline } from '@/lib/tuition/checkout-settlement';

type StoredBaseline = {
  succeededPaymentIds: string[];
  savedPaymentMethodKey: string | null;
};

type PendingCheckoutReturn = {
  slug: string;
  /** Set when the deep link return route (or duplicate staging) reports an outcome. */
  outcome: StripeCheckoutOutcome | null;
  baseline: StoredBaseline | null;
  consumed: boolean;
};

let pending: PendingCheckoutReturn | null = null;

function cloneBaseline(baseline: CheckoutSettlementBaseline): StoredBaseline {
  return {
    succeededPaymentIds: [...baseline.succeededPaymentIds],
    savedPaymentMethodKey: baseline.savedPaymentMethodKey,
  };
}

function restoreBaseline(stored: StoredBaseline | null): CheckoutSettlementBaseline | null {
  if (!stored) return null;
  return {
    succeededPaymentIds: new Set(stored.succeededPaymentIds),
    savedPaymentMethodKey: stored.savedPaymentMethodKey,
  };
}

/** Called from billing immediately before opening Stripe checkout. */
export function stageCheckoutBaseline(slug: string, baseline: CheckoutSettlementBaseline): void {
  if (pending?.slug === slug && !pending.consumed) {
    pending = { ...pending, baseline: cloneBaseline(baseline) };
    return;
  }
  pending = {
    slug,
    outcome: null,
    baseline: cloneBaseline(baseline),
    consumed: false,
  };
}

/** Called from the stripe-checkout deep-link return route. */
export function stageCheckoutReturn(slug: string, outcome: StripeCheckoutOutcome): void {
  if (pending?.slug === slug && !pending.consumed) {
    pending = { ...pending, outcome };
    return;
  }
  pending = {
    slug,
    outcome,
    baseline: pending?.slug === slug ? pending.baseline : null,
    consumed: false,
  };
}

export type ConsumedCheckoutReturn = {
  outcome: StripeCheckoutOutcome;
  baseline: CheckoutSettlementBaseline | null;
};

/** Returns staged return data once per checkout return; subsequent calls return null. */
export function consumeCheckoutReturn(slug: string): ConsumedCheckoutReturn | null {
  if (!pending || pending.consumed || pending.slug !== slug || pending.outcome === null) {
    return null;
  }
  const snapshot: ConsumedCheckoutReturn = {
    outcome: pending.outcome,
    baseline: restoreBaseline(pending.baseline),
  };
  pending = { ...pending, consumed: true };
  return snapshot;
}

/** True after `consumeCheckoutReturn` ran for this slug in the current handoff cycle. */
export function wasCheckoutReturnConsumed(slug: string): boolean {
  return pending?.slug === slug && pending.consumed;
}

/** Clears handoff state (tests only). */
export function resetCheckoutReturnHandoffForTests(): void {
  pending = null;
}
