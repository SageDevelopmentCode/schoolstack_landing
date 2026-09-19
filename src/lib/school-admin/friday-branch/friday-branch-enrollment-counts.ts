import type { SupabaseClient } from "@supabase/supabase-js";

export type FridayBranchClassEnrollmentSummary = {
  confirmed: number;
  waitlisted: number;
};

export const EMPTY_FRIDAY_BRANCH_ENROLLMENT_SUMMARY: FridayBranchClassEnrollmentSummary = {
  confirmed: 0,
  waitlisted: 0,
};

type EnrollmentCountRow = {
  class_id: string;
  status: string;
};

export function aggregateFridayBranchEnrollmentCounts(
  rows: EnrollmentCountRow[],
  classIds: string[],
): Record<string, FridayBranchClassEnrollmentSummary> {
  const counts: Record<string, FridayBranchClassEnrollmentSummary> = {};

  for (const classId of classIds) {
    counts[classId] = { ...EMPTY_FRIDAY_BRANCH_ENROLLMENT_SUMMARY };
  }

  for (const row of rows) {
    const classId = String(row.class_id);
    const summary = counts[classId] ?? { ...EMPTY_FRIDAY_BRANCH_ENROLLMENT_SUMMARY };

    if (row.status === "confirmed") {
      summary.confirmed += 1;
    } else if (row.status === "waitlisted") {
      summary.waitlisted += 1;
    }

    counts[classId] = summary;
  }

  return counts;
}

export async function loadFridayBranchEnrollmentCountsByClassId(
  supabase: SupabaseClient,
  organizationId: string,
  classIds: string[],
): Promise<Record<string, FridayBranchClassEnrollmentSummary>> {
  if (classIds.length === 0) return {};

  const { data, error } = await supabase
    .from("friday_branch_class_enrollments")
    .select("class_id, status")
    .eq("organization_id", organizationId)
    .in("class_id", classIds)
    .in("status", ["confirmed", "waitlisted"]);

  if (error) throw error;

  return aggregateFridayBranchEnrollmentCounts(
    (data ?? []) as EnrollmentCountRow[],
    classIds,
  );
}
