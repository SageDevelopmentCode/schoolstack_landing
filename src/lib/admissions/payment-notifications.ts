import type { SupabaseClient } from "@supabase/supabase-js";
import {
  type ApplicantContact,
  resolveApplicantContact,
} from "@/lib/admissions/application-notifications";
import { PAYMENT_METHOD_LABELS } from "@/lib/admissions/payment-records";
import { notifyPaymentCompleted } from "@/lib/discord";
import { sendPaymentReceiptConfirmation } from "@/lib/emails";
import { getPaymentById } from "@/lib/stripe/application-payments";
import { SITE_URL } from "@/lib/site";

async function resolvePayerContact(
  admin: SupabaseClient,
  input: {
    payerUserId: string | null;
    application: {
      created_by_user_id: string | null;
      primary_guardian_id: string | null;
    };
  },
): Promise<ApplicantContact | null> {
  if (input.payerUserId) {
    const { data: userData, error: userError } = await admin.auth.admin.getUserById(
      input.payerUserId,
    );

    if (userError) throw userError;
    const user = userData.user;
    if (user?.email) {
      const metadata = user.user_metadata ?? {};
      const firstName =
        typeof metadata.first_name === "string" ? metadata.first_name.trim() : "";
      const lastName =
        typeof metadata.last_name === "string" ? metadata.last_name.trim() : "";

      return {
        email: user.email.trim().toLowerCase(),
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        displayName: [firstName, lastName].filter(Boolean).join(" ") || user.email,
      };
    }
  }

  return resolveApplicantContact(admin, input.application);
}

export async function sendPaymentCompletedNotifications(
  admin: SupabaseClient,
  paymentId: string,
): Promise<void> {
  try {
    const payment = await getPaymentById(admin, paymentId);
    if (!payment || payment.status !== "succeeded") {
      return;
    }

    const { data: application, error: applicationError } = await admin
      .from("applications")
      .select("id, created_by_user_id, primary_guardian_id")
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

    await Promise.allSettled([
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
      sendPaymentReceiptConfirmation({
        name: contact.displayName,
        email: contact.email,
        schoolName,
        label,
        amountCents: payment.amountCents,
        chargedAmountCents,
        processingFeeCents: payment.processingFeeCents,
        paymentMethodLabel,
        paidAt,
        applyDashboardUrl: `${SITE_URL}/school/${schoolSlug}/apply`,
      }),
    ]);
  } catch (error) {
    console.error("Payment completed notifications failed:", error);
  }
}
