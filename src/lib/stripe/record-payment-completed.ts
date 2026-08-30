import type { SupabaseClient } from "@supabase/supabase-js";
import { ACTIVITY_ACTIONS, logActivityEvent } from "@/lib/activity-log";
import { getChargeById } from "@/lib/tuition/charges";
import { sendTuitionPaymentReceiptNotifications } from "@/lib/tuition/payment-receipt-notifications";
import { sendPaymentReceivedAdminNotifications } from "@/lib/notifications/payment-admin-notifications";
import {
  settleTuitionPayment,
  type SettleTuitionPaymentResult,
} from "@/lib/tuition/payment-settlement";
import {
  logTuitionActivity,
  summarizePaymentAction,
} from "@/lib/tuition/tuition-activity";
import {
  markPaymentSucceeded,
  updateStripeProviderStatus,
  type PaymentRecord,
} from "@/lib/stripe/application-payments";

export type RecordTuitionPaymentCompletedInput = {
  payment: PaymentRecord;
  organizationId: string;
  tuitionChargeId?: string | null;
  checkoutSessionId?: string;
  paymentIntentId?: string;
  stripeProviderStatus?: string | null;
  skipReceipt?: boolean;
  skipActivity?: boolean;
};

export type RecordTuitionPaymentCompletedResult = {
  payment: PaymentRecord;
  newlyRecorded: boolean;
  settleResult?: SettleTuitionPaymentResult;
};

export async function recordTuitionPaymentCompleted(
  admin: SupabaseClient,
  input: RecordTuitionPaymentCompletedInput,
): Promise<RecordTuitionPaymentCompletedResult> {
  const {
    organizationId,
    checkoutSessionId,
    paymentIntentId,
    stripeProviderStatus,
    skipReceipt = false,
    skipActivity = false,
  } = input;

  let payment = input.payment;
  const chargeId = input.tuitionChargeId ?? payment.tuitionChargeId;
  const alreadySucceeded = payment.status === "succeeded";

  if (stripeProviderStatus) {
    await updateStripeProviderStatus(admin, payment.id, stripeProviderStatus);
  }

  if (alreadySucceeded) {
    return { payment, newlyRecorded: false };
  }

  const updated = await markPaymentSucceeded(admin, payment.id, {
    stripePaymentIntentId: paymentIntentId,
    stripeCheckoutSessionId: checkoutSessionId,
  });

  if (!updated || updated.status !== "succeeded") {
    return { payment: updated ?? payment, newlyRecorded: false };
  }

  payment = updated;

  if (stripeProviderStatus) {
    await updateStripeProviderStatus(admin, payment.id, stripeProviderStatus);
  }

  let settleResult: SettleTuitionPaymentResult | undefined;
  if (chargeId) {
    settleResult = await settleTuitionPayment(admin, {
      chargeId,
      amountCents: payment.amountCents,
      payerUserId: payment.payerUserId,
      paymentId: payment.id,
    });
  }

  if (!skipReceipt) {
    void sendTuitionPaymentReceiptNotifications(admin, payment.id, {
      settleResult,
    });
    void sendPaymentReceivedAdminNotifications(admin, payment.id);
  }

  if (!skipActivity) {
    const charge = chargeId ? await getChargeById(admin, chargeId) : null;
    void logTuitionPaymentCompletedActivities(admin, {
      organizationId,
      checkoutSessionId,
      payment,
      chargeId,
      charge,
    });
  }

  return { payment, newlyRecorded: true, settleResult };
}

export async function logTuitionPaymentCompletedActivities(
  admin: SupabaseClient,
  input: {
    organizationId: string;
    checkoutSessionId?: string;
    payment: PaymentRecord;
    chargeId?: string | null;
    charge?: Awaited<ReturnType<typeof getChargeById>>;
  },
): Promise<void> {
  const { organizationId, checkoutSessionId, payment } = input;
  const chargeId = input.chargeId ?? payment.tuitionChargeId;
  const charge =
    input.charge ??
    (chargeId != null ? await getChargeById(admin, chargeId) : null);

  void logActivityEvent(admin, {
    organizationId,
    actorType: "system",
    surface: "system",
    action: ACTIVITY_ACTIONS.APPLICATION_PAYMENT_COMPLETED,
    entityType: "tuition_charge",
    entityId: chargeId ?? payment.id ?? checkoutSessionId ?? payment.id,
    summary: "Tuition payment completed",
    metadata: {
      checkoutSessionId: checkoutSessionId ?? null,
      paymentId: payment.id,
      tuitionChargeId: chargeId ?? null,
      familyId: payment.familyId ?? charge?.familyId ?? null,
      amountCents: payment.amountCents ?? null,
      chargeLabel: charge?.label ?? payment.label ?? null,
    },
  });

  void logTuitionActivity(admin, {
    organizationId,
    action: ACTIVITY_ACTIONS.TUITION_PAYMENT_COMPLETED,
    entityType: "tuition_charge",
    entityId: chargeId ?? payment.id,
    summary: "Tuition payment completed",
    changeSummary: summarizePaymentAction({
      kind: "completed",
      amountCents: payment.amountCents ?? charge?.amountCents ?? 0,
      chargeLabel: charge?.label ?? payment.label ?? "Tuition charge",
    }),
    logWhenEmpty: true,
    metadata: {
      checkoutSessionId: checkoutSessionId ?? null,
      paymentId: payment.id,
      familyId: payment.familyId ?? charge?.familyId ?? null,
    },
    context: { actorType: "parent", surface: "parent_portal" },
  });
}
