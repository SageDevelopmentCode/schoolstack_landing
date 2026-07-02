import { cookies } from "next/headers";
import RootedMeadowsTimelinePage from "@/components/timeline/rooted-meadows/RootedMeadowsTimelinePage";
import { fetchOrganizationProgressLog } from "@/lib/organization-progress";
import { createClient } from "@/utils/supabase/server";

const ROOTED_MEADOWS_ORG_SLUG = "rooted-meadows-school";

export default async function RootedMeadowsTimelineRoutePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const progressEntries = await fetchOrganizationProgressLog(
    supabase,
    ROOTED_MEADOWS_ORG_SLUG,
  );

  return (
    <RootedMeadowsTimelinePage progressEntries={progressEntries} />
  );
}
