import type { SupabaseClient } from "@supabase/supabase-js";
import {
  listOrgScheduledVisitsForAdminList,
  type AdminScheduledVisit,
} from "@/lib/admissions/admin-scheduled-visits";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export type ScheduleVisitsData = {
  visits: AdminScheduledVisit[];
};

export async function loadScheduleVisitsDataWithClient(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<ScheduleVisitsData> {
  const visits = await listOrgScheduledVisitsForAdminList(supabase, organizationId);
  return { visits };
}

export async function loadScheduleVisitsData(
  organizationId: string,
): Promise<ScheduleVisitsData> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  return loadScheduleVisitsDataWithClient(supabase, organizationId);
}
