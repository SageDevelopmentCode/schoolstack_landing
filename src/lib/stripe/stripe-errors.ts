export const PAYMENT_ACCOUNT_UNAVAILABLE_MESSAGE =
  "Online payments for this school aren't available right now. Please contact the school.";

/**
 * Stripe rejects `transfer_data.destination` when the connected account does not
 * exist for the platform key in use (e.g. a test-mode account used with a live key).
 */
export function isStripeMissingDestinationError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const stripeError = error as { code?: unknown; param?: unknown; message?: unknown };
  const param = typeof stripeError.param === "string" ? stripeError.param : "";
  const message = typeof stripeError.message === "string" ? stripeError.message : "";

  if (param.includes("transfer_data") && param.includes("destination")) {
    return stripeError.code === undefined || stripeError.code === "resource_missing";
  }

  return message.startsWith("No such destination");
}
