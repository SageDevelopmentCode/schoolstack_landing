import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type Stripe from "stripe";
import { createAdmissionsCheckoutSession, createCombinedAdmissionsCheckoutSession } from "@/lib/stripe/checkout-session";
import { createMockStripeClient } from "@/test/mocks/stripe";

describe("createAdmissionsCheckoutSession", () => {
  it("creates a checkout session with transfer_data and fee metadata", async () => {
    let capturedParams: Stripe.Checkout.SessionCreateParams | undefined;

    const mockStripe = createMockStripeClient({
      sessionsCreate: async (params) => {
        capturedParams = params;
        return {
          id: "cs_test_checkout",
          url: "https://checkout.stripe.test/session",
        } as Stripe.Checkout.Session;
      },
    });

    const result = await createAdmissionsCheckoutSession(
      {
        netAmountCents: 5000,
        paymentMethod: "card",
        label: "Application fee",
        stripeConnectAccountId: "acct_test_connect",
        stripeCustomerId: "cus_test_customer",
        payerUserId: "user_test_123",
        successUrl: "http://localhost/success",
        cancelUrl: "http://localhost/cancel",
        paymentId: "pay_test_123",
        paymentIntentMetadata: {
          application_id: "app_test_123",
          organization_id: "org_test_123",
        },
        sessionMetadata: {
          application_id: "app_test_123",
          organization_id: "org_test_123",
        },
      },
      { stripe: mockStripe },
    );

    assert.equal(result.session.id, "cs_test_checkout");
    assert.equal(result.quote.netAmountCents, 5000);
    assert.ok(capturedParams);
    assert.equal(capturedParams?.mode, "payment");
    assert.equal(capturedParams?.customer, "cus_test_customer");
    assert.deepEqual(capturedParams?.payment_method_types, ["card"]);
    assert.equal(
      capturedParams?.payment_intent_data?.transfer_data?.destination,
      "acct_test_connect",
    );
    assert.equal(
      capturedParams?.payment_intent_data?.transfer_data?.amount,
      5000,
    );
    assert.equal(
      capturedParams?.payment_intent_data?.metadata?.payment_id,
      "pay_test_123",
    );
    assert.equal(
      capturedParams?.metadata?.application_id,
      "app_test_123",
    );
    assert.equal(capturedParams?.line_items?.[0]?.price_data?.unit_amount, result.quote.grossAmountCents);
    assert.deepEqual(capturedParams?.saved_payment_method_options?.allow_redisplay_filters, [
      "always",
      "limited",
      "unspecified",
    ]);
    assert.equal(capturedParams?.payment_method_data?.allow_redisplay, "always");
  });

  it("uses us_bank_account payment method types for ACH", async () => {
    let capturedParams: Stripe.Checkout.SessionCreateParams | undefined;

    const mockStripe = createMockStripeClient({
      sessionsCreate: async (params) => {
        capturedParams = params;
        return { id: "cs_test_ach" } as Stripe.Checkout.Session;
      },
    });

    await createAdmissionsCheckoutSession(
      {
        netAmountCents: 10_000,
        paymentMethod: "us_bank_account",
        label: "Application fee",
        stripeConnectAccountId: "acct_test_connect",
        stripeCustomerId: "cus_test_customer",
        payerUserId: "user_test_123",
        successUrl: "http://localhost/success",
        cancelUrl: "http://localhost/cancel",
        paymentId: "pay_test_ach",
      },
      { stripe: mockStripe },
    );

    assert.deepEqual(capturedParams?.payment_method_types, ["us_bank_account"]);
    assert.ok(capturedParams?.payment_method_options?.us_bank_account);
  });
});

describe("createCombinedAdmissionsCheckoutSession", () => {
  it("creates multiple line items with a single combined processing fee", async () => {
    let capturedParams: Stripe.Checkout.SessionCreateParams | undefined;

    const mockStripe = createMockStripeClient({
      sessionsCreate: async (params) => {
        capturedParams = params;
        return {
          id: "cs_test_combined",
          url: "https://checkout.stripe.test/combined",
        } as Stripe.Checkout.Session;
      },
    });

    const result = await createCombinedAdmissionsCheckoutSession(
      {
        lineItems: [
          { label: "Ava — Registration fee", netAmountCents: 50_000 },
          { label: "Noah — Registration fee", netAmountCents: 50_000 },
        ],
        paymentMethod: "card",
        stripeConnectAccountId: "acct_test_connect",
        stripeCustomerId: "cus_test_customer",
        payerUserId: "user_test_123",
        successUrl: "http://localhost/success",
        cancelUrl: "http://localhost/cancel",
        paymentIds: ["pay_1", "pay_2"],
        sessionMetadata: {
          payment_type: "enrollment_checklist_combined",
          organization_id: "org_test_123",
        },
      },
      { stripe: mockStripe },
    );

    assert.equal(result.quote.netAmountCents, 100_000);
    assert.equal(capturedParams?.line_items?.length, 2);
    const lineItemGrossTotal = (capturedParams?.line_items ?? []).reduce(
      (sum, lineItem) => sum + Number(lineItem.price_data?.unit_amount ?? 0),
      0,
    );
    assert.equal(lineItemGrossTotal, result.quote.grossAmountCents);
    assert.equal(
      capturedParams?.payment_intent_data?.transfer_data?.amount,
      100_000,
    );
    assert.equal(
      capturedParams?.metadata?.payment_type,
      "enrollment_checklist_combined",
    );
  });
});
