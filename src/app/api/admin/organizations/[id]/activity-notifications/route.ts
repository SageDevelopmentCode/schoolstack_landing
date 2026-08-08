import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import { fetchSchoolAdminActivityNotifications } from "@/lib/school-admin/activity-notifications";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admin/organizations/[id]/activity-notifications";
const DEFAULT_LIMIT = 15;
const MAX_LIMIT = 30;

type RouteContext = {
  params: Promise<{ id: string }>;
};

function parseLimit(value: string | null): number {
  if (!value) return DEFAULT_LIMIT;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
}

export async function GET(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id: organizationId } = await context.params;

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor")?.trim() || null;
  const limit = parseLimit(searchParams.get("limit"));

  try {
    await requirePlatformAdminUser(supabase);

    const admin = createAdminClient();
    const { data: organization, error: organizationError } = await admin
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

    const page = await fetchSchoolAdminActivityNotifications(
      admin,
      organizationId,
      String(organization.slug),
      { cursor, limit },
    );

    return NextResponse.json(page);
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError(ROUTE, {
        request,
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to load activity notifications.",
      code: "internal_error",
      cause: error,
    });
  }
}
