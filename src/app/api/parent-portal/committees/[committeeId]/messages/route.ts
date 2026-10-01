import { apiError } from "@/lib/api/route-errors";
import { portalRouteErrorStatus } from "@/lib/api/portal-route-errors";
import { userHasEnrolledAccess } from "@/lib/admissions/parent-portal-access";
import { handlePostCommitteeMessage } from "@/lib/committees/api/committee-message-route";
import {
  getParentCommitteeWorkspace,
  resolveParentGuardianForOrg,
} from "@/lib/committees/parent-committees";
import { createClientFromRequest, getUserFromRequest, signedInErrorForRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/committees/[committeeId]/messages";

type RouteContext = { params: Promise<{ committeeId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const supabase = await createClientFromRequest(request);
  const { committeeId } = await context.params;

  const {
    data: { user },
    error: authError,
  } = await getUserFromRequest(supabase, request);

  if (!user) {
    return apiError(ROUTE, {
      request,
      status: 401,
      error: await signedInErrorForRequest(request, authError),
      code: "unauthorized",
    });
  }

  const organizationId =
    request.headers.get("x-organization-id")?.trim() ||
    new URL(request.url).searchParams.get("organizationId")?.trim() ||
    "";

  let resolvedOrganizationId = organizationId;
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
    const hasEnrolledAccess = await userHasEnrolledAccess(
      supabase,
      user.id,
      resolvedOrganizationId,
    );

    if (!hasEnrolledAccess) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have access to this committee.",
        code: "forbidden",
      });
    }

    const admin = createAdminClient();
    const guardian = await resolveParentGuardianForOrg(
      admin,
      user.id,
      resolvedOrganizationId,
      user.email ?? "",
    );

    const committee = await getParentCommitteeWorkspace(
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

    return handlePostCommitteeMessage(request, ROUTE, {
      committeeId,
      organizationId: resolvedOrganizationId,
      actorUserId: user.id,
      actorEmail: guardian.email || user.email,
      actorName: guardian.displayName,
      actorMemberId: currentMember.id,
      senderMemberId: currentMember.id,
      senderName: currentMember.name,
      actorType: "parent",
      surface: "parent_portal",
    });
  } catch (err) {
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
