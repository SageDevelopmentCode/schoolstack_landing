import type { SupabaseClient } from "@supabase/supabase-js";

export type TuitionSetupStatus = {
  hasActiveRatePlan: boolean;
  activeRatePlanCount: number;
  hasPrograms: boolean;
  familiesWithBillingCount: number;
};

export async function fetchTuitionSetupStatus(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<TuitionSetupStatus> {
  const [
    { count: activeRatePlanCount, error: ratePlanError },
    { count: programCount, error: programError },
    { count: assignmentCount, error: assignmentError },
  ] = await Promise.all([
    supabase
      .from("tuition_rate_plans")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("status", "active"),
    supabase
      .from("programs")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId),
    supabase
      .from("tuition_enrollment_assignments")
      .select("family_id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("status", "active"),
  ]);

  if (ratePlanError) throw ratePlanError;
  if (programError) throw programError;
  if (assignmentError) throw assignmentError;

  const active = activeRatePlanCount ?? 0;

  return {
    hasActiveRatePlan: active > 0,
    activeRatePlanCount: active,
    hasPrograms: (programCount ?? 0) > 0,
    familiesWithBillingCount: assignmentCount ?? 0,
  };
}
