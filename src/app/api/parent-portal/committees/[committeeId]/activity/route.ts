import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { portalRouteErrorStatus } from "@/lib/api/portal-route-errors";
import {
  fetchCommitteeActivityEvents,
  mapCommitteeActivityItems,
} from "@/lib/committees/activity-feed";
import { resolveActiveCommitteeMemberForPost } from "@/lib/committees/parent-committees";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/committees/[committeeId]/activity";

export const GET = withParentPortalRoute<undefined, { committeeId: string }>(
  {
    route: ROUTE,
    feature: "committees",
    forbiddenMessage: "You do not have access to this committee.",
    fallbackErrorMessage: "Failed to load committee activity.",
  },
  async ({ request, user, organizationId, params }) => {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug")?.trim() ?? "";
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(Math.max(Number(limitParam) || 15, 1), 50) : 15;
    const { committeeId } = params;

    try {
      const admin = createAdminClient();
      await resolveActiveCommitteeMemberForPost(admin, organizationId, user.id, committeeId);

      const rows = await fetchCommitteeActivityEvents(admin, {
        organizationId,
        committeeId,
        limit,
        audience: "parent",
      });

      const items = mapCommitteeActivityItems(rows, {
        slug,
        committeeId,
        linkSurface: "parent",
        includeHref: Boolean(slug),
      });

      return NextResponse.json({ items });
    } catch (err) {
      const resolved = portalRouteErrorStatus(err, "Failed to load committee activity.");
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
