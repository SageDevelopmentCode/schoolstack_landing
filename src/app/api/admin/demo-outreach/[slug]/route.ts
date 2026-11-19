import { NextResponse } from "next/server";
import { isCrmStatus } from "@/lib/admin-crm/crm-status";
import { ensureSchoolForDemo, updateDemoOutreach } from "@/lib/admin-crm/demo-outreach";
import { findDemo, parseOptionalDate, readJsonBody, withDemoOutreachAdmin } from "@/lib/admin-crm/demo-outreach-api";
import { apiError } from "@/lib/api/route-errors";

const ROUTE = "/api/admin/demo-outreach/[slug]";

type RouteContext = { params: Promise<{ slug: string }> };

/** Set a demo's outreach status and/or next follow-up date. Body: { crmStatus?, nextFollowUpAt? } */
export async function PATCH(request: Request, context: RouteContext) {
  const { slug } = await context.params;

  return withDemoOutreachAdmin(ROUTE, request, "Failed to update the demo's outreach.", async ({ admin }) => {
    const demo = findDemo(slug);
    if (!demo) {
      return apiError(ROUTE, { request, status: 404, error: "Unknown demo.", code: "unknown_demo" });
    }

    const body = await readJsonBody(request);
    if (!body) {
      return apiError(ROUTE, { request, status: 400, error: "Invalid JSON body.", code: "invalid_body" });
    }
    if (body.crmStatus !== undefined && !isCrmStatus(body.crmStatus)) {
      return apiError(ROUTE, { request, status: 400, error: "Unknown status.", code: "invalid_body" });
    }
    const followUp = parseOptionalDate(body.nextFollowUpAt);
    if (!followUp.ok) {
      return apiError(ROUTE, { request, status: 400, error: "nextFollowUpAt must be a date or null.", code: "invalid_body" });
    }

    const school = await ensureSchoolForDemo(admin, demo);
    const outreach = await updateDemoOutreach(admin, school.id, {
      crmStatus: isCrmStatus(body.crmStatus) ? body.crmStatus : undefined,
      nextFollowUpAt: followUp.value,
    });
    return NextResponse.json({ slug, outreach });
  });
}
