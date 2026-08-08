import type { SupabaseClient } from "@supabase/supabase-js";
import { ACTIVITY_ACTIONS } from "@/lib/activity-log";

export async function getRecentAutopayFailureForFamily(
  supabase: SupabaseClient,
  input: { organizationId: string; familyId: string },
): Promise<{ createdAt: string; summary: string } | null> {
  const { data, error } = await supabase
    .from("activity_events")
    .select("created_at, summary")
    .eq("organization_id", input.organizationId)
    .eq("action", ACTIVITY_ACTIONS.TUITION_AUTOPAY_FAILED)
    .contains("metadata", { familyId: input.familyId })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    createdAt: String(data.created_at),
    summary: String(data.summary),
  };
}
