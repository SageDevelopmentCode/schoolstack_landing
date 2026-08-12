import { cookies } from "next/headers";
import { listEventsForOrg } from "./events";
import type { ParentCalendarInitialData } from "./types";
import { createClient } from "@/utils/supabase/server";

export async function loadParentCalendarInitialData(input: {
  organizationId: string;
}): Promise<ParentCalendarInitialData> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const events = await listEventsForOrg(supabase, input.organizationId);

  return { events };
}
