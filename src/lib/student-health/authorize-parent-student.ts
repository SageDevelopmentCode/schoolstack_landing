import type { SupabaseClient, User } from "@supabase/supabase-js";
import { userIsGuardianForStudent } from "@/lib/admissions/parent-portal-access";
import { resolveParentGuardianForOrg } from "@/lib/committees/parent-committees";

export async function authorizeParentStudentHealthAccess(
  supabase: SupabaseClient,
  user: User,
  organizationId: string,
  studentId: string,
) {
  const isGuardian = await userIsGuardianForStudent(
    supabase,
    user.id,
    organizationId,
    studentId,
  );

  if (!isGuardian) {
    return { ok: false as const, reason: "forbidden" as const };
  }

  const guardian = await resolveParentGuardianForOrg(
    supabase,
    user.id,
    organizationId,
    user.email ?? "",
  );

  return {
    ok: true as const,
    guardian,
  };
}
