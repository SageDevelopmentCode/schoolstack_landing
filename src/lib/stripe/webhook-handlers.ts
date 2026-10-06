import type { SupabaseClient } from "@supabase/supabase-js";
import { runAfterResponse } from "@/lib/next/run-after-response";
import type Stripe from "stripe";
import { activityClientMetadataFromStripeMetadata } from "@/lib/activity-client";
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
import { fireEnrollmentCompletedNotificationsIfNeeded } from "@/lib/admissions/fire-enrollment-completed-notifications";
import {
  sendCombinedTuitionPaymentReceiptNotifications,
} from "@/lib/tuition/payment-receipt-notifications";
import { sendCombinedPaymentReceivedAdminNotifications } from "@/lib/notifications/payment-admin-notifications";
import {
  savePaymentMethodFromSetupIntent,
  trySaveTuitionPaymentMethod,
} from "@/lib/tuition/autopay";
import { revertTuitionPaymentAfterAchSettlementFailure } from "@/lib/tuition/payment-settlement";
import {
  logTuitionActivity,
  parentActivityContext,
  summarizePaymentMethodSaved,
} from "@/lib/tuition/tuition-activity";
import {
  attachCheckoutSessionToPayment,
  attachStripeCheckoutToPayment,
  getApplicationPaymentByCheckoutSession,
  getPaymentById,
  listPaymentsByCheckoutSession,
  markPaymentFailed,
  markPaymentSucceeded,
  syncPaymentCheckoutDetailsFromMetadata,
  updateStripeProviderStatus,
  type PaymentRecord,
} from "@/lib/stripe/application-payments";
import {
  getAchVerificationAction,
} from "@/lib/stripe/payment-intent-bank-verification";
import { recordTuitionPaymentCompleted } from "@/lib/stripe/record-payment-completed";
import {
  backfillStripeCustomerId,
  resolveCheckoutSessionCustomerId,
  resolveCheckoutSessionSupabaseUserId,
} from "@/lib/stripe/customer";
import { notifyPaymentsReadyIfNeeded } from "@/lib/stripe/connect-notifications";
import { syncPaymentAccountFromStripe } from "@/lib/stripe/organization-payment-account";
import {
  sendAchBankVerificationNotificationsForPayments,
  sendDeferredAdmissionsReceiptsIfAchSettled,
  sendDeferredTuitionReceiptsForInFlightAchPayments,
  sendDeferredTuitionReceiptsIfAchSettled,
  sendTuitionAchSettlementFailedNotifications,
} from "@/lib/stripe/ach-bank-verification-notifications";
import { resolveAchCheckoutFollowUp } from "@/lib/stripe/checkout-ach-followup";

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

  const markResult = await markPaymentSucceeded(admin, payment.id, {
    stripePaymentIntentId: stripeRefs.paymentIntentId,
    stripeCheckoutSessionId: stripeRefs.checkoutSessionId,
  });

  if (!markResult.payment) {
    return { payment, newlySucceeded: false };
  }

  return {
    payment: markResult.payment,
    newlySucceeded: markResult.transitioned,
  };
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
      session,
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
    if (payment.status === "succeeded") {
      if (payment.paymentType === "tuition") {
        const revertResult = await revertTuitionPaymentAfterAchSettlementFailure(
          admin,
          payment,
          {
            stripePaymentIntentId: paymentIntentId,
            stripeCheckoutSessionId: checkoutSessionId,
          },
        );
        if (!revertResult.alreadyHandled && organizationId) {
          void logActivityEvent(admin, {
            organizationId,
            actorType: "system",
            surface: "system",
            action: ACTIVITY_ACTIONS.APPLICATION_PAYMENT_FAILED,
            entityType: "tuition_charge",
            entityId: payment.tuitionChargeId ?? payment.id,
            summary: "ACH settlement failed after payment was recorded",
            metadata: {
              checkoutSessionId,
              paymentId: payment.id,
              applicationId: payment.applicationId,
              paymentType: payment.paymentType,
              tuitionChargeId: payment.tuitionChargeId,
              settlementFailure: true,
              chargeReopened: revertResult.chargeReopened,
            },
            severity: "warning",
          });
          void sendTuitionAchSettlementFailedNotifications(admin, {
            payment: revertResult.payment,
            settlementFailure: true,
            chargeReopened: revertResult.chargeReopened,
          });
        }
        continue;
      }

      // Admissions (enrollment checklist, application fee): optimistic record is not
      // auto-reverted here — ops uses activity_events and manual correction if needed.
      await updateStripeProviderStatus(admin, payment.id, "failed");
      if (organizationId) {
        const entityType =
          payment.enrollmentChecklistItemId
            ? "enrollment_checklist_item"
            : payment.applicationId
              ? "application"
              : "application_payment";
        const entityId =
          payment.enrollmentChecklistItemId ??
          payment.applicationId ??
          payment.id;

        void logActivityEvent(admin, {
          organizationId,
          actorType: "system",
          surface: "system",
          action: ACTIVITY_ACTIONS.APPLICATION_PAYMENT_FAILED,
          entityType,
          entityId,
          summary: "ACH settlement failed after payment was recorded",
          metadata: {
            checkoutSessionId,
            paymentId: payment.id,
            applicationId: payment.applicationId,
            paymentType: payment.paymentType,
            tuitionChargeId: payment.tuitionChargeId,
            settlementFailure: true,
          },
          severity: "warning",
        });
      }
      continue;
    }

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
      if (payment.paymentType === "tuition") {
        void sendTuitionAchSettlementFailedNotifications(admin, {
          payment: updatedPayment,
          settlementFailure: false,
        });
      }
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
    session: Stripe.Checkout.Session;
    checkoutSessionId: string;
    paymentIntentId: string | undefined;
    metadata: Stripe.Metadata;
  },
): Promise<void> {
  const { session, checkoutSessionId, paymentIntentId, metadata } = input;
  const organizationId = metadata.organization_id as string;
  const checklistItemIds = parseCsvMetadata(metadata.checklist_item_ids);
  const paymentIds = parseCsvMetadata(metadata.payment_ids);
  const achFollowUp = await resolveAchCheckoutFollowUp(session, paymentIntentId);

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
      await updateStripeProviderStatus(
        admin,
        updatedPayment.id,
        achFollowUp.stripeProviderStatus,
      );
      if (!achFollowUp.verificationAction) {
        void sendPaymentCompletedNotifications(admin, updatedPayment.id);
      }
    }
  }

  const instanceIds =
    checklistItemIds.length > 0
      ? checklistItemIds
      : payments
          .map((payment) => payment.enrollmentChecklistItemId)
          .filter((instanceId): instanceId is string => Boolean(instanceId));

  for (const instanceId of instanceIds) {
    const newlyCompletedEnrollment = await completeChecklistPaymentFromWebhook(admin, {
      instanceId,
      organizationId,
      checkoutSessionId,
      paymentIntentId,
    });
    fireEnrollmentCompletedNotificationsIfNeeded(admin, newlyCompletedEnrollment);
  }

  if (!newlySucceededAny) {
    const refreshedPayments = await resolveCheckoutSessionPayments(admin, {
      checkoutSessionId,
      metadata,
    });
    await sendDeferredAdmissionsReceiptsIfAchSettled(admin, {
      sessionPaymentStatus: session.payment_status,
      payments: refreshedPayments,
    });
    if (session.payment_status === "paid") {
      for (const payment of refreshedPayments) {
        await updateStripeProviderStatus(admin, payment.id, "succeeded");
      }
    }
    return;
  }

  if (achFollowUp.verificationAction && payments.length > 0) {
    await sendAchBankVerificationNotificationsForPayments(admin, {
      organizationId,
      checkoutSessionId,
      payments,
      verificationAction: achFollowUp.verificationAction,
    });
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
  const { session, checkoutSessionId, paymentIntentId, metadata } = input;
  const achFollowUp = await resolveAchCheckoutFollowUp(session, paymentIntentId);
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
      await updateStripeProviderStatus(
        admin,
        payment.id,
        achFollowUp.stripeProviderStatus,
      );
      if (achFollowUp.verificationAction) {
        await sendAchBankVerificationNotificationsForPayments(admin, {
          organizationId: String(metadata.organization_id),
          checkoutSessionId,
          payments: [payment],
          verificationAction: achFollowUp.verificationAction,
        });
      } else {
        void sendPaymentCompletedNotifications(admin, payment.id);
      }
    }
  }

  const newlyCompletedEnrollment = await completeChecklistPaymentFromWebhook(admin, {
    instanceId: metadata.checklist_item_id as string,
    organizationId: metadata.organization_id as string,
    checkoutSessionId,
    paymentIntentId,
  });
  fireEnrollmentCompletedNotificationsIfNeeded(admin, newlyCompletedEnrollment);

  if (!newlySucceeded) {
    if (payment) {
      const refreshed = (await getPaymentById(admin, payment.id)) ?? payment;
      await sendDeferredAdmissionsReceiptsIfAchSettled(admin, {
        sessionPaymentStatus: session.payment_status,
        payments: [refreshed],
      });
      if (session.payment_status === "paid") {
        await updateStripeProviderStatus(admin, refreshed.id, "succeeded");
      }
    }
    return;
  }

  await logActivityEvent(admin, {
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

  const displayFields = await savePaymentMethodFromSetupIntent(admin, {
    organizationId,
    familyId,
    setupIntentId,
    payerUserId,
    guardianId,
  });

  if (!displayFields) return;

  const { data: family } = await admin
    .from("families")
    .select("name")
    .eq("id", familyId)
    .maybeSingle();

  const familyName =
    typeof family?.name === "string" ? family.name : undefined;
  const changeSummary = summarizePaymentMethodSaved({
    familyName,
    last4: displayFields.last4,
    brand: displayFields.brand,
  });

  void logTuitionActivity(admin, {
    organizationId,
    action: ACTIVITY_ACTIONS.TUITION_PAYMENT_METHOD_SAVED,
    entityType: "family",
    entityId: familyId,
    summary: "Payment method saved for tuition autopay",
    changeSummary,
    logWhenEmpty: true,
    metadata: {
      familyId,
      familyName: familyName ?? null,
      guardianId,
      ...(activityClientMetadataFromStripeMetadata(metadata) ?? {}),
    },
    context: parentActivityContext({
      id: payerUserId ?? "",
      email: null,
    }),
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
  const achFollowUp = await resolveAchCheckoutFollowUp(session, paymentIntentId);
  const tuitionChargeIds = parseCsvMetadata(metadata.tuition_charge_ids);
  const payments = await resolveCheckoutSessionPayments(admin, {
    checkoutSessionId,
    metadata,
  });

  let newlyRecordedAny = false;
  for (const payment of payments) {
    if (payment.status === "succeeded") continue;

    const { newlyRecorded } = await recordTuitionPaymentCompleted(admin, {
      payment,
      organizationId: String(metadata.organization_id),
      checkoutSessionId,
      paymentIntentId,
      stripeProviderStatus: achFollowUp.stripeProviderStatus,
      skipReceipt: true,
      skipActivity: true,
    });
    if (newlyRecorded) {
      newlyRecordedAny = true;
    }
  }

  const refreshedPayments = await resolveCheckoutSessionPayments(admin, {
    checkoutSessionId,
    metadata,
  });

  if (newlyRecordedAny && refreshedPayments.length > 0) {
    if (achFollowUp.verificationAction) {
      await sendAchBankVerificationNotificationsForPayments(admin, {
        organizationId: String(metadata.organization_id),
        checkoutSessionId,
        payments: refreshedPayments,
        verificationAction: achFollowUp.verificationAction,
      });
    } else {
      void sendCombinedTuitionPaymentReceiptNotifications(admin, {
        checkoutSessionId,
        paymentIds: refreshedPayments.map((payment) => payment.id),
      });
      void sendCombinedPaymentReceivedAdminNotifications(admin, {
        paymentIds: refreshedPayments.map((payment) => payment.id),
      });
    }
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

  if (!newlyRecordedAny) {
    await sendDeferredTuitionReceiptsIfAchSettled(admin, {
      sessionPaymentStatus: session.payment_status,
      payments: refreshedPayments,
    });
    if (session.payment_status === "paid") {
      for (const payment of refreshedPayments) {
        await updateStripeProviderStatus(admin, payment.id, "succeeded");
      }
    }
    return;
  }

  if (achFollowUp.verificationAction) {
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

  if (payment) {
    await syncPaymentCheckoutDetailsFromMetadata(admin, payment.id, metadata, {
      paymentMethodType: payment.paymentMethodType,
      chargedAmountCents: payment.chargedAmountCents,
      processingFeeCents: payment.processingFeeCents,
    });
    payment = (await getPaymentById(admin, payment.id)) ?? payment;
  }

  if (!payment) {
    return;
  }

  const chargeId =
    typeof metadata.tuition_charge_id === "string"
      ? metadata.tuition_charge_id
      : payment.tuitionChargeId;

  const activityMetadata =
    activityClientMetadataFromStripeMetadata(metadata) ?? undefined;

  const achFollowUp = await resolveAchCheckoutFollowUp(session, paymentIntentId);

  const { newlyRecorded } = await recordTuitionPaymentCompleted(admin, {
    payment,
    organizationId: String(metadata.organization_id),
    tuitionChargeId: chargeId,
    checkoutSessionId,
    paymentIntentId,
    stripeProviderStatus: achFollowUp.stripeProviderStatus,
    skipReceipt: achFollowUp.skipImmediateReceipt,
    skipActivity: achFollowUp.skipImmediateReceipt,
    activityMetadata,
  });

  if (paymentIntentId && payment.familyId) {
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

  if (!newlyRecorded) {
    const refreshed = (await getPaymentById(admin, payment.id)) ?? payment;
    await sendDeferredTuitionReceiptsIfAchSettled(admin, {
      sessionPaymentStatus: session.payment_status,
      payments: [refreshed],
    });
    if (session.payment_status === "paid") {
      await updateStripeProviderStatus(admin, refreshed.id, "succeeded");
    }
    return;
  }

  if (achFollowUp.verificationAction) {
    await sendAchBankVerificationNotificationsForPayments(admin, {
      organizationId: String(metadata.organization_id),
      checkoutSessionId,
      payments: [payment],
      verificationAction: achFollowUp.verificationAction,
    });
  }
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
  const { session, checkoutSessionId, paymentIntentId, metadata } = input;
  const achFollowUp = await resolveAchCheckoutFollowUp(session, paymentIntentId);

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
      await updateStripeProviderStatus(
        admin,
        payment.id,
        achFollowUp.stripeProviderStatus,
      );
      if (achFollowUp.verificationAction) {
        await sendAchBankVerificationNotificationsForPayments(admin, {
          organizationId: payment.organizationId,
          checkoutSessionId,
          payments: [payment],
          verificationAction: achFollowUp.verificationAction,
        });
      } else {
        void sendPaymentCompletedNotifications(admin, payment.id);
      }
    }
  }

  if (!payment) {
    console.warn("checkout.session.completed: payment not found", checkoutSessionId);
    return;
  }

  if (!newlySucceeded) {
    const refreshed = (await getPaymentById(admin, payment.id)) ?? payment;
    await sendDeferredAdmissionsReceiptsIfAchSettled(admin, {
      sessionPaymentStatus: session.payment_status,
      payments: [refreshed],
    });
    if (session.payment_status === "paid") {
      await updateStripeProviderStatus(admin, refreshed.id, "succeeded");
    }
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

  runAfterResponse(async () => {
    await sendApplicationSubmittedNotifications(admin, application.id);
  });

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

async function resolveTuitionPaymentFromPaymentIntent(
  admin: SupabaseClient,
  paymentIntent: Stripe.PaymentIntent,
): Promise<PaymentRecord | null> {
  if (paymentIntent.metadata?.payment_type !== "tuition") {
    return null;
  }

  const paymentId =
    typeof paymentIntent.metadata?.payment_id === "string"
      ? paymentIntent.metadata.payment_id
      : null;
  if (!paymentId) return null;

  const payment = await getPaymentById(admin, paymentId);
  if (!payment || payment.paymentType !== "tuition") return null;
  return payment;
}

async function logTuitionPaymentIntentFailedActivity(
  admin: SupabaseClient,
  input: {
    organizationId: string;
    payment: PaymentRecord;
    paymentIntentId: string;
    settlementFailure: boolean;
  },
): Promise<void> {
  void logActivityEvent(admin, {
    organizationId: input.organizationId,
    actorType: "system",
    surface: "system",
    action: ACTIVITY_ACTIONS.APPLICATION_PAYMENT_FAILED,
    entityType: "tuition_charge",
    entityId: input.payment.tuitionChargeId ?? input.payment.id,
    summary: input.settlementFailure
      ? "ACH settlement failed after payment was recorded"
      : "Payment failed (ACH)",
    metadata: {
      paymentId: input.payment.id,
      paymentType: input.payment.paymentType,
      tuitionChargeId: input.payment.tuitionChargeId,
      paymentIntentId: input.paymentIntentId,
      settlementFailure: input.settlementFailure,
    },
    severity: input.settlementFailure ? "warning" : undefined,
  });
}

export async function handlePaymentIntentSucceeded(
  admin: SupabaseClient,
  paymentIntent: Stripe.PaymentIntent,
): Promise<void> {
  const payment = await resolveTuitionPaymentFromPaymentIntent(admin, paymentIntent);
  if (!payment) return;

  const organizationId =
    typeof paymentIntent.metadata?.organization_id === "string"
      ? paymentIntent.metadata.organization_id
      : payment.organizationId;
  const priorProviderStatus = payment.stripeProviderStatus;
  const providerStatus =
    paymentIntent.status === "succeeded" ? "succeeded" : paymentIntent.status;

  if (payment.status === "pending") {
    await recordTuitionPaymentCompleted(admin, {
      payment,
      organizationId,
      tuitionChargeId: payment.tuitionChargeId,
      paymentIntentId: paymentIntent.id,
      stripeProviderStatus: providerStatus,
    });
    const refreshed =
      (await getPaymentById(admin, payment.id)) ?? payment;
    await sendDeferredTuitionReceiptsForInFlightAchPayments(admin, [refreshed]);
    return;
  }

  if (payment.status !== "succeeded") return;

  if (
    priorProviderStatus === "requires_action" ||
    priorProviderStatus === "processing"
  ) {
    await sendDeferredTuitionReceiptsForInFlightAchPayments(admin, [payment]);
  }

  if (priorProviderStatus !== providerStatus) {
    await updateStripeProviderStatus(admin, payment.id, providerStatus);
  }
}

export async function handlePaymentIntentPaymentFailed(
  admin: SupabaseClient,
  paymentIntent: Stripe.PaymentIntent,
): Promise<void> {
  await handleTuitionPaymentIntentTerminalFailure(admin, paymentIntent);
}

export async function handlePaymentIntentCanceled(
  admin: SupabaseClient,
  paymentIntent: Stripe.PaymentIntent,
): Promise<void> {
  await handleTuitionPaymentIntentTerminalFailure(admin, paymentIntent);
}

async function handleTuitionPaymentIntentTerminalFailure(
  admin: SupabaseClient,
  paymentIntent: Stripe.PaymentIntent,
): Promise<void> {
  const payment = await resolveTuitionPaymentFromPaymentIntent(admin, paymentIntent);
  if (!payment) return;

  const organizationId =
    typeof paymentIntent.metadata?.organization_id === "string"
      ? paymentIntent.metadata.organization_id
      : payment.organizationId;

  if (payment.status === "succeeded") {
    const revertResult = await revertTuitionPaymentAfterAchSettlementFailure(
      admin,
      payment,
      { stripePaymentIntentId: paymentIntent.id },
    );
    if (!revertResult.alreadyHandled) {
      await logTuitionPaymentIntentFailedActivity(admin, {
        organizationId,
        payment: revertResult.payment,
        paymentIntentId: paymentIntent.id,
        settlementFailure: true,
      });
      void sendTuitionAchSettlementFailedNotifications(admin, {
        payment: revertResult.payment,
        settlementFailure: true,
        chargeReopened: revertResult.chargeReopened,
      });
    }
    return;
  }

  if (payment.status !== "pending") return;

  const updatedPayment = await markPaymentFailed(admin, payment.id, {
    stripePaymentIntentId: paymentIntent.id,
  });
  if (!updatedPayment || updatedPayment.status !== "failed") return;

  await logTuitionPaymentIntentFailedActivity(admin, {
    organizationId,
    payment: updatedPayment,
    paymentIntentId: paymentIntent.id,
    settlementFailure: false,
  });
  void sendTuitionAchSettlementFailedNotifications(admin, {
    payment: updatedPayment,
    settlementFailure: false,
  });
}

export async function handlePaymentIntentRequiresAction(
  admin: SupabaseClient,
  paymentIntent: Stripe.PaymentIntent,
): Promise<void> {
  const verificationAction = getAchVerificationAction(paymentIntent);
  if (!verificationAction) return;

  const paymentId =
    typeof paymentIntent.metadata?.payment_id === "string"
      ? paymentIntent.metadata.payment_id
      : null;
  const organizationId =
    typeof paymentIntent.metadata?.organization_id === "string"
      ? paymentIntent.metadata.organization_id
      : null;

  if (!paymentId || !organizationId) return;

  const payment = await getPaymentById(admin, paymentId);
  if (!payment) return;
  if (payment.stripeProviderStatus === "requires_action") return;

  if (payment.status === "pending" && !payment.stripeCheckoutSessionId) {
    if (!payment.stripePaymentIntentId) {
      await attachStripeCheckoutToPayment(admin, payment.id, {
        stripePaymentIntentId: paymentIntent.id,
      });
    }
    await updateStripeProviderStatus(admin, payment.id, "requires_action");
    await sendAchBankVerificationNotificationsForPayments(admin, {
      organizationId,
      checkoutSessionId: `autopay-${payment.id}`,
      payments: [payment],
      verificationAction,
    });
    return;
  }

  if (payment.status !== "succeeded") return;

  await updateStripeProviderStatus(admin, payment.id, "requires_action");

  const checkoutSessionId = payment.stripeCheckoutSessionId;
  if (!checkoutSessionId) return;

  await sendAchBankVerificationNotificationsForPayments(admin, {
    organizationId,
    checkoutSessionId,
    payments: [payment],
    verificationAction,
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
