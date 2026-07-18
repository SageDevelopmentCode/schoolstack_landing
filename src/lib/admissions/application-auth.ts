import type { SupabaseClient, User } from "@supabase/supabase-js";
import { isPlatformAdmin } from "@/lib/school-admin/access";

export async function userIsOrgAdmin(
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

export async function getFamilyIdsForUser(
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

export function applicationOwnershipFilter(
  userId: string,
  familyIds: string[],
): string {
  if (familyIds.length === 0) {
    return `created_by_user_id.eq.${userId}`;
  }

  return `family_id.in.(${familyIds.join(",")}),created_by_user_id.eq.${userId}`;
}

export async function userOwnsApplication(
  supabase: SupabaseClient,
  userId: string,
  applicationId: string,
): Promise<boolean> {
  const { data: application, error } = await supabase
    .from("applications")
    .select("id, family_id, created_by_user_id")
    .eq("id", applicationId)
    .maybeSingle();

  if (error) throw error;
  if (!application) return false;

  if (application.created_by_user_id === userId) {
    return true;
  }

  if (!application.family_id) {
    return false;
  }

  const { data: guardian, error: guardianError } = await supabase
    .from("guardians")
    .select("id")
    .eq("family_id", application.family_id)
    .eq("user_id", userId)
    .maybeSingle();

  if (guardianError) throw guardianError;
  return Boolean(guardian);
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

export async function requireAuthenticatedUser(
  supabase: SupabaseClient,
): Promise<User> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AuthError("You must be signed in to continue.", "unauthenticated", 401);
  }

  return user;
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
