import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { userHasEnrolledAccess } from "@/lib/admissions/parent-portal-access";
import { getParentCommitteeWorkspace } from "@/lib/committees/parent-committees";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/parent-portal/committees/[committeeId]";

type RouteContext = { params: Promise<{ committeeId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
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
  } = await supabase.auth.getUser();

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
    const message = err instanceof Error ? err.message : "Failed to load committee.";
    const status = message.includes("access") ? 403 : 500;
    return apiError(ROUTE, {
      request,
      status,
      error: message,
      code: status === 403 ? "forbidden" : "internal_error",
      cause: err,
    });
  }
}
