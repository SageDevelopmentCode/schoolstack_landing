import type { SupabaseClient } from "@supabase/supabase-js";
import {
  type ApplicantContact,
  resolveApplicantContact,
} from "@/lib/admissions/application-notifications";
import { PAYMENT_METHOD_LABELS } from "@/lib/admissions/payment-records";
import { logNotificationFailure, logSettledNotificationFailures } from "@/lib/admissions/notification-logging";
import { notifyPaymentCompleted } from "@/lib/discord";
import { sendPaymentReceiptConfirmation } from "@/lib/emails";
import { getPaymentById } from "@/lib/stripe/application-payments";
import { SITE_URL } from "@/lib/site";

async function resolvePayerContact(
  admin: SupabaseClient,
  input: {
    payerUserId: string | null;
    application: {
      family_id: string | null;
      created_by_user_id: string | null;
      primary_guardian_id: string | null;
    };
  },
): Promise<ApplicantContact | null> {
  const contact = await resolveApplicantContact(admin, input.application);
  if (!contact) return null;

  if (input.payerUserId) {
    const { data: userData, error: userError } = await admin.auth.admin.getUserById(
      input.payerUserId,
    );

    if (!userError && userData.user) {
      const metadata = userData.user.user_metadata ?? {};
      const firstName =
        typeof metadata.first_name === "string" ? metadata.first_name.trim() : "";
      const lastName =
        typeof metadata.last_name === "string" ? metadata.last_name.trim() : "";
      const fullName = [firstName, lastName].filter(Boolean).join(" ");
      if (fullName) {
        return {
          ...contact,
          firstName: firstName || contact.firstName,
          lastName: lastName || contact.lastName,
          displayName: fullName,
        };
      }
    }
  }

  return contact;
}

export async function sendPaymentCompletedNotifications(
  admin: SupabaseClient,
  paymentId: string,
): Promise<void> {
  try {
    const payment = await getPaymentById(admin, paymentId);
    if (
      !payment ||
      payment.status !== "succeeded" ||
      payment.paymentType === "tuition" ||
      !payment.applicationId
    ) {
      return;
    }

    const { data: application, error: applicationError } = await admin
      .from("applications")
      .select("id, family_id, created_by_user_id, primary_guardian_id")
      .eq("id", payment.applicationId)
      .maybeSingle();

    if (applicationError) throw applicationError;
    if (!application) {
      console.warn("Payment notifications: application not found", paymentId);
      return;
    }

    const { data: org, error: orgError } = await admin
      .from("organizations")
      .select("name, slug")
      .eq("id", payment.organizationId)
      .maybeSingle();

    if (orgError) throw orgError;
    if (!org) {
      console.warn("Payment notifications: organization not found", paymentId);
      return;
    }

    const contact = await resolvePayerContact(admin, {
      payerUserId: payment.payerUserId,
      application,
    });

    if (!contact) {
      console.warn("Payment notifications: no payer contact", paymentId);
      return;
    }

    const schoolName = String(org.name);
    const schoolSlug = String(org.slug);
    const label = payment.label ?? "Payment";
    const chargedAmountCents =
      payment.chargedAmountCents ?? payment.amountCents;
    const paidAt = payment.paidAt ?? new Date().toISOString();
    const paymentMethodLabel = payment.paymentMethodType
      ? PAYMENT_METHOD_LABELS[payment.paymentMethodType]
      : "—";

    const notificationResults = await Promise.allSettled([
      notifyPaymentCompleted({
        schoolName,
        email: contact.email,
        paymentId: payment.id,
        paymentType: payment.paymentType,
        label,
        amountCents: payment.amountCents,
        chargedAmountCents,
        processingFeeCents: payment.processingFeeCents,
        paymentMethodType: payment.paymentMethodType,
        firstName: contact.firstName,
        lastName: contact.lastName,
        paidAt,
      }),
      ...contact.emails.map((email) =>
        sendPaymentReceiptConfirmation({
          name: contact.displayName,
          email,
          schoolName,
          label,
          amountCents: payment.amountCents,
          chargedAmountCents,
          processingFeeCents: payment.processingFeeCents,
          paymentMethodLabel,
          paidAt,
          applyDashboardUrl: `${SITE_URL}/school/${schoolSlug}/apply`,
        }),
      ),
    ]);
    await logSettledNotificationFailures(admin, {
      organizationId: payment.organizationId,
      operation: "payment_completed_notifications",
      entityType: "payment",
      entityId: paymentId,
    }, notificationResults);
  } catch (error) {
    console.error("Payment completed notifications failed:", error);
    await logNotificationFailure(admin, {
      organizationId: undefined,
      operation: "payment_completed_notifications",
      entityType: "payment",
      entityId: paymentId,
      error,
    });
  }
}
