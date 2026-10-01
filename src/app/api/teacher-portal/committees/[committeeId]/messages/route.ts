import { apiError } from "@/lib/api/route-errors";
import { portalRouteErrorStatus } from "@/lib/api/portal-route-errors";
import { handlePostCommitteeMessage } from "@/lib/committees/api/committee-message-route";
import { getTeacherCommitteeWorkspace } from "@/lib/committees/teacher-committees";
import { TeacherPortalAuthError } from "@/lib/staff/teacher-portal-access";
import { requireTeacherPortalUser } from "@/lib/staff/teacher-portal-access-server";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/teacher-portal/committees/[committeeId]/messages";

type RouteContext = { params: Promise<{ committeeId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const supabase = await createClientFromRequest(request);
  const { committeeId } = await context.params;

  let resolvedOrganizationId =
    new URL(request.url).searchParams.get("organizationId")?.trim() ?? "";

  if (!resolvedOrganizationId && request.headers.get("content-type")?.includes("multipart/form-data")) {
    const formData = await request.clone().formData();
    resolvedOrganizationId = String(formData.get("organizationId") ?? "").trim();
  }

  if (!resolvedOrganizationId || !committeeId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  try {
    const user = await requireTeacherPortalUser(supabase, resolvedOrganizationId, request);
    const admin = createAdminClient();
    const committee = await getTeacherCommitteeWorkspace(
      admin,
      resolvedOrganizationId,
      user.id,
      committeeId,
    );

    const currentMember = committee.members.find(
      (member) => member.userId === user.id && member.status === "active",
    );

    if (!currentMember) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You are not a member of this committee.",
        code: "forbidden",
      });
    }

    const displayName =
      user.user_metadata?.full_name?.trim() ||
      user.email?.split("@")[0] ||
      "Teacher";

    return handlePostCommitteeMessage(request, ROUTE, {
      committeeId,
      organizationId: resolvedOrganizationId,
      actorUserId: user.id,
      actorEmail: user.email,
      actorName: displayName,
      actorMemberId: currentMember.id,
      senderMemberId: currentMember.id,
      senderName: currentMember.name,
      actorType: "teacher",
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

    const resolved = portalRouteErrorStatus(err, "Failed to send message.");
    return apiError(ROUTE, {
      request,
      status: resolved.status,
      error: resolved.message,
      code: resolved.code,
      cause: err,
    });
  }
}
