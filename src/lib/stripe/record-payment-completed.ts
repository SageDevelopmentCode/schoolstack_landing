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
import { getStripeClient } from "@/lib/stripe/client";
import { expirePendingCheckoutSessionsForCharge } from "@/lib/tuition/expire-charge-checkout-sessions";
import type { TuitionActivityContext } from "@/lib/tuition/tuition-activity";

function formatPersonName(
  firstName?: string | null,
  lastName?: string | null,
): string | null {
  const name = [firstName?.trim(), lastName?.trim()].filter(Boolean).join(" ");
  return name || null;
}

async function loadTuitionPaymentActivityLabels(
  admin: SupabaseClient,
  payment: PaymentRecord,
  familyId: string | null,
): Promise<{
  familyName: string | null;
  payerLabel: string | null;
  activityContext: TuitionActivityContext;
}> {
  let familyName: string | null = null;
  let payerLabel: string | null = null;
  let actorEmail: string | null = null;
  let actorName: string | null = null;

  if (familyId) {
    const { data: family, error: familyError } = await admin
      .from("families")
      .select("name")
      .eq("id", familyId)
      .maybeSingle();
    if (familyError) throw familyError;
    familyName = family?.name?.trim() ?? null;
  }

  if (payment.payerUserId && familyId) {
    const { data: guardian, error: guardianError } = await admin
      .from("guardians")
      .select("first_name, last_name, email")
      .eq("family_id", familyId)
      .eq("user_id", payment.payerUserId)
      .maybeSingle();
    if (guardianError) throw guardianError;
    payerLabel = formatPersonName(guardian?.first_name, guardian?.last_name);
    actorName = payerLabel;
    actorEmail = guardian?.email?.trim() ?? null;
  }

  if (!actorEmail && payment.payerUserId) {
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("email")
      .eq("id", payment.payerUserId)
      .maybeSingle();
    if (profileError) throw profileError;
    actorEmail = profile?.email?.trim() ?? null;
  }

  if (!payerLabel && familyName) {
    payerLabel = familyName;
  }

  return {
    familyName,
    payerLabel,
    activityContext: {
      actorType: "parent",
      actorUserId: payment.payerUserId,
      actorEmail,
      actorName,
      surface: "parent_portal",
    },
  };
}

export type RecordTuitionPaymentCompletedInput = {
  payment: PaymentRecord;
  organizationId: string;
  tuitionChargeId?: string | null;
  checkoutSessionId?: string;
  paymentIntentId?: string;
  stripeProviderStatus?: string | null;
  skipReceipt?: boolean;
  skipActivity?: boolean;
  activityMetadata?: Record<string, unknown>;
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

  const markResult = await markPaymentSucceeded(admin, payment.id, {
    stripePaymentIntentId: paymentIntentId,
    stripeCheckoutSessionId: checkoutSessionId,
  });

  if (!markResult.payment || !markResult.transitioned) {
    return { payment: markResult.payment ?? payment, newlyRecorded: false };
  }

  payment = markResult.payment;

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
      activityMetadata: input.activityMetadata,
    });
  }

  if (chargeId) {
    try {
      const stripe = getStripeClient();
      await expirePendingCheckoutSessionsForCharge(admin, stripe, chargeId);
    } catch (error) {
      console.warn(
        "recordTuitionPaymentCompleted: expire pending checkout sessions failed",
        chargeId,
        error,
      );
    }
  }

  return { payment, newlyRecorded: true, settleResult };
}

export async function tuitionPaymentCompletedActivityExists(
  admin: SupabaseClient,
  organizationId: string,
  paymentId: string,
): Promise<boolean> {
  const { data, error } = await admin
    .from("activity_events")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("action", ACTIVITY_ACTIONS.TUITION_PAYMENT_COMPLETED)
    .filter("metadata->>paymentId", "eq", paymentId)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data?.id);
}

export async function logTuitionPaymentCompletedActivities(
  admin: SupabaseClient,
  input: {
    organizationId: string;
    checkoutSessionId?: string;
    payment: PaymentRecord;
    chargeId?: string | null;
    charge?: Awaited<ReturnType<typeof getChargeById>>;
    activityMetadata?: Record<string, unknown>;
  },
): Promise<void> {
  const { organizationId, checkoutSessionId, payment } = input;
  const chargeId = input.chargeId ?? payment.tuitionChargeId;
  const charge =
    input.charge ??
    (chargeId != null ? await getChargeById(admin, chargeId) : null);

  const familyId = payment.familyId ?? charge?.familyId ?? null;
  const { familyName, payerLabel, activityContext } =
    await loadTuitionPaymentActivityLabels(admin, payment, familyId);

  const amountCents = payment.amountCents ?? charge?.amountCents ?? 0;
  const chargeLabel = charge?.label ?? payment.label ?? "Tuition charge";
  const changeSummary = summarizePaymentAction({
    kind: "completed",
    amountCents,
    chargeLabel,
    familyName: familyName ?? undefined,
  });

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
      familyId,
      amountCents: payment.amountCents ?? null,
      chargeLabel,
      familyName,
      payerLabel,
      guardianName: payerLabel,
      ...(input.activityMetadata ?? {}),
    },
  });

  void logTuitionActivity(admin, {
    organizationId,
    action: ACTIVITY_ACTIONS.TUITION_PAYMENT_COMPLETED,
    entityType: "tuition_charge",
    entityId: chargeId ?? payment.id,
    summary: changeSummary.changes[0] ?? "Tuition payment completed",
    changeSummary,
    logWhenEmpty: true,
    metadata: {
      checkoutSessionId: checkoutSessionId ?? null,
      paymentId: payment.id,
      tuitionChargeId: chargeId ?? null,
      familyId,
      familyName,
      payerLabel,
      guardianName: payerLabel,
      amountCents,
      chargeLabel,
      ...(input.activityMetadata ?? {}),
    },
    context: activityContext,
  });
}
