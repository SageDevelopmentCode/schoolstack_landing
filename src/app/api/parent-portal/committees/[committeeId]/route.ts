import { performance } from "node:perf_hooks";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { portalRouteErrorStatus } from "@/lib/api/portal-route-errors";
import { getParentCommitteeWorkspace } from "@/lib/committees/parent-committees";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { recordApiDuration } from "@/lib/sentry/record-route-metric";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/committees/[committeeId]";

export const GET = withParentPortalRoute<undefined, { committeeId: string }>(
  {
    route: ROUTE,
    feature: "committees",
    forbiddenMessage: "You do not have access to this committee.",
    fallbackErrorMessage: "Failed to load committee.",
  },
  async ({ request, user, organizationId, params }) => {
    const started = performance.now();
    try {
      const admin = createAdminClient();
      const committee = await getParentCommitteeWorkspace(
        admin,
        organizationId,
        user.id,
        params.committeeId,
      );

      recordApiDuration(ROUTE, "GET", 200, performance.now() - started);
      return NextResponse.json({ committee });
    } catch (err) {
      const resolved = portalRouteErrorStatus(err, "Failed to load committee.");
      recordApiDuration(ROUTE, "GET", resolved.status, performance.now() - started);
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
