import type { SupabaseClient } from "@supabase/supabase-js";
import { AuthError } from "@/lib/admissions/application-auth";

export async function requireTuitionOrgAdmin(
  admin: SupabaseClient,
  organizationId: string,
  userId: string,
): Promise<void> {
  const { data: membership, error } = await admin
    .from("organization_memberships")
    .select("role")
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (error) throw error;
  if (membership?.role !== "owner" && membership?.role !== "admin") {
    throw new AuthError("Admin access required.", "forbidden", 403);
  }
}
