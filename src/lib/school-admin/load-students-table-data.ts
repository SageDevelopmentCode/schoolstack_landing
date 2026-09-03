import {
  listOrgEnrolledStudentsPage,
  ORG_ENROLLED_STUDENTS_PAGE_DEFAULT_LIMIT,
  type ListOrgEnrolledStudentsPageOptions,
} from "@/lib/school-admin/students-roster-page";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export type StudentsTableData = {
  students: Awaited<ReturnType<typeof listOrgEnrolledStudentsPage>>["students"];
  totalCount: number;
  pageSize: number;
  hasMore: boolean;
};

export async function loadStudentsTableData(
  organizationId: string,
  options: ListOrgEnrolledStudentsPageOptions = {},
): Promise<StudentsTableData> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const page = await listOrgEnrolledStudentsPage(supabase, organizationId, {
    limit: ORG_ENROLLED_STUDENTS_PAGE_DEFAULT_LIMIT,
    offset: 0,
    filter: "all",
    ...options,
  });

  return {
    students: page.students,
    totalCount: page.totalCount,
    pageSize: page.limit,
    hasMore: page.hasMore,
  };
}
