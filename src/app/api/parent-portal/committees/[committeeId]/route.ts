import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { portalRouteErrorStatus } from "@/lib/api/portal-route-errors";
import { userHasEnrolledAccess } from "@/lib/admissions/parent-portal-access";
import { getParentCommitteeWorkspace } from "@/lib/committees/parent-committees";
import { createClientFromRequest, getUserFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/committees/[committeeId]";

type RouteContext = { params: Promise<{ committeeId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const supabase = await createClientFromRequest(request);
  const { committeeId } = await context.params;
  const organizationId = new URL(request.url).searchParams.get("organizationId")?.trim() ?? "";

  if (!organizationId || !committeeId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  const {
    data: { user },
  } = await getUserFromRequest(supabase, request);

  if (!user) {
    return apiError(ROUTE, {
      request,
      status: 401,
      error: "You must be signed in.",
      code: "unauthorized",
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
        error: "You do not have access to this committee.",
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

    return NextResponse.json({ committee });
  } catch (err) {
    const resolved = portalRouteErrorStatus(err, "Failed to load committee.");
    return apiError(ROUTE, {
      request,
      status: resolved.status,
      error: resolved.message,
      code: resolved.code,
      cause: err,
    });
  }
}
