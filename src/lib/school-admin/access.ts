import type { SupabaseClient, User } from "@supabase/supabase-js";
import { userIsOrgAdmin } from "@/lib/admissions/application-auth";

export class SchoolAdminAuthError extends Error {
  code: "unauthenticated" | "forbidden";
  status: number;

  constructor(
    message: string,
    code: "unauthenticated" | "forbidden",
    status: number,
  ) {
    super(message);
    this.name = "SchoolAdminAuthError";
    this.code = code;
    this.status = status;
  }
}

export async function isPlatformAdmin(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data?.role === "admin";
}

export async function userCanAccessSchoolAdmin(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
): Promise<boolean> {
  if (await isPlatformAdmin(supabase, userId)) {
    return true;
  }

  return userIsOrgAdmin(supabase, userId, organizationId);
}

export async function canManageOrganization(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
): Promise<boolean> {
  return userCanAccessSchoolAdmin(supabase, userId, organizationId);
}

export async function requireSchoolAdminUser(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<User> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new SchoolAdminAuthError(
      "You must be signed in to continue.",
      "unauthenticated",
      401,
    );
  }

  const allowed = await userCanAccessSchoolAdmin(
    supabase,
    user.id,
    organizationId,
  );

  if (!allowed) {
    throw new SchoolAdminAuthError(
      "You do not have admin access to this school.",
      "forbidden",
      403,
    );
  }

  return user;
}

export function schoolAdminLoginPath(slug: string): string {
  return `/school/${slug}/admin/login`;
}
