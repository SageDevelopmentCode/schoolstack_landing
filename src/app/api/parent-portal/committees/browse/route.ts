import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { listBrowsableCommitteesForParent } from "@/lib/committees/parent-committees";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/committees/browse";

export const GET = withParentPortalRoute(
  {
    route: ROUTE,
    feature: "committees",
    forbiddenMessage: "You do not have access to committees for this school.",
    fallbackErrorMessage: "Failed to load committees.",
  },
  async ({ request, user, organizationId }) => {
    try {
      const admin = createAdminClient();
      const committees = await listBrowsableCommitteesForParent(admin, organizationId, user.id);

      return NextResponse.json({ committees });
    } catch (err) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to load committees.",
        code: "internal_error",
        cause: err,
      });
    }
  },
);
