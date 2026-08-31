import { cookies } from "next/headers";
import { listEventsForOrg } from "./events";
import type { ParentCalendarInitialData } from "./types";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export async function loadTeacherCalendarInitialData(input: {
  organizationId: string;
}): Promise<ParentCalendarInitialData> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const events = await listEventsForOrg(supabase, input.organizationId);

  return { events };
}

export async function loadTeacherCalendarPreviewData(input: {
  organizationId: string;
}): Promise<ParentCalendarInitialData> {
  const admin = createAdminClient();
  const events = await listEventsForOrg(admin, input.organizationId);

  return { events };
}
