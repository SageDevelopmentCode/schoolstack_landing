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
import { settleTuitionPayment } from "@/lib/tuition/payment-settlement";
import { getChargeById } from "@/lib/tuition/charges";
import {
  savePaymentMethodFromSetupIntent,
  trySaveTuitionPaymentMethod,
} from "@/lib/tuition/autopay";
import {
  attachCheckoutSessionToPayment,
  attachStripeCheckoutToPayment,
  getApplicationPaymentByCheckoutSession,
  getPaymentById,
  listPaymentsByCheckoutSession,
  markPaymentFailed,
  markPaymentSucceeded,
  type PaymentRecord,
} from "@/lib/stripe/application-payments";
import {
  backfillStripeCustomerId,
  resolveCheckoutSessionCustomerId,
  resolveCheckoutSessionSupabaseUserId,
} from "@/lib/stripe/customer";
import { notifyPaymentsReadyIfNeeded } from "@/lib/stripe/connect-notifications";
import { syncPaymentAccountFromStripe } from "@/lib/stripe/organization-payment-account";

async function tryMarkPaymentSucceeded(
  admin: SupabaseClient,
  payment: PaymentRecord,
  stripeRefs: {
    paymentIntentId: string | undefined;
    checkoutSessionId: string;
  },
): Promise<{ payment: PaymentRecord; newlySucceeded: boolean }> {
  if (payment.status === "succeeded") {
    return { payment, newlySucceeded: false };
  }

  const updated = await markPaymentSucceeded(admin, payment.id, {
    stripePaymentIntentId: stripeRefs.paymentIntentId,
    stripeCheckoutSessionId: stripeRefs.checkoutSessionId,
  });

  if (!updated) {
    return { payment, newlySucceeded: false };
  }

  return { payment: updated, newlySucceeded: true };
}

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
    metadata.payment_type === "enrollment_checklist_combined" &&
    metadata.organization_id
  ) {
    await handleCombinedEnrollmentChecklistCheckoutCompleted(admin, {
      checkoutSessionId,
      paymentIntentId,
      metadata,
    });
    return;
  }

  if (
    metadata.payment_type === "tuition_combined" &&
    metadata.organization_id
  ) {
    await handleCombinedTuitionCheckoutCompleted(admin, {
      session,
      checkoutSessionId,
      paymentIntentId,
      metadata,
    });
    return;
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

  if (
    metadata.payment_type === "tuition" &&
    metadata.tuition_charge_id &&
    metadata.organization_id
  ) {
    await handleTuitionCheckoutCompleted(admin, {
      session,
      checkoutSessionId,
      paymentIntentId,
      metadata,
    });
    return;
  }

  if (metadata.payment_type === "tuition_setup" && metadata.organization_id) {
    await handleTuitionSetupCheckoutCompleted(admin, {
      session,
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

export async function handleCheckoutSessionAsyncPaymentSucceeded(
  admin: SupabaseClient,
  session: Stripe.Checkout.Session,
): Promise<void> {
  await handleCheckoutSessionCompleted(admin, session);
}

export async function handleCheckoutSessionAsyncPaymentFailed(
  admin: SupabaseClient,
  session: Stripe.Checkout.Session,
): Promise<void> {
  const checkoutSessionId = session.id;
  const metadata = session.metadata ?? {};
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;
  const organizationId =
    typeof metadata.organization_id === "string" ? metadata.organization_id : null;

  const payments = await resolveCheckoutSessionPayments(admin, {
    checkoutSessionId,
    metadata,
  });

  for (const payment of payments) {
    if (payment.status !== "pending") continue;

    const updatedPayment = await markPaymentFailed(admin, payment.id, {
      stripePaymentIntentId: paymentIntentId,
      stripeCheckoutSessionId: checkoutSessionId,
    });

    if (!updatedPayment || updatedPayment.status !== "failed") continue;

    if (organizationId) {
      const entityType =
        payment.paymentType === "tuition"
          ? "tuition_charge"
          : payment.enrollmentChecklistItemId
            ? "enrollment_checklist_item"
            : payment.applicationId
              ? "application"
              : "application_payment";
      const entityId =
        payment.paymentType === "tuition"
          ? (payment.tuitionChargeId ?? payment.id)
          : (payment.enrollmentChecklistItemId ??
            payment.applicationId ??
            payment.id);

      void logActivityEvent(admin, {
        organizationId,
        actorType: "system",
        surface: "system",
        action: ACTIVITY_ACTIONS.APPLICATION_PAYMENT_FAILED,
        entityType,
        entityId,
        summary: "Payment failed (ACH)",
        metadata: {
          checkoutSessionId,
          paymentId: payment.id,
          applicationId: payment.applicationId,
          paymentType: payment.paymentType,
          tuitionChargeId: payment.tuitionChargeId,
        },
        severity: "warning",
      });
    }
  }
}

async function resolveCheckoutSessionPayments(
  admin: SupabaseClient,
  input: {
    checkoutSessionId: string;
    metadata: Stripe.Metadata;
  },
): Promise<PaymentRecord[]> {
  const paymentIds = parseCsvMetadata(input.metadata.payment_ids);
  const singlePaymentId =
    typeof input.metadata.payment_id === "string"
      ? input.metadata.payment_id
      : null;

  if (paymentIds.length > 0) {
    const resolvedPayments = await Promise.all(
      paymentIds.map((paymentId) => getPaymentById(admin, paymentId)),
    );
    return resolvedPayments.filter(
      (payment): payment is PaymentRecord => payment !== null,
    );
  }

  if (singlePaymentId) {
    const payment = await getPaymentById(admin, singlePaymentId);
    return payment ? [payment] : [];
  }

  return listPaymentsByCheckoutSession(admin, input.checkoutSessionId);
}

async function handleCombinedEnrollmentChecklistCheckoutCompleted(
  admin: SupabaseClient,
  input: {
    checkoutSessionId: string;
    paymentIntentId: string | undefined;
    metadata: Stripe.Metadata;
  },
): Promise<void> {
  const { checkoutSessionId, paymentIntentId, metadata } = input;
  const organizationId = metadata.organization_id as string;
  const checklistItemIds = parseCsvMetadata(metadata.checklist_item_ids);
  const paymentIds = parseCsvMetadata(metadata.payment_ids);

  let payments: PaymentRecord[] = [];
  if (paymentIds.length > 0) {
    const resolvedPayments = await Promise.all(
      paymentIds.map((paymentId) => getPaymentById(admin, paymentId)),
    );
    payments = resolvedPayments.filter(
      (payment): payment is PaymentRecord => payment !== null,
    );
  }

  if (payments.length === 0) {
    payments = await listPaymentsByCheckoutSession(admin, checkoutSessionId);
  }

  let newlySucceededAny = false;
  for (const payment of payments) {
    const { payment: updatedPayment, newlySucceeded } =
      await tryMarkPaymentSucceeded(admin, payment, {
        paymentIntentId,
        checkoutSessionId,
      });
    if (newlySucceeded) {
      newlySucceededAny = true;
      void sendPaymentCompletedNotifications(admin, updatedPayment.id);
    }
  }

  const instanceIds =
    checklistItemIds.length > 0
      ? checklistItemIds
      : payments
          .map((payment) => payment.enrollmentChecklistItemId)
          .filter((instanceId): instanceId is string => Boolean(instanceId));

  for (const instanceId of instanceIds) {
    await completeChecklistPaymentFromWebhook(admin, {
      instanceId,
      organizationId,
      checkoutSessionId,
      paymentIntentId,
    });
  }

  if (!newlySucceededAny) {
    return;
  }

  for (const instanceId of instanceIds) {
    void logActivityEvent(admin, {
      organizationId,
      actorType: "system",
      surface: "system",
      action: ACTIVITY_ACTIONS.APPLICATION_PAYMENT_COMPLETED,
      entityType: "enrollment_checklist_item",
      entityId: instanceId,
      summary: "Combined enrollment checklist payment completed",
      metadata: {
        checkoutSessionId,
        paymentIds: payments.map((payment) => payment.id),
      },
    });
  }
}

function parseCsvMetadata(value: string | undefined | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
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

  let newlySucceeded = false;
  if (payment) {
    const result = await tryMarkPaymentSucceeded(admin, payment, {
      paymentIntentId,
      checkoutSessionId,
    });
    payment = result.payment;
    newlySucceeded = result.newlySucceeded;
    if (newlySucceeded) {
      void sendPaymentCompletedNotifications(admin, payment.id);
    }
  }

  await completeChecklistPaymentFromWebhook(admin, {
    instanceId: metadata.checklist_item_id as string,
    organizationId: metadata.organization_id as string,
    checkoutSessionId,
    paymentIntentId,
  });

  if (!newlySucceeded) {
    return;
  }

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

async function handleTuitionSetupCheckoutCompleted(
  admin: SupabaseClient,
  input: {
    session: Stripe.Checkout.Session;
    metadata: Stripe.Metadata;
  },
): Promise<void> {
  const { session, metadata } = input;
  const organizationId = String(metadata.organization_id);
  const familyId = String(metadata.family_id);
  const setupIntentId =
    typeof session.setup_intent === "string"
      ? session.setup_intent
      : session.setup_intent?.id;

  if (!setupIntentId) return;

  const guardianId =
    typeof metadata.guardian_id === "string" && metadata.guardian_id.trim()
      ? metadata.guardian_id
      : null;
  const payerUserId =
    typeof metadata.supabase_user_id === "string" ? metadata.supabase_user_id : null;

  await savePaymentMethodFromSetupIntent(admin, {
    organizationId,
    familyId,
    setupIntentId,
    payerUserId,
    guardianId,
  });

  void logActivityEvent(admin, {
    organizationId,
    actorType: "parent",
    actorUserId: payerUserId,
    surface: "parent_portal",
    action: ACTIVITY_ACTIONS.TUITION_PAYMENT_METHOD_SAVED,
    entityType: "family",
    entityId: familyId,
    summary: "Payment method saved for tuition autopay",
    metadata: {
      familyId,
      guardianId,
    },
    severity: "info",
  });
}

async function handleCombinedTuitionCheckoutCompleted(
  admin: SupabaseClient,
  input: {
    session: Stripe.Checkout.Session;
    checkoutSessionId: string;
    paymentIntentId: string | undefined;
    metadata: Stripe.Metadata;
  },
): Promise<void> {
  const { session, checkoutSessionId, paymentIntentId, metadata } = input;
  const paymentSettled = session.payment_status === "paid";
  const tuitionChargeIds = parseCsvMetadata(metadata.tuition_charge_ids);
  const payments = await resolveCheckoutSessionPayments(admin, {
    checkoutSessionId,
    metadata,
  });

  let newlySucceededAny = false;
  for (const payment of payments) {
    if (payment.status === "succeeded") continue;

    if (paymentSettled) {
      const { newlySucceeded } = await tryMarkPaymentSucceeded(admin, payment, {
        paymentIntentId,
        checkoutSessionId,
      });
      if (newlySucceeded) {
        newlySucceededAny = true;
      }
    } else if (payment.status === "pending") {
      await attachStripeCheckoutToPayment(admin, payment.id, {
        stripeCheckoutSessionId: checkoutSessionId,
        stripePaymentIntentId: paymentIntentId,
      });
    }
  }

  if (!paymentSettled) {
    return;
  }

  const refreshedPayments = await resolveCheckoutSessionPayments(admin, {
    checkoutSessionId,
    metadata,
  });

  for (const payment of refreshedPayments) {
    if (!payment.tuitionChargeId) continue;

    await settleTuitionPayment(admin, {
      chargeId: payment.tuitionChargeId,
      amountCents: payment.amountCents,
      payerUserId: payment.payerUserId,
      paymentId: payment.id,
    });
    void sendPaymentCompletedNotifications(admin, payment.id);
  }

  const firstPayment = refreshedPayments[0];
  if (firstPayment?.familyId && paymentIntentId) {
    try {
      await trySaveTuitionPaymentMethod(admin, {
        familyId: firstPayment.familyId,
        organizationId: String(metadata.organization_id),
        paymentIntentId,
        payerUserId: firstPayment.payerUserId,
      });
    } catch (error) {
      console.warn(
        "checkout.session.completed: combined tuition payment method save failed",
        checkoutSessionId,
        error,
      );
    }
  }

  if (!newlySucceededAny) {
    return;
  }

  void logActivityEvent(admin, {
    organizationId: metadata.organization_id as string,
    actorType: "system",
    surface: "system",
    action: ACTIVITY_ACTIONS.APPLICATION_PAYMENT_COMPLETED,
    entityType: "tuition_charge",
    entityId: tuitionChargeIds[0] ?? checkoutSessionId,
    summary: "Combined tuition payment completed",
    metadata: {
      checkoutSessionId,
      paymentIds: refreshedPayments.map((payment) => payment.id),
      tuitionChargeIds,
      familyId: firstPayment?.familyId ?? null,
    },
  });
}

async function handleTuitionCheckoutCompleted(
  admin: SupabaseClient,
  input: {
    session: Stripe.Checkout.Session;
    checkoutSessionId: string;
    paymentIntentId: string | undefined;
    metadata: Stripe.Metadata;
  },
): Promise<void> {
  const { session, checkoutSessionId, paymentIntentId, metadata } = input;
  const paymentId =
    typeof metadata.payment_id === "string" ? metadata.payment_id : null;
  let payment = paymentId ? await getPaymentById(admin, paymentId) : null;

  if (!payment) {
    payment = await getApplicationPaymentByCheckoutSession(admin, checkoutSessionId);
  }

  const paymentSettled = session.payment_status === "paid";
  let newlySucceeded = false;

  if (payment && payment.status === "pending") {
    if (paymentSettled) {
      const result = await tryMarkPaymentSucceeded(admin, payment, {
        paymentIntentId,
        checkoutSessionId,
      });
      payment = result.payment;
      newlySucceeded = result.newlySucceeded;
    } else {
      await attachStripeCheckoutToPayment(admin, payment.id, {
        stripeCheckoutSessionId: checkoutSessionId,
        stripePaymentIntentId: paymentIntentId,
      });
    }
  }

  const chargeId =
    typeof metadata.tuition_charge_id === "string"
      ? metadata.tuition_charge_id
      : payment?.tuitionChargeId;

  if (paymentSettled && chargeId && payment) {
    await settleTuitionPayment(admin, {
      chargeId,
      amountCents: payment.amountCents,
      payerUserId: payment.payerUserId,
      paymentId: payment.id,
    });
  }

  if (paymentSettled && payment?.familyId && paymentIntentId) {
    try {
      await trySaveTuitionPaymentMethod(admin, {
        familyId: payment.familyId,
        organizationId: String(metadata.organization_id),
        paymentIntentId,
        payerUserId: payment.payerUserId,
      });
    } catch (error) {
      console.warn(
        "checkout.session.completed: tuition payment method save failed",
        payment.id,
        error,
      );
    }
  }

  if (!paymentSettled || !newlySucceeded) {
    return;
  }

  const charge =
    chargeId != null ? await getChargeById(admin, chargeId) : null;

  void logActivityEvent(admin, {
    organizationId: metadata.organization_id as string,
    actorType: "system",
    surface: "system",
    action: ACTIVITY_ACTIONS.APPLICATION_PAYMENT_COMPLETED,
    entityType: "tuition_charge",
    entityId: chargeId ?? payment?.id ?? checkoutSessionId,
    summary: "Tuition payment completed",
    metadata: {
      checkoutSessionId,
      paymentId: payment?.id ?? paymentId ?? null,
      tuitionChargeId: chargeId ?? null,
      familyId: payment?.familyId ?? charge?.familyId ?? null,
      amountCents: payment?.amountCents ?? null,
      chargeLabel: charge?.label ?? payment?.label ?? null,
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

  let newlySucceeded = false;
  if (payment) {
    const result = await tryMarkPaymentSucceeded(admin, payment, {
      paymentIntentId,
      checkoutSessionId,
    });
    payment = result.payment;
    newlySucceeded = result.newlySucceeded;
    if (newlySucceeded) {
      void sendPaymentCompletedNotifications(admin, payment.id);
    }
  }

  if (!payment) {
    console.warn("checkout.session.completed: payment not found", checkoutSessionId);
    return;
  }

  await processApplicationFeePayment(
    admin,
    payment,
    checkoutSessionId,
    newlySucceeded,
  );
}

async function processApplicationFeePayment(
  admin: SupabaseClient,
  payment: PaymentRecord,
  checkoutSessionId: string,
  newlySucceeded: boolean,
): Promise<void> {
  if (!payment.applicationId) {
    console.warn("checkout.session.completed: application payment missing application id");
    return;
  }

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

    if (!newlySucceeded) {
      return;
    }

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

  if (!newlySucceeded) {
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
    await notifyPaymentsReadyIfNeeded(admin, {
      organizationId: String(existing.organization_id),
      stripeConnectAccountId: account.id,
      chargesEnabled: chargesNowEnabled,
      payoutsEnabled: Boolean(account.payouts_enabled),
    });
  }
}
