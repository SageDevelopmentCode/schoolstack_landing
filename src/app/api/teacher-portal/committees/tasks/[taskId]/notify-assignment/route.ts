import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { portalRouteErrorStatus } from "@/lib/api/portal-route-errors";
import { notifyCommitteeTaskAssignment } from "@/lib/committees/notify-committee-task-assignment";
import {
  getTeacherCommitteeWorkspace,
  resolveTeacherStaffForOrg,
} from "@/lib/committees/teacher-committees";
import {
  getStaffUserProfile,
  requireTeacherPortalUser,
  TeacherPortalAuthError,
} from "@/lib/staff/teacher-portal-access";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/teacher-portal/committees/tasks/[taskId]/notify-assignment";

type RouteContext = { params: Promise<{ taskId: string }> };

type NotifyAssignmentBody = {
  organizationId?: string;
  previousAssigneeMemberId?: string | null;
};

export async function POST(request: Request, context: RouteContext) {
  const supabase = await createClientFromRequest(request);
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
    const user = await requireTeacherPortalUser(supabase, organizationId);
    const profile = await getStaffUserProfile(supabase, user.id, organizationId, user);
    const admin = createAdminClient();
    const staff = await resolveTeacherStaffForOrg(
      admin,
      user.id,
      organizationId,
      profile.email || user.email || "",
    );

    const { data: taskRow, error: taskError } = await admin
      .from("committee_tasks")
      .select("committee_id")
      .eq("id", taskId)
      .maybeSingle();

    if (taskError) throw new Error(taskError.message);
    if (!taskRow?.committee_id) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Task not found.",
        code: "not_found",
      });
    }

    await getTeacherCommitteeWorkspace(
      admin,
      organizationId,
      user.id,
      String(taskRow.committee_id),
    );

    const { data: actorMember, error: memberError } = await admin
      .from("committee_members")
      .select("id")
      .eq("committee_id", taskRow.committee_id)
      .eq("organization_id", organizationId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (memberError) throw new Error(memberError.message);

    const result = await notifyCommitteeTaskAssignment(admin, {
      organizationId,
      taskId,
      previousAssigneeMemberId: body.previousAssigneeMemberId ?? null,
      actorUserId: user.id,
      actorEmail: staff.email || user.email,
      actorName: staff.displayName,
      actorMemberId: actorMember?.id ? String(actorMember.id) : null,
      actorType: "teacher",
      surface: "teacher_portal",
    });

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof TeacherPortalAuthError) {
      return apiError(ROUTE, {
        request,
        status: err.status,
        error: err.message,
        code: err.code,
        cause: err,
      });
    }

    const resolved = portalRouteErrorStatus(
      err,
      "Failed to notify task assignee.",
    );
    return apiError(ROUTE, {
      request,
      status: resolved.status,
      error: resolved.message,
      code: resolved.code,
      cause: err,
    });
  }
}
