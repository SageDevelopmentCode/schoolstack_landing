import type { SupabaseClient } from "@supabase/supabase-js";
import { reportOperationalError } from "@/lib/operational-errors";

/*
 * "Needs you" counts for the admin sidebar badges, counted without loading
 * rows. Each matches the number its page shows:
 * - staffHoursPending: Staff hours → Requests (every `pending` adjustment)
 * - applicationsToReview: Admissions → Submissions "Ready to review" (`submitted`)
 * - committeeJoinRequests: Committees "Needs attention" (`pending` join requests)
 * A count that fails comes back `null`, so the badge keeps its last value, and
 * the failure is reported for ops visibility.
 */

export type AdminNavCountsLoadContext = {
  organizationName?: string | null;
  organizationSlug?: string | null;
};

export type AdminNavCountKey =
  | "staffHoursPending"
  | "applicationsToReview"
  | "committeeJoinRequests";

export type AdminNavCountValues = Record<AdminNavCountKey, number>;
export type AdminNavCountsResult = Record<AdminNavCountKey, number | null>;
export type AdminNavCountFlags = Partial<Record<AdminNavCountKey, boolean>>;

export const ADMIN_NAV_COUNT_KEYS: AdminNavCountKey[] = [
  "staffHoursPending",
  "applicationsToReview",
  "committeeJoinRequests",
];

export const EMPTY_ADMIN_NAV_COUNTS: AdminNavCountValues = {
  staffHoursPending: 0,
  applicationsToReview: 0,
  committeeJoinRequests: 0,
};

const COUNT_QUERIES: Record<AdminNavCountKey, { table: string; status: string }> = {
  staffHoursPending: { table: "staff_hours_adjustment_requests", status: "pending" },
  applicationsToReview: { table: "applications", status: "submitted" },
  committeeJoinRequests: { table: "committee_join_requests", status: "pending" },
};

async function countByStatus(
  admin: SupabaseClient,
  organizationId: string,
  key: AdminNavCountKey,
): Promise<number> {
  const { table, status } = COUNT_QUERIES[key];
  const { count, error } = await admin
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("status", status);
  if (error) throw error;
  return count ?? 0;
}

function schoolLabel(context: AdminNavCountsLoadContext | undefined, organizationId: string): string {
  return (
    context?.organizationName?.trim() ||
    context?.organizationSlug?.trim() ||
    organizationId
  );
}

export async function loadAdminNavCounts(
  admin: SupabaseClient,
  organizationId: string,
  flags: AdminNavCountFlags,
  context?: AdminNavCountsLoadContext,
): Promise<AdminNavCountsResult> {
  const settled = await Promise.allSettled(
    ADMIN_NAV_COUNT_KEYS.map((key) =>
      flags[key] ? countByStatus(admin, organizationId, key) : Promise.resolve(0),
    ),
  );
  const result = {} as AdminNavCountsResult;
  ADMIN_NAV_COUNT_KEYS.forEach((key, index) => {
    const outcome = settled[index];
    if (outcome.status === "fulfilled") {
      result[key] = outcome.value;
      return;
    }
    void reportOperationalError({
      supabase: admin,
      surface: "school_admin",
      organizationId,
      organizationName: context?.organizationName,
      organizationSlug: context?.organizationSlug,
      operation: `school_admin.sidebar_nav_counts.${key}`,
      error: `Failed to load sidebar nav count "${key}" for ${schoolLabel(context, organizationId)}.`,
      metadata: { countKey: key },
      severity: "warning",
      notify: true,
      actor: { type: "system" },
      cause: outcome.reason,
    });
    result[key] = null;
  });
  return result;
}

/** Query string flags the client sends (`?staffHoursPending=1&…`). */
export function parseAdminNavCountFlags(searchParams: URLSearchParams): AdminNavCountFlags {
  const flags: AdminNavCountFlags = {};
  for (const key of ADMIN_NAV_COUNT_KEYS) {
    if (searchParams.get(key) === "1") flags[key] = true;
  }
  return flags;
}

export function adminNavCountFlagsQuery(flags: AdminNavCountFlags): string {
  return ADMIN_NAV_COUNT_KEYS.filter((key) => flags[key])
    .map((key) => `${key}=1`)
    .join("&");
}
