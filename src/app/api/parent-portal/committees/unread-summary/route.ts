import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { portalRouteErrorStatus } from "@/lib/api/portal-route-errors";
import { userHasEnrolledAccess } from "@/lib/admissions/parent-portal-access";
import { getCommitteeUnreadSummaryForUser } from "@/lib/committees/committee-unread";
import { createClientFromRequest, getUserFromRequest, signedInErrorForRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/committees/unread-summary";

export async function GET(request: Request) {
  const supabase = await createClientFromRequest(request);
  const organizationId = new URL(request.url).searchParams.get("organizationId")?.trim() ?? "";

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
    const summary = await getCommitteeUnreadSummaryForUser(
      admin,
      organizationId,
      user.id,
    );

    return NextResponse.json(summary);
  } catch (err) {
    const resolved = portalRouteErrorStatus(err, "Failed to load committee unread summary.");
    return apiError(ROUTE, {
      request,
      status: resolved.status,
      error: resolved.message,
      code: resolved.code,
      cause: err,
    });
  }
}
