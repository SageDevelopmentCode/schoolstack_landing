import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import {
  ACTIVITY_ACTIONS,
  logActivityEvent,
} from "@/lib/activity-log";
import { sendApplicationSubmittedNotifications } from "@/lib/admissions/application-notifications";
import { sendPaymentCompletedNotifications } from "@/lib/admissions/payment-notifications";
import {
  getApplicationForSubmit,
  loadPublishedFormForApplication,
  submitApplicationAfterFeePaid,
} from "@/lib/admissions/application-submit";
import { completeChecklistPaymentFromWebhook } from "@/lib/admissions/enrollment-checklist-materialization";
import {
  attachCheckoutSessionToPayment,
  getApplicationPaymentByCheckoutSession,
  getPaymentById,
  markPaymentSucceeded,
  type PaymentRecord,
} from "@/lib/stripe/application-payments";
import {
  backfillStripeCustomerId,
  resolveCheckoutSessionCustomerId,
  resolveCheckoutSessionSupabaseUserId,
} from "@/lib/stripe/customer";
import { syncPaymentAccountFromStripe } from "@/lib/stripe/organization-payment-account";

export async function handleCheckoutSessionCompleted(
  admin: SupabaseClient,
  session: Stripe.Checkout.Session,
): Promise<void> {
  const checkoutSessionId = session.id;
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  const metadata = session.metadata ?? {};

  const stripeCustomerId = resolveCheckoutSessionCustomerId(session);
  const supabaseUserId = resolveCheckoutSessionSupabaseUserId(session);
  if (stripeCustomerId && supabaseUserId) {
    await backfillStripeCustomerId(admin, supabaseUserId, stripeCustomerId);
  }

  if (
    metadata.payment_type === "enrollment_checklist" &&
    metadata.checklist_item_id &&
    metadata.organization_id
  ) {
    await handleEnrollmentChecklistCheckoutCompleted(admin, {
      session,
      checkoutSessionId,
      paymentIntentId,
      metadata,
    });
    return;
  }

  await handleApplicationFeeCheckoutCompleted(admin, {
    session,
    checkoutSessionId,
    paymentIntentId,
    metadata,
  });
}

async function handleEnrollmentChecklistCheckoutCompleted(
  admin: SupabaseClient,
  input: {
    session: Stripe.Checkout.Session;
    checkoutSessionId: string;
    paymentIntentId: string | undefined;
    metadata: Stripe.Metadata;
  },
): Promise<void> {
  const { checkoutSessionId, paymentIntentId, metadata } = input;
  const paymentId =
    typeof metadata.payment_id === "string" ? metadata.payment_id : null;
  let payment = paymentId ? await getPaymentById(admin, paymentId) : null;

  if (!payment) {
    payment = await getApplicationPaymentByCheckoutSession(
      admin,
      checkoutSessionId,
    );
  }

  if (payment && payment.status !== "succeeded") {
    payment = await markPaymentSucceeded(admin, payment.id, {
      stripePaymentIntentId: paymentIntentId,
      stripeCheckoutSessionId: checkoutSessionId,
    });
    if (payment) {
      void sendPaymentCompletedNotifications(admin, payment.id);
    }
  }

  await completeChecklistPaymentFromWebhook(admin, {
    instanceId: metadata.checklist_item_id as string,
    organizationId: metadata.organization_id as string,
    checkoutSessionId,
    paymentIntentId,
  });

  void logActivityEvent(admin, {
    organizationId: metadata.organization_id as string,
    actorType: "system",
    surface: "system",
    action: ACTIVITY_ACTIONS.APPLICATION_PAYMENT_COMPLETED,
    entityType: "enrollment_checklist_item",
    entityId: metadata.checklist_item_id as string,
    summary: "Enrollment checklist payment completed",
    metadata: {
      checkoutSessionId,
      applicationId: metadata.application_id ?? null,
      paymentId: payment?.id ?? paymentId ?? null,
    },
  });
}

async function handleApplicationFeeCheckoutCompleted(
  admin: SupabaseClient,
  input: {
    session: Stripe.Checkout.Session;
    checkoutSessionId: string;
    paymentIntentId: string | undefined;
    metadata: Stripe.Metadata;
  },
): Promise<void> {
  const { checkoutSessionId, paymentIntentId, metadata } = input;

  let payment = await getApplicationPaymentByCheckoutSession(
    admin,
    checkoutSessionId,
  );

  const paymentId = metadata.payment_id;

  if (!payment && paymentId) {
    await attachCheckoutSessionToPayment(admin, paymentId, checkoutSessionId);
    payment = await getPaymentById(admin, paymentId);
  }

  if (payment && payment.status !== "succeeded") {
    payment = await markPaymentSucceeded(admin, payment.id, {
      stripePaymentIntentId: paymentIntentId,
      stripeCheckoutSessionId: checkoutSessionId,
    });
    if (payment) {
      void sendPaymentCompletedNotifications(admin, payment.id);
    }
  }

  if (!payment) {
    console.warn("checkout.session.completed: payment not found", checkoutSessionId);
    return;
  }

  await processApplicationFeePayment(admin, payment, checkoutSessionId);
}

async function processApplicationFeePayment(
  admin: SupabaseClient,
  payment: PaymentRecord,
  checkoutSessionId: string,
): Promise<void> {
  const application = await getApplicationForSubmit(admin, payment.applicationId);
  if (!application) {
    console.warn("checkout.session.completed: application not found", payment.applicationId);
    return;
  }

  if (application.status !== "draft") {
    return;
  }

  const { schema } = await loadPublishedFormForApplication(admin, application);
  const result = await submitApplicationAfterFeePaid(
    admin,
    payment.applicationId,
    schema,
    application,
  );

  if (!result.submitted) {
    console.warn(
      "checkout.session.completed: application paid but not ready to submit",
      payment.applicationId,
      result.validationError.code,
    );

    void logActivityEvent(admin, {
      organizationId: application.organizationId,
      actorType: "system",
      surface: "system",
      action: ACTIVITY_ACTIONS.APPLICATION_PAYMENT_COMPLETED,
      entityType: "application",
      entityId: payment.applicationId,
      summary: "Application fee payment completed",
      metadata: {
        paymentId: payment.id,
        checkoutSessionId,
        amountCents: payment.amountCents,
        submitBlocked: result.validationError.code,
      },
    });
    return;
  }

  void sendApplicationSubmittedNotifications(admin, payment.applicationId);

  const { data: formRow } = await admin
    .from("application_form_versions")
    .select("title")
    .eq("id", application.formVersionId)
    .maybeSingle();

  void logActivityEvent(admin, {
    organizationId: application.organizationId,
    actorType: "system",
    surface: "system",
    action: ACTIVITY_ACTIONS.APPLICATION_PAYMENT_COMPLETED,
    entityType: "application",
    entityId: payment.applicationId,
    summary: "Application fee payment completed",
    metadata: {
      paymentId: payment.id,
      checkoutSessionId,
      amountCents: payment.amountCents,
    },
  });

  void logActivityEvent(admin, {
    organizationId: application.organizationId,
    actorType: "system",
    surface: "system",
    action: ACTIVITY_ACTIONS.APPLICATION_SUBMITTED,
    entityType: "application",
    entityId: payment.applicationId,
    summary: `Application submitted${formRow?.title ? ` for “${String(formRow.title)}”` : ""} (after payment)`,
    metadata: {
      formVersionId: application.formVersionId,
      programId: application.programId,
      formTitle: formRow?.title ? String(formRow.title) : null,
      paymentId: payment.id,
      checkoutSessionId,
    },
  });
}

export async function handleAccountUpdated(
  admin: SupabaseClient,
  account: Stripe.Account,
): Promise<void> {
  const { data: existing } = await admin
    .from("organization_payment_accounts")
    .select("organization_id, charges_enabled")
    .eq("stripe_connect_account_id", account.id)
    .maybeSingle();

  const wasChargesEnabled = Boolean(existing?.charges_enabled);
  const chargesNowEnabled = Boolean(account.charges_enabled);

  await syncPaymentAccountFromStripe(admin, account.id, account);

  if (!wasChargesEnabled && chargesNowEnabled && existing?.organization_id) {
    void logActivityEvent(admin, {
      organizationId: String(existing.organization_id),
      actorType: "system",
      surface: "system",
      action: ACTIVITY_ACTIONS.PAYMENTS_STRIPE_CONNECTED,
      entityType: "organization_payment_account",
      summary: "Stripe Connect account is ready to accept payments",
      metadata: {
        stripeConnectAccountId: account.id,
        chargesEnabled: chargesNowEnabled,
        payoutsEnabled: Boolean(account.payouts_enabled),
      },
    });
  }
}
