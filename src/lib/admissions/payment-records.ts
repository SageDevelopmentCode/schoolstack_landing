import type { SupabaseClient } from "@supabase/supabase-js";
import {
  listPaymentRecords,
  type ListPaymentRecordsFilters,
  type PaymentRecord,
  type PaymentStatus,
  type PaymentType,
} from "@/lib/stripe/application-payments";

export type { PaymentRecord };

function rowToPaymentRecord(row: Record<string, unknown>): PaymentRecord {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    applicationId: String(row.application_id),
    paymentType: (row.payment_type as PaymentType) ?? "application_fee",
    enrollmentChecklistItemId:
      typeof row.enrollment_checklist_item_id === "string"
        ? row.enrollment_checklist_item_id
        : null,
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
    status: row.status as PaymentStatus,
    paidAt: typeof row.paid_at === "string" ? row.paid_at : null,
    createdAt: typeof row.created_at === "string" ? row.created_at : "",
  };
}

export type PaymentRecordDisplayRow = PaymentRecord & {
  payerEmail: string | null;
  applicantLabel: string | null;
  organizationName?: string | null;
  organizationSlug?: string | null;
};

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  application_fee: "Application fee",
  enrollment_checklist: "Enrollment",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pending",
  succeeded: "Succeeded",
  failed: "Failed",
  refunded: "Refunded",
};

export const PAYMENT_METHOD_LABELS = {
  card: "Card",
  us_bank_account: "ACH",
} as const;

function resolveApplicantLabel(
  responses: unknown,
): string | null {
  if (!responses || typeof responses !== "object" || Array.isArray(responses)) {
    return null;
  }

  const record = responses as Record<string, unknown>;
  const studentFirst =
    typeof record.student_first_name === "string"
      ? record.student_first_name.trim()
      : "";
  const studentLast =
    typeof record.student_last_name === "string"
      ? record.student_last_name.trim()
      : "";
  const studentName = [studentFirst, studentLast].filter(Boolean).join(" ");
  if (studentName) return studentName;

  const guardianFirst =
    typeof record.guardian_first_name === "string"
      ? record.guardian_first_name.trim()
      : "";
  const guardianLast =
    typeof record.guardian_last_name === "string"
      ? record.guardian_last_name.trim()
      : "";
  const guardianName = [guardianFirst, guardianLast].filter(Boolean).join(" ");
  return guardianName || null;
}

function mapDisplayRow(row: Record<string, unknown>): PaymentRecordDisplayRow {
  const payment = rowToPaymentRecord(row);
  const applications = row.applications as
    | { responses?: unknown }
    | { responses?: unknown }[]
    | null;
  const applicationRow = Array.isArray(applications)
    ? applications[0]
    : applications;
  const profiles = row.profiles as
    | { email?: string }
    | { email?: string }[]
    | null;
  const profileRow = Array.isArray(profiles) ? profiles[0] : profiles;
  const organizations = row.organizations as
    | { name?: string; slug?: string }
    | { name?: string; slug?: string }[]
    | null;
  const organizationRow = Array.isArray(organizations)
    ? organizations[0]
    : organizations;

  return {
    ...payment,
    payerEmail:
      typeof profileRow?.email === "string" ? profileRow.email : null,
    applicantLabel: resolveApplicantLabel(applicationRow?.responses),
    organizationName:
      typeof organizationRow?.name === "string" ? organizationRow.name : null,
    organizationSlug:
      typeof organizationRow?.slug === "string" ? organizationRow.slug : null,
  };
}

export async function listOrganizationPayments(
  supabase: SupabaseClient,
  organizationId: string,
  filters: Omit<ListPaymentRecordsFilters, "organizationId"> = {},
): Promise<PaymentRecordDisplayRow[]> {
  const { data, error } = await supabase
    .from("application_payments")
    .select(
      `
      *,
      applications ( responses ),
      profiles:payer_user_id ( email ),
      organizations ( name, slug )
    `,
    )
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(filters.limit ?? 500);

  if (error) throw error;

  let rows = (data ?? []).map((row) =>
    mapDisplayRow(row as Record<string, unknown>),
  );

  if (filters.applicationId) {
    rows = rows.filter((row) => row.applicationId === filters.applicationId);
  }
  if (filters.paymentType) {
    rows = rows.filter((row) => row.paymentType === filters.paymentType);
  }
  if (filters.status) {
    rows = rows.filter((row) => row.status === filters.status);
  }

  return rows;
}

export async function listApplicationPayments(
  supabase: SupabaseClient,
  applicationId: string,
): Promise<PaymentRecordDisplayRow[]> {
  const { data, error } = await supabase
    .from("application_payments")
    .select(
      `
      *,
      applications ( responses ),
      profiles:payer_user_id ( email )
    `,
    )
    .eq("application_id", applicationId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) =>
    mapDisplayRow(row as Record<string, unknown>),
  );
}

export async function listAllPayments(
  supabase: SupabaseClient,
  filters: ListPaymentRecordsFilters = {},
): Promise<PaymentRecordDisplayRow[]> {
  const records = await listPaymentRecords(supabase, filters);
  if (records.length === 0) return [];

  const applicationIds = [...new Set(records.map((row) => row.applicationId))];
  const payerIds = [
    ...new Set(
      records
        .map((row) => row.payerUserId)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const organizationIds = [
    ...new Set(records.map((row) => row.organizationId)),
  ];

  const [applicationsResult, profilesResult, organizationsResult] =
    await Promise.all([
      supabase
        .from("applications")
        .select("id, responses")
        .in("id", applicationIds),
      payerIds.length > 0
        ? supabase.from("profiles").select("id, email").in("id", payerIds)
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from("organizations")
        .select("id, name, slug")
        .in("id", organizationIds),
    ]);

  if (applicationsResult.error) throw applicationsResult.error;
  if (profilesResult.error) throw profilesResult.error;
  if (organizationsResult.error) throw organizationsResult.error;

  const applicationById = new Map(
    (applicationsResult.data ?? []).map((row) => [String(row.id), row]),
  );
  const profileById = new Map(
    (profilesResult.data ?? []).map((row) => [String(row.id), row]),
  );
  const organizationById = new Map(
    (organizationsResult.data ?? []).map((row) => [String(row.id), row]),
  );

  return records.map((record) => ({
    ...record,
    payerEmail:
      record.payerUserId && profileById.get(record.payerUserId)?.email
        ? String(profileById.get(record.payerUserId)?.email)
        : null,
    applicantLabel: resolveApplicantLabel(
      applicationById.get(record.applicationId)?.responses,
    ),
    organizationName: organizationById.get(record.organizationId)?.name
      ? String(organizationById.get(record.organizationId)?.name)
      : null,
    organizationSlug: organizationById.get(record.organizationId)?.slug
      ? String(organizationById.get(record.organizationId)?.slug)
      : null,
  }));
}
