import { apiError } from "@/lib/api/route-errors";
import { portalRouteErrorStatus } from "@/lib/api/portal-route-errors";
import {
  handleMarkCommitteeSectionRead,
  type MarkReadBody,
} from "@/lib/committees/api/committee-mark-read-route";
import { resolveActiveCommitteeMemberForPost } from "@/lib/committees/parent-committees";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/committees/[committeeId]/mark-read";

export const POST = withParentPortalRoute<MarkReadBody, { committeeId: string }>(
  {
    route: ROUTE,
    organizationFrom: "body",
    forbiddenMessage: "Forbidden.",
    fallbackErrorMessage: "Failed to mark section read.",
  },
  async ({ request, user, organizationId, body, params }) => {
    try {
      const admin = createAdminClient();
      const currentMember = await resolveActiveCommitteeMemberForPost(
        admin,
        organizationId,
        user.id,
        params.committeeId,
      );

      return await handleMarkCommitteeSectionRead(
        request,
        ROUTE,
        params.committeeId,
        body,
        currentMember.id,
      );
    } catch (err) {
      const resolved = portalRouteErrorStatus(err, "Failed to mark section read.");
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
