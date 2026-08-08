import {
  listOrgEnrolledStudents,
  type AdminEnrolledStudentSummary,
} from "@/lib/school-admin/enrolled-students";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export type StudentsPageData = {
  students: AdminEnrolledStudentSummary[];
};

export async function loadStudentsPageData(
  organizationId: string,
): Promise<StudentsPageData> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const students = await listOrgEnrolledStudents(supabase, organizationId);

  return { students };
}
