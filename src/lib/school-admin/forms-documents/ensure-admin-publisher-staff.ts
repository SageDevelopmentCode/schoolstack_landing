import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getSchoolAdminUserProfile } from "@/lib/school-admin/access";
import { getStaffMemberIdForUser } from "@/lib/staff/teacher-portal-access";

function splitDisplayName(displayName: string): { firstName: string; lastName: string } {
  const trimmed = displayName.trim();
  if (!trimmed) {
    return { firstName: "School", lastName: "Admin" };
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "Admin" };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

function resolveStaffName(user: User): { firstName: string; lastName: string } {
  const metadata = user.user_metadata ?? {};
  const metadataFirstName =
    typeof metadata.first_name === "string" ? metadata.first_name.trim() : "";
  const metadataLastName =
    typeof metadata.last_name === "string" ? metadata.last_name.trim() : "";

  if (metadataFirstName || metadataLastName) {
    return {
      firstName: metadataFirstName || "School",
      lastName: metadataLastName || "Admin",
    };
  }

  const { displayName } = getSchoolAdminUserProfile(user);
  return splitDisplayName(displayName);
}

export async function ensureStaffMemberIdForSchoolAdminPublisher(
  admin: SupabaseClient,
  user: User,
  organizationId: string,
): Promise<string> {
  const existingStaffMemberId = await getStaffMemberIdForUser(
    admin,
    user.id,
    organizationId,
  );
  if (existingStaffMemberId) {
    return existingStaffMemberId;
  }

  const { firstName, lastName } = resolveStaffName(user);
  const email = user.email?.trim() || null;

  const { data, error } = await admin
    .from("staff_members")
    .insert({
      organization_id: organizationId,
      user_id: user.id,
      first_name: firstName,
      last_name: lastName,
      email,
      role_title: "School admin",
      status: "active",
    })
    .select("id")
    .single();

  if (error) {
    const retryStaffMemberId = await getStaffMemberIdForUser(
      admin,
      user.id,
      organizationId,
    );
    if (retryStaffMemberId) {
      return retryStaffMemberId;
    }
    throw error;
  }

  return String(data.id);
}
