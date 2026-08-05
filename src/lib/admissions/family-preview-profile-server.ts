import type { SupabaseClient } from "@supabase/supabase-js";
import type { FamilyUserProfile } from "./parent-portal-access";
import { createAdminClient } from "@/utils/supabase/admin";

async function guardianHasOwnerMembership(
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
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

export async function getOwnerLinkedPreviewProfile(
  supabase: SupabaseClient,
  organizationId: string,
  familyId: string,
  guardian: {
    first_name?: string | null;
    last_name?: string | null;
    user_id?: string | null;
  },
): Promise<FamilyUserProfile | null> {
  const userId =
    typeof guardian.user_id === "string" ? guardian.user_id.trim() : "";
  if (!userId) return null;

  const isOwnerLinked = await guardianHasOwnerMembership(
    supabase,
    organizationId,
    userId,
  );
  if (!isOwnerLinked) return null;

  const admin = createAdminClient();
  const { data: authUserData, error: authError } =
    await admin.auth.admin.getUserById(userId);

  if (authError) throw authError;

  const loginEmail = authUserData.user?.email?.trim() ?? "";
  const firstName = String(guardian.first_name ?? "").trim();
  const lastName = String(guardian.last_name ?? "").trim();
  const displayName =
    [firstName, lastName].filter(Boolean).join(" ") || loginEmail || "Family";

  return { email: loginEmail, displayName };
}
