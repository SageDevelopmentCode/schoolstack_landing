import type { SupabaseClient } from "@supabase/supabase-js";
import { ApplicationDraftError } from "./application-draft";

export async function loadApplicationSummary(
  supabase: SupabaseClient,
  applicationId: string,
): Promise<{ status: string; feeStatus: string } | null> {
  const { data, error } = await supabase
    .from("applications")
    .select("status, fee_status")
    .eq("id", applicationId)
    .maybeSingle();

  if (error) {
    throw new ApplicationDraftError(error.message, "load_failed");
  }

  if (!data) return null;

  return {
    status: String(data.status),
    feeStatus: String(data.fee_status),
  };
}
