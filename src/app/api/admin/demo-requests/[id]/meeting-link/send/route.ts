import { NextResponse } from "next/server";
import { readJsonBody, withDemoOutreachAdmin } from "@/lib/admin-crm/demo-outreach-api";
import { loadDemoRequestForMeetingLink, parseMeetingLink } from "@/lib/admin/demo-meeting-link";
import { apiError } from "@/lib/api/route-errors";
import { sendDemoMeetingLinkEmail } from "@/lib/emails";

const ROUTE = "/api/admin/demo-requests/[id]/meeting-link/send";

type RouteContext = { params: Promise<{ id: string }> };

/** Emails the prospect their meeting link (with an updated calendar invite) and records it. Body: { meetingLink } */
export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;

  return withDemoOutreachAdmin(ROUTE, request, "Failed to send the meeting link.", async ({ admin }) => {
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

    const result = await sendDemoMeetingLinkEmail({ ...demo, meetingLink });
    if (!result.success) {
      return apiError(ROUTE, {
        request,
        status: 502,
        error: result.error ? `Email failed: ${result.error}` : "Email failed to send.",
        code: "send_failed",
      });
    }
    if (result.skipped) {
      return apiError(ROUTE, {
        request,
        status: 409,
        error: "Not sent: this address has unsubscribed.",
        code: "unsubscribed",
      });
    }

    const sentAt = new Date().toISOString();
    const { error } = await admin
      .from("demo_requests")
      .update({ meeting_link: meetingLink, meeting_link_sent_at: sentAt })
      .eq("id", id);
    if (error) {
      // The email is out; only the bookkeeping failed (e.g. the meeting_link migration isn't applied yet).
      return NextResponse.json({
        meetingLink,
        meetingLinkSentAt: sentAt,
        warning: `Email sent, but saving the sent status failed: ${error.message}`,
      });
    }

    return NextResponse.json({ meetingLink, meetingLinkSentAt: sentAt });
  });
}
