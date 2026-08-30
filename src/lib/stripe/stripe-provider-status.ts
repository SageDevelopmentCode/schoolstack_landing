import type Stripe from "stripe";

export function inferStripeProviderStatusFromCheckoutSession(
  session: Stripe.Checkout.Session,
): string {
  if (session.payment_status === "paid") return "succeeded";
  if (session.metadata?.payment_method === "us_bank_account") return "processing";
  return session.payment_status;
}
