/** Standard ACH gets a receipt at checkout; deferred send is only for verification-pending ACH. */
export function shouldSendDeferredAchReceipt(
  priorStripeProviderStatus: string | null | undefined,
): boolean {
  return priorStripeProviderStatus === "requires_action";
}
