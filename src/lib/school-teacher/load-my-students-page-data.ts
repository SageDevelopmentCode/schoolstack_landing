import {
  listAssignedEnrolledStudents,
  type AdminEnrolledStudentSummary,
} from "@/lib/school-admin/enrolled-students";
import { mergeStudentStandingHealthFlags } from "@/lib/school-admin/merge-student-standing-health-flags";
import { getStaffMemberIdForUser } from "@/lib/staff/teacher-portal-access";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export type TeacherMyStudentsPageData = {
  students: AdminEnrolledStudentSummary[];
  staffMemberId: string | null;
};

export async function loadTeacherMyStudentsPageData(
  organizationId: string,
  userId: string,
): Promise<TeacherMyStudentsPageData> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const staffMemberId = await getStaffMemberIdForUser(
    supabase,
    userId,
    organizationId,
  );

  if (!staffMemberId) {
    return { students: [], staffMemberId: null };
  }

  const students = await listAssignedEnrolledStudents(
    supabase,
    organizationId,
    staffMemberId,
  );

  const withFlags = await mergeStudentStandingHealthFlags(
    supabase,
    organizationId,
    students,
  );

  return { students: withFlags, staffMemberId };
}
