import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { notifyCommitteeTaskAssignment } from "@/lib/committees/notify-committee-task-assignment";
import {
  getSchoolAdminUserProfile,
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/school-admin/committees/tasks/[taskId]/notify-assignment";

type RouteContext = { params: Promise<{ taskId: string }> };

type NotifyAssignmentBody = {
  organizationId?: string;
  previousAssigneeMemberId?: string | null;
};

export async function POST(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { taskId } = await context.params;

  let body: NotifyAssignmentBody;
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
  if (!organizationId || !taskId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Missing required fields.",
      code: "missing_fields",
    });
  }

  try {
    const user = await requireSchoolAdminUser(supabase, organizationId, request);
    const profile = getSchoolAdminUserProfile(user);
    const admin = createAdminClient();

    const result = await notifyCommitteeTaskAssignment(admin, {
      organizationId,
      taskId,
      previousAssigneeMemberId: body.previousAssigneeMemberId ?? null,
      actorUserId: user.id,
      actorEmail: profile.email,
      actorName: profile.displayName,
      actorMemberId: null,
      actorType: "school_admin",
      surface: "school_admin",
    });

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof SchoolAdminAuthError) {
      return apiError(ROUTE, {
        request,
        status: err.status,
        error: err.message,
        code: err.code,
        cause: err,
      });
    }

    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to notify task assignee.",
      cause: err,
      code: "internal_error",
    });
  }
}
