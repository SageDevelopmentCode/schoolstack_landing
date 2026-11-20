import type { SupabaseClient } from "@supabase/supabase-js";
import { isScheduleItemId, isScheduleStatus, type ScheduleStatus } from "@/lib/marketing/social-schedule";

export type SchedulePostStatus = { status: ScheduleStatus; updatedAt: string | null };

type SchedulePostRow = { item_id: string; status: string; updated_at: string | null };

/** Saved statuses by schedule item id. Items without a row are "planned" (callers default them). */
export async function listSchedulePostStatuses(supabase: SupabaseClient): Promise<Record<string, SchedulePostStatus>> {
  const { data, error } = await supabase.from("website_marketing_schedule_posts").select("item_id, status, updated_at");
  if (error) throw error;

  const statuses: Record<string, SchedulePostStatus> = {};
  for (const row of (data ?? []) as SchedulePostRow[]) {
    if (!isScheduleItemId(row.item_id) || !isScheduleStatus(row.status)) continue;
    statuses[row.item_id] = { status: row.status, updatedAt: row.updated_at };
  }
  return statuses;
}

export async function setSchedulePostStatus(
  supabase: SupabaseClient,
  itemId: string,
  status: ScheduleStatus,
): Promise<SchedulePostStatus> {
  const { data, error } = await supabase
    .from("website_marketing_schedule_posts")
    .upsert({ item_id: itemId, status }, { onConflict: "item_id" })
    .select("status, updated_at")
    .single();
  if (error) throw error;

  const row = data as Pick<SchedulePostRow, "status" | "updated_at">;
  return { status: isScheduleStatus(row.status) ? row.status : status, updatedAt: row.updated_at };
}
