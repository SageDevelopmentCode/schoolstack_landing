import type { SupabaseClient, User } from "@supabase/supabase-js";
import { userCanAccessSchoolAdmin } from "@/lib/school-admin/access";
import {
  resolveRequestAccessToken,
  signedInErrorMessage,
} from "@/lib/supabase/bearer-token";
import {
  loadOrganizationScheduleSettings,
  userCanManageOrganizationEvents,
} from "@/lib/school-events/schedule-settings";
import { createAdminClient } from "@/utils/supabase/admin";

export class OrganizationEventManageAuthError extends Error {
  code: "unauthenticated" | "forbidden";
  status: number;

  constructor(
    message: string,
    code: "unauthenticated" | "forbidden",
    status: number,
  ) {
    super(message);
    this.name = "OrganizationEventManageAuthError";
    this.code = code;
    this.status = status;
  }
}

export async function resolveCanManageOrganizationEvents(input: {
  organizationId: string;
  staffMemberId: string | null;
  membershipRole: string | null;
  membershipStatus: string | null;
  isOrgAdmin?: boolean;
}): Promise<boolean> {
  const admin = createAdminClient();
  const settings = await loadOrganizationScheduleSettings(
    admin,
    input.organizationId,
  );

  return userCanManageOrganizationEvents(settings.event_permissions, {
    isOrgAdmin: input.isOrgAdmin,
    membershipRole: input.membershipRole,
    staffMemberId: input.staffMemberId,
    membershipStatus: input.membershipStatus,
  });
}

export async function userHasOrganizationEventManageAccess(input: {
  organizationId: string;
  userId: string;
}): Promise<boolean> {
  const admin = createAdminClient();
  const isSchoolAdmin = await userCanAccessSchoolAdmin(
    admin,
    input.userId,
    input.organizationId,
  );
  if (isSchoolAdmin) return true;

  const [membershipResult, staffMemberResult] = await Promise.all([
    admin
      .from("organization_memberships")
      .select("role, status")
      .eq("organization_id", input.organizationId)
      .eq("user_id", input.userId)
      .eq("status", "active")
      .in("role", ["teacher", "staff"])
      .maybeSingle(),
    admin
      .from("staff_members")
      .select("id")
      .eq("organization_id", input.organizationId)
      .eq("user_id", input.userId)
      .maybeSingle(),
  ]);

  if (membershipResult.error) throw membershipResult.error;
  if (staffMemberResult.error) throw staffMemberResult.error;

  return resolveCanManageOrganizationEvents({
    organizationId: input.organizationId,
    staffMemberId: staffMemberResult.data?.id
      ? String(staffMemberResult.data.id)
      : null,
    membershipRole: membershipResult.data?.role
      ? String(membershipResult.data.role)
      : null,
    membershipStatus: membershipResult.data?.status
      ? String(membershipResult.data.status)
      : null,
  });
}

export async function programBelongsToOrganization(
  admin: SupabaseClient,
  organizationId: string,
  programId: string,
): Promise<boolean> {
  const { data, error } = await admin
    .from("programs")
    .select("id")
    .eq("id", programId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

export async function requireCanManageOrganizationEvents(
  supabase: SupabaseClient,
  organizationId: string,
  request?: Request,
): Promise<User> {
  const accessToken = request ? await resolveRequestAccessToken(request) : null;
  const {
    data: { user },
    error,
  } = accessToken
    ? await supabase.auth.getUser(accessToken)
    : await supabase.auth.getUser();

  if (error || !user) {
    throw new OrganizationEventManageAuthError(
      signedInErrorMessage(accessToken, error),
      "unauthenticated",
      401,
    );
  }

  const allowed = await userHasOrganizationEventManageAccess({
    organizationId,
    userId: user.id,
  });

  if (!allowed) {
    throw new OrganizationEventManageAuthError(
      "You do not have permission to manage this school's calendar.",
      "forbidden",
      403,
    );
  }

  return user;
}
