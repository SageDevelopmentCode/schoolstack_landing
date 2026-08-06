import type { SupabaseClient } from "@supabase/supabase-js";
import type { PaymentRecord } from "@/lib/stripe/application-payments";
import { settleTuitionPayment } from "./payment-settlement";

export type ParentTuitionPaymentRecord = PaymentRecord & {
  studentFirstName: string | null;
  enrollmentId: string | null;
};

export type ParentLastPaymentDaySummary = {
  paidAt: string;
  amountCents: number;
  studentFirstNames: string[];
};

export type StudentPaymentContext = {
  firstName: string;
  enrollmentId: string;
};

export async function createTuitionPaymentRecord(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    familyId: string;
    tuitionChargeId: string;
    amountCents: number;
    label: string;
    payerUserId?: string;
    currency?: string;
    stripeCheckoutSessionId?: string;
    chargedAmountCents?: number;
    processingFeeCents?: number;
    paymentMethodType?: "card" | "us_bank_account";
  },
): Promise<PaymentRecord> {
  const { data, error } = await supabase
    .from("application_payments")
    .insert({
      organization_id: input.organizationId,
      application_id: null,
      family_id: input.familyId,
      tuition_charge_id: input.tuitionChargeId,
      payment_type: "tuition",
      label: input.label,
      amount_cents: input.amountCents,
      charged_amount_cents: input.chargedAmountCents ?? null,
      processing_fee_cents: input.processingFeeCents ?? null,
      payment_method_type: input.paymentMethodType ?? null,
      payer_user_id: input.payerUserId ?? null,
      currency: input.currency ?? "USD",
      status: "pending",
      stripe_checkout_session_id: input.stripeCheckoutSessionId ?? null,
    })
    .select("*")
    .single();

  if (error) throw error;

  return {
    id: String(data.id),
    organizationId: String(data.organization_id),
    applicationId: null,
    familyId: input.familyId,
    tuitionChargeId: input.tuitionChargeId,
    paymentType: "tuition",
    enrollmentChecklistItemId: null,
    label: typeof data.label === "string" ? data.label : null,
    payerUserId:
      typeof data.payer_user_id === "string" ? data.payer_user_id : null,
    stripeCheckoutSessionId:
      typeof data.stripe_checkout_session_id === "string"
        ? data.stripe_checkout_session_id
        : null,
    stripePaymentIntentId: null,
    amountCents: Number(data.amount_cents),
    chargedAmountCents:
      typeof data.charged_amount_cents === "number"
        ? data.charged_amount_cents
        : null,
    processingFeeCents:
      typeof data.processing_fee_cents === "number"
        ? data.processing_fee_cents
        : null,
    paymentMethodType:
      data.payment_method_type === "card" ||
      data.payment_method_type === "us_bank_account"
        ? data.payment_method_type
        : null,
    currency: String(data.currency ?? "USD"),
    status: "pending",
    paidAt: null,
    createdAt: String(data.created_at),
  };
}

export async function listTuitionPaymentsForFamily(
  supabase: SupabaseClient,
  familyId: string,
): Promise<PaymentRecord[]> {
  const { data, error } = await supabase
    .from("application_payments")
    .select("*")
    .eq("family_id", familyId)
    .eq("payment_type", "tuition")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return mapTuitionPaymentRows(data ?? [], familyId);
}

/** Parent portal payment history — completed payments only. */
export async function listParentTuitionPaymentHistory(
  supabase: SupabaseClient,
  familyId: string,
): Promise<ParentTuitionPaymentRecord[]> {
  const { data, error } = await supabase
    .from("application_payments")
    .select("*")
    .eq("family_id", familyId)
    .eq("payment_type", "tuition")
    .eq("status", "succeeded")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const payments = mapTuitionPaymentRows(data ?? [], familyId);
  const studentContextByChargeId = await fetchStudentContextByChargeId(
    supabase,
    payments
      .map((payment) => payment.tuitionChargeId)
      .filter((id): id is string => Boolean(id)),
  );

  return payments.map((payment) => {
    const context = payment.tuitionChargeId
      ? studentContextByChargeId.get(payment.tuitionChargeId)
      : undefined;
    return {
      ...payment,
      studentFirstName: context?.firstName ?? null,
      enrollmentId: context?.enrollmentId ?? null,
    };
  });
}

async function fetchStudentContextByChargeId(
  supabase: SupabaseClient,
  chargeIds: string[],
): Promise<Map<string, StudentPaymentContext>> {
  const uniqueChargeIds = [...new Set(chargeIds)];
  if (uniqueChargeIds.length === 0) return new Map();

  const { data: charges, error: chargesError } = await supabase
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

  const { data: assignments, error: assignmentsError } = await supabase
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

  const { data: enrollments, error: enrollmentsError } = await supabase
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

  if (studentIds.length === 0) return new Map();

  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select("id, first_name")
    .in("id", studentIds);

  if (studentsError) throw studentsError;

  const studentFirstNameById = new Map(
    (students ?? []).map((student) => [
      String(student.id),
      typeof student.first_name === "string" ? student.first_name : "Student",
    ]),
  );
  const enrollmentStudentId = new Map(
    (enrollments ?? []).map((enrollment) => [
      String(enrollment.id),
      enrollment.student_id ? String(enrollment.student_id) : null,
    ]),
  );
  const assignmentEnrollmentId = new Map(
    (assignments ?? []).map((assignment) => [
      String(assignment.id),
      assignment.enrollment_id ? String(assignment.enrollment_id) : null,
    ]),
  );
  const chargeAssignmentId = new Map(
    (charges ?? []).map((charge) => [
      String(charge.id),
      charge.assignment_id ? String(charge.assignment_id) : null,
    ]),
  );

  const result = new Map<string, StudentPaymentContext>();
  for (const chargeId of uniqueChargeIds) {
    const assignmentId = chargeAssignmentId.get(chargeId);
    if (!assignmentId) continue;
    const enrollmentId = assignmentEnrollmentId.get(assignmentId);
    if (!enrollmentId) continue;
    const studentId = enrollmentStudentId.get(enrollmentId);
    if (!studentId) continue;
    const firstName = studentFirstNameById.get(studentId);
    if (firstName) {
      result.set(chargeId, { firstName, enrollmentId });
    }
  }

  return result;
}

export function mapParentTuitionPaymentRows(
  rows: Record<string, unknown>[],
  familyId: string,
  studentContextByChargeId: Map<string, StudentPaymentContext> = new Map(),
): ParentTuitionPaymentRecord[] {
  return mapTuitionPaymentRows(rows, familyId).map((payment) => {
    const context = payment.tuitionChargeId
      ? studentContextByChargeId.get(payment.tuitionChargeId)
      : undefined;
    return {
      ...payment,
      studentFirstName: context?.firstName ?? null,
      enrollmentId: context?.enrollmentId ?? null,
    };
  });
}

export function resolveMostRecentTuitionPayment(
  payments: ParentTuitionPaymentRecord[],
): ParentTuitionPaymentRecord | null {
  const succeeded = payments.filter(
    (payment) => payment.status === "succeeded" && payment.paidAt,
  );

  if (succeeded.length === 0) return null;

  return [...succeeded].sort((a, b) =>
    (b.paidAt ?? "").localeCompare(a.paidAt ?? ""),
  )[0]!;
}

export function resolveLastPaymentDaySummary(
  payments: ParentTuitionPaymentRecord[],
): ParentLastPaymentDaySummary | null {
  const mostRecentPayment = resolveMostRecentTuitionPayment(payments);
  if (!mostRecentPayment?.paidAt) return null;

  const lastPaymentDay = mostRecentPayment.paidAt.slice(0, 10);
  const sameDayPayments = payments.filter(
    (payment) =>
      payment.status === "succeeded" &&
      payment.paidAt?.slice(0, 10) === lastPaymentDay,
  );

  const amountCents = sameDayPayments.reduce(
    (sum, payment) => sum + payment.amountCents,
    0,
  );
  const studentFirstNames = [
    ...new Set(
      sameDayPayments
        .map((payment) => payment.studentFirstName)
        .filter((name): name is string => Boolean(name)),
    ),
  ];

  return {
    paidAt: mostRecentPayment.paidAt,
    amountCents,
    studentFirstNames,
  };
}

function mapTuitionPaymentRows(
  rows: Record<string, unknown>[],
  familyId: string,
): PaymentRecord[] {
  return rows.map((row) => ({
    id: String(row.id),
    organizationId: String(row.organization_id),
    applicationId: null,
    familyId:
      typeof row.family_id === "string" ? row.family_id : familyId,
    tuitionChargeId:
      typeof row.tuition_charge_id === "string" ? row.tuition_charge_id : null,
    paymentType: "tuition" as const,
    enrollmentChecklistItemId: null,
    label: typeof row.label === "string" ? row.label : null,
    payerUserId:
      typeof row.payer_user_id === "string" ? row.payer_user_id : null,
    stripeCheckoutSessionId:
      typeof row.stripe_checkout_session_id === "string"
        ? row.stripe_checkout_session_id
        : null,
    stripePaymentIntentId:
      typeof row.stripe_payment_intent_id === "string"
        ? row.stripe_payment_intent_id
        : null,
    amountCents: Number(row.amount_cents),
    chargedAmountCents:
      typeof row.charged_amount_cents === "number"
        ? row.charged_amount_cents
        : null,
    processingFeeCents:
      typeof row.processing_fee_cents === "number"
        ? row.processing_fee_cents
        : null,
    paymentMethodType:
      row.payment_method_type === "card" ||
      row.payment_method_type === "us_bank_account"
        ? row.payment_method_type
        : null,
    currency: String(row.currency ?? "USD"),
    status: row.status as PaymentRecord["status"],
    paidAt: typeof row.paid_at === "string" ? row.paid_at : null,
    createdAt: String(row.created_at),
  }));
}

export async function recordManualTuitionPayment(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    familyId: string;
    tuitionChargeId: string;
    amountCents: number;
    label: string;
    payerUserId?: string;
  },
): Promise<void> {
  const { data: payment, error: paymentError } = await supabase
    .from("application_payments")
    .insert({
      organization_id: input.organizationId,
      family_id: input.familyId,
      tuition_charge_id: input.tuitionChargeId,
      payment_type: "tuition",
      label: input.label,
      amount_cents: input.amountCents,
      amount_applied_cents: input.amountCents,
      payer_user_id: input.payerUserId ?? null,
      status: "succeeded",
      paid_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (paymentError) throw paymentError;

  await settleTuitionPayment(supabase, {
    chargeId: input.tuitionChargeId,
    amountCents: input.amountCents,
    payerUserId: input.payerUserId ?? null,
    paymentId: String(payment.id),
  });
}
