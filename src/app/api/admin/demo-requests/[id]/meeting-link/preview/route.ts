import { NextResponse } from "next/server";
import { readJsonBody, withDemoOutreachAdmin } from "@/lib/admin-crm/demo-outreach-api";
import { loadDemoRequestForMeetingLink, parseMeetingLink } from "@/lib/admin/demo-meeting-link";
import { apiError } from "@/lib/api/route-errors";
import { buildDemoMeetingLinkHtml, demoMeetingLinkEmailSubject } from "@/lib/emails";

const ROUTE = "/api/admin/demo-requests/[id]/meeting-link/preview";

type RouteContext = { params: Promise<{ id: string }> };

/** The meeting-link email exactly as it will be sent. Body: { meetingLink } */
export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;

  return withDemoOutreachAdmin(ROUTE, request, "Failed to build the preview.", async ({ admin }) => {
    const body = await readJsonBody(request);
    const meetingLink = parseMeetingLink(body?.meetingLink);
    if (!meetingLink) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Enter a full meeting link starting with https://",
        code: "invalid_meeting_link",
      });
    }

    const demo = await loadDemoRequestForMeetingLink(admin, id);
    if (!demo) {
      return apiError(ROUTE, { request, status: 404, error: "Demo request not found.", code: "not_found" });
    }

    const payload = { ...demo, meetingLink };
    return NextResponse.json({
      to: demo.email,
      subject: demoMeetingLinkEmailSubject(payload),
      html: buildDemoMeetingLinkHtml(payload),
    });
  });
}
