import type { SupabaseClient } from "@supabase/supabase-js";
import {
  filterStudentsByRosterFilter,
  matchesStudentSearch,
  type StudentRosterFilter,
} from "@/lib/school-admin/admin-student-roster-metrics";
import {
  formatEnrolledStudentName,
  formatStudentGrade,
  listOrgEnrolledStudents,
  type AdminEnrolledStudentSummary,
} from "@/lib/school-admin/enrolled-students";
import { mergeStudentStandingHealthFlags } from "@/lib/school-admin/merge-student-standing-health-flags";

export const ORG_ENROLLED_STUDENTS_PAGE_DEFAULT_LIMIT = 50;
export const ORG_ENROLLED_STUDENTS_PAGE_MAX_LIMIT = 100;

export type ListOrgEnrolledStudentsPageOptions = {
  limit?: number;
  offset?: number;
  filter?: StudentRosterFilter;
  search?: string;
};

export type ListOrgEnrolledStudentsPageResult = {
  students: AdminEnrolledStudentSummary[];
  totalCount: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};

function normalizeRosterFilter(filter: string | undefined): StudentRosterFilter {
  const value = filter?.trim();
  if (!value || value === "all") return "all";
  if (value === "unassigned") return "unassigned";
  return value;
}

export async function listOrgEnrolledStudentsPage(
  supabase: SupabaseClient,
  organizationId: string,
  options: ListOrgEnrolledStudentsPageOptions = {},
): Promise<ListOrgEnrolledStudentsPageResult> {
  const limit = Math.min(
    Math.max(options.limit ?? ORG_ENROLLED_STUDENTS_PAGE_DEFAULT_LIMIT, 1),
    ORG_ENROLLED_STUDENTS_PAGE_MAX_LIMIT,
  );
  const offset = Math.max(options.offset ?? 0, 0);
  const rosterFilter = normalizeRosterFilter(options.filter);
  const search = options.search?.trim() ?? "";

  const allSummaries = await listOrgEnrolledStudents(supabase, organizationId);

  let filtered = filterStudentsByRosterFilter(allSummaries, rosterFilter);
  if (search) {
    filtered = filtered.filter((student) =>
      matchesStudentSearch(
        student,
        search,
        formatStudentGrade,
        formatEnrolledStudentName,
      ),
    );
  }

  const totalCount = filtered.length;
  const pageSlice = filtered.slice(offset, offset + limit);
  const students = await mergeStudentStandingHealthFlags(
    supabase,
    organizationId,
    pageSlice,
  );

  return {
    students,
    totalCount,
    limit,
    offset,
    hasMore: offset + students.length < totalCount,
  };
}
