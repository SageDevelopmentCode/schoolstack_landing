import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { signupProgramCoopTeachingScheduleForParent } from "@/lib/admissions/program-coop-teaching-schedule-signup";
import type { TeachingScheduleParentRole } from "@/lib/admissions/program-coop-teaching-schedule-mock";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/teaching-schedule/signup";

function parseRole(value: string | undefined): TeachingScheduleParentRole | null {
  if (value === "instructor" || value === "assistant") return value;
  return null;
}

export async function POST(request: Request) {
  const supabase = await createClientFromRequest(request);

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
    const { week } = await signupProgramCoopTeachingScheduleForParent(supabase, admin, user, {
      organizationId,
      programId,
      weekId,
      role,
    });

    return NextResponse.json({ week });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to sign up for teaching week.";
    const status =
      message.includes("access") || message.includes("not signed up")
        ? 403
        : message.includes("already filled") || message.includes("cannot accept") || message.includes("not found")
          ? 400
          : 500;

    return apiError(ROUTE, {
      request,
      status,
      error: message,
      code: status === 500 ? "internal_error" : "signup_failed",
      cause: err,
    });
  }
}
