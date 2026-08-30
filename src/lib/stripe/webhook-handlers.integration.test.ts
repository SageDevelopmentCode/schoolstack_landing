import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { before, describe, it } from "node:test";
import type Stripe from "stripe";
import { setStripeClientForTests } from "@/lib/stripe/client";
import {
  createTestAdminClient,
  integrationTestsEnabled,
  loadTestEnv,
} from "@/test/integration/helpers";
import { createMockStripeClient } from "@/test/mocks/stripe";
import {
  seedDraftApplication,
  seedEnrollmentChecklistPayment,
  seedFeeEnabledForm,
  seedPaymentAccountForOrg,
  seedPendingPayment,
  seedTuitionPaymentWebhook,
} from "@/test/integration/seed-admissions";
import { saveFamilyPaymentMethod } from "@/lib/tuition/autopay";
import { ACTIVITY_ACTIONS } from "@/lib/activity-log";
import {
  handleAccountUpdated,
  handleCheckoutSessionAsyncPaymentFailed,
  handleCheckoutSessionAsyncPaymentSucceeded,
  handleCheckoutSessionCompleted,
} from "@/lib/stripe/webhook-handlers";

const describeIntegration = integrationTestsEnabled() ? describe : describe.skip;

function setupWebhookIntegrationTestEnv(): void {
  loadTestEnv();
  process.env.STRIPE_SECRET_KEY ??= "sk_test_integration_dummy";
  setStripeClientForTests(createMockStripeClient());
}

function buildCheckoutSession(input: {
  id: string;
  paymentIntentId?: string;
  metadata?: Record<string, string>;
  paymentStatus?: Stripe.Checkout.Session.PaymentStatus;
}): Stripe.Checkout.Session {
  return {
    id: input.id,
    object: "checkout.session",
    payment_intent: input.paymentIntentId ?? `pi_test_${randomUUID().slice(0, 8)}`,
    payment_status: input.paymentStatus ?? "paid",
    metadata: input.metadata ?? {},
  } as Stripe.Checkout.Session;
}

describeIntegration("handleCheckoutSessionCompleted", () => {
  before(() => {
    setupWebhookIntegrationTestEnv();
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

  it("completes combined enrollment checklist payments", async () => {
    const admin = createTestAdminClient();
    const firstFixture = await seedEnrollmentChecklistPayment(admin);
    const secondFixture = await seedEnrollmentChecklistPayment(admin);

    const checkoutSessionId = `cs_test_combined_${randomUUID().slice(0, 8)}`;

    const { data: secondPayment, error: secondPaymentError } = await admin
      .from("application_payments")
      .insert({
        organization_id: secondFixture.organizationId,
        application_id: secondFixture.applicationId,
        amount_cents: 2500,
        currency: "USD",
        status: "pending",
        payment_type: "enrollment_checklist",
        enrollment_checklist_item_id: secondFixture.checklistItemId,
        stripe_checkout_session_id: checkoutSessionId,
        label: "Enrollment fee",
      })
      .select("id")
      .single();

    if (secondPaymentError) throw secondPaymentError;

    await admin
      .from("application_payments")
      .update({ stripe_checkout_session_id: checkoutSessionId })
      .eq("id", firstFixture.paymentId);

    await handleCheckoutSessionCompleted(
      admin,
      buildCheckoutSession({
        id: checkoutSessionId,
        metadata: {
          payment_type: "enrollment_checklist_combined",
          organization_id: firstFixture.organizationId,
          checklist_item_ids: `${firstFixture.checklistItemId},${secondFixture.checklistItemId}`,
          payment_ids: `${firstFixture.paymentId},${secondPayment.id}`,
        },
      }),
    );

    const { data: paymentRows } = await admin
      .from("application_payments")
      .select("status")
      .in("id", [firstFixture.paymentId, secondPayment.id]);

    const { data: checklistItems } = await admin
      .from("enrollment_checklist_items")
      .select("payment_status, status")
      .in("id", [firstFixture.checklistItemId, secondFixture.checklistItemId]);

    assert.equal(paymentRows?.every((row) => row.status === "succeeded"), true);
    assert.equal(
      checklistItems?.every(
        (row) => row.payment_status === "paid" && row.status === "completed",
      ),
      true,
    );
  });

  it("completes enrollment checklist payment via async_payment_succeeded", async () => {
    const admin = createTestAdminClient();
    const fixture = await seedEnrollmentChecklistPayment(admin);

    await handleCheckoutSessionAsyncPaymentSucceeded(
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

  it("logs one payment activity event when checkout and async_payment_succeeded both fire", async () => {
    const admin = createTestAdminClient();
    const fixture = await seedEnrollmentChecklistPayment(admin);
    const session = buildCheckoutSession({
      id: fixture.checkoutSessionId,
      paymentStatus: "paid",
      metadata: {
        payment_type: "enrollment_checklist",
        checklist_item_id: fixture.checklistItemId,
        organization_id: fixture.organizationId,
        application_id: fixture.applicationId,
        payment_id: fixture.paymentId,
      },
    });

    await handleCheckoutSessionCompleted(admin, session);
    await handleCheckoutSessionAsyncPaymentSucceeded(admin, session);

    const { data: activityEvents, error } = await admin
      .from("activity_events")
      .select("id")
      .eq("organization_id", fixture.organizationId)
      .eq("action", ACTIVITY_ACTIONS.APPLICATION_PAYMENT_COMPLETED)
      .contains("metadata", { paymentId: fixture.paymentId });

    assert.ifError(error);
    assert.equal(activityEvents?.length, 1);
  });

  it("marks pending enrollment payment failed via async_payment_failed", async () => {
    const admin = createTestAdminClient();
    const fixture = await seedEnrollmentChecklistPayment(admin);

    await handleCheckoutSessionAsyncPaymentFailed(
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

    assert.equal(paymentRow?.status, "failed");
    assert.equal(checklistItem?.payment_status, "pending");
    assert.equal(checklistItem?.status, "not_started");
  });
});

describeIntegration("handleTuitionCheckoutCompleted", () => {
  before(() => {
    setupWebhookIntegrationTestEnv();
  });

  it("settles ACH tuition on checkout.session.completed with payment_status unpaid", async () => {
    const admin = createTestAdminClient();
    const fixture = await seedTuitionPaymentWebhook(admin);

    await handleCheckoutSessionCompleted(
      admin,
      buildCheckoutSession({
        id: fixture.checkoutSessionId,
        paymentStatus: "unpaid",
        metadata: {
          payment_type: "tuition",
          tuition_charge_id: fixture.chargeId,
          organization_id: fixture.organizationId,
          payment_id: fixture.paymentId,
          payment_method: "us_bank_account",
        },
      }),
    );

    const { data: paymentRow } = await admin
      .from("application_payments")
      .select("status, stripe_payment_intent_id, stripe_provider_status")
      .eq("id", fixture.paymentId)
      .single();

    const { data: chargeRow } = await admin
      .from("tuition_charges")
      .select("status, paid_cents")
      .eq("id", fixture.chargeId)
      .single();

    assert.equal(paymentRow?.status, "succeeded");
    assert.ok(paymentRow?.stripe_payment_intent_id);
    assert.equal(paymentRow?.stripe_provider_status, "processing");
    assert.equal(chargeRow?.status, "paid");
    assert.equal(chargeRow?.paid_cents, 720_000);
  });

  it("is idempotent when checkout and async_payment_succeeded both fire for tuition", async () => {
    const admin = createTestAdminClient();
    const fixture = await seedTuitionPaymentWebhook(admin);

    const session = buildCheckoutSession({
      id: fixture.checkoutSessionId,
      paymentStatus: "unpaid",
      metadata: {
        payment_type: "tuition",
        tuition_charge_id: fixture.chargeId,
        organization_id: fixture.organizationId,
        payment_id: fixture.paymentId,
        payment_method: "us_bank_account",
      },
    });

    await handleCheckoutSessionCompleted(admin, session);
    await handleCheckoutSessionAsyncPaymentSucceeded(
      admin,
      buildCheckoutSession({
        id: fixture.checkoutSessionId,
        paymentStatus: "paid",
        metadata: session.metadata as Record<string, string>,
      }),
    );

    const { data: paymentRow } = await admin
      .from("application_payments")
      .select("status, stripe_provider_status")
      .eq("id", fixture.paymentId)
      .single();

    const { data: activityEvents, error } = await admin
      .from("activity_events")
      .select("id")
      .eq("organization_id", fixture.organizationId)
      .eq("action", ACTIVITY_ACTIONS.TUITION_PAYMENT_COMPLETED)
      .contains("metadata", { paymentId: fixture.paymentId });

    assert.ifError(error);
    assert.equal(paymentRow?.status, "succeeded");
    assert.equal(paymentRow?.stripe_provider_status, "succeeded");
    assert.equal(activityEvents?.length, 1);
  });

  it("alerts on ACH settlement failure without revoking recorded tuition payment", async () => {
    const admin = createTestAdminClient();
    const fixture = await seedTuitionPaymentWebhook(admin);

    const session = buildCheckoutSession({
      id: fixture.checkoutSessionId,
      paymentStatus: "unpaid",
      metadata: {
        payment_type: "tuition",
        tuition_charge_id: fixture.chargeId,
        organization_id: fixture.organizationId,
        payment_id: fixture.paymentId,
        payment_method: "us_bank_account",
      },
    });

    await handleCheckoutSessionCompleted(admin, session);

    await handleCheckoutSessionAsyncPaymentFailed(admin, session);

    const { data: paymentRow } = await admin
      .from("application_payments")
      .select("status, stripe_provider_status")
      .eq("id", fixture.paymentId)
      .single();

    const { data: chargeRow } = await admin
      .from("tuition_charges")
      .select("status, paid_cents")
      .eq("id", fixture.chargeId)
      .single();

    const { data: failureEvents, error } = await admin
      .from("activity_events")
      .select("summary, metadata")
      .eq("organization_id", fixture.organizationId)
      .eq("action", ACTIVITY_ACTIONS.APPLICATION_PAYMENT_FAILED)
      .contains("metadata", { paymentId: fixture.paymentId });

    assert.ifError(error);
    assert.equal(paymentRow?.status, "succeeded");
    assert.equal(paymentRow?.stripe_provider_status, "failed");
    assert.equal(chargeRow?.status, "paid");
    assert.equal(chargeRow?.paid_cents, 720_000);
    assert.equal(failureEvents?.length, 1);
    assert.match(failureEvents?.[0]?.summary ?? "", /settlement failed/i);
  });

  it("replaces an existing guardian payment method row in place", async () => {
    const admin = createTestAdminClient();
    const fixture = await seedTuitionPaymentWebhook(admin);
    const originalPaymentMethodId = `pm_test_${randomUUID().slice(0, 8)}`;
    const nextPaymentMethodId = `pm_test_${randomUUID().slice(0, 8)}`;

    await admin.from("family_payment_methods").insert({
      organization_id: fixture.organizationId,
      family_id: fixture.familyId,
      billing_account_id: fixture.billingAccountId,
      guardian_id: fixture.guardianId,
      stripe_payment_method_id: originalPaymentMethodId,
      brand: "link",
      last4: "0000",
      is_default: true,
    });

    await saveFamilyPaymentMethod(admin, {
      organizationId: fixture.organizationId,
      familyId: fixture.familyId,
      billingAccountId: fixture.billingAccountId,
      guardianId: fixture.guardianId,
      stripePaymentMethodId: nextPaymentMethodId,
      brand: "Chase",
      last4: "3225",
      isDefault: true,
    });

    const { data: rows, error } = await admin
      .from("family_payment_methods")
      .select("stripe_payment_method_id, brand, last4, is_default")
      .eq("billing_account_id", fixture.billingAccountId)
      .eq("guardian_id", fixture.guardianId);

    if (error) throw error;

    assert.equal(rows?.length, 1);
    assert.equal(rows?.[0]?.stripe_payment_method_id, nextPaymentMethodId);
    assert.equal(rows?.[0]?.brand, "Chase");
    assert.equal(rows?.[0]?.last4, "3225");
    assert.equal(rows?.[0]?.is_default, true);
  });
});

describeIntegration("handleAccountUpdated", () => {
  before(() => {
    setupWebhookIntegrationTestEnv();
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

    const { data: activity, error: activityError } = await admin
      .from("activity_events")
      .select("action, summary")
      .eq("organization_id", organizationId)
      .eq("action", ACTIVITY_ACTIONS.PAYMENTS_STRIPE_CONNECTED)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    assert.equal(activityError, null);
    assert.equal(activity.action, ACTIVITY_ACTIONS.PAYMENTS_STRIPE_CONNECTED);
    assert.match(activity.summary, /ready to accept payments/i);
  });
});
