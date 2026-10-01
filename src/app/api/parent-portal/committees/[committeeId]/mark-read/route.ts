import { apiError } from "@/lib/api/route-errors";
import { portalRouteErrorStatus } from "@/lib/api/portal-route-errors";
import { userHasEnrolledAccess } from "@/lib/admissions/parent-portal-access";
import {
  handleMarkCommitteeSectionRead,
  type MarkReadBody,
} from "@/lib/committees/api/committee-mark-read-route";
import { getParentCommitteeWorkspace } from "@/lib/committees/parent-committees";
import { createClientFromRequest, getUserFromRequest, signedInErrorForRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/committees/[committeeId]/mark-read";

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
  if (!organizationId) {
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
      organizationId,
    );

    if (!hasEnrolledAccess) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "Forbidden.",
        code: "forbidden",
      });
    }

    const admin = createAdminClient();
    const committee = await getParentCommitteeWorkspace(
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
