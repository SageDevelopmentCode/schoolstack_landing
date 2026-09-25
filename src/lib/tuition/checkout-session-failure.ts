import type { SupabaseClient } from "@supabase/supabase-js";
import { markPaymentFailed } from "@/lib/stripe/application-payments";
import { reportOperationalError } from "@/lib/operational-errors";

/** Fail payment rows created for a checkout session that Stripe never created. */
export async function markCheckoutPaymentsFailed(
  supabase: SupabaseClient,
  input: {
    route: string;
    organizationId: string;
    paymentIds: string[];
  },
): Promise<void> {
  for (const paymentId of input.paymentIds) {
    try {
      await markPaymentFailed(supabase, paymentId);
    } catch (cause) {
      await reportOperationalError({
        supabase,
        surface: "api",
        operation: `${input.route}:mark_payment_failed`,
        error: "Could not mark payment failed after checkout session creation failed.",
        code: "mark_payment_failed",
        organizationId: input.organizationId,
        entityType: "application_payment",
        entityId: paymentId,
        actor: { type: "system" },
        cause,
      }).catch(() => undefined);
    }
  }
}
