import type { SupabaseClient } from "@supabase/supabase-js";
import { ACTIVITY_ACTIONS } from "@/lib/activity-log";

export async function hasAchVerificationOpsBeenNotified(
  admin: SupabaseClient,
  organizationId: string,
  primaryPaymentId: string,
): Promise<boolean> {
  const { data, error } = await admin
    .from("activity_events")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("action", ACTIVITY_ACTIONS.PAYMENT_ACH_VERIFICATION_REQUIRED)
    .eq("entity_id", primaryPaymentId)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data?.id);
}
