import type { SupabaseClient } from "@supabase/supabase-js";
import {
  parseSupportRequestStatus,
  type AdminSupportRequestRow,
} from "@/lib/school-admin/support-request-types";

export async function fetchOrganizationSupportRequests(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<AdminSupportRequestRow[]> {
  const { data, error } = await supabase
    .from("admin_support_requests")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    ...row,
    status: parseSupportRequestStatus(row.status) ?? "open",
    attachments: Array.isArray(row.attachments) ? row.attachments : [],
    updated_at: row.updated_at ?? row.created_at,
  })) as AdminSupportRequestRow[];
}
