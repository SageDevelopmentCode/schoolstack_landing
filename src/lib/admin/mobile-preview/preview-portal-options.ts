import type { SupabaseClient } from "@supabase/supabase-js";
import { getFamilyIdsForUser } from "@/lib/admissions/application-auth";
import { getFamilyPreviewGuardianUserId } from "@/lib/admissions/family-preview-access";
import type { PortalId } from "@/lib/auth/portal-switcher-types";
import { listSchoolPortalOptionsForUser } from "@/lib/auth/portal-switcher-server";
import { resolvePortalAccountMemberUserIds } from "@/lib/auth/portal-account-link-context";
import { fetchOrganizationWithSettingsUncached } from "@/lib/organization-settings/fetch";
import { getMembershipPreviewContext } from "@/lib/school-admin/membership-preview-access";
import { getStaffMemberIdForUser } from "@/lib/staff/teacher-portal-access";

export type MobilePreviewPortalOptionsQuery = {
  organizationId: string;
  slug: string;
  membershipId: string | null;
  staffMemberId: string | null;
  familyId: string | null;
};

export type PreviewPortalSwitchTarget = {
  portal: "school_admin" | "teacher" | "parent";
  membershipId?: string;
  staffMemberId?: string;
  familyId?: string;
  subjectLabel: string;
};

export type MobilePreviewPortalOptionsResponse = {
  options: Awaited<ReturnType<typeof listSchoolPortalOptionsForUser>>;
  targets: Partial<Record<PortalId, PreviewPortalSwitchTarget>>;
};

export class PreviewPortalOptionsError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "PreviewPortalOptionsError";
    this.code = code;
  }
}

async function resolveSubjectUserId(
  admin: SupabaseClient,
  query: MobilePreviewPortalOptionsQuery,
): Promise<string> {
  if (query.membershipId) {
    const context = await getMembershipPreviewContext(
      admin,
      query.organizationId,
      query.membershipId,
    );
    return context.userId;
  }

  if (query.staffMemberId) {
    const { data, error } = await admin
      .from("staff_members")
      .select("user_id, organization_id")
      .eq("id", query.staffMemberId)
      .maybeSingle();

    if (error) throw error;
    if (!data || String(data.organization_id) !== query.organizationId) {
      throw new PreviewPortalOptionsError(
        "Staff member not found.",
        "not_found",
      );
    }
    const userId = data.user_id != null ? String(data.user_id) : "";
    if (!userId) {
      throw new PreviewPortalOptionsError(
        "Staff member has no linked login.",
        "not_found",
      );
    }
    return userId;
  }

  if (query.familyId) {
    const { data, error } = await admin
      .from("families")
      .select("id, organization_id")
      .eq("id", query.familyId)
      .maybeSingle();

    if (error) throw error;
    if (!data || String(data.organization_id) !== query.organizationId) {
      throw new PreviewPortalOptionsError("Family not found.", "not_found");
    }

    const userId = await getFamilyPreviewGuardianUserId(
      admin,
      query.organizationId,
      query.familyId,
    );
    if (!userId) {
      throw new PreviewPortalOptionsError(
        "Family has no linked guardian login.",
        "not_found",
      );
    }
    return userId;
  }

  throw new PreviewPortalOptionsError(
    "membershipId, staffMemberId, or familyId is required.",
    "missing_fields",
  );
}

async function resolveUserEmail(
  admin: SupabaseClient,
  userId: string,
): Promise<string> {
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error || !data.user?.email) {
    return "Preview user";
  }
  return data.user.email.trim();
}

async function resolveAdminMembershipId(
  admin: SupabaseClient,
  organizationId: string,
  sessionUserId: string,
): Promise<string | null> {
  const memberUserIds = await resolvePortalAccountMemberUserIds(
    admin,
    organizationId,
    sessionUserId,
  );

  for (const memberUserId of memberUserIds) {
    const { data, error } = await admin
      .from("organization_memberships")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("user_id", memberUserId)
      .eq("status", "active")
      .in("role", ["owner", "admin"])
      .maybeSingle();

    if (error) throw error;
    if (data?.id) {
      return String(data.id);
    }
  }

  return null;
}

async function resolveTeacherStaffMemberId(
  admin: SupabaseClient,
  organizationId: string,
  sessionUserId: string,
): Promise<string | null> {
  const memberUserIds = await resolvePortalAccountMemberUserIds(
    admin,
    organizationId,
    sessionUserId,
  );

  for (const memberUserId of memberUserIds) {
    const staffMemberId = await getStaffMemberIdForUser(
      admin,
      memberUserId,
      organizationId,
    );
    if (staffMemberId) {
      return staffMemberId;
    }
  }

  return null;
}

async function resolveParentFamilyId(
  admin: SupabaseClient,
  organizationId: string,
  sessionUserId: string,
): Promise<string | null> {
  const familyIds = await getFamilyIdsForUser(
    admin,
    sessionUserId,
    organizationId,
  );
  return familyIds[0] ?? null;
}

export async function buildMobilePreviewPortalOptions(
  admin: SupabaseClient,
  query: MobilePreviewPortalOptionsQuery,
): Promise<MobilePreviewPortalOptionsResponse> {
  const org = await fetchOrganizationWithSettingsUncached(admin, query.slug);
  if (!org || org.id !== query.organizationId) {
    throw new PreviewPortalOptionsError("School not found.", "not_found");
  }

  const sessionUserId = await resolveSubjectUserId(admin, query);
  const options = await listSchoolPortalOptionsForUser(
    admin,
    sessionUserId,
    query.slug,
    { org },
  );

  const targets: Partial<Record<PortalId, PreviewPortalSwitchTarget>> = {};

  for (const option of options) {
    if (option.id === "admin") {
      const membershipId = await resolveAdminMembershipId(
        admin,
        query.organizationId,
        sessionUserId,
      );
      if (!membershipId) continue;
      const { data: membership, error: membershipError } = await admin
        .from("organization_memberships")
        .select("user_id")
        .eq("id", membershipId)
        .maybeSingle();
      if (membershipError) throw membershipError;
      const adminUserId = membership?.user_id
        ? String(membership.user_id)
        : sessionUserId;
      targets.admin = {
        portal: "school_admin",
        membershipId,
        subjectLabel: await resolveUserEmail(admin, adminUserId),
      };
      continue;
    }

    if (option.id === "teacher") {
      const staffMemberId = await resolveTeacherStaffMemberId(
        admin,
        query.organizationId,
        sessionUserId,
      );
      if (!staffMemberId) continue;
      const { data: staffRow, error: staffError } = await admin
        .from("staff_members")
        .select("user_id, email")
        .eq("id", staffMemberId)
        .maybeSingle();
      if (staffError) throw staffError;
      let teacherLabel =
        typeof staffRow?.email === "string" ? staffRow.email.trim() : "";
      if (!teacherLabel && staffRow?.user_id) {
        teacherLabel = await resolveUserEmail(admin, String(staffRow.user_id));
      }
      targets.teacher = {
        portal: "teacher",
        staffMemberId,
        subjectLabel: teacherLabel || "Staff member",
      };
      continue;
    }

    if (option.id === "family_parent") {
      const familyId = await resolveParentFamilyId(
        admin,
        query.organizationId,
        sessionUserId,
      );
      if (!familyId) continue;
      targets.family_parent = {
        portal: "parent",
        familyId,
        subjectLabel: await resolveUserEmail(admin, sessionUserId),
      };
    }
  }

  return { options, targets };
}
