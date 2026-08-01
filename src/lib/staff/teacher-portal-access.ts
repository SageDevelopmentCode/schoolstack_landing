import type { SupabaseClient, User } from "@supabase/supabase-js";

export type StaffUserProfile = {
  email: string;
  displayName: string;
};

export class TeacherPortalAuthError extends Error {
  code: "unauthenticated" | "forbidden";
  status: number;

  constructor(
    message: string,
    code: "unauthenticated" | "forbidden",
    status: number,
  ) {
    super(message);
    this.name = "TeacherPortalAuthError";
    this.code = code;
    this.status = status;
  }
}

const TEACHER_PORTAL_ROLES = new Set(["teacher", "staff"]);

export async function userHasTeacherPortalAccess(
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
    .in("role", ["teacher", "staff"])
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

export async function getStaffUserProfile(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
  user: User,
): Promise<StaffUserProfile> {
  const { data: staffMember, error } = await supabase
    .from("staff_members")
    .select("first_name, last_name, email")
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw error;

  const metadata = user.user_metadata ?? {};
  const metadataFirstName =
    typeof metadata.first_name === "string" ? metadata.first_name.trim() : "";
  const metadataLastName =
    typeof metadata.last_name === "string" ? metadata.last_name.trim() : "";

  const staffFirstName = String(staffMember?.first_name ?? "").trim();
  const staffLastName = String(staffMember?.last_name ?? "").trim();
  const firstName = staffFirstName || metadataFirstName;
  const lastName = staffLastName || metadataLastName;

  const email =
    user.email?.trim() ||
    (typeof staffMember?.email === "string" ? staffMember.email.trim() : "") ||
    "";

  const displayName =
    [firstName, lastName].filter(Boolean).join(" ") || email || "Account";

  return { email, displayName };
}

export async function requireTeacherPortalUser(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<User> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new TeacherPortalAuthError(
      "You must be signed in to continue.",
      "unauthenticated",
      401,
    );
  }

  const allowed = await userHasTeacherPortalAccess(
    supabase,
    user.id,
    organizationId,
  );

  if (!allowed) {
    throw new TeacherPortalAuthError(
      "You do not have staff access to this school.",
      "forbidden",
      403,
    );
  }

  return user;
}

export function isTeacherPortalRole(role: string): boolean {
  return TEACHER_PORTAL_ROLES.has(role);
}
