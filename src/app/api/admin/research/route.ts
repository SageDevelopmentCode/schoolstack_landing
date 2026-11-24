import { NextResponse } from "next/server";
import { withDemoOutreachAdmin } from "@/lib/admin-crm/demo-outreach-api";
import { loadResearchWorkspace } from "@/lib/admin-crm/research-workspace";

const ROUTE = "/api/admin/research";

/** Schools plus their outreach logs, for the /admin/research Refresh button. */
export async function GET(request: Request) {
  return withDemoOutreachAdmin(ROUTE, request, "Failed to load the CRM.", async ({ admin }) => {
    return NextResponse.json(await loadResearchWorkspace(admin));
  });
}
