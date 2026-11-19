import { DemoOutreachBoard } from "@/components/admin/demos/DemoOutreachBoard";
import { listSchoolDemos } from "@/data/school-demos";
import { listDemoOutreach } from "@/lib/admin-crm/demo-outreach";
import type { DemoOutreach } from "@/lib/admin-crm/demo-outreach-types";
import { createAdminClient } from "@/utils/supabase/admin";

// Outreach statuses change constantly, so never serve a cached copy.
export const dynamic = "force-dynamic";

export default async function AdminDemosPage() {
  const demos = listSchoolDemos();

  let outreach: Record<string, DemoOutreach> = {};
  let loadError: string | null = null;
  try {
    outreach = await listDemoOutreach(createAdminClient());
  } catch (error) {
    loadError = error instanceof Error ? error.message : "unknown error";
    console.error("[admin/demos] failed to load demo outreach", error);
  }

  return <DemoOutreachBoard demos={demos} initialOutreach={outreach} loadError={loadError} />;
}
