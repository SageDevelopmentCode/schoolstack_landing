import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { portalRouteErrorStatus } from "@/lib/api/portal-route-errors";
import { userHasEnrolledAccess } from "@/lib/admissions/parent-portal-access";
import { notifyCommitteeTaskAssignment } from "@/lib/committees/notify-committee-task-assignment";
import {
  getParentCommitteeWorkspace,
  resolveParentGuardianForOrg,
} from "@/lib/committees/parent-committees";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/committees/tasks/[taskId]/notify-assignment";

type RouteContext = { params: Promise<{ taskId: string }> };

type NotifyAssignmentBody = {
  organizationId?: string;
  previousAssigneeMemberId?: string | null;
};

export async function POST(request: Request, context: RouteContext) {
  const supabase = await createClientFromRequest(request);
  const { taskId } = await context.params;

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
    const guardian = await resolveParentGuardianForOrg(
      admin,
      user.id,
      organizationId,
      user.email ?? "",
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

    await getParentCommitteeWorkspace(
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
      actorEmail: guardian.email || user.email,
      actorName: guardian.displayName,
      actorMemberId: actorMember?.id ? String(actorMember.id) : null,
      actorType: "parent",
      surface: "parent_portal",
    });

    return NextResponse.json(result);
  } catch (err) {
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
