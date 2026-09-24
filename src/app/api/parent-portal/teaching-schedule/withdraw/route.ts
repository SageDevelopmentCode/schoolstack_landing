import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { portalRouteErrorStatus } from "@/lib/api/portal-route-errors";
import { withdrawProgramCoopTeachingScheduleForParent } from "@/lib/admissions/program-coop-teaching-schedule-signup";
import type { TeachingScheduleParentRole } from "@/lib/admissions/program-coop-teaching-schedule-mock";
import { createClientFromRequest, getUserFromRequest, signedInErrorForRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/teaching-schedule/withdraw";

function parseRole(value: string | undefined): TeachingScheduleParentRole | null {
  if (value === "instructor" || value === "assistant") return value;
  return null;
}

export async function POST(request: Request) {
  const supabase = await createClientFromRequest(request);

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

  try {
    const body = (await request.json()) as {
      organizationId?: string;
      programId?: string;
      weekId?: string;
      role?: string;
    };

    const organizationId = body.organizationId?.trim() ?? "";
    const programId = body.programId?.trim() ?? "";
    const weekId = body.weekId?.trim() ?? "";
    const role = parseRole(body.role?.trim());

    if (!organizationId || !programId || !weekId || !role) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "organizationId, programId, weekId, and role are required.",
        code: "missing_fields",
      });
    }

    const admin = createAdminClient();
    const { week } = await withdrawProgramCoopTeachingScheduleForParent(supabase, admin, user, {
      organizationId,
      programId,
      weekId,
      role,
    });

    return NextResponse.json({ week });
  } catch (err) {
    const resolved = portalRouteErrorStatus(err, "Failed to withdraw from teaching week.");
    return apiError(ROUTE, {
      request,
      status: resolved.status,
      error: resolved.message,
      code: resolved.status === 500 ? "internal_error" : "withdraw_failed",
      cause: err,
    });
  }
}
