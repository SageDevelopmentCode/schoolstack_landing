import { NextResponse } from "next/server";
import { getOutreachPlan } from "@/data/outreach";
import { getSchoolForDemo } from "@/lib/admin-crm/demo-outreach";
import { findDemo, outreachErrorResponse, readJsonBody, withDemoOutreachAdmin } from "@/lib/admin-crm/demo-outreach-api";
import { OutreachSendError, previewOutreachEmail } from "@/lib/admin-crm/outreach-send";
import { apiError } from "@/lib/api/route-errors";

const ROUTE = "/api/admin/demo-outreach/[slug]/emails/preview";

type RouteContext = { params: Promise<{ slug: string }> };

/** Exactly what an outreach email will look like, plus content warnings. Body: { stepId, subject?, body } */
export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;

  return withDemoOutreachAdmin(ROUTE, request, "Failed to build the preview.", async ({ admin }) => {
    const demo = findDemo(slug);
    const plan = getOutreachPlan(slug);
    if (!demo || !plan) {
      return apiError(ROUTE, { request, status: 404, error: "No outreach plan for this demo.", code: "no_plan" });
    }
    const body = await readJsonBody(request);
    if (!body || typeof body.stepId !== "string" || typeof body.body !== "string") {
      return apiError(ROUTE, { request, status: 400, error: "stepId and body are required.", code: "invalid_body" });
    }

    try {
      const school = await getSchoolForDemo(admin, slug);
      const preview = await previewOutreachEmail(admin, {
        plan,
        schoolId: school?.id ?? null,
        draft: { stepId: body.stepId, subject: typeof body.subject === "string" ? body.subject : undefined, body: body.body },
      });
      return NextResponse.json(preview);
    } catch (error) {
      if (error instanceof OutreachSendError) return outreachErrorResponse(ROUTE, request, error);
      throw error;
    }
  });
}
