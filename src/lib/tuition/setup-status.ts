import type { SupabaseClient } from "@supabase/supabase-js";

export type TuitionSetupStatus = {
  hasActiveRatePlan: boolean;
  activeRatePlanCount: number;
  hasPrograms: boolean;
  familiesWithBillingCount: number;
  hasDraftRatePlan: boolean;
  draftRatePlanId: string | null;
};

export async function fetchTuitionSetupStatus(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<TuitionSetupStatus> {
  const [
    { count: activeRatePlanCount, error: ratePlanError },
    { data: draftPlan, error: draftError },
    { count: programCount, error: programError },
    { count: assignmentCount, error: assignmentError },
  ] = await Promise.all([
    supabase
      .from("tuition_rate_plans")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("status", "active"),
    supabase
      .from("tuition_rate_plans")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("status", "draft")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
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
  if (draftError) throw draftError;
  if (programError) throw programError;
  if (assignmentError) throw assignmentError;

  const active = activeRatePlanCount ?? 0;
  const draftRatePlanId = draftPlan?.id ? String(draftPlan.id) : null;

  return {
    hasActiveRatePlan: active > 0,
    activeRatePlanCount: active,
    hasPrograms: (programCount ?? 0) > 0,
    familiesWithBillingCount: assignmentCount ?? 0,
    hasDraftRatePlan: draftRatePlanId != null,
    draftRatePlanId,
  };
}
