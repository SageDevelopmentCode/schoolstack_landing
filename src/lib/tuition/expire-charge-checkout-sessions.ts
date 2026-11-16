import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import {
  listPendingPaymentsForTuitionCharge,
  markPaymentCanceled,
} from "@/lib/stripe/application-payments";
import { expireOpenCheckoutSession } from "@/lib/stripe/pending-checkout-session";

export async function expirePendingCheckoutSessionsForCharge(
  supabase: SupabaseClient,
  stripe: Stripe,
  chargeId: string,
): Promise<void> {
  const pendingPayments = await listPendingPaymentsForTuitionCharge(
    supabase,
    chargeId,
  );

  for (const pendingPayment of pendingPayments) {
    if (!pendingPayment.stripeCheckoutSessionId) continue;

    const existingSession = await stripe.checkout.sessions.retrieve(
      pendingPayment.stripeCheckoutSessionId,
    );

    if (existingSession.status === "open") {
      await expireOpenCheckoutSession(
        stripe,
        pendingPayment.stripeCheckoutSessionId,
      );
      await markPaymentCanceled(supabase, pendingPayment.id);
      continue;
    }

    if (existingSession.status === "expired") {
      await markPaymentCanceled(supabase, pendingPayment.id);
    }
  }
}
