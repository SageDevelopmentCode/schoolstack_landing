import { ResearchWorkspace } from "@/components/admin/research/ResearchWorkspace";
import { loadResearchWorkspace } from "@/lib/admin-crm/research-workspace";
import type { ResearchWorkspaceData } from "@/lib/admin-crm/research-types";
import { createAdminClient } from "@/utils/supabase/admin";

// Statuses and sends change constantly, so never serve a cached copy.
export const dynamic = "force-dynamic";

export default async function AdminResearchPage() {
  let data: ResearchWorkspaceData = { schools: [], outreach: {} };
  let loadError: string | null = null;
  try {
    data = await loadResearchWorkspace(createAdminClient());
  } catch (error) {
    loadError = error instanceof Error ? error.message : "unknown error";
    console.error("[admin/research] failed to load the CRM", error);
  }
  return <ResearchWorkspace initial={data} loadError={loadError} />;
}
