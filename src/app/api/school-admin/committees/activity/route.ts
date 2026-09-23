import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  fetchCommitteeActivityEvents,
  mapCommitteeActivityItems,
} from "@/lib/committees/activity-feed";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/school-admin/committees/activity";

export async function GET(request: Request) {
  const supabase = await createClientFromRequest(request);
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";
  const committeeId = searchParams.get("committeeId")?.trim() || undefined;
  const slug = searchParams.get("slug")?.trim() ?? "";
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Math.min(Math.max(Number(limitParam) || 30, 1), 100) : 30;

  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  try {
    await requireSchoolAdminUser(supabase, organizationId, request);
    const admin = createAdminClient();
    const rows = await fetchCommitteeActivityEvents(admin, {
      organizationId,
      committeeId,
      limit,
    });

    const items = mapCommitteeActivityItems(rows, {
      slug,
      committeeId,
      linkSurface: "admin",
      includeHref: Boolean(slug),
    });

    return NextResponse.json({ items });
  } catch (err) {
    if (err instanceof SchoolAdminAuthError) {
      return apiError(ROUTE, {
        request,
        status: err.status,
        error: err.message,
        code: err.code,
        cause: err,
      });
    }

    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to load committee activity.",
      code: "internal_error",
      cause: err,
    });
  }
}
