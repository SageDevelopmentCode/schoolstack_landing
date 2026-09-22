import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { portalRouteErrorStatus } from "@/lib/api/portal-route-errors";
import { userHasEnrolledAccess } from "@/lib/admissions/parent-portal-access";
import {
  fetchCommitteeActivityEvents,
  mapCommitteeActivityItems,
} from "@/lib/committees/activity-feed";
import { getParentCommitteeWorkspace } from "@/lib/committees/parent-committees";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/committees/[committeeId]/activity";

type RouteContext = { params: Promise<{ committeeId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const supabase = await createClientFromRequest(request);
  const { committeeId } = await context.params;
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";
  const slug = searchParams.get("slug")?.trim() ?? "";
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Math.min(Math.max(Number(limitParam) || 15, 1), 50) : 15;

  if (!organizationId || !committeeId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError(ROUTE, {
      request,
      status: 401,
      error: "You must be signed in.",
      code: "unauthorized",
    });
  }

  try {
    const hasEnrolledAccess = await userHasEnrolledAccess(
      supabase,
      user.id,
      organizationId,
    );

    if (!hasEnrolledAccess) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have access to this committee.",
        code: "forbidden",
      });
    }

    const admin = createAdminClient();
    await getParentCommitteeWorkspace(admin, organizationId, user.id, committeeId);

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
}
