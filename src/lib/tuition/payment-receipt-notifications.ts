import type { SupabaseClient } from "@supabase/supabase-js";
import { PAYMENT_METHOD_LABELS } from "@/lib/admissions/payment-records";
import {
  sendTuitionPaymentReceiptEmail,
  type TuitionPaymentReceiptLineItem,
} from "@/lib/emails";
import { loadFamilyNotificationEmails } from "@/lib/notifications/family-notification-emails";
import {
  getPaymentById,
  type PaymentRecord,
} from "@/lib/stripe/application-payments";
import { SITE_URL } from "@/lib/site";
import type { SettleTuitionPaymentResult } from "./payment-settlement";

async function resolvePayerContact(
  admin: SupabaseClient,
  input: {
    familyId: string | null;
    payerUserId: string | null;
  },
): Promise<{ emails: string[]; name: string } | null> {
  if (!input.familyId) return null;

  const emails = await loadFamilyNotificationEmails(admin, input.familyId);
  if (emails.length === 0) return null;

  const { data: family, error: familyError } = await admin
    .from("families")
    .select("name")
    .eq("id", input.familyId)
    .maybeSingle();

  if (familyError) throw familyError;

  let displayName = String(family?.name ?? "Family");

  if (input.payerUserId) {
    const { data: userData, error: userError } =
      await admin.auth.admin.getUserById(input.payerUserId);

    if (!userError && userData.user) {
      const metadata = userData.user.user_metadata ?? {};
      const firstName =
        typeof metadata.first_name === "string" ? metadata.first_name.trim() : "";
      const lastName =
        typeof metadata.last_name === "string" ? metadata.last_name.trim() : "";
      const fullName = [firstName, lastName].filter(Boolean).join(" ");
      if (fullName) {
        displayName = fullName;
      }
    }
  }

  return { emails, name: displayName };
}

async function getStudentNamesByChargeIds(
  admin: SupabaseClient,
  chargeIds: string[],
): Promise<Map<string, string>> {
  const uniqueChargeIds = [...new Set(chargeIds.filter(Boolean))];
  if (uniqueChargeIds.length === 0) return new Map();

  const { data: charges, error: chargesError } = await admin
    .from("tuition_charges")
    .select("id, assignment_id")
    .in("id", uniqueChargeIds);

  if (chargesError) throw chargesError;

  const assignmentIds = [
    ...new Set(
      (charges ?? [])
        .map((charge) =>
          charge.assignment_id ? String(charge.assignment_id) : null,
        )
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  if (assignmentIds.length === 0) return new Map();

  const { data: assignments, error: assignmentsError } = await admin
    .from("tuition_enrollment_assignments")
    .select("id, enrollment_id")
    .in("id", assignmentIds);

  if (assignmentsError) throw assignmentsError;

  const enrollmentIds = [
    ...new Set(
      (assignments ?? [])
        .map((assignment) =>
          assignment.enrollment_id ? String(assignment.enrollment_id) : null,
        )
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  if (enrollmentIds.length === 0) return new Map();

  const { data: enrollments, error: enrollmentsError } = await admin
    .from("enrollments")
    .select("id, student_id")
    .in("id", enrollmentIds);

  if (enrollmentsError) throw enrollmentsError;

  const studentIds = [
    ...new Set(
      (enrollments ?? [])
        .map((enrollment) =>
          enrollment.student_id ? String(enrollment.student_id) : null,
        )
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const studentNameById = new Map<string, string>();
  if (studentIds.length > 0) {
    const { data: students, error: studentsError } = await admin
      .from("students")
      .select("id, first_name, last_name")
      .in("id", studentIds);

    if (studentsError) throw studentsError;

    for (const student of students ?? []) {
      const firstName =
        typeof student.first_name === "string" ? student.first_name.trim() : "";
      const lastName =
        typeof student.last_name === "string" ? student.last_name.trim() : "";
      const fullName = [firstName, lastName].filter(Boolean).join(" ");
      studentNameById.set(String(student.id), fullName || "Student");
    }
  }

  const enrollmentIdByAssignmentId = new Map(
    (assignments ?? []).map((assignment) => [
      String(assignment.id),
      assignment.enrollment_id ? String(assignment.enrollment_id) : null,
    ]),
  );
  const studentIdByEnrollmentId = new Map(
    (enrollments ?? []).map((enrollment) => [
      String(enrollment.id),
      enrollment.student_id ? String(enrollment.student_id) : null,
    ]),
  );
  const assignmentIdByChargeId = new Map(
    (charges ?? []).map((charge) => [
      String(charge.id),
      charge.assignment_id ? String(charge.assignment_id) : null,
    ]),
  );

  const result = new Map<string, string>();
  for (const chargeId of uniqueChargeIds) {
    const assignmentId = assignmentIdByChargeId.get(chargeId);
    const enrollmentId = assignmentId
      ? enrollmentIdByAssignmentId.get(assignmentId)
      : null;
    const studentId = enrollmentId
      ? studentIdByEnrollmentId.get(enrollmentId)
      : null;
    const studentName = studentId ? studentNameById.get(studentId) : null;
    if (studentName) {
      result.set(chargeId, studentName);
    }
  }

  return result;
}

function buildBillingUrl(orgSlug: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? SITE_URL;
  return `${siteUrl}/school/${orgSlug}/parent/billing`;
}

function paymentMethodLabel(
  payment: PaymentRecord,
  manual = false,
): string {
  if (manual) return "Manual payment";
  if (!payment.paymentMethodType) return "—";
  return PAYMENT_METHOD_LABELS[payment.paymentMethodType];
}

function lumpSumBreakdownFromSettleResult(
  settleResult?: SettleTuitionPaymentResult,
) {
  if (!settleResult || settleResult.surplusCents <= 0) return undefined;

  return {
    installmentCents: settleResult.appliedCents,
    futureCents: settleResult.surplusCents,
    redistributed: settleResult.redistributed,
  };
}

async function loadOrganization(
  admin: SupabaseClient,
  organizationId: string,
): Promise<{ name: string; slug: string } | null> {
  const { data: org, error: orgError } = await admin
    .from("organizations")
    .select("name, slug")
    .eq("id", organizationId)
    .maybeSingle();

  if (orgError) throw orgError;
  if (!org?.slug) return null;

  return {
    name: String(org.name),
    slug: String(org.slug),
  };
}

export async function sendTuitionPaymentReceiptNotifications(
  admin: SupabaseClient,
  paymentId: string,
  options?: {
    settleResult?: SettleTuitionPaymentResult;
    manual?: boolean;
  },
): Promise<void> {
  try {
    const payment = await getPaymentById(admin, paymentId);
    if (
      !payment ||
      payment.status !== "succeeded" ||
      payment.paymentType !== "tuition"
    ) {
      return;
    }

    const org = await loadOrganization(admin, payment.organizationId);
    if (!org) {
      console.warn("Tuition receipt: organization not found", paymentId);
      return;
    }

    const contact = await resolvePayerContact(admin, {
      familyId: payment.familyId,
      payerUserId: payment.payerUserId,
    });

    if (!contact) {
      console.warn("Tuition receipt: no payer contact", paymentId);
      return;
    }

    const studentNameByChargeId = payment.tuitionChargeId
      ? await getStudentNamesByChargeIds(admin, [payment.tuitionChargeId])
      : new Map<string, string>();

    const studentName = payment.tuitionChargeId
      ? studentNameByChargeId.get(payment.tuitionChargeId)
      : undefined;

    const chargedAmountCents =
      payment.chargedAmountCents ?? payment.amountCents;
    const paidAt = payment.paidAt ?? new Date().toISOString();

    await Promise.all(
      contact.emails.map((email) =>
        sendTuitionPaymentReceiptEmail({
          email,
          name: contact.name,
          schoolName: org.name,
          billingUrl: buildBillingUrl(org.slug),
          paidAt,
          paymentMethodLabel: paymentMethodLabel(payment, options?.manual),
          amountCents: payment.amountCents,
          chargedAmountCents,
          processingFeeCents: payment.processingFeeCents,
          studentName,
          chargeLabel: payment.label ?? "Tuition",
          lumpSumBreakdown: lumpSumBreakdownFromSettleResult(options?.settleResult),
        }),
      ),
    );
  } catch (error) {
    console.error("Tuition payment receipt notification failed:", paymentId, error);
  }
}

export async function sendCombinedTuitionPaymentReceiptNotifications(
  admin: SupabaseClient,
  input: {
    checkoutSessionId: string;
    paymentIds: string[];
  },
): Promise<void> {
  try {
    const payments = (
      await Promise.all(input.paymentIds.map((id) => getPaymentById(admin, id)))
    ).filter(
      (payment): payment is PaymentRecord =>
        payment != null &&
        payment.status === "succeeded" &&
        payment.paymentType === "tuition",
    );

    if (payments.length === 0) return;

    const firstPayment = payments[0];
    const org = await loadOrganization(admin, firstPayment.organizationId);
    if (!org) {
      console.warn(
        "Combined tuition receipt: organization not found",
        input.checkoutSessionId,
      );
      return;
    }

    const contact = await resolvePayerContact(admin, {
      familyId: firstPayment.familyId,
      payerUserId: firstPayment.payerUserId,
    });

    if (!contact) {
      console.warn(
        "Combined tuition receipt: no payer contact",
        input.checkoutSessionId,
      );
      return;
    }

    const chargeIds = payments
      .map((payment) => payment.tuitionChargeId)
      .filter((id): id is string => Boolean(id));

    const studentNameByChargeId = await getStudentNamesByChargeIds(
      admin,
      chargeIds,
    );

    const combinedLineItems: TuitionPaymentReceiptLineItem[] = payments.map(
      (payment) => ({
        studentName: payment.tuitionChargeId
          ? (studentNameByChargeId.get(payment.tuitionChargeId) ?? "Student")
          : "Student",
        chargeLabel: payment.label ?? "Tuition",
        amountCents: payment.amountCents,
      }),
    );

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

    const paidAt =
      payments
        .map((payment) => payment.paidAt)
        .filter((value): value is string => Boolean(value))
        .sort()
        .at(-1) ?? new Date().toISOString();

    const paymentMethodType = firstPayment.paymentMethodType;

    await Promise.all(
      contact.emails.map((email) =>
        sendTuitionPaymentReceiptEmail({
          email,
          name: contact.name,
          schoolName: org.name,
          billingUrl: buildBillingUrl(org.slug),
          paidAt,
          paymentMethodLabel: paymentMethodType
            ? PAYMENT_METHOD_LABELS[paymentMethodType]
            : "—",
          amountCents,
          chargedAmountCents,
          processingFeeCents: processingFeeCents > 0 ? processingFeeCents : null,
          combinedLineItems,
        }),
      ),
    );
  } catch (error) {
    console.error(
      "Combined tuition payment receipt notification failed:",
      input.checkoutSessionId,
      error,
    );
  }
}
