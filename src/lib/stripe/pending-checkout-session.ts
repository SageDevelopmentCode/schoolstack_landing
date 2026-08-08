import type Stripe from "stripe";
import type { PaymentRecord } from "@/lib/stripe/application-payments";
import type { CheckoutPaymentMethod } from "@/lib/stripe/processing-fee";

function metadataString(
  metadata: Stripe.Metadata | null | undefined,
  key: string,
): string | undefined {
  const value = metadata?.[key];
  return typeof value === "string" ? value : undefined;
}

function normalizeCsvIds(value: string | undefined): string {
  if (!value) return "";
  return value
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .sort()
    .join(",");
}

export function pendingCheckoutMatchesRequest(input: {
  pendingPayment: PaymentRecord;
  requestedAmountCents: number;
  paymentMethod: CheckoutPaymentMethod;
  isLumpSum: boolean;
  sessionMetadata: Stripe.Metadata | null | undefined;
}): boolean {
  if (input.pendingPayment.amountCents !== input.requestedAmountCents) {
    return false;
  }

  if (metadataString(input.sessionMetadata, "payment_method") !== input.paymentMethod) {
    return false;
  }

  const paymentKind = metadataString(input.sessionMetadata, "payment_kind");
  if (input.isLumpSum) {
    return paymentKind === "lump_sum";
  }

  return paymentKind !== "lump_sum";
}

export function pendingCombinedCheckoutMatchesRequest(input: {
  tuitionChargeIds: string[];
  totalNetCents: number;
  paymentMethod: CheckoutPaymentMethod;
  sessionMetadata: Stripe.Metadata | null | undefined;
}): boolean {
  if (metadataString(input.sessionMetadata, "payment_type") !== "tuition_combined") {
    return false;
  }

  if (metadataString(input.sessionMetadata, "payment_method") !== input.paymentMethod) {
    return false;
  }

  const sessionChargeIds = normalizeCsvIds(
    metadataString(input.sessionMetadata, "tuition_charge_ids"),
  );
  const requestedChargeIds = normalizeCsvIds(input.tuitionChargeIds.join(","));
  if (sessionChargeIds !== requestedChargeIds) {
    return false;
  }

  const sessionNetCents = Number(
    metadataString(input.sessionMetadata, "net_amount_cents"),
  );
  return sessionNetCents === input.totalNetCents;
}

export async function expireOpenCheckoutSession(
  stripe: Stripe,
  checkoutSessionId: string,
): Promise<void> {
  try {
    await stripe.checkout.sessions.expire(checkoutSessionId);
  } catch (error) {
    const stripeError = error as { code?: string };
    if (stripeError.code !== "resource_missing") {
      throw error;
    }
  }
}
