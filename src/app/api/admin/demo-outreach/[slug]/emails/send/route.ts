import { NextResponse } from "next/server";
import { getOutreachPlan } from "@/data/outreach";
import { findDemo, outreachErrorResponse, readJsonBody, withDemoOutreachAdmin } from "@/lib/admin-crm/demo-outreach-api";
import { OutreachSendError, sendOutreachEmail } from "@/lib/admin-crm/outreach-send";
import { apiError } from "@/lib/api/route-errors";

const ROUTE = "/api/admin/demo-outreach/[slug]/emails/send";

type RouteContext = { params: Promise<{ slug: string }> };

/**
 * Send one outreach email through Zoho (after a preview in the admin).
 * Body: { stepId, toEmail, subject?, body, factsChecked }
 */
export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;

  return withDemoOutreachAdmin(ROUTE, request, "Failed to send the email.", async ({ admin, user }) => {
    const demo = findDemo(slug);
    const plan = getOutreachPlan(slug);
    if (!demo || !plan) {
      return apiError(ROUTE, { request, status: 404, error: "No outreach plan for this demo.", code: "no_plan" });
    }
    const body = await readJsonBody(request);
    if (!body || typeof body.stepId !== "string" || typeof body.body !== "string" || typeof body.toEmail !== "string") {
      return apiError(ROUTE, { request, status: 400, error: "stepId, toEmail and body are required.", code: "invalid_body" });
    }

    try {
      const result = await sendOutreachEmail(admin, {
        demo,
        plan,
        draft: { stepId: body.stepId, subject: typeof body.subject === "string" ? body.subject : undefined, body: body.body },
        toEmail: body.toEmail,
        factsChecked: body.factsChecked === true,
        userId: user.id,
      });
      return NextResponse.json({ slug, ...result });
    } catch (error) {
      if (error instanceof OutreachSendError) return outreachErrorResponse(ROUTE, request, error);
      throw error;
    }
  });
}
