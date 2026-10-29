import type { SupabaseClient } from "@supabase/supabase-js";
import type { OrganizationMembershipRole } from "@/lib/admin/organization-memberships";
import type { StaffUserProfile } from "@/lib/staff/teacher-portal-access";

const SCHOOL_ADMIN_PREVIEW_ROLES = new Set<OrganizationMembershipRole>([
  "owner",
  "admin",
]);

type MembershipRow = {
  id: string;
  organization_id: string;
  user_id: string;
  role: string;
  status: string;
};

export class MembershipPreviewAccessError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "MembershipPreviewAccessError";
    this.code = code;
  }
}

export type MembershipPreviewContext = {
  membershipId: string;
  userId: string;
  userProfile: StaffUserProfile;
  role: OrganizationMembershipRole;
  status: "invited" | "active" | "disabled";
};

export async function assertMembershipBelongsToOrg(
  admin: SupabaseClient,
  organizationId: string,
  membershipId: string,
): Promise<MembershipRow> {
  const { data, error } = await admin
    .from("organization_memberships")
    .select("id, organization_id, user_id, role, status")
    .eq("id", membershipId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new MembershipPreviewAccessError(
      "Membership not found.",
      "not_found",
    );
  }

  const role = String(data.role) as OrganizationMembershipRole;
  if (!SCHOOL_ADMIN_PREVIEW_ROLES.has(role)) {
    throw new MembershipPreviewAccessError(
      "Membership is not a school admin role.",
      "forbidden",
    );
  }

  return data as MembershipRow;
}

async function resolveProfilePhotoUrl(
  admin: SupabaseClient,
  organizationId: string,
  userId: string,
): Promise<string | null> {
  const { data, error } = await admin
    .from("staff_members")
    .select("profile_photo_url")
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  const url = data?.profile_photo_url;
  if (typeof url === "string" && url.trim()) {
    return url.trim();
  }
  return null;
}

async function resolveMembershipUserProfile(
  admin: SupabaseClient,
  organizationId: string,
  userId: string,
): Promise<StaffUserProfile> {
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error || !data.user) {
    return {
      email: "",
      displayName: "School admin",
      profilePhotoUrl: null,
    };
  }

  const email = data.user.email?.trim() ?? "";
  const metadata = data.user.user_metadata ?? {};
  const metaFirst =
    typeof metadata.first_name === "string" ? metadata.first_name.trim() : "";
  const metaFull =
    typeof metadata.full_name === "string" ? metadata.full_name.trim() : "";
  const nameFromFull = metaFull ? metaFull.split(/\s+/)[0] : "";
  const firstName = metaFirst || nameFromFull;
  const lastName =
    typeof metadata.last_name === "string" ? metadata.last_name.trim() : "";
  const displayName =
    [firstName, lastName].filter(Boolean).join(" ") ||
    email.split("@")[0] ||
    "School admin";

  const profilePhotoUrl = await resolveProfilePhotoUrl(
    admin,
    organizationId,
    userId,
  );

  return { email, displayName, profilePhotoUrl };
}

export async function getMembershipPreviewContext(
  admin: SupabaseClient,
  organizationId: string,
  membershipId: string,
): Promise<MembershipPreviewContext> {
  const membership = await assertMembershipBelongsToOrg(
    admin,
    organizationId,
    membershipId,
  );

  const userId = String(membership.user_id);
  const userProfile = await resolveMembershipUserProfile(
    admin,
    organizationId,
    userId,
  );

  return {
    membershipId: String(membership.id),
    userId,
    userProfile,
    role: membership.role as OrganizationMembershipRole,
    status: membership.status as MembershipPreviewContext["status"],
  };
}
