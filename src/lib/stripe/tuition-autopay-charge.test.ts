import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type Stripe from "stripe";
import { quoteProcessingFee } from "@/lib/stripe/processing-fee";
import type { recordTuitionPaymentCompleted } from "@/lib/stripe/record-payment-completed";
import {
  checkoutPaymentMethodForStripeType,
  executeTuitionAutopayCharge,
} from "./tuition-autopay-charge";

type InsertedPayment = Record<string, unknown>;

function createSupabaseMock() {
  const inserted: InsertedPayment[] = [];
  const updates: Array<Record<string, unknown>> = [];
  const supabase = {
    from(table: string) {
      if (table !== "application_payments") {
        throw new Error(`Unexpected table: ${table}`);
      }
      return {
        insert: (row: InsertedPayment) => {
          inserted.push(row);
          return {
            select: () => ({
              single: async () => ({
                data: {
                  id: "payment-1",
                  created_at: "2026-10-01T12:00:00Z",
                  ...row,
                },
                error: null,
              }),
            }),
          };
        },
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: { id: "payment-1", status: "pending", ...inserted[0] },
              error: null,
            }),
          }),
        }),
        update: (payload: Record<string, unknown>) => {
          updates.push(payload);
          return {
            eq: () => ({
              eq: () => ({
                select: () => ({
                  maybeSingle: async () => ({
                    data: {
                      id: "payment-1",
                      created_at: "2026-10-01T12:00:00Z",
                      ...inserted[0],
                      ...payload,
                    },
                    error: null,
                  }),
                }),
              }),
            }),
          };
        },
      };
    },
  };
  return { supabase, inserted, updates };
}

function createStripeMock(input: {
  paymentMethodType: string;
  create: (params: Stripe.PaymentIntentCreateParams) => Promise<unknown>;
}) {
  return {
    paymentMethods: {
      retrieve: async (id: string) => ({ id, type: input.paymentMethodType }),
    },
    paymentIntents: { create: input.create },
  } as unknown as Stripe;
}

const baseInput = {
  organizationId: "org-1",
  familyId: "family-1",
  chargeId: "charge-1",
  amountCents: 60000,
  label: "Oct Tuition",
  currency: "USD",
  stripeConnectAccountId: "acct_school",
  stripeCustomerId: "cus_family",
  stripePaymentMethodId: "pm_saved",
  payerUserId: "user-1",
};

describe("checkoutPaymentMethodForStripeType", () => {
  it("maps bank accounts to us_bank_account and everything else to card", () => {
    assert.equal(checkoutPaymentMethodForStripeType("us_bank_account"), "us_bank_account");
    assert.equal(checkoutPaymentMethodForStripeType("card"), "card");
    assert.equal(checkoutPaymentMethodForStripeType("link"), "card");
    assert.equal(checkoutPaymentMethodForStripeType(undefined), "card");
  });
});

describe("executeTuitionAutopayCharge", () => {
  it("charges a saved bank account as us_bank_account with the ACH fee", async () => {
    const { supabase, inserted, updates } = createSupabaseMock();
    let captured: Stripe.PaymentIntentCreateParams | undefined;
    const stripe = createStripeMock({
      paymentMethodType: "us_bank_account",
      create: async (params) => {
        captured = params;
        return {
          id: "pi_ach",
          status: "requires_action",
          next_action: {
            type: "verify_with_microdeposits",
            verify_with_microdeposits: {
              hosted_verification_url: "https://payments.stripe.com/microdeposit/test",
              microdeposit_type: "descriptor_code",
            },
          },
        };
      },
    });

    const recorded: Array<{
      paymentIntentId?: string;
      stripeProviderStatus?: string | null;
      skipReceipt?: boolean;
      skipActivity?: boolean;
    }> = [];
    const recordCompleted: typeof recordTuitionPaymentCompleted = async (
      _admin,
      input,
    ) => {
      recorded.push(input);
      return { payment: input.payment, newlyRecorded: true };
    };

    const result = await executeTuitionAutopayCharge(
      supabase as never,
      { ...baseInput, suppressEmails: true },
      {
        stripe,
        recordCompleted,
      },
    );

    const achQuote = quoteProcessingFee(60000, "us_bank_account");
    assert.equal(result.outcome, "requires_action");
    assert.equal(result.paymentIntentId, "pi_ach");
    assert.deepEqual(captured?.payment_method_types, ["us_bank_account"]);
    assert.equal(captured?.amount, achQuote.grossAmountCents);
    assert.equal(captured?.metadata?.payment_method, "us_bank_account");
    assert.equal(inserted[0]?.payment_method_type, "us_bank_account");
    assert.equal(inserted[0]?.charged_amount_cents, achQuote.grossAmountCents);
    assert.equal(recorded.length, 1);
    assert.equal(recorded[0]?.paymentIntentId, "pi_ach");
    assert.equal(recorded[0]?.stripeProviderStatus, "requires_action");
    assert.equal(recorded[0]?.skipReceipt, true);
    assert.equal(recorded[0]?.skipActivity, true);
  });

  it("charges a saved card as card with the card fee", async () => {
    const { supabase, inserted } = createSupabaseMock();
    let captured: Stripe.PaymentIntentCreateParams | undefined;
    const stripe = createStripeMock({
      paymentMethodType: "card",
      create: async (params) => {
        captured = params;
        return { id: "pi_card", status: "requires_action" };
      },
    });

    await executeTuitionAutopayCharge(supabase as never, baseInput, { stripe });

    const cardQuote = quoteProcessingFee(60000, "card");
    assert.deepEqual(captured?.payment_method_types, ["card"]);
    assert.equal(captured?.amount, cardQuote.grossAmountCents);
    assert.equal(inserted[0]?.payment_method_type, "card");
  });

  it("skips receipts when suppressEmails is set", async () => {
    const { supabase } = createSupabaseMock();
    const stripe = createStripeMock({
      paymentMethodType: "us_bank_account",
      create: async () => ({ id: "pi_quiet", status: "processing" }),
    });
    const recorded: Array<{ skipReceipt?: boolean; paymentIntentId?: string }> = [];
    const recordCompleted: typeof recordTuitionPaymentCompleted = async (
      _admin,
      input,
    ) => {
      recorded.push(input);
      return { payment: input.payment, newlyRecorded: true };
    };

    await executeTuitionAutopayCharge(
      supabase as never,
      { ...baseInput, suppressEmails: true },
      { stripe, recordCompleted },
    );
    await executeTuitionAutopayCharge(supabase as never, baseInput, {
      stripe,
      recordCompleted,
    });

    assert.equal(recorded.length, 2);
    assert.equal(recorded[0]?.skipReceipt, true);
    assert.equal(recorded[0]?.paymentIntentId, "pi_quiet");
    assert.equal(recorded[1]?.skipReceipt, false);
  });

  it("marks the pending payment row failed when Stripe rejects the charge", async () => {
    const { supabase, updates } = createSupabaseMock();
    const stripeError = Object.assign(new Error("Your card was declined."), {
      raw: { payment_intent: { id: "pi_declined" } },
    });
    const stripe = createStripeMock({
      paymentMethodType: "us_bank_account",
      create: async () => {
        throw stripeError;
      },
    });

    await assert.rejects(
      executeTuitionAutopayCharge(supabase as never, baseInput, { stripe }),
      stripeError,
    );

    assert.equal(updates.length, 1);
    assert.equal(updates[0]?.status, "failed");
    assert.equal(updates[0]?.stripe_payment_intent_id, "pi_declined");
  });
});
