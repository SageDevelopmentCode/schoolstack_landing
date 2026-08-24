import type { SupabaseClient } from "@supabase/supabase-js";
import {
  listAssignedEnrolledStudents,
  type AdminEnrolledStudentSummary,
} from "@/lib/school-admin/enrolled-students";
import { loadTeacherMessagesInbox } from "@/lib/messages/teacher-messages";
import type { MessagesInboxData } from "@/lib/messages/types";
import type { StaffPortalRole } from "@/lib/staff/staff-members";
import type { StaffUserProfile } from "@/lib/staff/teacher-portal-access";

export function staffPreviewBasePath(
  slug: string,
  staffMemberId: string,
): string {
  return `/admin/preview/${slug}/teacher/${staffMemberId}`;
}

export function staffPreviewFeaturePath(
  slug: string,
  staffMemberId: string,
  feature: string,
): string {
  return `${staffPreviewBasePath(slug, staffMemberId)}/${feature}`;
}

type StaffMemberRow = {
  id: string;
  organization_id: string;
  user_id: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  role_title: string | null;
  profile_photo_url: string | null;
};

export type StaffPreviewContext = {
  staffMemberId: string;
  userId: string | null;
  userProfile: StaffUserProfile;
  roleTitle: string | null;
  portalRole: StaffPortalRole | null;
  membershipStatus: "invited" | "active" | "disabled" | null;
};

export async function assertStaffMemberBelongsToOrg(
  admin: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
): Promise<StaffMemberRow> {
  const { data, error } = await admin
    .from("staff_members")
    .select(
      "id, organization_id, user_id, first_name, last_name, email, role_title, profile_photo_url",
    )
    .eq("id", staffMemberId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new StaffPreviewAccessError("Staff member not found.", "not_found");
  }

  return data as StaffMemberRow;
}

export class StaffPreviewAccessError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "StaffPreviewAccessError";
    this.code = code;
  }
}

async function getMembershipForStaffUser(
  admin: SupabaseClient,
  organizationId: string,
  userId: string | null,
): Promise<{ role: string; status: string } | null> {
  if (!userId) return null;

  const { data, error } = await admin
    .from("organization_memberships")
    .select("role, status")
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    role: String(data.role),
    status: String(data.status),
  };
}

export async function getStaffPreviewProfile(
  admin: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
): Promise<StaffUserProfile> {
  const staffMember = await assertStaffMemberBelongsToOrg(
    admin,
    organizationId,
    staffMemberId,
  );

  const firstName = String(staffMember.first_name ?? "").trim();
  const lastName = String(staffMember.last_name ?? "").trim();
  let email =
    typeof staffMember.email === "string" ? staffMember.email.trim() : "";

  if (!email && staffMember.user_id) {
    const { data, error } = await admin.auth.admin.getUserById(
      String(staffMember.user_id),
    );
    if (!error && data.user?.email) {
      email = data.user.email.trim();
    }
  }

  const displayName =
    [firstName, lastName].filter(Boolean).join(" ") || email || "Staff member";

  const profilePhotoUrl =
    typeof staffMember.profile_photo_url === "string" &&
    staffMember.profile_photo_url.trim()
      ? staffMember.profile_photo_url.trim()
      : null;

  return { email, displayName, profilePhotoUrl };
}

export async function getStaffPreviewContext(
  admin: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
): Promise<StaffPreviewContext> {
  const staffMember = await assertStaffMemberBelongsToOrg(
    admin,
    organizationId,
    staffMemberId,
  );

  const userId =
    staffMember.user_id != null && String(staffMember.user_id).trim() !== ""
      ? String(staffMember.user_id)
      : null;

  const membership = await getMembershipForStaffUser(
    admin,
    organizationId,
    userId,
  );

  const portalRole =
    membership?.role === "teacher" || membership?.role === "staff"
      ? (membership.role as StaffPortalRole)
      : null;

  const membershipStatus = membership
    ? (membership.status as StaffPreviewContext["membershipStatus"])
    : null;

  const userProfile = await getStaffPreviewProfile(
    admin,
    organizationId,
    staffMemberId,
  );

  return {
    staffMemberId: String(staffMember.id),
    userId,
    userProfile,
    roleTitle:
      typeof staffMember.role_title === "string"
        ? staffMember.role_title
        : null,
    portalRole,
    membershipStatus,
  };
}

export type TeacherMyStudentsPreviewData = {
  students: AdminEnrolledStudentSummary[];
  staffMemberId: string;
};

export async function loadTeacherMyStudentsPreviewData(
  admin: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
): Promise<TeacherMyStudentsPreviewData> {
  await assertStaffMemberBelongsToOrg(admin, organizationId, staffMemberId);

  const students = await listAssignedEnrolledStudents(
    admin,
    organizationId,
    staffMemberId,
  );

  return { students, staffMemberId };
}

export async function loadTeacherMessagesPreviewInbox(
  admin: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
  schoolName: string,
): Promise<MessagesInboxData> {
  const context = await getStaffPreviewContext(
    admin,
    organizationId,
    staffMemberId,
  );

  if (!context.userId) {
    return { threads: [], contacts: [] };
  }

  return loadTeacherMessagesInbox(
    admin,
    organizationId,
    context.userId,
    staffMemberId,
    schoolName,
  );
}
