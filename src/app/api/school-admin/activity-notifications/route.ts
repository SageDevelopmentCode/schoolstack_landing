import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { fetchSchoolAdminActivityNotifications } from "@/lib/school-admin/activity-notifications";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/school-admin/activity-notifications";
const DEFAULT_LIMIT = 15;
const MAX_LIMIT = 30;

function parseLimit(value: string | null): number {
  if (!value) return DEFAULT_LIMIT;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
}

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";
  const cursor = searchParams.get("cursor")?.trim() || null;
  const limit = parseLimit(searchParams.get("limit"));

  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  try {
    await requireSchoolAdminUser(supabase, organizationId);

    const { data: organization, error: organizationError } = await supabase
      .from("organizations")
      .select("id, slug")
      .eq("id", organizationId)
      .maybeSingle();

    if (organizationError) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: organizationError.message,
        cause: organizationError,
      });
    }

    if (!organization?.slug) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Organization not found.",
        code: "organization_not_found",
      });
    }

    const admin = createAdminClient();
    const page = await fetchSchoolAdminActivityNotifications(
      admin,
      organizationId,
      String(organization.slug),
      { cursor, limit },
    );

    return NextResponse.json(page);
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
      error: "Failed to load activity notifications.",
      code: "internal_error",
      cause: err,
    });
  }
}
