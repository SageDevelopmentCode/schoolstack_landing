import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { userHasEnrolledAccess } from "@/lib/admissions/parent-portal-access";
import { listBrowsableCommitteesForParent } from "@/lib/committees/parent-committees";
import { createClientFromRequest, getUserFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/committees/browse";

export async function GET(request: Request) {
  const supabase = await createClientFromRequest(request);
  const organizationId = new URL(request.url).searchParams.get("organizationId")?.trim() ?? "";

  if (!organizationId) {
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
        error: "You do not have access to committees for this school.",
        code: "forbidden",
      });
    }

    const admin = createAdminClient();
    const committees = await listBrowsableCommitteesForParent(
      admin,
      organizationId,
      user.id,
    );

    return NextResponse.json({ committees });
  } catch (err) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to load committees.",
      code: "internal_error",
      cause: err,
    });
  }
}
