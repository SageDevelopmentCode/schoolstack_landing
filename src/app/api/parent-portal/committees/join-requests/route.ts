import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { portalRouteErrorStatus } from "@/lib/api/portal-route-errors";
import { createCommitteeJoinRequest } from "@/lib/committees/join-requests";
import { resolveParentGuardianForOrg } from "@/lib/committees/parent-committees";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/committees/join-requests";

type JoinRequestBody = {
  organizationId?: string;
  committeeId?: string;
  preferredDutyRoleId?: string | null;
  grade?: string | null;
  note?: string | null;
};

export const POST = withParentPortalRoute<JoinRequestBody>(
  {
    route: ROUTE,
    organizationFrom: "body",
    feature: "committees",
    forbiddenMessage: "You do not have access to request committees for this school.",
    missingOrganizationMessage: "Missing required fields.",
    fallbackErrorMessage: "Failed to submit request.",
  },
  async ({ request, user, organizationId, body }) => {
    const committeeId = body.committeeId?.trim() ?? "";
    if (!committeeId) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Missing required fields.",
        code: "missing_fields",
      });
    }

    try {
      const admin = createAdminClient();
      const guardian = await resolveParentGuardianForOrg(
        admin,
        user.id,
        organizationId,
        user.email ?? "",
      );

      const joinRequest = await createCommitteeJoinRequest(admin, {
        organizationId,
        committeeId,
        userId: user.id,
        requesterType: "parent",
        guardianId: guardian.id,
        guardianName: guardian.displayName,
        guardianEmail: guardian.email,
        preferredDutyRoleId: body.preferredDutyRoleId ?? null,
        grade: body.grade ?? null,
        note: body.note ?? null,
      });

      return NextResponse.json({ request: joinRequest });
    } catch (err) {
      const resolved = portalRouteErrorStatus(err, "Failed to submit request.");
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
