import { listEventsForOrg } from "./events";
import type { ParentCalendarInitialData } from "./types";
import { createAdminClient } from "@/utils/supabase/admin";

export async function loadParentCalendarPreviewData(input: {
  organizationId: string;
}): Promise<ParentCalendarInitialData> {
  const admin = createAdminClient();
  const events = await listEventsForOrg(admin, input.organizationId);

  return { events };
}
