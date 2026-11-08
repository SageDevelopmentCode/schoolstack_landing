import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { portalRouteErrorStatus } from "@/lib/api/portal-route-errors";
import { getCommitteeUnreadSummaryForUser } from "@/lib/committees/committee-unread";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/committees/unread-summary";

export const GET = withParentPortalRoute(
  {
    route: ROUTE,
    forbiddenMessage: "Forbidden.",
    fallbackErrorMessage: "Failed to load committee unread summary.",
  },
  async ({ request, user, organizationId }) => {
    try {
      const admin = createAdminClient();
      const summary = await getCommitteeUnreadSummaryForUser(admin, organizationId, user.id);

      return NextResponse.json(summary);
    } catch (err) {
      const resolved = portalRouteErrorStatus(err, "Failed to load committee unread summary.");
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
