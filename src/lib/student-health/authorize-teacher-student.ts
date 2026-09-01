import type { SupabaseClient, User } from "@supabase/supabase-js";
import {
  loadTeacherAssignedStudentDetail,
  loadTeacherMessageableFamilyStudentDetail,
} from "@/lib/school-admin/enrolled-students";
import {
  getStaffMemberIdForUser,
  getStaffUserProfile,
  requireTeacherPortalUser,
  type StaffUserProfile,
} from "@/lib/staff/teacher-portal-access";

export async function authorizeTeacherStudentHealthAccess(
  supabase: SupabaseClient,
  user: User,
  organizationId: string,
  studentId: string,
): Promise<
  | { ok: true; staffMemberId: string; actor: StaffUserProfile }
  | { ok: false; reason: "forbidden" | "no_staff_record" }
> {
  await requireTeacherPortalUser(supabase, organizationId);

  const staffMemberId = await getStaffMemberIdForUser(
    supabase,
    user.id,
    organizationId,
  );

  if (!staffMemberId) {
    return { ok: false, reason: "no_staff_record" };
  }

  const [assignedDetail, messageableDetail] = await Promise.all([
    loadTeacherAssignedStudentDetail(
      supabase,
      organizationId,
      staffMemberId,
      studentId,
    ),
    loadTeacherMessageableFamilyStudentDetail(
      supabase,
      organizationId,
      staffMemberId,
      studentId,
    ),
  ]);

  if (!assignedDetail && !messageableDetail) {
    return { ok: false, reason: "forbidden" };
  }

  const actor = await getStaffUserProfile(supabase, user.id, organizationId, user);

  return { ok: true, staffMemberId, actor };
}
