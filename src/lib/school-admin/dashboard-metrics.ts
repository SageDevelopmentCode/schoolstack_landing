import type { SupabaseClient } from "@supabase/supabase-js";

export type DashboardApplicationMetrics = {
  activeApplications: number;
  enrolledCount: number;
  submittedCount: number;
  latestSubmitted: {
    id: string;
    submittedAt: string | null;
    guardianName: string | null;
  } | null;
};

export type DashboardAggregateMetrics = {
  activeApplications: number;
  enrolledCount: number;
  submittedCount: number;
  collectedThisMonthCents: number;
  messagesUnread: number;
};

type AdminDashboardMetricsRow = {
  active_applications?: number;
  enrolled_count?: number;
  submitted_count?: number;
  collected_this_month_cents?: number | string;
  messages_unread?: number | string;
};

function parseAdminDashboardMetricsRow(
  row: AdminDashboardMetricsRow | null,
): DashboardAggregateMetrics | null {
  if (!row) return null;

  return {
    activeApplications: Number(row.active_applications ?? 0),
    enrolledCount: Number(row.enrolled_count ?? 0),
    submittedCount: Number(row.submitted_count ?? 0),
    collectedThisMonthCents: Number(row.collected_this_month_cents ?? 0),
    messagesUnread: Number(row.messages_unread ?? 0),
  };
}

export async function fetchDashboardAggregateMetrics(
  supabase: SupabaseClient,
  organizationId: string,
  userId?: string,
): Promise<DashboardAggregateMetrics | null> {
  if (!userId) return null;

  const { data, error } = await supabase.rpc("admin_dashboard_metrics", {
    p_organization_id: organizationId,
    p_user_id: userId,
  });

  if (error) {
    return null;
  }

  return parseAdminDashboardMetricsRow(
    (data ?? null) as AdminDashboardMetricsRow | null,
  );
}

export async function fetchLatestSubmittedApplication(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<DashboardApplicationMetrics["latestSubmitted"]> {
  const { data, error } = await supabase
    .from("applications")
    .select(
      `
      id,
      submitted_at,
      guardians:primary_guardian_id (
        first_name,
        last_name
      )
    `,
    )
    .eq("organization_id", organizationId)
    .eq("status", "submitted")
    .order("submitted_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  const guardian = data.guardians as
    | { first_name?: string; last_name?: string }
    | { first_name?: string; last_name?: string }[]
    | null;
  const guardianRow = Array.isArray(guardian) ? guardian[0] : guardian;
  const guardianName = guardianRow
    ? [guardianRow.first_name, guardianRow.last_name].filter(Boolean).join(" ") ||
      null
    : null;

  return {
    id: String(data.id),
    submittedAt: data.submitted_at ? String(data.submitted_at) : null,
    guardianName,
  };
}

async function fetchDashboardApplicationMetricsFallback(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<Pick<
  DashboardApplicationMetrics,
  "activeApplications" | "enrolledCount" | "submittedCount"
>> {
  const { data, error } = await supabase
    .from("applications")
    .select("status")
    .eq("organization_id", organizationId);

  if (error) throw error;

  const terminalStatuses = new Set(["enrolled", "declined", "withdrawn"]);
  let activeApplications = 0;
  let enrolledCount = 0;
  let submittedCount = 0;

  for (const row of data ?? []) {
    const status = String(row.status);
    if (status === "enrolled") enrolledCount += 1;
    if (status === "submitted") submittedCount += 1;
    if (!terminalStatuses.has(status)) activeApplications += 1;
  }

  return { activeApplications, enrolledCount, submittedCount };
}

async function fetchCollectedThisMonthCentsFallback(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<number> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("application_payments")
    .select("amount_cents")
    .eq("organization_id", organizationId)
    .eq("status", "succeeded")
    .gte("paid_at", startOfMonth.toISOString());

  if (error) throw error;

  return (data ?? []).reduce(
    (sum, row) => sum + Number(row.amount_cents ?? 0),
    0,
  );
}

export async function fetchDashboardApplicationMetrics(
  supabase: SupabaseClient,
  organizationId: string,
  aggregateMetrics?: DashboardAggregateMetrics | null,
): Promise<DashboardApplicationMetrics> {
  const [counts, latestSubmitted] = await Promise.all([
    aggregateMetrics
      ? Promise.resolve({
          activeApplications: aggregateMetrics.activeApplications,
          enrolledCount: aggregateMetrics.enrolledCount,
          submittedCount: aggregateMetrics.submittedCount,
        })
      : fetchDashboardApplicationMetricsFallback(supabase, organizationId),
    fetchLatestSubmittedApplication(supabase, organizationId),
  ]);

  return {
    ...counts,
    latestSubmitted,
  };
}

export async function fetchCollectedThisMonthCents(
  supabase: SupabaseClient,
  organizationId: string,
  aggregateMetrics?: DashboardAggregateMetrics | null,
): Promise<number> {
  if (aggregateMetrics) {
    return aggregateMetrics.collectedThisMonthCents;
  }
  return fetchCollectedThisMonthCentsFallback(supabase, organizationId);
}
