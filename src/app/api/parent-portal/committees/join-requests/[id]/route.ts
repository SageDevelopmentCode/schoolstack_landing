import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { withdrawCommitteeJoinRequest } from "@/lib/committees/join-requests";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/committees/join-requests/[id]";

export const DELETE = withParentPortalRoute<undefined, { id: string }>(
  {
    route: ROUTE,
    feature: "committees",
    forbiddenMessage: "You do not have access to modify requests for this school.",
    fallbackErrorMessage: "Failed to withdraw request.",
  },
  async ({ request, user, organizationId, params }) => {
    const searchParams = new URL(request.url).searchParams;
    const committeeName = searchParams.get("committeeName")?.trim() ?? "Committee";
    const guardianName = searchParams.get("guardianName")?.trim() ?? "Parent";

    try {
      const admin = createAdminClient();
      const joinRequest = await withdrawCommitteeJoinRequest(admin, {
        requestId: params.id,
        userId: user.id,
        organizationId,
        committeeName,
        requesterName: guardianName,
      });

      return NextResponse.json({ request: joinRequest });
    } catch (err) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to withdraw request.",
        cause: err,
        code: "internal_error",
      });
    }
  },
);
