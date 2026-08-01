import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { userHasEnrolledAccess } from "@/lib/admissions/parent-portal-access";
import { withdrawCommitteeJoinRequest } from "@/lib/committees/join-requests";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/parent-portal/committees/join-requests/[id]";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id: requestId } = await context.params;
  const organizationId = new URL(request.url).searchParams.get("organizationId")?.trim() ?? "";
  const committeeName = new URL(request.url).searchParams.get("committeeName")?.trim() ?? "Committee";
  const guardianName = new URL(request.url).searchParams.get("guardianName")?.trim() ?? "Parent";

  if (!organizationId || !requestId) {
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
        error: "You do not have access to modify requests for this school.",
        code: "forbidden",
      });
    }

    const admin = createAdminClient();
    const joinRequest = await withdrawCommitteeJoinRequest(admin, {
      requestId,
      userId: user.id,
      organizationId,
      committeeName,
      guardianName,
    });

    return NextResponse.json({ request: joinRequest });
  } catch (err) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: err instanceof Error ? err.message : "Failed to withdraw request.",
      code: "internal_error",
      cause: err,
    });
  }
}
