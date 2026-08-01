import type Stripe from "stripe";

export function isStripeResourceMissing(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "resource_missing"
  );
}

export async function paymentMethodExistsOnPlatform(
  stripe: Stripe,
  paymentMethodId: string,
): Promise<boolean> {
  try {
    await stripe.paymentMethods.retrieve(paymentMethodId);
    return true;
  } catch (error) {
    if (isStripeResourceMissing(error)) return false;
    throw error;
  }
}

export function isPaymentMethodMissingError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.message.includes("No such PaymentMethod") ||
    (typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "resource_missing")
  );
}
