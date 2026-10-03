import type Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe/client";

export type AchVerificationAction = {
  hostedVerificationUrl: string;
  microdepositType: string | null;
  arrivalDate: Date | null;
};

export function getAchVerificationAction(
  paymentIntent: Pick<
    Stripe.PaymentIntent,
    "status" | "next_action"
  >,
): AchVerificationAction | null {
  if (paymentIntent.status !== "requires_action") {
    return null;
  }

  const nextAction = paymentIntent.next_action;
  if (nextAction?.type !== "verify_with_microdeposits") {
    return null;
  }

  const microdeposits = nextAction.verify_with_microdeposits;
  const hostedVerificationUrl =
    typeof microdeposits?.hosted_verification_url === "string"
      ? microdeposits.hosted_verification_url.trim()
      : "";

  if (!hostedVerificationUrl) {
    return null;
  }

  const microdepositType =
    typeof microdeposits?.microdeposit_type === "string"
      ? microdeposits.microdeposit_type
      : null;

  let arrivalDate: Date | null = null;
  if (typeof microdeposits?.arrival_date === "number") {
    arrivalDate = new Date(microdeposits.arrival_date * 1000);
  }

  return {
    hostedVerificationUrl,
    microdepositType,
    arrivalDate,
  };
}

export async function retrieveCheckoutPaymentIntent(
  paymentIntentId: string,
  options?: { stripe?: Stripe },
): Promise<Stripe.PaymentIntent> {
  const stripe = options?.stripe ?? getStripeClient();
  return stripe.paymentIntents.retrieve(paymentIntentId);
}

export async function resolveAchVerificationActionForPaymentIntent(
  paymentIntentId: string | undefined,
  options?: { stripe?: Stripe },
): Promise<AchVerificationAction | null> {
  if (!paymentIntentId?.trim()) {
    return null;
  }

  const paymentIntent = await retrieveCheckoutPaymentIntent(
    paymentIntentId.trim(),
    options,
  );
  return getAchVerificationAction(paymentIntent);
}

export function isAchCheckoutMetadata(
  metadata: Stripe.Metadata | Record<string, string | undefined>,
): boolean {
  return metadata.payment_method === "us_bank_account";
}
