import { apiError } from "@/lib/api/route-errors";
import { portalRouteErrorStatus } from "@/lib/api/portal-route-errors";
import {
  handleRecordCommitteeActivity,
  type RecordCommitteeActivityBody,
} from "@/lib/committees/api/committee-record-activity-route";
import { getTeacherCommitteeWorkspace } from "@/lib/committees/teacher-committees";
import { TeacherPortalAuthError } from "@/lib/staff/teacher-portal-access";
import { requireTeacherPortalUser } from "@/lib/staff/teacher-portal-access-server";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/teacher-portal/committees/[committeeId]/record-activity";

type RouteContext = { params: Promise<{ committeeId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const supabase = await createClientFromRequest(request);
  const { committeeId } = await context.params;

  let body: RecordCommitteeActivityBody;
  try {
    body = await request.json();
  } catch {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid request body.",
      code: "invalid_body",
    });
  }

  const organizationId = body.organizationId?.trim() ?? "";
  if (!organizationId || !committeeId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  try {
    const user = await requireTeacherPortalUser(supabase, organizationId, request);
    const admin = createAdminClient();
    await getTeacherCommitteeWorkspace(admin, organizationId, user.id, committeeId);

    const { data: actorMember } = await admin
      .from("committee_members")
      .select("id")
      .eq("committee_id", committeeId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    const displayName =
      user.user_metadata?.full_name?.trim() ||
      user.email?.split("@")[0] ||
      "Teacher";

    return handleRecordCommitteeActivity(request, ROUTE, committeeId, body, {
      userId: user.id,
      email: user.email,
      name: displayName,
      memberId: actorMember?.id ? String(actorMember.id) : null,
      type: "teacher",
      surface: "teacher_portal",
    });
  } catch (err) {
    if (err instanceof TeacherPortalAuthError) {
      return apiError(ROUTE, {
        request,
        status: err.status,
        error: err.message,
        code: err.code,
        cause: err,
      });
    }

    const resolved = portalRouteErrorStatus(err, "Failed to record activity.");
    return apiError(ROUTE, {
      request,
      status: resolved.status,
      error: resolved.message,
      code: resolved.code,
      cause: err,
    });
  }
}
