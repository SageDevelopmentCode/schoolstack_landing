import type { SupabaseClient } from "@supabase/supabase-js";
import { resolvePortalAccountMemberUserIds } from "@/lib/auth/portal-account-link-context";
import { isPlatformAdmin } from "@/lib/school-admin/access";

export async function userIsOrgAdminForAuthUser(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("organization_memberships")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .eq("status", "active")
    .in("role", ["owner", "admin"])
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

export async function userIsOrgAdmin(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
): Promise<boolean> {
  const memberUserIds = await resolvePortalAccountMemberUserIds(
    supabase,
    organizationId,
    userId,
  );

  for (const memberUserId of memberUserIds) {
    if (await userIsOrgAdminForAuthUser(supabase, memberUserId, organizationId)) {
      return true;
    }
  }

  return false;
}

export async function getFamilyIdsForAuthUser(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("guardians")
    .select("family_id")
    .eq("user_id", userId)
    .eq("organization_id", organizationId);

  if (error) throw error;
  return (data ?? []).map((row) => String(row.family_id));
}

export async function getFamilyIdsForUser(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
): Promise<string[]> {
  const memberUserIds = await resolvePortalAccountMemberUserIds(
    supabase,
    organizationId,
    userId,
  );
  const familyIds = new Set<string>();

  for (const memberUserId of memberUserIds) {
    const ids = await getFamilyIdsForAuthUser(
      supabase,
      memberUserId,
      organizationId,
    );
    for (const familyId of ids) {
      familyIds.add(familyId);
    }
  }

  return [...familyIds];
}

export function applicationOwnershipFilter(
  userId: string,
  familyIds: string[],
): string {
  if (familyIds.length === 0) {
    return `created_by_user_id.eq.${userId}`;
  }

  return `family_id.in.(${familyIds.join(",")}),created_by_user_id.eq.${userId}`;
}

export async function userHasApplyPortalAccess(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
): Promise<boolean> {
  const familyIds = await getFamilyIdsForUser(supabase, userId, organizationId);
  if (familyIds.length > 0) return true;

  const memberUserIds = await resolvePortalAccountMemberUserIds(
    supabase,
    organizationId,
    userId,
  );

  const { data, error } = await supabase
    .from("applications")
    .select("id")
    .eq("organization_id", organizationId)
    .in("created_by_user_id", memberUserIds)
    .limit(1);

  if (error) throw error;
  return (data ?? []).length > 0;
}

export async function userOwnsApplication(
  supabase: SupabaseClient,
  userId: string,
  applicationId: string,
): Promise<boolean> {
  const { data: application, error } = await supabase
    .from("applications")
    .select("id, family_id, created_by_user_id, organization_id")
    .eq("id", applicationId)
    .maybeSingle();

  if (error) throw error;
  if (!application) return false;

  const memberUserIds = await resolvePortalAccountMemberUserIds(
    supabase,
    String(application.organization_id),
    userId,
  );

  if (
    application.created_by_user_id &&
    memberUserIds.includes(String(application.created_by_user_id))
  ) {
    return true;
  }

  if (!application.family_id) {
    return false;
  }

  const familyIds = await getFamilyIdsForUser(
    supabase,
    userId,
    String(application.organization_id),
  );

  return familyIds.includes(String(application.family_id));
}

export async function canAccessApplicationPostSubmit(
  supabase: SupabaseClient,
  userId: string,
  applicationId: string,
): Promise<boolean> {
  return (
    (await userOwnsApplication(supabase, userId, applicationId)) ||
    (await isPlatformAdmin(supabase, userId))
  );
}

export class AuthError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "AuthError";
    this.code = code;
    this.status = status;
  }
}
