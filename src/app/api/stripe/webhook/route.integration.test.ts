import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { before, describe, it } from "node:test";
import type Stripe from "stripe";
import { POST } from "@/app/api/stripe/webhook/route";
import { setStripeClientForTests } from "@/lib/stripe/client";
import {
  buildCheckoutSessionCompletedEvent,
  buildCheckoutSessionEvent,
  createMockStripeClient,
  signWebhookPayload,
} from "@/test/mocks/stripe";
import {
  createTestAdminClient,
  integrationTestsEnabled,
  loadTestEnv,
} from "@/test/integration/helpers";
import {
  seedDraftApplication,
  seedFeeEnabledForm,
  seedPendingPayment,
} from "@/test/integration/seed-admissions";

const WEBHOOK_SECRET = "whsec_test_integration_secret";
const describeIntegration = integrationTestsEnabled() ? describe : describe.skip;

function buildSignedRequest(
  event: Stripe.Event,
  signature?: string,
): Request {
  const payload = JSON.stringify(event);
  return new Request("http://localhost/api/stripe/webhook", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(signature === undefined
        ? {}
        : { "stripe-signature": signature }),
    },
    body: payload,
  });
}

describeIntegration("POST /api/stripe/webhook", () => {
  before(() => {
    loadTestEnv();
    process.env.STRIPE_WEBHOOK_SECRET = WEBHOOK_SECRET;
    process.env.STRIPE_SECRET_KEY = "sk_test_integration_dummy";
    setStripeClientForTests(createMockStripeClient());
  });

  it("returns 400 when stripe-signature is missing", async () => {
    const response = await POST(
      buildSignedRequest(
        buildCheckoutSessionCompletedEvent({
          id: "cs_test",
        } as Stripe.Checkout.Session),
      ),
    );

    assert.equal(response.status, 400);
  });

  it("returns 400 when stripe-signature is invalid", async () => {
    const event = buildCheckoutSessionCompletedEvent({
      id: "cs_test",
    } as Stripe.Checkout.Session);

    const response = await POST(
      buildSignedRequest(event, "invalid-signature"),
    );

    assert.equal(response.status, 400);
  });

  it("returns 200 and processes a signed checkout.session.completed event", async () => {
    const admin = createTestAdminClient();
    const form = await seedFeeEnabledForm(admin);
    const draft = await seedDraftApplication(admin, { form });
    const payment = await seedPendingPayment(admin, {
      organizationId: draft.organizationId,
      applicationId: draft.applicationId,
    });

    const session = {
      id: payment.checkoutSessionId,
      object: "checkout.session",
      payment_intent: `pi_test_${randomUUID().slice(0, 8)}`,
      metadata: { payment_id: payment.paymentId },
    } as unknown as Stripe.Checkout.Session;

    const event = buildCheckoutSessionCompletedEvent(session);
    const payload = JSON.stringify(event);
    const signature = signWebhookPayload(payload, WEBHOOK_SECRET);

    const response = await POST(buildSignedRequest(event, signature));
    const body = (await response.json()) as { received?: boolean };

    assert.equal(response.status, 200);
    assert.equal(body.received, true);

    const { data: application } = await admin
      .from("applications")
      .select("status, fee_status")
      .eq("id", draft.applicationId)
      .single();

    assert.equal(application?.fee_status, "paid");
    assert.equal(application?.status, "submitted");
  });

  it("returns 200 and processes a signed checkout.session.async_payment_succeeded event", async () => {
    const admin = createTestAdminClient();
    const form = await seedFeeEnabledForm(admin);
    const draft = await seedDraftApplication(admin, { form });
    const payment = await seedPendingPayment(admin, {
      organizationId: draft.organizationId,
      applicationId: draft.applicationId,
    });

    const session = {
      id: payment.checkoutSessionId,
      object: "checkout.session",
      payment_intent: `pi_test_${randomUUID().slice(0, 8)}`,
      metadata: { payment_id: payment.paymentId },
    } as unknown as Stripe.Checkout.Session;

    const event = buildCheckoutSessionEvent(
      "checkout.session.async_payment_succeeded",
      session,
    );
    const payload = JSON.stringify(event);
    const signature = signWebhookPayload(payload, WEBHOOK_SECRET);

    const response = await POST(buildSignedRequest(event, signature));
    const body = (await response.json()) as { received?: boolean };

    assert.equal(response.status, 200);
    assert.equal(body.received, true);

    const { data: paymentRow } = await admin
      .from("application_payments")
      .select("status")
      .eq("id", payment.paymentId)
      .single();

    assert.equal(paymentRow?.status, "succeeded");
  });
});
