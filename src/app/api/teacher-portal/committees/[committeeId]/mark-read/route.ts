import { apiError } from "@/lib/api/route-errors";
import { portalRouteErrorStatus } from "@/lib/api/portal-route-errors";
import {
  handleMarkCommitteeSectionRead,
  type MarkReadBody,
} from "@/lib/committees/api/committee-mark-read-route";
import { getTeacherCommitteeWorkspace } from "@/lib/committees/teacher-committees";
import { TeacherPortalAuthError } from "@/lib/staff/teacher-portal-access";
import { requireTeacherPortalUser } from "@/lib/staff/teacher-portal-access-server";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/teacher-portal/committees/[committeeId]/mark-read";

type RouteContext = { params: Promise<{ committeeId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const supabase = await createClientFromRequest(request);
  const { committeeId } = await context.params;

  let body: MarkReadBody;
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
      error: "Missing required fields.",
      code: "missing_fields",
    });
  }

  try {
    const user = await requireTeacherPortalUser(supabase, organizationId, request);
    const admin = createAdminClient();
    const committee = await getTeacherCommitteeWorkspace(
      admin,
      organizationId,
      user.id,
      committeeId,
    );
    const member = committee.members.find(
      (row) => row.userId === user.id && row.status === "active",
    );

    if (!member) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "Forbidden.",
        code: "forbidden",
      });
    }

    return handleMarkCommitteeSectionRead(
      request,
      ROUTE,
      committeeId,
      body,
      member.id,
    );
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

    const resolved = portalRouteErrorStatus(err, "Failed to mark section read.");
    return apiError(ROUTE, {
      request,
      status: resolved.status,
      error: resolved.message,
      code: resolved.code,
      cause: err,
    });
  }
}
