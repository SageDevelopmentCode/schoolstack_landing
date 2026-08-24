import type Stripe from "stripe";
import {
  allocateGrossAcrossLineItems,
} from "@/lib/admissions/combined-enrollment-payment";
import {
  quoteProcessingFee,
  type CheckoutPaymentMethod,
} from "@/lib/stripe/processing-fee";
import { getStripeClient } from "@/lib/stripe/client";

const SAVED_PAYMENT_METHOD_OPTIONS: Stripe.Checkout.SessionCreateParams.SavedPaymentMethodOptions =
  {
    payment_method_save: "enabled",
    allow_redisplay_filters: ["always", "limited", "unspecified"],
  };

const PAYMENT_METHOD_DATA = {
  allow_redisplay: "always" as const,
};

export type CreateAdmissionsCheckoutSessionInput = {
  netAmountCents: number;
  paymentMethod: CheckoutPaymentMethod;
  label: string;
  description?: string;
  stripeConnectAccountId: string;
  stripeCustomerId: string;
  payerUserId: string;
  successUrl: string;
  cancelUrl: string;
  paymentId: string;
  paymentIntentMetadata?: Record<string, string>;
  sessionMetadata?: Record<string, string>;
};

export type AdmissionsCheckoutSessionResult = {
  session: Stripe.Checkout.Session;
  quote: ReturnType<typeof quoteProcessingFee>;
};

export type TuitionCheckoutDisplayLineItem = {
  label: string;
  amountCents: number;
};

export type CreateTuitionCheckoutSessionInput = {
  lineItems: TuitionCheckoutDisplayLineItem[];
  netToSchoolCents: number;
  paymentMethod: CheckoutPaymentMethod;
  stripeConnectAccountId: string;
  stripeCustomerId: string;
  payerUserId: string;
  successUrl: string;
  cancelUrl: string;
  paymentId: string;
  paymentIntentMetadata?: Record<string, string>;
  sessionMetadata?: Record<string, string>;
};

export type TuitionCheckoutSessionResult = {
  session: Stripe.Checkout.Session;
  grossAmountCents: number;
  netToSchoolCents: number;
  processingFeeCents: number;
};

export type AdmissionsCheckoutLineItem = {
  label: string;
  netAmountCents: number;
};

export type CreateCombinedAdmissionsCheckoutSessionInput = {
  lineItems: AdmissionsCheckoutLineItem[];
  paymentMethod: CheckoutPaymentMethod;
  stripeConnectAccountId: string;
  stripeCustomerId: string;
  payerUserId: string;
  successUrl: string;
  cancelUrl: string;
  paymentIds: string[];
  paymentIntentMetadata?: Record<string, string>;
  sessionMetadata?: Record<string, string>;
};

export async function createCombinedAdmissionsCheckoutSession(
  input: CreateCombinedAdmissionsCheckoutSessionInput,
  options?: { stripe?: Stripe },
): Promise<AdmissionsCheckoutSessionResult> {
  const netAmounts = input.lineItems.map((lineItem) => lineItem.netAmountCents);
  const totalNetAmountCents = netAmounts.reduce((sum, amount) => sum + amount, 0);
  const quote = quoteProcessingFee(totalNetAmountCents, input.paymentMethod);
  const grossAmounts = allocateGrossAcrossLineItems(
    netAmounts,
    quote.grossAmountCents,
  );
  const stripe = options?.stripe ?? getStripeClient();

  const paymentMethodTypes: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] =
    input.paymentMethod === "card" ? ["card"] : ["us_bank_account"];

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    customer: input.stripeCustomerId,
    payment_method_types: paymentMethodTypes,
    saved_payment_method_options: SAVED_PAYMENT_METHOD_OPTIONS,
    payment_method_data: PAYMENT_METHOD_DATA,
    line_items: input.lineItems.map((lineItem, index) => ({
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: grossAmounts[index] ?? lineItem.netAmountCents,
        product_data: {
          name: lineItem.label,
        },
      },
    })),
    payment_intent_data: {
      setup_future_usage: "on_session",
      transfer_data: {
        destination: input.stripeConnectAccountId,
        amount: quote.netAmountCents,
      },
      metadata: {
        payment_id: input.paymentIds[0] ?? "",
        supabase_user_id: input.payerUserId,
        ...(input.paymentIntentMetadata ?? {}),
        payment_method: input.paymentMethod,
        net_amount_cents: String(quote.netAmountCents),
        processing_fee_cents: String(quote.processingFeeCents),
        gross_amount_cents: String(quote.grossAmountCents),
      },
    },
    metadata: {
      payment_id: input.paymentIds[0] ?? "",
      supabase_user_id: input.payerUserId,
      ...(input.sessionMetadata ?? {}),
      payment_method: input.paymentMethod,
      net_amount_cents: String(quote.netAmountCents),
      processing_fee_cents: String(quote.processingFeeCents),
      gross_amount_cents: String(quote.grossAmountCents),
    },
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
  };

  if (input.paymentMethod === "us_bank_account") {
    sessionParams.payment_method_options = {
      us_bank_account: {
        financial_connections: {
          permissions: ["payment_method"],
        },
      },
    };
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  return { session, quote };
}

export type CreateTuitionSetupCheckoutSessionInput = {
  stripeCustomerId: string;
  payerUserId: string;
  organizationId: string;
  familyId: string;
  guardianId: string | null;
  successUrl: string;
  cancelUrl: string;
};

export async function createTuitionSetupCheckoutSession(
  input: CreateTuitionSetupCheckoutSessionInput,
  options?: { stripe?: Stripe },
): Promise<Stripe.Checkout.Session> {
  const stripe = options?.stripe ?? getStripeClient();

  return stripe.checkout.sessions.create({
    mode: "setup",
    customer: input.stripeCustomerId,
    payment_method_types: ["card"],
    metadata: {
      payment_type: "tuition_setup",
      organization_id: input.organizationId,
      family_id: input.familyId,
      guardian_id: input.guardianId ?? "",
      supabase_user_id: input.payerUserId,
    },
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
  });
}

export async function createAdmissionsCheckoutSession(
  input: CreateAdmissionsCheckoutSessionInput,
  options?: { stripe?: Stripe },
): Promise<AdmissionsCheckoutSessionResult> {
  const quote = quoteProcessingFee(input.netAmountCents, input.paymentMethod);
  const stripe = options?.stripe ?? getStripeClient();

  const paymentMethodTypes: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] =
    input.paymentMethod === "card" ? ["card"] : ["us_bank_account"];

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    customer: input.stripeCustomerId,
    payment_method_types: paymentMethodTypes,
    saved_payment_method_options: SAVED_PAYMENT_METHOD_OPTIONS,
    payment_method_data: PAYMENT_METHOD_DATA,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: quote.grossAmountCents,
          product_data: {
            name: input.label,
            description:
              input.description ??
              `Includes $${(quote.processingFeeCents / 100).toFixed(2)} processing fee`,
          },
        },
      },
    ],
    payment_intent_data: {
      setup_future_usage: "on_session",
      transfer_data: {
        destination: input.stripeConnectAccountId,
        amount: quote.netAmountCents,
      },
      metadata: {
        payment_id: input.paymentId,
        supabase_user_id: input.payerUserId,
        ...(input.paymentIntentMetadata ?? {}),
        payment_method: input.paymentMethod,
        net_amount_cents: String(quote.netAmountCents),
        processing_fee_cents: String(quote.processingFeeCents),
        gross_amount_cents: String(quote.grossAmountCents),
      },
    },
    metadata: {
      payment_id: input.paymentId,
      supabase_user_id: input.payerUserId,
      ...(input.sessionMetadata ?? {}),
      payment_method: input.paymentMethod,
      net_amount_cents: String(quote.netAmountCents),
      processing_fee_cents: String(quote.processingFeeCents),
      gross_amount_cents: String(quote.grossAmountCents),
    },
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
  };

  if (input.paymentMethod === "us_bank_account") {
    sessionParams.payment_method_options = {
      us_bank_account: {
        financial_connections: {
          permissions: ["payment_method"],
        },
      },
    };
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  return { session, quote };
}

export async function createTuitionCheckoutSession(
  input: CreateTuitionCheckoutSessionInput,
  options?: { stripe?: Stripe },
): Promise<TuitionCheckoutSessionResult> {
  const stripe = options?.stripe ?? getStripeClient();
  const grossAmountCents = input.lineItems.reduce(
    (sum, lineItem) => sum + lineItem.amountCents,
    0,
  );
  const processingFeeCents = Math.max(0, grossAmountCents - input.netToSchoolCents);

  const paymentMethodTypes: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] =
    input.paymentMethod === "card" ? ["card"] : ["us_bank_account"];

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    customer: input.stripeCustomerId,
    payment_method_types: paymentMethodTypes,
    saved_payment_method_options: SAVED_PAYMENT_METHOD_OPTIONS,
    payment_method_data: PAYMENT_METHOD_DATA,
    line_items: input.lineItems.map((lineItem) => ({
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: lineItem.amountCents,
        product_data: {
          name: lineItem.label,
        },
      },
    })),
    payment_intent_data: {
      setup_future_usage: "on_session",
      transfer_data: {
        destination: input.stripeConnectAccountId,
        amount: input.netToSchoolCents,
      },
      metadata: {
        payment_id: input.paymentId,
        supabase_user_id: input.payerUserId,
        ...(input.paymentIntentMetadata ?? {}),
        payment_method: input.paymentMethod,
        net_amount_cents: String(input.netToSchoolCents),
        processing_fee_cents: String(processingFeeCents),
        gross_amount_cents: String(grossAmountCents),
      },
    },
    metadata: {
      payment_id: input.paymentId,
      supabase_user_id: input.payerUserId,
      ...(input.sessionMetadata ?? {}),
      payment_method: input.paymentMethod,
      net_amount_cents: String(input.netToSchoolCents),
      processing_fee_cents: String(processingFeeCents),
      gross_amount_cents: String(grossAmountCents),
    },
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
  };

  if (input.paymentMethod === "us_bank_account") {
    sessionParams.payment_method_options = {
      us_bank_account: {
        financial_connections: {
          permissions: ["payment_method"],
        },
      },
    };
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  return {
    session,
    grossAmountCents,
    netToSchoolCents: input.netToSchoolCents,
    processingFeeCents,
  };
}
