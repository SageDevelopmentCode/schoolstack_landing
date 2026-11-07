import { apiError } from "@/lib/api/route-errors";
import { portalRouteErrorStatus } from "@/lib/api/portal-route-errors";
import {
  handleRecordCommitteeActivity,
  type RecordCommitteeActivityBody,
} from "@/lib/committees/api/committee-record-activity-route";
import {
  resolveActiveCommitteeMemberForPost,
  resolveParentGuardianForOrg,
} from "@/lib/committees/parent-committees";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/committees/[committeeId]/record-activity";

export const POST = withParentPortalRoute<RecordCommitteeActivityBody, { committeeId: string }>(
  {
    route: ROUTE,
    organizationFrom: "body",
    feature: "committees",
    forbiddenMessage: "You do not have access to this committee.",
    fallbackErrorMessage: "Failed to record activity.",
  },
  async ({ request, user, organizationId, body, params }) => {
    try {
      const admin = createAdminClient();
      const guardian = await resolveParentGuardianForOrg(
        admin,
        user.id,
        organizationId,
        user.email ?? "",
      );

      const currentMember = await resolveActiveCommitteeMemberForPost(
        admin,
        organizationId,
        user.id,
        params.committeeId,
      );

      return await handleRecordCommitteeActivity(request, ROUTE, params.committeeId, body, {
        userId: user.id,
        email: guardian.email || user.email,
        name: guardian.displayName,
        memberId: currentMember.id,
        type: "parent",
        surface: "parent_portal",
      });
    } catch (err) {
      const resolved = portalRouteErrorStatus(err, "Failed to record activity.");
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
