import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe/client";
import { markPaymentSucceeded } from "@/lib/stripe/application-payments";
import {
  quoteProcessingFee,
  type CheckoutPaymentMethod,
} from "@/lib/stripe/processing-fee";
import { markChargePaid } from "@/lib/tuition/charges";
import { createTuitionPaymentRecord } from "@/lib/tuition/payments";

export type AutopayChargeInput = {
  organizationId: string;
  familyId: string;
  chargeId: string;
  amountCents: number;
  label: string;
  currency?: string;
  stripeConnectAccountId: string;
  stripeCustomerId: string;
  stripePaymentMethodId: string;
  payerUserId: string;
  paymentMethod?: CheckoutPaymentMethod;
};

export async function executeTuitionAutopayCharge(
  supabase: SupabaseClient,
  input: AutopayChargeInput,
  options?: { stripe?: Stripe },
): Promise<{ paymentIntentId: string; paymentId: string }> {
  const stripe = options?.stripe ?? getStripeClient();
  const paymentMethod = input.paymentMethod ?? "card";
  const quote = quoteProcessingFee(input.amountCents, paymentMethod);

  const payment = await createTuitionPaymentRecord(supabase, {
    organizationId: input.organizationId,
    familyId: input.familyId,
    tuitionChargeId: input.chargeId,
    amountCents: input.amountCents,
    label: input.label,
    payerUserId: input.payerUserId,
    currency: input.currency,
    paymentMethodType: paymentMethod,
    chargedAmountCents: quote.grossAmountCents,
    processingFeeCents: quote.processingFeeCents,
  });

  const paymentIntent = await stripe.paymentIntents.create({
    amount: quote.grossAmountCents,
    currency: (input.currency ?? "USD").toLowerCase(),
    customer: input.stripeCustomerId,
    payment_method: input.stripePaymentMethodId,
    off_session: true,
    confirm: true,
    transfer_data: {
      destination: input.stripeConnectAccountId,
      amount: quote.netAmountCents,
    },
    metadata: {
      payment_id: payment.id,
      payment_type: "tuition",
      tuition_charge_id: input.chargeId,
      organization_id: input.organizationId,
      payment_method: paymentMethod,
      net_amount_cents: String(quote.netAmountCents),
      processing_fee_cents: String(quote.processingFeeCents),
      gross_amount_cents: String(quote.grossAmountCents),
    },
  });

  if (paymentIntent.status === "succeeded") {
    await markPaymentSucceeded(supabase, payment.id, {
      stripePaymentIntentId: paymentIntent.id,
    });
    await markChargePaid(supabase, input.chargeId);
  }

  return { paymentIntentId: paymentIntent.id, paymentId: payment.id };
}
