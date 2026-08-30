import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveApplicantContact } from "@/lib/admissions/application-notifications";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_TYPE_LABELS,
} from "@/lib/admissions/payment-records";
import {
  sendPaymentReceivedAdminNotification,
  type PaymentReceivedAdminLineItem,
} from "@/lib/emails";
import { resolvePaymentNotificationEmails } from "@/lib/notifications/org-notification-settings";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import {
  getPaymentById,
  type PaymentRecord,
} from "@/lib/stripe/application-payments";
import { SITE_URL } from "@/lib/site";

async function getStudentNameForCharge(
  admin: SupabaseClient,
  chargeId: string | null | undefined,
): Promise<string | null> {
  if (!chargeId) return null;

  const { data: charge, error: chargeError } = await admin
    .from("tuition_charges")
    .select("assignment_id")
    .eq("id", chargeId)
    .maybeSingle();

  if (chargeError) throw chargeError;
  if (!charge?.assignment_id) return null;

  const { data: assignment, error: assignmentError } = await admin
    .from("tuition_enrollment_assignments")
    .select("enrollment_id")
    .eq("id", charge.assignment_id)
    .maybeSingle();

  if (assignmentError) throw assignmentError;
  if (!assignment?.enrollment_id) return null;

  const { data: enrollment, error: enrollmentError } = await admin
    .from("enrollments")
    .select("student_id")
    .eq("id", assignment.enrollment_id)
    .maybeSingle();

  if (enrollmentError) throw enrollmentError;
  if (!enrollment?.student_id) return null;

  const { data: student, error: studentError } = await admin
    .from("students")
    .select("first_name, last_name")
    .eq("id", enrollment.student_id)
    .maybeSingle();

  if (studentError) throw studentError;
  if (!student) return null;

  const firstName =
    typeof student.first_name === "string" ? student.first_name.trim() : "";
  const lastName =
    typeof student.last_name === "string" ? student.last_name.trim() : "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  return fullName || "Student";
}

async function resolvePayerLabel(
  admin: SupabaseClient,
  payment: PaymentRecord,
): Promise<string> {
  if (payment.familyId) {
    const { data: family, error } = await admin
      .from("families")
      .select("name")
      .eq("id", payment.familyId)
      .maybeSingle();

    if (error) throw error;
    if (family?.name) return String(family.name);
  }

  if (payment.applicationId) {
    const { data: application, error } = await admin
      .from("applications")
      .select("family_id, created_by_user_id, primary_guardian_id")
      .eq("id", payment.applicationId)
      .maybeSingle();

    if (error) throw error;
    if (application) {
      const contact = await resolveApplicantContact(admin, application);
      if (contact?.displayName) return contact.displayName;
    }
  }

  return "Family";
}

async function buildAdminNotificationPayload(
  admin: SupabaseClient,
  payment: PaymentRecord,
  org: { name: string; slug: string },
  options?: {
    lineItems?: PaymentReceivedAdminLineItem[];
  },
) {
  const paymentMethodLabel = payment.paymentMethodType
    ? PAYMENT_METHOD_LABELS[payment.paymentMethodType]
    : payment.paymentType === "tuition" && !payment.paymentMethodType
      ? "Manual"
      : "—";

  const studentName =
    options?.lineItems?.length === 1
      ? (options.lineItems[0]?.studentName ?? null)
      : await getStudentNameForCharge(admin, payment.tuitionChargeId);

  return {
    schoolName: String(org.name),
    paymentTypeLabel: PAYMENT_TYPE_LABELS[payment.paymentType],
    payerLabel: await resolvePayerLabel(admin, payment),
    amountCents: payment.amountCents,
    chargedAmountCents: payment.chargedAmountCents ?? payment.amountCents,
    processingFeeCents: payment.processingFeeCents,
    paymentMethodLabel,
    paidAt: payment.paidAt ?? new Date().toISOString(),
    studentName,
    chargeLabel: payment.label ?? null,
    lineItems: options?.lineItems,
    paymentsAdminUrl: `${SITE_URL}${schoolAdminPath(String(org.slug), "admissions", "payments")}`,
  };
}

export async function sendPaymentReceivedAdminNotifications(
  admin: SupabaseClient,
  paymentId: string,
): Promise<void> {
  try {
    const payment = await getPaymentById(admin, paymentId);
    if (!payment || payment.status !== "succeeded") {
      return;
    }

    const notifyEmails = await resolvePaymentNotificationEmails(
      admin,
      payment.organizationId,
    );
    if (notifyEmails.length === 0) {
      return;
    }

    const { data: org, error: orgError } = await admin
      .from("organizations")
      .select("name, slug")
      .eq("id", payment.organizationId)
      .maybeSingle();

    if (orgError) throw orgError;
    if (!org?.slug) {
      console.warn(
        "Payment received admin notification: organization not found",
        paymentId,
      );
      return;
    }

    const payload = await buildAdminNotificationPayload(admin, payment, org);

    await Promise.allSettled(
      notifyEmails.map((email) =>
        sendPaymentReceivedAdminNotification({
          email,
          ...payload,
        }),
      ),
    );
  } catch (error) {
    console.error("Payment received admin notifications failed:", paymentId, error);
  }
}

export async function sendCombinedPaymentReceivedAdminNotifications(
  admin: SupabaseClient,
  input: {
    paymentIds: string[];
  },
): Promise<void> {
  try {
    const payments = (
      await Promise.all(input.paymentIds.map((id) => getPaymentById(admin, id)))
    ).filter(
      (payment): payment is PaymentRecord =>
        payment != null && payment.status === "succeeded",
    );

    if (payments.length === 0) return;

    const firstPayment = payments[0];
    const notifyEmails = await resolvePaymentNotificationEmails(
      admin,
      firstPayment.organizationId,
    );
    if (notifyEmails.length === 0) {
      return;
    }

    const { data: org, error: orgError } = await admin
      .from("organizations")
      .select("name, slug")
      .eq("id", firstPayment.organizationId)
      .maybeSingle();

    if (orgError) throw orgError;
    if (!org?.slug) {
      console.warn(
        "Combined payment received admin notification: organization not found",
        input.paymentIds.join(","),
      );
      return;
    }

    const lineItems: PaymentReceivedAdminLineItem[] = [];
    for (const payment of payments) {
      lineItems.push({
        label: payment.label ?? "Tuition",
        amountCents: payment.amountCents,
        studentName: await getStudentNameForCharge(admin, payment.tuitionChargeId),
      });
    }

    const amountCents = payments.reduce(
      (sum, payment) => sum + payment.amountCents,
      0,
    );
    const chargedAmountCents = payments.reduce(
      (sum, payment) =>
        sum + (payment.chargedAmountCents ?? payment.amountCents),
      0,
    );
    const processingFeeCents = payments.reduce(
      (sum, payment) => sum + (payment.processingFeeCents ?? 0),
      0,
    );

    const payload = await buildAdminNotificationPayload(admin, firstPayment, org, {
      lineItems,
    });

    await Promise.allSettled(
      notifyEmails.map((email) =>
        sendPaymentReceivedAdminNotification({
          email,
          ...payload,
          amountCents,
          chargedAmountCents,
          processingFeeCents,
          studentName: null,
          chargeLabel: null,
        }),
      ),
    );
  } catch (error) {
    console.error(
      "Combined payment received admin notifications failed:",
      input.paymentIds.join(","),
      error,
    );
  }
}
