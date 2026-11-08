import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { listParentCommitteeMemberships } from "@/lib/committees/parent-committees";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/committees/mine";

export const GET = withParentPortalRoute(
  {
    route: ROUTE,
    feature: "committees",
    forbiddenMessage: "You do not have access to committees for this school.",
    fallbackErrorMessage: "Failed to load your committees.",
  },
  async ({ request, user, organizationId }) => {
    try {
      const admin = createAdminClient();
      const committees = await listParentCommitteeMemberships(admin, organizationId, user.id);

      return NextResponse.json({ committees });
    } catch (err) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to load your committees.",
        code: "internal_error",
        cause: err,
      });
    }
  },
);
