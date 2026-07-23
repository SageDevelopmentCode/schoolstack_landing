import type { SupabaseClient } from "@supabase/supabase-js";
import {
  listPaymentRecords,
  type ListPaymentRecordsFilters,
  type PaymentRecord,
  type PaymentStatus,
  type PaymentType,
} from "@/lib/stripe/application-payments";

export type { PaymentRecord };

export type PaymentRecordDisplayRow = PaymentRecord & {
  payerEmail: string | null;
  applicantLabel: string | null;
  organizationName?: string | null;
  organizationSlug?: string | null;
};

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  application_fee: "Application fee",
  enrollment_checklist: "Enrollment",
  tuition: "Tuition",
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

export type PaymentRowsSummary = {
  collectedThisMonthCents: number;
  collectedYtdCents: number;
  pendingCount: number;
  pendingCents: number;
  failedCount: number;
  refundedCount: number;
  refundedCents: number;
  applicationFeeCents: number;
  enrollmentCents: number;
  tuitionCents: number;
};

function paymentTimestamp(row: PaymentRecordDisplayRow): Date | null {
  const iso = row.paidAt ?? row.createdAt;
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function summarizePaymentRows(
  rows: PaymentRecordDisplayRow[],
): PaymentRowsSummary {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let collectedThisMonthCents = 0;
  let collectedYtdCents = 0;
  let pendingCount = 0;
  let pendingCents = 0;
  let failedCount = 0;
  let refundedCount = 0;
  let refundedCents = 0;
  let applicationFeeCents = 0;
  let enrollmentCents = 0;
  let tuitionCents = 0;

  for (const row of rows) {
    const amount = row.amountCents;
    const paidAt = paymentTimestamp(row);

    if (row.status === "succeeded") {
      if (paidAt && paidAt.getFullYear() === currentYear) {
        collectedYtdCents += amount;
        if (paidAt.getMonth() === currentMonth) {
          collectedThisMonthCents += amount;
        }
      }
      if (row.paymentType === "application_fee") {
        applicationFeeCents += amount;
      } else if (row.paymentType === "enrollment_checklist") {
        enrollmentCents += amount;
      } else if (row.paymentType === "tuition") {
        tuitionCents += amount;
      }
    } else if (row.status === "pending") {
      pendingCount += 1;
      pendingCents += amount;
    } else if (row.status === "failed") {
      failedCount += 1;
    } else if (row.status === "refunded") {
      refundedCount += 1;
      refundedCents += amount;
    }
  }

  return {
    collectedThisMonthCents,
    collectedYtdCents,
    pendingCount,
    pendingCents,
    failedCount,
    refundedCount,
    refundedCents,
    applicationFeeCents,
    enrollmentCents,
    tuitionCents,
  };
}

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

async function enrichPaymentDisplayRows(
  supabase: SupabaseClient,
  records: PaymentRecord[],
): Promise<PaymentRecordDisplayRow[]> {
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

  const [applicationsResult, guardiansResult, profilesResult, organizationsResult] =
    await Promise.all([
      supabase
        .from("applications")
        .select("id, responses")
        .in("id", applicationIds),
      payerIds.length > 0
        ? supabase
            .from("guardians")
            .select("user_id, email")
            .in("user_id", payerIds)
        : Promise.resolve({ data: [], error: null }),
      payerIds.length > 0
        ? supabase.from("profiles").select("id, email").in("id", payerIds)
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from("organizations")
        .select("id, name, slug")
        .in("id", organizationIds),
    ]);

  if (applicationsResult.error) throw applicationsResult.error;
  if (guardiansResult.error) throw guardiansResult.error;
  if (profilesResult.error) throw profilesResult.error;
  if (organizationsResult.error) throw organizationsResult.error;

  const applicationById = new Map(
    (applicationsResult.data ?? []).map((row) => [String(row.id), row]),
  );
  const guardianEmailByUserId = new Map<string, string>();
  for (const row of guardiansResult.data ?? []) {
    const userId = String(row.user_id);
    const email = typeof row.email === "string" ? row.email.trim() : "";
    if (userId && email && !guardianEmailByUserId.has(userId)) {
      guardianEmailByUserId.set(userId, email);
    }
  }
  const profileEmailById = new Map(
    (profilesResult.data ?? [])
      .filter((row) => typeof row.email === "string" && row.email.trim())
      .map((row) => [String(row.id), String(row.email)]),
  );
  const organizationById = new Map(
    (organizationsResult.data ?? []).map((row) => [String(row.id), row]),
  );

  return records.map((record) => {
    const payerEmail =
      record.payerUserId &&
      (guardianEmailByUserId.get(record.payerUserId) ??
        profileEmailById.get(record.payerUserId))
        ? String(
            guardianEmailByUserId.get(record.payerUserId) ??
              profileEmailById.get(record.payerUserId),
          )
        : null;

    return {
      ...record,
      payerEmail,
      applicantLabel: resolveApplicantLabel(
        applicationById.get(record.applicationId)?.responses,
      ),
      organizationName: organizationById.get(record.organizationId)?.name
        ? String(organizationById.get(record.organizationId)?.name)
        : null,
      organizationSlug: organizationById.get(record.organizationId)?.slug
        ? String(organizationById.get(record.organizationId)?.slug)
        : null,
    };
  });
}

export async function listOrganizationPayments(
  supabase: SupabaseClient,
  organizationId: string,
  filters: Omit<ListPaymentRecordsFilters, "organizationId"> = {},
): Promise<PaymentRecordDisplayRow[]> {
  const records = await listPaymentRecords(supabase, {
    organizationId,
    applicationId: filters.applicationId,
    paymentType: filters.paymentType,
    status: filters.status,
    limit: filters.limit,
  });

  return enrichPaymentDisplayRows(supabase, records);
}

export async function listApplicationPayments(
  supabase: SupabaseClient,
  applicationId: string,
): Promise<PaymentRecordDisplayRow[]> {
  const records = await listPaymentRecords(supabase, { applicationId });
  return enrichPaymentDisplayRows(supabase, records);
}

export async function listAllPayments(
  supabase: SupabaseClient,
  filters: ListPaymentRecordsFilters = {},
): Promise<PaymentRecordDisplayRow[]> {
  const records = await listPaymentRecords(supabase, filters);
  return enrichPaymentDisplayRows(supabase, records);
}
