import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import {
  listPaymentsByCheckoutSession,
  listPendingPaymentsForChecklistItem,
  markPaymentCanceled,
} from "@/lib/stripe/application-payments";
import { expireOpenCheckoutSession } from "@/lib/stripe/pending-checkout-session";

/**
 * Before starting a new enrollment checkout, close any earlier Checkout the
 * payer opened for the same checklist items and never finished, so the admin
 * ledger does not show a stale "Pending" row next to the real payment.
 *
 * Rows that already have a PaymentIntent are left alone: the payer may be
 * mid-payment (e.g. ACH verification) and the webhook will settle them.
 * A combined session can span several items, so every pending row on a closed
 * session is canceled, not only the rows for `checklistItemIds`.
 */
export async function expirePendingCheckoutSessionsForChecklistItems(
  supabase: SupabaseClient,
  stripe: Stripe,
  checklistItemIds: string[],
): Promise<void> {
  const handledSessionIds = new Set<string>();

  for (const checklistItemId of checklistItemIds) {
    const pendingPayments = await listPendingPaymentsForChecklistItem(
      supabase,
      checklistItemId,
    );

    for (const pendingPayment of pendingPayments) {
      const checkoutSessionId = pendingPayment.stripeCheckoutSessionId;
      if (!checkoutSessionId || pendingPayment.stripePaymentIntentId) continue;
      if (handledSessionIds.has(checkoutSessionId)) continue;
      handledSessionIds.add(checkoutSessionId);

      const existingSession =
        await stripe.checkout.sessions.retrieve(checkoutSessionId);

      if (existingSession.status === "open") {
        await expireOpenCheckoutSession(stripe, checkoutSessionId);
      } else if (existingSession.status !== "expired") {
        // "complete": the webhook / confirm route owns this row.
        continue;
      }

      const sessionPayments = await listPaymentsByCheckoutSession(
        supabase,
        checkoutSessionId,
      );
      for (const payment of sessionPayments) {
        if (payment.status !== "pending" || payment.stripePaymentIntentId) {
          continue;
        }
        await markPaymentCanceled(supabase, payment.id);
      }
    }
  }
}
