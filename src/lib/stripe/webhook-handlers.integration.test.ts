import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { before, describe, it } from "node:test";
import type Stripe from "stripe";
import {
  createTestAdminClient,
  integrationTestsEnabled,
  loadTestEnv,
} from "@/test/integration/helpers";
import {
  seedDraftApplication,
  seedEnrollmentChecklistPayment,
  seedFeeEnabledForm,
  seedPaymentAccountForOrg,
  seedPendingPayment,
} from "@/test/integration/seed-admissions";
import {
  handleAccountUpdated,
  handleCheckoutSessionCompleted,
} from "@/lib/stripe/webhook-handlers";

const describeIntegration = integrationTestsEnabled() ? describe : describe.skip;

function buildCheckoutSession(input: {
  id: string;
  paymentIntentId?: string;
  metadata?: Record<string, string>;
}): Stripe.Checkout.Session {
  return {
    id: input.id,
    object: "checkout.session",
    payment_intent: input.paymentIntentId ?? `pi_test_${randomUUID().slice(0, 8)}`,
    metadata: input.metadata ?? {},
  } as Stripe.Checkout.Session;
}

describeIntegration("handleCheckoutSessionCompleted", () => {
  before(() => {
    loadTestEnv();
  });

  it("marks payment succeeded and submits a valid draft application", async () => {
    const admin = createTestAdminClient();
    const form = await seedFeeEnabledForm(admin);
    const draft = await seedDraftApplication(admin, { form });
    const payment = await seedPendingPayment(admin, {
      organizationId: draft.organizationId,
      applicationId: draft.applicationId,
    });

    await handleCheckoutSessionCompleted(
      admin,
      buildCheckoutSession({
        id: payment.checkoutSessionId,
        metadata: { payment_id: payment.paymentId },
      }),
    );

    const { data: paymentRow } = await admin
      .from("application_payments")
      .select("status")
      .eq("id", payment.paymentId)
      .single();

    const { data: application } = await admin
      .from("applications")
      .select("status, fee_status, student_id")
      .eq("id", draft.applicationId)
      .single();

    assert.equal(paymentRow?.status, "succeeded");
    assert.equal(application?.fee_status, "paid");
    assert.equal(application?.status, "submitted");
    assert.ok(application?.student_id);
  });

  it("marks fee paid but keeps draft when acknowledgments are incomplete", async () => {
    const admin = createTestAdminClient();
    const form = await seedFeeEnabledForm(admin, { requireAcknowledgment: true });
    const draft = await seedDraftApplication(admin, { form });
    const payment = await seedPendingPayment(admin, {
      organizationId: draft.organizationId,
      applicationId: draft.applicationId,
    });

    await handleCheckoutSessionCompleted(
      admin,
      buildCheckoutSession({
        id: payment.checkoutSessionId,
        metadata: { payment_id: payment.paymentId },
      }),
    );

    const { data: application } = await admin
      .from("applications")
      .select("status, fee_status")
      .eq("id", draft.applicationId)
      .single();

    assert.equal(application?.fee_status, "paid");
    assert.equal(application?.status, "draft");
  });

  it("no-ops when the application is already submitted", async () => {
    const admin = createTestAdminClient();
    const form = await seedFeeEnabledForm(admin);
    const draft = await seedDraftApplication(admin, { form });
    const payment = await seedPendingPayment(admin, {
      organizationId: draft.organizationId,
      applicationId: draft.applicationId,
    });

    const submittedAt = new Date().toISOString();
    await admin
      .from("applications")
      .update({ status: "submitted", submitted_at: submittedAt })
      .eq("id", draft.applicationId);

    await handleCheckoutSessionCompleted(
      admin,
      buildCheckoutSession({
        id: payment.checkoutSessionId,
        metadata: { payment_id: payment.paymentId },
      }),
    );

    const { data: application } = await admin
      .from("applications")
      .select("status, submitted_at")
      .eq("id", draft.applicationId)
      .single();

    assert.equal(application?.status, "submitted");
    assert.ok(application?.submitted_at);
  });

  it("no-ops when payment row is missing", async () => {
    const admin = createTestAdminClient();
    const checkoutSessionId = `cs_test_missing_${randomUUID().slice(0, 8)}`;

    await assert.doesNotReject(() =>
      handleCheckoutSessionCompleted(
        admin,
        buildCheckoutSession({ id: checkoutSessionId }),
      ),
    );
  });

  it("completes enrollment checklist payment", async () => {
    const admin = createTestAdminClient();
    const fixture = await seedEnrollmentChecklistPayment(admin);

    await handleCheckoutSessionCompleted(
      admin,
      buildCheckoutSession({
        id: fixture.checkoutSessionId,
        metadata: {
          payment_type: "enrollment_checklist",
          checklist_item_id: fixture.checklistItemId,
          organization_id: fixture.organizationId,
          application_id: fixture.applicationId,
          payment_id: fixture.paymentId,
        },
      }),
    );

    const { data: paymentRow } = await admin
      .from("application_payments")
      .select("status")
      .eq("id", fixture.paymentId)
      .single();

    const { data: checklistItem } = await admin
      .from("enrollment_checklist_items")
      .select("payment_status, status")
      .eq("id", fixture.checklistItemId)
      .single();

    assert.equal(paymentRow?.status, "succeeded");
    assert.equal(checklistItem?.payment_status, "paid");
    assert.equal(checklistItem?.status, "completed");
  });

  it("is idempotent when enrollment checklist item is already paid and completed", async () => {
    const admin = createTestAdminClient();
    const fixture = await seedEnrollmentChecklistPayment(admin);

    await admin
      .from("enrollment_checklist_items")
      .update({ payment_status: "paid", status: "completed" })
      .eq("id", fixture.checklistItemId);

    await admin
      .from("application_payments")
      .update({ status: "succeeded", paid_at: new Date().toISOString() })
      .eq("id", fixture.paymentId);

    await assert.doesNotReject(() =>
      handleCheckoutSessionCompleted(
        admin,
        buildCheckoutSession({
          id: fixture.checkoutSessionId,
          metadata: {
            payment_type: "enrollment_checklist",
            checklist_item_id: fixture.checklistItemId,
            organization_id: fixture.organizationId,
            application_id: fixture.applicationId,
            payment_id: fixture.paymentId,
          },
        }),
      ),
    );
  });
});

describeIntegration("handleAccountUpdated", () => {
  before(() => {
    loadTestEnv();
  });

  it("syncs charges_enabled on organization payment account", async () => {
    const admin = createTestAdminClient();
    const stripeConnectAccountId = `acct_test_${randomUUID().slice(0, 8)}`;
    const organizationId = await seedPaymentAccountForOrg(
      admin,
      stripeConnectAccountId,
      { chargesEnabled: false },
    );

    await handleAccountUpdated(admin, {
      id: stripeConnectAccountId,
      object: "account",
      charges_enabled: true,
      payouts_enabled: true,
      details_submitted: true,
    } as Stripe.Account);

    const { data: account } = await admin
      .from("organization_payment_accounts")
      .select("charges_enabled, payouts_enabled, onboarding_status")
      .eq("organization_id", organizationId)
      .single();

    assert.equal(account?.charges_enabled, true);
    assert.equal(account?.payouts_enabled, true);
    assert.equal(account?.onboarding_status, "complete");
  });
});
