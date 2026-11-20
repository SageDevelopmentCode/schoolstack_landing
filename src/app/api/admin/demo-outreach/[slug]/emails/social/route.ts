import { NextResponse } from "next/server";
import { getOutreachPlan } from "@/data/outreach";
import { findDemo, outreachErrorResponse, readJsonBody, withDemoOutreachAdmin } from "@/lib/admin-crm/demo-outreach-api";
import { isOutreachChannel } from "@/lib/admin-crm/demo-outreach-types";
import { logOutreachSocialStep, OutreachSendError } from "@/lib/admin-crm/outreach-send";
import { apiError } from "@/lib/api/route-errors";

const ROUTE = "/api/admin/demo-outreach/[slug]/emails/social";

type RouteContext = { params: Promise<{ slug: string }> };

/** Mark the social note as sent by hand. Body: { channel: "instagram" | "facebook" | "linkedin" } */
export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;

  return withDemoOutreachAdmin(ROUTE, request, "Failed to log the social note.", async ({ admin, user }) => {
    const demo = findDemo(slug);
    const plan = getOutreachPlan(slug);
    if (!demo || !plan) {
      return apiError(ROUTE, { request, status: 404, error: "No outreach plan for this demo.", code: "no_plan" });
    }
    const body = await readJsonBody(request);
    if (!body || !isOutreachChannel(body.channel)) {
      return apiError(ROUTE, { request, status: 400, error: "channel is required.", code: "invalid_body" });
    }

    try {
      const outreach = await logOutreachSocialStep(admin, { demo, plan, channel: body.channel, userId: user.id });
      return NextResponse.json({ slug, outreach }, { status: 201 });
    } catch (error) {
      if (error instanceof OutreachSendError) return outreachErrorResponse(ROUTE, request, error);
      throw error;
    }
  });
}
