import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { portalRouteErrorStatus } from "@/lib/api/portal-route-errors";
import { notifyCommitteeTaskAssignment } from "@/lib/committees/notify-committee-task-assignment";
import {
  getParentCommitteeWorkspace,
  resolveParentGuardianForOrg,
} from "@/lib/committees/parent-committees";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/committees/tasks/[taskId]/notify-assignment";

type NotifyAssignmentBody = {
  organizationId?: string;
  previousAssigneeMemberId?: string | null;
};

export const POST = withParentPortalRoute<NotifyAssignmentBody, { taskId: string }>(
  {
    route: ROUTE,
    organizationFrom: "body",
    feature: "committees",
    forbiddenMessage: "You do not have access to this committee.",
    missingOrganizationMessage: "Missing required fields.",
    fallbackErrorMessage: "Failed to notify task assignee.",
  },
  async ({ request, user, organizationId, body, params }) => {
    const { taskId } = params;

    try {
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
      const resolved = portalRouteErrorStatus(err, "Failed to notify task assignee.");
      return apiError(ROUTE, {
        request,
        status: resolved.status,
        error: resolved.message,
        code: resolved.code,
        cause: err,
      });
    }
  },
);
