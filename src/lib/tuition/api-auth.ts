import type { SupabaseClient } from "@supabase/supabase-js";
import { AuthError } from "@/lib/admissions/application-auth";
import { userCanAccessSchoolAdmin } from "@/lib/school-admin/access";

export async function requireTuitionOrgAdmin(
  admin: SupabaseClient,
  organizationId: string,
  userId: string,
): Promise<void> {
  const allowed = await userCanAccessSchoolAdmin(admin, userId, organizationId);
  if (!allowed) {
    throw new AuthError("Admin access required.", "forbidden", 403);
  }
}
