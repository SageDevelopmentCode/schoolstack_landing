import { NextResponse } from "next/server";
import { ensureSchoolForDemo, logDemoOutreachTouch } from "@/lib/admin-crm/demo-outreach";
import { findDemo, parseOptionalDate, readJsonBody, withDemoOutreachAdmin } from "@/lib/admin-crm/demo-outreach-api";
import { isOutreachChannel, isOutreachDirection } from "@/lib/admin-crm/demo-outreach-types";
import { apiError } from "@/lib/api/route-errors";

const ROUTE = "/api/admin/demo-outreach/[slug]/touches";
const MAX_NOTE_LENGTH = 4000;

type RouteContext = { params: Promise<{ slug: string }> };

/**
 * Log an outreach touch (email, DM, call, reply…) for a demo.
 * Body: { channel, direction, note?, occurredAt?, nextFollowUpAt? }
 */
export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;

  return withDemoOutreachAdmin(ROUTE, request, "Failed to log the touch.", async ({ admin, user }) => {
    const demo = findDemo(slug);
    if (!demo) {
      return apiError(ROUTE, { request, status: 404, error: "Unknown demo.", code: "unknown_demo" });
    }

    const body = await readJsonBody(request);
    if (!body || !isOutreachChannel(body.channel) || !isOutreachDirection(body.direction)) {
      return apiError(ROUTE, { request, status: 400, error: "channel and direction are required.", code: "invalid_body" });
    }
    const note = typeof body.note === "string" ? body.note.trim() : "";
    if (note.length > MAX_NOTE_LENGTH) {
      return apiError(ROUTE, { request, status: 400, error: "Note is too long.", code: "invalid_body" });
    }
    const occurredAt = parseOptionalDate(body.occurredAt);
    const followUp = parseOptionalDate(body.nextFollowUpAt);
    if (!occurredAt.ok || !followUp.ok) {
      return apiError(ROUTE, { request, status: 400, error: "Dates must be valid dates.", code: "invalid_body" });
    }

    const school = await ensureSchoolForDemo(admin, demo);
    const outreach = await logDemoOutreachTouch(admin, school, {
      channel: body.channel,
      direction: body.direction,
      note,
      occurredAt: occurredAt.value ?? new Date().toISOString(),
      nextFollowUpAt: followUp.value,
      createdBy: user.id,
    });
    return NextResponse.json({ slug, outreach }, { status: 201 });
  });
}
