import type Stripe from "stripe";
import {
  inferStripeProviderStatusFromCheckoutSession,
} from "@/lib/stripe/stripe-provider-status";
import {
  type AchVerificationAction,
  isAchCheckoutMetadata,
  resolveAchVerificationActionForPaymentIntent,
} from "@/lib/stripe/payment-intent-bank-verification";

export type AchCheckoutFollowUp = {
  verificationAction: AchVerificationAction | null;
  stripeProviderStatus: string;
  skipImmediateReceipt: boolean;
};

export async function resolveAchCheckoutFollowUp(
  session: Stripe.Checkout.Session,
  paymentIntentId: string | undefined,
  options?: { stripe?: Stripe },
): Promise<AchCheckoutFollowUp> {
  const metadata = session.metadata ?? {};

  if (!isAchCheckoutMetadata(metadata)) {
    return {
      verificationAction: null,
      stripeProviderStatus: inferStripeProviderStatusFromCheckoutSession(session),
      skipImmediateReceipt: false,
    };
  }

  const verificationAction = await resolveAchVerificationActionForPaymentIntent(
    paymentIntentId,
    options,
  );

  if (verificationAction) {
    return {
      verificationAction,
      stripeProviderStatus: "requires_action",
      skipImmediateReceipt: true,
    };
  }

  return {
    verificationAction: null,
    stripeProviderStatus: inferStripeProviderStatusFromCheckoutSession(session),
    skipImmediateReceipt: false,
  };
}
