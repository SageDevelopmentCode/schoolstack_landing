import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import { markPaymentFailed } from "@/lib/stripe/application-payments";
import { getStripeClient } from "@/lib/stripe/client";
import {
  quoteProcessingFee,
  type CheckoutPaymentMethod,
} from "@/lib/stripe/processing-fee";
import { recordTuitionPaymentCompleted } from "@/lib/stripe/record-payment-completed";
import { reportOperationalError } from "@/lib/operational-errors";
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

export function checkoutPaymentMethodForStripeType(
  type: string | null | undefined,
): CheckoutPaymentMethod {
  return type === "us_bank_account" ? "us_bank_account" : "card";
}

function paymentIntentIdFromStripeError(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const raw = (error as { raw?: { payment_intent?: { id?: unknown } } }).raw;
  const id = raw?.payment_intent?.id;
  return typeof id === "string" ? id : undefined;
}

async function resolveAutopayPaymentMethod(
  stripe: Stripe,
  input: AutopayChargeInput,
): Promise<CheckoutPaymentMethod> {
  if (input.paymentMethod) return input.paymentMethod;
  const paymentMethod = await stripe.paymentMethods.retrieve(
    input.stripePaymentMethodId,
  );
  return checkoutPaymentMethodForStripeType(paymentMethod.type);
}

export async function executeTuitionAutopayCharge(
  supabase: SupabaseClient,
  input: AutopayChargeInput,
  options?: { stripe?: Stripe },
): Promise<{ paymentIntentId: string; paymentId: string }> {
  const stripe = options?.stripe ?? getStripeClient();
  const paymentMethod = await resolveAutopayPaymentMethod(stripe, input);
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

  let paymentIntent: Stripe.PaymentIntent;
  try {
    paymentIntent = await stripe.paymentIntents.create({
      amount: quote.grossAmountCents,
      currency: (input.currency ?? "USD").toLowerCase(),
      customer: input.stripeCustomerId,
      payment_method: input.stripePaymentMethodId,
      payment_method_types: [paymentMethod],
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
  } catch (error) {
    try {
      await markPaymentFailed(supabase, payment.id, {
        stripePaymentIntentId: paymentIntentIdFromStripeError(error),
      });
    } catch (markError) {
      await reportOperationalError({
        supabase,
        surface: "system",
        operation: "tuition_autopay.mark_payment_failed",
        error: "Could not mark failed autopay payment record as failed",
        organizationId: input.organizationId,
        entityType: "application_payment",
        entityId: payment.id,
        actor: { type: "system" },
        cause: markError,
      });
    }
    throw error;
  }

  if (
    paymentIntent.status === "succeeded" ||
    paymentIntent.status === "processing"
  ) {
    await recordTuitionPaymentCompleted(supabase, {
      payment,
      organizationId: input.organizationId,
      tuitionChargeId: input.chargeId,
      paymentIntentId: paymentIntent.id,
      stripeProviderStatus: paymentIntent.status,
    });
  }

  return { paymentIntentId: paymentIntent.id, paymentId: payment.id };
}
