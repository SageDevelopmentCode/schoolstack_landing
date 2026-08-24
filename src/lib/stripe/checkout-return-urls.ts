import { getSiteUrl } from "@/lib/stripe/client";

export type CheckoutReturnTo = "web" | "mobile";

const MOBILE_APP_SCHEME = "schoolstack";
const MOBILE_CHECKOUT_PATH = "stripe-checkout";

export function parseCheckoutReturnTo(value: unknown): CheckoutReturnTo {
  return value === "mobile" ? "mobile" : "web";
}

function buildMobileCheckoutReturnUrl(
  orgSlug: string,
  outcome: "paid" | "cancelled" | "card_saved" | "card_cancelled",
): string {
  const params = new URLSearchParams({
    outcome,
    slug: orgSlug,
  });
  return `${MOBILE_APP_SCHEME}://${MOBILE_CHECKOUT_PATH}?${params.toString()}`;
}

function buildWebCheckoutReturnUrl(
  orgSlug: string,
  outcome: "paid" | "cancelled" | "card_saved" | "card_cancelled",
): string {
  const baseUrl = getSiteUrl();
  const query =
    outcome === "paid"
      ? "paid=1"
      : outcome === "cancelled"
        ? "cancelled=1"
        : outcome === "card_saved"
          ? "card_saved=1"
          : "card_cancelled=1";
  return `${baseUrl}/school/${orgSlug}/parent/billing?${query}`;
}

export function buildTuitionCheckoutReturnUrl(input: {
  orgSlug: string;
  returnTo?: CheckoutReturnTo;
  outcome: "paid" | "cancelled" | "card_saved" | "card_cancelled";
}): string {
  if (input.returnTo === "mobile") {
    return buildMobileCheckoutReturnUrl(input.orgSlug, input.outcome);
  }
  return buildWebCheckoutReturnUrl(input.orgSlug, input.outcome);
}

export function buildTuitionCheckoutReturnUrls(input: {
  orgSlug: string;
  returnTo?: CheckoutReturnTo;
  flow: "payment" | "setup";
}): { successUrl: string; cancelUrl: string } {
  if (input.flow === "setup") {
    return {
      successUrl: buildTuitionCheckoutReturnUrl({
        orgSlug: input.orgSlug,
        returnTo: input.returnTo,
        outcome: "card_saved",
      }),
      cancelUrl: buildTuitionCheckoutReturnUrl({
        orgSlug: input.orgSlug,
        returnTo: input.returnTo,
        outcome: "card_cancelled",
      }),
    };
  }

  return {
    successUrl: buildTuitionCheckoutReturnUrl({
      orgSlug: input.orgSlug,
      returnTo: input.returnTo,
      outcome: "paid",
    }),
    cancelUrl: buildTuitionCheckoutReturnUrl({
      orgSlug: input.orgSlug,
      returnTo: input.returnTo,
      outcome: "cancelled",
    }),
  };
}
